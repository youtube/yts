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

import {VideoMetadata} from '../codecs/interfaces';

// tslint:disable:enforce-name-casing

/**
 * Interface for the metadata associated with a video stream (AV1, H264, etc.).
 */
export interface VideoStreamSpecificMetadata {
  // Common fields
  fps?: number;
  resolution?: string;
  mimeType?: string; // For individual stream overrides
  video_id?: string;
  widevine_signature?: string;
  playready_signature?: string;
  key?: string | Uint8Array;
  kid?: Uint8Array;
  spherical?: true;
  bitrate?: string;
  videoChangeRate?: number; // Primarily from AV1 clear
  width?: number;
  height?: number;
  quality?: string; // e.g., MQ, HQ for H264
  pssh?: Uint8Array;
  license_server?: string;

  container?: string; // For individual stream overrides, e.g. mp4 for a webm default
  // AV1 specific (kept optional for broader use)
  codecMetadata?: VideoMetadata; // e.g., HLG_AV1_METADATA, PQ_AV1_METADATA
  transferFunction?: string; // e.g., 'HLG', 'PQ', 'BT709'
  HDRFormat?: string; // e.g. 'HLG', 'PQ'

  // Allow other specific properties
  [key: string]: unknown;
}

/**
 * Type definition for a generic video stream entry.
 * Represents a tuple: `[fileName, sizeInBytes, durationInSeconds, metadata]`.
 * Metadata is optional for some simpler stream definitions.
 */
export type VideoStreamData = [
  string,
  number,
  number,
  VideoStreamSpecificMetadata?,
];

/**
 * Defines the structure for a collection of video streams,
 * mapping stream names to their respective stream entry data.
 */
export interface VideoStreamCollection {
  [key: string]: VideoStreamData;
}

/**
 * Interface for stream-specific metadata for audio streams (AAC, AC3, etc.).
 */
export interface AudioStreamSpecificMetadata {
  [key: string]: unknown; // Allows for arbitrary properties like '200000' for AAC
  // Common DRM/metadata fields
  video_id?: string;
  widevine_signature?: string;
  key?: string | Uint8Array; // string for AC3 ik0, Uint8Array for AAC
  // AAC specific fields
  mimeType?: string;
  sbrSignaling?: 'Explicit' | 'Implicit';
  kid?: Uint8Array;
  playready_signature?: string;
  appendAudioOffset?: number;
  halfSecondRangeEnd?: number;
  halfSecondDurationEnd?: number;
  halfSecondBytes?: number[];
  // IAMF specific fields
  container?: string;
  testDisplayName?: string;
}

/**
 * Type definition for a generic audio stream entry.
 * Represents a tuple: `[fileName, sizeInBytes, durationInSeconds, metadata?]`.
 * The metadata is optional.
 */
export type AudioStreamData = [
  string,
  number,
  number,
  AudioStreamSpecificMetadata?,
];

/**
 * Defines the structure for a collection of AAC streams,
 * mapping stream names to their respective stream data.
 */
export interface AudioStreamCollection {
  [key: string]: AudioStreamData;
}

/**
 * Defines the structure for main audio stream collection objects.
 */
export interface AudioStreamsType {
  streamtype: string;
  mimetype: string;
  mediatype: string;
  container: string;
  streams: AudioStreamCollection;
}

/**
 * Defines the structure for main video stream collection objects.
 */
export interface VideoStreamsType {
  streamtype: string;
  mimetype: string; // Default mimetype for the codec
  mediatype: 'video';
  container: string;
  streams: VideoStreamCollection;
}

// tslint:enable:enforce-name-casing
