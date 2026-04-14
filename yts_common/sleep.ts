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
 * Returns a promise that resolves after given time in ms.
 * @param ms Delay in milliseconds, up to 2,147,483,647 ms (about 24.8 days).
 * @param abortSignal AbortSignal allowing to abort the sleep. Especially
 *     useful for longer sleeps to clean up memory in timely manner.
 */
export function sleep(ms: number, abortSignal?: AbortSignal): Promise<void> {
  // according to https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value
  const MAX_MS = 0x7fffffff;
  if (ms < 0 || ms > MAX_MS) {
    ms = MAX_MS;
  }
  return new Promise((resolve, reject) => {
    function abort(this: AbortSignal) {
      clear();
      reject(this.reason);
    }
    function clear() {
      clearTimeout(timeoutHandle);
      abortSignal?.removeEventListener('abort', abort);
    }
    const timeoutHandle = setTimeout(() => {
      clear();
      resolve();
    }, ms);
    abortSignal?.addEventListener('abort', abort);
  });
}
