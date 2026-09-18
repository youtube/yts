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

import * as util from 'google3/third_party/javascript/yts/test_utils/legacy_yts_utils';
import {
  createMimeTypeStr,
  getMaxSupportedWindowSize,
  isHdrSupported,
} from 'google3/third_party/javascript/yts/test_utils/playback_util';
import type {StreamDef} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';
import {AV1, VP9} from 'google3/third_party/javascript/yts/test_utils/streams/media_streams';

describe('Type Support Tests', () => {
  const maxWindow = getMaxSupportedWindowSize();

  function createFullMimeString(stream: StreamDef): string {
    return createMimeTypeStr(
      stream.mimetype,
      undefined,
      stream.get('width') as number,
      stream.get('height') as number,
      stream.get('fps') as number,
      stream.get('spherical') as boolean,
    );
  }

  function checkTypeSupported(mimeStr: string, isMandatory: boolean) {
    if (!isMandatory) {
      yts.markOptional();
    }
    if (!MediaSource.isTypeSupported(mimeStr)) {
      fail(`MIME type not supported: '${mimeStr}'`);
    }
  }

  describe('Shorts VP9', () => {
    const codec = 'video/webm; codecs="vp09.00.51.08"';
    const specs = [
      {id: '27.0.0.1', width: 144, height: 256, fps: 30},
      {id: '27.0.1.1', width: 144, height: 256, fps: 60},
      {id: '27.0.2.1', width: 240, height: 426, fps: 30},
      {id: '27.0.3.1', width: 240, height: 426, fps: 60},
      {id: '27.0.4.1', width: 360, height: 640, fps: 30},
      {id: '27.0.5.1', width: 360, height: 640, fps: 60},
      {id: '27.0.6.1', width: 480, height: 854, fps: 30},
      {id: '27.0.7.1', width: 480, height: 854, fps: 60},
      {id: '27.0.8.1', width: 576, height: 1024, fps: 30},
      {id: '27.0.9.1', width: 576, height: 1024, fps: 60},
      {id: '27.0.10.1', width: 608, height: 1080, fps: 30},
      {id: '27.0.11.1', width: 608, height: 1080, fps: 60},
      {id: '27.0.12.1', width: 720, height: 1280, fps: 30},
      {id: '27.0.13.1', width: 720, height: 1280, fps: 60},
      {id: '27.0.14.1', width: 1080, height: 1920, fps: 30},
      {id: '27.0.15.1', width: 1080, height: 1920, fps: 60},
    ];

    for (const spec of specs) {
      const mimeStr = createMimeTypeStr(
        codec,
        undefined,
        spec.width,
        spec.height,
        spec.fps,
      );
      const isMandatory =
        maxWindow[0] >= spec.width && maxWindow[1] >= spec.height;

      yts.test({id: spec.id});
      it(`VP9 ${spec.width}x${spec.height} ${spec.fps} fps`, () => {
        checkTypeSupported(mimeStr, isMandatory);
      });
    }
  });

  describe('Shorts AV1', () => {
    const codec = 'video/mp4; codecs="av01.0.16M.08"';
    const specs = [
      {id: '27.1.0.1', width: 144, height: 256, fps: 30},
      {id: '27.1.1.1', width: 144, height: 256, fps: 60},
      {id: '27.1.2.1', width: 240, height: 426, fps: 30},
      {id: '27.1.3.1', width: 240, height: 426, fps: 60},
      {id: '27.1.4.1', width: 360, height: 640, fps: 30},
      {id: '27.1.5.1', width: 360, height: 640, fps: 60},
      {id: '27.1.6.1', width: 480, height: 854, fps: 30},
      {id: '27.1.7.1', width: 480, height: 854, fps: 60},
      {id: '27.1.8.1', width: 576, height: 1024, fps: 30},
      {id: '27.1.9.1', width: 576, height: 1024, fps: 60},
      {id: '27.1.10.1', width: 608, height: 1080, fps: 30},
      {id: '27.1.11.1', width: 608, height: 1080, fps: 60},
      {id: '27.1.12.1', width: 720, height: 1280, fps: 30},
      {id: '27.1.13.1', width: 720, height: 1280, fps: 60},
      {id: '27.1.14.1', width: 1080, height: 1920, fps: 30},
      {id: '27.1.15.1', width: 1080, height: 1920, fps: 60},
      {id: '27.1.16.1', width: 1440, height: 2560, fps: 30},
      {id: '27.1.17.1', width: 1440, height: 2560, fps: 60},
      {id: '27.1.18.1', width: 2160, height: 3840, fps: 30},
      {id: '27.1.19.1', width: 2160, height: 3840, fps: 60},
    ];

    for (const spec of specs) {
      const mimeStr = createMimeTypeStr(
        codec,
        undefined,
        spec.width,
        spec.height,
        spec.fps,
      );
      const isMandatory =
        maxWindow[0] >= spec.width && maxWindow[1] >= spec.height;

      yts.test({id: spec.id});
      it(`AV1 ${spec.width}x${spec.height} ${spec.fps} fps`, () => {
        checkTypeSupported(mimeStr, isMandatory);
      });
    }
  });

  describe('Shorts H264', () => {
    const codec = 'video/mp4; codecs="avc1.4d401f"';
    const specs = [
      {id: '27.2.0.1', width: 144, height: 256, fps: 30},
      {id: '27.2.1.1', width: 144, height: 256, fps: 60},
      {id: '27.2.2.1', width: 240, height: 426, fps: 30},
      {id: '27.2.3.1', width: 240, height: 426, fps: 60},
      {id: '27.2.4.1', width: 360, height: 640, fps: 30},
      {id: '27.2.5.1', width: 360, height: 640, fps: 60},
      {id: '27.2.6.1', width: 480, height: 854, fps: 30},
      {id: '27.2.7.1', width: 480, height: 854, fps: 60},
      {id: '27.2.8.1', width: 576, height: 1024, fps: 30},
      {id: '27.2.9.1', width: 576, height: 1024, fps: 60},
      {id: '27.2.10.1', width: 608, height: 1080, fps: 30},
      {id: '27.2.11.1', width: 608, height: 1080, fps: 60},
    ];

    for (const spec of specs) {
      const mimeStr = createMimeTypeStr(
        codec,
        undefined,
        spec.width,
        spec.height,
        spec.fps,
      );
      const isMandatory =
        maxWindow[0] >= spec.width && maxWindow[1] >= spec.height;

      yts.test({id: spec.id});
      it(`H264 ${spec.width}x${spec.height} ${spec.fps} fps`, () => {
        checkTypeSupported(mimeStr, isMandatory);
      });
    }
  });

  describe('AV1 HDR', () => {
    const streamSpecs = [
      {id: '27.7.14.1', stream: AV1['HdrHlg144p']},
      {id: '27.7.15.1', stream: AV1['HdrHlg240p']},
      {id: '27.7.16.1', stream: AV1['HdrHlg360p']},
      {id: '27.7.17.1', stream: AV1['HdrHlg480p']},
      {id: '27.7.18.1', stream: AV1['HdrHlg720p24']},
      {id: '27.7.19.1', stream: AV1['HdrHlg720p60']},
      {id: '27.7.20.1', stream: AV1['HdrHlg1080p24']},
      {id: '27.7.21.1', stream: AV1['HdrHlg1080p60']},
      {id: '27.7.22.1', stream: AV1['HdrHlg1440p24']},
      {id: '27.7.23.1', stream: AV1['HdrHlg1440p60']},
      {id: '27.7.24.1', stream: AV1['HdrHlg2160p24']},
      {id: '27.7.25.1', stream: AV1['HdrHlg2160p60']},
      {id: '27.7.26.1', stream: AV1['HdrPq144p']},
      {id: '27.7.27.1', stream: AV1['HdrPq240p']},
      {id: '27.7.28.1', stream: AV1['HdrPq360p']},
      {id: '27.7.29.1', stream: AV1['HdrPq480p']},
      {id: '27.7.30.1', stream: AV1['HdrPq720p24']},
      {id: '27.7.31.1', stream: AV1['HdrPq720p60']},
      {id: '27.7.32.1', stream: AV1['HdrPq1080p24']},
      {id: '27.7.33.1', stream: AV1['HdrPq1080p60']},
      {id: '27.7.34.1', stream: AV1['HdrPq1440p24']},
      {id: '27.7.35.1', stream: AV1['HdrPq1440p60']},
      {id: '27.7.36.1', stream: AV1['HdrPq2160p24']},
      {id: '27.7.37.1', stream: AV1['HdrPq2160p60']},
    ];

    for (const {stream, id} of streamSpecs) {
      const av1Metadata = stream.get('codecMetadata') as {
        level: string;
        bitDepth: number;
      };
      const av1Level = Number(av1Metadata.level);
      let mandatory = false;

      if (av1Level >= 5.0) {
        mandatory = !!mandatory;
      } else {
        // Replicating legacy operator precedence:
        // mandatory = mandatory && (av1Level < 6.0) ? util.isAv1GtFHD() : util.isAv1Gt4K();
        // Parses as:
        mandatory =
          mandatory && av1Level < 6.0 ? util.isAv1GtFHD() : util.isAv1Gt4K();

        if (av1Metadata.bitDepth >= 10) {
          mandatory = mandatory && isHdrSupported();
        }
      }

      const bitDepth = av1Metadata.bitDepth || 8;
      const transferFunction = stream.get('transferFunction') || 'BT709';
      const resolution = stream.get('resolution');
      const fps = stream.get('fps');
      const testName = `AV1.Shorts.${bitDepth}Bit.${transferFunction}.${resolution}${fps}`;

      const mimeStr = createFullMimeString(stream);

      yts.test({id});
      it(testName, () => {
        checkTypeSupported(mimeStr, mandatory);
      });
    }
  });

  describe('VP9 HDR', () => {
    const streamSpecs = [
      {id: '27.4.1.1', stream: VP9['HdrHlgUltralow']},
      {id: '27.4.2.1', stream: VP9['HdrHlgLow']},
      {id: '27.4.3.1', stream: VP9['HdrHlgMed']},
      {id: '27.4.4.1', stream: VP9['HdrHlgHigh']},
      {id: '27.4.5.1', stream: VP9['HdrHlg720p']},
      {id: '27.4.6.1', stream: VP9['HdrHlg1080p']},
      {id: '27.4.7.1', stream: VP9['HdrHlg2k']},
      {id: '27.4.8.1', stream: VP9['HdrHlg4k']},
      {id: '27.4.9.1', stream: VP9['HdrHlgUltralowHfr']},
      {id: '27.4.10.1', stream: VP9['HdrHlgLowHfr']},
      {id: '27.4.11.1', stream: VP9['HdrHlgMedHfr']},
      {id: '27.4.12.1', stream: VP9['HdrHlgHighHfr']},
      {id: '27.4.13.1', stream: VP9['HdrHlg720pHfr']},
      {id: '27.4.14.1', stream: VP9['HdrHlg1080pHfr']},
      {id: '27.4.15.1', stream: VP9['HdrHlg2kHfr']},
      {id: '27.4.16.1', stream: VP9['HdrHlg4kHfr']},
      {id: '27.4.17.1', stream: VP9['HdrPqUltralow']},
      {id: '27.4.18.1', stream: VP9['HdrPqLow']},
      {id: '27.4.19.1', stream: VP9['HdrPqMed']},
      {id: '27.4.20.1', stream: VP9['HdrPqHigh']},
      {id: '27.4.21.1', stream: VP9['HdrPq720p']},
      {id: '27.4.22.1', stream: VP9['HdrPq1080p']},
      {id: '27.4.23.1', stream: VP9['HdrPq2k']},
      {id: '27.4.24.1', stream: VP9['HdrPq4k']},
      {id: '27.4.25.1', stream: VP9['HdrPqUltralowHfr']},
      {id: '27.4.26.1', stream: VP9['HdrPqLowHfr']},
      {id: '27.4.27.1', stream: VP9['HdrPqMedHfr']},
      {id: '27.4.28.1', stream: VP9['HdrPqHighHfr']},
      {id: '27.4.29.1', stream: VP9['HdrPq720pHfr']},
      {id: '27.4.30.1', stream: VP9['HdrPq1080pHfr']},
      {id: '27.4.31.1', stream: VP9['HdrPq2kHfr']},
      {id: '27.4.32.1', stream: VP9['HdrPq4kHfr']},
    ];

    for (const {stream, id} of streamSpecs) {
      const fps = stream.get('fps') as number;
      const mandatory = util.isVp9Gt4K() || (util.isVp9GtFHD() && fps <= 30);

      const transferFunction = stream.get('transferFunction');
      const resolution = stream.get('resolution');
      const testName = `VP9.Shorts.Profile2.10Bit.${transferFunction}.${resolution}${fps}`;

      const mimeStr = createFullMimeString(stream);

      yts.test({id});
      it(testName, () => {
        checkTypeSupported(mimeStr, mandatory);
      });
    }
  });
});
