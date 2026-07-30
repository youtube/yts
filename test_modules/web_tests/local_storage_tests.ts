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
  describe('localStorage', () => {
    it('localStorage', () => {
      expect(window.localStorage)
          .withContext('window.localStorage should be defined')
          .toBeDefined();
    });

    it('localStorage.setItem', () => {
      expect('setItem' in window.localStorage)
          .withContext('setItem should be in localStorage')
          .toBeTrue();
    });

    it('localStorage.getItem', () => {
      expect('getItem' in window.localStorage)
          .withContext('getItem should be in localStorage')
          .toBeTrue();
    });

    it('localStorage.removeItem', () => {
      expect('removeItem' in window.localStorage)
          .withContext('removeItem should be in localStorage')
          .toBeTrue();
    });
  });
});
