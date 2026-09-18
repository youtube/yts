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

import {clearCookie, CookieInfo, getCookieObject, getCookiePath, setCookieObj} from 'google3/third_party/javascript/yts/test_utils/cookie_util';

const VALID_COOKIES: CookieInfo[] = [
  {key: 'valid_cookie', value: 'valid'},
  {key: 'valid_path_cookie', value: 'valid', path: getCookiePath()},
  {key: 'valid_domain_cookie', value: 'valid', domain: '.' + location.hostname}
];

const INVALID_COOKIES: CookieInfo[] = [
  {key: 'invalid_http_only', value: 'invalid', httponly: true},
  {key: 'invalid_path_cookie', value: 'invalid', path: '/p/a/t/h'}, {
    key: 'invalid_domain_cookie',
    value: 'invalid',
    domain: '.invalid-domain.com'
  },
  {
    key: 'invalid_expired_cookie',
    value: 'invalid',
    expires: 'Thu, 01-Jan-1970 00:00:00 GMT'
  }
];

function clearTestCookies() {
  for (const cookie of VALID_COOKIES) {
    clearCookie(cookie);
  }
  for (const cookie of INVALID_COOKIES) {
    clearCookie(cookie);
  }
}

describe('Functional Tests', () => {
  describe('Cookie', () => {
    yts.test({id: '14.22.1.1'});
    it('Set Cookie', () => {
      try {
        for (const cookie of VALID_COOKIES) {
          setCookieObj(cookie);
        }
        for (const cookie of INVALID_COOKIES) {
          setCookieObj(cookie);
        }

        const keys = Object.keys(getCookieObject());

        for (const cookie of VALID_COOKIES) {
          expect(keys)
              .withContext(`Key ${cookie.key} should exist in document.cookie`)
              .toContain(cookie.key);
        }
        for (const cookie of INVALID_COOKIES) {
          expect(keys)
              .withContext(
                  `Key ${cookie.key} should not exist in document.cookie`)
              .not.toContain(cookie.key);
        }
      } finally {
        clearTestCookies();
      }
    });

    yts.test({id: '14.22.2.1'});
    it('Set Expired Cookie', () => {
      try {
        for (const cookie of VALID_COOKIES) {
          setCookieObj(cookie);
        }

        let keys = Object.keys(getCookieObject());
        for (const cookie of VALID_COOKIES) {
          expect(keys)
              .withContext(`Key ${
                  cookie
                      .key} should exist in document.cookie before expiration`)
              .toContain(cookie.key);
        }

        for (const cookie of VALID_COOKIES) {
          clearCookie(cookie);
        }

        keys = Object.keys(getCookieObject());
        for (const cookie of VALID_COOKIES) {
          expect(keys)
              .withContext(`Key ${
                  cookie
                      .key} should not exist in document.cookie after expiration`)
              .not.toContain(cookie.key);
        }
      } finally {
        clearTestCookies();
      }
    });

    yts.test({id: '14.22.3.1'});
    it('Min Cookie Storage', () => {
      const count = 50;
      const cookie_size = 4000;
      const initial_cookie_storage = document.cookie.length;
      let cookie_storage = initial_cookie_storage;

      try {
        for (let i = 0; i < count; i++) {
          const prefix = 'CookieStorageTest' + ('000' + i).substr(-3) + '=';
          const payload =
              prefix + new Array(cookie_size - prefix.length + 1).join('m');
          document.cookie = payload;

          const new_length = document.cookie.length;
          expect(new_length - cookie_storage)
              .withContext(
                  `Failed to add cookie No. ${i} of size ${cookie_size}`)
              .toBeGreaterThanOrEqual(cookie_size);
          cookie_storage = new_length;
        }
      } finally {
        document.cookie.split(';').forEach((c) => {
          if (c.trim().startsWith('CookieStorageTest')) {
            document.cookie = c.replace(/^ +/, '').replace(
                /=.*/, '=;expires=' + new Date().toUTCString());
          }
        });
      }
    });

    yts.test({id: '14.22.4.1'});
    it('Max Cookie Storage', () => {
      const count = 150;
      const cookie_size = 4000;
      const initial_cookie_storage = document.cookie.length;
      let cookie_storage = initial_cookie_storage;

      try {
        for (let i = 0; i < count; i++) {
          const prefix = 'CookieStorageTest' + ('000' + i).substr(-3) + '=';
          const payload =
              prefix + new Array(cookie_size - prefix.length + 1).join('m');
          document.cookie = payload;

          const new_length = document.cookie.length;
          expect(new_length - cookie_storage)
              .withContext(
                  `Failed to add cookie No. ${i} of size ${cookie_size}`)
              .toBeGreaterThanOrEqual(cookie_size);
          cookie_storage = new_length;
        }
      } finally {
        document.cookie.split(';').forEach((c) => {
          if (c.trim().startsWith('CookieStorageTest')) {
            document.cookie = c.replace(/^ +/, '').replace(
                /=.*/, '=;expires=' + new Date().toUTCString());
          }
        });
      }
    });
  });
});
