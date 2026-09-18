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

// Define a union of all relevant CSSOM constructor types
type CssOMConstructor =
  | typeof CSSFontFaceRule
  | typeof CSSMediaRule
  | typeof CSSRule
  | typeof CSSRuleList
  | typeof CSSStyleDeclaration
  | typeof CSSStyleRule
  | typeof CSSStyleSheet;

// Helper function to find a CSSOM object of a given type.
function getCssInterfaceInstance(
  cssObjectType: CssOMConstructor,
): InstanceType<CssOMConstructor> | null {
  for (const sheet of Array.from(document.styleSheets) as CSSStyleSheet[]) {
    // Skip sheets that fail to load or have no rules (e.g. cross-origin),
    // unless we are specifically looking for a CSSStyleSheet instance.
    if (!sheet.cssRules && cssObjectType !== CSSStyleSheet) continue;

    // Case 1: The sheet itself is the type (e.g., CSSStyleSheet)
    if (sheet instanceof cssObjectType) {
      return sheet;
    }

    // Case 2: The sheet's cssRules collection is the type (e.g., CSSRuleList)
    if (sheet.cssRules && sheet.cssRules instanceof cssObjectType) {
      return sheet.cssRules;
    }

    if (sheet.cssRules) {
      for (const rule of Array.from(sheet.cssRules)) {
        // Case 3: A rule within the sheet is the type (e.g., CSSMediaRule, CSSStyleRule)
        if (rule instanceof cssObjectType) {
          return rule;
        }
        // Case 4: The style property of a rule is the type (e.g., CSSStyleDeclaration)
        // This is specific: if we're looking for CSSStyleDeclaration,
        // and the current rule is a CSSStyleRule, check its .style property.
        if (
          cssObjectType === CSSStyleDeclaration &&
          rule instanceof CSSStyleRule
        ) {
          if (rule.style) {
            // rule.style is an instance of CSSStyleDeclaration
            return rule.style;
          }
        }
      }
    }
  }
  return null;
}

interface DomCssTestSpec {
  id: string; // e.g., '17.1.1.1'
  name: string; // e.g., 'CSSFontFaceRule.style'
  cssObjectType: CssOMConstructor; // e.g., CSSFontFaceRule constructor
  attribute: string; // e.g., 'style'
}

function generateDomCssInterfaceTests(
  categoryName: string,
  specs: DomCssTestSpec[],
): void {
  describe(categoryName, () => {
    specs.forEach((spec) => {
      yts.test({id: spec.id});
      it(spec.name, () => {
        const testInstance = getCssInterfaceInstance(spec.cssObjectType);

        expect(testInstance)
          .withContext(
            `Failed to find an instance of ${spec.cssObjectType.name} for test "${spec.name}".`,
          )
          .not.toBeNull();

        if (testInstance) {
          expect(util.hasDomProperty(testInstance, spec.attribute))
            .withContext(
              `${spec.cssObjectType.name} instance found for "${spec.name}", but missing property '${spec.attribute}'.`,
            )
            .toBe(true);
        }
      });
    });
  });
}

describe('DOM CSS Tests', () => {
  let styleElement: HTMLStyleElement;

  beforeAll(() => {
    styleElement = document.createElement('style');
    styleElement.textContent = `
      @font-face {
        font-family: 'TestFont';
        src: url('test.woff'); /* Dummy URL */
      }
      @media screen and (min-width: 1px) { /* Media rule */
        body { /* Style rule inside media */
          color: blue;
        }
      }
      .test-class { /* Style rule */
        padding: 10px;
      }
      /* Comment rule (though not directly testable as an interface type here) */
    `;
    document.head.appendChild(styleElement);
  });

  afterAll(() => {
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  });

  generateDomCssInterfaceTests('CSS Font', [
    {
      id: '17.1.1.1',
      name: 'CSSFontFaceRule.style',
      cssObjectType: CSSFontFaceRule,
      attribute: 'style',
    },
  ]);

  generateDomCssInterfaceTests('CSS Media Rule', [
    {
      id: '17.3.1.1',
      name: 'CSSMediaRule.cssRules',
      cssObjectType: CSSMediaRule,
      attribute: 'cssRules',
    },
    {
      id: '17.3.3.1',
      name: 'CSSMediaRule.insertRule',
      cssObjectType: CSSMediaRule,
      attribute: 'insertRule',
    },
    {
      id: '17.3.4.1',
      name: 'CSSMediaRule.media',
      cssObjectType: CSSMediaRule,
      attribute: 'media',
    },
  ]);

  generateDomCssInterfaceTests('CSS Rule', [
    {id: '17.5.1.1', name: 'CSSRule.cssText', cssObjectType: CSSRule, attribute: 'cssText'},
    {
      id: '17.5.2.1',
      name: 'CSSRule.parentRule',
      cssObjectType: CSSRule,
      attribute: 'parentRule',
    },
    {
      id: '17.5.3.1',
      name: 'CSSRule.parentStyleSheet',
      cssObjectType: CSSRule,
      attribute: 'parentStyleSheet',
    },
  ]);

  generateDomCssInterfaceTests('CSS Rule List', [
    {id: '17.6.1.1', name: 'CSSRuleList.item', cssObjectType: CSSRuleList, attribute: 'item'},
    {
      id: '17.6.2.1',
      name: 'CSSRuleList.length',
      cssObjectType: CSSRuleList,
      attribute: 'length',
    },
  ]);

  generateDomCssInterfaceTests('CSS Style Declaration', [
    {
      id: '17.7.1.1',
      name: 'CSSStyleDeclaration.cssText',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'cssText',
    },
    {
      id: '17.7.4.1',
      name: 'CSSStyleDeclaration.getPropertyValue',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'getPropertyValue',
    },
    {
      id: '17.7.5.1',
      name: 'CSSStyleDeclaration.item',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'item',
    },
    {
      id: '17.7.6.1',
      name: 'CSSStyleDeclaration.length',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'length',
    },
    {
      id: '17.7.7.1',
      name: 'CSSStyleDeclaration.parentRule',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'parentRule',
    },
    {
      id: '17.7.8.1',
      name: 'CSSStyleDeclaration.removeProperty',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'removeProperty',
    },
    {
      id: '17.7.9.1',
      name: 'CSSStyleDeclaration.setProperty',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'setProperty',
    },
  ]);

  generateDomCssInterfaceTests('CSS Style Rule', [
    {
      id: '17.8.1.1',
      name: 'CSSStyleRule.selectorText',
      cssObjectType: CSSStyleRule,
      attribute: 'selectorText',
    },
    {
      id: '17.8.2.1',
      name: 'CSSStyleRule.style',
      cssObjectType: CSSStyleRule,
      attribute: 'style',
    },
  ]);

  generateDomCssInterfaceTests('CSS Style Sheet', [
    {
      id: '17.9.1.1',
      name: 'CSSStyleSheet.cssRules',
      cssObjectType: CSSStyleSheet,
      attribute: 'cssRules',
    },
    {
      id: '17.9.3.1',
      name: 'CSSStyleSheet.insertRule',
      cssObjectType: CSSStyleSheet,
      attribute: 'insertRule',
    },
  ]);
});
