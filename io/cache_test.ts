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

import {TEST_ONLY} from './cache';

describe('cache', () => {
  let numCalls = 0;
  function valueFactory() {
    numCalls++;
    return 'foo';
  }

  beforeEach(() => {
    numCalls = 0;
  });

  it('reads once', () => {
    const cache = new TEST_ONLY.Cache();
    cache.get('jasmine_test_key', valueFactory);
    cache.get('jasmine_test_key', valueFactory);
    expect(numCalls).toEqual(1);
  });

  it('reads once again, clearing cache between tests', () => {
    const cache = new TEST_ONLY.Cache();
    cache.get('jasmine_test_key', valueFactory);
    cache.get('jasmine_test_key', valueFactory);
    expect(numCalls).toEqual(1);
  });

  it('retrieves values', () => {
    const cache = new TEST_ONLY.Cache();
    cache.get('jasmine_test_key', valueFactory);
    const result = cache.get('jasmine_test_key', valueFactory);

    expect(result).toEqual('foo');
  });
});
