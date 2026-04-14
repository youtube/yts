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
import {Mp4StreamHandler} from './mp4_stream_handler';
import {StreamInfo, handleAudioFetch, logError} from './stream_utils';

/**
 * Streams an MP4 video chunk by chunk using MediaSource, aligned with segment boundaries.
 */
export async function streamMp4VideoByChunks(
  videoElement: HTMLVideoElement,
  videoInfo: StreamInfo,
  audioInfo?: StreamInfo,
  stopTime?: number,
  onSourceObjects?: (
    ms: MediaSource,
    videoSb: SourceBuffer,
    audioSb?: SourceBuffer,
  ) => void,
): Promise<void> {
  console.log('Streaming MP4 video by chunks');
  const mediaSource = new MediaSource();

  await new Promise<void>((resolve) => {
    mediaSource.addEventListener(
      'sourceopen',
      async () => {
        console.log('MediaSource sourceopen event received');
        const videoSb = mediaSource.addSourceBuffer(videoInfo.mimetype);
        const audioSb = audioInfo
          ? mediaSource.addSourceBuffer(audioInfo.mimetype)
          : undefined;

        if (onSourceObjects) onSourceObjects(mediaSource, videoSb, audioSb);

        const audioPromise = audioSb
          ? handleAudioFetch(audioInfo!, audioSb)
          : Promise.resolve();
        const videoHandler = new Mp4StreamHandler(
          videoElement,
          videoInfo,
          videoSb,
          mediaSource,
          stopTime,
        );
        const videoPromise = videoHandler.handleStreaming();

        try {
          await Promise.all([audioPromise, videoPromise]);
          console.log('All streaming promises resolved');
          if (mediaSource.readyState === 'open') mediaSource.endOfStream();
        } catch (e) {
          logError(e, 'streamMp4VideoByChunks Promise.all');
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
}
