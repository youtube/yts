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

import {clearCookie, CookieInfo, getCookieObject, getCookiePath, setCookie, setCookieObj} from './cookie_util';

describe('cookie_util', () => {
  const TEST_COOKIE: CookieInfo = {
    key: 'test_unit_cookie',
    value: 'unit_val',
  };

  beforeEach(() => {
    // Ensure a clean cookie state before each test run.
    clearCookie(TEST_COOKIE);
  });

  afterEach(() => {
    // Cleanup after each test.
    clearCookie(TEST_COOKIE);
  });

  describe('setCookie & getCookieObject', () => {
    it('should correctly write a cookie and parse it into an object', () => {
      setCookie(TEST_COOKIE.key, TEST_COOKIE.value);
      const cookies = getCookieObject();
      expect(cookies[TEST_COOKIE.key]).toBe(TEST_COOKIE.value);
    });
  });

  describe('setCookieObj', () => {
    it('should set a cookie using a CookieInfo configuration object', () => {
      setCookieObj(TEST_COOKIE);
      const cookies = getCookieObject();
      expect(cookies[TEST_COOKIE.key]).toBe(TEST_COOKIE.value);
    });
  });

  describe('clearCookie', () => {
    it('should successfully delete a cookie by expiring it', () => {
      setCookieObj(TEST_COOKIE);
      clearCookie(TEST_COOKIE);
      const cookies = getCookieObject();
      expect(cookies[TEST_COOKIE.key]).toBeUndefined();
    });
  });

  describe('getCookiePath', () => {
    it('should return a valid path string starting with slash', () => {
      const path = getCookiePath();
      expect(path.startsWith('/')).toBeTrue();
    });
  });
});
