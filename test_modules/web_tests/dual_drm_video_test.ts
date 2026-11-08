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
import {
  AV1_LICENSE_URL,
  CONCURRENT_2027_CONFIG,
  DrmMode,
  ERROR_MARGIN_PERCENT,
  H264_LICENSE_URL,
  LICENSE_DELAY_MS,
  MEASUREMENT_THRESHOLD,
  PRE_MEASUREMENT_THRESHOLD,
  PRIMARY_DRM_VIDEO_START_TIME,
  SECONDARY_DRM_VIDEO_START_TIME,
  TEST_DONE_THRESHOLD,
  TEST_TIMEOUT,
  VIDEO_TIMEOUT_THRESHOLD,
  VideoCodecType,
  VideoElementSetup,
  VideoStreamConfig,
} from 'google3/third_party/javascript/yts/test_utils/dual_video/dual_drm_test_constants';
import {
  cleanUpDualVideoStyle,
  cleanUpVideoAndContainer,
  getLicenseServerUrl,
  initializeDualVideoStyle,
  monitorConcurrentPlayback,
  setupVideoElement2027,
} from 'google3/third_party/javascript/yts/test_utils/dual_video/dual_drm_video_helpers';
import {requestIndividualization} from 'google3/third_party/javascript/yts/test_utils/eme/eme_utils';
import * as util from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {createMediaSourceUrl} from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {StreamDef} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';
import {
  AV1,
  H264,
} from 'google3/third_party/javascript/yts/test_utils/streams/media_streams';
import {getMimeTypeWithTunnelMode} from 'google3/third_party/javascript/yts/test_utils/tunnel_mode';

/** Declarative specification for a 2027 Concurrent Playback test case. */
interface DualVideoTestCase2027 {
  readonly id: string;
  readonly title: string;
  readonly primary: VideoStreamConfig;
  readonly secondary: VideoStreamConfig;
}

/**
 * Returns the 2027 Concurrent Playback test cases, evaluating dynamic codec
 * and DRM tier fallbacks at registration time.
 */
