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
 * @fileoverview Utility for generating a VP9 codec string.
 *
 * VP9 Metadata is used to construct a VP9 codec string.
 * Values are not provided if we don't have a test stream that uses that value.
 *
 * @see https://www.webmproject.org/vp9/mp4/
 */

import {VideoCodec, VideoMetadata} from './interfaces';

// Disabling enforce-name-casing rule since some of our legacy tests may
// depend on this incorrect casing and I do not want to break them.
/* tslint:disable: enforce-name-casing*/
/**
 * vp9Codec constant.
 */
export const VP9_CODEC: VideoCodec = {
  Profile: {
    /**
     * Bit Depth: 8 or 10
     * Monochrome Support: Yes
     * Chrome subsampling: YUV 4:2:0
     */
    VP9_MAIN: 0,
    VP9_2: 2,
  },
  BitDepth: {
    SDR: 8,
    HDR: 10,
  },
  ChromaSubsampling: {
    YUV_420: 1, // YUV 4:2:0
  },
  ColorPrimaries: {
    CP_BT_709: 1, // BT.709
    CP_BT_2020: 9, // BT.2020
  },
  TransferCharacteristics: {
    TC_BT_709: 1, // BT.709
    TC_SMPTE_2084: 16, // SMPTE ST 2084, ITU BT.2100 PQ
    TC_HLG: 18, // BT.2100 HLG, ARIB STD-B67
  },
  MatrixCoefficients: {
    MC_BT_709: 1, // BT.709
    MC_BT_2020_NCL: 9, // BT.2020 non-constant luminance, BT.2100 YCbCr
  },

  VideoFullRangeFlag: {
    TV: 0, // TV (limited) range
    FULL: 1, // Full range
  },
  codecString: getVp9CodecString,
};
/* tslint:enable: enforce-name-casing*/

/** Default vp9 metadata string */
const DEFAULT_VP9_METADATA: VideoMetadata = {
  profile: VP9_CODEC.Profile.VP9_MAIN,
  level: '5.1',
  bitDepth: VP9_CODEC.BitDepth.SDR,
  chromaSubsampling: VP9_CODEC.ChromaSubsampling!.YUV_420,
  colorPrimaries: VP9_CODEC.ColorPrimaries.CP_BT_709,
  transferCharacteristics: VP9_CODEC.TransferCharacteristics.TC_BT_709,
  matrixCoefficients: VP9_CODEC.MatrixCoefficients.MC_BT_709,
  videoFullRangeFlag: VP9_CODEC.VideoFullRangeFlag.TV,
};

/** Default HDR vp9 metadata string */
const DEFAULT_HDR_VP9_METADATA: VideoMetadata = {
  profile: VP9_CODEC.Profile.VP9_2,
  level: '5.1',
  bitDepth: VP9_CODEC.BitDepth.HDR,
  chromaSubsampling: VP9_CODEC.ChromaSubsampling!.YUV_420,
  colorPrimaries: VP9_CODEC.ColorPrimaries.CP_BT_2020,
  matrixCoefficients: VP9_CODEC.MatrixCoefficients.MC_BT_2020_NCL,
  videoFullRangeFlag: VP9_CODEC.VideoFullRangeFlag.TV,
};

/** HLG vp9 metadata string */
export const HLG_VP9_METADATA: VideoMetadata = Object.assign(
  {},
  DEFAULT_HDR_VP9_METADATA,
  {
    transferCharacteristics: VP9_CODEC.TransferCharacteristics.TC_HLG,
  },
);

/** PQ vp9 metadata string */
export const PQ_VP9_METADATA: VideoMetadata = Object.assign(
  {},
  DEFAULT_HDR_VP9_METADATA,
  {
    transferCharacteristics: VP9_CODEC.TransferCharacteristics.TC_SMPTE_2084,
  },
);

/**
 * Returns a two-digit string that represents the input number.
 * Returns undefined if the input is undefined.
 */
