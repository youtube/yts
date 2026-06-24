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

import 'jasmine';
import 'yts';

import {VideoMetadata} from 'google3/third_party/javascript/yts/test_utils/codecs/interfaces';
import {EMEHandler} from 'google3/third_party/javascript/yts/test_utils/eme/eme_handler';
import {CobaltMediaKeys, countPsshAtoms, EmeContentType, WIDEVINE_KEY_SYSTEM, WidevineRobustness} from 'google3/third_party/javascript/yts/test_utils/eme/eme_utils';
import {LicenseManager} from 'google3/third_party/javascript/yts/test_utils/eme/license_manager';
import {setupEme} from 'google3/third_party/javascript/yts/test_utils/eme/setup_eme';
import * as util from 'google3/third_party/javascript/yts/test_utils/legacy_yts_utils';
import {setupMse} from 'google3/third_party/javascript/yts/test_utils/mse/setup_mse';
import * as playbackUtil from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {StreamPromise} from 'google3/third_party/javascript/yts/test_utils/streaming/stream_promise';
import type {StreamDef} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';
import {AAC, AC3, AV1, EAC3, H264, Iamf, Opus, VP9} from 'google3/third_party/javascript/yts/test_utils/streams/media_streams';

const DEFAULT_TIMEOUT_MS = 60_000;

