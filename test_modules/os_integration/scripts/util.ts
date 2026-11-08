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
  getFriendlyName as getFriendlyNameUtil,
} from 'google3/third_party/javascript/yts/test_utils/cobalt';

const SEARCH_HISTORY_STORAGE_KEY =
  'yt.leanback.default.search-history::recent-searches';

/** Safely register a yts.script without overwriting if already registered natively. */
function registerScriptSafe(name: string, func: Function) {
  try {
    yts.script(name, func);
  } catch (e) {
    // Already registered by native Kabuki hooks.
  }
}

/** Populate search history locally as a fallback. */
export function populateSearchHistory(query: string) {
  const timestamp = Date.now();
  const entry = [query, 1, timestamp];
  let current: unknown[] = [];
  try {
    const raw = window.localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        current = parsed;
      }
    }
  } catch (e) {
    current = [];
  }
  current.push(entry);
  window.localStorage.setItem(
    SEARCH_HISTORY_STORAGE_KEY,
    JSON.stringify(current),
  );
  // tslint:disable-next-line:no-any
  const h5vcc = (window as any).h5vcc;
  if (h5vcc && h5vcc.storage && h5vcc.storage.flush) {
    h5vcc.storage.flush(false);
  }
}
registerScriptSafe('populateSearchHistory', populateSearchHistory);

/** Check if search history exists in localStorage as a fallback. */
export function hasSearchHistory(query: string): boolean {
  try {
    const raw = window.localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (!raw) return false;
    const current = JSON.parse(raw) as unknown;
    if (!Array.isArray(current)) return false;
    return current.some((entry: unknown) => {
      return Array.isArray(entry) && entry[0] === query;
    });
  } catch (e) {
    return false;
  }
}
registerScriptSafe('hasSearchHistory', hasSearchHistory);

/** Reset app locally by clearing storage and reloading page as a fallback. */
export function resetApp() {
  window.localStorage.clear();
  // tslint:disable-next-line:no-any
  const h5vcc = (window as any).h5vcc;
  if (h5vcc && h5vcc.storage && h5vcc.storage.flush) {
    h5vcc.storage.flush(false);
  }
  window.location.reload();
}
registerScriptSafe('resetApp', resetApp);

/** Verify app reset locally by checking localStorage search history as a fallback. */
export function verifyAppReset(): boolean {
  const raw = window.localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
  if (!raw) return true;
  try {
    const current = JSON.parse(raw) as unknown;
    return Array.isArray(current) && current.length === 0;
  } catch (e) {
    return true;
  }
}
registerScriptSafe('verifyAppReset', verifyAppReset);

registerScriptSafe('exitCobalt', exitCobalt);

yts.script('readProp', (path: string) => {
  const parts = path.split('.');
  // tslint:disable-next-line:no-any reading arbitrary properties
  let obj: any = window;
  for (const part of parts) {
    obj = obj[part];
    if (obj == null) {
      return undefined;
    }
  }
  return obj;
});

yts.script('getFriendlyName', async () => {
  try {
    return await getFriendlyNameUtil();
  } catch (e) {
    return null;
  }
});
