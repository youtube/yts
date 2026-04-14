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

import * as util from 'google3/third_party/javascript/yts/test_utils/legacy_yts_utils';
import {
  createMimeTypeStr,
  getMaxSupportedWindowSize,
  isHdrSupported,
} from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {
  AV1,
  StreamDef,
  VP9,
} from 'google3/third_party/javascript/yts/test_utils/streams/media_streams';
import 'jasmine';
import 'yts';

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
    const resolutions = [
      [144, 256],
      [240, 426],
      [360, 640],
      [480, 854],
      [576, 1024],
      [608, 1080],
      [720, 1280],
      [1080, 1920],
      [1440, 2560],
      [2160, 3840],
    ];
    const fpsVals = [30, 60];

    for (const res of resolutions) {
      if (res[1] > 2160) continue;
      for (const fps of fpsVals) {
        const mimeStr = createMimeTypeStr(
          codec,
          undefined,
          res[0],
          res[1],
          fps,
        );
        const isMandatory = maxWindow[0] >= res[0] && maxWindow[1] >= res[1];

        it(`VP9 ${res[0]}x${res[1]} ${fps} fps`, () => {
          checkTypeSupported(mimeStr, isMandatory);
        });
      }
    }
  });

  describe('Shorts AV1', () => {
    const codec = 'video/mp4; codecs="av01.0.16M.08"';
    const resolutions = [
      [144, 256],
      [240, 426],
      [360, 640],
      [480, 854],
      [576, 1024],
      [608, 1080],
      [720, 1280],
      [1080, 1920],
      [1440, 2560],
      [2160, 3840],
    ];
    const fpsVals = [30, 60];

    for (const res of resolutions) {
      for (const fps of fpsVals) {
        const mimeStr = createMimeTypeStr(
          codec,
          undefined,
          res[0],
          res[1],
          fps,
        );
        const isMandatory = maxWindow[0] >= res[0] && maxWindow[1] >= res[1];

        it(`AV1 ${res[0]}x${res[1]} ${fps} fps`, () => {
          checkTypeSupported(mimeStr, isMandatory);
        });
      }
    }
  });

  describe('Shorts H264', () => {
    const codec = 'video/mp4; codecs="avc1.640033"';
    const resolutions = [
      [144, 256],
      [240, 426],
      [360, 640],
      [480, 854],
      [576, 1024],
      [608, 1080],
    ];
    const fpsVals = [30, 60];

    for (const res of resolutions) {
      for (const fps of fpsVals) {
        const mimeStr = createMimeTypeStr(
          codec,
          undefined,
          res[0],
          res[1],
          fps,
        );
        const isMandatory = maxWindow[0] >= res[0] && maxWindow[1] >= res[1];

        it(`H264 ${res[0]}x${res[1]} ${fps} fps`, () => {
          checkTypeSupported(mimeStr, isMandatory);
        });
      }
    }
  });

  describe('AV1 HDR', () => {
    const streams = [
      AV1['HdrHlg144p'],
      AV1['HdrHlg240p'],
      AV1['HdrHlg360p'],
      AV1['HdrHlg480p'],
      AV1['HdrHlg720p24'],
      AV1['HdrHlg720p60'],
      AV1['HdrHlg1080p24'],
      AV1['HdrHlg1080p60'],
      AV1['HdrHlg1440p24'],
      AV1['HdrHlg1440p60'],
      AV1['HdrHlg2160p24'],
      AV1['HdrHlg2160p60'],
      AV1['HdrPq144p'],
      AV1['HdrPq240p'],
      AV1['HdrPq360p'],
      AV1['HdrPq480p'],
      AV1['HdrPq720p24'],
      AV1['HdrPq720p60'],
      AV1['HdrPq1080p24'],
      AV1['HdrPq1080p60'],
      AV1['HdrPq1440p24'],
      AV1['HdrPq1440p60'],
      AV1['HdrPq2160p24'],
      AV1['HdrPq2160p60'],
    ];

    for (const stream of streams) {
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

      it(testName, () => {
        checkTypeSupported(mimeStr, mandatory);
      });
    }
  });

  describe('VP9 HDR', () => {
    const streams = [
      VP9['HdrHlgUltralow'],
      VP9['HdrHlgLow'],
      VP9['HdrHlgMed'],
      VP9['HdrHlgHigh'],
      VP9['HdrHlg720p'],
      VP9['HdrHlg1080p'],
      VP9['HdrHlg2k'],
      VP9['HdrHlg4k'],
      VP9['HdrHlgUltralowHfr'],
      VP9['HdrHlgLowHfr'],
      VP9['HdrHlgMedHfr'],
      VP9['HdrHlgHighHfr'],
      VP9['HdrHlg720pHfr'],
      VP9['HdrHlg1080pHfr'],
      VP9['HdrHlg2kHfr'],
      VP9['HdrHlg4kHfr'],
      VP9['HdrPqUltralow'],
      VP9['HdrPqLow'],
      VP9['HdrPqMed'],
      VP9['HdrPqHigh'],
      VP9['HdrPq720p'],
      VP9['HdrPq1080p'],
      VP9['HdrPq2k'],
      VP9['HdrPq4k'],
      VP9['HdrPqUltralowHfr'],
      VP9['HdrPqLowHfr'],
      VP9['HdrPqMedHfr'],
      VP9['HdrPqHighHfr'],
      VP9['HdrPq720pHfr'],
      VP9['HdrPq1080pHfr'],
      VP9['HdrPq2kHfr'],
      VP9['HdrPq4kHfr'],
    ];

    for (const stream of streams) {
      const fps = stream.get('fps') as number;
      const mandatory = util.isVp9Gt4K() || (util.isVp9GtFHD() && fps <= 30);

      const transferFunction = stream.get('transferFunction');
      const resolution = stream.get('resolution');
      const testName = `VP9.Shorts.Profile2.10Bit.${transferFunction}.${resolution}${fps}`;

      const mimeStr = createFullMimeString(stream);

      it(testName, () => {
        checkTypeSupported(mimeStr, mandatory);
      });
    }
  });
});
