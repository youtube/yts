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

import {getVp9CodecString, HLG_VP9_METADATA, PQ_VP9_METADATA} from 'google3/third_party/javascript/yts/test_utils/codecs/vp9_codec';

import {VideoStreamCollection, VideoStreamData, VideoStreamsType} from './interfaces';
// tslint:disable:enforce-name-casing

/** Widevine signature for Sintel VP9 encrypted streams. */
export const SINTEL_WIDEVINE_SIGNATURE =
  '4511DBFEF4177B5F0DF1FAA23562D4FD7FDE0D1A.457901F5F063B3D9E8252B403D120683BEE47216';
/** Video ID for L3 NoHDCP Widevine encrypted VP9 streams. */
export const WIDEVINE_L3NOHDCP_VIDEO_ID = 'f320151fa3f061b2';
/** Widevine signature for L3 NoHDCP VP9 streams. */
export const WIDEVINE_L3NOHDCP_SIGNATURE =
  '81E7B33929F9F35922F7D2E96A5E7AC36F3218B2.673F553EE51A48438AE5E707AEC87A071B4FEF65';

/**
 * The CBCS key details are:
 * video_id = 6508f99557a8385f
 * key_id = 5800c18538ed59ca9c148647d81df367
 * key = d415d960ee7fc13cf688063d5b28cfb4
 * iv = 85afc33ec742021e328c2a65a0ea59aa
 */
/** Video ID for CBCS encrypted VP9 streams. */
export const CBCS_VIDEO_ID = '6508f99557a8385f';
/** Widevine signature for CBCS encrypted VP9 streams. */
export const CBCS_WIDEVINE_SIGNATURE =
  '5153900DAC410803EC269D252DAAA82BA6D8B825.495E631E406584A8EFCB4E9C9F3D45F6488B94E4';
/** Key identifier for CBCS encrypted VP9 streams. */
export const KEY = 'ik0';

/** VP9 Video1080p1MB Stream. */
const Video1080p1MB: VideoStreamData = [
  'big-buck-bunny-vp9-1080p-1mb.webm',
  1184180,
  7.0,
  {resolution: '1080p'},
];

/** VP9 Video2160p1MB Stream. */
const Video2160p1MB: VideoStreamData = [
  'big-buck-bunny-vp9-2160p-1mb.webm',
  1091680,
  3.5,
  {resolution: '2160p'},
];

/** VP9 Video2160pHdr1MB Stream. */
const Video2160pHdr1MB: VideoStreamData = [
  'meridian_vp9_hdr_2160p_1mb.webm',
  1479002,
  1.01,
  {
    transferFunction: 'PQ',
    fps: 60,
    resolution: '2160p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 VideoTiny Stream. */
const VideoTiny: VideoStreamData = [
  'feelings_vp9-20130806-242.webm',
  4478156,
  135.46,
  {videoChangeRate: 15.35, resolution: '240p'},
];

/** VP9 VideoNormal Stream. */
const VideoNormal: VideoStreamData = [
  'big-buck-bunny-vp9-360p-30fps.webm',
  48362964,
  634.53,
  {resolution: '360p'},
];

/** VP9 VideoHuge Stream. */
const VideoHuge: VideoStreamData = [
  'feelings_vp9-20130806-247.webm',
  27757852,
  135.46,
  {resolution: '720p'},
];

/** VP9 Video1MB Stream. */
const Video1MB: VideoStreamData = [
  'vp9-video-1mb.webm',
  1103716,
  1.0,
  {resolution: '720p'},
];

/** VP9 VideoShorts Stream. */
const VideoShorts: VideoStreamData = [
  'shorts/output.f243.webm',
  26969,
  15.0,
  {resolution: '360p'},
];

/** VP9 VideoLive Stream. */
const VideoLive: VideoStreamData = [
  'vp9-live-1080p-30fps.webm',
  2328275,
  14.997,
  {resolution: '1080p', fps: 30},
];

/** VP9 Shorts242 Stream. */
const Shorts242: VideoStreamData = [
  'shorts/shorts.f242.webm',
  1932561,
  88,
  {resolution: '426p', fps: 24},
];

/** VP9 Shorts243 Stream. */
const Shorts243: VideoStreamData = [
  'shorts/shorts.f243.webm',
  3293664,
  88,
  {resolution: '640p', fps: 24},
];

/** VP9 Shorts244 Stream. */
const Shorts244: VideoStreamData = [
  'shorts/shorts.f244.webm',
  5892059,
  88,
  {resolution: '854p', fps: 24},
];

/** VP9 Shorts247 Stream. */
const Shorts247: VideoStreamData = [
  'shorts/shorts.f247.webm',
  11686189,
  88,
  {resolution: '1280p', fps: 24},
];

/** VP9 Shorts248 Stream. */
const Shorts248: VideoStreamData = [
  'shorts/shorts.f248.webm',
  21619534,
  88,
  {resolution: '1920p', fps: 24},
];

/** VP9 Shorts271 Stream. */
const Shorts271: VideoStreamData = [
  'shorts/shorts.f271.webm',
  85332891,
  88,
  {resolution: '2560p', fps: 24},
];

/** VP9 Shorts278 Stream. */
const Shorts278: VideoStreamData = [
  'shorts/shorts.f278.webm',
  1022487,
  88,
  {resolution: '256p', fps: 24},
];

/** VP9 Shorts313 Stream. */
const Shorts313: VideoStreamData = [
  'shorts/shorts.f313.webm',
  166346325,
  88,
  {resolution: '3840p', fps: 24},
];

/** VP9 Shorts302 Stream. */
const Shorts302: VideoStreamData = [
  'shorts/shorts.k302.webm',
  50582,
  16,
  {resolution: '1280p', fps: 60},
];

/** VP9 Shorts303 Stream. */
const Shorts303: VideoStreamData = [
  'shorts/shorts.k303.webm',
  93964,
  16,
  {resolution: '1920p', fps: 60},
];

/** VP9 Shorts308 Stream. */
const Shorts308: VideoStreamData = [
  'shorts/shorts.f308n.webm',
  107231,
  16,
  {resolution: '2560p', fps: 60},
];

/** VP9 Shorts315 Stream. */
const Shorts315: VideoStreamData = [
  'shorts/shorts.f315n.webm',
  211389,
  16,
  {resolution: '3840p', fps: 60},
];

/** VP9 Shorts598 Stream. */
const Shorts598: VideoStreamData = [
  'shorts/shorts.f315.webm',
  9202,
  15,
  {resolution: '256p', fps: 15},
];

/** VP9 VideoHighEnc Stream. */
const VideoHighEnc: VideoStreamData = [
  'sintel_enc-20160621-273.webm',
  68919485,
  887.958,
  {
    video_id: '31e1685307acf271',
    widevine_signature: SINTEL_WIDEVINE_SIGNATURE,
    width: 854,
    height: 364,
  },
];

/** VP9 VideoHighSubSampleEnc Stream. */
const VideoHighSubSampleEnc: VideoStreamData = [
  'sintel_enc_subsample-20161014-318.webm',
  80844835,
  887.958,
  {
    video_id: '31e1685307acf271',
    widevine_signature: SINTEL_WIDEVINE_SIGNATURE,
    width: 854,
    height: 364,
  },
];

/** VP9 Sintel2kEnc Stream. */
const Sintel2kEnc: VideoStreamData = [
  'sintel_vp9_2k_enc.webm',
  479857063,
  887.96,
  {
    video_id: '31e1685307acf271',
    widevine_signature: SINTEL_WIDEVINE_SIGNATURE,
    fps: 24,
    resolution: '1440p',
    height: 1090,
  },
];

/** VP9 Sintel4kEnc Stream. */
const Sintel4kEnc: VideoStreamData = [
  'sintel_vp9_4k_enc.webm',
  1037846120,
  887.96,
  {
    video_id: '31e1685307acf271',
    widevine_signature: SINTEL_WIDEVINE_SIGNATURE,
    fps: 24,
    resolution: '2160p',
    width: 3840,
    height: 1636,
  },
];

/** VP9 DrmL3NoHDCP240p30fpsEnc Stream. */
const DrmL3NoHDCP240p30fpsEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_240p_30fps_enc.webm',
  2637069,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '240p',
  },
];

/** VP9 DrmL3NoHDCP360p30fpsEnc Stream. */
const DrmL3NoHDCP360p30fpsEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_360p_30fps_enc.webm',
  4961622,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '360p',
  },
];

