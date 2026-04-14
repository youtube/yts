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

import {
  AudioStreamCollection,
  AudioStreamData,
  AudioStreamsType,
} from './interfaces';

// tslint:disable:enforce-name-casing

/**
 * The CBCS key details are:
 * video_id = 6508f99557a8385f
 * key_id = ccf3e9d6cbdd5647ab954c354629e25e
 * key = 0e4fe3c095a541b874c54e676c6688b0
 * iv = 93ff763c635bbd6ce411105db4d18db4
 */
/** Video ID for CBCS encrypted AC3 streams. */
export const CBCS_VIDEO_ID = '6508f99557a8385f';
/** Widevine signature for CBCS encrypted AC3 streams. */
export const CBCS_WIDEVINE_SIGNATURE =
  '5153900DAC410803EC269D252DAAA82BA6D8B825.495E631E406584A8EFCB4E9C9F3D45F6488B94E4';
/** Key identifier for CBCS encrypted AC3 streams. */
export const KEY = 'ik0';

/** AC3 Audio51 Stream (5.1 channel). */
const Audio51: AudioStreamData = [
  'spoken_channel_positions_ac3_51.fmp4',
  645818,
  13.44,
];

/** AC3 DrmCbcs Stream (CBCS encrypted). */
const DrmCbcs: AudioStreamData = [
  'cbcs/spoken_channel_positions_ac3_51.fmp4',
  646814,
  13.44,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
  },
];

/** Main collection of all AC3 streams. */
export const AC3_STREAMS: AudioStreamsType = {
  streamtype: 'AC3',
  mimetype: 'audio/mp4; codecs="ac-3"',
  mediatype: 'audio',
  container: 'mp4',
  streams: {
    Audio51,
    DrmCbcs,
  } as AudioStreamCollection,
};

// tslint:enable:enforce-name-casing
