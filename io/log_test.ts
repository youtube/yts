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

import 'jasmine';

import {updateOverrideConfigValues} from './config';
import {ConsoleMethod, log} from './log';

describe('log', () => {
  beforeAll(() => {
    listenConsole('log');
    listenConsole('error');
    listenConsole('warn');
    listenConsole('debug');
    log.enable();
  });

  afterAll(() => {
    log.disable();
    resetConsole('log');
    resetConsole('error');
    resetConsole('warn');
    resetConsole('debug');
  });

  const originals: Partial<Console> = {};

  let messages: Array<{
    method: ConsoleMethod;
    data: unknown[];
  }> = [];

  function listenConsole(method: ConsoleMethod) {
    // tslint:disable-next-line:no-dict-access-on-struct-type
    originals[method] = console[method];

    // tslint:disable-next-line:no-dict-access-on-struct-type
    console[method] = (...args: unknown[]) => {
      messages.push({
        method,
        data: args,
      });
    };
  }

  function resetConsole(method: ConsoleMethod) {
    const original = originals[method];
    if (original) {
      // tslint:disable-next-line:no-dict-access-on-struct-type
      console[method] = original;
    }
  }

  afterEach(() => {
    messages = [];
    log.colors = false;
    log.time = false;
    log.verbose = false;
  });

  it('colors', () => {
    log.colors = true;
    log.verbose = true;
    console.log('log1');
    console.error('error1');
    console.debug('debug1');
    expect(messages.length).toBe(3);
    expect(messages[0].method).toBe('log');
    expect(messages[0].data[0]).toEqual('log1');
    expect(messages[1].method).toBe('error');
    expect(messages[1].data).toEqual(['\u001b[31merror1\u001b[39m']);
    expect(messages[2].method).toBe('debug');
    expect(messages[2].data).toEqual(['\u001b[2mdebug1\u001b[22m']);
  });

  function checkTimestamp(s: string) {
    const regex = /\d\d\:\d\d\:\d\d\.\d\d\d/;
    if (!regex.test(s)) {
      fail(`${s} didn't match ${regex}`);
    }
  }

  it('time', () => {
    log.time = true;
    console.log('log1');
    console.error('error1');
    expect(messages.length).toBe(2);
    expect(messages[0].method).toBe('log');
    checkTimestamp(messages[0].data[0] as string);
    expect(messages[0].data[1]).toEqual('log1');
    expect(messages[1].method).toBe('error');
    checkTimestamp(messages[1].data[0] as string);
    expect(messages[1].data[1]).toEqual('error1');
  });

  it('verbose', () => {
    console.debug('debug1');
    log.verbose = true;
    console.debug('debug2');
    log.verbose = false;
    console.debug('debug3');
    expect(messages.length).toBe(1);
    expect(messages[0].method).toBe('debug');
    expect(messages[0].data).toEqual(['debug2']);
  });

  it('error without colors', () => {
    const e = new Error('my error');
    console.error(e);
    expect(messages.length).toBe(1);
    expect(messages[0].method).toBe('error');
    expect(messages[0].data[0]).toBe('Error: my error');
  });

  it('error with colors and stack', () => {
    log.colors = true;
    log.verbose = true;
    const e = new Error('my error');
    console.error(e);
    expect(messages.length).toBe(1);
    expect(messages[0].method).toBe('error');
    const stack = messages[0].data[0] as string;
    const lines = stack.split('\n');
    expect(lines[0]).toBe('\u001b[31mError: my error\u001b[39m');
    expect(lines[1].substring(0, 9).split('')).toEqual(
      '\u001b[2m\u001b[31m'.split(''),
    );
    for (let i = 1; i < lines.length; i++) {
      expect(lines[i]).toContain(' at ');
    }
  });

  describe('regex filter', () => {
    it('handles empty log messages', () => {
      console.log('');
      expect(messages.length).toBe(1);
      expect(messages[0].data[0]).toBe('');
    });

    it('handles undefined messages', () => {
      console.log(undefined);
      expect(messages.length).toBe(1);
      expect(messages[0].data[0]).toBe(undefined);
    });

    it('replaces log messages', () => {
      updateOverrideConfigValues({
        devConfig: {
          logRegexFilters: [{find: 'this.+?message', replace: 'replaced'}],
        },
      });
      console.log('this is a message');
      expect(messages.length).toBe(1);
      expect(messages[0].data[0]).toBe('replaced');
    });

    it('deletes log messages', () => {
      updateOverrideConfigValues({
        devConfig: {
          logRegexFilters: [{find: 'this.+?message'}],
        },
      });
      console.log('this is a message');
      expect(messages.length).toBe(0);
    });

    afterAll(() => {
      updateOverrideConfigValues({devConfig: {logRegexFilters: []}});
    });
  });
});
