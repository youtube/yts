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

function getCobaltURL() {
  return document.URL;
}

yts.script('getCobaltURL', getCobaltURL);

// no typings for global localStorage variable
// tslint:disable-next-line:no-any
const localStorage = (window as any).localStorage;
const APP_START_KEY = 'app_start';
const APP_PRELOAD_KEY = 'app_preload';

declare interface PerformanceLifecycleTiming extends PerformanceEntry {
  readonly appPreload: DOMHighResTimeStamp;
  readonly appStart: DOMHighResTimeStamp;
  readonly appBlur: DOMHighResTimeStamp;
  readonly appFocus: DOMHighResTimeStamp;
  readonly appConceal: DOMHighResTimeStamp;
  readonly appReveal: DOMHighResTimeStamp;
  readonly appFreeze: DOMHighResTimeStamp;
  readonly appUnFreeze: DOMHighResTimeStamp;
  readonly appStop: DOMHighResTimeStamp;
  readonly currentState: string;
  readonly lastState: string;
}

function recordPerformanceEntry() {
  try {
    console.log('record "lifecycle" performance entries');
    window.onblur = () => {
      console.log('window.onblur');
      const performanceEntry = performance.getEntriesByType(
        'lifecycle',
      )[0] as PerformanceLifecycleTiming;
      localStorage.setItem(APP_START_KEY, performanceEntry.appStart);
      localStorage.setItem(APP_PRELOAD_KEY, performanceEntry.appPreload);
    };
  } catch (e: unknown) {
    console.log(e);
  }
}
yts.script('recordPerformanceEntry', recordPerformanceEntry);

function getAppStart() {
  return localStorage.getItem(APP_START_KEY);
}

yts.script('getAppStart', getAppStart);

function getAppPreload() {
  return localStorage.getItem(APP_PRELOAD_KEY);
}

yts.script('getAppPreload', getAppPreload);

function clearPerformanceEntry() {
  localStorage.removeItem(APP_START_KEY);
  localStorage.removeItem(APP_PRELOAD_KEY);
}
yts.script('clearPerformanceEntry', clearPerformanceEntry);
