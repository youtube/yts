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

import * as globalUtils from 'google3/third_party/javascript/yts/yts_common/global';

import {redirect} from './url_utils';

const YT_BASE = 'https://www.youtube.com/tv';
const KABUKI_LOADER = 'yts';
const TEST_LOADER = 'ytstest';

// Using util.getGlobal() in place of the window object so it can be mocked
// within tests.
function win() {
  return globalUtils.getGlobal();
}

////////////// Sticky loader tools //////////////

// Set to true if a sticky loader is already applied (to avoid unnecessary
// applications)
let stickyLoaderApplied = false;

/**
 * Applies a sticky loader
 * @param testProd If true, applies the 'ytstest' loader instead of the default
 *     'yts' loader.
 */
export async function applyStickyLoader(testProd = false) {
  await stickyLoaderImpl(/* shouldStick = */ true, testProd);
}

/**
 * Removes sticky loader
 * @param testProd If true, removes the 'ytstest' loader instead of the default
 *     'yts' loader.
 */
export async function removeStickyLoader(testProd = false) {
  await stickyLoaderImpl(/* shouldStick = */ false, testProd);
}

/**
 * Steps if shouldStick = true:
 *   1) Exits early if sticky loader is already applied or is running on
 *      localhost
 *   2) Redirects to Kabuki with the following parameters:
 *      a) redirect=<current agent URL> if the current URL is a yts sub-version
 *         (that is, not prod)
 *      b) stick=1 if shouldStick=true, otherwise stick=0
 *      c) loader=<kabuki loader> (within the hash param)
 *
 * This has the following effect:
 *   1) Sticks or unsticks the 'yts' or 'ytstest' loader (based on `testProd`)
 *      from Kabuki.
 *   2) Adds or removes the redirect token from the yts version as pointed to by
 *      the loader (usually the loader is "yts", thus prod)
 *   3) Redirects to the loader as specified in the redirect param (if present)
 */
async function stickyLoaderImpl(shouldStick: boolean, testProd: boolean) {
  // Early return if sticky loader is already applied or it's localhost
  if (shouldStick === stickyLoaderApplied) {
    return;
  }
  const isLocalhost = win().location.hostname === 'localhost';
  if (isLocalhost) {
    return;
  }

  // Record that the sticky loader is being applied/removed
  stickyLoaderApplied = shouldStick;

  let redirParam = '';
  // If we're on a subdomain (not on prod or test prod), add a parameter to the
  // Kabuki redirect which will cause it to ultimately redirect back to the
  // current subdomain.
  if (!isProdLike()) {
    redirParam =
        `&redirect=https://${win().location.hostname}/agent/agent.html`;
  }
  const stickParam = 'stick=' + (shouldStick ? '1' : '0');
  const hashParam = `loader=${testProd ? TEST_LOADER : KABUKI_LOADER}`;
  await redirect(`${YT_BASE}?${stickParam}${redirParam}#?${hashParam}`);
}

/**
 * Returns true if the device is running on a prod or test prod hostname.
 */
function isProdLike() {
  return (
      win().location.hostname.startsWith('yts.') ||
      win().location.hostname.startsWith('ytstest.yts.'));
}

export const TEST_ONLY = {
  // Allows tests to indicate that a sticky loader has already been applied
  setStickyLoaderApplied: (value: boolean) => {
    stickyLoaderApplied = value;
  },
};
