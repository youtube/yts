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


import type {H5vccScreen} from 'google3/third_party/javascript/yts/yts_common/h5vcc';
import {CobaltUserAgent} from 'google3/third_party/javascript/yts/yts_common/index';

let isChrobaltCache: boolean | undefined;

/**
 * Returns true if the device is running Chrobalt a.k.a. Cobalt 26.
 */
export function isChrobalt() {
  // Check cached isChrobalt value, mainly so that it only logs once
  if (typeof isChrobaltCache !== 'undefined') {
    return isChrobaltCache;
  }
  try {
    const ua = new CobaltUserAgent(navigator.userAgent);
    console.debug('Checking Cobalt version: ', ua.cobaltVersion.lts);
    isChrobaltCache = ua.cobaltVersion.lts >= 26;
    return isChrobaltCache;
  } catch (e: unknown) {
    console.warn(
      `Failed to determine Cobalt version (will assume not Chrobalt): ${e}`,
    );
    isChrobaltCache = false;
    return isChrobaltCache;
  }
}

/** Minimize Cobalt */
export function suspendCobalt(migratedToDeviceSuspend = false): boolean {
  if (isChrobalt()) {
    if (!migratedToDeviceSuspend) {
      exitChrobalt();
    }
    return true;
  } else {
    // No typings for minimize function.
    // tslint:disable-next-line:no-any
    (window as any).minimize();
    return false;
  }
}

/**
 * Exit Cobalt
 *
 * Implemented differently for C25 and C26:
 * 1. C25: Exits Cobalt via window.close().
 * 2. C26:
 *   a. If migratedToDeviceStop is true, does nothing. The caller is responsible for calling Device.stop().
 *   b. If migratedToDeviceStop is false, suspends Cobalt and prints an error message.
 *
 * @return Returns "isChrobalt" (true if it was Chrobalt, false otherwise).
 **/
export function exitCobalt(migratedToDeviceStop = false): boolean {
  if (isChrobalt()) {
    if (!migratedToDeviceStop) {
      exitChrobalt();
    }
    return true;
  } else {
    window.close();
    return false;
  }
}

/**
 * Exits Chrobalt.
 *
 * This function actually only suspends Cobalt, it does not exit it. This
 * function exists for the migration period and will need to be deleted later.
 */
function exitChrobalt() {
  console.error(
      `This function uses h5vcc.system.exit() which does not actually exit Cobalt process, only suspends it. All calls to this function must be replaced with Device.stop() method calls.`,
  );
  window.h5vcc?.system?.exit?.();
}

/**
 * Returns screen diagonal value in inches.
 * Supports both Cobalt 27 async API and older sync API.
 */
export async function getScreenDiagonal(): Promise<number> {
  const h5vcc = window.h5vcc;
  if (h5vcc && h5vcc.system &&
      typeof h5vcc.system.getScreenDiagonal === 'function') {
    const diagonal = await h5vcc.system.getScreenDiagonal();
    console.debug(`h5vcc.system.getScreenDiagonal() = ${diagonal}`);
    return diagonal;
  }
  const H5vccScreen: H5vccScreen | undefined = window.H5vccScreen;
  if (H5vccScreen && typeof H5vccScreen.GetDiagonal === 'function') {
    const diagonal = H5vccScreen.GetDiagonal();
    console.debug(`H5vccScreen.GetDiagonal() = ${diagonal}`);
    return diagonal;
  }
  throw new Error('Screen diagonal API is not supported');
}
