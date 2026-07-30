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

/** Represents information required to set or validate a cookie. */
export interface CookieInfo {
  key: string;
  value: string;
  path?: string;
  domain?: string;
  expires?: string;
  httponly?: boolean;
}

/** Sets a browser cookie. */
export function setCookie(
    key: string, value: string, path?: string, domain?: string,
    expires?: string, httponly?: boolean) {
  let payload = key + '=' + value;
  payload += '; path=' + (path ? path : '/');
  payload += '; domain=' + (domain ? domain : '.' + location.hostname);
  if (expires) {
    payload += '; expires=' + expires;
  }
  if (httponly) {
    payload += '; httponly';
  }
  document.cookie = payload;
}

/** Sets a browser cookie using a CookieInfo object. */
export function setCookieObj(cookie: CookieInfo) {
  setCookie(
      cookie.key, cookie.value, cookie.path, cookie.domain, cookie.expires,
      cookie.httponly);
}

/** Parses document.cookie and returns a key-value map of all cookies. */
export function getCookieObject(): {[key: string]: string} {
  const arr = document.cookie.split('; ');
  const result: {[key: string]: string} = {};
  for (let i = 0; i < arr.length; i++) {
    const kv = arr[i].split('=');
    if (kv.length > 1) {
      result[kv[0]] = kv[1];
    }
  }
  return result;
}

/** Clears/deletes a browser cookie by setting its expiry to epoch. */
export function clearCookie(cookie: CookieInfo) {
  setCookie(
      cookie.key, cookie.value, cookie.path, cookie.domain,
      'Thu, 01-Jan-1970 00:00:00 GMT', cookie.httponly);
}

/** Resolves the cookie path prefix based on current window pathname. */
export function getCookiePath(): string {
  const pathname = window.location.pathname;
  return pathname.substring(0, pathname.lastIndexOf('/')) || '/';
}
