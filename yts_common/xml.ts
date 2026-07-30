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

import * as xml2js from 'xml2js';

/**
 * Parses XML string into a JSON object and returns as a Promise.
 */
export function parseXml(xml: string) {
  return new Promise<unknown>((resolve, reject) => {
    xml2js.parseString(xml, (error: unknown, result: unknown) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
