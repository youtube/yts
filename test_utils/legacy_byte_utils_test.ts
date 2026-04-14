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

import {btofourcc, btoi, itob} from './legacy_byte_utils';

describe('legacy_byte_utils', () => {
  describe('btoi', () => {
    it('converts 4 bytes to integer', () => {
      const data = [0x00, 0x00, 0x00, 0x01];
      expect(btoi(data)).toBe(1);
    });

    it('converts 4 bytes with offset', () => {
      const data = [0xff, 0x00, 0x00, 0x00, 0x02];
      expect(btoi(data, 1)).toBe(2);
    });

    it('handles large integers', () => {
      const data = [0x7f, 0xff, 0xff, 0xff];
      expect(btoi(data)).toBe(2147483647);
    });

    it('converts 2 bytes to integer', () => {
      const data = [0x00, 0x2f];
      expect(btoi(data)).toBe(47);
    });
  });

  describe('btofourcc', () => {
    it('converts bytes to string', () => {
      const data = [0x61, 0x62, 0x63, 0x64]; // 'abcd'
      expect(btofourcc(data)).toBe('abcd');
    });

    it('converts bytes with offset', () => {
      const data = [0x00, 0x73, 0x69, 0x64, 0x78]; // 'sidx' at 1
      expect(btofourcc(data, 1)).toBe('sidx');
    });
  });

  describe('itob', () => {
    it('converts integer to 4 bytes', () => {
      expect(itob(1)).toEqual([0, 0, 0, 1]);
    });

    it('converts large integer', () => {
      expect(itob(2147483647)).toEqual([0x7f, 0xff, 0xff, 0xff]);
    });

    it('round trips with btoi', () => {
      const val = 123456789;
      expect(btoi(itob(val))).toBe(val);
    });
  });
});
