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
 * @fileoverview Byte manipulation utilities ported from legacy YTS msutil.js.
 */

/**
 * Convert a 4-byte array into a 32-bit int.
 * @param data The input data array (Uint8Array or number array).
 * @param offset The offset to start reading from.
 * @return The resulting 32-bit integer.
 */
export function btoi(data: Uint8Array | number[], offset = 0): number {
  let result = 0;
  for (let i = offset; i < data.length; i++) {
    result = (result << 8) + (data[i] >>> 0);
  }
  return result;
}

/**
 * Convert a 4-byte array into a fourcc string.
 * @param data The input data array (Uint8Array or number array).
 * @param offset The offset to start reading from.
 * @return The resulting fourcc string.
 */
export function btofourcc(data: Uint8Array | number[], offset = 0): string {
  return String.fromCharCode(
    data[offset],
    data[offset + 1],
    data[offset + 2],
    data[offset + 3],
  );
}

/**
 * Convert a 32-bit int into a 4-byte array.
 * @param value The integer value to convert.
 * @return A 4-element array representing the integer bytes.
 */
export function itob(value: number): number[] {
  return [
    value >>> 24,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ];
}
