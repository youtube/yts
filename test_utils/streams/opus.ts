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

/** Widevine signature for the Sintel Opus encrypted stream. */
export const SINTEL_WIDEVINE_SIGNATURE =
  '4511DBFEF4177B5F0DF1FAA23562D4FD7FDE0D1A.457901F5F063B3D9E8252B403D120683BEE47216';

/** Opus Audio51 Stream (5.1 channel). */
const Audio51: AudioStreamData = ['opus51.webm', 15583281, 300.02];

const opusUltraHigh: AudioStreamData = ['256_audio_test.webm', 5906787, 180];

/** Opus CarLow Stream. */
const CarLow: AudioStreamData = ['car_opus_low.webm', 1205174, 181.48];

/** Opus CarMed Stream. */
const CarMed: AudioStreamData = [
  'car_opus_med.webm',
  1657817,
  181.48,
  {
    200000: 28.221,
    halfSecondRangeEnd: 832,
    halfSecondDurationEnd: 7.75,
    halfSecondBytes: [
      // Bytes were determined using the command:
      // `mkvinfo car_opus_med.webm -t -v -v`
      0, 839, 4914, 9491, 14193, 19465, 24626, 28805, 33149, 36685, 40074,
      44151, 47519, 50836, 54544, 58708, 62757,
    ],
  },
];

/** Opus CarHigh Stream. */
const CarHigh: AudioStreamData = [
  'car_opus_high.webm',
  3280103,
  181.48,
  {appendAudioOffset: 33.221},
];

/** Opus SantaHigh Stream. */
const SantaHigh: AudioStreamData = ['santa_opus_high.webm', 1198448, 70.861];

/** Opus SintelEncrypted Stream. */
const SintelEncrypted: AudioStreamData = [
  'sintel_opus_enc.webm',
  14956771,
  888.04,
  {
    video_id: '31e1685307acf271',
    widevine_signature: SINTEL_WIDEVINE_SIGNATURE,
  },
];

/** Opus Audio48000 Stream (48kHz). */
const Audio48000: AudioStreamData = [
  'webm-opus-48000-tiny.webm',
  8192,
  120,
  {mimeType: 'audio/webm; codecs="opus"'},
];

/** Main collection of all Opus streams. */
export const OPUS_STREAMS: AudioStreamsType = {
  streamtype: 'Opus',
  mimetype: 'audio/webm; codecs="opus"',
  mediatype: 'audio',
  container: 'webm',
  streams: {
    Audio51,
    CarLow,
    CarMed,
    CarHigh,
    SantaHigh,
    SintelEncrypted,
    Audio48000,
    opusUltraHigh,
  } as AudioStreamCollection,
};

// tslint:enable:enforce-name-casing
