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
 * @fileoverview Simple non-streaming synchronous file IO helper class.
 * Stores files in user data folder (exact location is OS-specific). Unit tests
 * can provide in-memory version of this class.
 */

import * as fs from 'fs';
import * as path from 'path';

class Storage {
  write(pathName: string, data: string) {
    pathName = this.getFullDataDirPath(pathName);

    const dir = path.dirname(pathName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true});
    }

    console.debug(`WRITE ${pathName}`);
    fs.writeFileSync(pathName, data);
  }

  read(pathName: string): string | undefined {
    pathName = this.getFullDataDirPath(pathName);

    if (fs.existsSync(pathName)) {
      return fs.readFileSync(pathName, {encoding: 'utf8'});
    }

    return;
  }

  /** Delete a path */
  remove(pathName: string): void {
    pathName = this.getFullDataDirPath(pathName);

    if (!fs.existsSync(pathName)) {
      return;
    }

    if (fs.lstatSync(pathName).isDirectory()) {
      backwardsCompatibleRmdirSync(pathName);
    } else {
      fs.unlinkSync(pathName);
    }
  }

  /**
   * Creates (if doesn't exist) and returns directory for all YTS CLI logs.
   */
  getLogsDir() {
    const dir = `${this.getDataDir()}/logs`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true});
    }
    return dir;
  }

  getFullDataDirPath(pathName: string): string {
    if (!path.isAbsolute(pathName)) {
      return path.join(this.getDataDir(), pathName);
    }
    return pathName;
  }

  private getDataDir() {
    let dir = process.env['APPDATA']; // Windows
    if (!dir) {
      const home = process.env['HOME'];
      if (home && home !== '/') {
        if (process.platform === 'darwin') {
          dir = `${home}/Library/Preferences`; // Mac
        } else {
          // This is the path where the YTS credentials are deployed on YTLR lab servers.
          // LINT.IfChange(yts_credentials_path)
          dir = `${home}/.local/share`; // Linux
          // LINT.ThenChange(//depot/google3/devtools/deviceinfra/service/release/config/mobileharness/ytlr_lab_server_credential.gcl:yts_credentials_path)
        }
      } else {
        const tmp = process.env['TEST_TMPDIR']; // some MH setups
        if (tmp) {
          dir = tmp;
        } else {
          dir = '/tmp';
        }
      }
    }
    return path.join(dir, 'yts_server');
  }
}

/**
 * "rmdirSync" is going to be deprecated in later Node versions, but Node 12
 * doesn't have rmSync. Uses rmSync if it's available and rmdirSync if it's not.
 *
 * This is also defined in yts_server/util/util.ts, but is duplicated here so
 * we don't have to deal with dependency issues.
 */
export function backwardsCompatibleRmdirSync(path: string) {
  // abort if path doesn't exist
  if (!fs.existsSync(path)) return;

  if (typeof fs.rmSync === 'function') {
    fs.rmSync(path, {recursive: true});
  } else {
    fs.rmdirSync(path, {recursive: true});
  }
}

/** Disk-storage API */
export const storage = new Storage();

/**
 * By default, all tests override storage, but this allows a way to get the
 * original implementation within tests that specifically test the storage
 * class.
 */
export const TEST_ONLY = {Storage};