describe('EME Conformance Tests', () => {
  let video: HTMLVideoElement;
  let emeHandler: EMEHandler;
  let activeStream: StreamPromise<void>|undefined;

  beforeEach(() => {
    activeStream = undefined;
    playbackUtil.initializeVideoElement();
    video = playbackUtil.getVideoElement()!;
    emeHandler = new EMEHandler();
  });

  afterEach(async () => {
    activeStream?.stop();
    playbackUtil.cleanupVideoElement();
    await emeHandler.dispose();
  });


  function checkMandatory(mandatory: boolean) {
    if (!mandatory) {
      yts.markOptional();
    }
  }

  function isStreamTypeSupported(stream: StreamDef|null): boolean {
    if (!stream || !stream.mimetype) return true;
    return MediaSource.isTypeSupported(
        playbackUtil.createMimeTypeStr(
            stream.mimetype,
            stream.codec,
            stream.get('width') as number,
            stream.get('height') as number,
            stream.get('fps') as number,
            stream.get('spherical') as string,
            ),
    );
  }

  describe('Widevine', () => {
    function createEncryptedCodecTest(
        encStream: StreamDef,
        otherStream: StreamDef,
        desc = '',
        duration = 15,
        mandatory = true,
    ) {
      const videoStream =
          encStream.mediatype === 'video' ? encStream : otherStream;
      const audioStream =
          encStream.mediatype === 'audio' ? encStream : otherStream;
      const testName = `Widevine${encStream.codec}${desc}${
          util.makeCapitalName(encStream.mediatype)}`;

      it(testName, (done) => {
        checkMandatory(mandatory);
        activeStream = setupMse(video, videoStream, audioStream);
        setupEme(emeHandler, video, [encStream], LicenseManager.WIDEVINE);

        let timeUpdateCount = 0;
        video.addEventListener('timeupdate', function onTimeUpdate() {
          playbackUtil.logPlaybackProgress(video, timeUpdateCount++);
          if (!video.paused && video.currentTime >= duration &&
              !emeHandler.keyUnusable) {
            video.removeEventListener('timeupdate', onTimeUpdate);
            expect(video.currentTime).toBeGreaterThanOrEqual(duration);
            done();
          }
        });
        playbackUtil.playAndHandleErrors(video, (msg) => {
          fail(msg);
          done();
        });
      }, DEFAULT_TIMEOUT_MS);
    }

    createEncryptedCodecTest(
        H264['VideoSmallCenc'],
        AAC['AudioNormal'],
    );
    createEncryptedCodecTest(
        AAC['AudioSmallCenc'],
        H264['VideoNormal'],
    );
    createEncryptedCodecTest(
        Opus['SintelEncrypted'],
        VP9['VideoNormal'],
    );
    createEncryptedCodecTest(
        VP9['VideoHighEnc'],
        Opus['CarMed'],
    );
    createEncryptedCodecTest(
        VP9['VideoHighSubSampleEnc'],
        Opus['CarMed'],
        'Subsample',
    );

    it('WidevineH264MultiMediaKeySessions', (done) => {
      const videoStream = H264['VideoMultiKeyCenc'];
      const audioStream = AAC['AudioNormal'];
      const MediaKeySessionCount = 8;

      activeStream =
          setupMse(video, videoStream, audioStream, 15, MediaKeySessionCount);
      setupEme(emeHandler, video, [videoStream], LicenseManager.WIDEVINE);

      let timeUpdateCount = 0;
      video.addEventListener('timeupdate', function onTimeUpdate() {
        playbackUtil.logPlaybackProgress(video, timeUpdateCount++);
        if (!video.paused && video.currentTime >= 15 &&
            !emeHandler.keyUnusable) {
          video.removeEventListener('timeupdate', onTimeUpdate);
          expect(video.currentTime).toBeGreaterThanOrEqual(15);
          expect(emeHandler.keySessions.length).toBe(MediaKeySessionCount);
          expect(emeHandler.keyCount).toBe(128);
          done();
        }
      });
      playbackUtil.playAndHandleErrors(video, (msg) => {
        fail(msg);
        done();
      });
    }, DEFAULT_TIMEOUT_MS);

    function createWidevineLicenseDelayTest(videoStream: StreamDef) {
      const audioStream = AAC['AudioNormal'];
      it(`WidevineLicenseDelay${videoStream.codec}Video`, (done) => {
        activeStream = setupMse(video, videoStream, audioStream);
        setupEme(emeHandler, video, [videoStream], LicenseManager.WIDEVINE);
        let timeUpdateCountDelay = 0;
        video.addEventListener('timeupdate', function onTimeUpdate() {
          playbackUtil.logPlaybackProgress(video, timeUpdateCountDelay++);
          if (!video.paused && video.currentTime >= 15 &&
              !emeHandler.keyUnusable) {
            video.removeEventListener('timeupdate', onTimeUpdate);
            expect(video.currentTime).toBeGreaterThanOrEqual(15);
            done();
          }
        });
        playbackUtil.playAndHandleErrors(video, (msg) => {
          fail(msg);
          done();
        });
      }, DEFAULT_TIMEOUT_MS);
    }

    createWidevineLicenseDelayTest(H264['VideoStreamYTCenc']);
    createWidevineLicenseDelayTest(VP9['VideoHighSubSampleEnc']);

    it('setServerCertificate', (done) => {
      const videoStream = VP9['DrmL3NoHDCP360p30fpsEnc'];
      const audioStream = AAC['AudioNormal'];

      activeStream = setupMse(video, videoStream, audioStream);
      setupEme(emeHandler, video, [videoStream], LicenseManager.WIDEVINE);
      if (emeHandler.isSetServerCertificateSupported) {
        expect(emeHandler.messageEncrypted).toBeTrue();
      }
      done();
    });

    it('WidevineH264ClearMiddleVideo', (done) => {
      const videoStream = H264['VideoClearMiddleCenc'];
      const audioStream = AAC['AudioClearMiddleCenc'];

      activeStream = setupMse(video, videoStream, audioStream, 26);
      setupEme(emeHandler, video, [videoStream], LicenseManager.WIDEVINE);

      let timeUpdateCountClear = 0;
      video.addEventListener('timeupdate', function onTimeUpdate() {
        playbackUtil.logPlaybackProgress(video, timeUpdateCountClear++);
        if (!video.paused && video.currentTime >= 26 &&
            !emeHandler.keyUnusable) {
          video.removeEventListener('timeupdate', onTimeUpdate);
          expect(video.currentTime).toBeGreaterThanOrEqual(26);
          done();
        }
      });
      playbackUtil.playAndHandleErrors(video, (msg) => {
        fail(msg);
        done();
      });
    }, DEFAULT_TIMEOUT_MS);
  });

  describe('EME Basic', () => {
    // TODO(sgunbay): Migrate to using parse_user_agent.ts in the future.
    function getCobaltVersion(): number {
      const userAgent = navigator.userAgent;
      const cobaltRegex = /Cobalt\/(\d+)/;
      const match = userAgent.match(cobaltRegex);
      return match ? Number(match[1]) : -1;
    }

    it('Widevine Support', async () => {
      const config = [
        {
          initDataTypes: ['cenc'],
          videoCapabilities: [
            {
              contentType: EmeContentType.MP4_VIDEO_AVC1,
            },
          ],
        },
        {
          initDataTypes: ['webm'],
          videoCapabilities: [
            {
              contentType: EmeContentType.WEBM_VIDEO_VP9,
            },
          ],
        },
      ];

      console.log('Querying key system with config: ' + JSON.stringify(config));
      const access = await navigator.requestMediaKeySystemAccess(
          WIDEVINE_KEY_SYSTEM,
          config,
      );
      expect(access.keySystem).toBe(WIDEVINE_KEY_SYSTEM);
    });

    it('Negative Widevine Support', async () => {
      const config = [
        {
          initDataTypes: ['cenc'],
          videoCapabilities: [
            {
              contentType: EmeContentType.MP4_VIDEO_AVC1,
            },
          ],
        },
      ];

      console.log('Querying key system with config: ' + JSON.stringify(config));
      try {
        await navigator.requestMediaKeySystemAccess(
            WIDEVINE_KEY_SYSTEM, config);
        fail('requestMediaKeySystemAccess succeeded for non-Widevine device.');
      } catch (e: unknown) {
        expect((e as Error).name).toBe('NotSupportedError');
      }
    });

    it('getMetrics', async () => {
      const opts = [{
        initDataTypes: ['cenc', 'sinf', 'keyids'],
        encryptionScheme: 'cbcs-1-9',
        videoCapabilities: [{
          contentType: EmeContentType.MP4_VIDEO_AVC1,
          robustness: WidevineRobustness.SW_SECURE_DECODE,
        }],
        audioCapabilities: [{
          contentType: EmeContentType.MP4_AUDIO_AAC,
          robustness: WidevineRobustness.SW_SECURE_CRYPTO,
        }],
      }];

      const cobaltVersion = getCobaltVersion();

      console.log('Querying key system with config: ' + JSON.stringify(opts));
      const keySystemAccess = await navigator.requestMediaKeySystemAccess(
          WIDEVINE_KEY_SYSTEM, opts as MediaKeySystemConfiguration[]);
      const mediaKeys =
          await keySystemAccess.createMediaKeys() as CobaltMediaKeys;

      if (cobaltVersion <= 25) {
        // kludge for race-condition with c25 which can cause getMetrics() to be
        // called before MediaKeys is fully initialized.
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      if (!mediaKeys.getMetrics) {
        throw new Error(
            'mediaKeys.getMetrics is not defined on this platform.');
      }
      const metrics = await Promise.resolve(mediaKeys.getMetrics());

      if (!metrics ||
          (metrics.length === 0 && Object.keys(metrics).length === 0)) {
        throw new Error('getMetrics() did not return expected result.');
      }

      if (cobaltVersion >= 26) {
        // Some devices return raw binary protobuf data instead of base64, even
        // though the spec says base64 is required.
        // Fail if the data is not base64, but only on Cobalt 26+ so that
        // older implementations still pass.
        const base64WebsafeRegex = /^[A-Za-z0-9_-]+={0,3}$/;
        if (!base64WebsafeRegex.test(metrics)) {
          throw new Error(
              'getMetrics() must return urlsafe base64, matching ' +
              base64WebsafeRegex);
        }
      }
    });
  });

  describe('General', () => {
    it('EncryptedEventData', (done) => {
      const videoStream = H264['VideoSmallCenc'];

      activeStream = setupMse(video, videoStream, null);
      emeHandler.addEventSpies({
        onEncrypted: (e: MediaEncryptedEvent) => {
          const initData = new Uint8Array(e.initData as ArrayBuffer);
          expect(initData.length).toBe(856);
          expect(countPsshAtoms(initData)).toBe(3);
          done();
        },
      });
      setupEme(emeHandler, video, [videoStream], LicenseManager.WIDEVINE);
      video.play();
    });
  });


  describe('EncryptionScheme', () => {
    /**
     * Standardizes the creation of MediaKeySystemMediaCapability structures for
     * capability probing.
     *
     * @param mimetype The MIME content-type string (e.g., 'video/mp4;
     *     codecs="avc1.42E01E"').
     * @param encryptionScheme The standard four-character string scheme (e.g.,
     *     'cenc', 'cbcs', or null for unencrypted/unconstrained).
     * @return A strictly typed 1-element array containing the
     *     MediaKeySystemMediaCapability definition.
     */
    function createCapabilities(
        mimetype: string,
        encryptionScheme: string|null,
        ): MediaKeySystemMediaCapability[] {
      return [
        {
          contentType: mimetype,
          encryptionScheme,
        },
      ];
    }

    function createEncryptionSchemeTest(
        videoStream: StreamDef|null,
        videoEncryptionScheme: string|null,
        audioStream: StreamDef|null,
        audioEncryptionScheme: string|null,
        mandatory = true,
    ) {
      const validEncryptionScheme = ['cenc', 'cbcs', null];
      function appendToTestName(encryptionScheme: string|null) {
        if (validEncryptionScheme.includes(encryptionScheme)) {
          return encryptionScheme ? util.makeCapitalName(encryptionScheme) :
                                    'UnsetScheme';
        }
        return 'InvalidScheme';
      }

      let testName = '';
      const mediaStreams: StreamDef[] = [];
      if (videoStream) {
        mediaStreams.push(videoStream);
        testName += `${videoStream.codec}Video${
            appendToTestName(videoEncryptionScheme)}`;
      }
      if (audioStream) {
        mediaStreams.push(audioStream);
        testName += `${audioStream.codec}Audio${
            appendToTestName(audioEncryptionScheme)}`;
      }

      it(testName, (done) => {
        checkMandatory(mandatory);

        const initDataTypes = ['cenc'];
        for (const stream of mediaStreams) {
          if (stream.container === 'webm') {
            initDataTypes.push('webm');
            break;
          }
        }

        let videoCapabilities: MediaKeySystemMediaCapability[]|undefined;
        let audioCapabilities: MediaKeySystemMediaCapability[]|undefined;
        let hasValidScheme = true;

        if (videoStream) {
          videoCapabilities =
              createCapabilities(videoStream.mimetype, videoEncryptionScheme);
          if (!validEncryptionScheme.includes(videoEncryptionScheme)) {
            hasValidScheme = false;
          }
        }

        if (audioStream) {
          audioCapabilities =
              createCapabilities(audioStream.mimetype, audioEncryptionScheme);
          if (!validEncryptionScheme.includes(audioEncryptionScheme)) {
            hasValidScheme = false;
          }
        }

        const config: MediaKeySystemConfiguration = {
          initDataTypes,
          videoCapabilities,
          audioCapabilities,
        };

        setupEme(emeHandler, video, mediaStreams, LicenseManager.WIDEVINE);

        emeHandler.checkKeySystem([config] as MediaKeySystemConfiguration[])
            .then(() => {
              if (!hasValidScheme) {
                fail('checkKeySystem succeeded with invalid EncryptionScheme.');
                done();
                return;
              }
              activeStream = setupMse(video, videoStream, audioStream);
              let timeUpdateCount = 0;
              video.addEventListener('timeupdate', function onTimeUpdate() {
                playbackUtil.logPlaybackProgress(video, timeUpdateCount++);
                if (!video.paused && video.currentTime >= 12 &&
                    !emeHandler.keyUnusable) {
                  video.removeEventListener('timeupdate', onTimeUpdate);
                  expect(video.currentTime).toBeGreaterThanOrEqual(12);
                  done();
                }
              });
              playbackUtil.playAndHandleErrors(video, (msg) => {
                fail(msg);
                done();
              });
            })
            .catch((rejected) => {
              console.log(
                  `rejected KeySystem for ${videoEncryptionScheme} and ${
                      audioEncryptionScheme} EncryptionScheme.`);
              if (hasValidScheme) {
                fail(rejected);
              } else {
                expect(true).toBe(true);
              }
              done();
            });
      }, DEFAULT_TIMEOUT_MS);
    }

    createEncryptionSchemeTest(H264['VideoStreamYTCenc'], 'cenc', null, null);
    createEncryptionSchemeTest(H264['VideoStreamYTCenc'], null, null, null);
    createEncryptionSchemeTest(
        H264['VideoStreamYTCenc'],
        'invalid99',
        null,
        null,
    );
    createEncryptionSchemeTest(
        VP9['DrmL3NoHDCP240p30fpsEnc'],
        'cenc',
        null,
        null,
    );
    createEncryptionSchemeTest(
        VP9['DrmL3NoHDCP240p30fpsEnc'],
        null,
        null,
        null,
    );
    createEncryptionSchemeTest(VP9['DrmCbcs1080p60fps'], 'cbcs', null, null);
    createEncryptionSchemeTest(
        VP9['DrmL3NoHDCP240p30fpsEnc'],
        'invalid99',
        null,
        null,
    );
    createEncryptionSchemeTest(AV1['SencSdr1080p30'], 'cbcs', null, null);
    createEncryptionSchemeTest(AV1['SencSdr1080p30'], null, null, null);
    createEncryptionSchemeTest(AV1['SencSdr1080p30'], 'invalid99', null, null);
    createEncryptionSchemeTest(
        null,
        null,
        AAC['AudioSmallCenc'],
        'cenc',
    );
    createEncryptionSchemeTest(null, null, AAC['AudioSmallCenc'], null);
    createEncryptionSchemeTest(null, null, AAC['DrmCbcs'], 'cbcs');
    createEncryptionSchemeTest(
        null,
        null,
        AAC['AudioSmallCenc'],
        'invalid99',
    );
    createEncryptionSchemeTest(
        null,
        null,
        Opus['SintelEncrypted'],
        'cenc',
    );
    createEncryptionSchemeTest(null, null, Opus['SintelEncrypted'], null);
    createEncryptionSchemeTest(
        null,
        null,
        Opus['SintelEncrypted'],
        'invalid99',
    );
    createEncryptionSchemeTest(null, null, AC3['DrmCbcs'], 'cbcs');
    createEncryptionSchemeTest(null, null, EAC3['DrmCbcs'], 'cbcs');
    createEncryptionSchemeTest(
        H264['VideoStreamYTCenc'],
        'cenc',
        AAC['AudioSmallCenc'],
        'cenc',
    );
    createEncryptionSchemeTest(
        VP9['VideoHighEnc'],
        'cenc',
        Opus['SintelEncrypted'],
        'cenc',
    );
    createEncryptionSchemeTest(
        VP9['DrmCbcs1080p60fps'],
        'cbcs',
        AAC['DrmCbcs'],
        'cbcs',
    );
    createEncryptionSchemeTest(
        AV1['SencSdr1080p30'],
        'cbcs',
        AAC['DrmCbcs'],
        'cbcs',
    );
    createEncryptionSchemeTest(
        AV1['SencSdr1080p30'],
        'cbcs',
        AAC['AudioSmallCenc'],
        'cenc',
    );
  });

  describe('Widevine AV1', () => {
    function createWidevineAV1Test(
        videoStream: StreamDef,
        mandatory = true,
        additionalName = '',
    ) {
      if (videoStream) {
        mandatory = mandatory && isStreamTypeSupported(videoStream);
      }
      const audioStream = Opus['CarMed'];
      const codecMetadata = videoStream.get('codecMetadata') as VideoMetadata;
      const bitDepth = codecMetadata.bitDepth || 8;
      const testName = `WidevineAV1.${bitDepth}bit.${
          videoStream.get(
              'transferFunction')}.${videoStream.get('resolution')}.${
          Math.round(videoStream.get('fps') as number)}fps${additionalName}`;

      it(testName, (done) => {
        checkMandatory(mandatory);
        activeStream = setupMse(video, videoStream, audioStream);
        setupEme(emeHandler, video, [videoStream], LicenseManager.WIDEVINE);
        let timeUpdateCountAV1 = 0;
        video.addEventListener('timeupdate', function onTimeUpdate() {
          playbackUtil.logPlaybackProgress(video, timeUpdateCountAV1++);
          if (!video.paused && video.currentTime >= 15 &&
              !emeHandler.keyUnusable) {
            video.removeEventListener('timeupdate', onTimeUpdate);
            expect(video.currentTime).toBeGreaterThanOrEqual(15);
            done();
          }
        });
        playbackUtil.playAndHandleErrors(video, (msg) => {
          fail(msg);
          done();
        });
      }, DEFAULT_TIMEOUT_MS);
    }

    createWidevineAV1Test(AV1['SencSdr144p30'], true);
    createWidevineAV1Test(AV1['SencSdr240p30'], true);
    createWidevineAV1Test(AV1['SencSdr360p30'], true);
    createWidevineAV1Test(AV1['SencSdr480p30'], true);
    createWidevineAV1Test(AV1['SencSdr720p30'], true);
    createWidevineAV1Test(AV1['SencSdr720p60'], true);
    createWidevineAV1Test(AV1['SencSdr1080p30'], true);
    createWidevineAV1Test(AV1['SencSdr1080p60'], true);
    createWidevineAV1Test(AV1['SencSdr1440p30'], util.isAv1GtFHD());
    createWidevineAV1Test(AV1['SencSdr1440p60'], util.isAv1GtFHD());
    createWidevineAV1Test(AV1['SencSdr2160p30'], false);
    createWidevineAV1Test(AV1['SencSdr2160p60'], false);
    createWidevineAV1Test(AV1['SencSdr4320p30'], false);

    createWidevineAV1Test(
        AV1['SencSdr2160p30'], util.isAv1GtFHD(), '(required)');
    createWidevineAV1Test(
        AV1['SencSdr2160p60'], util.isAv1GtFHD(), '(required)');
    createWidevineAV1Test(
        AV1['SencSdr4320p30'], util.isAv1Gt4K(), '(required)');

    createWidevineAV1Test(
        AV1['SencHdrHlg144p30'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrHlg240p30'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrHlg360p30'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrHlg480p30'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrHlg720p24'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrHlg720p60'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrHlg1080p24'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrHlg1080p60'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrHlg1440p24'],
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrHlg1440p60'],
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createWidevineAV1Test(AV1['SencHdrHlg2160p24'], false);
    createWidevineAV1Test(AV1['SencHdrHlg2160p60'], false);

    createWidevineAV1Test(
        AV1['SencHdrHlg2160p24'],
        util.isAv1GtFHD() && playbackUtil.isHdrSupported(), '(required)');
    createWidevineAV1Test(
        AV1['SencHdrHlg2160p60'],
        util.isAv1GtFHD() && playbackUtil.isHdrSupported(), '(required)');

    createWidevineAV1Test(
        AV1['SencHdrPq144p30'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrPq240p30'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrPq360p30'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrPq480p30'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrPq720p24'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrPq720p60'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrPq1080p24'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrPq1080p60'], playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrPq1440p24'],
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createWidevineAV1Test(
        AV1['SencHdrPq1440p60'],
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createWidevineAV1Test(AV1['SencHdrPq2160p24'], false);
    createWidevineAV1Test(AV1['SencHdrPq2160p60'], false);

    createWidevineAV1Test(
        AV1['SencHdrPq2160p24'],
        util.isAv1GtFHD() && playbackUtil.isHdrSupported(), '(required)');
    createWidevineAV1Test(
        AV1['SencHdrPq2160p60'],
        util.isAv1GtFHD() && playbackUtil.isHdrSupported(), '(required)');

  });

  describe('Widevine IAMF (Optional)', () => {
    function createWidevineIamfTest(
        audioStream: StreamDef,
        mandatory = false,
        additionalName = '',
    ) {
      const testName = `WidevineIamf${additionalName}`;

      it(testName, (done) => {
        const videoStream = H264['VideoNormal'];
        mandatory = mandatory && isStreamTypeSupported(audioStream);
        checkMandatory(mandatory);
        activeStream = setupMse(video, videoStream, audioStream);
        setupEme(emeHandler, video, [audioStream], LicenseManager.WIDEVINE);

        let timeUpdateCountIamf = 0;
        video.addEventListener('timeupdate', function onTimeUpdate() {
          playbackUtil.logPlaybackProgress(video, timeUpdateCountIamf++);
          if (!video.paused && video.currentTime >= 15 &&
              !emeHandler.keyUnusable) {
            video.removeEventListener('timeupdate', onTimeUpdate);
            expect(video.currentTime).toBeGreaterThanOrEqual(15);
            done();
          }
        });
        playbackUtil.playAndHandleErrors(video, (msg) => {
          fail(msg);
          done();
        });
      }, DEFAULT_TIMEOUT_MS);
    }

    createWidevineIamfTest(Iamf['IamfEncrypted'], false, 'Encrypted');
  });
});
