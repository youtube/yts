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

import type {StreamInfo} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';
import {objectUrlFromSafeSource, unwrapUrl} from 'safevalues';

import {BaseStreamHandler} from './base_stream_handler';
import {Mp4StreamHandler} from './mp4_stream_handler';
import {StreamPromise, toStreamPromise} from './stream_promise';
import {appendContentToBuffer, logError} from './stream_utils';



/** Streaming handler format indicators. */
export enum StreamHandlerType {
  MP4 = 'mp4',
  BASE = 'base',
}

const STREAM_HANDLER_MAP = {
  [StreamHandlerType.MP4]: Mp4StreamHandler,
  [StreamHandlerType.BASE]: BaseStreamHandler,
};



/**
 * Processes streams continuously through generic setups.
 *
 * @param videoElement Underlying media target node.
 * @param handlerType Specific routing handler enum descriptor.
 * @param videoInfoOrInfos Video data parameters.
 * @param audioInfo Optional audio stream configuration.
 * @param stopTime Point where streaming terminates.
 * @param onSourceObjects Lifecycle callback execution handler.
 * @return Future resolving after processing sequences finalized.
 */
export function streamVideoByChunksV2(
    videoElement: HTMLVideoElement,
    handlerType: StreamHandlerType,
    videoInfoOrInfos: StreamInfo|StreamInfo[],
    audioInfo?: StreamInfo,
    stopTime?: number,
    onSourceObjects?: (
        ms: MediaSource,
        videoSbs: SourceBuffer[],
        audioSb?: SourceBuffer,
        ) => void,
    ): StreamPromise<void> {
  let isStopped = false;
  const activeHandlers: BaseStreamHandler[] = [];

  const mainPromise = new Promise<void>((resolve) => {
    console.log(`Streaming ${handlerType} video by chunks`);
    const HandlerClass = STREAM_HANDLER_MAP[handlerType];
    const mediaSource = new MediaSource();
    const videoInfos =
        Array.isArray(videoInfoOrInfos) ? videoInfoOrInfos : [videoInfoOrInfos];

    mediaSource.addEventListener(
        'sourceopen',
        async () => {
          if (isStopped) {
            resolve();
            return;
          }

          const audioSb = audioInfo ?
              mediaSource.addSourceBuffer(audioInfo.mimetype) :
              undefined;
          const audioPromise = audioSb ?
              appendContentToBuffer(audioSb, audioInfo!.src) :
              Promise.resolve();


          const videoSbs: SourceBuffer[] = [];
          const videoPromises: Array<Promise<void>> = [];

          for (const videoInfo of videoInfos) {
            if (!videoInfo) continue;
            const videoSb = mediaSource.addSourceBuffer(videoInfo.mimetype);
            videoSbs.push(videoSb);
            const videoHandler = new HandlerClass(
                videoElement,
                videoInfo,
                videoSb,
                mediaSource,
                stopTime,
            );
            activeHandlers.push(videoHandler);
            videoPromises.push(videoHandler.handleStreaming());
          }

          if (onSourceObjects) {
            onSourceObjects(mediaSource, videoSbs, audioSb);
          }

          // Handle case where stop() was called in the async gap before
          // sourceopen finished
          if (isStopped) {
            for (const h of activeHandlers) h.stop();
          }

          try {
            await Promise.all([audioPromise, ...videoPromises]);
            console.log(`All streaming promises for ${handlerType} resolved`);
            if (mediaSource.readyState === 'open') mediaSource.endOfStream();
          } catch (e) {
            logError(e, `streamVideoByChunksV2 Promise.all (${handlerType})`);
            if (mediaSource.readyState === 'open') {
              mediaSource.endOfStream('network');
            }
          }

          resolve();
        },
        {once: true},
    );

    videoElement.src = unwrapUrl(objectUrlFromSafeSource(mediaSource));
  });

  // Allow external callers to stop the streaming loop.
  return toStreamPromise(mainPromise, () => {
    isStopped = true;
    for (const handler of activeHandlers) {
      handler.stop();
    }
  });
}
