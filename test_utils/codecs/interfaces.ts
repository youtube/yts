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
 * @fileoverview Common interface definitions for video codecs.
 */

/**
 * Consolidated interface for video metadata (AV1, VP9, etc.).
 */
export interface VideoMetadata {
  // Common fields
  profile?: number;
  level?: string; // e.g., '2.0' for AV1, '5.1' for VP9
  bitDepth?: number;
  colorPrimaries?: number;
  transferCharacteristics?: number;
  matrixCoefficients?: number;
  videoFullRangeFlag?: number;

  // AV1 specific fields
  tier?: string;
  monochrome?: number;
  chromaSubsamplingX?: number; // AV1 uses X and Y separately
  chromaSubsamplingY?: number; // AV1 uses X and Y separately
  chromaSamplePosition?: number;

  // VP9 specific fields
  chromaSubsampling?: number; // VP9 uses a single value
}

interface ProfileMap {
  AV1_MAIN?: number;
  VP9_MAIN?: number;
  VP9_2?: number;
}

interface BitDepthMap {
  SDR: number;
  HDR: number;
}

interface ColorPrimariesMap {
  CP_BT_709: number;
  CP_BT_2020: number;
}

interface TransferCharacteristicsMap {
  TC_BT_709: number;
  TC_SMPTE_2084: number;
  TC_HLG: number;
}

interface MatrixCoefficientsMap {
  MC_BT_709: number;
  MC_BT_2020_NCL: number;
}

interface VideoFullRangeFlagMap {
  TV: number;
  FULL: number;
}

interface TierMap {
  MAIN: string;
}

interface MonochromeMap {
  NO: number;
}

interface ChromaSubsamplingXYMap {
  YUV_420: number;
}

interface ChromaSamplePositionMap {
  CSP_UNKNOWN: number;
}

interface ChromaSubsamplingMap {
  YUV_420: number;
}

/**
 * Unites video codec constant objects like `AV1_CODEC` and `VP9_CODEC` under a
 * common type. It includes properties shared by all video codecs, with
 * codec-specific properties being optional.
 */
// Disabling enforce-name-casing rule since some of our legacy tests may
// depend on this incorrect casing and I do not want to break them.
/* tslint:disable: enforce-name-casing*/
export interface VideoCodec {
  Profile: ProfileMap;
  BitDepth: BitDepthMap;
  ColorPrimaries: ColorPrimariesMap;
  TransferCharacteristics: TransferCharacteristicsMap;
  MatrixCoefficients: MatrixCoefficientsMap;
  VideoFullRangeFlag: VideoFullRangeFlagMap;

  // AV1-specific properties
  Tier?: TierMap;
  Monochrome?: MonochromeMap;
  ChromaSubsamplingX?: ChromaSubsamplingXYMap;
  ChromaSubsamplingY?: ChromaSubsamplingXYMap;
  ChromaSamplePosition?: ChromaSamplePositionMap;

  // VP9-specific properties
  ChromaSubsampling?: ChromaSubsamplingMap;

  codecString: (arg0?: VideoMetadata, arg1?: string) => string;
}
/* tslint:enable: enforce-name-casing*/
