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

/**
 * @fileoverview Cobalt helper utilities for YTS tests.
 */

import type {H5vccScreen} from 'google3/third_party/javascript/yts/yts_common/h5vcc';
import {CobaltUserAgent} from 'google3/third_party/javascript/yts/yts_common/index';

let isChrobaltCache: boolean | undefined;
let isAndroidTvCache: boolean | undefined;
let isCobalt26Cache: boolean | undefined;

/**
 * Returns true if the device is running Android TV (ATV).
 *
 * In accordance with Cobalt User-Agent specifications and YouTube Living Room
 * Certification Requirements:
 * - OS_NAME_AND_VERSION is formatted as `ATV; <version>` (distinct from `AOSP`, `Tizen`, `webOS`, etc.).
 * - Device_Name block is formatted as `<System_Integrator>_<Device_Type>_<Chipset>_<Year>`,
 *   where ATV devices specify `ATV` (e.g., `Google_ATV_sabrina_2020`, `Sony_ATV_ur2_2021`).
 */
export function isAndroidTv(customUserAgent?: string): boolean {
  if (!customUserAgent && typeof isAndroidTvCache !== 'undefined') {
    return isAndroidTvCache;
  }
  const uaString =
      customUserAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  if (!uaString) {
    if (!customUserAgent) isAndroidTvCache = false;
    return false;
  }

  try {
    const ua = new CobaltUserAgent(uaString);
    const os = ua.osNameAndVersion.trim();
    const osUpper = os.toUpperCase();
    const deviceName = ua.deviceNameBlock.trim();
    const deviceNameUpper = deviceName.toUpperCase();

    // 1. Explicit exclusion: AOSP is not ATV.
    if (osUpper.includes('AOSP') || deviceNameUpper.includes('AOSP')) {
      if (!customUserAgent) isAndroidTvCache = false;
      return false;
    }

    // 2. Check OS_NAME_AND_VERSION enum: ATV (e.g. "ATV; 10.2", "ATV; 14.0")
    if (osUpper.startsWith('ATV') || /(?:^|[;\s])ATV(?:[;\s/]|$)/i.test(os)) {
      if (!customUserAgent) isAndroidTvCache = true;
      return true;
    }

    // 3. Check Device_Name block: <System_Integrator>_<Device_Type>_<Chipset>_<Year>
    // e.g. "Google_ATV_sabrina_2020", "Sony_ATV_ur2_2021"
    const parts = deviceName.split('_');
    if (parts.length >= 2 && parts[1].toUpperCase() === 'ATV') {
      if (!customUserAgent) isAndroidTvCache = true;
      return true;
    }
    if (/(?:^|_)ATV(?:_|$)/i.test(deviceName)) {
      if (!customUserAgent) isAndroidTvCache = true;
      return true;
    }

    // 4. Legacy CoAT fallback: "(Linux ...; Android 12) ... Google_ATV_..."
    if (osUpper.includes('ANDROID') && !osUpper.includes('FIREOS')) {
      const is3pNonAtv =
          osUpper.includes('TIZEN') || osUpper.includes('WEBOS') ||
          osUpper.includes('ROKU') || osUpper.includes('VIDAA') ||
          osUpper.includes('RDK');
      if (!is3pNonAtv && /(?:^|_)ATV(?:_|$)/i.test(deviceName)) {
        if (!customUserAgent) isAndroidTvCache = true;
        return true;
      }
    }

    if (!customUserAgent) isAndroidTvCache = false;
    return false;
  } catch {
    const rawUpper = uaString.toUpperCase();
    if (rawUpper.includes('AOSP')) {
      if (!customUserAgent) isAndroidTvCache = false;
      return false;
    }
    const hasAtv =
        /\bATV\b/i.test(uaString) || /_ATV_/i.test(uaString) || /\(ATV[;\s]/i.test(uaString);
    if (!customUserAgent) isAndroidTvCache = hasAtv;
    return hasAtv;
  }
}

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

/**
 * Returns true if the device is running Cobalt 26.
 */
export function isCobalt26(customUserAgent?: string): boolean {
  if (!customUserAgent && typeof isCobalt26Cache !== 'undefined') {
    return isCobalt26Cache;
  }
  try {
    const uaString = customUserAgent ?? navigator.userAgent;
    const ua = new CobaltUserAgent(uaString);
    const result = ua.cobaltVersion.lts === 26;
    if (!customUserAgent) isCobalt26Cache = result;
    return result;
  } catch {
    if (!customUserAgent) isCobalt26Cache = false;
    return false;
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
 * Throws a descriptive error on Cobalt 26 or if an invalid value is returned.
 */
export async function getScreenDiagonal(): Promise<number> {
  if (isCobalt26()) {
    throw new Error('Screen diagonal API is not supported on Cobalt 26.');
  }

  let diagonal: number | undefined;
  const h5vcc = window.h5vcc;
  if (
    h5vcc &&
    h5vcc.system &&
    typeof h5vcc.system.getScreenDiagonal === 'function'
  ) {
    diagonal = await h5vcc.system.getScreenDiagonal();
    console.debug(`h5vcc.system.getScreenDiagonal() = ${diagonal}`);
  } else {
    const H5vccScreen: H5vccScreen | undefined = window.H5vccScreen;
    if (H5vccScreen && typeof H5vccScreen.GetDiagonal === 'function') {
      diagonal = H5vccScreen.GetDiagonal();
      console.debug(`H5vccScreen.GetDiagonal() = ${diagonal}`);
    } else {
      throw new Error('Screen diagonal API is not supported');
    }
  }

  if (diagonal == null || isNaN(diagonal)) {
    throw new Error(
      `Screen diagonal API returned an invalid value: ${diagonal}`,
    );
  }

  return diagonal;
}

/**
 * Returns the user's TV friendly name.
 */
export async function getFriendlyName(): Promise<string> {
  const h5vcc = window.h5vcc;
  if (h5vcc && h5vcc.system &&
      typeof h5vcc.system.getFriendlyName === 'function') {
    const friendlyName = await h5vcc.system.getFriendlyName();
    console.debug(`h5vcc.system.getFriendlyName() = ${friendlyName}`);
    return friendlyName;
  }
  throw new Error('Friendly name API is not supported');
}

