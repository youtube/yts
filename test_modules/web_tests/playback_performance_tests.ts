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

import {isAndroidTv} from 'google3/third_party/javascript/yts/test_utils/cobalt';
import {EMEHandler} from 'google3/third_party/javascript/yts/test_utils/eme/eme_handler';
import {LicenseManager} from 'google3/third_party/javascript/yts/test_utils/eme/license_manager';
import {setupEme} from 'google3/third_party/javascript/yts/test_utils/eme/setup_eme';
import * as util from 'google3/third_party/javascript/yts/test_utils/legacy_yts_utils';
import {setupMse} from 'google3/third_party/javascript/yts/test_utils/mse/setup_mse';
import {PerfTestUtil} from 'google3/third_party/javascript/yts/test_utils/perf_test_util';
import * as playbackUtil from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {StreamPromise} from 'google3/third_party/javascript/yts/test_utils/streaming/stream_promise';
import type {StreamDef} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';
import {AAC, AV1, H264, VP9} from 'google3/third_party/javascript/yts/test_utils/streams/media_streams';

// Seekable DRM videos start at currentTime = 12 seconds.
const DRM_VIDEO_START_TIME = 12;
// Video should stop around 7 sec as the frame drop requirements state.
const VIDEO_STOP_TIME = 7;
// 2027 requirement 2.1.7: max 1 frame drop per 7-second evaluation interval.
const FRAME_DROP_EVALUATION_INTERVAL_SEC = 7;
const HIGH_BITRATE_VIDEO_STOP_TIME = 10;
const DRM_VIDEO_STOP_TIME = DRM_VIDEO_START_TIME + VIDEO_STOP_TIME;
const DEFAULT_TIMEOUT_MS = 60_000;
const EXTENDED_TIMEOUT_MS = 120_000;
const SANITY_PASS_DURATION_SEC = 3;
// Playback speeds to test for VSP.
const PLAYBACK_SPEEDS_1X_ONLY = [1];
const PLAYBACK_SPEEDS_2X = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const PLAYBACK_SPEEDS_4X = [
  ...PLAYBACK_SPEEDS_2X,
  2.25,
  2.5,
  2.75,
  3,
  3.25,
  3.5,
  3.75,
  4,
];

// The active stream, if any.
let activeStream: StreamPromise<void>|undefined;

