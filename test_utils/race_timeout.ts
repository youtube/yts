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
 * Returns a promise that resolves when either the given promise resolves or
 * the given timeout elapses. If the timeout elapses, the promise rejects with
 * the given message.
 */
export function raceTimeout(
  promise: Promise<unknown>,
  timeout: number,
  message: string,
): Promise<unknown> {
  let timeoutHandle: ReturnType<typeof setTimeout>;
  promise.finally(() => {
    clearTimeout(timeoutHandle);
  });
  return Promise.race([
    promise,
    new Promise((resolve, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error(message));
      }, timeout);
    }),
  ]);
}
