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

import {
  isGreaterThan4K,
  isGreaterThanFHDAndSmallerThanOrEqualTo4K,
} from 'google3/third_party/javascript/yts/test_utils/playback_util';

import {hasDomProperty} from 'google3/third_party/javascript/yts/test_utils/legacy_yts_utils';

interface MemoryInfo {
  readonly totalJSHeapSize: number;
  readonly usedJSHeapSize: number;
}

describe('DOM chardata, window & Miscellaneous Tests', () => {
  describe('CharacterData', () => {
    const specs = ['data'];
    specs.forEach((spec) => {
      it(`CharacterData.${spec}`, () => {
        const element = document.createTextNode('Test');
        expect(hasDomProperty(element, spec))
          .withContext(`CharacterData missing property '${spec}'.`)
          .toBe(true);
      });
    });
  });

  describe('NamedNodeMap', () => {
    const specs = [
      'getNamedItem',
      'item',
      'length',
      'removeNamedItem',
      'setNamedItem',
    ];
    specs.forEach((spec) => {
      it(`NamedNodeMap.${spec}`, () => {
        const element = document.documentElement.attributes;
        expect(hasDomProperty(element, spec))
          .withContext(`NamedNodeMap missing property '${spec}'.`)
          .toBe(true);
      });
    });
  });

  describe('Node', () => {
    const bodyNodeSpecs = [
      'appendChild',
      'attributes',
      'childNodes',
      'cloneNode',
      'firstChild',
      'hasChildNodes',
      'insertBefore',
      'lastChild',
      'nextSibling',
      'nodeName',
      'nodeType',
      'nodeValue',
      'ownerDocument',
      'parentNode',
      'previousSibling',
      'removeChild',
      'replaceChild',
    ];
    bodyNodeSpecs.forEach((spec) => {
      it(`Node.${spec}`, () => {
        expect(hasDomProperty(document.body, spec))
          .withContext(`Node missing property '${spec}' on document.body.`)
          .toBe(true);
      });
    });

    it('Node.getElementById', () => {
      expect(hasDomProperty(document, 'getElementById'))
        .withContext(`Node missing property 'getElementById' on document.`)
        .toBe(true);
    });

    const docElementSpecs = ['localName'];
    docElementSpecs.forEach((spec) => {
      it(`Node.${spec}`, () => {
        expect(hasDomProperty(document.documentElement, spec))
          .withContext(
            `Node missing property '${spec}' on document.documentElement.`,
          )
          .toBe(true);
      });
    });
  });

  describe('window', () => {
    const windowSpecs = [
      'addEventListener',
      'clearInterval',
      'clearTimeout',
      'location',
      'navigator',
      'close',
      'removeEventListener',
      'setInterval',
      'setTimeout',
    ];
    windowSpecs.forEach((spec) => {
      it(`window.${spec}`, () => {
        expect(hasDomProperty(window, spec))
          .withContext(`window missing property '${spec}'.`)
          .toBe(true);
      });
    });

    const eventSpecs = ['keydown', 'keypress', 'keyup'];
    eventSpecs.forEach((event) => {
      it(`window.${event}`, () => {
        expect('on' + event in window)
          .withContext(`window missing event 'on${event}'.`)
          .toBe(true);
      });
    });

    it('Window.onerror stack trace', (done) => {
      const errorHandler = (e: ErrorEvent) => {
        window.removeEventListener('error', errorHandler);
        if (e.lineno > 0 && e.colno === 36) {
          done();
        } else {
          done.fail(
            `Caught Error: line ${e.lineno} : colno ${e.colno}. ` +
              `Expected non-zero line and column 36.`,
          );
        }
      };
      window.addEventListener('error', errorHandler);

      setTimeout(() => {
        // Intentionally cause a ReferenceError to trigger the onerror handler.
        // This is expected to fail and be caught by the onerror handler.
        // tslint:disable-next-line:no-unused-expression no-any
        (window as any).nonExistentVariable.test;
      }, 500);
    });

    it('Window.devicePixelRatio', () => {
      let validDevicePixelRatios: number[];
      let hardwareDeviceCategory: string;
      if (isGreaterThan4K()) {
        hardwareDeviceCategory = '>4K';
        validDevicePixelRatios = [1, 4 / 3, 1.5, 2, 8 / 3, 3, 4];
      } else if (isGreaterThanFHDAndSmallerThanOrEqualTo4K()) {
        hardwareDeviceCategory = '>FHD & <=4K';
        validDevicePixelRatios = [1, 4 / 3, 1.5, 2];
      } else {
        hardwareDeviceCategory = '<=FHD';
        validDevicePixelRatios = [1, 1.5];
      }

      console.log(
        `Detected this is a '${hardwareDeviceCategory}' device based on ` +
          'Window size and isTypeSupported() responses.',
      );

      const actualRatio = window.devicePixelRatio;
      const isCloseEnough = validDevicePixelRatios.some(
        (ratio) => Math.abs(ratio - actualRatio) < 0.001,
      );
      yts.addMetric('device_pixel_ratio', actualRatio);

      expect(isCloseEnough)
        .withContext(
          `devicePixelRatio is ${actualRatio}, but must be one of ` +
            `[${validDevicePixelRatios.map((r) => r.toFixed(3)).toString()}]`,
        )
        .toBe(true);
    });
  });

  describe('Heap', () => {
    const memory = (window.performance as Performance & {memory: MemoryInfo})
      ?.memory;

    it('totalJSHeapSize', () => {
      if (!memory) {
        fail('performance.memory is not supported.');
        return;
      }
      yts.addMetric('total_js_heap_size', memory.totalJSHeapSize);
      expect(memory.totalJSHeapSize).toBeGreaterThan(0);
      expect(memory.totalJSHeapSize).toBeGreaterThanOrEqual(
        memory.usedJSHeapSize,
      );
    });

    it('usedJSHeapSize', () => {
      if (!memory) {
        fail('performance.memory is not supported.');
        return;
      }
      yts.addMetric('used_js_heap_size', memory.usedJSHeapSize);
      expect(memory.usedJSHeapSize).toBeGreaterThan(0);
      expect(memory.usedJSHeapSize).toBeLessThanOrEqual(memory.totalJSHeapSize);
    });
  });

  describe('Assorted', () => {
    it('NodeList.length', () => {
      expect(
        hasDomProperty(document.documentElement.childNodes, 'length'),
      ).toBe(true);
    });
    it('ProcessingInstruction.data', () => {
      expect(hasDomProperty(document.body.firstChild!, 'data')).toBe(true);
    });
    it('ViewCSS.getComputedStyle', () => {
      expect(hasDomProperty(window, 'getComputedStyle')).toBe(true);
    });
  });

  describe('CreateEvent', () => {
    it('UIEvents.initUIEvent', () => {
      const event = document.createEvent('UIEvents');
      expect(hasDomProperty(event, 'initUIEvent')).toBe(true);
    });
    it('MouseEvents.initMouseEvent', () => {
      const event = document.createEvent('MouseEvents');
      expect(hasDomProperty(event, 'initMouseEvent')).toBe(true);
    });
  });
});
