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

import 'jasmine';

import {hours, minutes, prettyMs, seconds} from './time';

describe('time', () => {
  it('converts seconds, minutes, and hours to milliseconds', () => {
    expect(seconds(5)).toBe(5_000);
    expect(minutes(2)).toBe(120_000);
    expect(hours(1)).toBe(3_600_000);
  });

  describe('prettyMs', () => {
    it('formats zero and sub-second durations', () => {
      expect(prettyMs(0)).toBe('0s');
      expect(prettyMs(500)).toBe('500ms');
    });

    it('formats exact single-unit durations without trailing zeros', () => {
      expect(prettyMs(seconds(10))).toBe('10s');
      expect(prettyMs(minutes(1))).toBe('1m');
      expect(prettyMs(hours(1))).toBe('1h');
    });

    it('formats compound durations', () => {
      expect(prettyMs(minutes(1) + seconds(30))).toBe('1m 30s');
      expect(prettyMs(hours(1) + minutes(30) + seconds(1))).toBe('1h 30m 1s');
      expect(prettyMs(hours(1) + seconds(5))).toBe('1h 5s');
      expect(prettyMs(seconds(1) + 250)).toBe('1s 250ms');
    });

    it('formats negative durations', () => {
      expect(prettyMs(-seconds(10))).toBe('-10s');
    });
  });
});