function getDualVideo2027TestCases(): readonly DualVideoTestCase2027[] {
  const defaultCodec: VideoCodecType = util.supportsAV1() ? 'av1' : 'vp9';
  const isHighRes =
    util.isGreaterThan4K() ||
    util.isGreaterThan8K() ||
    util.isGreaterThanFHDAndSmallerThanOrEqualTo4K();
  const defaultSecondaryDrm: DrmMode = isHighRes ? 'hw' : 'sw';

  return [
    {
      id: '5F139C7F-C7DE-4920-AEC3-92F812F0994C',
      title: 'Dual Drm Video Test 2027',
      primary: {codec: defaultCodec, drm: 'hw'},
      secondary: {codec: defaultCodec, drm: defaultSecondaryDrm},
    },
    {
      id: '8D1F6E2B-9C3A-4E57-B2A1-F4E8D7C6B5A0',
      title: 'Dual Video Test AV1 HW DRM + AV1 HW DRM 2027',
      primary: {codec: 'av1', drm: 'hw'},
      secondary: {codec: 'av1', drm: 'hw'},
    },
    {
      id: '7B2E5C3D-8A4F-4B19-A3D2-E6F7C8B9A0B1',
      title: 'Dual Video Test AV1 HW DRM + VP9 HW DRM 2027',
      primary: {codec: 'av1', drm: 'hw'},
      secondary: {codec: 'vp9', drm: 'hw'},
    },
    {
      id: '8D099101-98A7-421D-85D3-B016207E5D5F',
      title: 'Dual Video Test VP9 HW DRM + AV1 HW DRM 2027',
      primary: {codec: 'vp9', drm: 'hw'},
      secondary: {codec: 'av1', drm: 'hw'},
    },
    {
      id: '6C3D4B5A-7E8F-4A20-9B1C-D5E6F7A8B9C2',
      title: 'Dual Video Test AV1 HW DRM + VP9 SW DRM 2027',
      primary: {codec: 'av1', drm: 'hw'},
      secondary: {codec: 'vp9', drm: 'sw'},
    },
    {
      id: '5A4B3C2D-6F7E-4931-8A2B-C4D5E6F7A8B3',
      title: 'Dual Video Test AV1 HW DRM + H.264 Clear 2027',
      primary: {codec: 'av1', drm: 'hw'},
      secondary: {codec: 'h264', drm: 'clear'},
    },
    {
      id: '4F3E2D1C-5A6B-4822-9F1E-B3C4D5E6F7A4',
      title: 'Dual Video Test VP9 HW DRM + VP9 HW DRM 2027',
      primary: {codec: 'vp9', drm: 'hw'},
      secondary: {codec: 'vp9', drm: 'hw'},
    },
    {
      id: '3E2D1C5B-4A7F-4713-8E2D-A2B3C4D5E6F5',
      title: 'Dual Video Test H.264 Clear + H.264 Clear 2027',
      primary: {codec: 'h264', drm: 'clear'},
      secondary: {codec: 'h264', drm: 'clear'},
    },
    {
      id: '8A1B2C3D-4111-4E57-8A2B-C4D5E6F7A8B0',
      title: 'Dual Video Test H.264 Clear + AV1 HW DRM 2027',
      primary: {codec: 'h264', drm: 'clear'},
      secondary: {codec: 'av1', drm: 'hw'},
    },
    {
      id: '9B2C3D4E-5222-4E57-8A2B-C4D5E6F7A8B1',
      title: 'Dual Video Test H.264 Clear + VP9 HW DRM 2027',
      primary: {codec: 'h264', drm: 'clear'},
      secondary: {codec: 'vp9', drm: 'hw'},
    },
    {
      id: '1A2B3C4D-5E6F-4A1B-8C2D-3E4F5A6B7C8D',
      title: 'Dual Video Test H.264 Clear Shorts + H.264 Clear Shorts 2027',
      primary: {codec: 'h264', drm: 'clear', isShorts: true},
      secondary: {codec: 'h264', drm: 'clear', isShorts: true},
    },
    {
      id: '2B3C4D5E-6F7A-4B2C-9D3E-4F5A6B7C8D9E',
      title: 'Dual Video Test VP9 Clear Shorts + VP9 Clear Shorts 2027',
      primary: {codec: 'vp9', drm: 'clear', isShorts: true},
      secondary: {codec: 'vp9', drm: 'clear', isShorts: true},
    },
    {
      id: '3C4D5E6F-7A8B-4C3D-AE4F-5A6B7C8D9E0F',
      title: 'Dual Video Test AV1 HW DRM + H.264 Clear Shorts 2027',
      primary: {codec: 'av1', drm: 'hw'},
      secondary: {codec: 'h264', drm: 'clear', isShorts: true},
    },
    {
      id: '4D5E6F7A-8B9C-4D4E-BF5A-6B7C8D9E0F1A',
      title: 'Dual Video Test AV1 HW DRM + VP9 Clear Shorts 2027',
      primary: {codec: 'av1', drm: 'hw'},
      secondary: {codec: 'vp9', drm: 'clear', isShorts: true},
    },
    {
      id: '5E6F7A8B-9C0D-4E5F-C06B-7C8D9E0F1A2B',
      title: 'Dual Video Test H.264 Clear Shorts + AV1 HW DRM 2027',
      primary: {codec: 'h264', drm: 'clear', isShorts: true},
      secondary: {codec: 'av1', drm: 'hw'},
    },
    {
      id: '6F7A8B9C-0D1E-4F6A-D17C-8D9E0F1A2B3C',
      title: 'Dual Video Test H.264 Clear Shorts + VP9 HW DRM 2027',
      primary: {codec: 'h264', drm: 'clear', isShorts: true},
      secondary: {codec: 'vp9', drm: 'hw'},
    },
  ];
}

/**
 * Executes a 2027 Concurrent Playback test case with synchronized start,
 * concurrent progression monitoring, and deterministic decoder teardown.
 */
