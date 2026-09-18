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
    const specs = [{id: '19.1.2.1', spec: 'data'}];
    specs.forEach(({spec, id}) => {
      yts.test({id});
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
      {id: '19.2.1.1', spec: 'getNamedItem'},
      {id: '19.2.3.1', spec: 'item'},
      {id: '19.2.4.1', spec: 'length'},
      {id: '19.2.5.1', spec: 'removeNamedItem'},
      {id: '19.2.7.1', spec: 'setNamedItem'},
    ];
    specs.forEach(({spec, id}) => {
      yts.test({id});
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
      {id: '19.3.1.1', spec: 'appendChild'},
      {id: '19.3.2.1', spec: 'attributes'},
      {id: '19.3.3.1', spec: 'childNodes'},
      {id: '19.3.4.1', spec: 'cloneNode'},
      {id: '19.3.5.1', spec: 'firstChild'},
      {id: '19.3.7.1', spec: 'hasChildNodes'},
      {id: '19.3.8.1', spec: 'insertBefore'},
      {id: '19.3.9.1', spec: 'lastChild'},
      {id: '19.3.10.1', spec: 'nextSibling'},
      {id: '19.3.11.1', spec: 'nodeName'},
      {id: '19.3.12.1', spec: 'nodeType'},
      {id: '19.3.13.1', spec: 'nodeValue'},
      {id: '19.3.15.1', spec: 'ownerDocument'},
      {id: '19.3.16.1', spec: 'parentNode'},
      {id: '19.3.17.1', spec: 'previousSibling'},
      {id: '19.3.18.1', spec: 'removeChild'},
      {id: '19.3.19.1', spec: 'replaceChild'},
    ];
    bodyNodeSpecs.forEach(({spec, id}) => {
      yts.test({id});
      it(`Node.${spec}`, () => {
        expect(hasDomProperty(document.body, spec))
          .withContext(`Node missing property '${spec}' on document.body.`)
          .toBe(true);
      });
    });

    yts.test({id: '19.3.20.1'});
    it('Node.getElementById', () => {
      expect(hasDomProperty(document, 'getElementById'))
        .withContext(`Node missing property 'getElementById' on document.`)
        .toBe(true);
    });

    const docElementSpecs = [{id: '19.3.21.1', spec: 'localName'}];
    docElementSpecs.forEach(({spec, id}) => {
      yts.test({id});
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
      {id: '19.5.1.1', spec: 'addEventListener'},
      {id: '19.5.2.1', spec: 'clearInterval'},
      {id: '19.5.3.1', spec: 'clearTimeout'},
      {id: '19.5.4.1', spec: 'location'},
      {id: '19.5.5.1', spec: 'navigator'},
      {id: '19.5.6.1', spec: 'close'},
      {id: '19.5.7.1', spec: 'removeEventListener'},
      {id: '19.5.8.1', spec: 'setInterval'},
      {id: '19.5.9.1', spec: 'setTimeout'},
    ];
    windowSpecs.forEach(({spec, id}) => {
      yts.test({id});
      it(`window.${spec}`, () => {
        expect(hasDomProperty(window, spec))
          .withContext(`window missing property '${spec}'.`)
          .toBe(true);
      });
    });

    const eventSpecs = [
      {id: '19.5.10.1', event: 'keydown'},
      {id: '19.5.11.1', event: 'keypress'},
      {id: '19.5.12.1', event: 'keyup'},
    ];
    eventSpecs.forEach(({event, id}) => {
      yts.test({id});
      it(`window.${event}`, () => {
        expect('on' + event in window)
          .withContext(`window missing event 'on${event}'.`)
          .toBe(true);
      });
    });

    yts.test({id: '19.5.13.1'});
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

    yts.test({id: '19.5.14.1'});
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

    yts.test({id: '19.6.1.1'});
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

    yts.test({id: '19.6.2.1'});
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
    yts.test({id: '19.7.2.1'});
    it('NodeList.length', () => {
      expect(
        hasDomProperty(document.documentElement.childNodes, 'length'),
      ).toBe(true);
    });
    yts.test({id: '19.7.5.1'});
    it('ProcessingInstruction.data', () => {
      expect(hasDomProperty(document.body.firstChild!, 'data')).toBe(true);
    });
    yts.test({id: '19.7.9.1'});
    it('ViewCSS.getComputedStyle', () => {
      expect(hasDomProperty(window, 'getComputedStyle')).toBe(true);
    });
  });

  describe('CreateEvent', () => {
    yts.test({id: '19.8.1.1'});
    it('UIEvents.initUIEvent', () => {
      const event = document.createEvent('UIEvents');
      expect(hasDomProperty(event, 'initUIEvent')).toBe(true);
    });
    yts.test({id: '19.8.2.1'});
    it('MouseEvents.initMouseEvent', () => {
      const event = document.createEvent('MouseEvents');
      expect(hasDomProperty(event, 'initMouseEvent')).toBe(true);
    });
  });
});
