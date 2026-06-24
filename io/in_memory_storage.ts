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
 * @Fileoverview Storage implementation for unit tests.
 */

const data = new Map<string, string>();

/** Write data to in-memory map */
export function write(fileName: string, content: string) {
  data.set(fileName, content);
}

/** Read from in-memory map */
export function read(fileName: string): string | undefined {
  return data.get(fileName);
}

/** Remove key from in-memory map */
export function remove(fileName: string): void {
  data.delete(fileName);
}

/** Reset in-memory map */
export function clear() {
  data.clear();
}

/** Gets logs directory */
export function getLogsDir(): string {
  console.log('not implemented!');
  throw new Error('Not implemented!');
}
