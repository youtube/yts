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
import {requestIndividualization} from 'google3/third_party/javascript/yts/test_utils/eme/eme_utils';
import * as util from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {createMediaSourceUrl} from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {StreamDef} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';
import {AV1, VP9} from 'google3/third_party/javascript/yts/test_utils/streams/media_streams';

describe('Functional Tests', () => {
  describe('Media', () => {
    const AV1_LICENSE_URL =
      'https://dash-mse-test.appspot.com/api/drm/widevine?drm_system=widevine&source=YOUTUBE&ip=0.0.0.0&ipbits=0&expire=19000000000&key=ik0&sparams=ip,ipbits,expire,drm_system,source,video_id&video_id=6508f99557a8385f&signature=5153900DAC410803EC269D252DAAA82BA6D8B825.495E631E406584A8EFCB4E9C9F3D45F6488B94E4';
    const H264_LICENSE_URL =
      'https://dash-mse-test.appspot.com/api/drm/widevine?drm_system=widevine&source=YOUTUBE&ip=0.0.0.0&ipbits=0&expire=19000000000&key=test_key1&sparams=ip,ipbits,expire,drm_system,source,video_id&video_id=03681262dc412c06&signature=9C4BE99E6F517B51FED1F0B3B31966D3C5DAB9D6.6A1F30BB35F3A39A4CA814B731450D4CBD198FFD';
    const ERROR_MARGIN_PERCENT = 5;
    const MEASUREMENT_THRESHOLD = 5;
    const HDR_WARMUP_THRESHOLD = 10;
    const PRE_MEASUREMENT_THRESHOLD = 1;
    const PRIMARY_DRM_VIDEO_START_TIME = 5;
    const SECONDARY_DRM_VIDEO_START_TIME = 10;
    // Take 3 measurements before we're done (AV1 video isn't long enough for 4 measurements).
    const TEST_DONE_THRESHOLD =
      PRE_MEASUREMENT_THRESHOLD + 3 * MEASUREMENT_THRESHOLD;
    const VIDEO_TIMEOUT_THRESHOLD = 30 + TEST_DONE_THRESHOLD;
    const TEST_TIMEOUT = 60 + HDR_WARMUP_THRESHOLD + VIDEO_TIMEOUT_THRESHOLD;
    const LICENSE_DELAY_MS = 10;
    let secondaryVideoStarted = false;
    let primaryVideoSnapshot: util.VideoTimeSnapshot;
    let secondaryVideoSnapshot: util.VideoTimeSnapshot;

    beforeEach(() => {
      secondaryVideoStarted = false;
      primaryVideoSnapshot = {
        videoCurrentTime: 0,
        wallTime: 0,
      };
      secondaryVideoSnapshot = {
        videoCurrentTime: 0,
        wallTime: 0,
      };
    });

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


    async function addPrimaryDrmVideo(resolve: () => void) {
      const primaryVideoContainer = document.createElement('div');
      primaryVideoContainer.id = 'primary-container';
      document.body.appendChild(primaryVideoContainer);
      const primaryVideo = document.createElement(
        'video',
      ) as CobaltVideoElement;
      primaryVideoContainer.appendChild(primaryVideo);
      primaryVideo.id = 'primary-video';
      util.listenForErrors(primaryVideo, 'primaryVideo', true);

      let videoName;
      let videoContentType;
      let licenseServerUrl: string;
      if (!util.supportsAV1()) {
        videoName = 'drml3NoHdcp_h264_720p_60fps_cenc.mp4';
        videoContentType = 'video/mp4; codecs="avc1.640028"';
        licenseServerUrl = H264_LICENSE_URL;
      } else if (util.isGreaterThan8K()) {
        videoName = 'av1-senc/sdr_4320p30.mp4';
        videoContentType = 'video/mp4; codecs="av01.0.16M.08"';
        licenseServerUrl = AV1_LICENSE_URL;
      } else if (util.isGreaterThan4K()) {
        videoName = 'av1-senc/sdr_2160p30.mp4';
        videoContentType = 'video/mp4; codecs="av01.0.12M.08"';
        licenseServerUrl = AV1_LICENSE_URL;
      } else if (util.isGreaterThanFHDAndSmallerThanOrEqualTo4K()) {
        videoName = 'av1-senc/sdr_1080p30.mp4';
        videoContentType = 'video/mp4; codecs="av01.0.08M.08"';
        licenseServerUrl = AV1_LICENSE_URL;
      } else {
        videoName = 'av1-senc/sdr_720p30.mp4';
        videoContentType = 'video/mp4; codecs="av01.0.05M.08"';
        licenseServerUrl = AV1_LICENSE_URL;
      }

      const contentInfo = [
        {
          mimetype: videoContentType,
          src: `https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/${videoName}`,
        },
      ];
      const mediaKeySystemAccess = await navigator.requestMediaKeySystemAccess(
        'com.widevine.alpha',
        [
          {
            'initDataTypes': ['cenc'],
            'videoCapabilities': [
              {'contentType': videoContentType, 'encryptionScheme': 'cenc'},
            ],
          },
        ],
      );

      const mediaKeys = await mediaKeySystemAccess.createMediaKeys();
      await primaryVideo.setMediaKeys(mediaKeys);

      const mediaKeySession = mediaKeys.createSession();
      mediaKeySession.addEventListener('message', (messageEvent) => {
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
      });

      primaryVideo.addEventListener('encrypted', (encryptedEvent) => {
        mediaKeySession.generateRequest(
          encryptedEvent.initDataType,
          encryptedEvent.initData as ArrayBuffer,
        );
      });

      primaryVideo.addEventListener('timeupdate', (e) => {
        if (primaryVideo.currentTime < PRIMARY_DRM_VIDEO_START_TIME) {
          // Skip first 5 seconds for primary DRM video
          primaryVideo.currentTime = PRIMARY_DRM_VIDEO_START_TIME;
          console.log(
            `primaryVideo started playing at currentTime = ${primaryVideo.currentTime.toFixed(
              4,
            )}`,
          );
        }

        if (
          !primaryVideoSnapshot.initialized &&
          primaryVideo.currentTime >
            PRIMARY_DRM_VIDEO_START_TIME + PRE_MEASUREMENT_THRESHOLD
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

        if (
          primaryVideo.currentTime > TEST_DONE_THRESHOLD &&
          secondaryVideoStarted
        ) {
          resolve();
        }
      });

      primaryVideo.src = createMediaSourceUrl(contentInfo);
      primaryVideo.load();
      await primaryVideo.play();
    }

    async function addSecondaryDrmH264Video(resolve: () => void) {
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
              'width=854; height=480; framerate=30;',
            );
          }

          const videoContentType = 'video/mp4; codecs="avc1.640028"';

          let mediaKeySystemAccess: MediaKeySystemAccess;
          try {
            mediaKeySystemAccess = await navigator.requestMediaKeySystemAccess(
              'com.youtube.widevine.l3',
              [
                {
                  'initDataTypes': ['cenc'],
                  'videoCapabilities': [
                    {
                      'contentType': videoContentType,
                      'encryptionScheme': 'cenc',
                    },
                  ],
                },
              ],
            );
          } catch (e) {
            console.log('requestMediaKeySystemAccess l3 failed');
            // Retrying with L1
            mediaKeySystemAccess = await navigator.requestMediaKeySystemAccess(
              'com.widevine.alpha',
              [
                {
                  'initDataTypes': ['cenc'],
                  'videoCapabilities': [
                    {
                      'contentType': videoContentType,
                      'encryptionScheme': 'cenc',
                    },
                  ],
                },
              ],
            );
          }

          const mediaKeys = await mediaKeySystemAccess.createMediaKeys();
          await secondaryVideo.setMediaKeys(mediaKeys);
          const mediaKeySession = mediaKeys.createSession();

          mediaKeySession.addEventListener('message', (messageEvent) => {
            const message = messageEvent.message;
            const messageType = messageEvent.messageType;
            const keySession: MediaKeySession =
              messageEvent.target as MediaKeySession;
            const updateSession = (response: Uint8Array) => {
              setTimeout(() => {
                keySession.update(response.buffer).catch(() => {
                  console.log('keySession.update failed');
                });
              }, LICENSE_DELAY_MS);
            };
            if (messageType === 'individualization-request') {
              requestIndividualization(message, updateSession);
            } else if (messageType === 'license-request') {
              const licenseServerUrl =
                'https://dash-mse-test.appspot.com/api/drm/widevine?drm_system=widevine&source=YOUTUBE&ip=0.0.0.0&ipbits=0&expire=19000000000&key=test_key1&sparams=ip,ipbits,expire,drm_system,source,video_id&video_id=f320151fa3f061b2&signature=81E7B33929F9F35922F7D2E96A5E7AC36F3218B2.673F553EE51A48438AE5E707AEC87A071B4FEF65';
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
          secondaryVideo.addEventListener('encrypted', (encryptedEvent) => {
            mediaKeySession.generateRequest(
              encryptedEvent.initDataType,
              encryptedEvent.initData as BufferSource,
            );
          });
          const mediaSource = new MediaSource();
          mediaSource.addEventListener('sourceopen', () => {
            const videoSourceBuffer =
              mediaSource.addSourceBuffer(util.getMimeTypeWithTunnelMode(videoContentType));
            util.fetchArrayBuffer(
              'GET',
              'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/drml3NoHdcp_h264_480p_30fps_cenc.mp4',
              null,
              (videoArrayBuffer) => {
                videoSourceBuffer.appendBuffer(videoArrayBuffer);
              },
            );
          });
          secondaryVideo.addEventListener('timeupdate', (e) => {
            if (secondaryVideo.currentTime < SECONDARY_DRM_VIDEO_START_TIME) {
              secondaryVideoStarted = true;
              // Skip first 10 seconds for secondary DRM
              secondaryVideo.currentTime = SECONDARY_DRM_VIDEO_START_TIME;
              console.log(
                `secondaryVideo started playing at currentTime = ${secondaryVideo.currentTime.toFixed(
                  4,
                )}`,
              );
              return;
            }

            if (
              !secondaryVideoSnapshot.initialized &&
              secondaryVideo.currentTime >
                SECONDARY_DRM_VIDEO_START_TIME + PRE_MEASUREMENT_THRESHOLD
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

            if (
              secondaryVideo.currentTime >
              TEST_DONE_THRESHOLD + SECONDARY_DRM_VIDEO_START_TIME
            ) {
              resolve();
            }
          });

          secondaryVideo.src = util.createMediaSourceUrlFromSource(mediaSource);
          secondaryVideo.load();
          await secondaryVideo.play();
        }
      }
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

    yts.test({id: 'E085E041-D65D-40F7-A4B8-2224B321B891'});
    it(
      'Dual Drm Video Test',
      async () => {
        initializeStyle();

        const rejectReason =
          ' currentTime did not reach the expected value before end of test. ' +
          'This could be because the video took too long to start playing ' +
          'or because the video erroneously paused / stalled in the middle.';

        console.log('Rendering dual videos.');
        const primaryVideoPromise = new Promise<void>(
          async (resolve, reject) => {
            await addPrimaryDrmVideo(resolve);
            await util.sleep(VIDEO_TIMEOUT_THRESHOLD * util.SECOND);
            reject('primaryVideo'.concat(rejectReason));
          },
        );

        const secondVideoPromise = new Promise<void>(
          async (resolve, reject) => {
            await addSecondaryDrmH264Video(resolve);
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

    const PRIMARY_DRM_VIDEO_START_TIME_2027 = 2;
    const SECONDARY_DRM_VIDEO_START_TIME_2027 = 10;
    const TEST_DONE_THRESHOLD_2027 = 17;



    async function addPrimaryDrmVideo2027(resolve: () => void) {
      const primaryVideoContainer = document.createElement('div');
      primaryVideoContainer.id = 'primary-container';
      document.body.appendChild(primaryVideoContainer);
      const primaryVideo = document.createElement(
        'video',
      ) as CobaltVideoElement;
      primaryVideoContainer.appendChild(primaryVideo);
      primaryVideo.id = 'primary-video';
      util.listenForErrors(primaryVideo, 'primaryVideo', true);

      let primaryStream = AV1['SencSdr720p30']; // Default fallback

      if (util.isGreaterThan8K()) {
        primaryStream = AV1['SencSdr2160p30'];
      } else if (util.isGreaterThan4K()) {
        primaryStream = AV1['SencSdr2160p30'];
      } else if (util.isGreaterThanFHDAndSmallerThanOrEqualTo4K()) {
        primaryStream = AV1['SencSdr1080p60'];
      } else {
        if (MediaSource.isTypeSupported(AV1['SencSdr1080p30'].mimetype)) {
          primaryStream = AV1['SencSdr1080p30'];
        } else {
          primaryStream = AV1['SencSdr720p30'];
        }
      }

      console.log(`Primary video selected: ${primaryStream.src} (${primaryStream.mimetype})`);

      const mediaKeySystemAccess = await navigator.requestMediaKeySystemAccess(
        'com.widevine.alpha',
        [
          {
            'initDataTypes': ['cenc'],
            'videoCapabilities': [
              {
                'contentType': primaryStream.mimetype,
                'encryptionScheme': 'cenc',
              },
            ],
          },
        ],
      );

      const mediaKeys = await mediaKeySystemAccess.createMediaKeys();
      await primaryVideo.setMediaKeys(mediaKeys);

      const mediaKeySession = mediaKeys.createSession();
      mediaKeySession.addEventListener('message', (messageEvent) => {
        util.fetchArrayBuffer(
          'POST',
          AV1_LICENSE_URL,
          messageEvent.message,
          (licenseArrayBuffer) => {
            mediaKeySession.update(
              util.extractLicenseCallback(licenseArrayBuffer),
            );
          },
        );
      });

      primaryVideo.addEventListener('encrypted', (encryptedEvent) => {
        mediaKeySession.generateRequest(
          encryptedEvent.initDataType,
          encryptedEvent.initData as ArrayBuffer,
        );
      });

      primaryVideo.addEventListener('timeupdate', (e) => {
        if (primaryVideo.currentTime < PRIMARY_DRM_VIDEO_START_TIME_2027) {
          primaryVideo.currentTime = PRIMARY_DRM_VIDEO_START_TIME_2027;
          console.log(
            `primaryVideo started playing at currentTime = ${primaryVideo.currentTime.toFixed(
              4,
            )}`,
          );
        }

        if (
          !primaryVideoSnapshot.initialized &&
          primaryVideo.currentTime >
            PRIMARY_DRM_VIDEO_START_TIME_2027 + PRE_MEASUREMENT_THRESHOLD
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

        if (
          primaryVideo.currentTime > TEST_DONE_THRESHOLD_2027 &&
          secondaryVideoStarted
        ) {
          resolve();
        }
      });

      const contentInfo = [
        {
          mimetype: primaryStream.mimetype,
          src: primaryStream.src,
        },
      ];
      primaryVideo.src = createMediaSourceUrl(contentInfo);
      primaryVideo.load();
      await primaryVideo.play();
    }

    async function addSecondaryDrmVideo2027(resolve: () => void) {
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
      const index = 1;
      const color = backGroundColors[index];
      const item = document.createElement('div');
      secondaryVideoContainer.appendChild(item);
      item.classList.add('item');
      item.style.backgroundColor = color;
      const secondaryVideo = document.createElement(
        'video',
      ) as CobaltVideoElement;
      item.appendChild(secondaryVideo);
      secondaryVideo.id = 'secondary-video';
      util.listenForErrors(secondaryVideo, 'secondaryVideo', true);

      let secondaryStream: StreamDef;
      let requireHwDrm = false;

      if (util.isGreaterThan4K() || util.isGreaterThan8K() || util.isGreaterThanFHDAndSmallerThanOrEqualTo4K()) {
        requireHwDrm = true;
        if (util.supportsAV1() && MediaSource.isTypeSupported(AV1['SencSdr720p30'].mimetype)) {
          secondaryStream = AV1['SencSdr720p30'];
        } else {
          secondaryStream = VP9['DrmL3NoHDCP720p30fpsEnc'];
        }
      } else {
        if (util.supportsAV1() && MediaSource.isTypeSupported(AV1['SencSdr480p30'].mimetype)) {
          secondaryStream = AV1['SencSdr480p30'];
        } else {
          secondaryStream = VP9['DrmL3NoHDCP480p30fpsEnc'];
        }
      }

      console.log(`Secondary video selected: ${secondaryStream.src} (${secondaryStream.mimetype}), requireHwDrm: ${requireHwDrm}`);

      if (
        secondaryVideo.setMaxVideoCapabilities &&
        typeof secondaryVideo.setMaxVideoCapabilities === 'function'
      ) {
        console.log('set Max Video Capabilities');
        const width = (secondaryStream.get('width') as number) || 1280;
        const height = (secondaryStream.get('height') as number) || 720;
        const fps = (secondaryStream.get('fps') as number) || 30;
        secondaryVideo.setMaxVideoCapabilities(
          `width=${width}; height=${height}; framerate=${fps};`,
        );
      }

      let mediaKeySystemAccess: MediaKeySystemAccess | undefined = undefined;
      const keySystems = requireHwDrm ?
          ['com.widevine.alpha'] :
          ['com.youtube.widevine.l3', 'com.widevine.alpha'];
      let selectedKeySystem = '';
      for (const keySystem of keySystems) {
        try {
          mediaKeySystemAccess = await navigator.requestMediaKeySystemAccess(
            keySystem,
            [
              {
                'initDataTypes': ['cenc'],
                'videoCapabilities': [
                  {
                    'contentType': secondaryStream.mimetype,
                    'encryptionScheme': 'cenc',
                  },
                ],
              },
            ],
          );
          selectedKeySystem = keySystem;
          break;
        } catch (e) {
          console.log(`requestMediaKeySystemAccess for ${keySystem} failed`);
        }
      }

      if (!mediaKeySystemAccess) {
        throw new Error('Failed to request MediaKeySystemAccess for secondary video');
      }
      console.log(`Selected key system for secondary: ${selectedKeySystem}`);

      const mediaKeys = await mediaKeySystemAccess.createMediaKeys();
      await secondaryVideo.setMediaKeys(mediaKeys);
      const mediaKeySession = mediaKeys.createSession();

      mediaKeySession.addEventListener('message', (messageEvent) => {
        const message = messageEvent.message;
        const messageType = messageEvent.messageType;
        const keySession: MediaKeySession =
          messageEvent.target as MediaKeySession;
        const updateSession = (response: Uint8Array) => {
          setTimeout(() => {
            keySession.update(response.buffer).catch(() => {
              console.log('keySession.update failed');
            });
          }, LICENSE_DELAY_MS);
        };
        if (messageType === 'individualization-request') {
          requestIndividualization(message, updateSession);
        } else if (messageType === 'license-request') {
          const videoId = secondaryStream.get('video_id') as string;
          const signature = secondaryStream.get('widevine_signature') as string;
          const key = (secondaryStream.get('key') as string) || 'test_key1';
          const licenseServerUrl = `https://dash-mse-test.appspot.com/api/drm/widevine?drm_system=widevine&source=YOUTUBE&ip=0.0.0.0&ipbits=0&expire=19000000000&key=${key}&sparams=ip,ipbits,expire,drm_system,source,video_id&video_id=${videoId}&signature=${signature}`;

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

      secondaryVideo.addEventListener('encrypted', (encryptedEvent) => {
        mediaKeySession.generateRequest(
          encryptedEvent.initDataType,
          encryptedEvent.initData as BufferSource,
        );
      });

      const mediaSource = new MediaSource();
      mediaSource.addEventListener('sourceopen', () => {
        const videoSourceBuffer =
          mediaSource.addSourceBuffer(util.getMimeTypeWithTunnelMode(secondaryStream.mimetype));
        util.fetchArrayBuffer(
          'GET',
          secondaryStream.src,
          null,
          (videoArrayBuffer) => {
            videoSourceBuffer.appendBuffer(videoArrayBuffer);
          },
        );
      });

      secondaryVideo.addEventListener('timeupdate', (e) => {
        if (secondaryVideo.currentTime < SECONDARY_DRM_VIDEO_START_TIME_2027) {
          secondaryVideoStarted = true;
          secondaryVideo.currentTime = SECONDARY_DRM_VIDEO_START_TIME_2027;
          console.log(
            `secondaryVideo started playing at currentTime = ${secondaryVideo.currentTime.toFixed(
              4,
            )}`,
          );
          return;
        }

        if (
          !secondaryVideoSnapshot.initialized &&
          secondaryVideo.currentTime >
            SECONDARY_DRM_VIDEO_START_TIME_2027 + PRE_MEASUREMENT_THRESHOLD
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

        if (
          secondaryVideo.currentTime > TEST_DONE_THRESHOLD_2027
        ) {
          resolve();
        }
      });

      secondaryVideo.src = util.createMediaSourceUrlFromSource(mediaSource);
      secondaryVideo.load();
      await secondaryVideo.play();
    }

    yts.test({id: '5F139C7F-C7DE-4920-AEC3-92F812F0994C'});
    it(
      'Dual Drm Video Test 2027',
      async () => {
        initializeStyle();

        const rejectReason =
          ' currentTime did not reach the expected value before end of test. ' +
          'This could be because the video took too long to start playing ' +
          'or because the video erroneously paused / stalled in the middle.';

        console.log('Rendering dual videos (2027).');
        const primaryVideoPromise = new Promise<void>(
          async (resolve, reject) => {
            await addPrimaryDrmVideo2027(resolve);
            await util.sleep(VIDEO_TIMEOUT_THRESHOLD * util.SECOND);
            reject('primaryVideo'.concat(rejectReason));
          },
        );

        const secondVideoPromise = new Promise<void>(
          async (resolve, reject) => {
            await addSecondaryDrmVideo2027(resolve);
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
