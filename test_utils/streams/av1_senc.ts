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

import {HLG_AV1_METADATA, PQ_AV1_METADATA} from '../codecs/av1_codec';
import {VideoStreamData} from './interfaces';

// tslint:disable:enforce-name-casing

/**
 * These are all encrypted with the same key, for ease of testing.
 * Normally YT would use different keys for HDR and non HDR, and also for
 * different resolution families.
 */
/** Standard Definition Video ID, allowlisted in DRM server. */
export const SD_VID = '6508f99557a8385f';
/** Widevine signature for the test streams. */
export const WIDEVINE_SIGNATURE =
  '5153900DAC410803EC269D252DAAA82BA6D8B825.495E631E406584A8EFCB4E9C9F3D45F6488B94E4';
/** Key identifier for the test streams. */
export const KEY = 'ik0';

/**
 * AV1 Encrypted Samples.
 * These files are produced by Shaka, which remuxes, so other aspects will not
 * match YT produced files.
 * (Eg there is no colr atom)
 */

/** AV1 SENC stream: SDR, 144p, 30fps. */
const SencSdr144p30: VideoStreamData = [
  'av1-senc/sdr_144p30.mp4',
  143594,
  18.08,
  {
    fps: 29.97,
    resolution: '144p',
    transferFunction: 'BT709',
    codecMetadata: {level: '2.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: SDR, 240p, 30fps. */
const SencSdr240p30: VideoStreamData = [
  'av1-senc/sdr_240p30.mp4',
  315809,
  18.08,
  {
    fps: 29.97,
    resolution: '240p',
    transferFunction: 'BT709',
    codecMetadata: {level: '2.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: SDR, 360p, 30fps. */
const SencSdr360p30: VideoStreamData = [
  'av1-senc/sdr_360p30.mp4',
  645395,
  18.08,
  {
    fps: 29.97,
    resolution: '360p',
    transferFunction: 'BT709',
    codecMetadata: {level: '2.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: SDR, 480p, 30fps. */
const SencSdr480p30: VideoStreamData = [
  'av1-senc/sdr_480p30.mp4',
  1176421,
  18.08,
  {
    fps: 29.97,
    resolution: '480p',
    transferFunction: 'BT709',
    codecMetadata: {level: '3.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: SDR, 720p, 30fps. */
const SencSdr720p30: VideoStreamData = [
  'av1-senc/sdr_720p30.mp4',
  2383233,
  18.08,
  {
    fps: 29.97,
    resolution: '720p',
    transferFunction: 'BT709',
    codecMetadata: {level: '3.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: SDR, 720p, 60fps. */
const SencSdr720p60: VideoStreamData = [
  'av1-senc/sdr_720p60.mp4',
  75305131,
  634.53,
  {
    fps: 60.0,
    resolution: '720p',
    transferFunction: 'BT709',
    codecMetadata: {level: '4.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: SDR, 1080p, 30fps. */
const SencSdr1080p30: VideoStreamData = [
  'av1-senc/sdr_1080p30.mp4',
  4352354,
  18.08,
  {
    fps: 29.97,
    resolution: '1080p',
    transferFunction: 'BT709',
    codecMetadata: {level: '4.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: SDR, 1080p, 60fps. */
const SencSdr1080p60: VideoStreamData = [
  'av1-senc/sdr_1080p60.mp4',
  130659448,
  634.53,
  {
    fps: 60.0,
    resolution: '1080p',
    transferFunction: 'BT709',
    codecMetadata: {level: '4.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: SDR, 1440p, 30fps. */
const SencSdr1440p30: VideoStreamData = [
  'av1-senc/sdr_1440p30.mp4',
  15560060,
  18.08,
  {
    fps: 29.97,
    resolution: '1440p',
    transferFunction: 'BT709',
    codecMetadata: {level: '5.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: SDR, 1440p, 60fps. */
const SencSdr1440p60: VideoStreamData = [
  'av1-senc/sdr_1440p60.mp4',
  20284265,
  30.0,
  {
    fps: 60.0,
    resolution: '1440p',
    transferFunction: 'BT709',
    codecMetadata: {level: '5.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: SDR, 2160p, 30fps. */
const SencSdr2160p30: VideoStreamData = [
  'av1-senc/sdr_2160p30.mp4',
  33638469,
  18.08,
  {
    fps: 29.97,
    resolution: '2160p',
    transferFunction: 'BT709',
    codecMetadata: {level: '5.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: SDR, 2160p, 60fps. */
const SencSdr2160p60: VideoStreamData = [
  'av1-senc/sdr_2160p60.mp4',
  41872388,
  30.0,
  {
    fps: 60.0,
    resolution: '2160p',
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: SDR, 4320p, 30fps. */
const SencSdr4320p30: VideoStreamData = [
  'av1-senc/sdr_4320p30.mp4',
  73120375,
  18.08,
  {
    fps: 29.97,
    resolution: '4320p',
    transferFunction: 'BT709',
    codecMetadata: {level: '6.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: High Bitrate, 2160p (actually 4320p in data). */
const HighBitrate2160p: VideoStreamData = [
  'high-bitrate/drm/video3_571.out.enc',
  387074956,
  65,
  {
    fps: 30,
    resolution: '4320p',
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: Video10, 2160p, 30fps. */
const Video103840x2160Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video10_3840x2160_fps30_av1.enc',
  343104810,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video10, 2160p, 60fps. */
const Video103840x2160Fps60Av1: VideoStreamData = [
  'high-bitrate/drm/video10_3840x2160_fps60_av1.enc',
  353583771,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video10, 4320p, 30fps. */
const Video107680x4320Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video10_7680x4320_fps30_av1.enc',
  484817522,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '4320p',
  },
];
/** AV1 SENC stream: Video1, 2160p, 30fps. */
const Video13840x2160Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video1_3840x2160_fps30_av1.enc',
  387480848,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video1, 2160p, 60fps. */
const Video13840x2160Fps60Av1: VideoStreamData = [
  'high-bitrate/drm/video1_3840x2160_fps60_av1.enc',
  434027574,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video1, 4320p, 30fps. */
const Video17680x4320Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video1_7680x4320_fps30_av1.enc',
  595491915,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '4320p',
  },
];
/** AV1 SENC stream: Video2, 2160p, 30fps. */
const Video23840x2160Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video2_3840x2160_fps30_av1.enc',
  413648499,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video2, 2160p, 60fps. */
const Video23840x2160Fps60Av1: VideoStreamData = [
  'high-bitrate/drm/video2_3840x2160_fps60_av1.enc',
  459799369,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video2, 4320p, 30fps. */
const Video27680x4320Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video2_7680x4320_fps30_av1.enc',
  581327788,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '4320p',
  },
];
/** AV1 SENC stream: Video3, 2160p, 30fps. */
const Video33840x2160Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video3_3840x2160_fps30_av1.enc',
  350768379,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video3, 2160p, 60fps. */
const Video33840x2160Fps60Av1: VideoStreamData = [
  'high-bitrate/drm/video3_3840x2160_fps60_av1.enc',
  391091315,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video3, 4320p, 30fps. */
const Video37680x4320Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video3_7680x4320_fps30_av1.enc',
  520971554,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '4320p',
  },
];
/** AV1 SENC stream: Video4, 2160p, 30fps. */
const Video43840x2160Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video4_3840x2160_fps30_av1.enc',
  414452502,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video4, 2160p, 60fps. */
const Video43840x2160Fps60Av1: VideoStreamData = [
  'high-bitrate/drm/video4_3840x2160_fps60_av1.enc',
  388688824,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video4, 4320p, 30fps. */
const Video47680x4320Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video4_7680x4320_fps30_av1.enc',
  606429785,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '4320p',
  },
];
/** AV1 SENC stream: Video5, 2160p, 30fps. */
const Video53840x2160Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video5_3840x2160_fps30_av1.enc',
  409654701,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video5, 2160p, 60fps. */
const Video53840x2160Fps60Av1: VideoStreamData = [
  'high-bitrate/drm/video5_3840x2160_fps60_av1.enc',
  380998142,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video6, 2160p, 30fps. */
const Video63840x2160Fps30Av1: VideoStreamData = [
  'high-bitrate/sdr-30fps-drm/video10_401_av1_3840x2160_fps=30_bitrate_kbps=27763k',
  225962212,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video6, 2160p, 60fps. */
const Video63840x2160Fps60Av1: VideoStreamData = [
  'high-bitrate/sdr-60fps-drm/video10_401_av1_3840x2160_fps=60_bitrate_kbps=27280k',
  222396991,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video6, 4320p, 30fps. */
const Video67680x4320Fps30Av1: VideoStreamData = [
  'high-bitrate/sdr-30fps-drm/video10_571_av1_7680x4320_fps=30_bitrate_kbps=43126k',
  350771525,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '4320p',
  },
];
/** AV1 SENC stream: Video7, 2160p, 30fps. */
const Video73840x2160Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video7_3840x2160_fps30_av1.enc',
  391224123,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video7, 2160p, 60fps. */
const Video73840x2160Fps60Av1: VideoStreamData = [
  'high-bitrate/drm/video7_3840x2160_fps60_av1.enc',
  423455433,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video7, 4320p, 30fps. */
const Video77680x4320Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video7_7680x4320_fps30_av1.enc',
  500174196,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '4320p',
  },
];
/** AV1 SENC stream: Video8, 2160p, 30fps. */
const Video83840x2160Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video8_3840x2160_fps30_av1.enc',
  387480848,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video8, 2160p, 60fps. */
const Video83840x2160Fps60Av1: VideoStreamData = [
  'high-bitrate/drm/video8_3840x2160_fps60_av1.enc',
  434027574,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video8, 4320p, 30fps. */
const Video87680x4320Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video8_7680x4320_fps30_av1.enc',
  595491915,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '4320p',
  },
];
/** AV1 SENC stream: Video9, 2160p, 30fps. */
const Video93840x2160Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video9_3840x2160_fps30_av1.enc',
  458534507,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video9, 2160p, 60fps. */
const Video93840x2160Fps60Av1: VideoStreamData = [
  'high-bitrate/drm/video9_3840x2160_fps60_av1.enc',
  456819626,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];
/** AV1 SENC stream: Video9, 4320p, 30fps. */
const Video97680x4320Fps30Av1: VideoStreamData = [
  'high-bitrate/drm/video9_7680x4320_fps30_av1.enc',
  582460320,
  65,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '4320p',
  },
];
/** AV1 SENC stream: HDR HLG, 144p, 30fps. */
const SencHdrHlg144p30: VideoStreamData = [
  'av1-senc/hdr_hlg_144p30.mp4',
  325188,
  35.0,
  {
    fps: 29.97,
    resolution: '144p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '2.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR HLG, 240p, 30fps. */
const SencHdrHlg240p30: VideoStreamData = [
  'av1-senc/hdr_hlg_240p30.mp4',
  664456,
  35.0,
  {
    fps: 29.97,
    resolution: '240p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '2.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR HLG, 360p, 30fps. */
const SencHdrHlg360p30: VideoStreamData = [
  'av1-senc/hdr_hlg_360p30.mp4',
  1307676,
  35.0,
  {
    fps: 29.97,
    resolution: '360p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '2.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR HLG, 480p, 30fps. */
const SencHdrHlg480p30: VideoStreamData = [
  'av1-senc/hdr_hlg_480p30.mp4',
  2194776,
  35.0,
  {
    fps: 29.97,
    resolution: '480p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '3.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR HLG, 720p, 24fps. */
const SencHdrHlg720p24: VideoStreamData = [
  'av1-senc/hdr_hlg_720p24.mp4',
  1331675,
  29.99,
  {
    fps: 23.98,
    resolution: '720p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '3.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR HLG, 720p, 60fps. */
const SencHdrHlg720p60: VideoStreamData = [
  'av1-senc/hdr_hlg_720p60.mp4',
  4968837,
  35.0,
  {
    fps: 59.94,
    resolution: '720p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '4.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR HLG, 1080p, 24fps. */
const SencHdrHlg1080p24: VideoStreamData = [
  'av1-senc/hdr_hlg_1080p24.mp4',
  2335974,
  29.99,
  {
    fps: 23.98,
    resolution: '1080p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '4.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR HLG, 1080p, 60fps. */
const SencHdrHlg1080p60: VideoStreamData = [
  'av1-senc/hdr_hlg_1080p60.mp4',
  8671061,
  35.0,
  {
    fps: 59.94,
    resolution: '1080p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '4.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR HLG, 1440p, 24fps. */
const SencHdrHlg1440p24: VideoStreamData = [
  'av1-senc/hdr_hlg_1440p24.mp4',
  7415998,
  29.99,
  {
    fps: 23.98,
    resolution: '1440p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '5.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR HLG, 1440p, 60fps. */
const SencHdrHlg1440p60: VideoStreamData = [
  'av1-senc/hdr_hlg_1440p60.mp4',
  25748781,
  35.0,
  {
    fps: 59.94,
    resolution: '1440p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '5.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR HLG, 2160p, 24fps. */
const SencHdrHlg2160p24: VideoStreamData = [
  'av1-senc/hdr_hlg_2160p24.mp4',
  15788837,
  29.99,
  {
    fps: 23.98,
    resolution: '2160p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '5.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR HLG, 2160p, 60fps. */
const SencHdrHlg2160p60: VideoStreamData = [
  'av1-senc/hdr_hlg_2160p60.mp4',
  51701800,
  35.0,
  {
    fps: 59.94,
    resolution: '2160p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR PQ, 144p, 30fps. */
const SencHdrPq144p30: VideoStreamData = [
  'av1-senc/hdr_pq_144p30.mp4',
  265864,
  30.0,
  {
    fps: 29.97,
    resolution: '144p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '2.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR PQ, 240p, 30fps. */
const SencHdrPq240p30: VideoStreamData = [
  'av1-senc/hdr_pq_240p30.mp4',
  511432,
  30.0,
  {
    fps: 29.97,
    resolution: '240p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '2.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR PQ, 360p, 30fps. */
const SencHdrPq360p30: VideoStreamData = [
  'av1-senc/hdr_pq_360p30.mp4',
  957987,
  30.0,
  {
    fps: 29.97,
    resolution: '360p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '2.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR PQ, 480p, 30fps. */
const SencHdrPq480p30: VideoStreamData = [
  'av1-senc/hdr_pq_480p30.mp4',
  1632543,
  30.0,
  {
    fps: 29.97,
    resolution: '480p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '3.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR PQ, 720p, 24fps. */
const SencHdrPq720p24: VideoStreamData = [
  'av1-senc/hdr_pq_720p24.mp4',
  3450528,
  29.99,
  {
    fps: 23.98,
    resolution: '720p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '3.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR PQ, 720p, 60fps. */
const SencHdrPq720p60: VideoStreamData = [
  'av1-senc/hdr_pq_720p60.mp4',
  3970641,
  30.0,
  {
    fps: 59.94,
    resolution: '720p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '4.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR PQ, 1080p, 24fps. */
const SencHdrPq1080p24: VideoStreamData = [
  'av1-senc/hdr_pq_1080p24.mp4',
  6291040,
  29.99,
  {
    fps: 23.98,
    resolution: '1080p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '4.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR PQ, 1080p, 60fps. */
const SencHdrPq1080p60: VideoStreamData = [
  'av1-senc/hdr_pq_1080p60.mp4',
  7180975,
  30.0,
  {
    fps: 59.94,
    resolution: '1080p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '4.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR PQ, 1440p, 24fps. */
const SencHdrPq1440p24: VideoStreamData = [
  'av1-senc/hdr_pq_1440p24.mp4',
  19201941,
  29.99,
  {
    fps: 23.98,
    resolution: '1440p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '5.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR PQ, 1440p, 60fps. */
const SencHdrPq1440p60: VideoStreamData = [
  'av1-senc/hdr_pq_1440p60.mp4',
  24495537,
  30.0,
  {
    fps: 59.94,
    resolution: '1440p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '5.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR PQ, 2160p, 24fps. */
const SencHdrPq2160p24: VideoStreamData = [
  'av1-senc/hdr_pq_2160p24.mp4',
  39834609,
  29.99,
  {
    fps: 23.98,
    resolution: '2160p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '5.0'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HDR PQ, 2160p, 60fps. */
const SencHdrPq2160p60: VideoStreamData = [
  'av1-senc/hdr_pq_2160p60.mp4',
  50854514,
  30.0,
  {
    fps: 59.94,
    resolution: '2160p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '5.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
  },
];
/** AV1 SENC stream: HFR SDR, 4320p, 60fps. */
const SencHfrSdr4320p60: VideoStreamData = [
  '2025/AV1/tango_lying_down_a_8K60_100M_SDR.mp4.drm.enc',
  327311554,
  35,
  {
    transferFunction: 'BT709',
    codecMetadata: {level: '6.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '4320p',
  },
];
/** AV1 SENC stream: HFR HDR HLG, 4320p, 60fps. */
const SencHfrHdrHlg4320p60: VideoStreamData = [
  '2025/AV1/tango_lying_down_b_8K60_100M_HDR_HLG.mp4.drm.enc',
  368603052,
  35,
  {
    transferFunction: 'HLG',
    HDRFormat: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '6.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '4320p',
  },
];
/** AV1 SENC stream: HFR HDR PQ, 4320p, 60fps. */
const SencHfrHdrPq4320p60: VideoStreamData = [
  '2025/AV1/tango_lying_down_c_8K60_100M_HDR_PQ.mp4.drm.enc',
  347788788,
  35,
  {
    transferFunction: 'PQ',
    HDRFormat: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '6.1'},
    video_id: SD_VID,
    widevine_signature: WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '4320p',
  },
];

/**
 * Collection of all SENC (Sample Encrypted) AV1 streams.
 * Each property is an AV1 SENC stream with its associated metadata.
 */
export const AV1_STREAMS_SENC = {
  SencSdr144p30,
  SencSdr240p30,
  SencSdr360p30,
  SencSdr480p30,
  SencSdr720p30,
  SencSdr720p60,
  SencSdr1080p30,
  SencSdr1080p60,
  SencSdr1440p30,
  SencSdr1440p60,
  SencSdr2160p30,
  SencSdr2160p60,
  SencSdr4320p30,
  HighBitrate2160p,
  Video103840x2160Fps30Av1,
  Video103840x2160Fps60Av1,
  Video107680x4320Fps30Av1,
  Video13840x2160Fps30Av1,
  Video13840x2160Fps60Av1,
  Video17680x4320Fps30Av1,
  Video23840x2160Fps30Av1,
  Video23840x2160Fps60Av1,
  Video27680x4320Fps30Av1,
  Video33840x2160Fps30Av1,
  Video33840x2160Fps60Av1,
  Video37680x4320Fps30Av1,
  Video43840x2160Fps30Av1,
  Video43840x2160Fps60Av1,
  Video47680x4320Fps30Av1,
  Video53840x2160Fps30Av1,
  Video53840x2160Fps60Av1,
  Video63840x2160Fps30Av1,
  Video63840x2160Fps60Av1,
  Video67680x4320Fps30Av1,
  Video73840x2160Fps30Av1,
  Video73840x2160Fps60Av1,
  Video77680x4320Fps30Av1,
  Video83840x2160Fps30Av1,
  Video83840x2160Fps60Av1,
  Video87680x4320Fps30Av1,
  Video93840x2160Fps30Av1,
  Video93840x2160Fps60Av1,
  Video97680x4320Fps30Av1,
  SencHdrHlg144p30,
  SencHdrHlg240p30,
  SencHdrHlg360p30,
  SencHdrHlg480p30,
  SencHdrHlg720p24,
  SencHdrHlg720p60,
  SencHdrHlg1080p24,
  SencHdrHlg1080p60,
  SencHdrHlg1440p24,
  SencHdrHlg1440p60,
  SencHdrHlg2160p24,
  SencHdrHlg2160p60,
  SencHdrPq144p30,
  SencHdrPq240p30,
  SencHdrPq360p30,
  SencHdrPq480p30,
  SencHdrPq720p24,
  SencHdrPq720p60,
  SencHdrPq1080p24,
  SencHdrPq1080p60,
  SencHdrPq1440p24,
  SencHdrPq1440p60,
  SencHdrPq2160p24,
  SencHdrPq2160p60,
  SencHfrSdr4320p60,
  SencHfrHdrHlg4320p60,
  SencHfrHdrPq4320p60,
};

// tslint:enable:enforce-name-casing
