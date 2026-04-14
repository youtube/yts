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
      name: 'CSSFontFaceRule.style',
      cssObjectType: CSSFontFaceRule,
      attribute: 'style',
    },
  ]);

  generateDomCssInterfaceTests('CSS Media Rule', [
    {
      name: 'CSSMediaRule.cssRules',
      cssObjectType: CSSMediaRule,
      attribute: 'cssRules',
    },
    {
      name: 'CSSMediaRule.insertRule',
      cssObjectType: CSSMediaRule,
      attribute: 'insertRule',
    },
    {
      name: 'CSSMediaRule.media',
      cssObjectType: CSSMediaRule,
      attribute: 'media',
    },
  ]);

  generateDomCssInterfaceTests('CSS Rule', [
    {name: 'CSSRule.cssText', cssObjectType: CSSRule, attribute: 'cssText'},
    {
      name: 'CSSRule.parentRule',
      cssObjectType: CSSRule,
      attribute: 'parentRule',
    },
    {
      name: 'CSSRule.parentStyleSheet',
      cssObjectType: CSSRule,
      attribute: 'parentStyleSheet',
    },
  ]);

  generateDomCssInterfaceTests('CSS Rule List', [
    {name: 'CSSRuleList.item', cssObjectType: CSSRuleList, attribute: 'item'},
    {
      name: 'CSSRuleList.length',
      cssObjectType: CSSRuleList,
      attribute: 'length',
    },
  ]);

  generateDomCssInterfaceTests('CSS Style Declaration', [
    {
      name: 'CSSStyleDeclaration.cssText',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'cssText',
    },
    {
      name: 'CSSStyleDeclaration.getPropertyValue',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'getPropertyValue',
    },
    {
      name: 'CSSStyleDeclaration.item',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'item',
    },
    {
      name: 'CSSStyleDeclaration.length',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'length',
    },
    {
      name: 'CSSStyleDeclaration.parentRule',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'parentRule',
    },
    {
      name: 'CSSStyleDeclaration.removeProperty',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'removeProperty',
    },
    {
      name: 'CSSStyleDeclaration.setProperty',
      cssObjectType: CSSStyleDeclaration,
      attribute: 'setProperty',
    },
  ]);

  generateDomCssInterfaceTests('CSS Style Rule', [
    {
      name: 'CSSStyleRule.selectorText',
      cssObjectType: CSSStyleRule,
      attribute: 'selectorText',
    },
    {
      name: 'CSSStyleRule.style',
      cssObjectType: CSSStyleRule,
      attribute: 'style',
    },
  ]);

  generateDomCssInterfaceTests('CSS Style Sheet', [
    {
      name: 'CSSStyleSheet.cssRules',
      cssObjectType: CSSStyleSheet,
      attribute: 'cssRules',
    },
    {
      name: 'CSSStyleSheet.insertRule',
      cssObjectType: CSSStyleSheet,
      attribute: 'insertRule',
    },
  ]);
});
