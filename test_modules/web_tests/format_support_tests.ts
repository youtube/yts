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
    const onTimeUpdate = () => {
      playbackUtil.logPlaybackProgress(video, timeUpdateCount++);
      if (!video.paused && video.currentTime >= duration) {
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.pause();
        expect(video.currentTime)
            .withContext('video.currentTime')
            .toBeGreaterThanOrEqual(duration);
        done();
      }
    };
    video.addEventListener('timeupdate', onTimeUpdate);

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
    yts.test({id: '20.1.1.2'});
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

    yts.test({id: '20.1.2.1'});
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

    yts.test({id: '20.1.3.1'});
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
        id: string,
        format: string,
        container: string,
        codec: string,
        fps: number,
        mandatory = true,
    ) {
      yts.test({id});
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

    createHfrSupportTest('20.1.1.1', 'H.264', 'mp4', 'avc1.4d401e', 60);
    createHfrSupportTest('20.1.5.2', 'VP9', 'webm', vp9Codec.getVp9CodecString(), 60);
    createHfrSupportTest('20.1.6.1', 'AV1', 'mp4', av1Codec.getAv1CodecString(), 60, false);
    createHfrSupportTest('20.1.1.1', 'H.264', 'mp4', 'avc1.4d401e', 120, false);
    createHfrSupportTest('20.1.5.2',
        'VP9', 'webm', vp9Codec.getVp9CodecString(), 120, false);
    createHfrSupportTest('20.1.6.1',
        'AV1', 'mp4', av1Codec.getAv1CodecString(), 120, false);

    yts.test({id: '20.1.10.2'});
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

    yts.test({id: '20.1.11.2'});
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

    yts.test({id: '20.1.12.2'});
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
  id: string,

        name: string,
        stream: string,
        codec: string,
        mandatory = true,
    ) {
      yts.test({id});
      it(name, () => {
        checkMandatory(mandatory);
        const typeStr = `${stream}; codecs="${codec}"`;
        console.log('Calling isTypeSupported with: ' + typeStr);
        expect(MediaSource.isTypeSupported(typeStr))
            .withContext(`MediaSource.isTypeSupported("${typeStr}")`)
            .toBeTrue();
      });
    }

    createMediaFormatTest('20.2.1.1', 'MP4 + H.264', 'video/mp4', 'avc1.4d401e');
    createMediaFormatTest('20.2.2.2',
        'WebM + VP9 Short-Form', 'video/webm', vp9Codec.getVp9CodecString());
    createMediaFormatTest('20.2.24.1',
        'WebM + VP9 Medium-Form', 'video/webm',
        vp9Codec.getVp9CodecString(undefined, 'M'));
    createMediaFormatTest('20.2.25.1',
        'WebM + VP9 Long-Form', 'video/webm',
        vp9Codec.getVp9CodecString(undefined, 'L'));
    createMediaFormatTest('20.2.3.2',
        'WebM + VP9 Profile 2 HLG Medium-Form', 'video/webm',
        vp9Codec.getVp9CodecString(vp9Codec.HLG_VP9_METADATA, 'M'),
        playbackUtil.isHdrSupported());
    createMediaFormatTest('20.2.21.1',
        'WebM + VP9 Profile 2 HLG Long-Form', 'video/webm',
        vp9Codec.getVp9CodecString(vp9Codec.HLG_VP9_METADATA, 'L'),
        playbackUtil.isHdrSupported());
    createMediaFormatTest('20.2.22.1',
        'WebM + VP9 Profile 2 PQ Medium-Form', 'video/webm',
        vp9Codec.getVp9CodecString(vp9Codec.PQ_VP9_METADATA, 'M'),
        playbackUtil.isHdrSupported());
    createMediaFormatTest('20.2.23.1',
        'WebM + VP9 Profile 2 PQ Long-Form', 'video/webm',
        vp9Codec.getVp9CodecString(vp9Codec.PQ_VP9_METADATA, 'L'),
        playbackUtil.isHdrSupported());
    createMediaFormatTest('20.2.4.1', 'WebM + Opus', 'audio/webm', 'opus', false);
    createMediaFormatTest('20.2.5.1', 'MP4 + AC3', 'audio/mp4', 'ac-3', false);
    createMediaFormatTest('20.2.6.1', 'MP4 + EAC3', 'audio/mp4', 'ec-3', false);

    createMediaFormatTest('20.2.7.1',
        'MP4 + AV1 (Level 4.1 8-bit BT.709 Short-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '4.1'}));
    createMediaFormatTest('20.2.16.1',
        'MP4 + AV1 (Level 4.1 8-bit BT.709 Long-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '4.1'}, true));
    createMediaFormatTest('20.2.8.1',
        'MP4 + AV1 (Level 5.1 8-bit BT.709 Short-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '5.1'}), util.isAv1GtFHD());
    createMediaFormatTest('20.2.17.1',
        'MP4 + AV1 (Level 5.1 8-bit BT.709 Long-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '5.1'}, true), util.isAv1GtFHD());
    createMediaFormatTest('20.2.9.1',
        'MP4 + AV1 (Level 5.1 10-bit BT.709 Short-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '5.1', bitDepth: 10}),
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createMediaFormatTest('20.2.18.1',
        'MP4 + AV1 (Level 5.1 10-bit BT.709 Long-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '5.1', bitDepth: 10}, true),
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createMediaFormatTest('20.2.12.1',
        'MP4 + AV1 (Level 5.1 10-bit HLG)', 'video/mp4',
        av1Codec.getHlgAv1CodecString({level: '5.1'}),
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createMediaFormatTest('20.2.13.1',
        'MP4 + AV1 (Level 5.1 10-bit PQ)', 'video/mp4',
        av1Codec.getPqAv1CodecString({level: '5.1'}),
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createMediaFormatTest('20.2.10.1',
        'MP4 + AV1 (Level 6.0 8-bit BT.709 Short-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '6.0'}), util.isAv1Gt4K());
    createMediaFormatTest('20.2.19.1',
        'MP4 + AV1 (Level 6.0 8-bit BT.709 Long-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '6.0'}, true), util.isAv1Gt4K());
    createMediaFormatTest('20.2.11.1',
        'MP4 + AV1 (Level 6.0 10-bit BT.709 Short-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '6.0', bitDepth: 10}),
        util.isAv1Gt4K() && playbackUtil.isHdrSupported());
    createMediaFormatTest('20.2.20.1',
        'MP4 + AV1 (Level 6.0 10-bit BT.709 Long-Form Codec)', 'video/mp4',
        av1Codec.getAv1CodecString({level: '6.0', bitDepth: 10}, true),
        util.isAv1Gt4K() && playbackUtil.isHdrSupported());
    createMediaFormatTest('20.2.14.1',
        'MP4 + AV1 (Level 6.0 10-bit HLG)', 'video/mp4',
        av1Codec.getHlgAv1CodecString({level: '6.0'}),
        util.isAv1Gt4K() && playbackUtil.isHdrSupported());
    createMediaFormatTest('20.2.15.1',
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
  id: string,

        name: string,
        videoStream: StreamDef,
        stopTime: number,
    ) {
      yts.test({id});
      it(name, (done) => {
        activeStream = setupMse(
            video, videoStream, AAC['AudioForVP9Live'] as StreamDef, stopTime);
        monitorPlayback(done, stopTime);
      }, DEFAULT_TIMEOUT_MS);
    }
    createLiveTest('20.3.1.1', 'Playback', VP9['VideoLive'] as StreamDef, 14);
    createLiveTest('20.3.2.1', 'PartialSegmentPlayback', VP9['VideoLive'] as StreamDef, 3);
  });

  describe('VP9 HDR', () => {
    /**
     * Creates a test for a 10-bit VP9 HDR stream.
     * @param videoStream Definition of the VP9 video stream.
     */
    function create10BitVp9Test(id: string, videoStream: StreamDef) {
      const fps = videoStream.get('fps') as number;
      const resolution = videoStream.get('resolution') as string;
      const transfer = videoStream.get('transferFunction') as string;
      const mandatory = util.isVp9Gt4K() || (util.isVp9GtFHD() && fps <= 30);
      const name = `VP9.Profile2.10Bit.${transfer}.${resolution}${fps}`;

      let audioStream = AAC['AudioNormal'] as StreamDef;
      if (transfer === 'PQ' && fps > 30) {
        audioStream = AAC['AudioMeridian'] as StreamDef;
      }

      yts.test({id});
      it(name, (done) => {
        checkMandatory(mandatory);
        activeStream =
            setupMse(video, videoStream, audioStream, DEFAULT_DURATION);
        monitorPlayback(done, DEFAULT_DURATION);
      }, DEFAULT_TIMEOUT_MS);
    }

    const vp9HdrStreams: Array<{id: string; stream: StreamDef}> = [
      {id: '20.4.1.1', stream: VP9['HdrHlgUltralow'] as StreamDef},
      {id: '20.4.2.1', stream: VP9['HdrHlgLow'] as StreamDef},
      {id: '20.4.3.1', stream: VP9['HdrHlgMed'] as StreamDef},
      {id: '20.4.4.1', stream: VP9['HdrHlgHigh'] as StreamDef},
      {id: '20.4.5.1', stream: VP9['HdrHlg720p'] as StreamDef},
      {id: '20.4.6.1', stream: VP9['HdrHlg1080p'] as StreamDef},
      {id: '20.4.7.1', stream: VP9['HdrHlg2k'] as StreamDef},
      {id: '20.4.8.1', stream: VP9['HdrHlg4k'] as StreamDef},
      {id: '20.4.9.1', stream: VP9['HdrHlgUltralowHfr'] as StreamDef},
      {id: '20.4.10.1', stream: VP9['HdrHlgLowHfr'] as StreamDef},
      {id: '20.4.11.1', stream: VP9['HdrHlgMedHfr'] as StreamDef},
      {id: '20.4.12.1', stream: VP9['HdrHlgHighHfr'] as StreamDef},
      {id: '20.4.13.1', stream: VP9['HdrHlg720pHfr'] as StreamDef},
      {id: '20.4.14.1', stream: VP9['HdrHlg1080pHfr'] as StreamDef},
      {id: '20.4.15.1', stream: VP9['HdrHlg2kHfr'] as StreamDef},
      {id: '20.4.16.1', stream: VP9['HdrHlg4kHfr'] as StreamDef},
      {id: '20.4.17.1', stream: VP9['HdrPqUltralow'] as StreamDef},
      {id: '20.4.18.1', stream: VP9['HdrPqLow'] as StreamDef},
      {id: '20.4.19.1', stream: VP9['HdrPqMed'] as StreamDef},
      {id: '20.4.20.1', stream: VP9['HdrPqHigh'] as StreamDef},
      {id: '20.4.21.1', stream: VP9['HdrPq720p'] as StreamDef},
      {id: '20.4.22.1', stream: VP9['HdrPq1080p'] as StreamDef},
      {id: '20.4.23.1', stream: VP9['HdrPq2k'] as StreamDef},
      {id: '20.4.24.1', stream: VP9['HdrPq4k'] as StreamDef},
      {id: '20.4.25.1', stream: VP9['HdrPqUltralowHfr'] as StreamDef},
      {id: '20.4.26.1', stream: VP9['HdrPqLowHfr'] as StreamDef},
      {id: '20.4.27.1', stream: VP9['HdrPqMedHfr'] as StreamDef},
      {id: '20.4.28.1', stream: VP9['HdrPqHighHfr'] as StreamDef},
      {id: '20.4.29.1', stream: VP9['HdrPq720pHfr'] as StreamDef},
      {id: '20.4.30.1', stream: VP9['HdrPq1080pHfr'] as StreamDef},
      {id: '20.4.31.1', stream: VP9['HdrPq2kHfr'] as StreamDef},
      {id: '20.4.32.1', stream: VP9['HdrPq4kHfr'] as StreamDef},
    ];

    for (const item of vp9HdrStreams) {
      create10BitVp9Test(item.id, item.stream);
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
  id: string,

        name: string,
        mimetype: string,
        mandatory = true,
    ) {
      yts.test({id});
      it(`${name}Support`, () => {
        checkMandatory(mandatory);
        console.log('Calling isTypeSupported with: ' + mimetype);
        expect(MediaSource.isTypeSupported(mimetype))
            .withContext(`MediaSource.isTypeSupported("${mimetype}")`)
            .toBeTrue();
      });
    }

    createMimeTypeTest('20.5.1.1', 'AAC', AAC_STREAMS.mimetype);
    createMimeTypeTest('20.5.2.1', 'H264', H264_STREAMS.mimetype);
    createMimeTypeTest('20.2.2.2', 'VP9 Short-Form', VP9_STREAMS.mimetype);
    createMimeTypeTest(
        '20.2.24.1', 'VP9 Medium-Form',
        'video/webm; codecs="' + vp9Codec.getVp9CodecString(undefined, 'M') +
            '"');
    createMimeTypeTest(
        '20.2.25.1', 'VP9 Long-Form',
        'video/webm; codecs="' + vp9Codec.getVp9CodecString(undefined, 'L') +
            '"');
    createMimeTypeTest('20.2.4.1', 'Opus', OPUS_STREAMS.mimetype);
    createMimeTypeTest('20.2.5.1', 'AC3', AC3_STREAMS.mimetype, false);
    createMimeTypeTest('20.2.6.1', 'EAC3', EAC3_STREAMS.mimetype, false);
    createMimeTypeTest('20.5.9.1', 'AV1 Short-Form', AV1_STREAMS.mimetype);
    createMimeTypeTest(
        '20.5.10.1', 'AV1 Long-Form',
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
  id: string,

        name: string, audioStream: StreamDef, mandatory = true) {
      yts.test({id});
      it(name, (done) => {
        const stopTime = 2;
        checkMandatory(mandatory);
        activeStream = setupMse(video, null, audioStream, stopTime);
        monitorPlayback(done, stopTime);
      }, DEFAULT_TIMEOUT_MS);
    }

    createAudio51Test('20.6.3.1', 'Opus 5.1', Opus['Audio51'] as StreamDef, false);
    createAudio51Test('20.6.4.1', 'AAC 5.1', AAC['Audio51'] as StreamDef);
    createAudio51Test('20.6.5.1', 'AC3 5.1', AC3['Audio51'] as StreamDef, util.isGtFHD());
    createAudio51Test('20.6.6.1', 'EAC3 5.1', EAC3['Audio51'] as StreamDef, util.isGtFHD());
  });

  describe('AV1', () => {
    /**
     * Creates a playback test for an AV1 SDR stream.
     * @param videoStream Definition of the AV1 SDR video stream.
     */
    function createAv1SdrTest(id: string, videoStream: StreamDef) {
      const fps = videoStream.get('fps') as number;
      const resolution = videoStream.get('resolution') as string;
      const name = `AV1.8Bit.BT709.${resolution}${fps}`;

      const av1Metadata = videoStream.get('codecMetadata') as {level: string};
      const av1Level = Number(av1Metadata.level);
      const mandatory = av1Level < 5.0 || util.isAv1Gt4K();

      yts.test({id});
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
    function createAv1HdrTest(id: string, videoStream: StreamDef) {
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

      yts.test({id});
      it(name, (done) => {
        checkMandatory(mandatory);
        activeStream = setupMse(
            video, videoStream, AAC['AudioNormal'] as StreamDef,
            DEFAULT_DURATION);
        monitorPlayback(done, DEFAULT_DURATION);
      }, DEFAULT_TIMEOUT_MS);
    }

    const av1SdrStreams: Array<{id: string; stream: StreamDef}> = [
      {id: '20.7.1.1', stream: AV1['Sdr144p'] as StreamDef},
      {id: '20.7.2.1', stream: AV1['Sdr240p'] as StreamDef},
      {id: '20.7.3.1', stream: AV1['Sdr360p'] as StreamDef},
      {id: '20.7.4.1', stream: AV1['Sdr480p'] as StreamDef},
      {id: '20.7.5.1', stream: AV1['Sdr720p30'] as StreamDef},
      {id: '20.7.6.1', stream: AV1['Sdr720p60'] as StreamDef},
      {id: '20.7.7.1', stream: AV1['Sdr1080p30'] as StreamDef},
      {id: '20.7.8.1', stream: AV1['Sdr1080p60'] as StreamDef},
      {id: '20.7.9.1', stream: AV1['Sdr1440p30'] as StreamDef},
      {id: '20.7.10.1', stream: AV1['Sdr1440p60'] as StreamDef},
      {id: '20.7.11.1', stream: AV1['Sdr2160p30'] as StreamDef},
      {id: '20.7.12.1', stream: AV1['Sdr2160p60'] as StreamDef},
      {id: '20.7.13.1', stream: AV1['Sdr4320p30'] as StreamDef},
    ];

    const av1HdrStreams: Array<{id: string; stream: StreamDef}> = [
      {id: '20.7.14.1', stream: AV1['HdrHlg144p'] as StreamDef},
      {id: '20.7.15.1', stream: AV1['HdrHlg240p'] as StreamDef},
      {id: '20.7.16.1', stream: AV1['HdrHlg360p'] as StreamDef},
      {id: '20.7.17.1', stream: AV1['HdrHlg480p'] as StreamDef},
      {id: '20.7.18.1', stream: AV1['HdrHlg720p24'] as StreamDef},
      {id: '20.7.19.1', stream: AV1['HdrHlg720p60'] as StreamDef},
      {id: '20.7.20.1', stream: AV1['HdrHlg1080p24'] as StreamDef},
      {id: '20.7.21.1', stream: AV1['HdrHlg1080p60'] as StreamDef},
      {id: '20.7.22.1', stream: AV1['HdrHlg1440p24'] as StreamDef},
      {id: '20.7.23.1', stream: AV1['HdrHlg1440p60'] as StreamDef},
      {id: '20.7.24.1', stream: AV1['HdrHlg2160p24'] as StreamDef},
      {id: '20.7.25.1', stream: AV1['HdrHlg2160p60'] as StreamDef},
      {id: '20.7.26.1', stream: AV1['HdrPq144p'] as StreamDef},
      {id: '20.7.27.1', stream: AV1['HdrPq240p'] as StreamDef},
      {id: '20.7.28.1', stream: AV1['HdrPq360p'] as StreamDef},
      {id: '20.7.29.1', stream: AV1['HdrPq480p'] as StreamDef},
      {id: '20.7.30.1', stream: AV1['HdrPq720p24'] as StreamDef},
      {id: '20.7.31.1', stream: AV1['HdrPq720p60'] as StreamDef},
      {id: '20.7.32.1', stream: AV1['HdrPq1080p24'] as StreamDef},
      {id: '20.7.33.1', stream: AV1['HdrPq1080p60'] as StreamDef},
      {id: '20.7.34.1', stream: AV1['HdrPq1440p24'] as StreamDef},
      {id: '20.7.35.1', stream: AV1['HdrPq1440p60'] as StreamDef},
      {id: '20.7.36.1', stream: AV1['HdrPq2160p24'] as StreamDef},
      {id: '20.7.37.1', stream: AV1['HdrPq2160p60'] as StreamDef},
    ];

    for (const item of av1SdrStreams) {
      createAv1SdrTest(item.id, item.stream);
    }

    for (const item of av1HdrStreams) {
      createAv1HdrTest(item.id, item.stream);
    }
  });

  describe('Tunnel Mode', () => {
    /**
     * Creates a test checking the support of a specific media format in tunnel mode.
     * @param id The test case sequence ID.
     * @param name Test name.
     * @param stream The stream MIME type prefix (e.g., 'video/mp4').
     * @param codec The codec string.
     * @param mandatory Whether the test is mandatory. Defaults to true.
     */
    function createTunnelModeFormatTest(
        id: string,
        name: string,
        stream: string,
        codec: string,
        mandatory = true,
    ) {
      yts.test({id});
      it(name, () => {
        checkMandatory(mandatory);
        const tunnelType = `${stream}; codecs="${codec}"; tunnelmode=true`;
        console.log('Calling isTypeSupported with: ' + tunnelType);
        expect(MediaSource.isTypeSupported(tunnelType))
            .withContext(`MediaSource.isTypeSupported("${tunnelType}")`)
            .toBe(true);
      });
    }

    createTunnelModeFormatTest(
        '20.8.1.1', 'MP4 + H.264', 'video/mp4', 'avc1.4d401e');
    createTunnelModeFormatTest(
        '20.8.2.1', 'WebM + VP9 Short-Form', 'video/webm',
        vp9Codec.getVp9CodecString());
    createTunnelModeFormatTest(
        '20.8.3.1', 'WebM + VP9 Medium-Form', 'video/webm',
        vp9Codec.getVp9CodecString(undefined, 'M'));
    createTunnelModeFormatTest(
        '20.8.4.1', 'WebM + VP9 Long-Form', 'video/webm',
        vp9Codec.getVp9CodecString(undefined, 'L'));
    createTunnelModeFormatTest(
        '20.8.5.1', 'WebM + VP9 Profile 2 HLG Medium-Form', 'video/webm',
        vp9Codec.getVp9CodecString(vp9Codec.HLG_VP9_METADATA, 'M'),
        playbackUtil.isHdrSupported());
    createTunnelModeFormatTest(
        '20.8.6.1', 'WebM + VP9 Profile 2 HLG Long-Form', 'video/webm',
        vp9Codec.getVp9CodecString(vp9Codec.HLG_VP9_METADATA, 'L'),
        playbackUtil.isHdrSupported());
    createTunnelModeFormatTest(
        '20.8.7.1', 'WebM + VP9 Profile 2 PQ Medium-Form', 'video/webm',
        vp9Codec.getVp9CodecString(vp9Codec.PQ_VP9_METADATA, 'M'),
        playbackUtil.isHdrSupported());
    createTunnelModeFormatTest(
        '20.8.8.1', 'WebM + VP9 Profile 2 PQ Long-Form', 'video/webm',
        vp9Codec.getVp9CodecString(vp9Codec.PQ_VP9_METADATA, 'L'),
        playbackUtil.isHdrSupported());

    createTunnelModeFormatTest(
        '20.8.9.1', 'MP4 + AV1 (Level 4.1 8-bit BT.709 Short-Form Codec)',
        'video/mp4', av1Codec.getAv1CodecString({level: '4.1'}));
    createTunnelModeFormatTest(
        '20.8.10.1', 'MP4 + AV1 (Level 4.1 8-bit BT.709 Long-Form Codec)',
        'video/mp4', av1Codec.getAv1CodecString({level: '4.1'}, true));
    createTunnelModeFormatTest(
        '20.8.11.1', 'MP4 + AV1 (Level 5.1 8-bit BT.709 Short-Form Codec)',
        'video/mp4', av1Codec.getAv1CodecString({level: '5.1'}),
        util.isAv1GtFHD());
    createTunnelModeFormatTest(
        '20.8.12.1', 'MP4 + AV1 (Level 5.1 8-bit BT.709 Long-Form Codec)',
        'video/mp4', av1Codec.getAv1CodecString({level: '5.1'}, true),
        util.isAv1GtFHD());
    createTunnelModeFormatTest(
        '20.8.13.1', 'MP4 + AV1 (Level 5.1 10-bit BT.709 Short-Form Codec)',
        'video/mp4', av1Codec.getAv1CodecString({level: '5.1', bitDepth: 10}),
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createTunnelModeFormatTest(
        '20.8.14.1', 'MP4 + AV1 (Level 5.1 10-bit BT.709 Long-Form Codec)',
        'video/mp4',
        av1Codec.getAv1CodecString({level: '5.1', bitDepth: 10}, true),
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createTunnelModeFormatTest(
        '20.8.15.1', 'MP4 + AV1 (Level 5.1 10-bit HLG)', 'video/mp4',
        av1Codec.getHlgAv1CodecString({level: '5.1'}),
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createTunnelModeFormatTest(
        '20.8.16.1', 'MP4 + AV1 (Level 5.1 10-bit PQ)', 'video/mp4',
        av1Codec.getPqAv1CodecString({level: '5.1'}),
        util.isAv1GtFHD() && playbackUtil.isHdrSupported());
    createTunnelModeFormatTest(
        '20.8.17.1', 'MP4 + AV1 (Level 6.0 8-bit BT.709 Short-Form Codec)',
        'video/mp4', av1Codec.getAv1CodecString({level: '6.0'}),
        util.isAv1Gt4K());
    createTunnelModeFormatTest(
        '20.8.18.1', 'MP4 + AV1 (Level 6.0 8-bit BT.709 Long-Form Codec)',
        'video/mp4', av1Codec.getAv1CodecString({level: '6.0'}, true),
        util.isAv1Gt4K());
    createTunnelModeFormatTest(
        '20.8.19.1', 'MP4 + AV1 (Level 6.0 10-bit BT.709 Short-Form Codec)',
        'video/mp4', av1Codec.getAv1CodecString({level: '6.0', bitDepth: 10}),
        util.isAv1Gt4K() && playbackUtil.isHdrSupported());
    createTunnelModeFormatTest(
        '20.8.20.1', 'MP4 + AV1 (Level 6.0 10-bit BT.709 Long-Form Codec)',
        'video/mp4',
        av1Codec.getAv1CodecString({level: '6.0', bitDepth: 10}, true),
        util.isAv1Gt4K() && playbackUtil.isHdrSupported());
    createTunnelModeFormatTest(
        '20.8.21.1', 'MP4 + AV1 (Level 6.0 10-bit HLG)', 'video/mp4',
        av1Codec.getHlgAv1CodecString({level: '6.0'}),
        util.isAv1Gt4K() && playbackUtil.isHdrSupported());
    createTunnelModeFormatTest(
        '20.8.22.1', 'MP4 + AV1 (Level 6.0 10-bit PQ)', 'video/mp4',
        av1Codec.getPqAv1CodecString({level: '6.0'}),
        util.isAv1Gt4K() && playbackUtil.isHdrSupported());
  });
});


