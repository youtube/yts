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

import * as util from 'google3/third_party/javascript/yts/test_utils/legacy_yts_utils';
import 'jasmine';

describe('DOM Document Tests', () => {
  function checkDomProperty(
    category: string,
    element: object,
    property: string,
  ) {
    const name = `${category.replace(/\s/g, '')}.${property}`;
    console.log(`Testing whether ${element} supports ${property}`);
    if (!util.hasDomProperty(element, property)) {
      fail(`Failed: ${name}.`);
    }
  }

  function checkEventExistence(
    elementName: string,
    element: EventTarget,
    eventName: string,
  ) {
    if (!('on' + eventName in element)) {
      fail(
        `Failed: Event listener "on${eventName}" not found on element ${elementName}.`,
      );
    }
  }

  describe('DOM Implementation', () => {
    const element = document.implementation;
    const props = ['createDocument'];
    for (const prop of props) {
      it(`DOMImplementation.${prop}`, () => {
        checkDomProperty('DOM Implementation', element, prop);
      });
    }
  });

  describe('Document', () => {
    const element = document;
    const props = [
      'createComment',
      'createElement',
      'createElementNS',
      'createTextNode',
      'documentElement',
      'getElementById',
      'getElementsByTagName',
      'implementation',
      'createEvent',
      'styleSheets',
    ];
    for (const prop of props) {
      it(`Document.${prop}`, () => {
        checkDomProperty('Document', element, prop);
      });
    }
  });

  describe('Element', () => {
    const element = document.body;
    const props = [
      'getAttribute',
      'getAttributeNS',
      'getElementsByTagName',
      'hasAttribute',
      'hasAttributeNS',
      'removeAttribute',
      'setAttribute',
      'tagName',
      'style',
    ];
    for (const prop of props) {
      it(`Element.${prop}`, () => {
        checkDomProperty('Element', element, prop);
      });
    }
  });

  describe('Event', () => {
    const videoElement = document.createElement('video');
    const videoEvents = [
      'loadeddata',
      'loadedmetadata',
      'loadstart',
      'pause',
      'play',
      'playing',
      'progress',
      'seeked',
      'seeking',
      'timeupdate',
      'waiting',
    ];
    for (const eventName of videoEvents) {
      it(`Event.${eventName}`, () => {
        checkEventExistence('video', videoElement, eventName);
      });
    }

    it(`Event.error`, () => {
      checkEventExistence('window', window, 'error');
    });

    const eventObj = document.createEvent('Event');
    const eventProps = ['preventDefault', 'stopPropagation'];
    for (const prop of eventProps) {
      it(`Event.${prop}`, () => {
        checkDomProperty('Event', eventObj, prop);
      });
    }

    it(`Event.initEvent`, () => {
      // Preserving this test as-is from its original definition in JS.
      // tslint:disable-next-line:deprecation
      if (document.createEvent('Events').initEvent == null) {
        fail('Event.initEvent not supported');
      }
    });
  });

  describe('EventTarget', () => {
    const props = ['addEventListener', 'dispatchEvent', 'removeEventListener'];
    for (const prop of props) {
      it(`EventTarget.${prop}`, () => {
        checkDomProperty('EventTarget', document.body, prop);
      });
    }
  });

  describe('HTMLAnchorElement', () => {
    it(`HTMLAnchorElement.focus`, () => {
      checkDomProperty(
        'HTMLAnchorElement',
        document.createElement('a'),
        'focus',
      );
    });
  });

  describe('HTML Document', () => {
    it(`HTMLDocument.body`, () => {
      checkDomProperty('HTML Document', document, 'body');
    });
    it(`HTMLDocument.cookie`, () => {
      checkDomProperty('HTML Document', document, 'cookie');
    });

    const bodyEvents = ['blur', 'focus', 'load'];
    for (const evt of bodyEvents) {
      it(`HTMLDocument.${evt}`, () => {
        checkEventExistence('document.body', document.body, evt);
      });
    }

    it(`HTMLDocument.resize`, () => {
      checkEventExistence('window', window, 'resize');
    });
  });

  describe('HTML Element', () => {
    const props = [
      'className',
      'getBoundingClientRect',
      'id',
      'innerHTML',
      'nodeName',
      'nodeType',
      'style',
      'textContent',
    ];
    for (const prop of props) {
      it(`HTMLElement.${prop}`, () => {
        checkDomProperty('HTML Element', document.body, prop);
      });
    }
  });

  describe('HTML Input Element', () => {
    it(`HTMLInputElement.focus`, () => {
      checkDomProperty(
        'HTML Input Element',
        document.createElement('input'),
        'focus',
      );
    });
  });

  describe('HTML Media Element', () => {
    const props = [
      'canPlayType',
      'autoplay',
      'load',
      'pause',
      'play',
      'muted',
      'volume',
      'currentTime',
      'duration',
      'buffered',
      'paused',
      'ended',
    ];
    for (const prop of props) {
      it(`HTMLMediaElement.${prop}`, () => {
        checkDomProperty(
          'HTML Media Element',
          document.createElement('video'),
          prop,
        );
      });
    }
  });

  describe('HTML Select Element', () => {
    it(`HTMLSelectElement.focus`, () => {
      checkDomProperty(
        'HTML Select Element',
        document.createElement('select'),
        'focus',
      );
    });
  });
});
