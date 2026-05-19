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

import {TimeoutManager} from './timeout_manager';

describe('TimeoutManager', () => {
  let manager: TimeoutManager;

  beforeEach(() => {
    manager = new TimeoutManager();
  });

  afterEach(() => {
    manager.clearAll();
  });

  it('should execute setTimeout callback', (done) => {
    manager.setTimeout(() => {
      expect(true).toBeTrue();
      done();
    }, 10);
  });

  it('should execute setInterval callback multiple times', (done) => {
    let count = 0;
    manager.setInterval(() => {
      count++;
      if (count === 3) {
        expect(count).toBe(3);
        done();
      }
    }, 10);
  });

  it('should clear active timeouts on clearAll', (done) => {
    let executed = false;
    manager.setTimeout(() => {
      executed = true;
    }, 50);

    manager.clearAll();

    setTimeout(() => {
      expect(executed).toBeFalse();
      done();
    }, 100);
  });

  it('should clear active intervals on clearAll', (done) => {
    let count = 0;
    manager.setInterval(() => {
      count++;
    }, 10);

    manager.clearAll();

    setTimeout(() => {
      expect(count).toBe(0);
      done();
    }, 50);
  });
});
