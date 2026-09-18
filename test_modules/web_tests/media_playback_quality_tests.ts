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

import {setupMse} from 'google3/third_party/javascript/yts/test_utils/mse/setup_mse';
import {PerfTestUtil} from 'google3/third_party/javascript/yts/test_utils/perf_test_util';
import * as playbackUtil from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {StreamPromise} from 'google3/third_party/javascript/yts/test_utils/streaming/stream_promise';
import type {StreamDef} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';
import {AAC, AV1, H264, VP9} from 'google3/third_party/javascript/yts/test_utils/streams/media_streams';

const DEFAULT_BUFFER_STOP_TIME = 15;
const DEFAULT_TIMEOUT_MS = 60_000;
const EXTENDED_TIMEOUT_MS = 120_000;
let activeStream: StreamPromise<void>|undefined;

function* getNextStreamPair(audioStream: StreamDef, videoStreams: StreamDef[]) {
  for (const [index, videoStream] of videoStreams.entries()) {
    playbackUtil.verifyStream(videoStream, index);
    console.log(
      `Playing next stream: ${videoStream.src} (${videoStream.mimetype})`,
    );
    yield {audioStream, videoStream};
  }
}

function createTotalVideoFramesValidationTest(
  videoStream: StreamDef,
  frames: number,
) {
  it(
      'correctly reports MediaPlaybackQuality.totalVideoFrames',
      (done) => {
        const video = playbackUtil.getVideoElement()!;
        const audioStream = AAC['Audio1MB'];

        const perfTestUtil = new PerfTestUtil(video);

        function onTimeUpdate() {
          perfTestUtil.updateVideoPerfMetricsStatus();
          const decodedFrames = perfTestUtil.getTotalDecodedFrames();
          // Note that the audio is longer than the video, so the media will
          // keep playing even after all frames have been decoded, unless we
          // manually pause it.
          if (video.currentTime >= 10 || decodedFrames >= frames) {
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.pause();
            console.log(`Validating that total decoded frames is ${frames}`);
            expect(perfTestUtil.getTotalDecodedFrames())
                .withContext('playbackQuality.totalVideoFrames')
                .toBe(frames);
            done();
          }
        }
        video.addEventListener('timeupdate', onTimeUpdate);
        playbackUtil.listenForErrors(video, 'video', true);

        // It's okay to use a simple MediaSource because the video size is ~1MB.
        video.src =
            playbackUtil.createMediaSourceUrl([audioStream, videoStream]);
        console.log('video.src=', video.src);
        video.play();
        console.log('video.play()');
      },
      DEFAULT_TIMEOUT_MS,
  );
}

function createFrameDropValidationTest(videoStreams: StreamDef[]) {
  it(
      'correctly reports MediaPlaybackQuality.droppedVideoFrames after forced frame drops',
      (done) => {
        const video = playbackUtil.getVideoElement()!;
        const perfTestUtil = new PerfTestUtil(video);
        const audioStream = AAC['AudioNormal'];
        const streamGenerator = getNextStreamPair(audioStream, videoStreams);
        let playTimeoutId = 0;
        let isSwitching = false;

        function onError(error: unknown) {
          if (error instanceof Error && error.name === 'AbortError') {
            // Ignore abort errors as all it means is that we are already
            // switching to the next stream.
            return;
          }

          let msg: string;
          if (error instanceof MediaError) {
            msg = `Code ${error.code}: ${error.message}`;
          } else if (error instanceof Error) {
            msg = error.message;
          } else {
            msg = String(error);
          }
          isSwitching = false;
          console.log('Switching to next stream due to error: ', msg);
          playNextSrc(2.0);
        }

        /**
         * Plays the next stream in the streamGenerator. If the video is paused,
         * it will be played at the given playbackRate. Otherwise, the playback
         * rate will be set to 1.0.
         */
        function playNextSrc(playbackRate = 1.0) {
          if (isSwitching) {
            // Don't switch to the next stream if we're already switching.
            return;
          }
          isSwitching = true;
          clearTimeout(playTimeoutId);
          video.removeEventListener('timeupdate', onTimeUpdate);
          video.src = '';
          video.load();
          const next = streamGenerator.next();
          if (next.done) {
            fail('None of the high FPS video streams are supported!');
            done();
            return;
          }
          const {audioStream, videoStream} = next.value;

          // Stop the previous stream before starting a new one.
          activeStream?.stop();
          activeStream = setupMse(
              video, videoStream, audioStream, DEFAULT_BUFFER_STOP_TIME);
          activeStream.catch(onError);

          console.log('video.src set');
          video.playbackRate = playbackRate;
          console.log('video.playbackRate=', video.playbackRate);
          video.addEventListener('timeupdate', onTimeUpdate);
          const promise = video.play();
          if (promise) {
            promise
                .then(() => {
                  isSwitching = false;
                })
                .catch(onError);
          } else {
            isSwitching = false;
            playbackUtil.listenForErrors(video, 'video', false, onError);
          }
          console.log('video.play()');

          playTimeoutId = setTimeout(() => {
            if (video.paused) {
              console.log('Video did not play after 5 seconds.');
              isSwitching = false;
              playNextSrc(2.0);
            }
          }, 5000);
        }

        function onTimeUpdate() {
          clearTimeout(playTimeoutId);
          perfTestUtil.updateVideoPerfMetricsStatus();
          const droppedFrames = perfTestUtil.getTotalDroppedFrames();
          if (video.currentTime >= 10) {
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.pause();
            perfTestUtil.assertAtLeastOneFrameDecoded();
            if (droppedFrames >= 2) {
              console.log('Validated that dropped frames API is working.');
              done();
            } else {
              console.log(
                  'Could not validate dropped frames API (no frames dropped).',
              );
              playNextSrc(2);
            }
          }
        }

        playbackUtil.listenForErrors(video, 'video', false, onError);
        playNextSrc();
      },
      EXTENDED_TIMEOUT_MS,
  );
}

describe('Media Playback Quality', () => {
  beforeEach(() => {
    activeStream = undefined;
    playbackUtil.initializeVideoElement();
  });

  afterEach(() => {
    activeStream?.stop();
    playbackUtil.cleanupVideoElement();
  });

  /**
   * Validates that the device accurately reports total video frames and dropped
   * frames.
   *
   * - TotalVideoFrames: Checks if reported total frames match the known count.
   * - FrameDrop: Ensures the device reports dropped frames when the system
   *   is overloaded (e.g. high FPS playback).
   */
  createTotalVideoFramesValidationTest(H264['Video1MB'], 25);
  createFrameDropValidationTest([
    H264['Webgl1080p240fps'],
    H264['Webgl1080p60fps'],
    VP9['Webgl2160p60fps'],
    AV1['Video118KHDRPQSkyAndOcean701Av1Hdr3840x2160Fps60BitrateKbps314582k'],
    H264['Video4299H2641920x1080Fps60BitrateKbps23006k'],
    VP9['Video7303Vp91920x1080Fps60BitrateKbps15126k'],
    VP9['Webgl720p60fps'],
    H264['Webgl720p60fps'],
  ]);
});
