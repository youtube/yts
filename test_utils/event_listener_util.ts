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

let callback: (event: Event) => void;
let listenersDefined = false;

/** Attaches event listeners that invoke a callback */
export function addVisibilityListeners(cb: (event: Event) => void) {
  if (listenersDefined) {
    throw new Error(
      'Visibility listeners already defined! Must call removeVisibilityListeners first.',
    );
  }
  callback = cb;
  listenersDefined = true;

  try {
    window.addEventListener('unload', callback);
    window.addEventListener('blur', callback);
    window.addEventListener('focus', callback);

    document.addEventListener('visibilitychange', callback);
    document.addEventListener('freeze', callback);
    document.addEventListener('resume', callback);
  } catch (e: unknown) {
    console.log(e);
  }
}

/**
 * Removes listeners invoked with addEventListener. Must be called before
 * adding more listeners.
 */
export function removeVisibilityListeners() {
  if (!listenersDefined) {
    return;
  }

  window.removeEventListener('unload', callback);
  window.removeEventListener('blur', callback);
  window.removeEventListener('focus', callback);

  document.removeEventListener('visibilitychange', callback);
  document.removeEventListener('freeze', callback);
  document.removeEventListener('resume', callback);

  listenersDefined = false;
}
