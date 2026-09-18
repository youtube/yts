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

import * as logger from './logger';
import 'jasmine';

describe('Logger', () => {
  // Mock the console.log to capture output
  let consoleOutput: string[] = [];
  const originalConsoleLog = console.log;
  beforeEach(() => {
    consoleOutput = [];
    console.log = (...args: unknown[]) => consoleOutput.push(args.join(' '));
  });
  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe('logging functions', () => {
    it('logInfo', () => {
      logger.info('apple');
      expect(consoleOutput).toMatch('[INFO]');
      expect(consoleOutput).toMatch('apple');
    });

    it('logWarn', () => {
      logger.warn('unfresh');
      expect(consoleOutput).toMatch('[WARN]');
      expect(consoleOutput).toMatch('unfresh');
    });

    it('logError', () => {
      logger.error('rotten');
      expect(consoleOutput).toMatch('[ERROR]');
      expect(consoleOutput).toMatch('rotten');
    });

    it('logInfo with multiple arguments', () => {
      logger.info('apple', 'fresh');
      expect(consoleOutput).toMatch('[INFO]');
      expect(consoleOutput).toMatch('apple');
      expect(consoleOutput).toMatch('fresh');
    });

    it('logInfo with object', () => {
      const obj = {
        'apple': 'fresh',
        'banana': 'ok',
      };
      logger.info('all good', obj);
      expect(consoleOutput).toMatch('[INFO]');
      expect(consoleOutput).toMatch('apple');
      expect(consoleOutput).toMatch('fresh');
    });

    it('logError with error object', () => {
      const obj = new Error('all bad');
      logger.error(obj);
      expect(consoleOutput).toMatch('Error: all bad');
    });

    it('logError with a regular object', () => {
      const keyword = 'apple';
      const targetPackages: unknown[] = [];
      logger.error(
        `Found target packages including "${keyword}" : ${JSON.stringify(
          targetPackages,
        )}`,
      );
      expect(consoleOutput).toMatch(' Found target packages including "apple"');
    });
  });
});
