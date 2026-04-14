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
 * @fileoverview Util methods migrated from legacy YTS.
 */

import {getMaxAV1SupportedWindow, getMaxVp9SupportedWindow} from 'google3/third_party/javascript/yts/test_utils/playback_util';

const MEDIA_PATH =
  '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/';

/**
 * Returns the full path to a media file.
 * @param filename The name of the media file.
 * @return The full path to the media file.
 */
export function getMediaPath(filename: string) {
  return MEDIA_PATH + filename;
}

function firstCharToUpper(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Checks whether a DOM object supports a given property.
 *
 * @param obj The DOM object to check.
 * @param prop The property to check.
 * @return True if the property is supported, false otherwise.
 */
export function hasDomProperty(obj: object, prop: string) {
  if (prop in obj) {
    return true;
  } else if ('webkit' + firstCharToUpper(prop) in obj) {
    return true;
  } else {
    return false;
  }
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param name The string to convert.
 * @return The capitalized string.
 */
export function makeCapitalName(name: string) {
  return name.split(' ').map(firstCharToUpper).join(' ');
}

/**
 * Converts the provided field name from snake case to camel case.
 * @param name The field name in snake case.
 * @return The field name in camel case.
 */
export function makeFieldName(name: string) {
  const arr = name.split('-');
  name = arr[0];
  for (let i = 1; i < arr.length; i++) {
    name += makeCapitalName(arr[i]);
  }
  return name;
}

/**
 * Returns true if the maximum supported AV1 resolution is greater than FHD.
 */
export function isAv1GtFHD() {
  const av1 = getMaxAV1SupportedWindow();
  return av1[0] * av1[1] > 2073600;
}

/**
 * Returns true if the maximum supported AV1 resolution is greater than 4K.
 */
export function isAv1Gt4K() {
  const av1 = getMaxAV1SupportedWindow();
  return av1[0] * av1[1] > 8294400;
}

/**
 * Returns true if the maximum supported VP9 resolution is greater than FHD.
 */
export function isVp9GtFHD() {
  const vp9 = getMaxVp9SupportedWindow();
  return vp9[0] * vp9[1] > 2073600;
}

/**
 * Returns true if the maximum supported VP9 resolution is greater than 4K.
 */
export function isVp9Gt4K() {
  const vp9 = getMaxVp9SupportedWindow();
  return vp9[0] * vp9[1] > 8294400;
}

/**
 * Compares two resolution strings in the format "{number}p".
 * @param r1 The first resolution string.
 * @param r2 The second resolution string.
 * @return 1 if r1 > r2, 0 if r1 == r2, -1 if r1 < r2.
 * @throws Error if the resolution format is incorrect.
 */
export function compareResolutions(r1: string, r2: string) {
  if (r1[r1.length - 1] !== 'p' || r2[r2.length - 1] !== 'p') {
    throw new Error('Resolution Format Error: should be {number}p');
  }
  const n1 = Number(r1.slice(0, -1));
  const n2 = Number(r2.slice(0, -1));
  if (isNaN(n1) || isNaN(n2) || n1 <= 0 || n2 <= 0) {
    throw new Error(
      'Resolution Format Error: No valid number could be parsed.',
    );
  }
  if (n1 > n2) {
    return 1;
  } else if (n1 === n2) {
    return 0;
  } else {
    return -1;
  }
}