async function runDualVideoTest2027(
  primaryConfig: VideoStreamConfig,
  secondaryConfig: VideoStreamConfig,
): Promise<void> {
  initializeDualVideoStyle();

  let primarySetup: VideoElementSetup | undefined;
  let secondarySetup: VideoElementSetup | undefined;

  try {
    console.log('Rendering dual videos (2027).');
    [primarySetup, secondarySetup] = await Promise.all([
      setupVideoElement2027('primary', primaryConfig),
      setupVideoElement2027('secondary', secondaryConfig),
    ]);

    console.log('Waiting for both videos to buffer / reach ready state...');
    let readyTimeoutId: ReturnType<typeof setTimeout> | undefined;
    const readyTimeoutPromise = new Promise<void>((_, reject) => {
      readyTimeoutId = setTimeout(
        () =>
          reject(
            new Error(
              'Timed out waiting for dual videos to buffer/reach ready state',
            ),
          ),
        CONCURRENT_2027_CONFIG.bufferingTimeoutMs,
      );
    });

    try {
      await Promise.race([
        Promise.all([primarySetup.readyPromise, secondarySetup.readyPromise]),
        readyTimeoutPromise,
      ]);
    } finally {
      clearTimeout(readyTimeoutId);
    }
    console.log(
      'Both videos buffered and ready. Starting simultaneous playback.',
    );

    await Promise.all([
      primarySetup.video.play(),
      secondarySetup.video.play(),
    ]);

    await monitorConcurrentPlayback({
      primaryVideoId: 'primary-video',
      secondaryVideoId: 'secondary-video',
      primaryStartThresholdSec:
        CONCURRENT_2027_CONFIG.primaryStartTimeThresholdSec,
      secondaryStartThresholdSec:
        CONCURRENT_2027_CONFIG.secondaryStartTimeThresholdSec,
      requiredConcurrentSec: CONCURRENT_2027_CONFIG.requiredConcurrentSec,
      maxStallSec: CONCURRENT_2027_CONFIG.maxStallSec,
      timeoutSec: CONCURRENT_2027_CONFIG.playbackTimeoutSec,
    });
  } finally {
    for (const setup of [primarySetup, secondarySetup]) {
      if (setup?.streamPromise) {
        try {
          setup.streamPromise.stop();
          await setup.streamPromise.catch(() => {});
        } catch {
          // Ignore stream stop errors during teardown.
        }
      }
      try {
        setup?.video?.pause();
      } catch {
        // Ignore pause errors during teardown.
      }
      await setup?.cleanupDrm?.();
    }
    cleanUpVideoAndContainer('primary-video', 'primary-container');
    cleanUpVideoAndContainer('secondary-video', 'secondary-container');
    cleanUpDualVideoStyle();
    // Give native hardware decoder contexts time to flush and release.
    await util.sleep(
      CONCURRENT_2027_CONFIG.decoderFlushDelaySec * util.SECOND,
    );
  }
}