function padZeroToStart(num?: number) {
  return num?.toString().padStart(2, '0');
}

/**
 * Returns the value of seq_level_idx as defined in the spec.
 * @param level e.g. '2.1'
 * @return the corresponding integer 21.
 */
function seqLevelIdx(level: string) {
  const xY = level.split('.');
  const x = Number(xY[0]);
  const y = Number(xY[1]);
  return x * 10 + y;
}

/**
 * Returns whether the long form string with optional values is necessary.
 * Determines this by checking whether any of said optional values differ from
 * defaults.
 * @param vp9Metadata Metadata values.
 */
function longFormRequired(vp9Metadata: VideoMetadata) {
  return (
    vp9Metadata.chromaSubsampling !== DEFAULT_VP9_METADATA.chromaSubsampling ||
    vp9Metadata.colorPrimaries !== DEFAULT_VP9_METADATA.colorPrimaries ||
    vp9Metadata.matrixCoefficients !==
      DEFAULT_VP9_METADATA.matrixCoefficients ||
    vp9Metadata.transferCharacteristics !==
      DEFAULT_VP9_METADATA.transferCharacteristics ||
    vp9Metadata.videoFullRangeFlag !== DEFAULT_VP9_METADATA.videoFullRangeFlag
  );
}

/**
 * Returns a VP9 codecs parameter string,
 * e.g. "vp09.02.10.10.01.09.16.09.01".
 * See https://www.webmproject.org/vp9/mp4/
 * @param metadataOverrides Values that differ from the defaults
 *   in defaultVp9Metadata.
 * @param forceForm return the correspondning codec string
 *   L - longForm, M - Medium form.
 */
export function getVp9CodecString(
  metadataOverrides?: VideoMetadata,
  forceForm?: string,
) {
  const vp9Metadata = Object.assign(
    {},
    DEFAULT_VP9_METADATA,
    metadataOverrides,
  );

  // Mandatory values
  const outputArray: Array<string | undefined> = ['vp09'];
  outputArray.push(padZeroToStart(vp9Metadata.profile));
  if (vp9Metadata.level) {
    outputArray.push(padZeroToStart(seqLevelIdx(vp9Metadata.level)));
  }
  outputArray.push(padZeroToStart(vp9Metadata.bitDepth));

  // Optional values
  if (longFormRequired(vp9Metadata) && forceForm !== 'M') {
    forceForm = 'L';
  }
  if (forceForm && forceForm !== 'L' && forceForm !== 'M') {
    console.log(2, "Invalid parameter: forceForm must be either 'L' or 'M'.");
  } else if (forceForm) {
    outputArray.push(padZeroToStart(vp9Metadata.chromaSubsampling));
    outputArray.push(padZeroToStart(vp9Metadata.colorPrimaries));
    outputArray.push(padZeroToStart(vp9Metadata.transferCharacteristics));
    outputArray.push(padZeroToStart(vp9Metadata.matrixCoefficients));

    if (forceForm === 'L') {
      outputArray.push(padZeroToStart(vp9Metadata.videoFullRangeFlag));
    }
  }
  return outputArray.filter((elt) => elt !== undefined).join('.');
}

/**
 * Add common HDR HLG metadata before generating the codec string.
 * @param metadataOverrides Metadata values that differ from the defaults.
 */
export function getHlgVp9CodecString(metadataOverrides?: VideoMetadata) {
  return getVp9CodecString(
    Object.assign({}, HLG_VP9_METADATA, metadataOverrides),
  );
}

/**
 * Add common HDR PQ metadata before generating the codec string.
 * @param metadataOverrides Metadata values that differ from the defaults.
 */
export function getPqVp9CodecString(metadataOverrides?: VideoMetadata) {
  return getVp9CodecString(
    Object.assign({}, PQ_VP9_METADATA, metadataOverrides),
  );
}
