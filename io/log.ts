/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'fs';
import * as path from 'path';

import {getConfig} from './config';

/**
 * Overrides for console methods.
 */
export interface ConsoleOverrides {
  log?(text: string): void;
  error?(text: string): void;
  warn?(text: string): void;
  debug?(text: string): void;
}

class Log {
  /**
   * When true, console messages may have styling (red, bold, etc).
   *
   * The following styles will also be applied by default:
   * - console.error will use red color
   * - console.debug will use dimmed color
   * - timestamps will use dimmed style
   *
   * When false, log.format function is a noop.
   */
  colors = false;

  limit = 2000;

  /**
   * When true, the logger will prepend all messages with a timestamp.
   */
  time = false;

  /**
   * Set to true when --verbose CLI argument is passed. In this case components
   * are expected to print extra debugging info using console.debug.
   *
   * When false, console.debug calls are muted.
   */
  verbose = false;

  /**
   * When set, the logger will output all verbose messages to the given text
   * file. This work even when verbose is false.
   */
  verboseOutputFile?: string;

  /**
   * Path to output directory for logs and screenshots.
   */
  outputDir?: string;

  /**
   * Applies ANSI style format to the given string. Noop if log.colors was set
   * to false.
   */
  format(text: string, ...styles: Array<Style | undefined>) {
    if (log.colors) {
      for (const style of styles) {
        if (style) {
          const code = CODES[style];
          text = `\u001b[${code[0]}m${text}\u001b[${code[1]}m`;
        }
      }
    }
    return text;
  }

  /**
   * Indents every line of the provided string with the given indent value.
   */
  indent(text: string, indent: string) {
    return indent.concat(text.replace(/\n/g, '\n' + indent));
  }

  /**
   * Breaks the given string into lines of at most 78 characters.
   */
  wrap(text: string): string[] {
    return (
      text
        // Break long words at exactly 78 characters
        .replace(/([^\s]{78})/g, '$1\n')
        // Break long lines honoring whitespace
        .replace(/([^\n]{1,78})(\s|$)/g, '$1\n')
        .trim()
        .split('\n')
    );
  }

  now() {
    const now = new Date();
    const hh = pad(now.getHours(), 2);
    const mm = pad(now.getMinutes(), 2);
    const ss = pad(now.getSeconds(), 2);
    const ms = pad(now.getMilliseconds(), 3);
    return `${hh}:${mm}:${ss}.${ms}`;
  }

  enable(overrides?: ConsoleOverrides) {
    if (log.verboseOutputFile) {
      const dir = path.dirname(log.verboseOutputFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
      }
      fs.writeFileSync(log.verboseOutputFile, '');
    }
    listenConsole('log', undefined, overrides);
    listenConsole('error', 'red', overrides);
    listenConsole('warn', 'yellow', overrides);
    listenConsole('debug', 'dim', overrides);
  }

  disable() {
    resetConsole('log');
    resetConsole('error');
    resetConsole('warn');
    resetConsole('debug');
  }
}

const CODES: {[key: string]: [number, number]} = {
  'bold': [1, 22],
  'dim': [2, 22],
  'red': [31, 39],
  'green': [32, 39],
  'yellow': [33, 39],
  'magenta': [35, 39],
};

type Style = keyof typeof CODES;

/**
 * Console log config and helper functions.
 */
export const log = new Log();

function pad(x: number, maxLength: number) {
  return x.toString().padStart(maxLength, '0');
}

/**
 * One of the console log methods that the logger supports.
 */
export type ConsoleMethod = 'log' | 'error' | 'warn' | 'debug';

const originals: Partial<Console> = {};

function listenConsole(
  method: ConsoleMethod,
  style?: Style,
  overrides?: ConsoleOverrides,
) {
  // tslint:disable-next-line:no-dict-access-on-struct-type
  const original = console[method];

  originals[method] = original;

  // tslint:disable-next-line:no-dict-access-on-struct-type
  console[method] = function (...args: unknown[]) {
    if (method === 'debug' && !log.verbose && !log.verboseOutputFile) {
      return;
    }
    const parts = new Array<unknown>(args.length);
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (typeof arg === 'string') {
        let s = applyRegex(arg as string);
        if (s === undefined) return;
        if (s.length > log.limit) {
          s = s.substring(0, log.limit) + '... (truncated)';
        }
        s = log.format(s, style);
        parts[i] = s;
      } else if (arg instanceof Error) {
        const s = arg.stack || arg.toString();
        const br = s.indexOf('\n');
        let message = br >= 0 ? s.substring(0, br) : s;
        message = log.format(message, style);
        if (log.verbose && br >= 0) {
          let stack = s.substring(br + 1);
          stack = log.format(stack, style, 'dim');
          message += '\n' + stack;
        }
        parts[i] = message;
      } else {
        parts[i] = arg;
      }
    }

    if (log.time) {
      const time = log.format(log.now(), 'dim');
      parts.unshift(time);
    }

    if (method !== 'debug' || log.verbose) {
      // tslint:disable-next-line:no-dict-access-on-struct-type
      const func = overrides?.[method] ?? original;
      func.apply(this, parts);
    }
    if (log.verboseOutputFile) {
      // strip color markers when writing to text file
      if (log.colors) {
        for (let i = 0; i < parts.length; i++) {
          parts[i] = String(parts[i]).replace(/\u001b\[[0-9;]*m/g, '');
        }
      }
      fs.appendFileSync(log.verboseOutputFile, parts.join(' ') + '\n');
    }
  };
}

function resetConsole(method: ConsoleMethod) {
  const original = originals[method];
  if (original) {
    // tslint:disable-next-line:no-dict-access-on-struct-type
    console[method] = original;
  }
}

function applyRegex(text: string) {
  const regexs = getConfig()?.devConfig?.logRegexFilters ?? [];
  for (const regex of regexs) {
    const match = text.match(regex.find);
    if (match) {
      if (!regex.replace) {
        return undefined;
      }
      text = text.replace(match[0], regex.replace);
      if (text.length === 0) {
        return undefined;
      }
    }
  }
  return text;
}
