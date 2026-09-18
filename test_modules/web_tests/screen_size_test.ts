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
 * @fileoverview Tests for screen diagonal and touch screen size reporting.
 */

import {getScreenDiagonal} from 'google3/third_party/javascript/yts/test_utils/cobalt';

describe('Functional Tests', () => {
  describe('Assorted', () => {
    // Checks to make sure screen diagonal API returns a positive number
    yts.test({id: 'C21596B8-2031-44EC-8C27-B73AE26B070D'});
    it('Screen Size', async () => {
      const diagonal = await getScreenSize();
      if (diagonal !== null && diagonal <= 0) {
        fail(`Screen diagonal is reported as ${diagonal}`);
      }
    });

    // Checks to make sure screen diagonal is >= 5.5 inches for touch devices
    yts.test({id: '28D35BA0-3DEB-47F6-ABAA-BEF79C754C57'});
    it('Touch Screen Size', async () => {
      const diagonal = await getScreenSize();
      if (diagonal !== null && diagonal < 5.5) {
        fail(
            `Screen diagonal is reported as ${diagonal}, which is less than ` +
            `the 5.5 inches required for touch devices.`,
        );
      }
    });

    async function getScreenSize(): Promise<number | null> {
      try {
        const diagonal = await getScreenDiagonal();
        console.log(`Screen diagonal value: ${diagonal}`);
        return diagonal;
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        fail(message);
        return null;
      }
    }
  });
});
