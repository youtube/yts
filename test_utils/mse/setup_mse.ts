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

import {objectUrlFromSafeSource, unwrapUrl} from 'safevalues';

import {Segment} from '../parsers/interfaces';
import {parseMp4} from '../parsers/mp4';
import {parseWebM} from '../parsers/webm';
import {StreamDef} from '../streams/media_streams';
import {XhrManager, XhrRequest} from '../xhr_manager';

function onError(failCallback: (msg: string) => void, e: Event) {
  const target = e.target as HTMLVideoElement;
  if (!target.error) {
    failCallback('Test failure: Error event without error object.');
    return;
  }
  switch (target.error.code) {
    case target.error.MEDIA_ERR_ABORTED:
      failCallback('Test failure: You aborted the video playback.');
      break;
    case target.error.MEDIA_ERR_NETWORK:
      failCallback(
        'Test failure: A network error caused the video' +
          ' download to fail part-way.',
      );
      break;
    case target.error.MEDIA_ERR_DECODE:
      failCallback(
        'Test failure: The video playback was aborted due to' +
          ' a corruption problem or because the video used' +
          ' features your browser did not support.',
      );
      break;
    case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
      failCallback(
        'Test failure: The video could not be loaded, either' +
          ' because the server or network failed or because the' +
          ' format is not supported.',
      );
      break;
    default:
      failCallback('Test failure: An unknown error occurred.');
      break;
  }
}

function fetchStream(
  xhrManager: XhrManager,
  stream: StreamDef,
  cb: (this: XhrRequest) => void,
  start: number,
  end: number,
) {
  const xhr = xhrManager.createRequest(stream.src, cb, start, end);
  xhr.send();
}

function appendLoop(
  xhrManager: XhrManager,
  failCallback: (msg: string) => void,
  stream: StreamDef,
  sb: SourceBuffer,
  maxSegments?: number,
) {
  let segmentIdx = 0;
  let currentMaxSegments = maxSegments || 4;

  fetchStream(
    xhrManager,
    stream,
    function () {
      let parsedData: Segment[];
      if (
        ['H264', 'AV1', 'AAC', 'AC3', 'EAC3', 'Iamf'].includes(stream.codec) ||
        (stream.codec === 'VP9' && stream.container === 'mp4')
      ) {
        parsedData = parseMp4(this.getResponseData());
      } else if (['VP9', 'Opus'].includes(stream.codec)) {
        const webmData = parseWebM(this.getResponseData().buffer, stream.size);
        parsedData = webmData || [];
      } else {
        failCallback('Unsupported codec in appendLoop.');
        return;
      }

      if (!parsedData) return;

      currentMaxSegments = Math.min(currentMaxSegments!, parsedData.length);

      fetchStream(
        xhrManager,
        stream,
        function () {
          sb.addEventListener('updateend', function append() {
            if (currentMaxSegments! - segmentIdx <= 0) {
              sb.removeEventListener('updateend', append);
              return;
            }
            fetchStream(
              xhrManager,
              stream,
              function () {
                const data = this.getResponseData();
                function appendData() {
                  try {
                    sb.appendBuffer(data);
                  } catch (error: unknown) {
                    if (
                      error instanceof DOMException &&
                      // Preserving this behavior from the ported code.
                      // tslint:disable-next-line:deprecation
                      error.code === DOMException.QUOTA_EXCEEDED_ERR
                    ) {
                      console.log('quota exceeded');
                      setTimeout(() => {
                        appendData();
                      }, 1000);
                      console.log(
                        // Preserving this behavior from the ported code.
                        // tslint:disable-next-line:deprecation
                        `unexpected error with error code: ${error.code}`,
                      );
                    }
                  }
                }
                appendData();
                segmentIdx += 1;
              },
              parsedData[segmentIdx].offset,
              parsedData[segmentIdx].size,
            );
          });
          sb.appendBuffer(this.getResponseData());
          segmentIdx += 1;
        },
        0,
        parsedData[0].size + parsedData[0].offset,
      );
    },
    0,
    32 * 1024,
  );
}

function onSourceOpen(
  ms: MediaSource,
  audioStreamsArray: StreamDef[],
  videoStreamsArray: StreamDef[],
  xhrManager: XhrManager,
  failCallback: (msg: string) => void,
  maxSegments?: number,
) {
  for (const audioStream of audioStreamsArray) {
    if (audioStream != null) {
      const sb = ms.addSourceBuffer(audioStream.mimetype);
      appendLoop(xhrManager, failCallback, audioStream, sb, maxSegments);
    }
  }

  for (const videoStream of videoStreamsArray) {
    if (videoStream != null) {
      const sb = ms.addSourceBuffer(videoStream.mimetype);
      appendLoop(xhrManager, failCallback, videoStream, sb, maxSegments);
    }
  }
}

function onStalled(e: Event) {
  console.log(
    'The user agent is trying to fetch media data, but data is unexpectedly not forthcoming.',
  );
  const target = e.target as HTMLVideoElement;
  console.log(`media readystate: ${target.readyState}`);
  console.log(`media networkState: ${target.networkState}`);
}

function onWaiting(e: Event) {
  console.log('Playback has stopped because the next frame is not available');
  const target = e.target as HTMLVideoElement;
  console.log(`media readystate: ${target.readyState}`);
  console.log(`media networkState: ${target.networkState}`);
}

function onPlaying(e: Event) {
  const video = e.target as HTMLVideoElement;
  video.addEventListener('stalled', onStalled);
  video.addEventListener('waiting', onWaiting);
}

/**
 * Sets up MSE for the given video and audio streams.
 * @param video The video element to attach to.
 * @param xhrManager The XhrManager instance.
 * @param failCallback Callback to report failures.
 * @param videoStreams The video streams to load.
 * @param audioStreams The audio streams to load.
 * @param maxSegments Maximum number of segments to load.
 * @param onErrorCallback Optional error callback.
 */
export function setupMse(
  video: HTMLVideoElement,
  xhrManager: XhrManager,
  failCallback: (msg: string) => void,
  videoStreams: StreamDef | StreamDef[],
  audioStreams: StreamDef | StreamDef[],
  maxSegments?: number,
  onErrorCallback?: (msg: string) => void,
): void {
  console.log('Setting up MSE');
  if (!Array.isArray(videoStreams)) {
    console.log(`videoStream=${videoStreams.mimetype}`);
  }
  if (!Array.isArray(audioStreams)) {
    console.log(`audioStream=${audioStreams.mimetype}`);
  }
  const videoStreamsArray =
    videoStreams instanceof Array ? videoStreams : [videoStreams];
  const audioStreamsArray =
    audioStreams instanceof Array ? audioStreams : [audioStreams];
  const ms = new MediaSource();

  ms.addEventListener('sourceopen', (e) => {
    onSourceOpen(
      ms,
      audioStreamsArray,
      videoStreamsArray,
      xhrManager,
      failCallback,
      maxSegments,
    );
  });

  video.addEventListener('error', (e) => {
    onError(onErrorCallback || failCallback, e);
  });
  video.addEventListener('playing', onPlaying);

  video.src = unwrapUrl(objectUrlFromSafeSource(ms));
  console.log('video.src=', video.src);
  video.load();
  console.log('MSE setup complete');
}
