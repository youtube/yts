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
 * @fileoverview Utility for generating an AV1 codec string.
 *
 * AV1 Metadata is used to construct an AV1 codec string.
 * Values are not provided if we don't have a test stream that uses that value.
 *
 * @see https://aomediacodec.github.io/av1-isobmff/#codecsparam
 * @see https://aomediacodec.github.io/av1-spec/av1-spec.pdf
 */

import {VideoCodec, VideoMetadata} from './interfaces';

// Disabling enforce-name-casing rule since some of our legacy tests may
// depend on this incorrect casing and I do not want to break them.
/* tslint:disable: enforce-name-casing*/
/**
 * av1Codec constant.
 */
export const AV1_CODEC: VideoCodec = {
  Profile: {AV1_MAIN: 0},
  Tier: {MAIN: 'M'},
  BitDepth: {SDR: 8, HDR: 10},
  Monochrome: {NO: 0},
  ChromaSubsamplingX: {YUV_420: 1},
  ChromaSubsamplingY: {YUV_420: 1},
  ChromaSamplePosition: {
    /**
     * Unknown (in this case the source video transfer function must be
     * signaled outside the AV1 bitstream).
     */
    CSP_UNKNOWN: 0,
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
  codecString: (arg0?: VideoMetadata, arg1?: string) =>
    getAv1CodecString(arg0, !!arg1),
};
/* tslint:enable: enforce-name-casing*/

const DEFAULT_AV1_METADATA: VideoMetadata = {
  profile: AV1_CODEC.Profile.AV1_MAIN,
  level: '2.0',
  tier: AV1_CODEC.Tier!.MAIN,
  bitDepth: AV1_CODEC.BitDepth.SDR,
  monochrome: AV1_CODEC.Monochrome!.NO,
  chromaSubsamplingX: AV1_CODEC.ChromaSubsamplingX!.YUV_420,
  chromaSubsamplingY: AV1_CODEC.ChromaSubsamplingY!.YUV_420,
  chromaSamplePosition: AV1_CODEC.ChromaSamplePosition!.CSP_UNKNOWN,
  colorPrimaries: AV1_CODEC.ColorPrimaries.CP_BT_709,
  transferCharacteristics: AV1_CODEC.TransferCharacteristics.TC_BT_709,
  matrixCoefficients: AV1_CODEC.MatrixCoefficients.MC_BT_709,
  videoFullRangeFlag: AV1_CODEC.VideoFullRangeFlag.TV,
};

/** Metadata specific to HDR HLG AV1 streams. */
export const HLG_AV1_METADATA: VideoMetadata = {
  bitDepth: AV1_CODEC.BitDepth.HDR,
  colorPrimaries: AV1_CODEC.ColorPrimaries.CP_BT_2020,
  transferCharacteristics: AV1_CODEC.TransferCharacteristics.TC_HLG,
  matrixCoefficients: AV1_CODEC.MatrixCoefficients.MC_BT_709,
};

/** Metadata specific to HDR PQ AV1 streams. */
export const PQ_AV1_METADATA: VideoMetadata = {
  bitDepth: AV1_CODEC.BitDepth.HDR,
  colorPrimaries: AV1_CODEC.ColorPrimaries.CP_BT_2020,
  transferCharacteristics: AV1_CODEC.TransferCharacteristics.TC_SMPTE_2084,
  matrixCoefficients: AV1_CODEC.MatrixCoefficients.MC_BT_2020_NCL,
};

/**
 * Returns a two-digit string that represents the input number.
 */
function padZeroToStart(num?: number) {
  return num?.toString().padStart(2, '0');
}

/**
 * Returns the value of seq_level_idx as defined in the spec.
 * @param level e.g. '2.1'
 * @return integer from 1 to 31.
 */
function seqLevelIdx(level: string) {
  const xY = level.split('.');
  const x = Number(xY[0]);
  const y = Number(xY[1]);
  return (x - 2) * 4 + y;
}

/**
 * Returns whether the long form string with optional values is necessary.
 * Determines this by checking whether any of said optional values differ from
 * defaults.
 * @param av1Metadata Metadata values.
 */
function longFormRequired(av1Metadata: VideoMetadata) {
  return (
    av1Metadata.monochrome !== DEFAULT_AV1_METADATA.monochrome ||
    av1Metadata.chromaSubsamplingX !==
      DEFAULT_AV1_METADATA.chromaSubsamplingX ||
    av1Metadata.chromaSubsamplingY !==
      DEFAULT_AV1_METADATA.chromaSubsamplingY ||
    av1Metadata.chromaSamplePosition !==
      DEFAULT_AV1_METADATA.chromaSamplePosition ||
    av1Metadata.colorPrimaries !== DEFAULT_AV1_METADATA.colorPrimaries ||
    av1Metadata.matrixCoefficients !==
      DEFAULT_AV1_METADATA.matrixCoefficients ||
    av1Metadata.transferCharacteristics !==
      DEFAULT_AV1_METADATA.transferCharacteristics ||
    av1Metadata.videoFullRangeFlag !== DEFAULT_AV1_METADATA.videoFullRangeFlag
  );
}

/**
 * Returns an AV1 codecs parameter string,
 * e.g. "av01.0.04M.10.0.112.09.16.09.0".
 * See https://aomediacodec.github.io/av1-isobmff/#codecsparam
 * @param av1MetadataOverrides Values that differ from the defaults
 *   in DEFAULT_AV1_METADATA.
 * @param forceLongForm If false, return a short form codec string
 *   if no optional metadata values are overridden.
 */
export function getAv1CodecString(
  av1MetadataOverrides?: VideoMetadata,
  forceLongForm?: boolean,
) {
  const av1Metadata = Object.assign(
    {},
    DEFAULT_AV1_METADATA,
    av1MetadataOverrides,
  );

  // Mandatory values
  const outputArray: Array<string | undefined> = ['av01'];
  outputArray.push(av1Metadata.profile?.toString());
  if (av1Metadata.level) {
    outputArray.push(
      `${padZeroToStart(seqLevelIdx(av1Metadata.level))}${av1Metadata.tier}`,
    );
  }

  outputArray.push(padZeroToStart(av1Metadata.bitDepth));

  // Optional values
  if (forceLongForm || longFormRequired(av1Metadata)) {
    outputArray.push(av1Metadata.monochrome?.toString());
    let chromaSubsampling = `${av1Metadata.chromaSubsamplingX}${av1Metadata.chromaSubsamplingY}`;
    if (
      av1Metadata.chromaSubsamplingX === 1 &&
      av1Metadata.chromaSubsamplingY === 1
    ) {
      chromaSubsampling += av1Metadata.chromaSamplePosition?.toString();
    } else {
      chromaSubsampling += '0';
    }
    outputArray.push(chromaSubsampling);

    outputArray.push(padZeroToStart(av1Metadata.colorPrimaries));
    outputArray.push(padZeroToStart(av1Metadata.transferCharacteristics));
    outputArray.push(padZeroToStart(av1Metadata.matrixCoefficients));
    outputArray.push(av1Metadata.videoFullRangeFlag?.toString());
  }
  return outputArray.join('.');
}

/**
 * Add common HDR HLG metadata before generating the codec string.
 * @param av1MetadataOverrides Values that differ from the defaults.
 */
export function getHlgAv1CodecString(av1MetadataOverrides: VideoMetadata) {
  return getAv1CodecString(
    Object.assign({}, HLG_AV1_METADATA, av1MetadataOverrides),
  );
}

/**
 * Add common HDR PQ metadata before generating the codec string.
 * @param av1MetadataOverrides Values that differ from the defaults.
 */
export function getPqAv1CodecString(av1MetadataOverrides: VideoMetadata) {
  return getAv1CodecString(
    Object.assign({}, PQ_AV1_METADATA, av1MetadataOverrides),
  );
}
