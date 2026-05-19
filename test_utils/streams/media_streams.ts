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
 * @fileoverview This module defines and exports typed media stream definitions
 * for various codecs. It is a TypeScript conversion of the original
 * mediaStreams.js, designed for better type safety and modularity.
 *
 * Each codec family (e.g., AAC, Opus, VP9) is exported as a separate
 * constant object containing its respective stream definitions.
 */

import * as util from 'google3/third_party/javascript/yts/test_utils/legacy_yts_utils';

import {AV1_CODEC} from '../codecs/av1_codec';
import {VideoCodec, VideoMetadata} from '../codecs/interfaces';
import {VP9_CODEC} from '../codecs/vp9_codec';

import {AAC_STREAMS} from './aac';
import {AC3_STREAMS} from './ac3';
import {AV1_STREAMS} from './av1';
import {EAC3_STREAMS} from './eac3';
import {H264_STREAMS} from './h264';
import {IAMF_STREAMS} from './iamf';
import type {CustomMap, StreamDef, StreamTypeInfo} from './interfaces';
import {OPUS_STREAMS} from './opus';
import {VP9_STREAMS} from './vp9';

const codecTypes: {[key: string]: VideoCodec} = {
  [AV1_STREAMS.streamtype]: AV1_CODEC,
  [VP9_STREAMS.streamtype]: VP9_CODEC,
};

const defaultWidth: {[key: string]: number} = {
  '144p': 256,
  '256p': 144,
  '240p': 426,
  '426p': 240,
  '360p': 640,
  '640p': 360,
  '480p': 854,
  '854p': 480,
  '720p': 1280,
  '1280p': 720,
  '1080p': 1920,
  '1920p': 1080,
  '1440p': 2560,
  '2560p': 1440,
  '2160p': 3840,
  '3840p': 2160,
  '4320p': 7680,
  '7680p': 4320,
};

const defaultHeight: {[key: string]: number} = {
  '144p': 144,
  '256p': 256,
  '240p': 240,
  '426p': 426,
  '360p': 360,
  '640p': 640,
  '480p': 480,
  '854p': 854,
  '720p': 720,
  '1280p': 1280,
  '1080p': 1080,
  '1920p': 1920,
  '1440p': 1440,
  '2560p': 2560,
  '2160p': 2160,
  '3840p': 3840,
  '4320p': 4320,
  // NOTE: This value was 7480 in the original JS, likely a typo for 7680.
  // Preserving original value to avoid breaking dependencies.
  '7680p': 7480,
};

/**
 * Creates a stream definition object. This function is not exported.
 *
 * @param streamTypeInfo The stream type information object, containing
 *   details like codec, container, and media type.
 * @param src Path to the stream source file.
 * @param size Size of the stream in bytes.
 * @param duration Duration of the stream in seconds.
 * @param customMap A map of other custom stream properties.
 * @return The generated stream definition.
 */
function createStreamDef(
  streamTypeInfo: StreamTypeInfo,
  src: string,
  size: number,
  duration: number,
  customMap?: CustomMap,
): StreamDef {
  const {streamtype: codec, mediatype: mediaType, container} = streamTypeInfo;
  let mime = streamTypeInfo.mimetype;

  const get = (attribute: string) => {
    if (!customMap) {
      return null;
    }
    return attribute in customMap ? customMap[attribute] : null;
  };

  let containerOverride;
  if (customMap) {
    if ('container' in customMap) {
      containerOverride = customMap['container'];
    }
    if ('codecMetadata' in customMap && codecTypes[codec]) {
      const codecString = codecTypes[codec].codecString(
        customMap['codecMetadata'] as VideoMetadata,
      );
      mime = `${mediaType}/${container}; codecs="${codecString}"`;
    } else if ('mimeType' in customMap) {
      mime = customMap['mimeType']!;
    }
    // Set default width and height based on resolution.
    if ('resolution' in customMap) {
      const resolution = customMap['resolution'] as string;
      if (!('width' in customMap) && resolution in defaultWidth) {
        customMap.width = defaultWidth[resolution];
      }
      if (!('height' in customMap) && resolution in defaultHeight) {
        customMap.height = defaultHeight[resolution];
      }
    }
  }

  return {
    codec,
    mediatype: mediaType,
    container: containerOverride ? containerOverride : container,
    mimetype: mime,
    fileSize: size,
    src: util.getMediaPath(src),
    duration,
    bps: duration > 0 ? Math.floor(size / duration) : 0,
    customMap,
    get,
  };
}

/**
 * Builds a map of stream definitions from a stream type info object.
 * @param streamTypeInfo The stream type information object.
 * @return A map of stream definitions.
 */
function buildStreams(streamTypeInfo: StreamTypeInfo): {
  [key: string]: StreamDef;
} {
  const streamMap: {[key: string]: StreamDef} = {};
  const streams = streamTypeInfo.streams;
  for (const streamName in streams) {
    if (Object.prototype.hasOwnProperty.call(streams, streamName)) {
      const streamArgs = streams[streamName];
      streamMap[streamName] = createStreamDef(
        streamTypeInfo,
        streamArgs[0],
        streamArgs[1],
        streamArgs[2],
        streamArgs[3],
      );
    }
  }
  return streamMap;
}

// Disabling enforce-name-casing rule since some of our legacy tests may
// depend on this incorrect casing and I do not want to break them.
/* tslint:disable: enforce-name-casing*/
/** AAC stream definitions. */
export const AAC = buildStreams(AAC_STREAMS);
/** Opus stream definitions. */
export const Opus = buildStreams(OPUS_STREAMS);
/** H264 stream definitions. */
export const H264 = buildStreams(H264_STREAMS);
/** VP9 stream definitions. */
export const VP9 = buildStreams(VP9_STREAMS);
/** AV1 stream definitions. */
export const AV1 = buildStreams(AV1_STREAMS);
/** AC3 stream definitions. */
export const AC3 = buildStreams(AC3_STREAMS);
/** EAC3 stream definitions. */
export const EAC3 = buildStreams(EAC3_STREAMS);
/** IAMF stream definitions. */
export const Iamf = buildStreams(IAMF_STREAMS);
/* tslint:enable: enforce-name-casing*/
