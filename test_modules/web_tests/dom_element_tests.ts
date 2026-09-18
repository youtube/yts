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

describe('HTML DOM Element Tests', () => {
  describe('Element', () => {
    yts.test({id: '16.1.1.1'});
    it('Unknown Element', () => {
      const element = document.createElement('UNKNOWN');
      expect(element instanceof HTMLUnknownElement).toBeTrue();
    });

    // List of elements and their corresponding test names and IDs.
    const elementsToTest: {[key: string]: {tag: string; id: string}} = {
      'Anchor': {id: '16.1.2.1', tag: 'a'},
      'Body': {id: '16.1.8.1', tag: 'body'},
      'BR': {id: '16.1.9.1', tag: 'br'},
      'Div': {id: '16.1.14.1', tag: 'div'},
      'Head': {id: '16.1.21.1', tag: 'head'},
      'Heading 1': {id: '16.1.22.1', tag: 'h1'},
      'Heading 2': {id: '16.1.23.1', tag: 'h2'},
      'Heading 3': {id: '16.1.24.1', tag: 'h3'},
      'HTML': {id: '16.1.26.1', tag: 'html'},
      'Image': {id: '16.1.29.1', tag: 'img'},
      'Link': {id: '16.1.34.1', tag: 'link'},
      'Meta': {id: '16.1.38.1', tag: 'meta'},
      'Paragraph': {id: '16.1.43.1', tag: 'p'},
      'Script': {id: '16.1.47.1', tag: 'script'},
      'Span': {id: '16.1.49.1', tag: 'span'},
      'Style': {id: '16.1.50.1', tag: 'style'},
      'Title': {id: '16.1.61.1', tag: 'title'},
      'Video': {id: '16.1.63.1', tag: 'video'},
    };

    for (const testName of Object.keys(elementsToTest)) {
      const {tag, id} = elementsToTest[testName];
      yts.test({id});
      it(`${testName} Element`, () => {
        const element = document.createElement(tag);
        expect(element instanceof HTMLUnknownElement).toBeFalse();
      });
    }

    // Special case for the <audio> element.
    yts.test({id: '16.1.3.1'});
    it('Audio Element', () => {
      const audio = document.createElement('audio') as HTMLAudioElement;
      expect(audio instanceof HTMLUnknownElement).toBeFalse();
      // The presence of the canPlayType method is a key indicator of a
      // functional HTMLAudioElement.
      expect(typeof audio.canPlayType).toBe('function');
    });
  });

  describe('Video', () => {
    let videoElement: HTMLVideoElement;

    beforeEach(() => {
      videoElement = document.createElement('video');
    });

    yts.test({id: '16.2.1.1'});
    it('video.height', () => {
      expect(videoElement.height).toBe(0);
      videoElement.height = 1080;
      expect(videoElement.height).toBe(1080);
    });

    yts.test({id: '16.2.2.1'});
    it('video.width', () => {
      expect(videoElement.width).toBe(0);
      videoElement.width = 1920;
      expect(videoElement.width).toBe(1920);
    });

    yts.test({id: '16.2.3.1'});
    it('video.videoHeight', () => {
      expect(videoElement.videoHeight).toBe(0);
      try {
        // This assignment should fail silently or throw in strict mode.
        (videoElement as {videoHeight: number}).videoHeight = 1080;
      } catch (e) {
        // Error is expected in strict mode.
      }
      expect(videoElement.videoHeight)
        .withContext('videoHeight should not have changed')
        .toBe(0);
    });

    yts.test({id: '16.2.4.1'});
    it('video.videoWidth', () => {
      expect(videoElement.videoWidth).toBe(0);
      try {
        (videoElement as {videoWidth: number}).videoWidth = 1920;
      } catch (e) {
        // Error is expected in strict mode.
      }
      expect(videoElement.videoWidth)
        .withContext('videoWidth should not have changed')
        .toBe(0);
    });
  });

  describe('Attribute', () => {
    let testArea: HTMLDivElement;
    let attrElement: HTMLDivElement;

    beforeEach(() => {
      // Create a container for the test element to avoid polluting the body.
      testArea = document.createElement('div');
      testArea.id = 'testArea';
      document.body.appendChild(testArea);

      attrElement = document.createElement('div');
      attrElement.className = 'attr-class';
      attrElement.id = 'attr-test';
      testArea.appendChild(attrElement);
    });

    afterEach(() => {
      // Clean up the DOM by removing the container and its children.
      if (testArea && testArea.parentNode) {
        testArea.parentNode.removeChild(testArea);
      }
    });

    yts.test({id: '16.3.1.1'});
    it('Attr.name', () => {
      const idAttr = attrElement.attributes.getNamedItem('id');
      expect(idAttr).not.toBeNull();
      expect(idAttr!.name).toBe('id');
    });

    yts.test({id: '16.3.4.1'});
    it('Attr.value', () => {
      const classAttr = attrElement.attributes.getNamedItem('class');
      expect(classAttr).not.toBeNull();
      expect(classAttr!.value).toBe('attr-class');
    });
  });
});
