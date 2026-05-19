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

/** A standard Promise extended with an explicit stop method. */
export interface StreamPromise<T> extends Promise<T> {
  /** Stops the background streaming fetch loop on the next iteration. */
  stop: () => void;
}

/**
 * Wraps a standard Promise into a StreamPromise by attaching the stop callback.
 *
 * @param promise The underlying standard promise.
 * @param stopCallback Callback to execute when stop() is called.
 * @return The decorated StreamPromise.
 */
export function toStreamPromise<T>(
    promise: Promise<T>,
    stopCallback: () => void = () => {},
    ): StreamPromise<T> {
  const streamPromise = promise as StreamPromise<T>;
  streamPromise.stop = stopCallback;
  return streamPromise;
}
