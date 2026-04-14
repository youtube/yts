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

import {getAv1CodecString} from '../codecs/av1_codec';
import {AV1_STREAMS_CLEAR} from './av1_clear';
import {AV1_STREAMS_SENC} from './av1_senc';
import {
  VideoStreamCollection,
  VideoStreamData,
  VideoStreamsType,
} from './interfaces';

// tslint:disable:enforce-name-casing

/** AV1 Spherical Stream: 4320p, 30fps. */
const Spherical4320p30fps: VideoStreamData = [
  'spherical_av1_4320p_30fps.mp4',
  31911585,
  15.033333,
  {fps: 30, resolution: '4320p', spherical: true},
];

/** AV1 Spherical Stream: 2160p, 60fps. */
const Spherical2160p60fps: VideoStreamData = [
  'spherical_av1_2160p_60fps.mp4',
  17856859,
  15.016667,
  {fps: 60, resolution: '2160p', spherical: true},
];

/** AV1 Spherical Stream: 2160p, 30fps. */
const Spherical2160p30fps: VideoStreamData = [
  'spherical_av1_2160p_30fps.mp4',
  13153220,
  15.033333,
  {fps: 30, resolution: '2160p', spherical: true},
];

/** AV1 Spherical Stream: 1080p, 60fps. */
const Spherical1080p60fps: VideoStreamData = [
  'spherical_av1_1080p_60fps.mp4',
  3194937,
  15.016667,
  {fps: 60, resolution: '1080p', spherical: true},
];

/** AV1 Spherical Stream: 1080p, 30fps. */
const Spherical1080p30fps: VideoStreamData = [
  'spherical_av1_1080p_30fps.mp4',
  2048496,
  15.033333,
  {fps: 30, resolution: '1080p', spherical: true},
];

/** AV1 Spherical Stream: 720p, 60fps. */
const Spherical720p60fps: VideoStreamData = [
  'spherical_av1_720p_60fps.mp4',
  1668238,
  15.016667,
  {fps: 60, resolution: '720p', spherical: true},
];

/** AV1 Spherical Stream: 720p, 30fps. */
const Spherical720p30fps: VideoStreamData = [
  'spherical_av1_720p_30fps.mp4',
  1074900,
  15.033333,
  {fps: 30, resolution: '720p', spherical: true},
];

/** AV1 Spherical Stream: 480p, 30fps. */
const Spherical480p30fps: VideoStreamData = [
  'spherical_av1_480p_30fps.mp4',
  483706,
  15.033333,
  {fps: 30, resolution: '480p', spherical: true},
];

/** AV1 Spherical Stream: 360p, 30fps. */
const Spherical360p30fps: VideoStreamData = [
  'spherical_av1_360p_30fps.mp4',
  266089,
  15.033333,
  {fps: 30, resolution: '360p', spherical: true},
];

/** AV1 Spherical Stream: 240p, 30fps. */
const Spherical240p30fps: VideoStreamData = [
  'spherical_av1_240p_30fps.mp4',
  138533,
  15.033333,
  {fps: 30, resolution: '240p', spherical: true},
];

/**
 * Main collection of all AV1 streams, including clear, SENC, and spherical.
 * Provides metadata common to all AV1 streams and a map of individual streams.
 */
export const AV1_STREAMS: VideoStreamsType = {
  streamtype: 'AV1',
  mimetype: `video/mp4; codecs="${getAv1CodecString()}"`,
  mediatype: 'video',
  container: 'mp4',
  streams: {
    ...(AV1_STREAMS_CLEAR as VideoStreamCollection),
    ...(AV1_STREAMS_SENC as VideoStreamCollection),
    Spherical4320p30fps,
    Spherical2160p60fps,
    Spherical2160p30fps,
    Spherical1080p60fps,
    Spherical1080p30fps,
    Spherical720p60fps,
    Spherical720p30fps,
    Spherical480p30fps,
    Spherical360p30fps,
    Spherical240p30fps,
  } as VideoStreamCollection,
};

// tslint:enable:enforce-name-casing
