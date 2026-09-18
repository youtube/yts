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
    yts.test({id: '93d3e8ac-e159-4513-99fd-492687b17b79'});
    it('Negative.Codec.av1', () => {
      runNegativeCodecTest('video/mp4; codecs=av01.0.09M.08');
    });

    yts.test({id: '39fad352-4a93-436b-b379-653656e62dbc'});
    it('Negative.Codec.vp9', () => {
      runNegativeCodecTest('video/webm; codecs=vp9');
    });

    yts.test({id: 'F92241C6-43C4-4FDA-93DA-5EA0E5896B89'});
    it('Negative.Codec.av1.PQ', () => {
      runNegativeCodecTest(
          'video/mp4; codecs="av01.0.12M.10.0.110.09.16.09.0"');
    });

    yts.test({id: 'D243111E-6DDC-4717-B781-517144532571'});
    it('Negative.Codec.av1.HLG', () => {
      runNegativeCodecTest(
          'video/mp4; codecs="av01.0.12M.10.0.110.09.18.01.0"');
    });

    yts.test({id: '3FA1CDF8-12A1-4674-8ED0-C5A99C1C3144'});
    it('Negative.Codec.vp9.PQ', () => {
      runNegativeCodecTest('video/webm; codecs="vp09.02.51.10.01.09.16.09.00"');
    });

    yts.test({id: '2782A261-CFD8-4F10-8292-4647B265AA65'});
    it('Negative.Codec.vp9.HLG', () => {
      runNegativeCodecTest('video/webm; codecs="vp09.02.51.10.01.09.18.09.00"');
    });
  });
});
