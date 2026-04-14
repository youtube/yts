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

import {webpOverVideoTest} from 'google3/third_party/javascript/yts/test_utils/shared_tests/webp_over_video_test';

const TEST_TIMEOUT = 50 * 1000; // 50 sec

describe('Functional Tests', () => {
  describe('WebP', () => {
    it(
      'WebP Over Video Test',
      async () => {
        const errors = await webpOverVideoTest(1);
        for (const error of errors) {
          fail(error);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      '10x WebP Over Video Test',
      async () => {
        const errors = await webpOverVideoTest(10);
        for (const error of errors) {
          fail(error);
        }
      },
      TEST_TIMEOUT,
    );
  });
});
