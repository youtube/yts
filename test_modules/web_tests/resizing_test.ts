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

/**
 *
 *
 *
 * NOTE: These tests have been deprecated in favor of guided tests
 *
 *
 *
 *
 */

import * as util from 'google3/third_party/javascript/yts/test_utils/playback_util';

describe('Functional Tests', () => {
  describe('Media', () => {
    // Max number of frames the test can drop
    const MAX_DROPPED_FRAMES = 10;

    // The video must continue playing above this framerate for 75 or 95 percent
    // of the time, given the year
    const MIN_THRESHOLD_FPS = 30;

    // Interval in seconds to measure the time
    const MEASUREMENT_THRESHOLD = 2;

    // How long to play the video
    const TEST_DONE_THRESHOLD = 6;

    // How long until the test times out
    const TEST_TIMEOUT = 30 + 2 * TEST_DONE_THRESHOLD;

    async function resizingTest(year: '2023' | '2024+') {
      const percentileLabel = year === '2023' ? '75' : '95';
      function percentileValue() {
        return year === '2023'
          ? util.getCssAnimationFpsStats().pct75
          : util.getCssAnimationFpsStats().pct95;
      }

      function initializeStyle() {
        const style = document.createElement('style');
        style.textContent = `
          #resizing-container {
            position: absolute;
            width: 1280px;
            height: 720px;
            transform-origin: 0 0;
          }

          #resizing-vid {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            z-index: 0;
            background-color: #0f0;
            transform-origin: 0 0;
          }

          #resizing-vid.shrink {
            animation: shrink 1s 1 forwards;
          }
  
          @keyframes shrink {
            from { transform: scale(1); }
            to { transform: scale(0.2375) translate(1650.5px, 1650.5px); }
          }

          #resizing-vid.grow {
            animation: grow 1s 1 forwards;
          }

          @keyframes grow {
            from { transform: scale(0.2375) translate(1650.5px, 1650.5px); }
            to { transform: scale(1); }
          }
          `;
        document.head.appendChild(style);
      }

      function toggleVideoElementSize(video: HTMLVideoElement) {
        const isShrunk = video.classList.contains('shrink');

        const currentClass = isShrunk ? 'shrink' : 'grow';
        const targetClass = isShrunk ? 'grow' : 'shrink';
        video.classList.remove(currentClass);
        video.classList.add(targetClass);
      }

      function testAnimationPerformance() {
        console.log(
          `Resizing animation FPS (${percentileLabel}th Pct): ${percentileValue().toFixed(
            1,
          )}`,
        );
        expect(percentileValue())
          .withContext(`animationFps${percentileLabel}thPercentile`)
          .toBeGreaterThanOrEqual(MIN_THRESHOLD_FPS);
      }

      function testVideoPerformance(video: HTMLVideoElement) {
        const totalDroppedFrames =
          video.getVideoPlaybackQuality().droppedVideoFrames;
        console.log(`Total video frames dropped: ${totalDroppedFrames}`);
        expect(totalDroppedFrames)
          .withContext('totalDroppedFrames')
          .toBeLessThanOrEqual(MAX_DROPPED_FRAMES);
      }

      initializeStyle();
      const container = document.createElement('div');
      container.id = 'resizing-container';
      document.body.appendChild(container);

      const video = document.createElement('video');
      container.appendChild(video);
      video.id = 'resizing-vid';
      video.addEventListener('animationend', (e) => {
        toggleVideoElementSize(video);
        testAnimationPerformance();
      });

      await new Promise<void>(async (resolve) => {
        let measurementTime = 0;
        video.addEventListener('timeupdate', (e) => {
          if (video.currentTime - measurementTime >= MEASUREMENT_THRESHOLD) {
            measurementTime = video.currentTime;
            testVideoPerformance(video);
          }

          if (video.currentTime > TEST_DONE_THRESHOLD) {
            resolve();
          }
        });
        video.muted = true;
        video.src =
          'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/manual/avsync_30fps_120s.mp4';
        video.load();
        await video.play();
        // First resizing has to be initiated manually.
        // Rest will happen automatically due to the call in 'animationend'.
        toggleVideoElementSize(video);
      });

      util.removeCobaltVideo(video);
    }

    it(
      'Resizing',
      async () => {
        await resizingTest('2023');
      },
      TEST_TIMEOUT * util.SECOND,
    );

    it(
      'Resizing 2024+',
      async () => {
        await resizingTest('2024+');
      },
      TEST_TIMEOUT * util.SECOND,
    );
  });
});
