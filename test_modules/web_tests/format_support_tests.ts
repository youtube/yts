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

import * as av1Codec from 'google3/third_party/javascript/yts/test_utils/codecs/av1_codec';
import * as vp9Codec from 'google3/third_party/javascript/yts/test_utils/codecs/vp9_codec';
import * as util from 'google3/third_party/javascript/yts/test_utils/legacy_yts_utils';
import {setupMse} from 'google3/third_party/javascript/yts/test_utils/mse/setup_mse';
import * as playbackUtil from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {StreamPromise} from 'google3/third_party/javascript/yts/test_utils/streaming/stream_promise';
import {AAC_STREAMS} from 'google3/third_party/javascript/yts/test_utils/streams/aac';
import {AC3_STREAMS} from 'google3/third_party/javascript/yts/test_utils/streams/ac3';
import {AV1_STREAMS} from 'google3/third_party/javascript/yts/test_utils/streams/av1';
import {EAC3_STREAMS} from 'google3/third_party/javascript/yts/test_utils/streams/eac3';
import {H264_STREAMS} from 'google3/third_party/javascript/yts/test_utils/streams/h264';
import type {StreamDef} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';
import {AAC, AC3, AV1, EAC3, Opus, VP9} from 'google3/third_party/javascript/yts/test_utils/streams/media_streams';
import {OPUS_STREAMS} from 'google3/third_party/javascript/yts/test_utils/streams/opus';
import {VP9_STREAMS} from 'google3/third_party/javascript/yts/test_utils/streams/vp9';

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_DURATION = 5;

