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

/**
 * @fileoverview Wrapper around child_process for shell and ADB execution.
 */

import {execFileSync, execSync} from 'child_process';

/** Options for executing shell commands. */
export interface ShellOptions {
  /** Maximum buffer size in bytes for stdout/stderr. */
  maxBuffer?: number;
  /** Timeout in milliseconds before terminating the process. */
  timeout?: number;
  /** Whether to suppress child process stderr output and error logging. */
  silent?: boolean;
}

/** Type alias for either a numeric timeout in ms or full ShellOptions. */
export type ShellOptionsOrTimeout = number | ShellOptions;

/** Default timeout for shell and ADB commands (10 seconds). */
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BUFFER_BYTES = 200 * 1024 * 1024;

/**
 * A class defining a shell, meant as a wrapper around child_process/execSync.
 */
class Shell {
  adbPath: string | undefined;

  /**
   * Checks if ADB is available.
   */
  adbExists(): boolean {
    if (!this.adbPath) {
      return false;
    }
    try {
      execFileSync(this.adbPath, ['--version'], {
        stdio: 'ignore',
        timeout: 5000,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Runs an ADB command and returns the result as a string.
   * @param adbArgs The ADB command arguments to run.
   * @param options Optional timeout in milliseconds or ShellOptions.
   * @return The result of the command.
   */
  runAdbCommand(
    adbArgs: string[],
    options?: ShellOptionsOrTimeout,
  ): string {
    return this.runAdbCommandBin(adbArgs, options).toString();
  }

  /**
   * Runs an ADB command and returns the result as a buffer.
   * @param adbArgs The ADB command arguments to run.
   * @param options Optional timeout in milliseconds or ShellOptions.
   * @return The result of the command.
   */
  runAdbCommandBin(
    adbArgs: string[],
    options?: ShellOptionsOrTimeout,
  ): Buffer {
    const {maxBuffer, timeout, silent} = parseOptions(options);
    const adbPath = this.adbPath ?? 'adb';
    console.debug(`${adbPath} ${adbArgs.join(' ')}`);
    try {
      const result = execFileSync(adbPath, adbArgs, {
        maxBuffer,
        timeout,
        ...(silent ? {stdio: ['pipe', 'pipe', 'ignore']} : {}),
      });
      console.debug(`Result size: ${result.length}`);
      return result;
    } catch (e: unknown) {
      if (!silent) {
        console.error(e);
      }
      throw e;
    }
  }

  /**
   * Runs a shell command and returns the result as a string.
   * @param command The command to run.
   * @param options Optional timeout in milliseconds or ShellOptions.
   * @return The result of the command.
   */
  execSync(command: string, options?: ShellOptionsOrTimeout): string {
    return this.execSyncBin(command, options).toString();
  }

  /**
   * Runs a shell command and returns the result as a buffer.
   * @param command The command to run.
   * @param options Optional timeout in milliseconds or ShellOptions.
   * @return The result of the command.
   */
  execSyncBin(
    command: string,
    options?: ShellOptionsOrTimeout,
  ): Buffer {
    const {maxBuffer, timeout, silent} = parseOptions(options);
    console.debug(command);
    try {
      const result = execSync(command, {
        maxBuffer,
        timeout,
        ...(silent ? {stdio: ['pipe', 'pipe', 'ignore']} : {}),
      });
      console.debug(`Result size: ${result.length}`);
      return result;
    } catch (e: unknown) {
      if (!silent) {
        console.error(e);
      }
      throw e;
    }
  }
}

/** Global Shell helper instance */
export const shell = new Shell();

/** Allow reference to individual class for testing purposes */
export const TEST_ONLY = {Shell};

export type {Shell};

/**
 * Normalizes options or numeric timeout into maxBuffer, timeout, and silent.
 */
function parseOptions(options?: ShellOptionsOrTimeout): {
  maxBuffer: number;
  timeout: number;
  silent: boolean;
} {
  if (typeof options === 'number') {
    return {
      maxBuffer: DEFAULT_MAX_BUFFER_BYTES,
      timeout: options,
      silent: false,
    };
  }
  return {
    maxBuffer: options?.maxBuffer ?? DEFAULT_MAX_BUFFER_BYTES,
    timeout: options?.timeout ?? DEFAULT_TIMEOUT_MS,
    silent: options?.silent ?? false,
  };
}