describe('Functional Tests', () => {
  describe('Media', () => {
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
      cleanUpDualVideoStyle();
      cleanUpVideoAndContainer('primary-video', 'primary-container');
      cleanUpVideoAndContainer('secondary-video', 'secondary-container');
    });

    afterEach(() => {
      cleanUpDualVideoStyle();
      cleanUpVideoAndContainer('primary-video', 'primary-container');
      cleanUpVideoAndContainer('secondary-video', 'secondary-container');
    });

    function initializeStyle(): void {
      if (document.getElementById('dual-video-legacy-style')) {
        return;
      }
      const style = document.createElement('style');
      style.id = 'dual-video-legacy-style';
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
        #primary-container video,
        #secondary-container video {
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

    async function addPrimaryDrmVideo(resolve: () => void): Promise<void> {
      const primaryVideoContainer = document.createElement('div');
      primaryVideoContainer.id = 'primary-container';
      document.body.appendChild(primaryVideoContainer);
      const primaryVideo = document.createElement(
        'video',
      ) as CobaltVideoElement;
      primaryVideoContainer.appendChild(primaryVideo);
      primaryVideo.id = 'primary-video';
      util.listenForErrors(primaryVideo, 'primaryVideo', true);

      let primaryStream: StreamDef;
      let licenseServerUrl: string;
      if (!util.supportsAV1()) {
        primaryStream = H264['DrmL3NoHDCP720p60fpsCenc'];
        licenseServerUrl = H264_LICENSE_URL;
      } else if (util.isGreaterThan8K()) {
        primaryStream = AV1['SencSdr4320p30'];
        licenseServerUrl = AV1_LICENSE_URL;
      } else if (util.isGreaterThan4K()) {
        primaryStream = AV1['SencSdr2160p30'];
        licenseServerUrl = AV1_LICENSE_URL;
      } else if (util.isGreaterThanFHDAndSmallerThanOrEqualTo4K()) {
        primaryStream = AV1['SencSdr1080p30'];
        licenseServerUrl = AV1_LICENSE_URL;
      } else {
        primaryStream = AV1['SencSdr720p30'];
        licenseServerUrl = AV1_LICENSE_URL;
      }

      const contentInfo = [
        {
          mimetype: primaryStream.mimetype,
          src: primaryStream.src,
        },
      ];
      const mediaKeySystemAccess = await navigator.requestMediaKeySystemAccess(
        'com.widevine.alpha',
        [
          {
            initDataTypes: ['cenc'],
            videoCapabilities: [
              {contentType: primaryStream.mimetype, encryptionScheme: 'cenc'},
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

      primaryVideo.addEventListener('timeupdate', () => {
        if (primaryVideo.currentTime < PRIMARY_DRM_VIDEO_START_TIME) {
          primaryVideo.currentTime = PRIMARY_DRM_VIDEO_START_TIME;
          const curTime = primaryVideo.currentTime.toFixed(4);
          console.log(
            `primaryVideo started playing at currentTime = ${curTime}`,
          );
        }

        if (
          !primaryVideoSnapshot.initialized &&
          primaryVideo.currentTime >
            PRIMARY_DRM_VIDEO_START_TIME + PRE_MEASUREMENT_THRESHOLD
        ) {
          primaryVideoSnapshot = util.takeVideoTimeSnapshot(primaryVideo);
          const curTime = primaryVideo.currentTime.toFixed(4);
          console.log(
            `primaryVideo measurement started at currentTime = ${curTime}`,
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

      primaryVideo.src = createMediaSourceUrl(contentInfo, {
        disableTunnel: true,
      });
      primaryVideo.load();
      await primaryVideo.play();
    }

    async function addSecondaryDrmH264Video(
      resolve: () => void,
    ): Promise<void> {
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
      const secondaryStream = H264['DrmL3NoHDCP480p30fpsCenc'];

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
          if (typeof secondaryVideo.setMaxVideoCapabilities === 'function') {
            console.log('set Max Video Capabilities');
            secondaryVideo.setMaxVideoCapabilities(
              'width=854; height=480; framerate=30;',
            );
          }

          let mediaKeySystemAccess: MediaKeySystemAccess;
          try {
            mediaKeySystemAccess = await navigator.requestMediaKeySystemAccess(
              'com.youtube.widevine.l3',
              [
                {
                  initDataTypes: ['cenc'],
                  videoCapabilities: [
                    {
                      contentType: secondaryStream.mimetype,
                      encryptionScheme: 'cenc',
                    },
                  ],
                },
              ],
            );
          } catch {
            console.log('requestMediaKeySystemAccess l3 failed');
            mediaKeySystemAccess = await navigator.requestMediaKeySystemAccess(
              'com.widevine.alpha',
              [
                {
                  initDataTypes: ['cenc'],
                  videoCapabilities: [
                    {
                      contentType: secondaryStream.mimetype,
                      encryptionScheme: 'cenc',
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
            const keySession = messageEvent.target as MediaKeySession;
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
              const licenseServerUrl = getLicenseServerUrl(
                secondaryStream,
                H264_LICENSE_URL,
              );
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
            const videoSourceBuffer = mediaSource.addSourceBuffer(
              getMimeTypeWithTunnelMode(secondaryStream.mimetype, {
                disableTunnel: true,
              }),
            );
            util.fetchArrayBuffer(
              'GET',
              secondaryStream.src,
              null,
              (videoArrayBuffer) => {
                videoSourceBuffer.appendBuffer(videoArrayBuffer);
              },
            );
          });

          secondaryVideo.addEventListener('timeupdate', () => {
            if (secondaryVideo.currentTime < SECONDARY_DRM_VIDEO_START_TIME) {
              secondaryVideoStarted = true;
              secondaryVideo.currentTime = SECONDARY_DRM_VIDEO_START_TIME;
              const curTime = secondaryVideo.currentTime.toFixed(4);
              console.log(
                `secondaryVideo started playing at currentTime = ${curTime}`,
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
              const curTime = secondaryVideo.currentTime.toFixed(4);
              console.log(
                'secondaryVideo measurement started at currentTime = ' +
                  curTime,
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
            reject(new Error(`primaryVideo${rejectReason}`));
          },
        );

        const secondVideoPromise = new Promise<void>(
          async (resolve, reject) => {
            await addSecondaryDrmH264Video(resolve);
            await util.sleep(VIDEO_TIMEOUT_THRESHOLD * util.SECOND);
            reject(new Error(`secondaryVideo${rejectReason}`));
          },
        );

        try {
          await Promise.all([primaryVideoPromise, secondVideoPromise]);
        } finally {
          cleanUpVideoAndContainer('primary-video', 'primary-container');
          cleanUpVideoAndContainer('secondary-video', 'secondary-container');
          cleanUpDualVideoStyle();
        }
      },
      TEST_TIMEOUT * util.SECOND,
    );

    for (const testCase of getDualVideo2027TestCases()) {
      yts.test({id: testCase.id});
      it(
        testCase.title,
        async () => {
          await runDualVideoTest2027(testCase.primary, testCase.secondary);
        },
        TEST_TIMEOUT * util.SECOND,
      );
    }
  });
});
