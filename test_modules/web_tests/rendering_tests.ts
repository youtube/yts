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

import {getMediaPath} from 'google3/third_party/javascript/yts/test_utils/legacy_yts_utils';

function runImageTest(
    uri: string, formatName: string, appendToDom = true): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const cleanup = () => {
      if (appendToDom) {
        document.body.removeChild(img);
      }
    };

    img.onload = () => {
      cleanup();
      resolve();
    };

    img.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load ${formatName} image`));
    };

    img.src = uri;
    if (appendToDom) {
      document.body.appendChild(img);
    }
  });
}

describe('Functional Tests', () => {
  describe('Assorted', () => {
    it('JPG', async () => {
      await runImageTest(getMediaPath('qual-e/pass.jpg'), 'JPG');
    });

    it('PNG', async () => {
      await runImageTest(getMediaPath('qual-e/pass.png'), 'PNG');
    });
  });

  describe('WebP', () => {
    it('WebP', async () => {
      await runImageTest(
          'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
          'WebP',
          /* appendToDom= */ false);
    });

    it('WebP Alpha', async () => {
      await runImageTest(
          'data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA==',
          'WebP Alpha',
          /* appendToDom= */ false);
    });

    it('WebP Animation', async () => {
      await runImageTest(
          'data:image/webp;base64,UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA',
          'WebP Animation',
          /* appendToDom= */ false);
    });

    it('WebP Lossless', async () => {
      await runImageTest(
          'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=',
          'WebP Lossless',
          /* appendToDom= */ false);
    });
  });

  describe('Fonts', () => {
    const TEST_CHARACTERS =
        'ABCĆČDĐEFGHIJKLMNOPQRSŠTUVWXYZŽabcčćdđefghijklmnopqrsštuvwxyzž' +
        'ĂÂÊÔƠƯăâêôơư1234567890‘?’“!”(%)[#]{@}/&\\<-+÷×=>®©$€£¥¢:;,.*';

    const FONT_CSS = `
        @font-face {
          font-family: 'WOFF Dancing Script';
          font-style: normal;
          font-weight: 400;
          src: url(/test_modules/web_tests/assets/fonts/dancing-script.woff) format('woff');
        }
        @font-face {
          font-family: 'WOFF2 Dancing Script';
          font-style: normal;
          font-weight: 400;
          src: url(/test_modules/web_tests/assets/fonts/dancing-script.woff2) format('woff2');
        }
        @font-face {
          font-family: 'TTF Dancing Script';
          font-style: normal;
          font-weight: 400;
          src: url(/test_modules/web_tests/assets/fonts/dancing-script.ttf) format('truetype');
        }

        .font-block {
          font-family: serif;
          font-size: 40px;
          display: inline-block;
          word-break: break-all;
          word-wrap: break-word;
          width: 390px;
          line-height: 110% !important;
          margin-left: 20px;
        }

        .dancing-script-woff {
          font-family: 'WOFF Dancing Script', monospace;
        }
        .dancing-script-woff2 {
          font-family: 'WOFF2 Dancing Script', monospace;
        }
        .dancing-script-ttf {
          font-family: 'TTF Dancing Script', sans-serif;
        }
    `;

    beforeAll(async () => {
      const style = document.createElement('style');
      style.textContent = FONT_CSS;
      document.head.appendChild(style);
      if (document.fonts) {
        await document.fonts.ready;
      }
    });

    function runFontTest(format: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const fontDiv = document.createElement('div');
        fontDiv.className = 'font-block';
        document.body.appendChild(fontDiv);

        const ttfEle = document.createElement('span');
        ttfEle.className = 'dancing-script-ttf';
        ttfEle.textContent = TEST_CHARACTERS;

        const testEle = document.createElement('span');
        testEle.className = 'dancing-script-' + format;
        testEle.textContent = TEST_CHARACTERS;

        fontDiv.appendChild(ttfEle);
        fontDiv.appendChild(testEle);

        setTimeout(() => {
          try {
            const ttfWidth = ttfEle.offsetWidth;
            const testWidth = testEle.offsetWidth;
            document.body.removeChild(fontDiv);

            expect(ttfWidth)
                .withContext(`Widths should match for ttf (${ttfWidth}) and ${
                    format} (${testWidth})`)
                .toBe(testWidth);
            resolve();
          } catch (e) {
            reject(e);
          }
        }, 3000);
      });
    }

    it('Fonts - woff', async () => {
      await runFontTest('woff');
    });

    it('Fonts - woff2', async () => {
      await runFontTest('woff2');
    });
  });
});