/** VP9 DrmL3NoHDCP480p30fpsEnc Stream. */
const DrmL3NoHDCP480p30fpsEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_480p_30fps_enc.webm',
  9063639,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '480p',
  },
];

/** VP9 DrmL3NoHDCP480p30fpsMqEnc Stream. */
const DrmL3NoHDCP480p30fpsMqEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_480p_mq_30fps_enc.webm',
  11861551,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '480p',
    quality: 'MQ',
  },
];

/** VP9 DrmL3NoHDCP480p30fpsHqEnc Stream. */
const DrmL3NoHDCP480p30fpsHqEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_480p_hq_30fps_enc.webm',
  15292527,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '480p',
    quality: 'HQ',
  },
];

/** VP9 DrmL3NoHDCP720p30fpsEnc Stream. */
const DrmL3NoHDCP720p30fpsEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_720p_30fps_enc.webm',
  18557476,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '720p',
  },
];

/** VP9 DrmL3NoHDCP720p30fpsMqEnc Stream. */
const DrmL3NoHDCP720p30fpsMqEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_720p_mq_30fps_enc.webm',
  26985702,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '720p',
    quality: 'MQ',
  },
];

/** VP9 DrmL3NoHDCP720p30fpsHqEnc Stream. */
const DrmL3NoHDCP720p30fpsHqEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_720p_hq_30fps_enc.webm',
  27989534,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '720p',
    quality: 'HQ',
  },
];

/** VP9 DrmL3NoHDCP720p60fpsEnc Stream. */
const DrmL3NoHDCP720p60fpsEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_720p_60fps_enc.webm',
  32256950,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '720p',
  },
];

/** VP9 DrmL3NoHDCP720p60fpsMqEnc Stream. */
const DrmL3NoHDCP720p60fpsMqEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_720p_mq_60fps_enc.webm',
  44497411,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '720p',
    quality: 'MQ',
  },
];

/** VP9 DrmL3NoHDCP1080p30fpsEnc Stream. */
const DrmL3NoHDCP1080p30fpsEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_1080p_30fps_enc.webm',
  33327074,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
  },
];

/** VP9 DrmL3NoHDCP1080p30fpsMqEnc Stream. */
const DrmL3NoHDCP1080p30fpsMqEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_1080p_mq_30fps_enc.webm',
  52629589,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
    quality: 'MQ',
  },
];

/** VP9 DrmL3NoHDCP1080p30fpsHqEnc Stream. */
const DrmL3NoHDCP1080p30fpsHqEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_1080p_hq_30fps_enc.webm',
  55565306,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
    quality: 'HQ',
  },
];

/** VP9 DrmL3NoHDCP1080p60fpsEnc Stream. */
const DrmL3NoHDCP1080p60fpsEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_1080p_60fps_enc.webm',
  55756449,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
  },
];

/** VP9 DrmL3NoHDCP1080p60fpsMqEnc Stream. */
const DrmL3NoHDCP1080p60fpsMqEnc: VideoStreamData = [
  'drml3NoHdcp_vp9_1080p_mq_60fps_enc.webm',
  89414670,
  101.9,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
    quality: 'MQ',
  },
];

/** VP9 DrmCbcs1080p60fps Stream. */
const DrmCbcs1080p60fps: VideoStreamData = [
  'cbcs/bbb_60fps_vp9.mp4',
  8360069,
  30.03,
  {
    mimeType: `video/mp4; codecs="${getVp9CodecString()}"`,
    container: 'mp4',
    fps: 60,
    resolution: '1080p',
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
  },
];

/** VP9 DrmHighBitrate1080p Stream. */
const DrmHighBitrate1080p: VideoStreamData = [
  'high-bitrate/drm/video10_1920x1080_fps30_vp9.enc',
  217593325,
  20,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    fps: 30,
    resolution: '1080p',
    key: KEY,
  },
];

/** VP9 Video101920x1080Fps30Vp9 Stream. */
const Video101920x1080Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video10_1920x1080_fps30_vp9.enc',
  217593325,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '1080p',
  },
];

/** VP9 Video101920x1080Fps60Vp9 Stream. */
const Video101920x1080Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video10_1920x1080_fps60_vp9.enc',
  219900302,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '1080p',
  },
];

/** VP9 Video103840x2160Fps30Vp9 Stream. */
const Video103840x2160Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video10_3840x2160_fps30_vp9.enc',
  436584504,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];

/** VP9 Video103840x2160Fps60Vp9 Stream. */
const Video103840x2160Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video10_3840x2160_fps60_vp9.enc',
  441395839,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];

/** VP9 Video11920x1080Fps30Vp9 Stream. */
const Video11920x1080Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video1_1920x1080_fps30_vp9.enc',
  231525051,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '1080p',
  },
];

/** VP9 Video11920x1080Fps60Vp9 Stream. */
const Video11920x1080Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video1_1920x1080_fps60_vp9.enc',
  251546200,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '1080p',
  },
];

/** VP9 Video13840x2160Fps30Vp9 Stream. */
const Video13840x2160Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video1_3840x2160_fps30_vp9.enc',
  459584232,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];

/** VP9 Video13840x2160Fps60Vp9 Stream. */
const Video13840x2160Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video1_3840x2160_fps60_vp9.enc',
  501673545,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];

/** VP9 Video21920x1080Fps30Vp9 Stream. */
const Video21920x1080Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video2_1920x1080_fps30_vp9.enc',
  218095784,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '1080p',
  },
];

/** VP9 Video21920x1080Fps60Vp9 Stream. */
const Video21920x1080Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video2_1920x1080_fps60_vp9.enc',
  226848093,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '1080p',
  },
];

/** VP9 Video23840x2160Fps30Vp9 Stream. */
const Video23840x2160Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video2_3840x2160_fps30_vp9.enc',
  443513969,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];

/** VP9 Video23840x2160Fps60Vp9 Stream. */
const Video23840x2160Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video2_3840x2160_fps60_vp9.enc',
  465162793,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];

/** VP9 Video31920x1080Fps30Vp9 Stream. */
const Video31920x1080Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video3_1920x1080_fps30_vp9.enc',
  218614013,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '1080p',
  },
];

/** VP9 Video31920x1080Fps60Vp9 Stream. */
const Video31920x1080Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video3_1920x1080_fps60_vp9.enc',
  238963763,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '1080p',
  },
];

/** VP9 Video33840x2160Fps30Vp9 Stream. */
const Video33840x2160Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video3_3840x2160_fps30_vp9.enc',
  438017783,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];

/** VP9 Video33840x2160Fps60Vp9 Stream. */
const Video33840x2160Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video3_3840x2160_fps60_vp9.enc',
  471682950,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];

/** VP9 Video41920x1080Fps30Vp9 Stream. */
const Video41920x1080Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video4_1920x1080_fps30_vp9.enc',
  235280719,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '1080p',
  },
];

/** VP9 Video41920x1080Fps60Vp9 Stream. */
const Video41920x1080Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video4_1920x1080_fps60_vp9.enc',
  246495664,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '1080p',
  },
];

/** VP9 Video43840x2160Fps30Vp9 Stream. */
const Video43840x2160Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video4_3840x2160_fps30_vp9.enc',
  468449937,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];

/** VP9 Video43840x2160Fps60Vp9 Stream. */
const Video43840x2160Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video4_3840x2160_fps60_vp9.enc',
  511284814,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];

/** VP9 Video51920x1080Fps30Vp9 Stream. */
const Video51920x1080Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video5_1920x1080_fps30_vp9.enc',
  219340370,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '1080p',
  },
];

/** VP9 Video51920x1080Fps60Vp9 Stream. */
const Video51920x1080Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video5_1920x1080_fps60_vp9.enc',
  239567965,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '1080p',
  },
];

/** VP9 Video53840x2160Fps30Vp9 Stream. */
const Video53840x2160Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video5_3840x2160_fps30_vp9.enc',
  439038550,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];

/** VP9 Video53840x2160Fps60Vp9 Stream. */
const Video53840x2160Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video5_3840x2160_fps60_vp9.enc',
  472834041,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];

/** VP9 Video61920x1080Fps30Vp9 Stream. */
const Video61920x1080Fps30Vp9: VideoStreamData = [
  'high-bitrate/vp9-drm/248_video2.original',
  130276757,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '1080p',
  },
];

/** VP9 Video61920x1080Fps60Vp9 Stream. */
const Video61920x1080Fps60Vp9: VideoStreamData = [
  'high-bitrate/vp9-drm/303_video2.original',
  129620018,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '1080p',
  },
];

/** VP9 Video63840x2160Fps30Vp9 Stream. */
const Video63840x2160Fps30Vp9: VideoStreamData = [
  'high-bitrate/vp9-drm/313_video2.original',
  285781435,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];