function createPlaybackPerfTest(
  testName: string,
  videoStream: StreamDef,
  playbackRate: number,
  stopTime: number,
  assertTest: (perfTestUtil: PerfTestUtil) => void,
  useDrm = false,
) {
  const isOptionalPlayBackPerfStream = (stream: StreamDef) => {
    return (
      stream.codec === 'H264' &&
      util.compareResolutions(stream.get('resolution') as string, '1080p') > 0
    );
  };

  const isOptionalFramePlaybackRate = (stream: StreamDef, rate: number) => {
    return (
      ((stream.get('fps') as number) >= 60 && rate > 1) ||
      (rate > 1 &&
        util.compareResolutions(stream.get('resolution') as string, '4320p') >=
          0)
    );
  };

  const isTunnelSupported = isAndroidTv() &&
      typeof MediaSource !== 'undefined' &&
      Boolean(MediaSource.isTypeSupported?.(
          videoStream.mimetype + ';tunnelmode=true')) &&
      !window.location.search.includes('disable_tunnel=true');

  const timeoutMs =
    playbackRate === 0.25 ? EXTENDED_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;

  it(
    testName,
    (done) => {
      if (
        !MediaSource.isTypeSupported(
          playbackUtil.createMimeTypeStr(
            videoStream.mimetype,
            undefined,
            videoStream.get('width') as number,
            videoStream.get('height') as number,
            videoStream.get('fps') as number,
          ),
        )
      ) {
        yts.markOptional();
        fail(`Skipped not supported mimetype ${videoStream.mimetype}`);
        done();
        return;
      }

      if (
        isOptionalPlayBackPerfStream(videoStream) ||
        isOptionalFramePlaybackRate(videoStream, playbackRate)
      ) {
        console.log(
          `This combination of stream (${videoStream.mimetype}) and playback rate (${playbackRate}) is optional`,
        );
        yts.markOptional();
      }

      const audioStream = AAC['AudioNormal'];

      // ====================================================================
      // PASS 1: Primary Performance Evaluation (Runs in Tunnel Mode if supported)
      // ====================================================================
      function runPass1() {
        const video = playbackUtil.getVideoElement()!;
        const perfTestUtil = new PerfTestUtil(video);
        let emeHandler: EMEHandler | undefined;

        if (useDrm) {
          emeHandler = new EMEHandler();
          setupEme(emeHandler, video, [videoStream], LicenseManager.WIDEVINE);
        }

        function onPass1TimeUpdate() {
          if (emeHandler && video.currentTime < 10) {
            if (
              video.currentTime > 0 &&
              video.seekable?.length &&
              video.seekable.end(0) > DRM_VIDEO_START_TIME
            ) {
              console.log(
                `Seeking to DRM_VIDEO_START_TIME (${DRM_VIDEO_START_TIME}s)`,
              );
              video.currentTime = DRM_VIDEO_START_TIME;
            }
            return;
          }

          if (!perfTestUtil.isTrackingStarted()) {
            perfTestUtil.startTracking();
            return;
          }

          perfTestUtil.updateVideoPerfMetricsStatus();

          const isEndOfTest = !video.paused && video.currentTime >= stopTime;
          const isEmeHealthy = !emeHandler || !emeHandler?.keyUnusable;
          if (isEndOfTest && isEmeHealthy) {
            console.log('Pass 1 playback completed');
            video.removeEventListener('timeupdate', onPass1TimeUpdate);
            video.pause();
            expect(video.playbackRate)
              .withContext('playbackRate')
              .toBe(playbackRate);
            perfTestUtil.assertPlaybackRate(playbackRate);
            assertTest(perfTestUtil);

            const completePass1 = async () => {
              if (activeStream) {
                activeStream.stop();
                activeStream = undefined;
              }
              if (emeHandler) {
                await emeHandler.dispose();
                emeHandler = undefined;
              }

              if (isTunnelSupported) {
                console.log(
                  'Tunnel mode supported. Tearing down video DOM for Non-Tunnel fallback sanity pass...',
                );
                playbackUtil.cleanupVideoElement();
                playbackUtil.initializeVideoElement();
                runPass2NonTunnelSanity();
              } else {
                done();
              }
            };
            completePass1();
          }
        }

        function onPass1Error(error: unknown) {
          video.removeEventListener('timeupdate', onPass1TimeUpdate);
          let msg: string;
          if (error instanceof MediaError) {
            msg = `Code ${error.code}: ${error.message}`;
          } else if (error instanceof Error) {
            msg = error.message;
          } else {
            msg = String(error);
          }
          fail('Error during Pass 1 playback: ' + msg);
          if (emeHandler) {
            emeHandler.dispose().then(done);
          } else {
            done();
          }
        }

        video.addEventListener('timeupdate', onPass1TimeUpdate);
        activeStream = setupMse(video, videoStream, audioStream, stopTime);
        activeStream.catch(onPass1Error);

        console.log('video.src set for Pass 1');
        video.playbackRate = playbackRate;
        console.log('video.playbackRate=', video.playbackRate);
        playbackUtil.playAndHandleErrors(video, onPass1Error);
      }

      // ====================================================================
      // PASS 2: Non-Tunnel Fallback Playback Sanity Pass
      // ====================================================================
      function runPass2NonTunnelSanity() {
        console.log('Starting Pass 2 Non-Tunnel Fallback Sanity Pass...');
        const newVideo = playbackUtil.getVideoElement()!;
        let emeHandler2: EMEHandler | undefined;
        const pass2StopTime = useDrm ?
            DRM_VIDEO_START_TIME + SANITY_PASS_DURATION_SEC :
            SANITY_PASS_DURATION_SEC;

        if (useDrm) {
          emeHandler2 = new EMEHandler();
          setupEme(emeHandler2, newVideo, [videoStream], LicenseManager.WIDEVINE);
        }

        function onPass2TimeUpdate() {
          if (emeHandler2 && newVideo.currentTime < 10) {
            if (
              newVideo.currentTime > 0 &&
              newVideo.seekable?.length &&
              newVideo.seekable.end(0) > DRM_VIDEO_START_TIME
            ) {
              console.log(
                `Pass 2: Seeking to DRM_VIDEO_START_TIME (${DRM_VIDEO_START_TIME}s)`,
              );
              newVideo.currentTime = DRM_VIDEO_START_TIME;
            }
            return;
          }

          if (!newVideo.paused && newVideo.currentTime >= pass2StopTime) {
            console.log(
              'Non-tunnel fallback pass completed successfully without crash.',
            );
            newVideo.removeEventListener('timeupdate', onPass2TimeUpdate);
            newVideo.pause();

            const finishPass2 = async () => {
              if (activeStream) {
                activeStream.stop();
                activeStream = undefined;
              }
              if (emeHandler2) {
                await emeHandler2.dispose();
                emeHandler2 = undefined;
              }
              done();
            };
            finishPass2();
          }
        }

        function onPass2Error(error: unknown) {
          newVideo.removeEventListener('timeupdate', onPass2TimeUpdate);
          let msg: string;
          if (error instanceof MediaError) {
            msg = `Code ${error.code}: ${error.message}`;
          } else if (error instanceof Error) {
            msg = error.message;
          } else {
            msg = String(error);
          }
          fail('Error during Pass 2 Non-Tunnel fallback playback: ' + msg);
          if (emeHandler2) {
            emeHandler2.dispose().then(done);
          } else {
            done();
          }
        }

        newVideo.addEventListener('timeupdate', onPass2TimeUpdate);
        activeStream = setupMse(
          newVideo,
          videoStream,
          audioStream,
          pass2StopTime,
          undefined,
          undefined,
          {disableTunnel: true},
        );
        activeStream.catch(onPass2Error);

        console.log('newVideo.src set for Pass 2 (disableTunnel: true)');
        newVideo.playbackRate = playbackRate;
        playbackUtil.playAndHandleErrors(newVideo, onPass2Error);
      }

      runPass1();
    },
    timeoutMs,
  );
}

