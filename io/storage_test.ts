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

import {TEST_ONLY} from './storage';

describe('Storage', () => {
  it('saves', () => {
    const storage1 = new TEST_ONLY.Storage();
    storage1.write('test.txt', 'test');

    const storage2 = new TEST_ONLY.Storage();
    const s = storage2.read('test.txt');
    expect(s).toBe('test');
  });

  it('removes file', () => {
    const storage = new TEST_ONLY.Storage();
    storage.write('f', '1');
    expect(storage.read('f')).toBe('1');
    storage.remove('f');
    expect(storage.read('f')).toBeUndefined();
  });

  it('removes dir', () => {
    const storage = new TEST_ONLY.Storage();
    storage.write('a/b', '1');
    expect(storage.read('a/b')).toBe('1');
    storage.write('a/c', '2');
    expect(storage.read('a/c')).toBe('2');
    storage.remove('a');
    expect(storage.read('a/b')).toBeUndefined();
    expect(storage.read('a/c')).toBeUndefined();
  });
});
