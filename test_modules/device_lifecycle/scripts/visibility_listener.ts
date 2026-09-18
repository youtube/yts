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

import {
  exitCobalt,
  isChrobalt,
  suspendCobalt,
} from 'google3/third_party/javascript/yts/test_utils/cobalt';
import {h5vcc} from 'google3/third_party/javascript/yts/yts_common/h5vcc';

function getUserAgent() {
  return navigator.userAgent;
}
yts.script('getUserAgent', getUserAgent);

yts.script('isChrobalt', isChrobalt);

// no typings for global localStorage variable
// tslint:disable-next-line:no-any
const localStorage = (window as any).localStorage;
const STORAGE_KEY = 'visibility_events';
const TIMESTAMP_KEY = 'event_timestamps';

function appendLocalStorage(event: string) {
  const logList = JSON.parse(localStorage.getItem(STORAGE_KEY)) as string[];
  const timeList = JSON.parse(localStorage.getItem(TIMESTAMP_KEY)) as number[];
  timeList.push(new Date().getTime());
  localStorage.setItem(TIMESTAMP_KEY, JSON.stringify(timeList));
  logList.push(event);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logList));
}

function clearLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  localStorage.setItem(TIMESTAMP_KEY, JSON.stringify([]));
}

yts.script('clearLocalStorage', clearLocalStorage);

function addListeners() {
  // localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  try {
    console.log('adding listeners');

    window.onblur = () => {
      console.log('window.onblur');
      appendLocalStorage('window.onblur');
    };

    window.onfocus = () => {
      console.log('window.onfocus');
      appendLocalStorage('window.onfocus');
    };

    // No typings for onfreeze function.
    // tslint:disable-next-line:no-any
    (document as any).onfreeze = () => {
      console.log('document.onfreeze');
      appendLocalStorage('document.onfreeze');
    };

    // No typings for onresume function.
    // tslint:disable-next-line:no-any
    (document as any).onresume = () => {
      console.log('document.onresume');
      appendLocalStorage('document.onresume');
    };

    document.onblur = () => {
      appendLocalStorage('Error: document.onblur?! event should be on window!');
    };

    document.onfocus = () => {
      appendLocalStorage(
        'Error: document.onfocus?! event should be on window!',
      );
    };

    document.onvisibilitychange = () => {
      console.log(`document.onvisibilitychange: ${document.visibilityState}`);
      appendLocalStorage(
        `document.onvisibilitychange: ${document.visibilityState}`,
      );
    };
  } catch (e: unknown) {
    console.log(e);
  }
}

yts.script('addListeners', addListeners);

function getVisibilityState() {
  try {
    return document.visibilityState;
  } catch (e: unknown) {
    console.log(e);
    return '';
  }
}
yts.script('getVisibilityState', getVisibilityState);

function getStateChanges() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e: unknown) {
    console.log(e);
    return '';
  }
}

function getEventTimestamps() {
  try {
    return localStorage.getItem(TIMESTAMP_KEY);
  } catch (e: unknown) {
    console.log(e);
    return '';
  }
}

function getDeviceTime() {
  return new Date().getTime();
}
yts.script('getDeviceTime', getDeviceTime);

yts.script('getEventTimestamps', getEventTimestamps);

yts.script('getStateChanges', getStateChanges);

yts.script('exitCobalt', exitCobalt);

async function getLaunchEpochTime() {
  // No typings for local performance object
  // tslint:disable-next-line:no-any
  const perf = window.performance as any;
  if (perf?.getAppStartupTimeStamp) {
    // getAppStartupTimeStamp() returns a DOMHighResTimeStamp (a negative offset relative to timeOrigin).
    // The test requires an absolute epoch timestamp to compare against previous launches.
    // For example, the `Exits App on window.close` test asserts expect(launchTime).not.toEqual(newLaunchTime).
    // If we returned the startup duration, two consecutive launches matching in duration would incorrectly flake.
    // Thus, we add the negative offset to timeOrigin to reconstruct the absolute launch epoch time.
    const stampOffset = await perf.getAppStartupTimeStamp();
    return Math.round(Number(perf.timeOrigin) + Number(stampOffset));
  } else if (perf?.getAppStartupTime) {
    const durationUs = await perf.getAppStartupTime();
    return Math.round(perf.timeOrigin - durationUs / 1000);
  } else if (perf?.getEntriesByType) {
    const lifecycleTiming = perf.getEntriesByType('lifecycle')?.[0];
    if (lifecycleTiming) {
      return Math.round(
        perf.timeOrigin -
          Math.abs(
            lifecycleTiming.appStartWithAndroidFix || lifecycleTiming.appStart,
          ),
      );
    }
  }
  const cobaltStartTimeUs = h5vcc?.cVal?.getValue('Time.Cobalt.Start');
  if (cobaltStartTimeUs) {
    return Math.round(Number(cobaltStartTimeUs) / 1000);
  }
  return undefined;
}
yts.script('getLaunchEpochTime', getLaunchEpochTime);

yts.script('suspendCobalt', suspendCobalt);

async function whenResumed() {
  return new Promise<void>((resolve) => {
    let resolved = false;
    const doResolve = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };
    // No typings for onresume function.
    // tslint:disable-next-line:no-any
    (document as any).onresume = () => {
      console.log('document.onresume');
      doResolve();
    };
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('document.visibilitychange: visible');
        doResolve();
      }
    });
  });
}
yts.script('whenResumed', whenResumed);
