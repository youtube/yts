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

import 'yts';

import {exitCobalt} from 'google3/third_party/javascript/yts/test_utils/cobalt';

function getCookie() {
  return document.cookie;
}
yts.script('getCookie', getCookie);

function setCookie(key: string, value: string, expireTime: string) {
  let payload = key + '=' + value + '; path=/';
  payload += '; domain=.' + window.location.hostname;
  payload += '; expires=' + expireTime;
  document.cookie = payload;
}
yts.script('setCookie', setCookie);

function getCookieByKey(key: string) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${key}=`))
    ?.split('=')[1];
}
yts.script('getCookieByKey', getCookieByKey);

function setCookie24H() {
  const now = new Date();
  const expiredDate = new Date(now.getTime() + 1000 * 60 * 60 * 24);
  setCookie('PERSIST_24H', now.toUTCString(), expiredDate.toUTCString());
}
yts.script('setCookie24H', setCookie24H);

function setCookie1Min() {
  const now = new Date();
  const expiredDate = new Date(now.getTime() + 1000 * 60);
  setCookie('PERSIST_1Min', now.toUTCString(), expiredDate.toUTCString());
}
yts.script('setCookie1Min', setCookie1Min);

function setLoopNumberInCookie(loopNumber: number) {
  const now = new Date();
  setCookie(
    'LoopNumber',
    loopNumber.toString(),
    new Date(now.getTime() + 1000 * 60 * 60 * 24).toUTCString(),
  );
}
yts.script('setLoopNumberInCookie', setLoopNumberInCookie);

function clearAllCookies() {
  for (const cookie of document.cookie.split('; ')) {
    const splitCookie = [...cookie.split('=')];
    // Sets each cookie's expiration date to Jan 1st 1970 00:00:00 GMT if not
    // conflicted with the manual test cookies
    // https://source.corp.google.com/piper///depot/google3/third_party/javascript/yts/lib/manual/cookie.js;l=57-67.
    if (
      splitCookie[0] === 'PERSIST_THREE_DAYS' ||
      splitCookie[0] === 'PERSIST_ONE_YEAR'
    ) {
      continue;
    }
    setCookie(splitCookie[0], 'reset value', new Date(0).toUTCString());
  }
}
yts.script('clearAllCookies', clearAllCookies);

yts.script('exitCobalt', exitCobalt);
