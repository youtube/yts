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
  function checkCssProperties(
    categoryName: string,
    propsList: Array<{id: string; prop: string}>,
  ) {
    describe(categoryName, () => {
      propsList.forEach((item) => {
        yts.test({id: item.id});
        const prop = item.prop;
        it(prop, () => {
          checkCssProperty(prop);
        });
      });
    });
  }

  checkCssProperties('CSS Fundamentals', [
    {id: '15.4.1.1', prop: 'animation'},
    {id: '15.4.2.1', prop: 'bottom'},
    {id: '15.4.3.1', prop: 'box-shadow'},
    // 'caption-side', // DEPRECATED
    // 'clear', // DEPRECATED
    // 'clip', // DEPRECATED
    {id: '15.4.7.1', prop: 'color'},
    {id: '15.4.8.1', prop: 'content'},
    // 'counter-increment', // DEPRECATED
    // 'counter-reset', // DEPRECATED
    // 'cursor', // DEPRECATED
    // 'css-float', // DEPRECATED
    // 'direction', // DEPRECATED
    {id: '15.4.14.1', prop: 'display'},
    // 'empty-cells', // DEPRECATED
    // 'float', // DEPRECATED
    {id: '15.4.17.1', prop: 'height'},
    {id: '15.4.18.1', prop: 'left'},
    // 'letter-spacing', // DEPRECATED
    {id: '15.4.20.1', prop: 'line-height'},
    {id: '15.4.21.1', prop: 'max-height'},
    {id: '15.4.22.1', prop: 'max-width'},
    {id: '15.4.23.1', prop: 'min-height'},
    {id: '15.4.24.1', prop: 'min-width'},
    {id: '15.4.25.1', prop: 'opacity'},
    // 'orphans', // DEPRECATED
    {id: '15.4.27.1', prop: 'overflow'},
    {id: '15.4.28.1', prop: 'position'},
    // 'quotes', // DEPRECATED
    {id: '15.4.30.1', prop: 'right'},
    // 'size', // DEPRECATED
    // 'table-layout', // DEPRECATED
    {id: '15.4.33.1', prop: 'top'},
    {id: '15.4.34.1', prop: 'transform'},
    {id: '15.4.35.1', prop: 'transform-origin'},
    // 'unicode-bidi', // DEPRECATED
    {id: '15.4.37.1', prop: 'vertical-align'},
    {id: '15.4.38.1', prop: 'visibility'},
    {id: '15.4.39.1', prop: 'white-space'},
    // 'widows', // DEPRECATED
    {id: '15.4.41.1', prop: 'width'},
    // 'word-spacing', // DEPRECATED
    {id: '15.4.43.1', prop: 'z-index'},
  ]);

  checkCssProperties('Background', [
    {id: '15.2.1.1', prop: 'background'},
    // 'background-attachment', // DEPRECATED
    {id: '15.2.3.1', prop: 'background-color'},
    {id: '15.2.4.1', prop: 'background-image'},
    {id: '15.2.5.1', prop: 'background-position'},
    {id: '15.2.6.1', prop: 'background-repeat'},
    {id: '15.2.7.1', prop: 'background-size'},
  ]);

  checkCssProperties('Border', [
    {id: '15.3.1.1', prop: 'border'},
    // 'border-collapse', // DEPRECATED
    {id: '15.3.3.1', prop: 'border-color'},
    {id: '15.3.4.1', prop: 'border-left'},
    {id: '15.3.5.1', prop: 'border-left-color'},
    {id: '15.3.6.1', prop: 'border-left-style'},
    {id: '15.3.7.1', prop: 'border-left-width'},
    {id: '15.3.8.1', prop: 'border-right'},
    {id: '15.3.9.1', prop: 'border-right-color'},
    {id: '15.3.10.1', prop: 'border-right-style'},
    {id: '15.3.11.1', prop: 'border-right-width'},
    // 'border-spacing', // DEPRECATED
    {id: '15.3.13.1', prop: 'border-style'},
    {id: '15.3.14.1', prop: 'border-top'},
    {id: '15.3.15.1', prop: 'border-top-color'},
    {id: '15.3.16.1', prop: 'border-top-style'},
    {id: '15.3.17.1', prop: 'border-top-width'},
    {id: '15.3.18.1', prop: 'border-width'},
    {id: '15.3.19.1', prop: 'border-bottom'},
    {id: '15.3.20.1', prop: 'border-bottom-color'},
    {id: '15.3.21.1', prop: 'border-bottom-style'},
    {id: '15.3.22.1', prop: 'border-bottom-width'},
  ]);

  checkCssProperties('Font', [
    {id: '15.5.1.1', prop: 'font'},
    {id: '15.5.2.1', prop: 'font-family'},
    {id: '15.5.3.1', prop: 'font-size'},
    // 'font-stretch', // DEPRECATED
    {id: '15.5.5.1', prop: 'font-style'},
    // 'font-variant', // DEPRECATED
    {id: '15.5.7.1', prop: 'font-weight'},
  ]);

  /* DEPRECATED
  checkCssProperties('List Style', [
    {id: '15.6.1.1', prop: 'list-style'},
    {id: '15.6.2.1', prop: 'list-style-image'},
    {id: '15.6.3.1', prop: 'list-style-position'},
    {id: '15.6.4.1', prop: 'list-style-type'},
  ]);
  */

  checkCssProperties('Margin', [
    {id: '15.7.1.1', prop: 'margin'},
    {id: '15.7.2.1', prop: 'margin-left'},
    {id: '15.7.3.1', prop: 'margin-right'},
    {id: '15.7.4.1', prop: 'margin-top'},
    {id: '15.7.5.1', prop: 'margin-bottom'},
  ]);

  checkCssProperties('Outline', [
    {id: '15.8.1.1', prop: 'outline'},
    {id: '15.8.2.1', prop: 'outline-color'},
    {id: '15.8.3.1', prop: 'outline-style'},
    {id: '15.8.4.1', prop: 'outline-width'},
  ]);

  checkCssProperties('Padding', [
    {id: '15.9.1.1', prop: 'padding'},
    {id: '15.9.2.1', prop: 'padding-left'},
    {id: '15.9.3.1', prop: 'padding-right'},
    {id: '15.9.4.1', prop: 'padding-top'},
    {id: '15.9.5.1', prop: 'padding-bottom'},
  ]);

  /* DEPRECATED
  checkCssProperties('Page', [
    {id: '15.7.1.1', prop: 'page'},
    {id: '15.7.2.1', prop: 'page-break-after'},
    {id: '15.7.3.1', prop: 'page-break-before'},
    {id: '15.7.4.1', prop: 'page-break-inside'},
  ]);
  */

  checkCssProperties('Text', [
    {id: '15.11.1.1', prop: 'text-align'},
    {id: '15.11.2.1', prop: 'text-decoration'},
    {id: '15.11.3.1', prop: 'text-indent'},
    {id: '15.11.4.1', prop: 'text-overflow'},
    {id: '15.11.5.1', prop: 'text-shadow'},
    {id: '15.11.6.1', prop: 'text-transform'},
  ]);

  // Maintaining the original typo.
  checkCssProperties('Trasition', [
    {id: '15.12.1.1', prop: 'transition'},
    {id: '15.12.2.1', prop: 'transition-delay'},
    {id: '15.12.3.1', prop: 'transition-duration'},
    {id: '15.12.4.1', prop: 'transition-property'},
    {id: '15.12.5.1', prop: 'transition-timing-function'},
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

    const selectorTests: Array<{name: string; value: string; id: string}> = [
      {id: '15.14.7.1', name: 'Type selector', value: 'span'},
      {id: '15.14.4.1', name: 'ID selector', value: '#test4'},
      {id: '15.14.2.1', name: 'Class selector', value: '.test1'},
      {id: '15.14.5.1', name: 'Multiple Class selector', value: '.test1.test2'},
      {id: '15.14.3.1', name: 'Descendant selector', value: 'body * span'}, // Assuming #testArea is in body
      {id: '15.14.1.1', name: 'Child selector', value: '#testArea > span'}, // More specific than body > span
      {id: '15.14.8.1', name: 'Attribute selector', value: '[testattr=test3]'},
    ];

    selectorTests.forEach((testSpec) => {
      yts.test({id: testSpec.id});
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
