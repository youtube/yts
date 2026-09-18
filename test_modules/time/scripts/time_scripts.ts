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

function getTime() {
  return new Date().getTime();
}
yts.script('getTime', getTime);

function getTimezoneOffset() {
  return new Date().getTimezoneOffset();
}
yts.script('getTimezoneOffset', getTimezoneOffset);

function getTimezoneName() {
  const dateTimeStr = new Date().toString();
  return dateTimeStr.match(/\(([a-zA-Z0-9 +-=:\(\)_\/]*)\)/)?.[1];
}
yts.script('getTimezoneName', getTimezoneName);
