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

function runNegativeCodecTest(mimeType: string) {
  console.log(`Checking MIME type: ${mimeType}`);
  expect(MediaSource.isTypeSupported(mimeType))
      .withContext(
          `MIME type ${mimeType} should not be supported (negative test)`)
      .toBeFalse();
}

describe('Functional Tests', () => {
  describe('NegativeCodec', () => {
    it('Negative.Codec.av1', () => {
      runNegativeCodecTest('video/mp4; codecs=av01.0.09M.08');
    });

    it('Negative.Codec.vp9', () => {
      runNegativeCodecTest('video/webm; codecs=vp9');
    });

    it('Negative.Codec.av1.PQ', () => {
      runNegativeCodecTest(
          'video/mp4; codecs="av01.0.12M.10.0.110.09.16.09.0"');
    });

    it('Negative.Codec.av1.HLG', () => {
      runNegativeCodecTest(
          'video/mp4; codecs="av01.0.12M.10.0.110.09.18.01.0"');
    });

    it('Negative.Codec.vp9.PQ', () => {
      runNegativeCodecTest('video/webm; codecs="vp09.02.51.10.01.09.16.09.00"');
    });

    it('Negative.Codec.vp9.HLG', () => {
      runNegativeCodecTest('video/webm; codecs="vp09.02.51.10.01.09.18.09.00"');
    });
  });
});