/** VP9 Video63840x2160Fps60Vp9 Stream. */
const Video63840x2160Fps60Vp9: VideoStreamData = [
  'high-bitrate/vp9-drm/315_video2.original',
  292961093,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];

/** VP9 Video71920x1080Fps30Vp9 Stream. */
const Video71920x1080Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video7_1920x1080_fps30_vp9.enc',
  219681010,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '1080p',
  },
];

/** VP9 Video71920x1080Fps60Vp9 Stream. */
const Video71920x1080Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video7_1920x1080_fps60_vp9.enc',
  238775100,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '1080p',
  },
];

/** VP9 Video73840x2160Fps30Vp9 Stream. */
const Video73840x2160Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video7_3840x2160_fps30_vp9.enc',
  445968345,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];

/** VP9 Video73840x2160Fps60Vp9 Stream. */
const Video73840x2160Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video7_3840x2160_fps60_vp9.enc',
  471519998,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];

/** VP9 Video81920x1080Fps30Vp9 Stream. */
const Video81920x1080Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video8_1920x1080_fps30_vp9.enc',
  231525051,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '1080p',
  },
];

/** VP9 Video81920x1080Fps60Vp9 Stream. */
const Video81920x1080Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video8_1920x1080_fps60_vp9.enc',
  251546200,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '1080p',
  },
];

/** VP9 Video83840x2160Fps30Vp9 Stream. */
const Video83840x2160Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video8_3840x2160_fps30_vp9.enc',
  435159040,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];

/** VP9 Video83840x2160Fps60Vp9 Stream. */
const Video83840x2160Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video8_3840x2160_fps60_vp9.enc',
  501673545,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];

/** VP9 Video91920x1080Fps30Vp9 Stream. */
const Video91920x1080Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video9_1920x1080_fps30_vp9.enc',
  227506258,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '1080p',
  },
];

/** VP9 Video91920x1080Fps60Vp9 Stream. */
const Video91920x1080Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video9_1920x1080_fps60_vp9.enc',
  244312164,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '1080p',
  },
];

/** VP9 Video93840x2160Fps30Vp9 Stream. */
const Video93840x2160Fps30Vp9: VideoStreamData = [
  'high-bitrate/drm/video9_3840x2160_fps30_vp9.enc',
  454951294,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 30,
    resolution: '2160p',
  },
];

/** VP9 Video93840x2160Fps60Vp9 Stream. */
const Video93840x2160Fps60Vp9: VideoStreamData = [
  'high-bitrate/drm/video9_3840x2160_fps60_vp9.enc',
  496497678,
  65,
  {
    video_id: CBCS_VIDEO_ID,
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
    fps: 60,
    resolution: '2160p',
  },
];

/** VP9 publish3s Stream. */
const publish3s: VideoStreamData = [
  'high-bitrate/longvid/ffmpeg-vp9-fast',
  12105346,
  3,
  {fps: 60, resolution: '2160p'},
];

/** VP9 Concat Stream. */
const Concat: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video9_313_vp9_3840x2160_fps=30_bitrate_kbps=40745k.webm',
  26356782,
  11,
  {fps: 30, resolution: '2160p'},
];

/** VP9 ProgressiveLow Stream. */
const ProgressiveLow: VideoStreamData = [
  'feelings_vp9-20130806-243.webm',
  7902885,
  135.46,
  {resolution: '360p'},
];

/** VP9 Webgl144p30fps Stream. */
const Webgl144p30fps: VideoStreamData = [
  'big-buck-bunny-vp9-144p-30fps.webm',
  7102948,
  634.53,
  {fps: 30, resolution: '144p'},
];

/** VP9 Webgl240p30fps Stream. */
const Webgl240p30fps: VideoStreamData = [
  'big-buck-bunny-vp9-240p-30fps.webm',
  15315502,
  634.53,
  {fps: 30, resolution: '240p'},
];

/** VP9 Webgl360p30fps Stream. */
const Webgl360p30fps: VideoStreamData = [
  'big-buck-bunny-vp9-360p-30fps.webm',
  28562771,
  634.53,
  {fps: 30, resolution: '360p'},
];

/** VP9 Webgl480p30fps Stream. */
const Webgl480p30fps: VideoStreamData = [
  'big-buck-bunny-vp9-480p-30fps.webm',
  48362964,
  634.53,
  {fps: 30, resolution: '480p'},
];

/** VP9 Webgl720p30fps Stream. */
const Webgl720p30fps: VideoStreamData = [
  'big-buck-bunny-vp9-720p-30fps.webm',
  91390585,
  634.53,
  {fps: 30, resolution: '720p'},
];

/** VP9 Webgl720p60fps Stream. */
const Webgl720p60fps: VideoStreamData = [
  'big-buck-bunny-vp9-720p-60fps.webm',
  151583677,
  634.53,
  {fps: 60, resolution: '720p'},
];

/** VP9 Webgl1080p30fps Stream. */
const Webgl1080p30fps: VideoStreamData = [
  'big-buck-bunny-vp9-1080p-30fps.webm',
  168727073,
  634.53,
  {fps: 30, resolution: '1080p'},
];

/** VP9 Webgl1080p60fps Stream. */
const Webgl1080p60fps: VideoStreamData = [
  'big-buck-bunny-vp9-1080p-60fps.webm',
  252622340,
  634.53,
  {fps: 60, resolution: '1080p'},
];

/** VP9 Webgl1440p30fps Stream. */
const Webgl1440p30fps: VideoStreamData = [
  'big-buck-bunny-vp9-1440p-30fps.webm',
  460158586,
  634.53,
  {fps: 30, resolution: '1440p'},
];

/** VP9 Webgl1440p60fps Stream. */
const Webgl1440p60fps: VideoStreamData = [
  'big-buck-bunny-vp9-1440p-60fps.webm',
  661242960,
  634.53,
  {fps: 60, resolution: '1440p'},
];

/** VP9 Webgl2160p30fps Stream. */
const Webgl2160p30fps: VideoStreamData = [
  'big-buck-bunny-vp9-2160p-30fps.webm',
  1089986842,
  634.53,
  {fps: 30, resolution: '2160p'},
];

/** VP9 Webgl2160p60fps Stream. */
const Webgl2160p60fps: VideoStreamData = [
  'big-buck-bunny-vp9-2160p-60fps.webm',
  1721994529,
  634.53,
  {fps: 60, resolution: '2160p'},
];

/** VP9 Webgl1080p240fps Stream. */
const Webgl1080p240fps: VideoStreamData = [
  '248_bbb240.webm',
  1721994529,
  30,
  {fps: 240, resolution: '1080p'},
];

/** VP9 Spherical144s30fps Stream. */
const Spherical144s30fps: VideoStreamData = [
  'spherical_vp9_144s_30fps.webm',
  1386771,
  149.28,
  {fps: 30, resolution: '144p', spherical: true},
];

/** VP9 Spherical240s30fps Stream. */
const Spherical240s30fps: VideoStreamData = [
  'spherical_vp9_240s_30fps.webm',
  2164087,
  149.28,
  {fps: 30, resolution: '240p', spherical: true},
];

/** VP9 Spherical360s30fps Stream. */
const Spherical360s30fps: VideoStreamData = [
  'spherical_vp9_360s_30fps.webm',
  4539259,
  149.28,
  {fps: 30, resolution: '360p', spherical: true},
];

/** VP9 Spherical480s30fps Stream. */
const Spherical480s30fps: VideoStreamData = [
  'spherical_vp9_480s_30fps.webm',
  8181410,
  149.28,
  {fps: 30, resolution: '480p', spherical: true},
];

/** VP9 Spherical720s30fps Stream. */
const Spherical720s30fps: VideoStreamData = [
  'spherical_vp9_720s_30fps.webm',
  18142938,
  149.28,
  {fps: 30, resolution: '720p', spherical: true},
];

/** VP9 Spherical720s60fps Stream. */
const Spherical720s60fps: VideoStreamData = [
  'spherical_vp9_720s_60fps.webm',
  25630410,
  149.29,
  {fps: 60, resolution: '720p', spherical: true},
];

/** VP9 Spherical1080s30fps Stream. */
const Spherical1080s30fps: VideoStreamData = [
  'spherical_vp9_1080s_30fps.webm',
  36208240,
  149.28,
  {fps: 30, resolution: '1080p', spherical: true},
];

