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

import {CobaltVideoElement} from 'google3/third_party/javascript/yts/test_utils/cobalt_video_element';
import {requestIndividualization} from 'google3/third_party/javascript/yts/test_utils/eme_util';
import * as util from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {
  createMediaSourceUrl,
  isHdrSupported,
} from 'google3/third_party/javascript/yts/test_utils/playback_util';

describe('Functional Tests', () => {
  describe('Media', () => {
    const ERROR_MARGIN_PERCENT = 5;
    const MEASUREMENT_THRESHOLD = 5;
    const HDR_WARMUP_THRESHOLD = 10;
    const PRE_MEASUREMENT_THRESHOLD = 1;
    // Take 4 measurements before we're done.
    const TEST_DONE_THRESHOLD =
      PRE_MEASUREMENT_THRESHOLD + 4 * MEASUREMENT_THRESHOLD;
    const VIDEO_TIMEOUT_THRESHOLD = 30 + TEST_DONE_THRESHOLD;
    const TEST_TIMEOUT = 60 + HDR_WARMUP_THRESHOLD + VIDEO_TIMEOUT_THRESHOLD;
    const LICENSE_DELAY_MS = 10;

    function initializeStyle() {
      const style = document.createElement('style');
      style.textContent = `
        #primary-container {
          width: 100%;
          height: 100%;
        }
        #secondary-container {
          position: absolute;
          top: 15%;
          height: 85%;
          width: 100%;
          background-color: rgba(33, 33, 33, .75);
          padding: 24px;
        }
        #hdr-container {
          width: 100%;
          height: 100%;
        }
        video {
          width: 100%;
          height: 100%;
        }
        .item {
          width: 427px;
          height: 240px;
          display: inline-block;
          margin: 24px;
          vertical-align: middle;
        }
        `;
      document.head.appendChild(style);
    }

    let primaryVideoSnapshot: util.VideoTimeSnapshot = {
      videoCurrentTime: 0,
      wallTime: 0,
    };
    async function addPrimaryVideo(resolve: () => void) {
      const primaryVideoContainer = document.createElement('div');
      primaryVideoContainer.id = 'primary-container';
      document.body.appendChild(primaryVideoContainer);
      const primaryVideo = document.createElement('video');
      primaryVideoContainer.appendChild(primaryVideo);
      primaryVideo.id = 'primary-video';
      util.listenForErrors(primaryVideo, 'primaryVideo', true);

      const videoContentType = 'video/mp4; codecs="avc1.640028"';
      const audioContentType = 'audio/mp4; codecs="mp4a.40.2"';
      const contentInfo = [
        {
          mimetype: videoContentType,
          src: 'https://yt-dash-mse-test.commondatastorage.googleapis.com/media/oops_cenc-20121114-142.mp4',
        },
        {
          mimetype: audioContentType,
          src: 'https://yt-dash-mse-test.commondatastorage.googleapis.com/media/oops_cenc-20121114-148.mp4',
        },
      ];
      const mediaKeySystemAccess = await navigator.requestMediaKeySystemAccess(
        'com.widevine.alpha',
        [
          {
            'initDataTypes': ['cenc'],
            'videoCapabilities': [{'contentType': videoContentType}],
            'audioCapabilities': [{'contentType': audioContentType}],
          },
        ],
      );

      const mediaKeys = await mediaKeySystemAccess.createMediaKeys();
      await primaryVideo.setMediaKeys(mediaKeys);

      const mediaKeySession = mediaKeys.createSession();
      mediaKeySession.addEventListener('message', (messageEvent) => {
        const message = messageEvent.message;
        const messageType = messageEvent.messageType;
        const keySession: MediaKeySession =
          messageEvent.target as MediaKeySession;

        const updateSession = (response: ArrayBuffer) => {
          setTimeout(() => {
            keySession.update(response).catch(() => {
              console.log('keySession.update failed');
            });
          }, LICENSE_DELAY_MS);
        };

        if (messageType === 'individualization-request') {
          requestIndividualization(message, updateSession);
        } else if (messageType === 'license-request') {
          const licenseServerUrl =
            'https://dash-mse-test.appspot.com/api/drm/widevine?drm_system=widevine&source=YOUTUBE&ip=0.0.0.0&ipbits=0&expire=19000000000&key=test_key1&sparams=ip,ipbits,expire,drm_system,source,video_id&video_id=03681262dc412c06&signature=9C4BE99E6F517B51FED1F0B3B31966D3C5DAB9D6.6A1F30BB35F3A39A4CA814B731450D4CBD198FFD';
          util.fetchArrayBuffer(
            'POST',
            licenseServerUrl,
            messageEvent.message,
            (licenseArrayBuffer) => {
              mediaKeySession.update(
                util.extractLicenseCallback(licenseArrayBuffer),
              );
            },
          );
        } else {
          console.debug('unknown MediaKeyMessageEvent type');
        }
      });

      primaryVideo.addEventListener('encrypted', (encryptedEvent) => {
        mediaKeySession.generateRequest(
          encryptedEvent.initDataType,
          encryptedEvent.initData as ArrayBuffer,
        );
      });

      let isPlaying = false;
      primaryVideo.addEventListener('timeupdate', (e) => {
        if (!isPlaying) {
          isPlaying = true;
          console.log('primaryVideo started playing');
        }

        if (
          !primaryVideoSnapshot.initialized &&
          primaryVideo.currentTime > PRE_MEASUREMENT_THRESHOLD
        ) {
          primaryVideoSnapshot = util.takeVideoTimeSnapshot(primaryVideo);
          console.log(
            `primaryVideo measurement started at currentTime = ${primaryVideo.currentTime.toFixed(
              4,
            )}`,
          );
          return;
        }

        if (
          primaryVideoSnapshot.initialized &&
          primaryVideo.currentTime - primaryVideoSnapshot.videoCurrentTime >
            MEASUREMENT_THRESHOLD
        ) {
          primaryVideoSnapshot = util.validateVideoCurrentTimeAgainstSnapshot(
            primaryVideo,
            primaryVideoSnapshot,
            ERROR_MARGIN_PERCENT,
            'primaryVideo',
          );
        }

        if (primaryVideo.currentTime > TEST_DONE_THRESHOLD) {
          resolve();
        }
      });

      primaryVideo.src = createMediaSourceUrl(contentInfo);
      primaryVideo.autoplay = true;
      await primaryVideo.play();
    }

    let secondaryVideoSnapshot: util.VideoTimeSnapshot = {
      videoCurrentTime: 0,
      wallTime: 0,
    };
    async function addSecondaryVideo(resolve: () => void) {
      const secondaryVideoContainer = document.createElement('div');
      secondaryVideoContainer.id = 'secondary-container';
      document.body.appendChild(secondaryVideoContainer);
      const backGroundColors = [
        '#DB4437',
        '#9E9E9E',
        '#4285F4',
        '#0F9D58',
        '#F4B400',
      ];
      for (const [index, color] of backGroundColors.entries()) {
        const item = document.createElement('div');
        secondaryVideoContainer.appendChild(item);
        item.classList.add('item');
        item.style.backgroundColor = color;
        if (index === 1) {
          const secondaryVideo = document.createElement(
            'video',
          ) as CobaltVideoElement;
          item.appendChild(secondaryVideo);
          secondaryVideo.id = 'secondary-video';
          util.listenForErrors(secondaryVideo, 'secondaryVideo', true);
          // Max video capabilities must be set before src.
          if (
            secondaryVideo.setMaxVideoCapabilities &&
            typeof secondaryVideo.setMaxVideoCapabilities === 'function'
          ) {
            console.log('set Max Video Capabilities');
            secondaryVideo.setMaxVideoCapabilities(
              'width=432; height=240; framerate=15;',
            );
          }

          let isPlaying = false;
          secondaryVideo.addEventListener('timeupdate', (e) => {
            if (!isPlaying) {
              isPlaying = true;
              console.log('secondaryVideo started playing');
            }

            if (
              !secondaryVideoSnapshot.initialized &&
              secondaryVideo.currentTime > PRE_MEASUREMENT_THRESHOLD
            ) {
              secondaryVideoSnapshot =
                util.takeVideoTimeSnapshot(secondaryVideo);
              console.log(
                `secondaryVideo measurement started at currentTime = ${secondaryVideo.currentTime.toFixed(
                  4,
                )}`,
              );
              return;
            }

            if (
              secondaryVideoSnapshot.initialized &&
              secondaryVideo.currentTime -
                secondaryVideoSnapshot.videoCurrentTime >
                MEASUREMENT_THRESHOLD
            ) {
              secondaryVideoSnapshot =
                util.validateVideoCurrentTimeAgainstSnapshot(
                  secondaryVideo,
                  secondaryVideoSnapshot,
                  ERROR_MARGIN_PERCENT,
                  'secondaryVideo',
                );
            }

            if (secondaryVideo.currentTime > TEST_DONE_THRESHOLD) {
              resolve();
            }
          });

          secondaryVideo.loop = true;
          secondaryVideo.muted = true;
          secondaryVideo.src = util.createMediaSourceUrl([
            {
              mimetype: 'video/mp4; codecs="avc1.640028, mp4a.40.2"',
              src: 'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/manual/dual_video/secondary-video-fragmented.mp4',
            },
          ]);
          secondaryVideo.load();
          await secondaryVideo.play();
        }
      }
    }

    async function addHdrVideo(resolve: () => void) {
      const hdrVideoContainer = document.createElement('div');
      hdrVideoContainer.id = 'hdr-container';
      document.body.appendChild(hdrVideoContainer);
      const hdrVideo = document.createElement('video');
      util.listenForErrors(hdrVideo, 'hdrVideo');

      hdrVideo.addEventListener('timeupdate', (e) => {
        if (hdrVideo.currentTime > HDR_WARMUP_THRESHOLD) {
          resolve();
        }
      });

      hdrVideo.id = 'hdr-video';
      hdrVideoContainer.appendChild(hdrVideo);
      hdrVideo.autoplay = true;
      hdrVideo.src = createMediaSourceUrl([
        {
          mimetype: 'video/webm; codecs="vp9"',
          src: 'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/meridian_vp9_hdr_low_progressive.webm',
        },
      ]);
      await hdrVideo.play();
    }

    function cleanUpVideoAndContainer(videoId: string, containerId: string) {
      const video = document.getElementById(videoId);
      if (video) {
        util.removeCobaltVideo(video as HTMLVideoElement);
      }

      const container = document.getElementById(containerId);
      if (container) {
        document.body.removeChild(container);
      }
    }

    it(
      'Dual Video Test',
      async () => {
        initializeStyle();

        const rejectReason =
          ' currentTime did not reach the expected value before end of test. ' +
          'This could be because the video took too long to start playing ' +
          'or because the video erroneously paused / stalled in the middle.';
        if (isHdrSupported()) {
          // Play HDR video on its own for a while before the dual video test
          // begins. This is to ensure that the device correctly switches down to
          // SDR mode when the dual video test begins.
          console.log('Device supports HDR');
          try {
            await new Promise<void>(async (resolve, reject) => {
              await addHdrVideo(resolve);
              await util.sleep(VIDEO_TIMEOUT_THRESHOLD * util.SECOND);
              reject('pre-test HDR video'.concat(rejectReason));
            });
          } finally {
            cleanUpVideoAndContainer('hdr-video', 'hdr-container');
          }
        }

        console.log('Rendering dual videos.');
        const primaryVideoPromise = new Promise<void>(
          async (resolve, reject) => {
            await addPrimaryVideo(resolve);
            await util.sleep(VIDEO_TIMEOUT_THRESHOLD * util.SECOND);
            reject('primaryVideo'.concat(rejectReason));
          },
        );
        const secondVideoPromise = new Promise<void>(
          async (resolve, reject) => {
            await addSecondaryVideo(resolve);
            await util.sleep(VIDEO_TIMEOUT_THRESHOLD * util.SECOND);
            reject('secondaryVideo'.concat(rejectReason));
          },
        );

        try {
          await Promise.all([primaryVideoPromise, secondVideoPromise]);
        } finally {
          cleanUpVideoAndContainer('primary-video', 'primary-container');
          cleanUpVideoAndContainer('secondary-video', 'secondary-container');
        }
      },
      TEST_TIMEOUT * util.SECOND,
    );
  });
});