function defaultTestAssertion(perfTestUtil: PerfTestUtil) {
  perfTestUtil.assertAtLeastOneFrameDecoded();
  perfTestUtil.assertMaxDroppedFramesPerInterval(
    1,
    FRAME_DROP_EVALUATION_INTERVAL_SEC,
  );
}

function variableSpeedPlaybackTestAssertion(perfTestUtil: PerfTestUtil) {
  perfTestUtil.assertAtLeastOneFrameDecoded();
}

function getPlaybackPerfTestName(
  videoStream: StreamDef,
  playbackSpeed = 1,
): string {
  const parts = [
    `PlaybackPerf${videoStream.codec}`,
    `${videoStream.get('resolution')}`,
  ];
  if (videoStream.get('quality')) {
    parts.push(`${videoStream.get('quality')}`);
  }
  if (videoStream.get('HDRFormat')) {
    parts.push(`${videoStream.get('HDRFormat')}`);
  }
  parts.push(`${videoStream.get('fps')}fps@${playbackSpeed}X`);
  const name = parts.join('.');

  // Bitrate is not joined by period.
  const bitrate = videoStream.get('bitrate');
  return bitrate ? name.concat(`bitrate@${bitrate}`) : name;
}

function createPlaybackPerfTestCategory(
    streamDefs: StreamDef[],
    stopTime: number,
    useDrm = false,
    playbackSpeeds: number[] = PLAYBACK_SPEEDS_4X,
) {
  beforeEach(() => {
    activeStream = undefined;
    playbackUtil.initializeVideoElement();
  });

  afterEach(() => {
    activeStream?.stop();
    playbackUtil.cleanupVideoElement();
  });

  for (const [index, videoStream] of streamDefs.entries()) {
    playbackUtil.verifyStream(videoStream, index);

    for (const playbackSpeed of playbackSpeeds) {
      const assertion =
        playbackSpeed !== 1
          ? variableSpeedPlaybackTestAssertion
          : defaultTestAssertion;

      const streamRes = videoStream.get('resolution') as string;
      if (
        util.compareResolutions(streamRes, '720p') < 0 &&
        playbackSpeed !== 1
      ) {
        continue;
      }

      const testName = getPlaybackPerfTestName(videoStream, playbackSpeed);
      createPlaybackPerfTest(
        testName,
        videoStream,
        playbackSpeed,
        stopTime,
        assertion,
        useDrm,
      );
    }
  }
}

