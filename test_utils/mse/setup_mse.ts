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

import {createMediaSourceUrl} from 'google3/third_party/javascript/yts/test_utils/playback_util';
import * as mp4Stream from 'google3/third_party/javascript/yts/test_utils/streaming/playback_mp4_stream';
import {StreamPromise, toStreamPromise} from 'google3/third_party/javascript/yts/test_utils/streaming/stream_promise';
import type {StreamDef} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';


const BUFFER_SAFETY_MARGIN_SEC = 5;
const MP4_CODECS = ['H264', 'AV1', 'AAC', 'AC3', 'EAC3', 'Iamf'];

/**
 * Sets up MSE using the modern playback stream and mp4 stream handlers.
 *
 * @param video The HTMLVideoElement to configure for playback.
 * @param videoStream The video stream definition (can be null for audio-only).
 * @param audioStream The audio stream definition (can be null for video-only).
 * @param stopTime The target time in seconds where buffering should stop.
 * @param numVideoStreams Optional times to duplicate the video stream.
 * @param onSourceObjects Optional callback for MediaSource and SourceBuffer
 *     objects.
 */
export function setupMse(
    video: HTMLVideoElement,
    videoStream: StreamDef|null,
    audioStream: StreamDef|null,
    stopTime = 15,
    numVideoStreams = 1,
    onSourceObjects?: (
        ms: MediaSource,
        videoSbs: SourceBuffer[],
        audioSb?: SourceBuffer,
        ) => void,
    ): StreamPromise<void> {
  if (!videoStream) {
    if (!audioStream) {
      return toStreamPromise(
          Promise.reject(new Error('At least one stream must be provided!')));
    }
    video.src = createMediaSourceUrl([audioStream]);
    return toStreamPromise(Promise.resolve());
  }

  const infoList = [];
  for (let i = 0; i < numVideoStreams; i++) {
    infoList.push(videoStream);
  }

  const isMp4 =
      videoStream.container === 'mp4' || MP4_CODECS.includes(videoStream.codec);
  const handlerType = isMp4 ? mp4Stream.StreamHandlerType.MP4 :
                              mp4Stream.StreamHandlerType.BASE;

  return mp4Stream.streamVideoByChunksV2(
      video,
      handlerType,
      infoList,
      audioStream ?? undefined,
      stopTime + BUFFER_SAFETY_MARGIN_SEC,
      onSourceObjects,
  );
}
