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
    const props = [{id: '18.1.1.1', prop: 'createDocument'}];
    for (const {prop, id} of props) {
      yts.test({id});
      it(`DOMImplementation.${prop}`, () => {
        checkDomProperty('DOM Implementation', element, prop);
      });
    }
  });

  describe('Document', () => {
    const element = document;
    const props = [
      {id: '18.2.4.1', prop: 'createComment'},
      {id: '18.2.6.1', prop: 'createElement'},
      {id: '18.2.7.1', prop: 'createElementNS'},
      {id: '18.2.9.1', prop: 'createTextNode'},
      {id: '18.2.11.1', prop: 'documentElement'},
      {id: '18.2.12.1', prop: 'getElementById'},
      {id: '18.2.13.1', prop: 'getElementsByTagName'},
      {id: '18.2.15.1', prop: 'implementation'},
      {id: '18.2.17.1', prop: 'createEvent'},
      {id: '18.2.18.1', prop: 'styleSheets'},
    ];
    for (const {prop, id} of props) {
      yts.test({id});
      it(`Document.${prop}`, () => {
        checkDomProperty('Document', element, prop);
      });
    }
  });

  describe('Element', () => {
    const element = document.body;
    const props = [
      {id: '18.4.1.1', prop: 'getAttribute'},
      {id: '18.4.2.1', prop: 'getAttributeNS'},
      {id: '18.4.5.1', prop: 'getElementsByTagName'},
      {id: '18.4.7.1', prop: 'hasAttribute'},
      {id: '18.4.8.1', prop: 'hasAttributeNS'},
      {id: '18.4.9.1', prop: 'removeAttribute'},
      {id: '18.4.12.1', prop: 'setAttribute'},
      {id: '18.4.16.1', prop: 'tagName'},
      {id: '18.4.17.1', prop: 'style'},
    ];
    for (const {prop, id} of props) {
      yts.test({id});
      it(`Element.${prop}`, () => {
        checkDomProperty('Element', element, prop);
      });
    }
  });

  describe('Event', () => {
    const videoElement = document.createElement('video');
    const videoEvents = [
      {id: '18.5.3.1', eventName: 'loadeddata'},
      {id: '18.5.4.1', eventName: 'loadedmetadata'},
      {id: '18.5.5.1', eventName: 'loadstart'},
      {id: '18.5.6.1', eventName: 'pause'},
      {id: '18.5.7.1', eventName: 'play'},
      {id: '18.5.8.1', eventName: 'playing'},
      {id: '18.5.9.1', eventName: 'progress'},
      {id: '18.5.10.1', eventName: 'seeked'},
      {id: '18.5.11.1', eventName: 'seeking'},
      {id: '18.5.14.1', eventName: 'timeupdate'},
      {id: '18.5.15.1', eventName: 'waiting'},
    ];
    for (const {eventName, id} of videoEvents) {
      yts.test({id});
      it(`Event.${eventName}`, () => {
        checkEventExistence('video', videoElement, eventName);
      });
    }

    yts.test({id: '18.5.16.1'});
    it(`Event.error`, () => {
      checkEventExistence('window', window, 'error');
    });

    const eventObj = document.createEvent('Event');
    const eventProps = [
      {id: '18.5.17.1', prop: 'preventDefault'},
      {id: '18.5.18.1', prop: 'stopPropagation'},
    ];
    for (const {prop, id} of eventProps) {
      yts.test({id});
      it(`Event.${prop}`, () => {
        checkDomProperty('Event', eventObj, prop);
      });
    }

    yts.test({id: '18.5.19.1'});
    it(`Event.initEvent`, () => {
      // Preserving this test as-is from its original definition in JS.
      // tslint:disable-next-line:deprecation
      if (document.createEvent('Events').initEvent == null) {
        fail('Event.initEvent not supported');
      }
    });
  });

  describe('EventTarget', () => {
    const props = [
      {id: '18.6.1.1', prop: 'addEventListener'},
      {id: '18.6.2.1', prop: 'dispatchEvent'},
      {id: '18.6.3.1', prop: 'removeEventListener'},
    ];
    for (const {prop, id} of props) {
      yts.test({id});
      it(`EventTarget.${prop}`, () => {
        checkDomProperty('EventTarget', document.body, prop);
      });
    }
  });

  describe('HTMLAnchorElement', () => {
    yts.test({id: '18.7.1.1'});
    it(`HTMLAnchorElement.focus`, () => {
      checkDomProperty(
        'HTMLAnchorElement',
        document.createElement('a'),
        'focus',
      );
    });
  });

  describe('HTML Document', () => {
    yts.test({id: '18.8.1.1'});
    it(`HTMLDocument.body`, () => {
      checkDomProperty('HTML Document', document, 'body');
    });
    yts.test({id: '18.8.2.1'});
    it(`HTMLDocument.cookie`, () => {
      checkDomProperty('HTML Document', document, 'cookie');
    });

    const bodyEvents = [
      {id: '18.8.3.1', evt: 'blur'},
      {id: '18.8.4.1', evt: 'focus'},
      {id: '18.8.5.1', evt: 'load'},
    ];
    for (const {evt, id} of bodyEvents) {
      yts.test({id});
      it(`HTMLDocument.${evt}`, () => {
        checkEventExistence('document.body', document.body, evt);
      });
    }

    yts.test({id: '18.8.6.1'});
    it(`HTMLDocument.resize`, () => {
      checkEventExistence('window', window, 'resize');
    });
  });

  describe('HTML Element', () => {
    const props = [
      {id: '18.9.1.1', prop: 'className'},
      {id: '18.9.2.1', prop: 'getBoundingClientRect'},
      {id: '18.9.3.1', prop: 'id'},
      {id: '18.9.4.1', prop: 'innerHTML'},
      {id: '18.9.5.1', prop: 'nodeName'},
      {id: '18.9.6.1', prop: 'nodeType'},
      {id: '18.9.7.1', prop: 'style'},
      {id: '18.9.8.1', prop: 'textContent'},
    ];
    for (const {prop, id} of props) {
      yts.test({id});
      it(`HTMLElement.${prop}`, () => {
        checkDomProperty('HTML Element', document.body, prop);
      });
    }
  });

  describe('HTML Input Element', () => {
    yts.test({id: '18.11.1.1'});
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
      {id: '18.12.1.1', prop: 'canPlayType'},
      {id: '18.12.2.1', prop: 'autoplay'},
      {id: '18.12.3.1', prop: 'load'},
      {id: '18.12.4.1', prop: 'pause'},
      {id: '18.12.5.1', prop: 'play'},
      {id: '18.12.6.1', prop: 'muted'},
      {id: '18.12.7.1', prop: 'volume'},
      {id: '18.12.8.1', prop: 'currentTime'},
      {id: '18.12.9.1', prop: 'duration'},
      {id: '18.12.10.1', prop: 'buffered'},
      {id: '18.12.11.1', prop: 'paused'},
      {id: '18.12.12.1', prop: 'ended'},
    ];
    for (const {prop, id} of props) {
      yts.test({id});
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
    yts.test({id: '18.13.1.1'});
    it(`HTMLSelectElement.focus`, () => {
      checkDomProperty(
        'HTML Select Element',
        document.createElement('select'),
        'focus',
      );
    });
  });
});