/** VP9 Spherical1080s60fps Stream. */
const Spherical1080s60fps: VideoStreamData = [
  'spherical_vp9_1080s_60fps.webm',
  53176311,
  149.29,
  {fps: 60, resolution: '1080p', spherical: true},
];

/** VP9 Spherical1440s30fps Stream. */
const Spherical1440s30fps: VideoStreamData = [
  'spherical_vp9_1440s_30fps.webm',
  98235300,
  149.28,
  {fps: 30, resolution: '1440p', spherical: true},
];

/** VP9 Spherical1440s60fps Stream. */
const Spherical1440s60fps: VideoStreamData = [
  'spherical_vp9_1440s_60fps.webm',
  152948581,
  149.29,
  {fps: 60, resolution: '1440p', spherical: true},
];

/** VP9 Spherical2160s30fps Stream. */
const Spherical2160s30fps: VideoStreamData = [
  'spherical_vp9_2160s_30fps.webm',
  243510558,
  149.28,
  {fps: 30, resolution: '2160p', spherical: true},
];

/** VP9 Spherical2160s60fps Stream. */
const Spherical2160s60fps: VideoStreamData = [
  'spherical_vp9_2160s_60fps.webm',
  393625694,
  149.29,
  {fps: 60, resolution: '2160p', spherical: true},
];

/** VP9 video1080p5815kbps Stream. */
const video1080p5815kbps: VideoStreamData = [
  'high-bitrate/1s/video1_303_vp9_1920x1080_bitrate_kbps.webm',
  726543,
  1.016667,
  {fps: 60, resolution: '1080p', quality: 'HQ', bitrate: '5815k'},
];

/** VP9 TestMaterialsMediaSphericalVp91080s60fps137H2641920x1080Fps29 Stream. */
const TestMaterialsMediaSphericalVp91080s60fps137H2641920x1080Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_137_h264_1920x1080_fps=29.97_bitrate_kbps=2286k.mp4',
    4,
    11,
    {fps: 30, resolution: '1080p', spherical: true, bitrate: '2286k'},
  ];

/** VP9 TestMaterialsMediaSphericalVp91080s60fps248Vp91920x1080Fps29 Stream. */
const TestMaterialsMediaSphericalVp91080s60fps248Vp91920x1080Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_248_vp9_1920x1080_fps=29.97_bitrate_kbps=1283k.webm',
    1384255,
    11,
    {fps: 30, resolution: '1080p', spherical: true, bitrate: '1283k'},
  ];

/** VP9 TestMaterialsMediaSphericalVp91080s60fps299H2641920x1080Fps59 Stream. */
const TestMaterialsMediaSphericalVp91080s60fps299H2641920x1080Fps59: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_299_h264_1920x1080_fps=59.940059940059939_bitrate_kbps=3314k.mp4',
    4,
    11,
    {
      fps: 60,
      resolution: '1080p',
      spherical: true,
      bitrate: '3314k',
    },
  ];

/** VP9 TestMaterialsMediaSphericalVp91080s60fps303Vp91920x1080Fps59 Stream. */
const TestMaterialsMediaSphericalVp91080s60fps303Vp91920x1080Fps59: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_303_vp9_1920x1080_fps=59.940063091482649_bitrate_kbps=1603k.webm',
    2193742,
    11,
    {fps: 60, resolution: '1080p', spherical: true, bitrate: '1603k'},
  ];

/** VP9 TestMaterialsMediaSphericalVp91080s60fps313Vp93840x2160Fps29 Stream. */
const TestMaterialsMediaSphericalVp91080s60fps313Vp93840x2160Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_313_vp9_3840x2160_fps=29.97_bitrate_kbps=6856k.webm',
    7056790,
    11,
    {fps: 30, resolution: '2160p', spherical: true, bitrate: '6856k'},
  ];

/** VP9 TestMaterialsMediaSphericalVp91080s60fps315Vp93840x2160Fps59 Stream. */
const TestMaterialsMediaSphericalVp91080s60fps315Vp93840x2160Fps59: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_315_vp9_3840x2160_fps=59.940063091482649_bitrate_kbps=8422k.webm',
    10973913,
    11,
    {fps: 60, resolution: '2160p', spherical: true, bitrate: '8422k'},
  ];

/** VP9 TestMaterialsMediaSphericalVp91080s60fps399Av11920x1080Fps29 Stream. */
const TestMaterialsMediaSphericalVp91080s60fps399Av11920x1080Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_399_av1_1920x1080_fps=29.97_bitrate_kbps=1808k.mp4',
    1241395,
    11,
    {
      fps: 30,
      resolution: '1080p',
      spherical: true,
      bitrate: '1808k',
    },
  ];

/** VP9 TestMaterialsMediaSphericalVp91080s60fps401Av13840x2160Fps29 Stream. */
const TestMaterialsMediaSphericalVp91080s60fps401Av13840x2160Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_401_av1_3840x2160_fps=29.97_bitrate_kbps=2445k.mp4',
    5271874,
    11,
    {
      fps: 30,
      resolution: '2160p',
      spherical: true,
      bitrate: '2445k',
    },
  ];

/** VP9 TestMaterialsMediaSphericalVp91080s60fps571Av17680x4320Fps29 Stream. */
const TestMaterialsMediaSphericalVp91080s60fps571Av17680x4320Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_571_av1_7680x4320_fps=29.97_bitrate_kbps=3834k.mp4',
    12322964,
    11,
    {
      fps: 30,
      resolution: '4320p',
      spherical: true,
      bitrate: '3834k',
    },
  ];

/** VP9 TestMaterialsMediaSphericalVp92160s60fps137H2641920x1080Fps29 Stream. */
const TestMaterialsMediaSphericalVp92160s60fps137H2641920x1080Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_137_h264_1920x1080_fps=29.97_bitrate_kbps=2852k.mp4',
    4,
    11,
    {
      fps: 30,
      resolution: '1080p',
      spherical: true,
      bitrate: '2852k',
    },
  ];

/** VP9 TestMaterialsMediaSphericalVp92160s60fps248Vp91920x1080Fps29 Stream. */
const TestMaterialsMediaSphericalVp92160s60fps248Vp91920x1080Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_248_vp9_1920x1080_fps=29.97_bitrate_kbps=1458k.webm',
    1577832,
    11,
    {fps: 30, resolution: '1080p', spherical: true, bitrate: '1458k'},
  ];

/** VP9 TestMaterialsMediaSphericalVp92160s60fps299H2641920x1080Fps59 Stream. */
const TestMaterialsMediaSphericalVp92160s60fps299H2641920x1080Fps59: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_299_h264_1920x1080_fps=59.940059940059939_bitrate_kbps=3861k.mp4',
    4,
    11,
    {
      fps: 60,
      resolution: '1080p',
      spherical: true,
      bitrate: '3861k',
    },
  ];

/** VP9 TestMaterialsMediaSphericalVp92160s60fps303Vp91920x1080Fps59 Stream. */
const TestMaterialsMediaSphericalVp92160s60fps303Vp91920x1080Fps59: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_303_vp9_1920x1080_fps=59.940063091482649_bitrate_kbps=1633k.webm',
    2488974,
    11,
    {fps: 60, resolution: '1080p', spherical: true, bitrate: '1633k'},
  ];

/** VP9 TestMaterialsMediaSphericalVp92160s60fps313Vp93840x2160Fps29 Stream. */
const TestMaterialsMediaSphericalVp92160s60fps313Vp93840x2160Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_313_vp9_3840x2160_fps=29.97_bitrate_kbps=9491k.webm',
    10362090,
    11,
    {fps: 30, resolution: '2160p', spherical: true, bitrate: '9491k'},
  ];

/** VP9 TestMaterialsMediaSphericalVp92160s60fps315Vp93840x2160Fps59 Stream. */
const TestMaterialsMediaSphericalVp92160s60fps315Vp93840x2160Fps59: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_315_vp9_3840x2160_fps=59.940063091482649_bitrate_kbps=10170k.webm',
    16855813,
    11,
    {fps: 60, resolution: '2160p', spherical: true, bitrate: '10170k'},
  ];

/** VP9 TestMaterialsMediaSphericalVp92160s60fps399Av11920x1080Fps29 Stream. */
const TestMaterialsMediaSphericalVp92160s60fps399Av11920x1080Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_399_av1_1920x1080_fps=29.97_bitrate_kbps=2157k.mp4',
    1388135,
    11,
    {
      fps: 30,
      resolution: '1080p',
      spherical: true,
      bitrate: '2157k',
    },
  ];

