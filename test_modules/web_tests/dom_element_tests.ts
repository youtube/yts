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
    it('Unknown Element', () => {
      const element = document.createElement('UNKNOWN');
      expect(element instanceof HTMLUnknownElement).toBeTrue();
    });

    // List of elements and their corresponding test names.
    const elementsToTest: {[key: string]: string} = {
      'Anchor': 'a',
      'Body': 'body',
      'BR': 'br',
      'Div': 'div',
      'Head': 'head',
      'Heading 1': 'h1',
      'Heading 2': 'h2',
      'Heading 3': 'h3',
      'HTML': 'html',
      'Image': 'img',
      'Link': 'link',
      'Meta': 'meta',
      'Paragraph': 'p',
      'Script': 'script',
      'Span': 'span',
      'Style': 'style',
      'Title': 'title',
      'Video': 'video',
    };

    for (const testName of Object.keys(elementsToTest)) {
      it(`${testName} Element`, () => {
        const tag = elementsToTest[testName];
        const element = document.createElement(tag);
        expect(element instanceof HTMLUnknownElement).toBeFalse();
      });
    }

    // Special case for the <audio> element.
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

    it('video.height', () => {
      expect(videoElement.height).toBe(0);
      videoElement.height = 1080;
      expect(videoElement.height).toBe(1080);
    });

    it('video.width', () => {
      expect(videoElement.width).toBe(0);
      videoElement.width = 1920;
      expect(videoElement.width).toBe(1920);
    });

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

    it('Attr.name', () => {
      const idAttr = attrElement.attributes.getNamedItem('id');
      expect(idAttr).not.toBeNull();
      expect(idAttr!.name).toBe('id');
    });

    it('Attr.value', () => {
      const classAttr = attrElement.attributes.getNamedItem('class');
      expect(classAttr).not.toBeNull();
      expect(classAttr!.value).toBe('attr-class');
    });
  });
});