describe('VP9 SFR Tests', () => {
  /**
   * Tests Standard Frame Rate (SFR) VP9 playback performance.
   * Covers resolutions from 144p to 2160p and Shorts formats.
   * Runs at multiple playback speeds (0.25x - 2.0x).
   */
  const vp9StreamDefs = [
    VP9['Webgl144p30fps'],
    VP9['Webgl240p30fps'],
    VP9['Webgl360p30fps'],
    VP9['Webgl480p30fps'],
    VP9['Webgl720p30fps'],
    VP9['Webgl1080p30fps'],
    VP9['Webgl1440p30fps'],
    VP9['Webgl2160p30fps'],
    VP9['Shorts242'],
    VP9['Shorts243'],
    VP9['Shorts244'],
    VP9['Shorts247'],
    VP9['Shorts248'],
    VP9['Shorts271'],
    VP9['Shorts278'],
    VP9['Shorts313'],
    VP9['Shorts598'],
  ];
  describe('VP9 SFR Playback Performance', () => {
    createPlaybackPerfTestCategory(
      vp9StreamDefs,
      VIDEO_STOP_TIME,
    );
  });
});

describe('H264 SFR Tests', () => {
  /**
   * Tests Standard Frame Rate (SFR) H264 playback performance.
   * Covers resolutions from 144p to 2160p and Shorts formats.
   * Runs at multiple playback speeds (0.25x - 2.0x).
   */
  const h264StreamDefs = [
    H264['Webgl144p15fps'],
    H264['Webgl240p30fps'],
    H264['Webgl360p30fps'],
    H264['Webgl480p30fps'],
    H264['Webgl720p30fps'],
    H264['Webgl1080p30fps'],
    H264['Webgl1440p30fps'],
    H264['Webgl2160p30fps'],
    H264['Shorts133'],
    H264['Shorts134'],
    H264['Shorts135'],
    H264['Shorts136'],
    H264['Shorts137'],
    H264['Shorts160'],
    H264['Shorts597'],
  ];
  describe('H264 SFR Playback Performance', () => {
    createPlaybackPerfTestCategory(
      h264StreamDefs,
      VIDEO_STOP_TIME,
    );
  });
});

describe('AV1 SFR Tests', () => {
  /**
   * Tests Standard Frame Rate (SFR) AV1 playback performance.
   * Covers resolutions from 144p to 1440p (Bunny) and Sports/SDR formats.
   * Runs at multiple playback speeds (0.25x - 2.0x).
   */
  const av1StreamDefs = [
    AV1['Bunny144p30fps'],
    AV1['Bunny240p30fps'],
    AV1['Bunny360p30fps'],
    AV1['Bunny480p30fps'],
    AV1['Bunny720p30fps'],
    AV1['Bunny1080p30fps'],
    AV1['Bunny1440p30fps'],
    AV1['Sports2160p30fps'],
    AV1['Sdr4320p30fps'],
  ];
  describe('AV1 SFR Playback Performance', () => {
    createPlaybackPerfTestCategory(
      av1StreamDefs,
      VIDEO_STOP_TIME,
    );
  });
});

describe('HFR Tests', () => {
  /**
   * Tests High Frame Rate (HFR, 60fps) playback performance for VP9, H264, and AV1.
   * Includes WebGL, Bunny, and Shorts streams.
   * These tests run only at 1x speed.
   */
  const hfrStreamDefs = [
    VP9['Webgl720p60fps'],
    VP9['Webgl1080p60fps'],
    VP9['Webgl1440p60fps'],
    VP9['Webgl2160p60fps'],
    H264['Webgl720p60fps'],
    H264['Webgl1080p60fps'],
    AV1['Bunny720p60fps'],
    AV1['Bunny1080p60fps'],
    AV1['Bunny1440p60fps'],
    H264['Shorts298'],
    H264['Shorts299'],
    VP9['Shorts302'],
    VP9['Shorts303'],
    VP9['Shorts308'],
    VP9['Shorts315'],
  ];
  describe('HFR Playback Performance', () => {
    createPlaybackPerfTestCategory(
        hfrStreamDefs,
        VIDEO_STOP_TIME,
        false,
        PLAYBACK_SPEEDS_2X,
    );
  });
});

