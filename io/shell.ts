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

import {execSync} from 'child_process';

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
      execSync(`${this.adbPath} --version`, {stdio: 'ignore'});
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Runs an ADB command and returns the result as a string.
   * @param adbCommand The ADB command to run.
   * @return The result of the command.
   */
  runAdbCommand(adbCommand: string): string {
    return this.runAdbCommandBin(adbCommand).toString();
  }

  /**
   * Runs an ADB command and returns the result as a buffer.
   * @param adbCommand The ADB command to run.
   * @return The result of the command.
   */
  runAdbCommandBin(adbCommand: string): Buffer {
    return this.execSyncBin(`${this.adbPath} ${adbCommand}`);
  }

  /**
   * Runs a shell command and returns the result as a string.
   * @param command The command to run.
   * @return The result of the command.
   */
  execSync(command: string): string {
    return this.execSyncBin(command).toString();
  }

  /**
   * Runs a shell command and returns the result as a buffer.
   * @param command The command to run.
   * @return The result of the command.
   */
  execSyncBin(command: string): Buffer {
    console.debug(command);
    try {
      const result = execSync(command, {maxBuffer: 200 * 1024 * 1024});
      console.debug(`Result size: ${result.length}`);
      return result;
    } catch (e: unknown) {
      console.error(e);
      throw e;
    }
  }
}

/** Global Shell helper instance */
export const shell = new Shell();

/** Allow reference to individual class for testing purposes */
export const TEST_ONLY = {Shell};

export type {Shell};