/** VP9 TestMaterialsMediaSphericalVp92160s60fps401Av13840x2160Fps29 Stream. */
const TestMaterialsMediaSphericalVp92160s60fps401Av13840x2160Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_401_av1_3840x2160_fps=29.97_bitrate_kbps=2467k.mp4',
    6852759,
    11,
    {
      fps: 30,
      resolution: '2160p',
      spherical: true,
      bitrate: '2467k',
    },
  ];

/** VP9 TestMaterialsMediaSphericalVp92160s60fps571Av17680x4320Fps29 Stream. */
const TestMaterialsMediaSphericalVp92160s60fps571Av17680x4320Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_571_av1_7680x4320_fps=29.97_bitrate_kbps=4648k.mp4',
    15228251,
    11,
    {
      fps: 30,
      resolution: '4320p',
      spherical: true,
      bitrate: '4648k',
    },
  ];

/** VP9 Video10248Vp91920x1080Fps30BitrateKbps16922k Stream. */
const Video10248Vp91920x1080Fps30BitrateKbps16922k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video10_248_vp9_1920x1080_fps=30_bitrate_kbps=16922k.webm',
  5415978,
  11,
  {fps: 30, resolution: '1080p', bitrate: '16922k'},
];

/** VP9 Video10303Vp91920x1080Fps60BitrateKbps16866k Stream. */
const Video10303Vp91920x1080Fps60BitrateKbps16866k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video10_303_vp9_1920x1080_fps=60_bitrate_kbps=16866k.webm',
  7673327,
  11,
  {fps: 60, resolution: '1080p', bitrate: '16866k'},
];

/** VP9 Video10313Vp93840x2160Fps30BitrateKbps43754k Stream. */
const Video10313Vp93840x2160Fps30BitrateKbps43754k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video10_313_vp9_3840x2160_fps=30_bitrate_kbps=43754k.webm',
  27431918,
  11,
  {fps: 30, resolution: '2160p', bitrate: '43754k'},
];

/** VP9 Video10315Vp93840x2160Fps60BitrateKbps41145k Stream. */
const Video10315Vp93840x2160Fps60BitrateKbps41145k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video10_315_vp9_3840x2160_fps=60_bitrate_kbps=41145k.webm',
  38432721,
  11,
  {fps: 60, resolution: '2160p', bitrate: '41145k'},
];

/** VP9 Video1248Vp91920x1080Fps30BitrateKbps13793k Stream. */
const Video1248Vp91920x1080Fps30BitrateKbps13793k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video1_248_vp9_1920x1080_fps=30_bitrate_kbps=13793k.webm',
  3670205,
  11,
  {fps: 30, resolution: '1080p', bitrate: '13793k'},
];

/** VP9 Video1303Vp91920x1080Fps60BitrateKbps10398k Stream. */
const Video1303Vp91920x1080Fps60BitrateKbps10398k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video1_303_vp9_1920x1080_fps=60_bitrate_kbps=10398k.webm',
  4329200,
  11,
  {fps: 60, resolution: '1080p', bitrate: '10398k'},
];

/** VP9 Video1313Vp93840x2160Fps30BitrateKbps36345k Stream. */
const Video1313Vp93840x2160Fps30BitrateKbps36345k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video1_313_vp9_3840x2160_fps=30_bitrate_kbps=36345k.webm',
  24552353,
  11,
  {fps: 30, resolution: '2160p', bitrate: '36345k'},
];

/** VP9 Video1315Vp93840x2160Fps60BitrateKbps34865k Stream. */
const Video1315Vp93840x2160Fps60BitrateKbps34865k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video1_315_vp9_3840x2160_fps=60_bitrate_kbps=34865k.webm',
  36348382,
  11,
  {fps: 60, resolution: '2160p', bitrate: '34865k'},
];

/** VP9 Video2248Vp91920x1080Fps30BitrateKbps18271k Stream. */
const Video2248Vp91920x1080Fps30BitrateKbps18271k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video2_248_vp9_1920x1080_fps=30_bitrate_kbps=18271k.webm',
  5215761,
  11,
  {fps: 30, resolution: '1080p', bitrate: '18271k'},
];

/** VP9 Video2303Vp91920x1080Fps60BitrateKbps16036k Stream. */
const Video2303Vp91920x1080Fps60BitrateKbps16036k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video2_303_vp9_1920x1080_fps=60_bitrate_kbps=16036k.webm',
  6428589,
  11,
  {fps: 60, resolution: '1080p', bitrate: '16036k'},
];

/** VP9 Video2313Vp93840x2160Fps30BitrateKbps42243k Stream. */
const Video2313Vp93840x2160Fps30BitrateKbps42243k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video2_313_vp9_3840x2160_fps=30_bitrate_kbps=42243k.webm',
  27113416,
  11,
  {fps: 30, resolution: '2160p', bitrate: '42243k'},
];

/** VP9 Video2315Vp93840x2160Fps60BitrateKbps43999k Stream. */
const Video2315Vp93840x2160Fps60BitrateKbps43999k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video2_315_vp9_3840x2160_fps=60_bitrate_kbps=43999k.webm',
  38617307,
  11,
  {fps: 60, resolution: '2160p', bitrate: '43999k'},
];

/** VP9 Video3248Vp91920x1080Fps30BitrateKbps14327k Stream. */
const Video3248Vp91920x1080Fps30BitrateKbps14327k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video3_248_vp9_1920x1080_fps=30_bitrate_kbps=14327k.webm',
  5088430,
  11,
  {fps: 30, resolution: '1080p', bitrate: '14327k'},
];

/** VP9 Video3303Vp91920x1080Fps60BitrateKbps16011k Stream. */
const Video3303Vp91920x1080Fps60BitrateKbps16011k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video3_303_vp9_1920x1080_fps=60_bitrate_kbps=16011k.webm',
  7527349,
  11,
  {fps: 60, resolution: '1080p', bitrate: '16011k'},
];

/** VP9 Video3313Vp93840x2160Fps30BitrateKbps36442k Stream. */
const Video3313Vp93840x2160Fps30BitrateKbps36442k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video3_313_vp9_3840x2160_fps=30_bitrate_kbps=36442k.webm',
  26515666,
  11,
  {fps: 30, resolution: '2160p', bitrate: '36442k'},
];

/** VP9 Video3315Vp93840x2160Fps60BitrateKbps35900k Stream. */
const Video3315Vp93840x2160Fps60BitrateKbps35900k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video3_315_vp9_3840x2160_fps=60_bitrate_kbps=35900k.webm',
  37670711,
  11,
  {fps: 60, resolution: '2160p', bitrate: '35900k'},
];

/** VP9 Video4248Vp91920x1080Fps30BitrateKbps14511k Stream. */
const Video4248Vp91920x1080Fps30BitrateKbps14511k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video4_248_vp9_1920x1080_fps=30_bitrate_kbps=14511k.webm',
  2876764,
  11,
  {fps: 30, resolution: '1080p', bitrate: '14511k'},
];

/** VP9 Video4303Vp91920x1080Fps60BitrateKbps10607k Stream. */
const Video4303Vp91920x1080Fps60BitrateKbps10607k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video4_303_vp9_1920x1080_fps=60_bitrate_kbps=10607k.webm',
  2788188,
  11,
  {fps: 60, resolution: '1080p', bitrate: '10607k'},
];

/** VP9 Video4313Vp93840x2160Fps30BitrateKbps41239k Stream. */
const Video4313Vp93840x2160Fps30BitrateKbps41239k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video4_313_vp9_3840x2160_fps=30_bitrate_kbps=41239k.webm',
  17016969,
  11,
  {fps: 30, resolution: '2160p', bitrate: '41239k'},
];

/** VP9 Video4315Vp93840x2160Fps60BitrateKbps34783k Stream. */
const Video4315Vp93840x2160Fps60BitrateKbps34783k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video4_315_vp9_3840x2160_fps=60_bitrate_kbps=34783k.webm',
  24995013,
  11,
  {fps: 60, resolution: '2160p', bitrate: '34783k'},
];

/** VP9 Video5248Vp91920x1080Fps30BitrateKbps17822k Stream. */
const Video5248Vp91920x1080Fps30BitrateKbps17822k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video5_248_vp9_1920x1080_fps=30_bitrate_kbps=17822k.webm',
  2832984,
  11,
  {fps: 30, resolution: '1080p', bitrate: '17822k'},
];

/** VP9 Video5303Vp91920x1080Fps60BitrateKbps12324k Stream. */
const Video5303Vp91920x1080Fps60BitrateKbps12324k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video5_303_vp9_1920x1080_fps=60_bitrate_kbps=12324k.webm',
  2453870,
  11,
  {fps: 60, resolution: '1080p', bitrate: '12324k'},
];