describe('VP9 Widevine SFR Tests', () => {
  /**
   * Tests Standard Frame Rate (SFR) VP9 playback performance with Widevine DRM.
   * Uses L3 security level and includes encrypted/CENC streams.
   * Runs at multiple playback speeds.
   */
  const widevineVP9StreamDefs = [
    VP9['DrmL3NoHDCP240p30fpsEnc'],
    VP9['DrmL3NoHDCP360p30fpsEnc'],
    VP9['DrmL3NoHDCP480p30fpsEnc'],
    VP9['DrmL3NoHDCP480p30fpsMqEnc'],
    VP9['DrmL3NoHDCP480p30fpsHqEnc'],
    VP9['DrmL3NoHDCP720p30fpsEnc'],
    VP9['DrmL3NoHDCP720p30fpsMqEnc'],
    VP9['DrmL3NoHDCP720p30fpsHqEnc'],
    VP9['DrmL3NoHDCP1080p30fpsEnc'],
    VP9['DrmL3NoHDCP1080p30fpsMqEnc'],
    VP9['DrmL3NoHDCP1080p30fpsHqEnc'],
    VP9['Sintel2kEnc'],
    VP9['Sintel4kEnc'],
  ];
  describe('VP9 Widevine SFR Playback Performance', () => {
    createPlaybackPerfTestCategory(
      widevineVP9StreamDefs,
      DRM_VIDEO_STOP_TIME,
      true,
    );
  });
});

describe('H264 Widevine SFR Tests', () => {
  /**
   * Tests Standard Frame Rate (SFR) H264 playback performance with Widevine DRM.
   * Uses L3 security level and includes CENC encrypted streams.
   * Runs at multiple playback speeds.
   */
  const widevineH264StreamDefs = [
    H264['DrmL3NoHDCP144p30fpsCenc'],
    H264['DrmL3NoHDCP240p30fpsCenc'],
    H264['DrmL3NoHDCP360p30fpsCenc'],
    H264['DrmL3NoHDCP480p30fpsCenc'],
    H264['DrmL3NoHDCP480p30fpsMqCenc'],
    H264['DrmL3NoHDCP480p30fpsHqCenc'],
    H264['DrmL3NoHDCP720p30fpsCenc'],
    H264['DrmL3NoHDCP720p30fpsMqCenc'],
    H264['DrmL3NoHDCP720p30fpsHqCenc'],
    H264['DrmL3NoHDCP1080p30fpsCenc'],
    H264['DrmL3NoHDCP1080p30fpsMqCenc'],
    H264['DrmL3NoHDCP1080p30fpsHqCenc'],
  ];
  describe('H264 Widevine SFR Playback Performance', () => {
    createPlaybackPerfTestCategory(
      widevineH264StreamDefs,
      DRM_VIDEO_STOP_TIME,
      true,
    );
  });
});

describe('Widevine HFR Tests', () => {
  /**
   * Tests High Frame Rate (HFR, 60fps) playback performance with Widevine DRM.
   * Includes VP9 and H264 streams.
   * These tests run only at 1x speed.
   */
  const widevineHfrStreamDefs = [
    VP9['DrmL3NoHDCP720p60fpsEnc'],
    VP9['DrmL3NoHDCP720p60fpsMqEnc'],
    VP9['DrmL3NoHDCP1080p60fpsEnc'],
    VP9['DrmL3NoHDCP1080p60fpsMqEnc'],
    H264['DrmL3NoHDCP720p60fpsCenc'],
    H264['DrmL3NoHDCP720p60fpsMqCenc'],
    H264['DrmL3NoHDCP1080p60fpsCenc'],
    H264['DrmL3NoHDCP1080p60fpsMqCenc'],
  ];
  describe('Widevine HFR Playback Performance', () => {
    createPlaybackPerfTestCategory(
        widevineHfrStreamDefs,
        DRM_VIDEO_STOP_TIME,
        true,
        PLAYBACK_SPEEDS_2X,
    );
  });
});

