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

import * as util from 'google3/third_party/javascript/yts/test_utils/legacy_yts_utils';

describe('CSS Conformance Tests', () => {
  /**
   * Helper function to create a common CSS property test.
   * @param propertyName The CSS property name (e.g., 'background', 'border-color').
   */
  function checkCssProperty(propertyName: string) {
    const div = document.createElement('div') as HTMLElement;
    const field = util.makeFieldName(propertyName);
    if (!util.hasDomProperty(div.style, field)) {
      fail(`No ${propertyName} detected.`);
    }
  }

  /**
   * Helper function to create a whole category of CSS property tests.
   * @param categoryName Category name.
   * @param propsList An array of CSS property names; one for each test.
   */
  function checkCssProperties(categoryName: string, propsList: string[]) {
    describe(categoryName, () => {
      propsList.forEach((prop) => {
        it(prop, () => {
          checkCssProperty(prop);
        });
      });
    });
  }

  checkCssProperties('CSS Fundamentals', [
    'animation',
    'bottom',
    'box-shadow',
    // 'caption-side', // DEPRECATED
    // 'clear', // DEPRECATED
    // 'clip', // DEPRECATED
    'color',
    'content',
    // 'counter-increment', // DEPRECATED
    // 'counter-reset', // DEPRECATED
    // 'cursor', // DEPRECATED
    // 'css-float', // DEPRECATED
    // 'direction', // DEPRECATED
    'display',
    // 'empty-cells', // DEPRECATED
    // 'float', // DEPRECATED
    'height',
    'left',
    // 'letter-spacing', // DEPRECATED
    'line-height',
    'max-height',
    'max-width',
    'min-height',
    'min-width',
    'opacity',
    // 'orphans', // DEPRECATED
    'overflow',
    'position',
    // 'quotes', // DEPRECATED
    'right',
    // 'size', // DEPRECATED
    // 'table-layout', // DEPRECATED
    'top',
    'transform',
    'transform-origin',
    // 'unicode-bidi', // DEPRECATED
    'vertical-align',
    'visibility',
    'white-space',
    // 'widows', // DEPRECATED
    'width',
    // 'word-spacing', // DEPRECATED
    'z-index',
  ]);

  checkCssProperties('Background', [
    'background',
    // 'background-attachment', // DEPRECATED
    'background-color',
    'background-image',
    'background-position',
    'background-repeat',
    'background-size',
  ]);

  checkCssProperties('Border', [
    'border',
    // 'border-collapse', // DEPRECATED
    'border-color',
    'border-left',
    'border-left-color',
    'border-left-style',
    'border-left-width',
    'border-right',
    'border-right-color',
    'border-right-style',
    'border-right-width',
    // 'border-spacing', // DEPRECATED
    'border-style',
    'border-top',
    'border-top-color',
    'border-top-style',
    'border-top-width',
    'border-width',
    'border-bottom',
    'border-bottom-color',
    'border-bottom-style',
    'border-bottom-width',
  ]);

  checkCssProperties('Font', [
    'font',
    'font-family',
    'font-size',
    // 'font-stretch', // DEPRECATED
    'font-style',
    // 'font-variant', // DEPRECATED
    'font-weight',
  ]);

  /* DEPRECATED
  checkCssProperties('List Style', [
    'list-style',
    'list-style-image',
    'list-style-position',
    'list-style-type',
  ]);
  */

  checkCssProperties('Margin', [
    'margin',
    'margin-left',
    'margin-right',
    'margin-top',
    'margin-bottom',
  ]);

  checkCssProperties('Outline', [
    'outline',
    'outline-color',
    'outline-style',
    'outline-width',
  ]);

  checkCssProperties('Padding', [
    'padding',
    'padding-left',
    'padding-right',
    'padding-top',
    'padding-bottom',
  ]);

  /* DEPRECATED
  checkCssProperties('Page', [
    'page',
    'page-break-after',
    'page-break-before',
    'page-break-inside',
  ]);
  */

  checkCssProperties('Text', [
    'text-align',
    'text-decoration',
    'text-indent',
    'text-overflow',
    'text-shadow',
    'text-transform',
  ]);

  // Maintaining the original typo.
  checkCssProperties('Trasition', [
    'transition',
    'transition-delay',
    'transition-duration',
    'transition-property',
    'transition-timing-function',
  ]);

  describe('Selector', () => {
    let selectorElementInstance: HTMLSpanElement | null = null;

    beforeEach(() => {
      const testArea = document.createElement('div');
      testArea.id = 'testArea';
      document.body.appendChild(testArea);

      selectorElementInstance = document.createElement('span');
      selectorElementInstance.className = 'test1 test2';
      selectorElementInstance.setAttribute('testattr', 'test3');
      selectorElementInstance.id = 'test4';
      testArea.appendChild(selectorElementInstance);
    });

    afterEach(() => {
      if (selectorElementInstance?.parentNode) {
        selectorElementInstance.parentNode.removeChild(selectorElementInstance);
      }
      selectorElementInstance = null;
    });

    const selectorTests: Array<{name: string; value: string}> = [
      {name: 'Type selector', value: 'span'},
      {name: 'ID selector', value: '#test4'},
      {name: 'Class selector', value: '.test1'},
      {name: 'Multiple Class selector', value: '.test1.test2'},
      {name: 'Descendant selector', value: 'body * span'}, // Assuming #testArea is in body
      {name: 'Child selector', value: '#testArea > span'}, // More specific than body > span
      {name: 'Attribute selector', value: '[testattr=test3]'},
    ];

    selectorTests.forEach((testSpec) => {
      it(testSpec.name, () => {
        const element = document.querySelector(testSpec.value);
        expect(element)
          .withContext(`Selected an element using '${testSpec.value}'`)
          .toBeTruthy();
        expect(element)
          .withContext('Selected the correct element')
          .toBe(selectorElementInstance);
      });
    });
  });
});
