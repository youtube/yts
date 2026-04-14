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

/** IAMF IamfAnimationIamfOpus3oa48khz Stream. */
const IamfAnimationIamfOpus3oa48khz: AudioStreamData = [
  '2025/IAMF/opus_audio_fmp4/animation_3OA_48kHz_opus_f.mp4',
  11764967,
  99,
  {
    container: 'mp4',
    mimeType: 'audio/mp4; codecs="iamf.001.001.Opus"',
    testDisplayName: 'IamfAnimationIamfOpus3oa48khz',
  },
];

/** IAMF IamfAnimationIamfOpus3oaAndStereo48khz2mixpresentations Stream. */
const IamfAnimationIamfOpus3oaAndStereo48khz2mixpresentations: AudioStreamData =
  [
    '2025/IAMF/opus_audio_fmp4/animation_3OA_and_stereo_48kHz_opus_2mixpresentations_f.mp4',
    12383301,
    99,
    {
      container: 'mp4',
      mimeType: 'audio/mp4; codecs="iamf.001.001.Opus"',
      testDisplayName:
        'IamfAnimationIamfOpus3oaAndStereo48khz2mixpresentations',
    },
  ];

/** IAMF IamfAnimationIamfOpus3oaAndStereo48khz Stream. */
const IamfAnimationIamfOpus3oaAndStereo48khz: AudioStreamData = [
  '2025/IAMF/opus_audio_fmp4/animation_3OA_and_stereo_48kHz_opus_f.mp4',
  12383153,
  99,
  {
    container: 'mp4',
    mimeType: 'audio/mp4; codecs="iamf.001.001.Opus"',
    testDisplayName: 'IamfAnimationIamfOpus3oaAndStereo48khz',
  },
];

/** IAMF IamfAnimationIamfOpus5148khz Stream. */
const IamfAnimationIamfOpus5148khz: AudioStreamData = [
  '2025/IAMF/opus_audio_fmp4/animation_51_48kHz_opus_f.mp4',
  4480474,
  99,
  {
    container: 'mp4',
    mimeType: 'audio/mp4; codecs="iamf.000.000.Opus"',
    testDisplayName: 'IamfAnimationIamfOpus5148khz',
  },
];

/** IAMF IamfAnimationIamfOpusFoa48khz Stream. */
const IamfAnimationIamfOpusFoa48khz: AudioStreamData = [
  '2025/IAMF/opus_audio_fmp4/animation_FOA_48kHz_opus_f.mp4',
  3165781,
  99,
  {
    container: 'mp4',
    mimeType: 'audio/mp4; codecs="iamf.001.001.Opus"',
    testDisplayName: 'IamfAnimationIamfOpusFoa48khz',
  },
];

/** IAMF IamfAnimationIamfOpusFoaAndStereo48khz Stream. */
const IamfAnimationIamfOpusFoaAndStereo48khz: AudioStreamData = [
  '2025/IAMF/opus_audio_fmp4/animation_FOA_and_stereo_48kHz_opus_f.mp4',
  3783967,
  99,
  {
    container: 'mp4',
    mimeType: 'audio/mp4; codecs="iamf.001.001.Opus"',
    testDisplayName: 'IamfAnimationIamfOpusFoaAndStereo48khz',
  },
];

/** IAMF IamfSpeechIamfOpus71448khz Stream. */
const IamfSpeechIamfOpus71448khz: AudioStreamData = [
  '2025/IAMF/opus_audio_fmp4/speech_714_48kHz_opus_f.mp4',
  11006212,
  99,
  {
    container: 'mp4',
    mimeType: 'audio/mp4; codecs="iamf.000.000.Opus"',
    testDisplayName: 'IamfSpeechIamfOpus71448khz',
  },
];

/** IAMF IamfSpeechIamfOpusStereo48khz Stream. */
const IamfSpeechIamfOpusStereo48khz: AudioStreamData = [
  '2025/IAMF/opus_audio_fmp4/speech_stereo_48kHz_opus_f.mp4',
  1847916,
  99,
  {
    container: 'mp4',
    mimeType: 'audio/mp4; codecs="iamf.001.001.Opus"',
    testDisplayName: 'IamfSpeechIamfOpusStereo48khz',
  },
];

/** IAMF IamfChannelTest71448khzOpusF Stream. */
const IamfChannelTest71448khzOpusF: AudioStreamData = [
  '2025/IAMF/opus_audio_fmp4/channel_test_714_48kHz_opus_f.mp4',
  2278863,
  99,
  {
    container: 'mp4',
    mimeType: 'audio/mp4; codecs="iamf.000.000.Opus"',
    testDisplayName: 'IamfChannelTest71448khzOpusF',
  },
];

/** IAMF IamfEncrypted Stream. */
const IamfEncrypted: AudioStreamData = [
  '2025/IAMF/Wql8LKEQDfs_iamf.mp4',
  15074946,
  143.27,
  {
    mimeType: 'audio/mp4; codecs="iamf.001.001.Opus"',
    video_id: '5aa97c2ca1100dfb',
    widevine_signature:
      '0976944FABEFB81BC74334AB91BBFAB406767984.B40186D6000FAA6FCF0DE9386F80A43113E14728',
    key: 'ik0',
  },
];

/** Main collection of all IAMF streams. */
export const IAMF_STREAMS: AudioStreamsType = {
  streamtype: 'Iamf',
  mimetype: 'audio/mp4; codecs="iamf.001.001.Opus"',
  mediatype: 'audio',
  container: 'mp4',
  streams: {
    IamfAnimationIamfOpus3oa48khz,
    IamfAnimationIamfOpus3oaAndStereo48khz2mixpresentations,
    IamfAnimationIamfOpus3oaAndStereo48khz,
    IamfAnimationIamfOpus5148khz,
    IamfAnimationIamfOpusFoa48khz,
    IamfAnimationIamfOpusFoaAndStereo48khz,
    IamfSpeechIamfOpus71448khz,
    IamfSpeechIamfOpusStereo48khz,
    IamfChannelTest71448khzOpusF,
    IamfEncrypted,
  } as AudioStreamCollection,
};

// tslint:enable:enforce-name-casing