/** VP9 Video5313Vp93840x2160Fps30BitrateKbps41760k Stream. */
const Video5313Vp93840x2160Fps30BitrateKbps41760k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video5_313_vp9_3840x2160_fps=30_bitrate_kbps=41760k.webm',
  26926575,
  11,
  {fps: 30, resolution: '2160p', bitrate: '41760k'},
];

/** VP9 Video5315Vp93840x2160Fps60BitrateKbps39941k Stream. */
const Video5315Vp93840x2160Fps60BitrateKbps39941k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video5_315_vp9_3840x2160_fps=60_bitrate_kbps=39941k.webm',
  37805336,
  11,
  {fps: 60, resolution: '2160p', bitrate: '39941k'},
];

/** VP9 Video6248Vp91920x1080Fps30BitrateKbps16972k Stream. */
const Video6248Vp91920x1080Fps30BitrateKbps16972k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video6_248_vp9_1920x1080_fps=30_bitrate_kbps=16972k.webm',
  4463852,
  11,
  {fps: 30, resolution: '1080p', bitrate: '16972k'},
];

/** VP9 Video6303Vp91920x1080Fps60BitrateKbps9286k Stream. */
const Video6303Vp91920x1080Fps60BitrateKbps9286k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video6_303_vp9_1920x1080_fps=60_bitrate_kbps=9286k.webm',
  4710207,
  11,
  {fps: 60, resolution: '1080p', bitrate: '9286k'},
];

/** VP9 Video6313Vp93840x2160Fps30BitrateKbps39936k Stream. */
const Video6313Vp93840x2160Fps30BitrateKbps39936k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video6_313_vp9_3840x2160_fps=30_bitrate_kbps=39936k.webm',
  26771817,
  11,
  {fps: 30, resolution: '2160p', bitrate: '39936k'},
];

/** VP9 Video6315Vp93840x2160Fps60BitrateKbps38289k Stream. */
const Video6315Vp93840x2160Fps60BitrateKbps38289k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video6_315_vp9_3840x2160_fps=60_bitrate_kbps=38289k.webm',
  37626665,
  11,
  {fps: 60, resolution: '2160p', bitrate: '38289k'},
];

/** VP9 Video7248Vp91920x1080Fps30BitrateKbps12987k Stream. */
const Video7248Vp91920x1080Fps30BitrateKbps12987k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video7_248_vp9_1920x1080_fps=30_bitrate_kbps=12987k.webm',
  4919016,
  11,
  {fps: 30, resolution: '1080p', bitrate: '12987k'},
];

/** VP9 Video7303Vp91920x1080Fps60BitrateKbps15126k Stream. */
const Video7303Vp91920x1080Fps60BitrateKbps15126k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video7_303_vp9_1920x1080_fps=60_bitrate_kbps=15126k.webm',
  7435897,
  11,
  {fps: 60, resolution: '1080p', bitrate: '15126k'},
];

/** VP9 Video7313Vp93840x2160Fps30BitrateKbps32303k Stream. */
const Video7313Vp93840x2160Fps30BitrateKbps32303k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video7_313_vp9_3840x2160_fps=30_bitrate_kbps=32303k.webm',
  26032736,
  11,
  {fps: 30, resolution: '2160p', bitrate: '32303k'},
];

/** VP9 Video7315Vp93840x2160Fps60BitrateKbps36468k Stream. */
const Video7315Vp93840x2160Fps60BitrateKbps36468k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video7_315_vp9_3840x2160_fps=60_bitrate_kbps=36468k.webm',
  37867754,
  11,
  {fps: 60, resolution: '2160p', bitrate: '36468k'},
];

/** VP9 Video8248Vp91920x1080Fps30BitrateKbps13793k Stream. */
const Video8248Vp91920x1080Fps30BitrateKbps13793k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video8_248_vp9_1920x1080_fps=30_bitrate_kbps=13793k.webm',
  3670205,
  11,
  {fps: 30, resolution: '1080p', bitrate: '13794k'},
];

/** VP9 Video8303Vp91920x1080Fps60BitrateKbps10398k Stream. */
const Video8303Vp91920x1080Fps60BitrateKbps10398k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video8_303_vp9_1920x1080_fps=60_bitrate_kbps=10398k.webm',
  4329200,
  11,
  {fps: 60, resolution: '1080p', bitrate: '10399k'},
];

/** VP9 Video8313Vp93840x2160Fps30BitrateKbps36345k Stream. */
const Video8313Vp93840x2160Fps30BitrateKbps36345k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video8_313_vp9_3840x2160_fps=30_bitrate_kbps=36345k.webm',
  24552353,
  11,
  {fps: 30, resolution: '2160p', bitrate: '36346k'},
];

/** VP9 Video8315Vp93840x2160Fps60BitrateKbps34865k Stream. */
const Video8315Vp93840x2160Fps60BitrateKbps34865k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video8_315_vp9_3840x2160_fps=60_bitrate_kbps=34865k.webm',
  36348382,
  11,
  {fps: 60, resolution: '2160p', bitrate: '34866k'},
];

/** VP9 Video9248Vp91920x1080Fps30BitrateKbps17678k Stream. */
const Video9248Vp91920x1080Fps30BitrateKbps17678k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video9_248_vp9_1920x1080_fps=30_bitrate_kbps=17678k.webm',
  3501963,
  11,
  {fps: 30, resolution: '1080p', bitrate: '17678k'},
];

/** VP9 Video9303Vp91920x1080Fps60BitrateKbps12827k Stream. */
const Video9303Vp91920x1080Fps60BitrateKbps12827k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video9_303_vp9_1920x1080_fps=60_bitrate_kbps=12827k.webm',
  3537006,
  11,
  {fps: 60, resolution: '1080p', bitrate: '12827k'},
];

/** VP9 Video9313Vp93840x2160Fps30BitrateKbps40745k Stream. */
const Video9313Vp93840x2160Fps30BitrateKbps40745k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video9_313_vp9_3840x2160_fps=30_bitrate_kbps=40745k.webm',
  26356782,
  11,
  {fps: 30, resolution: '2160p', bitrate: '40745k'},
];

/** VP9 Video9315Vp93840x2160Fps60BitrateKbps42637k Stream. */
const Video9315Vp93840x2160Fps60BitrateKbps42637k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video9_315_vp9_3840x2160_fps=60_bitrate_kbps=42637k.webm',
  38480915,
  11,
  {fps: 60, resolution: '2160p', bitrate: '42637k'},
];

