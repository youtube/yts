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

import {BaseStreamHandler} from './streaming/base_stream_handler';
import {StreamHandlerType, streamVideoByChunksV2} from './streaming/playback_mp4_stream';
import {StreamInfo} from './streams/interfaces';

describe('playback_mp4_stream', () => {
  it('rejects mainPromise when addSourceBuffer throws a synchronous DOMException', async () => {
    let createdMediaSource: MediaSource | undefined;
    const originalMediaSource = window.MediaSource;

    class MockMediaSource extends EventTarget {
      readyState = 'open';
      constructor() {
        super();
        createdMediaSource = this as unknown as MediaSource;
      }
      addSourceBuffer(mime: string): SourceBuffer {
        throw new DOMException('Mock QuotaExceededError', 'QuotaExceededError');
      }
      endOfStream(error?: string) {}
    }

    (window as unknown as {MediaSource: unknown}).MediaSource = MockMediaSource;

    try {
      const mockVideoElement = document.createElement('video');
      const videoInfo: StreamInfo = {
        mimetype: 'video/mp4; codecs="avc1.42E01E"',
        src: 'http://example.com/test.mp4',
        fileSize: 1024,
      };

      const streamPromise = streamVideoByChunksV2(
          mockVideoElement, StreamHandlerType.MP4, videoInfo);

      expect(createdMediaSource).toBeDefined();
      createdMediaSource!.dispatchEvent(new Event('sourceopen'));

      await expectAsync(streamPromise).toBeRejected();
    } finally {
      (window as unknown as {MediaSource: unknown}).MediaSource = originalMediaSource;
    }
  });

  it('forwards targetBufferDepth option to BaseStreamHandler', async () => {
    let createdMediaSource: MediaSource | undefined;
    const originalMediaSource = window.MediaSource;
    const win = window as unknown as {
      MediaSource: unknown;
      yts?: {getFlag?: (name: string) => string};
    };
    const originalYts = win.yts;
    win.yts = {...originalYts, getFlag: () => 'true'};
    let capturedTargetBufferDepth: number | undefined;

    spyOn(BaseStreamHandler.prototype, 'handleStreaming').and.callFake(function(
        this: BaseStreamHandler & {targetBufferDepth?: number},
    ) {
      capturedTargetBufferDepth = this.targetBufferDepth;
      return Promise.resolve();
    });

    class MockMediaSource extends originalMediaSource {
      override get readyState(): ReadyState {
        return 'open';
      }
      constructor() {
        super();
        createdMediaSource = this;
      }
      override addSourceBuffer(mime: string): SourceBuffer {
        return {} as unknown as SourceBuffer;
      }
      override endOfStream(error?: EndOfStreamError) {}
    }

    win.MediaSource = MockMediaSource;

    try {
      const mockVideoElement = document.createElement('video');
      const videoInfo: StreamInfo = {
        mimetype: 'video/mp4; codecs="avc1.42E01E"',
        src: 'http://example.com/test.mp4',
        fileSize: 1024,
      };

      const streamPromise = streamVideoByChunksV2(
          mockVideoElement,
          StreamHandlerType.BASE,
          videoInfo,
          undefined,
          undefined,
          undefined,
          {disableTunnel: true, targetBufferDepth: 45},
      );

      expect(createdMediaSource).toBeDefined();
      createdMediaSource!.dispatchEvent(new Event('sourceopen'));

      await streamPromise;
      expect(capturedTargetBufferDepth).toBe(45);
    } finally {
      win.MediaSource = originalMediaSource;
      win.yts = originalYts;
    }
  });
});
