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
 * The number of samples to use when estimating the overhead caused by the
 * testing framework.
 */
export const SAMPLE_SIZE = 5;
/**
 * The URL of the empty app to use during the overhead estimation.
 */
export const EMPTY_APP_URL =
  'https://yts.devicecertification.youtube/agent/agent.html?nonce=123';
/**
 * The URL of the main app to use when measuring the loading time.
 */
export const MAIN_APP_URL =
  'https://www.youtube.com/tv?automationRoutine=yts&use_toa=true';


/**
 * Expects the loading time to be less than the expected value.
 *
 * @param expected The expected loading time.
 * @param loadingTime The measured loading time.
 * @param overhead The estimated overhead caused by the testing framework.
 */
export function expectLoadingTime(
  expected: number,
  loadingTime: number,
  overhead: number,
) {
  loadingTime = Math.round(loadingTime / SAMPLE_SIZE - overhead);
  console.log(`Loading Time: ${loadingTime} ms.`);
  expect(loadingTime).withContext('Loading Time (ms)').toBeLessThan(expected);
}