/** VP9 HdrHlgUltralow Stream. */
const HdrHlgUltralow: VideoStreamData = [
  'motor_vp9_hdr_ultralow.webm',
  4093046,
  254.462,
  {
    transferFunction: 'HLG',
    fps: 30,
    resolution: '144p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlgLow Stream. */
const HdrHlgLow: VideoStreamData = [
  'motor_vp9_hdr_low.webm',
  6157161,
  254.462,
  {
    transferFunction: 'HLG',
    fps: 30,
    resolution: '240p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlgMed Stream. */
const HdrHlgMed: VideoStreamData = [
  'motor_vp9_hdr_med.webm',
  13026706,
  254.462,
  {
    transferFunction: 'HLG',
    fps: 30,
    resolution: '360p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlgHigh Stream. */
const HdrHlgHigh: VideoStreamData = [
  'motor_vp9_hdr_high.webm',
  24059408,
  254.462,
  {
    transferFunction: 'HLG',
    fps: 30,
    resolution: '480p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlg720p Stream. */
const HdrHlg720p: VideoStreamData = [
  'motor_vp9_hdr_720p.webm',
  54591653,
  254.462,
  {
    transferFunction: 'HLG',
    fps: 30,
    resolution: '720p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlg1080p Stream. */
const HdrHlg1080p: VideoStreamData = [
  'motor_vp9_hdr_1080p.webm',
  96437886,
  254.462,
  {
    transferFunction: 'HLG',
    fps: 30,
    resolution: '1080p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlg2k Stream. */
const HdrHlg2k: VideoStreamData = [
  'motor_vp9_hdr_2k.webm',
  304356661,
  254.462,
  {
    transferFunction: 'HLG',
    fps: 30,
    resolution: '1440p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlg4k Stream. */
const HdrHlg4k: VideoStreamData = [
  'motor_vp9_hdr_4k.webm',
  631043806,
  254.462,
  {
    transferFunction: 'HLG',
    fps: 30,
    resolution: '2160p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlgUltralowHfr Stream. */
const HdrHlgUltralowHfr: VideoStreamData = [
  'news_vp9_hdr_ultralow.webm',
  2629927,
  136.62,
  {
    transferFunction: 'HLG',
    fps: 60,
    resolution: '144p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlgLowHfr Stream. */
const HdrHlgLowHfr: VideoStreamData = [
  'news_vp9_hdr_low.webm',
  3948184,
  136.62,
  {
    transferFunction: 'HLG',
    fps: 60,
    resolution: '240p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlgMedHfr Stream. */
const HdrHlgMedHfr: VideoStreamData = [
  'news_vp9_hdr_med.webm',
  8339341,
  136.62,
  {
    transferFunction: 'HLG',
    fps: 60,
    resolution: '360p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlgHighHfr Stream. */
const HdrHlgHighHfr: VideoStreamData = [
  'news_vp9_hdr_high.webm',
  15621796,
  136.62,
  {
    transferFunction: 'HLG',
    fps: 60,
    resolution: '480p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlg720pHfr Stream. */
const HdrHlg720pHfr: VideoStreamData = [
  'news_vp9_hdr_720p.webm',
  34871072,
  136.62,
  {
    transferFunction: 'HLG',
    fps: 60,
    resolution: '720p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlg1080pHfr Stream. */
const HdrHlg1080pHfr: VideoStreamData = [
  'news_vp9_hdr_1080p.webm',
  58835191,
  136.62,
  {
    transferFunction: 'HLG',
    fps: 60,
    resolution: '1080p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlg2kHfr Stream. */
const HdrHlg2kHfr: VideoStreamData = [
  'news_vp9_hdr_2k.webm',
  156656282,
  136.62,
  {
    transferFunction: 'HLG',
    fps: 60,
    resolution: '1440p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrHlg4kHfr Stream. */
const HdrHlg4kHfr: VideoStreamData = [
  'news_vp9_hdr_4k.webm',
  314053586,
  136.62,
  {
    transferFunction: 'HLG',
    fps: 60,
    resolution: '2160p',
    codecMetadata: HLG_VP9_METADATA,
  },
];

/** VP9 HdrPqUltralow Stream. */
const HdrPqUltralow: VideoStreamData = [
  'roadtrip_vp9_hdr_ultralow.webm',
  1561697,
  108.358,
  {
    transferFunction: 'PQ',
    fps: 30,
    resolution: '144p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPqUltrahigh Stream. */
const HdrPqUltrahigh: VideoStreamData = [
  'high-bitrate/longvid/Video11_8K_HDR_PQ_Sky_and_Ocean_337.out.enc',
  98253784,
  20,
  {
    transferFunction: 'PQ',
    video_id: CBCS_VIDEO_ID,
    fps: 30,
    resolution: '4320p',
    widevine_signature: CBCS_WIDEVINE_SIGNATURE,
    key: KEY,
  },
];

/** VP9 HdrPqLow Stream. */
const HdrPqLow: VideoStreamData = [
  'roadtrip_vp9_hdr_low.webm',
  2662190,
  108.358,
  {
    transferFunction: 'PQ',
    fps: 30,
    resolution: '240p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPqMed Stream. */
const HdrPqMed: VideoStreamData = [
  'roadtrip_vp9_hdr_med.webm',
  5719740,
  108.358,
  {
    transferFunction: 'PQ',
    fps: 30,
    resolution: '360p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPqHigh Stream. */
const HdrPqHigh: VideoStreamData = [
  'roadtrip_vp9_hdr_high.webm',
  10715789,
  108.358,
  {
    transferFunction: 'PQ',
    fps: 30,
    resolution: '480p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPq720p Stream. */
const HdrPq720p: VideoStreamData = [
  'roadtrip_vp9_hdr_720p.webm',
  24453226,
  108.358,
  {
    transferFunction: 'PQ',
    fps: 30,
    resolution: '720p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPq1080p Stream. */
const HdrPq1080p: VideoStreamData = [
  'roadtrip_vp9_hdr_1080p.webm',
  43377155,
  108.358,
  {
    transferFunction: 'PQ',
    fps: 30,
    resolution: '1080p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPq2k Stream. */
const HdrPq2k: VideoStreamData = [
  'roadtrip_vp9_hdr_2k.webm',
  121051265,
  108.358,
  {
    transferFunction: 'PQ',
    fps: 30,
    resolution: '1440p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPq4k Stream. */
const HdrPq4k: VideoStreamData = [
  'roadtrip_vp9_hdr_4k.webm',
  286332111,
  108.358,
  {
    'transferFunction': 'PQ',
    'fps': 30,
    'resolution': '2160p',
    'codecMetadata': PQ_VP9_METADATA,
  },
];

/** VP9 HdrPqUltralowHfr Stream. */
const HdrPqUltralowHfr: VideoStreamData = [
  'meridian_vp9_hdr_ultralow.webm',
  12680814,
  718.94,
  {
    transferFunction: 'PQ',
    fps: 60,
    resolution: '144p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPqLowHfr Stream. */
const HdrPqLowHfr: VideoStreamData = [
  'meridian_vp9_hdr_low.webm',
  26899101,
  718.94,
  {
    transferFunction: 'PQ',
    fps: 60,
    resolution: '240p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPqMedHfr Stream. */
const HdrPqMedHfr: VideoStreamData = [
  'meridian_vp9_hdr_med.webm',
  63165785,
  718.94,
  {
    transferFunction: 'PQ',
    fps: 60,
    resolution: '360p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPqHighHfr Stream. */
const HdrPqHighHfr: VideoStreamData = [
  'meridian_vp9_hdr_high.webm',
  132217173,
  718.94,
  {
    transferFunction: 'PQ',
    fps: 60,
    resolution: '480p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPq720pHfr Stream. */
const HdrPq720pHfr: VideoStreamData = [
  'meridian_vp9_hdr_720p.webm',
  339235754,
  718.94,
  {
    transferFunction: 'PQ',
    fps: 60,
    resolution: '720p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPq1080pHfr Stream. */
const HdrPq1080pHfr: VideoStreamData = [
  'meridian_vp9_hdr_1080p.webm',
  531408862,
  718.94,
  {
    transferFunction: 'PQ',
    fps: 60,
    resolution: '1080p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPq2kHfr Stream. */
const HdrPq2kHfr: VideoStreamData = [
  'meridian_vp9_hdr_2k.webm',
  1259703408,
  718.94,
  {
    transferFunction: 'PQ',
    fps: 60,
    resolution: '1440p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** VP9 HdrPq4kHfr Stream. */
const HdrPq4kHfr: VideoStreamData = [
  'meridian_vp9_hdr_4k.webm',
  2249443995,
  718.94,
  {
    transferFunction: 'PQ',
    fps: 60,
    resolution: '2160p',
    codecMetadata: PQ_VP9_METADATA,
  },
];

/** Main collection of all VP9 streams. */
export const VP9_STREAMS: VideoStreamsType = {
  streamtype: 'VP9',
  mimetype: `video/webm; codecs="${getVp9CodecString()}"`,
  mediatype: 'video',
  container: 'webm',
  streams: {
    Video1080p1MB,
    Video2160p1MB,
    Video2160pHdr1MB,
    VideoTiny,
    VideoNormal,
    VideoHuge,
    Video1MB,
    VideoShorts,
    VideoLive,
    Shorts242,
    Shorts243,
    Shorts244,
    Shorts247,
    Shorts248,
    Shorts271,
    Shorts278,
    Shorts313,
    Shorts302,
    Shorts303,
    Shorts308,
    Shorts315,
    Shorts598,
    VideoHighEnc,
    VideoHighSubSampleEnc,
    Sintel2kEnc,
    Sintel4kEnc,
    DrmL3NoHDCP240p30fpsEnc,
    DrmL3NoHDCP360p30fpsEnc,
    DrmL3NoHDCP480p30fpsEnc,
    DrmL3NoHDCP480p30fpsMqEnc,
    DrmL3NoHDCP480p30fpsHqEnc,
    DrmL3NoHDCP720p30fpsEnc,
    DrmL3NoHDCP720p30fpsMqEnc,
    DrmL3NoHDCP720p30fpsHqEnc,
    DrmL3NoHDCP720p60fpsEnc,
    DrmL3NoHDCP720p60fpsMqEnc,
    DrmL3NoHDCP1080p30fpsEnc,
    DrmL3NoHDCP1080p30fpsMqEnc,
    DrmL3NoHDCP1080p30fpsHqEnc,
    DrmL3NoHDCP1080p60fpsEnc,
    DrmL3NoHDCP1080p60fpsMqEnc,
    DrmCbcs1080p60fps,
    DrmHighBitrate1080p,
    Video101920x1080Fps30Vp9,
    Video101920x1080Fps60Vp9,
    Video103840x2160Fps30Vp9,
    Video103840x2160Fps60Vp9,
    Video11920x1080Fps30Vp9,
    Video11920x1080Fps60Vp9,
    Video13840x2160Fps30Vp9,
    Video13840x2160Fps60Vp9,
    Video21920x1080Fps30Vp9,
    Video21920x1080Fps60Vp9,
    Video23840x2160Fps30Vp9,
    Video23840x2160Fps60Vp9,
    Video31920x1080Fps30Vp9,
    Video31920x1080Fps60Vp9,
    Video33840x2160Fps30Vp9,
    Video33840x2160Fps60Vp9,
    Video41920x1080Fps30Vp9,
    Video41920x1080Fps60Vp9,
    Video43840x2160Fps30Vp9,
    Video43840x2160Fps60Vp9,
    Video51920x1080Fps30Vp9,
    Video51920x1080Fps60Vp9,
    Video53840x2160Fps30Vp9,
    Video53840x2160Fps60Vp9,
    Video61920x1080Fps30Vp9,
    Video61920x1080Fps60Vp9,
    Video63840x2160Fps30Vp9,
    Video63840x2160Fps60Vp9,
    Video71920x1080Fps30Vp9,
    Video71920x1080Fps60Vp9,
    Video73840x2160Fps30Vp9,
    Video73840x2160Fps60Vp9,
    Video81920x1080Fps30Vp9,
    Video81920x1080Fps60Vp9,
    Video83840x2160Fps30Vp9,
    Video83840x2160Fps60Vp9,
    Video91920x1080Fps30Vp9,
    Video91920x1080Fps60Vp9,
    Video93840x2160Fps30Vp9,
    Video93840x2160Fps60Vp9,
    publish3s,
    Concat,
    ProgressiveLow,
    Webgl144p30fps,
    Webgl240p30fps,
    Webgl360p30fps,
    Webgl480p30fps,
    Webgl720p30fps,
    Webgl720p60fps,
    Webgl1080p30fps,
    Webgl1080p60fps,
    Webgl1080p240fps,
    Webgl1440p30fps,
    Webgl1440p60fps,
    Webgl2160p30fps,
    Webgl2160p60fps,
    Spherical144s30fps,
    Spherical240s30fps,
    Spherical360s30fps,
    Spherical480s30fps,
    Spherical720s30fps,
    Spherical720s60fps,
    Spherical1080s30fps,
    Spherical1080s60fps,
    Spherical1440s30fps,
    Spherical1440s60fps,
    Spherical2160s30fps,
    Spherical2160s60fps,
    video1080p5815kbps,
    TestMaterialsMediaSphericalVp91080s60fps137H2641920x1080Fps29,
    TestMaterialsMediaSphericalVp91080s60fps248Vp91920x1080Fps29,
    TestMaterialsMediaSphericalVp91080s60fps299H2641920x1080Fps59,
    TestMaterialsMediaSphericalVp91080s60fps303Vp91920x1080Fps59,
    TestMaterialsMediaSphericalVp91080s60fps313Vp93840x2160Fps29,
    TestMaterialsMediaSphericalVp91080s60fps315Vp93840x2160Fps59,
    TestMaterialsMediaSphericalVp91080s60fps399Av11920x1080Fps29,
    TestMaterialsMediaSphericalVp91080s60fps401Av13840x2160Fps29,
    TestMaterialsMediaSphericalVp91080s60fps571Av17680x4320Fps29,
    TestMaterialsMediaSphericalVp92160s60fps137H2641920x1080Fps29,
    TestMaterialsMediaSphericalVp92160s60fps248Vp91920x1080Fps29,
    TestMaterialsMediaSphericalVp92160s60fps299H2641920x1080Fps59,
    TestMaterialsMediaSphericalVp92160s60fps303Vp91920x1080Fps59,
    TestMaterialsMediaSphericalVp92160s60fps313Vp93840x2160Fps29,
    TestMaterialsMediaSphericalVp92160s60fps315Vp93840x2160Fps59,
    TestMaterialsMediaSphericalVp92160s60fps399Av11920x1080Fps29,
    TestMaterialsMediaSphericalVp92160s60fps401Av13840x2160Fps29,
    TestMaterialsMediaSphericalVp92160s60fps571Av17680x4320Fps29,
    Video10248Vp91920x1080Fps30BitrateKbps16922k,
    Video10303Vp91920x1080Fps60BitrateKbps16866k,
    Video10313Vp93840x2160Fps30BitrateKbps43754k,
    Video10315Vp93840x2160Fps60BitrateKbps41145k,
    Video1248Vp91920x1080Fps30BitrateKbps13793k,
    Video1303Vp91920x1080Fps60BitrateKbps10398k,
    Video1313Vp93840x2160Fps30BitrateKbps36345k,
    Video1315Vp93840x2160Fps60BitrateKbps34865k,
    Video2248Vp91920x1080Fps30BitrateKbps18271k,
    Video2303Vp91920x1080Fps60BitrateKbps16036k,
    Video2313Vp93840x2160Fps30BitrateKbps42243k,
    Video2315Vp93840x2160Fps60BitrateKbps43999k,
    Video3248Vp91920x1080Fps30BitrateKbps14327k,
    Video3303Vp91920x1080Fps60BitrateKbps16011k,
    Video3313Vp93840x2160Fps30BitrateKbps36442k,
    Video3315Vp93840x2160Fps60BitrateKbps35900k,
    Video4248Vp91920x1080Fps30BitrateKbps14511k,
    Video4303Vp91920x1080Fps60BitrateKbps10607k,
    Video4313Vp93840x2160Fps30BitrateKbps41239k,
    Video4315Vp93840x2160Fps60BitrateKbps34783k,
    Video5248Vp91920x1080Fps30BitrateKbps17822k,
    Video5303Vp91920x1080Fps60BitrateKbps12324k,
    Video5313Vp93840x2160Fps30BitrateKbps41760k,
    Video5315Vp93840x2160Fps60BitrateKbps39941k,
    Video6248Vp91920x1080Fps30BitrateKbps16972k,
    Video6303Vp91920x1080Fps60BitrateKbps9286k,
    Video6313Vp93840x2160Fps30BitrateKbps39936k,
    Video6315Vp93840x2160Fps60BitrateKbps38289k,
    Video7248Vp91920x1080Fps30BitrateKbps12987k,
    Video7303Vp91920x1080Fps60BitrateKbps15126k,
    Video7313Vp93840x2160Fps30BitrateKbps32303k,
    Video7315Vp93840x2160Fps60BitrateKbps36468k,
    Video8248Vp91920x1080Fps30BitrateKbps13793k,
    Video8303Vp91920x1080Fps60BitrateKbps10398k,
    Video8313Vp93840x2160Fps30BitrateKbps36345k,
    Video8315Vp93840x2160Fps60BitrateKbps34865k,
    Video9248Vp91920x1080Fps30BitrateKbps17678k,
    Video9303Vp91920x1080Fps60BitrateKbps12827k,
    Video9313Vp93840x2160Fps30BitrateKbps40745k,
    Video9315Vp93840x2160Fps60BitrateKbps42637k,
    HdrHlgUltralow,
    HdrHlgLow,
    HdrHlgMed,
    HdrHlgHigh,
    HdrHlg720p,
    HdrHlg1080p,
    HdrHlg2k,
    HdrHlg4k,
    HdrHlgUltralowHfr,
    HdrHlgLowHfr,
    HdrHlgMedHfr,
    HdrHlgHighHfr,
    HdrHlg720pHfr,
    HdrHlg1080pHfr,
    HdrHlg2kHfr,
    HdrHlg4kHfr,
    HdrPqUltralow,
    HdrPqUltrahigh,
    HdrPqLow,
    HdrPqMed,
    HdrPqHigh,
    HdrPq720p,
    HdrPq1080p,
    HdrPq2k,
    HdrPq4k,
    HdrPqUltralowHfr,
    HdrPqLowHfr,
    HdrPqMedHfr,
    HdrPqHighHfr,
    HdrPq720pHfr,
    HdrPq1080pHfr,
    HdrPq2kHfr,
    HdrPq4kHfr,
  } as VideoStreamCollection,
};

// tslint:enable:enforce-name-casing