describe('Format Support Tests', () => {
  let video: HTMLVideoElement;
  let activeStream: StreamPromise<void>|undefined;

  beforeEach(() => {
    activeStream = undefined;
    playbackUtil.initializeVideoElement();
    video = playbackUtil.getVideoElement()!;
  });

  afterEach(() => {
    activeStream?.stop();
    playbackUtil.cleanupVideoElement();
  });

  /**
   * Marks the test as optional if it is not mandatory.
   * @param mandatory Whether the test is mandatory.
   */
  function checkMandatory(mandatory: boolean) {
    if (!mandatory) {
      yts.markOptional();
    }
  }

  /**
   * Monitors video playback progress and asserts that playback reaches the
   * expected duration.
   * @param done Jasmine done callback function.
   * @param duration Expected duration for playback in seconds (with default).
   */
  function monitorPlayback(done: DoneFn, duration: number) {
    let timeUpdateCount = 0;
    video.addEventListener('timeupdate', function onTimeUpdate() {
      playbackUtil.logPlaybackProgress(video, timeUpdateCount++);
      if (!video.paused && video.currentTime >= duration) {
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.pause();
        expect(video.currentTime)
            .withContext('video.currentTime')
            .toBeGreaterThanOrEqual(duration);
        done();
      }
    });

    playbackUtil.playAndHandleErrors(video, (msg) => {
      fail(msg);
      done();
    });
  }

  /**
   * Returns the maximum supported resolution window for the specified video
   * format.
   * @param format The video format (e.g., 'H.264', 'VP9', 'AV1').
   * @returns An array representing the [width, height] of the maximum supported
   *     window.
   */
  function getMaxSupportedWindow(format: string): number[] {
    switch (format) {
      case 'H.264':
        return playbackUtil.getMaxH264SupportedWindow([3840, 2160]);
      case 'VP9':
        return playbackUtil.getMaxVp9SupportedWindow([3840, 2160]);
      case 'AV1':
        return playbackUtil.getMaxAV1SupportedWindow([7680, 4320]);
      default:
        throw new Error('Invalid format');
    }
  }

  describe('Support', () => {
    it('isTypeSupported cryptoblockformat', () => {
      const invalidType = playbackUtil.createVideoFormatStr(
          'webm', vp9Codec.getVp9CodecString(), 1280, 720, 23.976, null,
          'cryptoblockformat=invalid');
      const validType = playbackUtil.createVideoFormatStr(
          'webm', vp9Codec.getVp9CodecString(), 1280, 720, 23.976, null,
          'cryptoblockformat=subsample');

      console.log('Calling isTypeSupported with: ' + invalidType);
      expect(MediaSource.isTypeSupported(invalidType))
          .withContext(`MediaSource.isTypeSupported("${invalidType}")`)
          .toBeFalse();

      console.log('Calling isTypeSupported with: ' + validType);
      expect(MediaSource.isTypeSupported(validType))
          .withContext(`MediaSource.isTypeSupported("${validType}")`)
          .toBeTrue();
    });

    it('isTypeSupported Extensions', () => {
      const baselineVideoType = playbackUtil.createVideoFormatStr(
          'mp4', 'avc1.4d401e', 640, 360, 30, null, 'bitrate=300000');
      const baselineAudioType = playbackUtil.createMimeTypeStr(
          'audio/mp4', 'mp4a.40.2', null, null, null, null, 'channels=2');
      const invalidVideoHeightType = playbackUtil.createVideoFormatStr(
          'mp4', 'avc1.4d401e', 640, 10360, null, null, '');
      const invalidAudioChannelsType = playbackUtil.createMimeTypeStr(
          'audio/mp4', 'mp4a.40.2', null, null, null, null, 'channels=100');

      console.log('Calling isTypeSupported with: ' + baselineVideoType);
      expect(MediaSource.isTypeSupported(baselineVideoType))
          .withContext(`MediaSource.isTypeSupported("${baselineVideoType}")`)
          .toBeTrue();

      console.log('Calling isTypeSupported with: ' + baselineAudioType);
      expect(MediaSource.isTypeSupported(baselineAudioType))
          .withContext(`MediaSource.isTypeSupported("${baselineAudioType}")`)
          .toBeTrue();

      console.log('Calling isTypeSupported with: ' + invalidVideoHeightType);
      expect(MediaSource.isTypeSupported(invalidVideoHeightType))
          .withContext(
              `MediaSource.isTypeSupported("${invalidVideoHeightType}")`)
          .toBeFalse();

      console.log('Calling isTypeSupported with: ' + invalidAudioChannelsType);
      expect(MediaSource.isTypeSupported(invalidAudioChannelsType))
          .withContext(
              `MediaSource.isTypeSupported("${invalidAudioChannelsType}")`)
          .toBeFalse();
    });

    it('isTypeSupported AV1 Codec', () => {
      const av1Str1 = 'video/mp4; codecs="av1"';
      console.log('Calling isTypeSupported with: ' + av1Str1);
      expect(MediaSource.isTypeSupported(av1Str1))
          .withContext(`MediaSource.isTypeSupported("${av1Str1}")`)
          .toBeFalse();

      const av1Str2 = 'video/mp4; codecs="av00.0.00M.00"';
      console.log('Calling isTypeSupported with: ' + av1Str2);
      expect(MediaSource.isTypeSupported(av1Str2))
          .withContext(`MediaSource.isTypeSupported("${av1Str2}")`)
          .toBeFalse();

      const av1Str3 = playbackUtil.createVideoFormatStr(
          'mp4', av1Codec.getAv1CodecString(), null, null, null, null, '');
      console.log('Calling isTypeSupported with: ' + av1Str3);
      expect(MediaSource.isTypeSupported(av1Str3))
          .withContext(`MediaSource.isTypeSupported("${av1Str3}")`)
          .toBeTrue();
    });

    /**
     * Creates a High Frame Rate (HFR) support test.
     * @param format The video format.
     * @param container The media container.
     * @param codec The video codec.
     * @param fps Frames per second.
     * @param mandatory Whether the test is mandatory. Defaults to true.
     */
    function createHfrSupportTest(
        format: string,
        container: string,
        codec: string,
        fps: number,
        mandatory = true,
    ) {
      it(`${format} ${fps}fps Support`, () => {
        checkMandatory(mandatory);
        const maxSupported = getMaxSupportedWindow(format);

        const invalidFpsType = playbackUtil.createVideoFormatStr(
            container, codec, 640, 360, 9999, null, '');
        console.log('Calling isTypeSupported with: ' + invalidFpsType);
        expect(MediaSource.isTypeSupported(invalidFpsType))
            .withContext(`MediaSource.isTypeSupported("${invalidFpsType}")`)
            .toBeFalse();

        const validFpsType = playbackUtil.createVideoFormatStr(
            container, codec, 640, 360, fps, null, '');
        console.log('Calling isTypeSupported with: ' + validFpsType);
        expect(MediaSource.isTypeSupported(validFpsType))
            .withContext(`MediaSource.isTypeSupported("${validFpsType}")`)
            .toBeTrue();

        const maxSupportedType = playbackUtil.createVideoFormatStr(
            container, codec, maxSupported[0], maxSupported[1], fps, null, '');
        console.log('Calling isTypeSupported with: ' + maxSupportedType);
        expect(MediaSource.isTypeSupported(maxSupportedType))
            .withContext(`MediaSource.isTypeSupported("${maxSupportedType}")`)
            .toBeTrue();
      });
    }

    createHfrSupportTest('H.264', 'mp4', 'avc1.4d401e', 60);
    createHfrSupportTest('VP9', 'webm', vp9Codec.getVp9CodecString(), 60);
    createHfrSupportTest('AV1', 'mp4', av1Codec.getAv1CodecString(), 60, false);
    createHfrSupportTest('H.264', 'mp4', 'avc1.4d401e', 120, false);
    createHfrSupportTest(
        'VP9', 'webm', vp9Codec.getVp9CodecString(), 120, false);
    createHfrSupportTest(
        'AV1', 'mp4', av1Codec.getAv1CodecString(), 120, false);

    it('isTypeSupported EOTF Support', () => {
      checkMandatory(playbackUtil.isHdrSupported());
      const smpte2084Type = playbackUtil.createVideoFormatStr(
          'webm', vp9Codec.getPqVp9CodecString(), 1280, 720, 30, null,
          'eotf=smpte2084');
      const hlgType = playbackUtil.createVideoFormatStr(
          'webm', vp9Codec.getHlgVp9CodecString(), 1280, 720, 30, null,
          'eotf=arib-std-b67');
      const invalidType = playbackUtil.createVideoFormatStr(
          'webm', vp9Codec.getHlgVp9CodecString(), 1280, 720, 30, null,
          'eotf=strobevision');

      console.log('Calling isTypeSupported with: ' + smpte2084Type);
      expect(MediaSource.isTypeSupported(smpte2084Type))
          .withContext(`MediaSource.isTypeSupported("${smpte2084Type}")`)
          .toBeTrue();

      console.log('Calling isTypeSupported with: ' + hlgType);
      expect(MediaSource.isTypeSupported(hlgType))
          .withContext(`MediaSource.isTypeSupported("${hlgType}")`)
          .toBeTrue();

      console.log('Calling isTypeSupported with: ' + invalidType);
      expect(MediaSource.isTypeSupported(invalidType))
          .withContext(`MediaSource.isTypeSupported("${invalidType}")`)
          .toBeFalse();
    });

    it('VP9.2 SMPTE2084 Support', () => {
      checkMandatory(playbackUtil.isHdrSupported());
      const vp9SMPTEStr = playbackUtil.createVideoFormatStr(
          'webm', vp9Codec.getPqVp9CodecString(), null, null, null, null,
          'eotf=smpte2084');
      console.log('Calling isTypeSupported with: ' + vp9SMPTEStr);
      expect(MediaSource.isTypeSupported(vp9SMPTEStr))
          .withContext(`MediaSource.isTypeSupported("${vp9SMPTEStr}")`)
          .toBeTrue();
    });

    it('VP9.2 ARIB STD-B67 Support', () => {
      checkMandatory(playbackUtil.isHdrSupported());
      const vp9ARIBStr = playbackUtil.createVideoFormatStr(
          'webm', vp9Codec.getHlgVp9CodecString(), null, null, null, null,
          'eotf=arib-std-b67');
      console.log('Calling isTypeSupported with: ' + vp9ARIBStr);
      expect(MediaSource.isTypeSupported(vp9ARIBStr))
          .withContext(`MediaSource.isTypeSupported("${vp9ARIBStr}")`)
          .toBeTrue();
    });
  });

  describe('Video / Audio', () => {
    /**
     * Creates a test checking the support of a specific media format.
     * @param name Test name.
     * @param stream The stream MIME type prefix (e.g., 'video/mp4').
     * @param codec The codec string.
     * @param mandatory Whether the test is mandatory. Defaults to true.
     */
    function createMediaFormatTest(
        name: string,
        stream: string,
        codec: string,
        mandatory = true,
    ) {
      it(name, () => {
        checkMandatory(mandatory);
        const typeStr = `${stream}; codecs="${codec}"`;
        console.log('Calling isTypeSupported with: ' + typeStr);
        expect(MediaSource.isTypeSupported(typeStr))
            .withContext(`MediaSource.isTypeSupported("${typeStr}")`)
            .toBeTrue();
      });
    }

    createMediaFormatTest('MP4 + H.264', 'video/mp4', 'avc1.4d401e');
    createMediaFormatTest(
        'WebM + VP9 Short-Form', 'video/webm', vp9Codec.getVp9CodecString());
    createMediaFormatTest(
        'WebM + VP9 Medium-Form', 'video/webm',
        vp9Codec.getVp9CodecString(undefined, 'M'));
    createMediaFormatTest(
        'WebM + VP9 Long-Form', 'video/webm',
        vp9Codec.getVp9CodecString(undefined, 'L'));
    createMediaFormatTest(
        'WebM + VP9 Profile 2 HLG Medium-Form', 'video/webm',
        vp9Codec.getVp9CodecString(vp9Codec.HLG_VP9_METADATA, 'M'),
        playbackUtil.isHdrSupported());
    createMediaFormatTest(
        'WebM + VP9 Profile 2 HLG Long-Form', 'video/webm',
        vp9Codec.getVp9CodecString(vp9Codec.HLG_VP9_METADATA, 'L'),
        playbackUtil.isHdrSupported());
    createMediaFormatTest(
        'WebM + VP9 Profile 2 PQ Medium-Form', 'video/webm',
        vp9Codec.getVp9CodecString(vp9Codec.PQ_VP9_METADATA, 'M'),
        playbackUtil.isHdrSupported());
    createMediaFormatTest(
        'WebM + VP9 Profile 2 PQ Long-Form', 'video/webm',
        vp9Codec.getVp9CodecString(vp9Codec.PQ_VP9_METADATA, 'L'),
        playbackUtil.isHdrSupported());
    createMediaFormatTest('WebM + Opus', 'audio/webm', 'opus', false);
    createMediaFormatTest('MP4 + AC3', 'audio/mp4', 'ac-3', false);
    createMediaFormatTest('MP4 + EAC3', 'audio/mp4', 'ec-3', false);

    createMediaFormatTest(
        'MP4 + AV1 (Level 4.1 8-bit BT.709 Short-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '4.1'}));
    createMediaFormatTest(
        'MP4 + AV1 (Level 4.1 8-bit BT.709 Long-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '4.1'}, true));
    createMediaFormatTest(
        'MP4 + AV1 (Level 5.1 8-bit BT.709 Short-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '5.1'}), util.isAv1GtFHD());
    createMediaFormatTest(
        'MP4 + AV1 (Level 5.1 8-bit BT.709 Long-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '5.1'}, true), util.isAv1GtFHD());
    createMediaFormatTest(
        'MP4 + AV1 (Level 5.1 10-bit BT.709 Short-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '5.1', bitDepth: 10}),
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createMediaFormatTest(
        'MP4 + AV1 (Level 5.1 10-bit BT.709 Long-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '5.1', bitDepth: 10}, true),
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createMediaFormatTest(
        'MP4 + AV1 (Level 5.1 10-bit HLG)', 'video/mp4',
        av1Codec.getHlgAv1CodecString({level: '5.1'}),
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createMediaFormatTest(
        'MP4 + AV1 (Level 5.1 10-bit PQ)', 'video/mp4',
        av1Codec.getPqAv1CodecString({level: '5.1'}),
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createMediaFormatTest(
        'MP4 + AV1 (Level 6.0 8-bit BT.709 Short-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '6.0'}), util.isAv1Gt4K());
    createMediaFormatTest(
        'MP4 + AV1 (Level 6.0 8-bit BT.709 Long-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '6.0'}, true), util.isAv1Gt4K());
    createMediaFormatTest(
        'MP4 + AV1 (Level 6.0 10-bit BT.709 Short-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '6.0', bitDepth: 10}),
        util.isAv1Gt4K() && playbackUtil.isHdrSupported());
    createMediaFormatTest(
        'MP4 + AV1 (Level 6.0 10-bit BT.709 Long-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '6.0', bitDepth: 10}, true),
        util.isAv1Gt4K() && playbackUtil.isHdrSupported());
    createMediaFormatTest(
        'MP4 + AV1 (Level 6.0 10-bit HLG)', 'video/mp4',
        av1Codec.getHlgAv1CodecString({level: '6.0'}),
        util.isAv1Gt4K() && playbackUtil.isHdrSupported());
    createMediaFormatTest(
        'MP4 + AV1 (Level 6.0 10-bit PQ)', 'video/mp4',
        av1Codec.getPqAv1CodecString({level: '6.0'}),
        util.isAv1Gt4K() && playbackUtil.isHdrSupported());
  });

  describe('VP9 Live', () => {
    /**
     * Creates a playback test for VP9 live streams.
     * @param name Test name.
     * @param videoStream Definition of the video stream.
     */
    function createLiveTest(
        name: string,
        videoStream: StreamDef,
        stopTime: number,
    ) {
      it(name, (done) => {
        activeStream = setupMse(
            video, videoStream, AAC['AudioForVP9Live'] as StreamDef, stopTime);
        monitorPlayback(done, stopTime);
      }, DEFAULT_TIMEOUT_MS);
    }
    createLiveTest('Playback', VP9['VideoLive'] as StreamDef, 14);
    createLiveTest('PartialSegmentPlayback', VP9['VideoLive'] as StreamDef, 3);
  });

  describe('VP9 HDR', () => {
    /**
     * Creates a test for a 10-bit VP9 HDR stream.
     * @param videoStream Definition of the VP9 video stream.
     */
    function create10BitVp9Test(videoStream: StreamDef) {
      const fps = videoStream.get('fps') as number;
      const resolution = videoStream.get('resolution') as string;
      const transfer = videoStream.get('transferFunction') as string;
      const mandatory = util.isVp9Gt4K() || (util.isVp9GtFHD() && fps <= 30);
      const name = `VP9.Profile2.10Bit.${transfer}.${resolution}${fps}`;

      let audioStream = AAC['AudioNormal'] as StreamDef;
      if (transfer === 'PQ' && fps > 30) {
        audioStream = AAC['AudioMeridian'] as StreamDef;
      }

      it(name, (done) => {
        checkMandatory(mandatory);
        activeStream =
            setupMse(video, videoStream, audioStream, DEFAULT_DURATION);
        monitorPlayback(done, DEFAULT_DURATION);
      }, DEFAULT_TIMEOUT_MS);
    }

    const vp9HdrStreams = [
      VP9['HdrHlgUltralow'],   VP9['HdrHlgLow'],      VP9['HdrHlgMed'],
      VP9['HdrHlgHigh'],       VP9['HdrHlg720p'],     VP9['HdrHlg1080p'],
      VP9['HdrHlg2k'],         VP9['HdrHlg4k'],       VP9['HdrHlgUltralowHfr'],
      VP9['HdrHlgLowHfr'],     VP9['HdrHlgMedHfr'],   VP9['HdrHlgHighHfr'],
      VP9['HdrHlg720pHfr'],    VP9['HdrHlg1080pHfr'], VP9['HdrHlg2kHfr'],
      VP9['HdrHlg4kHfr'],      VP9['HdrPqUltralow'],  VP9['HdrPqLow'],
      VP9['HdrPqMed'],         VP9['HdrPqHigh'],      VP9['HdrPq720p'],
      VP9['HdrPq1080p'],       VP9['HdrPq2k'],        VP9['HdrPq4k'],
      VP9['HdrPqUltralowHfr'], VP9['HdrPqLowHfr'],    VP9['HdrPqMedHfr'],
      VP9['HdrPqHighHfr'],     VP9['HdrPq720pHfr'],   VP9['HdrPq1080pHfr'],
      VP9['HdrPq2kHfr'],       VP9['HdrPq4kHfr']
    ];

    for (let i = 0; i < vp9HdrStreams.length; i++) {
      create10BitVp9Test(vp9HdrStreams[i] as StreamDef);
    }
  });

  describe('MIME Type Support', () => {
    /**
     * Creates a test that checks MediaSource MIME type support.
     * @param name Test name suffix.
     * @param mimetype The MIME type string to verify.
     * @param mandatory Whether the test is mandatory. Defaults to true.
     */
    function createMimeTypeTest(
        name: string,
        mimetype: string,
        mandatory = true,
    ) {
      it(`${name}Support`, () => {
        checkMandatory(mandatory);
        console.log('Calling isTypeSupported with: ' + mimetype);
        expect(MediaSource.isTypeSupported(mimetype))
            .withContext(`MediaSource.isTypeSupported("${mimetype}")`)
            .toBeTrue();
      });
    }

    createMimeTypeTest('AAC', AAC_STREAMS.mimetype);
    createMimeTypeTest('H264', H264_STREAMS.mimetype);
    createMimeTypeTest('VP9 Short-Form', VP9_STREAMS.mimetype);
    createMimeTypeTest(
        'VP9 Medium-Form',
        'video/webm; codecs="' + vp9Codec.getVp9CodecString(undefined, 'M') +
            '"');
    createMimeTypeTest(
        'VP9 Long-Form',
        'video/webm; codecs="' + vp9Codec.getVp9CodecString(undefined, 'L') +
            '"');
    createMimeTypeTest('Opus', OPUS_STREAMS.mimetype);
    createMimeTypeTest('AC3', AC3_STREAMS.mimetype, false);
    createMimeTypeTest('EAC3', EAC3_STREAMS.mimetype, false);
    createMimeTypeTest('AV1 Short-Form', AV1_STREAMS.mimetype);
    createMimeTypeTest(
        'AV1 Long-Form',
        'video/mp4; codecs="' + av1Codec.getAv1CodecString({}, true) + '"');
  });

  describe('Media', () => {
    /**
     * Creates a playback test for 5.1 multichannel audio.
     * @param name Test name.
     * @param audioStream Definition of the audio stream.
     * @param mandatory Whether the test is mandatory. Defaults to true.
     */
    function createAudio51Test(
        name: string, audioStream: StreamDef, mandatory = true) {
      it(name, (done) => {
        const stopTime = 2;
        checkMandatory(mandatory);
        activeStream = setupMse(video, null, audioStream, stopTime);
        monitorPlayback(done, stopTime);
      }, DEFAULT_TIMEOUT_MS);
    }

    createAudio51Test('Opus 5.1', Opus['Audio51'] as StreamDef, false);
    createAudio51Test('AAC 5.1', AAC['Audio51'] as StreamDef);
    createAudio51Test('AC3 5.1', AC3['Audio51'] as StreamDef, util.isGtFHD());
    createAudio51Test('EAC3 5.1', EAC3['Audio51'] as StreamDef, util.isGtFHD());
  });

  describe('AV1', () => {
    /**
     * Creates a playback test for an AV1 SDR stream.
     * @param videoStream Definition of the AV1 SDR video stream.
     */
    function createAv1SdrTest(videoStream: StreamDef) {
      const fps = videoStream.get('fps') as number;
      const resolution = videoStream.get('resolution') as string;
      const name = `AV1.8Bit.BT709.${resolution}${fps}`;

      const av1Metadata = videoStream.get('codecMetadata') as {level: string};
      const av1Level = Number(av1Metadata.level);
      const mandatory = av1Level < 5.0 || util.isAv1Gt4K();

      it(name, (done) => {
        checkMandatory(mandatory);
        activeStream = setupMse(
            video, videoStream, AAC['AudioNormal'] as StreamDef,
            DEFAULT_DURATION);
        monitorPlayback(done, DEFAULT_DURATION);
      }, DEFAULT_TIMEOUT_MS);
    }

    /**
     * Creates a playback test for an AV1 HDR stream.
     * @param videoStream Definition of the AV1 HDR video stream.
     */
    function createAv1HdrTest(videoStream: StreamDef) {
      const fps = videoStream.get('fps') as number;
      const resolution = videoStream.get('resolution') as string;
      const transfer = videoStream.get('transferFunction') as string;
      const name = `AV1.10Bit.${transfer}.${resolution}${fps}`;

      const isHdr = playbackUtil.isHdrSupported();
      const av1Metadata = videoStream.get('codecMetadata') as {
        level: string;
        bitDepth: number;
      };
      const av1Level = Number(av1Metadata.level);
      let mandatory: boolean;
      if (av1Level < 5.0) {
        mandatory = isHdr;
      } else if (av1Level < 6.0) {
        mandatory = isHdr && util.isAv1GtFHD();
      } else {
        mandatory = isHdr && util.isAv1Gt4K();
      }

      it(name, (done) => {
        checkMandatory(mandatory);
        activeStream = setupMse(
            video, videoStream, AAC['AudioNormal'] as StreamDef,
            DEFAULT_DURATION);
        monitorPlayback(done, DEFAULT_DURATION);
      }, DEFAULT_TIMEOUT_MS);
    }

    const av1SdrStreams = [
      AV1['Sdr144p'], AV1['Sdr240p'], AV1['Sdr360p'], AV1['Sdr480p'],
      AV1['Sdr720p30'], AV1['Sdr720p60'], AV1['Sdr1080p30'], AV1['Sdr1080p60'],
      AV1['Sdr1440p30'], AV1['Sdr1440p60'], AV1['Sdr2160p30'],
      AV1['Sdr2160p60'], AV1['Sdr4320p30']
    ];

    const av1HdrStreams = [
      AV1['HdrHlg144p'],    AV1['HdrHlg240p'],    AV1['HdrHlg360p'],
      AV1['HdrHlg480p'],    AV1['HdrHlg720p24'],  AV1['HdrHlg720p60'],
      AV1['HdrHlg1080p24'], AV1['HdrHlg1080p60'], AV1['HdrHlg1440p24'],
      AV1['HdrHlg1440p60'], AV1['HdrHlg2160p24'], AV1['HdrHlg2160p60'],
      AV1['HdrPq144p'],     AV1['HdrPq240p'],     AV1['HdrPq360p'],
      AV1['HdrPq480p'],     AV1['HdrPq720p24'],   AV1['HdrPq720p60'],
      AV1['HdrPq1080p24'],  AV1['HdrPq1080p60'],  AV1['HdrPq1440p24'],
      AV1['HdrPq1440p60'],  AV1['HdrPq2160p24'],  AV1['HdrPq2160p60']
    ];

    for (let i = 0; i < av1SdrStreams.length; i++) {
      createAv1SdrTest(av1SdrStreams[i] as StreamDef);
    }

    for (let i = 0; i < av1HdrStreams.length; i++) {
      createAv1HdrTest(av1HdrStreams[i] as StreamDef);
    }
  });
});