describe('High Bitrate Tests', () => {
  /**
   * Tests playback performance of high bitrate AV1 and VP9 streams.
   * Includes 4K/8K resolutions, HDR (HLG/PQ), and Spherical video formats.
   * Runs at 1x speed only with a specific stop condition.
   */
  const highBitrateStreamDefs = [
    AV1['Video118KHDRPQSkyAndOcean699Av1Hdr1920x1080Fps30BitrateKbps12348k'],
    AV1['Video118KHDRPQSkyAndOcean701Av1Hdr3840x2160Fps30BitrateKbps27291k'],
    AV1['Video118KHDRPQSkyAndOcean702Av1Hdr7680x4320Fps30BitrateKbps44547k'],
    AV1[
      'Video128KHDRHLGColorAndTexture699Av1Hdr1920x1080Fps30BitrateKbps11879k'
    ],
    AV1[
      'Video128KHDRHLGColorAndTexture701Av1Hdr3840x2160Fps30BitrateKbps27159k'
    ],
    AV1[
      'Video128KHDRHLGColorAndTexture702Av1Hdr7680x4320Fps30BitrateKbps45209k'
    ],
    AV1['Video118KHDRPQSkyAndOcean699Av1Hdr1920x1080Fps60BitrateKbps12171k'],
    AV1['Video118KHDRPQSkyAndOcean701Av1Hdr3840x2160Fps60BitrateKbps314582k'],
    AV1[
      'Video128KHDRHLGColorAndTexture699Av1Hdr1920x1080Fps60BitrateKbps11580k'
    ],
    AV1[
      'Video128KHDRHLGColorAndTexture701Av1Hdr3840x2160Fps60BitrateKbps293629k'
    ],
    AV1['TestMaterialsMediaSphericalVp91080s60fps399Av11920x1080Fps29'],
    AV1['TestMaterialsMediaSphericalVp91080s60fps401Av13840x2160Fps29'],
    AV1['TestMaterialsMediaSphericalVp91080s60fps571Av17680x4320Fps29'],
    AV1['TestMaterialsMediaSphericalVp92160s60fps399Av11920x1080Fps29'],
    AV1['TestMaterialsMediaSphericalVp92160s60fps401Av13840x2160Fps29'],
    AV1['TestMaterialsMediaSphericalVp92160s60fps571Av17680x4320Fps29'],
    AV1['Video10399Av11920x1080Fps30BitrateKbps14641k'],
    AV1['Video10401Av13840x2160Fps30BitrateKbps33929k'],
    AV1['Video10571Av17680x4320Fps30BitrateKbps55775k'],
    AV1['Video1399Av11920x1080Fps30BitrateKbps12365k'],
    AV1['Video1401Av13840x2160Fps30BitrateKbps29631k'],
    AV1['Video1571Av17680x4320Fps30BitrateKbps36573k'],
    AV1['Video2399Av11920x1080Fps30BitrateKbps14453k'],
    AV1['Video2401Av13840x2160Fps30BitrateKbps31443k'],
    AV1['Video2571Av17680x4320Fps30BitrateKbps43935k'],
    AV1['Video3399Av11920x1080Fps30BitrateKbps12337k'],
    AV1['Video3401Av13840x2160Fps30BitrateKbps28080k'],
    AV1['Video3571Av17680x4320Fps30BitrateKbps41688k'],
    AV1['Video4399Av11920x1080Fps30BitrateKbps12876k'],
    AV1['Video4401Av13840x2160Fps30BitrateKbps22089k'],
    AV1['Video4571Av17680x4320Fps30BitrateKbps33592k'],
    AV1['Video5399Av11920x1080Fps30BitrateKbps12942k'],
    AV1['Video5401Av13840x2160Fps30BitrateKbps26742k'],
    AV1['Video5571Av17680x4320Fps30BitrateKbps33847k'],
    AV1['Video6399Av11920x1080Fps30BitrateKbps12077k'],
    AV1['Video6401Av13840x2160Fps30BitrateKbps22615k'],
    AV1['Video6571Av17680x4320Fps30BitrateKbps36237k'],
    AV1['Video7399Av11920x1080Fps30BitrateKbps11478k'],
    AV1['Video7401Av13840x2160Fps30BitrateKbps24895k'],
    AV1['Video7571Av17680x4320Fps30BitrateKbps37875k'],
    AV1['Video8399Av11920x1080Fps30BitrateKbps12365k'],
    AV1['Video8401Av13840x2160Fps30BitrateKbps29631k'],
    AV1['Video8571Av17680x4320Fps30BitrateKbps36573k'],
    AV1['Video9399Av11920x1080Fps30BitrateKbps14124k'],
    AV1['Video9401Av13840x2160Fps30BitrateKbps32721k'],
    AV1['Video9571Av17680x4320Fps30BitrateKbps36168k'],
    VP9['TestMaterialsMediaSphericalVp91080s60fps137H2641920x1080Fps29'],
    VP9['TestMaterialsMediaSphericalVp91080s60fps248Vp91920x1080Fps29'],
    VP9['TestMaterialsMediaSphericalVp91080s60fps299H2641920x1080Fps59'],
    VP9['TestMaterialsMediaSphericalVp91080s60fps303Vp91920x1080Fps59'],
    VP9['TestMaterialsMediaSphericalVp91080s60fps313Vp93840x2160Fps29'],
    VP9['TestMaterialsMediaSphericalVp91080s60fps315Vp93840x2160Fps59'],
    VP9['TestMaterialsMediaSphericalVp91080s60fps399Av11920x1080Fps29'],
    VP9['TestMaterialsMediaSphericalVp91080s60fps401Av13840x2160Fps29'],
    VP9['TestMaterialsMediaSphericalVp91080s60fps571Av17680x4320Fps29'],
    VP9['TestMaterialsMediaSphericalVp92160s60fps137H2641920x1080Fps29'],
    VP9['TestMaterialsMediaSphericalVp92160s60fps248Vp91920x1080Fps29'],
    VP9['TestMaterialsMediaSphericalVp92160s60fps299H2641920x1080Fps59'],
    VP9['TestMaterialsMediaSphericalVp92160s60fps303Vp91920x1080Fps59'],
    VP9['TestMaterialsMediaSphericalVp92160s60fps313Vp93840x2160Fps29'],
    VP9['TestMaterialsMediaSphericalVp92160s60fps315Vp93840x2160Fps59'],
    VP9['TestMaterialsMediaSphericalVp92160s60fps399Av11920x1080Fps29'],
    VP9['TestMaterialsMediaSphericalVp92160s60fps401Av13840x2160Fps29'],
    VP9['TestMaterialsMediaSphericalVp92160s60fps571Av17680x4320Fps29'],
    VP9['Video10248Vp91920x1080Fps30BitrateKbps16922k'],
    VP9['Video10303Vp91920x1080Fps60BitrateKbps16866k'],
    VP9['Video10313Vp93840x2160Fps30BitrateKbps43754k'],
    VP9['Video10315Vp93840x2160Fps60BitrateKbps41145k'],
    VP9['Video1248Vp91920x1080Fps30BitrateKbps13793k'],
    VP9['Video1303Vp91920x1080Fps60BitrateKbps10398k'],
    VP9['Video1313Vp93840x2160Fps30BitrateKbps36345k'],
    VP9['Video1315Vp93840x2160Fps60BitrateKbps34865k'],
    VP9['Video2248Vp91920x1080Fps30BitrateKbps18271k'],
    VP9['Video2303Vp91920x1080Fps60BitrateKbps16036k'],
    VP9['Video2313Vp93840x2160Fps30BitrateKbps42243k'],
    VP9['Video2315Vp93840x2160Fps60BitrateKbps43999k'],
    VP9['Video3248Vp91920x1080Fps30BitrateKbps14327k'],
    VP9['Video3303Vp91920x1080Fps60BitrateKbps16011k'],
    VP9['Video3313Vp93840x2160Fps30BitrateKbps36442k'],
    VP9['Video3315Vp93840x2160Fps60BitrateKbps35900k'],
    VP9['Video4248Vp91920x1080Fps30BitrateKbps14511k'],
    VP9['Video4303Vp91920x1080Fps60BitrateKbps10607k'],
    VP9['Video4313Vp93840x2160Fps30BitrateKbps41239k'],
    VP9['Video4315Vp93840x2160Fps60BitrateKbps34783k'],
    VP9['Video5248Vp91920x1080Fps30BitrateKbps17822k'],
    VP9['Video5303Vp91920x1080Fps60BitrateKbps12324k'],
    VP9['Video5313Vp93840x2160Fps30BitrateKbps41760k'],
    VP9['Video5315Vp93840x2160Fps60BitrateKbps39941k'],
    VP9['Video6248Vp91920x1080Fps30BitrateKbps16972k'],
    VP9['Video6303Vp91920x1080Fps60BitrateKbps9286k'],
    VP9['Video6313Vp93840x2160Fps30BitrateKbps39936k'],
    VP9['Video6315Vp93840x2160Fps60BitrateKbps38289k'],
    VP9['Video7248Vp91920x1080Fps30BitrateKbps12987k'],
    VP9['Video7303Vp91920x1080Fps60BitrateKbps15126k'],
    VP9['Video7313Vp93840x2160Fps30BitrateKbps32303k'],
    VP9['Video7315Vp93840x2160Fps60BitrateKbps36468k'],
    VP9['Video8248Vp91920x1080Fps30BitrateKbps13793k'],
    VP9['Video8303Vp91920x1080Fps60BitrateKbps10398k'],
    VP9['Video8313Vp93840x2160Fps30BitrateKbps36345k'],
    VP9['Video8315Vp93840x2160Fps60BitrateKbps34865k'],
    VP9['Video9248Vp91920x1080Fps30BitrateKbps17678k'],
    VP9['Video9303Vp91920x1080Fps60BitrateKbps12827k'],
    VP9['Video9313Vp93840x2160Fps30BitrateKbps40745k'],
    VP9['Video9315Vp93840x2160Fps60BitrateKbps42637k'],
    H264['TestMaterialsMediaSphericalVp91080s60fps137H2641920x1080Fps29'],
    H264['TestMaterialsMediaSphericalVp91080s60fps299H2641920x1080Fps59'],
    H264['TestMaterialsMediaSphericalVp92160s60fps137H2641920x1080Fps29'],
    H264['TestMaterialsMediaSphericalVp92160s60fps299H2641920x1080Fps59'],
    H264['Video10137H2641920x1080Fps30BitrateKbps19021k'],
    H264['Video10299H2641920x1080Fps60BitrateKbps19425k'],
    H264['Video1137H2641920x1080Fps30BitrateKbps20227k'],
    H264['Video1299H2641920x1080Fps60BitrateKbps20195k'],
    H264['Video2137H2641920x1080Fps30BitrateKbps21613k'],
    H264['Video2299H2641920x1080Fps60BitrateKbps21981k'],
    H264['Video3137H2641920x1080Fps30BitrateKbps19528k'],
    H264['Video3299H2641920x1080Fps60BitrateKbps21652k'],
    H264['Video4137H2641920x1080Fps30BitrateKbps22366k'],
    H264['Video4299H2641920x1080Fps60BitrateKbps23006k'],
    H264['Video5137H2641920x1080Fps30BitrateKbps17694k'],
    H264['Video5299H2641920x1080Fps60BitrateKbps21672k'],
    H264['Video6137H2641920x1080Fps30BitrateKbps16987k'],
    H264['Video6299H2641920x1080Fps60BitrateKbps20378k'],
    H264['Video7137H2641920x1080Fps30BitrateKbps19046k'],
    H264['Video7299H2641920x1080Fps60BitrateKbps19551k'],
    H264['Video8137H2641920x1080Fps30BitrateKbps20227k'],
    H264['Video8299H2641920x1080Fps60BitrateKbps20195k'],
    H264['Video9137H2641920x1080Fps30BitrateKbps22215k'],
    H264['Video9299H2641920x1080Fps60BitrateKbps22758k'],
    AV1['AV18K60FPS100MBPSSDR'],
    AV1['AV18K60FPS100MBPSHDRHLG'],
    AV1['AV18K60FPS100MBPSHDRPQ'],
  ];
  describe('High Bitrate Playback Performance', () => {
    createPlaybackPerfTestCategory(
        highBitrateStreamDefs,
        HIGH_BITRATE_VIDEO_STOP_TIME,
        false,
        PLAYBACK_SPEEDS_1X_ONLY,
    );
  });
});

describe('High Bitrate Widevine Tests', () => {
  /**
   * Tests playback performance of high bitrate streams with Widevine DRM.
   * Includes H264, VP9, and AV1 streams up to 8K/60fps.
   * Runs at 1x speed only with a specific stop condition.
   */
  const highBitrateDrmStreamDefs = [
    H264['Video61920x1080Fps30H264'],
    H264['Video61920x1080Fps60H264'],
    VP9['Video61920x1080Fps30Vp9'],
    VP9['Video61920x1080Fps60Vp9'],
    VP9['Video63840x2160Fps30Vp9'],
    VP9['Video63840x2160Fps60Vp9'],
    AV1['Video63840x2160Fps30Av1'],
    AV1['Video63840x2160Fps60Av1'],
    AV1['Video67680x4320Fps30Av1'],
    AV1['SencHfrSdr4320p60'],
    AV1['SencHfrHdrHlg4320p60'],
    AV1['SencHfrHdrPq4320p60'],
  ];
  describe('High Bitrate Playback Performance', () => {
    createPlaybackPerfTestCategory(
        highBitrateDrmStreamDefs,
        DRM_VIDEO_STOP_TIME,
        true,
        PLAYBACK_SPEEDS_1X_ONLY,
    );
  });
});
