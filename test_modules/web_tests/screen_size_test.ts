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

describe('Functional Tests', () => {
  describe('Assorted', () => {
    // Checks to make sure window.H5vccScreen.GetDiagonal() returns a positive
    // number
    it('Screen Size', () => {
      const diagonal = getScreenSize();

      if (diagonal <= 0) {
        fail(`H5vccScreen.GetDiagonal() is reported as ${diagonal}`);
      }
    });

    // Checks to make sure window.H5vccScreen.GetDiagonal() returns a value of
    // at least 5.5" for touch devices
    it('Touch Screen Size', () => {
      const diagonal = getScreenSize();

      if (diagonal < 5.5) {
        fail(
          `H5vccScreen.GetDiagonal() is reported as ${diagonal}, which is less than the 5.5 inches required for touch devices.`,
        );
      }
    });

    function getScreenSize() {
      //tslint:disable-next-line:no-any
      const win = window as any;

      if (!win.H5vccScreen) {
        fail('H5vccScreen is not supported');
      }

      const diagonal = win.H5vccScreen.GetDiagonal();
      console.log(`window.H5vccScreen.GetDiagonal() value: ${diagonal}`);
      return diagonal;
    }
  });
});
