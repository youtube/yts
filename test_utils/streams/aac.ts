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

/** PlayReady signature for specific AAC streams. */
export const PLAYREADY_SIGNATURE_1 =
  '448279561E2755699618BE0A2402189D4A30B03B.0CD6A27286BD2DAF00577FFA21928665DCD320C2';
/** Widevine signature for specific AAC streams. */
export const WIDEVINE_SIGNATURE_1 =
  '9C4BE99E6F517B51FED1F0B3B31966D3C5DAB9D6.6A1F30BB35F3A39A4CA814B731450D4CBD198FFD';

/**
 * The CBCS key details are:
 * video_id = 6508f99557a8385f
 * key_id = ccf3e9d6cbdd5647ab954c354629e25e
 * key = 0e4fe3c095a541b874c54e676c6688b0
 * iv = 93ff763c635bbd6ce411105db4d18db4
 */
/** Video ID for CBCS encrypted AAC streams. */
export const CBCS_VIDEO_ID = '6508f99557a8385f';
/** Widevine signature for CBCS encrypted AAC streams. */
export const CBCS_WIDEVINE_SIGNATURE =
  '5153900DAC410803EC269D252DAAA82BA6D8B825.495E631E406584A8EFCB4E9C9F3D45F6488B94E4';
/** Key identifier for CBCS encrypted AAC streams. */
export const KEY = 'ik0';

/** AAC AudioTiny Stream. */
const AudioTiny: AudioStreamData = ['car-20120827-8b.mp4', 717502, 181.62];

/** AAC AudioNormal Stream. */
const AudioNormal: AudioStreamData = [
  'car-20120827-8c.mp4',
  2884572,
  181.58,
  {
    200000: 12.42,
    halfSecondRangeEnd: 10695,
    halfSecondDurationEnd: 7.75,
    halfSecondBytes: [
      0, 10695, 18504, 26561, 34310, 42401, 49986, 58167, 65700, 73651, 81704,
      89501, 97173, 104745, 112544, 120466, 128435,
    ],
  },
];

/** AAC AudioHuge Stream. */
const AudioHuge: AudioStreamData = [
  'car-20120827-8d.mp4',
  5789853,
  181.58,
  {appendAudioOffset: 17.42},
];

/** AAC Audio51 Stream (5.1 channel). */
const Audio51: AudioStreamData = ['sintel-trunc.mp4', 813119, 20.05];

/** AAC Audio1MB Stream (truncated). */
const Audio1MB: AudioStreamData = ['car-audio-1MB-trunc.mp4', 1048576, 65.875];

/** AAC AudioShorts Stream. */
const AudioShorts: AudioStreamData = ['shorts/140_final_audio.mp4', 244608, 15];

/** AAC AudioLowExplicitHE Stream (HE-AAC with explicit SBR signaling). */
const AudioLowExplicitHE: AudioStreamData = [
  'spotlight-tr-heaac-explicit.mp4',
  156137,
  26.1,
  {mimeType: 'audio/mp4; codecs="mp4a.40.5"', sbrSignaling: 'Explicit'},
];

/** AAC AudioLowImplicitHE Stream (HE-AAC with implicit SBR signaling). */
const AudioLowImplicitHE: AudioStreamData = [
  'spotlight-tr-heaac-implicit.mp4',
  156138,
  26.1,
  {mimeType: 'audio/mp4; codecs="mp4a.40.5"', sbrSignaling: 'Implicit'},
];

/** AAC AudioForVP9Live Stream. */
const AudioForVP9Live: AudioStreamData = ['vp9-live.mp4', 243930, 14.997];

/** AAC AudioNormalClearKey Stream (ClearKey encrypted). */
const AudioNormalClearKey: AudioStreamData = [
  'car_cenc-20120827-8c.mp4',
  3013084,
  181.58,
  {
    key: new Uint8Array([
      0x1a, 0x8a, 0x20, 0x95, 0xe4, 0xde, 0xb2, 0xd2, 0x9e, 0xc8, 0x16, 0xac,
      0x7b, 0xae, 0x20, 0x82,
    ]),
    kid: new Uint8Array([
      0x60, 0x06, 0x1e, 0x01, 0x7e, 0x47, 0x7e, 0x87, 0x7e, 0x57, 0xd0, 0x0d,
      0x1e, 0xd0, 0x0d, 0x1e,
    ]),
  },
];

/** AAC AudioSmallCenc Stream (CENC encrypted). */
const AudioSmallCenc: AudioStreamData = [
  'oops_cenc-20121114-148.mp4',
  999679,
  242.71,
  {
    video_id: '03681262dc412c06',
    playready_signature: PLAYREADY_SIGNATURE_1,
    widevine_signature: WIDEVINE_SIGNATURE_1,
  },
];

/** AAC AudioClearMiddleCenc Stream (CENC encrypted). */
const AudioClearMiddleCenc: AudioStreamData = [
  'oops_cenc_clearmiddle-20250513-149.mp4',
  3935542,
  242.86,
  {
    video_id: '03681262dc412c06',
    playready_signature: PLAYREADY_SIGNATURE_1,
    widevine_signature: WIDEVINE_SIGNATURE_1,
  },
];

/** AAC AudioMeridian Stream. */
const AudioMeridian: AudioStreamData = [
  'meridian_aac_med.mp4',
  11638237,
  719.08,
];

/** AAC Audio44100 Stream (44.1kHz). */
const Audio44100: AudioStreamData = [
  'fmp4-aac-44100-tiny.mp4',
  8192,
  65,
  {mimeType: 'audio/mp4; codecs="mp4a.40.2"'},
];

/** AAC DrmCbcs Stream (CBCS encrypted). */
const DrmCbcs: AudioStreamData = [
  'cbcs/car-20120827-8b.mp4',
  718486,
  181.63,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
  },
];

/** AAC Audio256k Stream (256kbps). */
const Audio256k: AudioStreamData = [
  '2025/IOWebTalk_256kAAC.mp4',
  82036642,
  2548,
  {mimeType: 'audio/mp4; codecs="mp4a.40.2"'},
];

/** Main collection of all AAC streams. */
export const AAC_STREAMS: AudioStreamsType = {
  streamtype: 'AAC',
  mimetype: 'audio/mp4; codecs="mp4a.40.2"',
  mediatype: 'audio',
  container: 'mp4',
  streams: {
    AudioTiny,
    AudioNormal,
    AudioHuge,
    Audio51,
    Audio1MB,
    AudioShorts,
    AudioLowExplicitHE,
    AudioLowImplicitHE,
    AudioForVP9Live,
    AudioNormalClearKey,
    AudioSmallCenc,
    AudioClearMiddleCenc,
    AudioMeridian,
    Audio44100,
    DrmCbcs,
    Audio256k,
  } as AudioStreamCollection,
};

// tslint:enable:enforce-name-casing
