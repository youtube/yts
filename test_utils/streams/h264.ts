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
  VideoStreamCollection,
  VideoStreamData,
  VideoStreamsType,
} from './interfaces';

// tslint:disable:enforce-name-casing

/** PlayReady signature for specific H.264 streams. */
export const PLAYREADY_SIGNATURE_1 =
  '448279561E2755699618BE0A2402189D4A30B03B.0CD6A27286BD2DAF00577FFA21928665DCD320C2';
/** Widevine signature for specific H.264 streams. */
export const WIDEVINE_SIGNATURE_1 =
  '9C4BE99E6F517B51FED1F0B3B31966D3C5DAB9D6.6A1F30BB35F3A39A4CA814B731450D4CBD198FFD';
/** Video ID for L3 NoHDCP Widevine encrypted H.264 streams. */
export const WIDEVINE_L3NOHDCP_VIDEO_ID = 'f320151fa3f061b2';
/** Widevine signature for L3 NoHDCP H.264 streams. */
export const WIDEVINE_L3NOHDCP_SIGNATURE =
  '81E7B33929F9F35922F7D2E96A5E7AC36F3218B2.673F553EE51A48438AE5E707AEC87A071B4FEF65';

/** H.264 VideoTiny Stream. */
const VideoTiny: VideoStreamData = [
  'car-20120827-85.mp4',
  6015001,
  181.44,
  {
    videoChangeRate: 11.47,
    mimeType: 'video/mp4; codecs="avc1.4d4015"',
    resolution: '240p',
  },
];

/** H.264 Aspect Ratio 16x9 10s Stream. */
export const AspectRatio16x9: VideoStreamData = [
  '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/aspect-ratio/video_16_9.mp4',
  1000000,
  10,
  {
    mimeType: 'video/mp4; codecs="avc1.42E01E"',
    resolution: '480p',
  },
];

/** H.264 Aspect Ratio 4x3 10s Stream. */
export const AspectRatio4x3: VideoStreamData = [
  '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/aspect-ratio/video_4_3.mp4',
  1000000,
  10,
  {
    mimeType: 'video/mp4; codecs="avc1.42E01E"',
    resolution: '480p',
  },
];

/** H.264 Aspect Ratio 16x9 10s Stream. */
export const AspectRatio16x9Part1: VideoStreamData = [
  '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/aspect-ratio/video_16_9_part1.mp4',
  122297,
  5,
  {
    mimeType: 'video/mp4; codecs="avc1.42E01E"',
    resolution: '720p',
  },
];
/** H.264 Aspect Ratio 16x9 10s Stream. */
export const AspectRatio16x9Part2: VideoStreamData = [
  '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/aspect-ratio/video_16_9_part2.mp4',
  122297,
  5,
  {
    mimeType: 'video/mp4; codecs="avc1.42E01E"',
    resolution: '720p',
  },
];

/** H.264 Aspect Ratio 4x3 10s Stream. */
export const AspectRatio4x3Part1: VideoStreamData = [
  '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/aspect-ratio/video_4_3_part1.mp4',
  60875,
  5,
  {
    mimeType: 'video/mp4; codecs="avc1.42E01E"',
    resolution: '480p',
  },
];
/** H.264 Aspect Ratio 4x3 10s Stream. */
export const AspectRatio4x3Part2: VideoStreamData = [
  '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/aspect-ratio/video_4_3_part2.mp4',
  60875,
  5,
  {
    mimeType: 'video/mp4; codecs="avc1.42E01E"',
    resolution: '480p',
  },
];

/** H.264 VideoNormal Stream. */
const VideoNormal: VideoStreamData = [
  'car-20120827-86.mp4',
  15593225,
  181.44,
  {mimeType: 'video/mp4; codecs="avc1.4d401e"', resolution: '360p'},
];

/** H.264 VideoShorts Stream. */
const VideoShorts: VideoStreamData = [
  'shorts/134_final.mp4',
  27393,
  15,
  {mimeType: 'video/mp4; codecs="avc1.4d001e"', resolution: '360p'},
];

/** H.264 CarMedium Stream. */
const CarMedium: VideoStreamData = [
  'car09222016-med-134.mp4',
  10150205,
  181.47,
  {mimeType: 'video/mp4; codecs="avc1.4d401e"', resolution: '360p'},
];

/** H.264 VideoHuge Stream. */
const VideoHuge: VideoStreamData = [
  'car-20120827-89.mp4',
  95286345,
  181.44,
  {mimeType: 'video/mp4; codecs="avc1.640028"', resolution: '1080p'},
];

/** H.264 Video1MB Stream. */
const Video1MB: VideoStreamData = [
  'test-video-1MB.mp4',
  1053406,
  1.04,
  {
    mimeType: 'video/mp4; codecs="avc1.4d401f"',
    resolution: '360p',
    width: 480,
  },
];

/** H.264 Shorts133 Stream. */
const Shorts133: VideoStreamData = [
  'shorts/shorts.f133.mp4',
  2505508,
  88,
  {
    mimeType: 'video/mp4; codecs="avc1.424015"',
    resolution: '426p',
    fps: 24,
  },
];

/** H.264 Shorts134 Stream. */
const Shorts134: VideoStreamData = [
  'shorts/shorts.f134.mp4',
  5193032,
  88,
  {
    mimeType: 'video/mp4; codecs="avc1.42401e"',
    resolution: '640p',
    fps: 24,
  },
];

/** H.264 Shorts135 Stream. */
const Shorts135: VideoStreamData = [
  'shorts/shorts.f135.mp4',
  10765506,
  88,
  {
    mimeType: 'video/mp4; codecs="avc1.42401e"',
    resolution: '854p',
    fps: 24,
  },
];

/** H.264 Shorts136 Stream. */
const Shorts136: VideoStreamData = [
  'shorts/shorts.f136.mp4',
  21664591,
  88,
  {
    mimeType: 'video/mp4; codecs="avc1.42401f"',
    resolution: '1280p',
    fps: 24,
  },
];

/** H.264 Shorts137 Stream. */
const Shorts137: VideoStreamData = [
  'shorts/shorts.f137.mp4',
  46165194,
  88,
  {
    mimeType: 'video/mp4; codecs="avc1.424028"',
    resolution: '1920p',
    fps: 24,
  },
];

/** H.264 Shorts160 Stream. */
const Shorts160: VideoStreamData = [
  'shorts/shorts.f160.mp4',
  1049032,
  88,
  {
    mimeType: 'video/mp4; codecs="avc1.42400c"',
    resolution: '256p',
    fps: 24,
  },
];

/** H.264 Shorts298 Stream. */
const Shorts298: VideoStreamData = [
  'shorts/shorts.f298.mp4',
  102206,
  15,
  {
    mimeType: 'video/mp4; codecs="avc1.424020"',
    resolution: '1280p',
    fps: 60,
  },
];

/** H.264 Shorts299 Stream. */
const Shorts299: VideoStreamData = [
  'shorts/shorts.f299.mp4',
  226168,
  15,
  {
    mimeType: 'video/mp4; codecs="avc1.42402a"',
    resolution: '1920p',
    fps: 60,
  },
];

/** H.264 Shorts597 Stream. */
const Shorts597: VideoStreamData = [
  'shorts/shorts.f597.mp4',
  9408,
  15,
  {
    mimeType: 'video/mp4; codecs="avc1.42000b"',
    resolution: '256p',
    fps: 15,
  },
];

/** H.264 VideoHeAac Stream. */
const VideoHeAac: VideoStreamData = [
  'test_stream_H264-HE-AAC.mp4',
  6676977,
  26.1,
  {
    mimeType: 'video/mp4; codecs="avc1.64001f"',
    resolution: '480p',
    width: 854,
  },
];

/** H.264 VideoNormalClearKey Stream. */
const VideoNormalClearKey: VideoStreamData = [
  'car_cenc-20120827-86.mp4',
  15795193,
  181.44,
  {
    mimeType: 'video/mp4; codecs="avc1.4d401e"',
    key: new Uint8Array([
      0x1a, 0x8a, 0x20, 0x95, 0xe4, 0xde, 0xb2, 0xd2, 0x9e, 0xc8, 0x16, 0xac,
      0x7b, 0xae, 0x20, 0x82,
    ]),
    kid: new Uint8Array([
      0x60, 0x06, 0x1e, 0x01, 0x7e, 0x47, 0x7e, 0x87, 0x7e, 0x57, 0xd0, 0x0d,
      0x1e, 0xd0, 0x0d, 0x1e,
    ]),
    resolution: '360p',
  },
];

/** H.264 VideoStreamYTCenc Stream. */
const VideoStreamYTCenc: VideoStreamData = [
  'oops_cenc-20121114-145-no-clear-start.mp4',
  39980507,
  242.71,
  {
    mimeType: 'video/mp4; codecs="avc1.4d401f"',
    video_id: '03681262dc412c06',
    widevine_signature: WIDEVINE_SIGNATURE_1,
    key: new Uint8Array([
      233, 122, 210, 133, 203, 93, 59, 228, 167, 150, 27, 122, 246, 145, 112,
      218,
    ]),
    resolution: '720p',
  },
];

/** H.264 VideoTinyStreamYTCenc Stream. */
const VideoTinyStreamYTCenc: VideoStreamData = [
  'oops_cenc-20121114-145-143.mp4',
  7229257,
  30.03,
  {
    mimeType: 'video/mp4; codecs="avc1.4d401f"',
    resolution: '720p',
  },
];

/** H.264 VideoSmallStreamYTCenc Stream. */
const VideoSmallStreamYTCenc: VideoStreamData = [
  'oops_cenc-20121114-143-no-clear-start.mp4',
  12045546,
  242.71,
  {
    mimeType: 'video/mp4; codecs="avc1.4d401e"',
    key: new Uint8Array([
      131, 162, 92, 175, 153, 178, 172, 41, 2, 167, 251, 126, 233, 215, 230,
      185,
    ]),
    resolution: '360p',
  },
];

/** H.264 VideoSmallCenc Stream. */
const VideoSmallCenc: VideoStreamData = [
  'oops_cenc-20121114-142.mp4',
  8017271,
  242.71,
  {
    mimeType: 'video/mp4; codecs="avc1.4d4015"',
    video_id: '03681262dc412c06',
    playready_signature: PLAYREADY_SIGNATURE_1,
    widevine_signature: WIDEVINE_SIGNATURE_1,
    resolution: '240p',
  },
];

/** H.264 VideoClearMiddleCenc Stream (CENC encrypted). */
const VideoClearMiddleCenc: VideoStreamData = [
  'oops_cenc_clearmiddle-20250513-143.mp4',
  9910333,
  242.78,
  {
    mimeType: 'video/mp4; codecs="avc1.4d4015"',
    video_id: '03681262dc412c06',
    playready_signature: PLAYREADY_SIGNATURE_1,
    widevine_signature: WIDEVINE_SIGNATURE_1,
    resolution: '360p',
  },
];

/** H.264 VideoMultiKeyCenc Stream. */
const VideoMultiKeyCenc: VideoStreamData = [
  'tears_h264_main_720p_1500.mp4',
  105466539,
  734.17,
  {
    mimeType: 'video/mp4; codecs="avc1.4d401f"', // Note: original JS had 'mimetype'
    pssh: new Uint8Array([
      0, 0, 0, 68, 112, 115, 115, 104, 0, 0, 0, 0, 237, 239, 139, 169, 121, 214,
      74, 206, 163, 200, 39, 220, 213, 29, 33, 237, 0, 0, 0, 36, 8, 1, 18, 1,
      49, 26, 13, 119, 105, 100, 101, 118, 105, 110, 101, 95, 116, 101, 115,
      116, 34, 10, 50, 48, 49, 53, 95, 116, 95, 49, 54, 107, 42, 2, 83, 68,
    ]),
    license_server: 'https://proxy.uat.widevine.com/proxy',
    width: 1280,
    height: 532,
  },
];

/** H.264 DrmL3NoHDCP144p30fpsCenc Stream. */
const DrmL3NoHDCP144p30fpsCenc: VideoStreamData = [
  'drml3NoHdcp_h264_144p_30fps_cenc.mp4',
  1463083,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '144p',
  },
];

/** H.264 DrmL3NoHDCP240p30fpsCenc Stream. */
const DrmL3NoHDCP240p30fpsCenc: VideoStreamData = [
  'drml3NoHdcp_h264_240p_30fps_cenc.mp4',
  3177191,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '240p',
  },
];

/** H.264 DrmL3NoHDCP360p30fpsCenc Stream. */
const DrmL3NoHDCP360p30fpsCenc: VideoStreamData = [
  'drml3NoHdcp_h264_360p_30fps_cenc.mp4',
  7297992,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '360p',
  },
];

/** H.264 DrmL3NoHDCP480p30fpsCenc Stream. */
const DrmL3NoHDCP480p30fpsCenc: VideoStreamData = [
  'drml3NoHdcp_h264_480p_30fps_cenc.mp4',
  14394742,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '480p',
  },
];

/** H.264 DrmL3NoHDCP480p30fpsMqCenc Stream. */
const DrmL3NoHDCP480p30fpsMqCenc: VideoStreamData = [
  'drml3NoHdcp_h264_480p_mq_30fps_cenc.mp4',
  22118210,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '480p',
    quality: 'MQ',
  },
];

/** H.264 DrmL3NoHDCP480p30fpsHqCenc Stream. */
const DrmL3NoHDCP480p30fpsHqCenc: VideoStreamData = [
  'drml3NoHdcp_h264_480p_hq_30fps_cenc.mp4',
  44132909,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '480p',
    quality: 'HQ',
  },
];

/** H.264 DrmL3NoHDCP720p30fpsCenc Stream. */
const DrmL3NoHDCP720p30fpsCenc: VideoStreamData = [
  'drml3NoHdcp_h264_720p_30fps_cenc.mp4',
  28788524,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '720p',
  },
];

/** H.264 DrmL3NoHDCP720p30fpsMqCenc Stream. */
const DrmL3NoHDCP720p30fpsMqCenc: VideoStreamData = [
  'drml3NoHdcp_h264_720p_mq_30fps_cenc.mp4',
  44199586,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '720p',
    quality: 'MQ',
  },
];

/** H.264 DrmL3NoHDCP720p30fpsHqCenc Stream. */
const DrmL3NoHDCP720p30fpsHqCenc: VideoStreamData = [
  'drml3NoHdcp_h264_720p_hq_30fps_cenc.mp4',
  73591730,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '720p',
    quality: 'HQ',
  },
];

/** H.264 DrmL3NoHDCP720p60fpsCenc Stream. */
const DrmL3NoHDCP720p60fpsCenc: VideoStreamData = [
  'drml3NoHdcp_h264_720p_60fps_cenc.mp4',
  38436183,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '720p',
  },
];

/** H.264 DrmL3NoHDCP720p60fpsMqCenc Stream. */
const DrmL3NoHDCP720p60fpsMqCenc: VideoStreamData = [
  'drml3NoHdcp_h264_720p_mq_60fps_cenc.mp4',
  61027135,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '720p',
    quality: 'MQ',
  },
];

/** H.264 DrmL3NoHDCP1080p30fpsCenc Stream. */
const DrmL3NoHDCP1080p30fpsCenc: VideoStreamData = [
  'drml3NoHdcp_h264_1080p_30fps_cenc.mp4',
  55005156,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
  },
];

/** H.264 DrmL3NoHDCP1080p30fpsMqCenc Stream. */
const DrmL3NoHDCP1080p30fpsMqCenc: VideoStreamData = [
  'drml3NoHdcp_h264_1080p_mq_30fps_cenc.mp4',
  73580599,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
    quality: 'MQ',
  },
];

/** H.264 DrmL3NoHDCP1080p30fpsHqCenc Stream. */
const DrmL3NoHDCP1080p30fpsHqCenc: VideoStreamData = [
  'drml3NoHdcp_h264_1080p_hq_30fps_cenc.mp4',
  102970523,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
    quality: 'HQ',
  },
];

/** H.264 DrmL3NoHDCP1080p60fpsCenc Stream. */
const DrmL3NoHDCP1080p60fpsCenc: VideoStreamData = [
  'drml3NoHdcp_h264_1080p_60fps_cenc.mp4',
  72603681,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
  },
];

/** H.264 DrmL3NoHDCP1080p60fpsMqCenc Stream. */
const DrmL3NoHDCP1080p60fpsMqCenc: VideoStreamData = [
  'drml3NoHdcp_h264_1080p_mq_60fps_cenc.mp4',
  95823710,
  101.899,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
    quality: 'MQ',
  },
];

/** H.264 VideoHighBitrate1080p21052k Stream. */
const VideoHighBitrate1080p21052k: VideoStreamData = [
  'high-bitrate/1s/video10_299_h264_1920x1080_bitrate_kbps=21052k',
  2631616,
  1,
  {
    mimeType: 'video/mp4; codecs="avc1.4d002a"',
    resolution: '1080p',
    fps: 60,
  },
];

/** H.264 Video101920x1080Fps30H264 Stream. */
const Video101920x1080Fps30H264: VideoStreamData = [
  'high-bitrate/drm/video10_1920x1080_fps30_h264.enc',
  148686437,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
  },
];

/** H.264 Video101920x1080Fps60H264 Stream. */
const Video101920x1080Fps60H264: VideoStreamData = [
  'high-bitrate/drm/video10_1920x1080_fps60_h264.enc',
  149228183,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
  },
];

/** H.264 Video11920x1080Fps30H264 Stream. */
const Video11920x1080Fps30H264: VideoStreamData = [
  'high-bitrate/drm/video1_1920x1080_fps30_h264.enc',
  154455264,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
  },
];

/** H.264 Video11920x1080Fps60H264 Stream. */
const Video11920x1080Fps60H264: VideoStreamData = [
  'high-bitrate/drm/video1_1920x1080_fps60_h264.enc',
  154542308,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
  },
];

/** H.264 Video21920x1080Fps30H264 Stream. */
const Video21920x1080Fps30H264: VideoStreamData = [
  'high-bitrate/drm/video2_1920x1080_fps30_h264.enc',
  149944450,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
  },
];

/** H.264 Video21920x1080Fps60H264 Stream. */
const Video21920x1080Fps60H264: VideoStreamData = [
  'high-bitrate/drm/video2_1920x1080_fps60_h264.enc',
  147380836,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
  },
];

/** H.264 Video31920x1080Fps30H264 Stream. */
const Video31920x1080Fps30H264: VideoStreamData = [
  'high-bitrate/drm/video3_1920x1080_fps30_h264.enc',
  154432081,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
  },
];

/** H.264 Video31920x1080Fps60H264 Stream. */
const Video31920x1080Fps60H264: VideoStreamData = [
  'high-bitrate/drm/video3_1920x1080_fps60_h264.enc',
  154491901,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
  },
];

/** H.264 Video41920x1080Fps30H264 Stream. */
const Video41920x1080Fps30H264: VideoStreamData = [
  'high-bitrate/drm/video4_1920x1080_fps30_h264.enc',
  153954834,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
  },
];

/** H.264 Video41920x1080Fps60H264 Stream. */
const Video41920x1080Fps60H264: VideoStreamData = [
  'high-bitrate/drm/video4_1920x1080_fps60_h264.enc',
  154667123,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
  },
];

/** H.264 Video51920x1080Fps30H264 Stream. */
const Video51920x1080Fps30H264: VideoStreamData = [
  'high-bitrate/drm/video5_1920x1080_fps30_h264.enc',
  151372944,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
  },
];

/** H.264 Video51920x1080Fps60H264 Stream. */
const Video51920x1080Fps60H264: VideoStreamData = [
  'high-bitrate/drm/video5_1920x1080_fps60_h264.enc',
  151181741,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
  },
];

/** H.264 Video61920x1080Fps30H264 Stream. */
const Video61920x1080Fps30H264: VideoStreamData = [
  'high-bitrate/sdr-drm/video10_h264_fps=30.0_bitrate_kbps=18994.589.enc',
  154435813,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
  },
];

/** H.264 Video61920x1080Fps60H264 Stream. */
const Video61920x1080Fps60H264: VideoStreamData = [
  'high-bitrate/sdr-drm/video10_h264_fps=60.0_bitrate_kbps=19201.76.enc',
  156103337,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
  },
];

/** H.264 Video71920x1080Fps30H264 Stream. */
const Video71920x1080Fps30H264: VideoStreamData = [
  'high-bitrate/drm/video7_1920x1080_fps30_h264.enc',
  153638345,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
  },
];

/** H.264 Video71920x1080Fps60H264 Stream. */
const Video71920x1080Fps60H264: VideoStreamData = [
  'high-bitrate/drm/video7_1920x1080_fps60_h264.enc',
  153295280,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
  },
];

/** H.264 Video81920x1080Fps30H264 Stream. */
const Video81920x1080Fps30H264: VideoStreamData = [
  'high-bitrate/drm/video8_1920x1080_fps30_h264.enc',
  154455264,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
  },
];

/** H.264 Video81920x1080Fps60H264 Stream. */
const Video81920x1080Fps60H264: VideoStreamData = [
  'high-bitrate/drm/video8_1920x1080_fps60_h264.enc',
  154542308,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
  },
];

/** H.264 Video91920x1080Fps30H264 Stream. */
const Video91920x1080Fps30H264: VideoStreamData = [
  'high-bitrate/drm/video9_1920x1080_fps30_h264.enc',
  150034012,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 30,
    resolution: '1080p',
  },
];

/** H.264 Video91920x1080Fps60H264 Stream. */
const Video91920x1080Fps60H264: VideoStreamData = [
  'high-bitrate/drm/video9_1920x1080_fps60_h264.enc',
  149266147,
  65,
  {
    video_id: WIDEVINE_L3NOHDCP_VIDEO_ID,
    widevine_signature: WIDEVINE_L3NOHDCP_SIGNATURE,
    fps: 60,
    resolution: '1080p',
  },
];

/** H.264 ProgressiveLow Stream. */
const ProgressiveLow: VideoStreamData = [
  'car_20130125_18.mp4',
  15477531,
  181.55,
  {mimeType: 'video/mp4; codecs="avc1.42c01e"', resolution: '360p'},
];

/** H.264 FrameGap Stream. */
const FrameGap: VideoStreamData = [
  'nq-frames24-tfdt23.mp4',
  11883895,
  242.46,
  {mimeType: 'video/mp4; codecs="avc1.4d401e"', resolution: '360p'},
];

/** H.264 FrameOverlap Stream. */
const FrameOverlap: VideoStreamData = [
  'nq-frames23-tfdt24.mp4',
  11883895,
  242.46,
  {mimeType: 'video/mp4; codecs="avc1.4d401e"', resolution: '360p'},
];

/** H.264 Webgl144p15fps Stream. */
const Webgl144p15fps: VideoStreamData = [
  'big-buck-bunny-h264-144p-15fps.mp4',
  8620045,
  634.6,
  {
    mimeType: 'video/mp4; codecs="avc1.42c00c"',
    fps: 15,
    resolution: '144p',
  },
];

/** H.264 Webgl240p30fps Stream. */
const Webgl240p30fps: VideoStreamData = [
  'big-buck-bunny-h264-240p-30fps.mp4',
  19406299,
  634.57,
  {
    mimeType: 'video/mp4; codecs="avc1.4d4015"',
    fps: 30,
    resolution: '240p',
  },
];

/** H.264 Webgl360p30fps Stream. */
const Webgl360p30fps: VideoStreamData = [
  'big-buck-bunny-h264-360p-30fps.mp4',
  28791964,
  634.57,
  {
    mimeType: 'video/mp4; codecs="avc1.4d401e"',
    fps: 30,
    resolution: '360p',
  },
];

/** H.264 Webgl480p30fps Stream. */
const Webgl480p30fps: VideoStreamData = [
  'big-buck-bunny-h264-480p-30fps.mp4',
  56238435,
  634.57,
  {
    mimeType: 'video/mp4; codecs="avc1.4d401f"',
    fps: 30,
    resolution: '480p',
  },
];

/** H.264 Webgl720p30fps Stream. */
const Webgl720p30fps: VideoStreamData = [
  'big-buck-bunny-h264-720p-30fps.mp4',
  106822776,
  634.57,
  {
    mimeType: 'video/mp4; codecs="avc1.4d401f"',
    fps: 30,
    resolution: '720p',
  },
];

/** H.264 Webgl720p60fps Stream. */
const Webgl720p60fps: VideoStreamData = [
  'big-buck-bunny-h264-720p-60fps.mp4',
  181505335,
  634.57,
  {
    mimeType: 'video/mp4; codecs="avc1.4d4020"',
    fps: 60,
    resolution: '720p',
  },
];

/** H.264 Webgl1080p30fps Stream. */
const Webgl1080p30fps: VideoStreamData = [
  'big-buck-bunny-h264-1080p-30fps.mp4',
  189028629,
  634.57,
  {
    mimeType: 'video/mp4; codecs="avc1.640028"',
    fps: 30,
    resolution: '1080p',
  },
];

/** H.264 Webgl1080p60fps Stream. */
const Webgl1080p60fps: VideoStreamData = [
  'big-buck-bunny-h264-1080p-60fps.mp4',
  313230764,
  634.57,
  {
    mimeType: 'video/mp4; codecs="avc1.64002a"',
    fps: 60,
    resolution: '1080p',
  },
];

/** H.264 Webgl1080p240fps Stream. */
const Webgl1080p240fps: VideoStreamData = [
  'bbb_h264_240.mp4',
  313230764,
  30,
  {
    mimeType: 'video/mp4; codecs="avc1.64002a"',
    fps: 240,
    resolution: '1080p',
  },
];

/** H.264 Webgl1440p30fps Stream. */
const Webgl1440p30fps: VideoStreamData = [
  'big-buck-bunny-h264-1440p-30fps.mp4',
  454390604,
  634.57,
  {
    mimeType: 'video/mp4; codecs="avc1.640032"',
    fps: 30,
    resolution: '1440p',
  },
];

/** H.264 Webgl2160p30fps Stream. */
const Webgl2160p30fps: VideoStreamData = [
  'big-buck-bunny-h264-2160p-30fps.mp4',
  873983617,
  634.57,
  {
    mimeType: 'video/mp4; codecs="avc1.640033"',
    fps: 30,
    resolution: '2160p',
  },
];

/** H.264 TestMaterialsMediaSphericalVp91080s60fps137H2641920x1080Fps29 Stream. */
const TestMaterialsMediaSphericalVp91080s60fps137H2641920x1080Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_137_h264_1920x1080_fps=29.97_bitrate_kbps=2286k.mp4',
    4,
    11,
    {
      mimeType: 'video/mp4; codecs="avc1.42002a"',
      fps: 30,
      resolution: '1080p',
      spherical: true,
      bitrate: '2286k',
    },
  ];

/** H.264 TestMaterialsMediaSphericalVp91080s60fps299H2641920x1080Fps59 Stream. */
const TestMaterialsMediaSphericalVp91080s60fps299H2641920x1080Fps59: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_299_h264_1920x1080_fps=59.940059940059939_bitrate_kbps=3314k.mp4',
    4,
    11,
    {
      mimeType: 'video/mp4; codecs="avc1.42002a"',
      fps: 60,
      resolution: '1080p',
      spherical: true,
      bitrate: '3314k',
    },
  ];

/** H.264 TestMaterialsMediaSphericalVp92160s60fps137H2641920x1080Fps29 Stream. */
const TestMaterialsMediaSphericalVp92160s60fps137H2641920x1080Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_137_h264_1920x1080_fps=29.97_bitrate_kbps=2852k.mp4',
    4,
    11,
    {
      mimeType: 'video/mp4; codecs="avc1.42002a"',
      fps: 30,
      resolution: '1080p',
      spherical: true,
      bitrate: '2852k',
    },
  ];

/** H.264 TestMaterialsMediaSphericalVp92160s60fps299H2641920x1080Fps59 Stream. */
const TestMaterialsMediaSphericalVp92160s60fps299H2641920x1080Fps59: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_299_h264_1920x1080_fps=59.940059940059939_bitrate_kbps=3861k.mp4',
    4,
    11,
    {
      mimeType: 'video/mp4; codecs="avc1.42002a"',
      fps: 60,
      resolution: '1080p',
      spherical: true,
      bitrate: '3861k',
    },
  ];

/** H.264 Video10137H2641920x1080Fps30BitrateKbps19021k Stream. */
const Video10137H2641920x1080Fps30BitrateKbps19021k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video10_137_h264_1920x1080_fps=30_bitrate_kbps=19021k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 30,
    resolution: '1080p',
    bitrate: '19021k',
  },
];

/** H.264 Video10299H2641920x1080Fps60BitrateKbps19425k Stream. */
const Video10299H2641920x1080Fps60BitrateKbps19425k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video10_299_h264_1920x1080_fps=60_bitrate_kbps=19425k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 60,
    resolution: '1080p',
    bitrate: '19425k',
  },
];

/** H.264 Video1137H2641920x1080Fps30BitrateKbps20227k Stream. */
const Video1137H2641920x1080Fps30BitrateKbps20227k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video1_137_h264_1920x1080_fps=30_bitrate_kbps=20227k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 30,
    resolution: '1080p',
    bitrate: '20227k',
  },
];

/** H.264 Video1299H2641920x1080Fps60BitrateKbps20195k Stream. */
const Video1299H2641920x1080Fps60BitrateKbps20195k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video1_299_h264_1920x1080_fps=60_bitrate_kbps=20195k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 60,
    resolution: '1080p',
    bitrate: '20195k',
  },
];

/** H.264 Video2137H2641920x1080Fps30BitrateKbps21613k Stream. */
const Video2137H2641920x1080Fps30BitrateKbps21613k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video2_137_h264_1920x1080_fps=30_bitrate_kbps=21613k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 30,
    resolution: '1080p',
    bitrate: '21613k',
  },
];

/** H.264 Video2299H2641920x1080Fps60BitrateKbps21981k Stream. */
const Video2299H2641920x1080Fps60BitrateKbps21981k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video2_299_h264_1920x1080_fps=60_bitrate_kbps=21981k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 60,
    resolution: '1080p',
    bitrate: '21981k',
  },
];

/** H.264 Video3137H2641920x1080Fps30BitrateKbps19528k Stream. */
const Video3137H2641920x1080Fps30BitrateKbps19528k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video3_137_h264_1920x1080_fps=30_bitrate_kbps=19528k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 30,
    resolution: '1080p',
    bitrate: '19528k',
  },
];

/** H.264 Video3299H2641920x1080Fps60BitrateKbps21652k Stream. */
const Video3299H2641920x1080Fps60BitrateKbps21652k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video3_299_h264_1920x1080_fps=60_bitrate_kbps=21652k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 60,
    resolution: '1080p',
    bitrate: '21652k',
  },
];

/** H.264 Video4137H2641920x1080Fps30BitrateKbps22366k Stream. */
const Video4137H2641920x1080Fps30BitrateKbps22366k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video4_137_h264_1920x1080_fps=30_bitrate_kbps=22366k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 30,
    resolution: '1080p',
    bitrate: '22366k',
  },
];

/** H.264 Video4299H2641920x1080Fps60BitrateKbps23006k Stream. */
const Video4299H2641920x1080Fps60BitrateKbps23006k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video4_299_h264_1920x1080_fps=60_bitrate_kbps=23006k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 60,
    resolution: '1080p',
    bitrate: '23006k',
  },
];

/** H.264 Video5137H2641920x1080Fps30BitrateKbps17694k Stream. */
const Video5137H2641920x1080Fps30BitrateKbps17694k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video5_137_h264_1920x1080_fps=30_bitrate_kbps=17694k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 30,
    resolution: '1080p',
    bitrate: '17694k',
  },
];

/** H.264 Video5299H2641920x1080Fps60BitrateKbps21672k Stream. */
const Video5299H2641920x1080Fps60BitrateKbps21672k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video5_299_h264_1920x1080_fps=60_bitrate_kbps=21672k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 60,
    resolution: '1080p',
    bitrate: '21672k',
  },
];

/** H.264 Video6137H2641920x1080Fps30BitrateKbps16987k Stream. */
const Video6137H2641920x1080Fps30BitrateKbps16987k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video6_137_h264_1920x1080_fps=30_bitrate_kbps=16987k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 30,
    resolution: '1080p',
    bitrate: '16987k',
  },
];

/** H.264 Video6299H2641920x1080Fps60BitrateKbps20378k Stream. */
const Video6299H2641920x1080Fps60BitrateKbps20378k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video6_299_h264_1920x1080_fps=60_bitrate_kbps=20378k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 60,
    resolution: '1080p',
    bitrate: '20378k',
  },
];

/** H.264 Video7137H2641920x1080Fps30BitrateKbps19046k Stream. */
const Video7137H2641920x1080Fps30BitrateKbps19046k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video7_137_h264_1920x1080_fps=30_bitrate_kbps=19046k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 30,
    resolution: '1080p',
    bitrate: '19046k',
  },
];

/** H.264 Video7299H2641920x1080Fps60BitrateKbps19551k Stream. */
const Video7299H2641920x1080Fps60BitrateKbps19551k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video7_299_h264_1920x1080_fps=60_bitrate_kbps=19551k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 60,
    resolution: '1080p',
    bitrate: '19551k',
  },
];

/** H.264 Video8137H2641920x1080Fps30BitrateKbps20227k Stream. */
const Video8137H2641920x1080Fps30BitrateKbps20227k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video8_137_h264_1920x1080_fps=30_bitrate_kbps=20227k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 30,
    resolution: '1080p',
    bitrate: '20228k',
  },
];

/** H.264 Video8299H2641920x1080Fps60BitrateKbps20195k Stream. */
const Video8299H2641920x1080Fps60BitrateKbps20195k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video8_299_h264_1920x1080_fps=60_bitrate_kbps=20195k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 60,
    resolution: '1080p',
    bitrate: '20196k',
  },
];

/** H.264 Video9137H2641920x1080Fps30BitrateKbps22215k Stream. */
const Video9137H2641920x1080Fps30BitrateKbps22215k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video9_137_h264_1920x1080_fps=30_bitrate_kbps=22215k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 30,
    resolution: '1080p',
    bitrate: '22215k',
  },
];

/** H.264 Video9299H2641920x1080Fps60BitrateKbps22758k Stream. */
const Video9299H2641920x1080Fps60BitrateKbps22758k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video9_299_h264_1920x1080_fps=60_bitrate_kbps=22758k.mp4',
  4,
  11,
  {
    mimeType: 'video/mp4; codecs="avc1.42002a"',
    fps: 60,
    resolution: '1080p',
    bitrate: '22758k',
  },
];

/** H.264 Spherical144s30fps Stream. */
const Spherical144s30fps: VideoStreamData = [
  'spherical_h264_144s_30fps.mp4',
  902503,
  149.31,
  {
    mimeType: 'video/mp4; codecs="avc1.4d400c"',
    fps: 30,
    resolution: '144p',
    spherical: true,
  },
];

/** H.264 Spherical240s30fps Stream. */
const Spherical240s30fps: VideoStreamData = [
  'spherical_h264_240s_30fps.mp4',
  2095800,
  149.31,
  {
    mimeType: 'video/mp4; codecs="avc1.4d4015"',
    fps: 30,
    resolution: '240p',
    spherical: true,
  },
];

/** H.264 Spherical360s30fps Stream. */
const Spherical360s30fps: VideoStreamData = [
  'spherical_h264_360s_30fps.mp4',
  3344623,
  149.31,
  {
    mimeType: 'video/mp4; codecs="avc1.4d401e"',
    fps: 30,
    resolution: '360p',
    spherical: true,
  },
];

/** H.264 Spherical480s30fps Stream. */
const Spherical480s30fps: VideoStreamData = [
  'spherical_h264_480s_30fps.mp4',
  7238157,
  149.31,
  {
    mimeType: 'video/mp4; codecs="avc1.4d401f"',
    fps: 30,
    resolution: '480p',
    spherical: true,
  },
];

/** H.264 Spherical720s30fps Stream. */
const Spherical720s30fps: VideoStreamData = [
  'spherical_h264_720s_30fps.mp4',
  15323211,
  149.31,
  {
    mimeType: 'video/mp4; codecs="avc1.4d401f"',
    fps: 30,
    resolution: '720p',
    spherical: true,
  },
];

/** H.264 Spherical720s60fps Stream. */
const Spherical720s60fps: VideoStreamData = [
  'spherical_h264_720s_60fps.mp4',
  31284601,
  149.29,
  {
    mimeType: 'video/mp4; codecs="avc1.4d4020"',
    fps: 60,
    resolution: '720p',
    spherical: true,
  },
];

/** H.264 Spherical1080s30fps Stream. */
const Spherical1080s30fps: VideoStreamData = [
  'spherical_h264_1080s_30fps.mp4',
  46455958,
  149.31,
  {
    mimeType: 'video/mp4; codecs="avc1.640028"',
    fps: 30,
    resolution: '1080p',
    spherical: true,
  },
];

/** H.264 Spherical1080s60fps Stream. */
const Spherical1080s60fps: VideoStreamData = [
  'spherical_h264_1080s_60fps.mp4',
  59213840,
  149.29,
  {
    mimeType: 'video/mp4; codecs="avc1.64002a"',
    fps: 60,
    resolution: '1080p',
    spherical: true,
  },
];

/** H.264 Spherical1440s30fps Stream. */
const Spherical1440s30fps: VideoStreamData = [
  'spherical_h264_1440s_30fps.mp4',
  97687330,
  149.31,
  {
    mimeType: 'video/mp4; codecs="avc1.640032"',
    fps: 30,
    resolution: '1440p',
    spherical: true,
  },
];

/** H.264 Spherical1440s60fps Stream. */
const Spherical1440s60fps: VideoStreamData = [
  'spherical_h264_1440s_60fps.mp4',
  131898628,
  149.29,
  {
    mimeType: 'video/mp4; codecs="avc1.640033"',
    fps: 60,
    resolution: '1440p',
    spherical: true,
  },
];

/** H.264 Spherical2160s30fps Stream. */
const Spherical2160s30fps: VideoStreamData = [
  'spherical_h264_2160s_30fps.mp4',
  179943784,
  149.31,
  {
    mimeType: 'video/mp4; codecs="avc1.640033"',
    fps: 30,
    resolution: '2160p',
    spherical: true,
  },
];

/** H.264 Spherical2160s60fps Stream. */
const Spherical2160s60fps: VideoStreamData = [
  'spherical_h264_2160s_60fps.mp4',
  239610178,
  149.29,
  {
    mimeType: 'video/mp4; codecs="avc1.640033"',
    fps: 60,
    resolution: '2160p',
    spherical: true,
  },
];

/** Main collection of all H.264 streams. */
export const H264_STREAMS: VideoStreamsType = {
  streamtype: 'H264',
  mimetype: 'video/mp4; codecs="avc1.640028"',
  mediatype: 'video',
  container: 'mp4',
  streams: {
    VideoTiny,
    AspectRatio16x9,
    AspectRatio4x3,
    AspectRatio16x9Part1,
    AspectRatio16x9Part2,
    AspectRatio4x3Part1,
    AspectRatio4x3Part2,
    VideoNormal,
    VideoShorts,
    CarMedium,
    VideoHuge,
    Video1MB,
    Shorts133,
    Shorts134,
    Shorts135,
    Shorts136,
    Shorts137,
    Shorts160,
    Shorts298,
    Shorts299,
    Shorts597,
    VideoHeAac,
    VideoNormalClearKey,
    VideoStreamYTCenc,
    VideoTinyStreamYTCenc,
    VideoSmallStreamYTCenc,
    VideoSmallCenc,
    VideoClearMiddleCenc,
    VideoMultiKeyCenc,
    DrmL3NoHDCP144p30fpsCenc,
    DrmL3NoHDCP240p30fpsCenc,
    DrmL3NoHDCP360p30fpsCenc,
    DrmL3NoHDCP480p30fpsCenc,
    DrmL3NoHDCP480p30fpsMqCenc,
    DrmL3NoHDCP480p30fpsHqCenc,
    DrmL3NoHDCP720p30fpsCenc,
    DrmL3NoHDCP720p30fpsMqCenc,
    DrmL3NoHDCP720p30fpsHqCenc,
    DrmL3NoHDCP720p60fpsCenc,
    DrmL3NoHDCP720p60fpsMqCenc,
    DrmL3NoHDCP1080p30fpsCenc,
    DrmL3NoHDCP1080p30fpsMqCenc,
    DrmL3NoHDCP1080p30fpsHqCenc,
    DrmL3NoHDCP1080p60fpsCenc,
    DrmL3NoHDCP1080p60fpsMqCenc,
    VideoHighBitrate1080p21052k,
    Video101920x1080Fps30H264,
    Video101920x1080Fps60H264,
    Video11920x1080Fps30H264,
    Video11920x1080Fps60H264,
    Video21920x1080Fps30H264,
    Video21920x1080Fps60H264,
    Video31920x1080Fps30H264,
    Video31920x1080Fps60H264,
    Video41920x1080Fps30H264,
    Video41920x1080Fps60H264,
    Video51920x1080Fps30H264,
    Video51920x1080Fps60H264,
    Video61920x1080Fps30H264,
    Video61920x1080Fps60H264,
    Video71920x1080Fps30H264,
    Video71920x1080Fps60H264,
    Video81920x1080Fps30H264,
    Video81920x1080Fps60H264,
    Video91920x1080Fps30H264,
    Video91920x1080Fps60H264,
    ProgressiveLow,
    FrameGap,
    FrameOverlap,
    Webgl144p15fps,
    Webgl240p30fps,
    Webgl360p30fps,
    Webgl480p30fps,
    Webgl720p30fps,
    Webgl720p60fps,
    Webgl1080p30fps,
    Webgl1080p60fps,
    Webgl1080p240fps,
    Webgl1440p30fps,
    Webgl2160p30fps,
    TestMaterialsMediaSphericalVp91080s60fps137H2641920x1080Fps29,
    TestMaterialsMediaSphericalVp91080s60fps299H2641920x1080Fps59,
    TestMaterialsMediaSphericalVp92160s60fps137H2641920x1080Fps29,
    TestMaterialsMediaSphericalVp92160s60fps299H2641920x1080Fps59,
    Video10137H2641920x1080Fps30BitrateKbps19021k,
    Video10299H2641920x1080Fps60BitrateKbps19425k,
    Video1137H2641920x1080Fps30BitrateKbps20227k,
    Video1299H2641920x1080Fps60BitrateKbps20195k,
    Video2137H2641920x1080Fps30BitrateKbps21613k,
    Video2299H2641920x1080Fps60BitrateKbps21981k,
    Video3137H2641920x1080Fps30BitrateKbps19528k,
    Video3299H2641920x1080Fps60BitrateKbps21652k,
    Video4137H2641920x1080Fps30BitrateKbps22366k,
    Video4299H2641920x1080Fps60BitrateKbps23006k,
    Video5137H2641920x1080Fps30BitrateKbps17694k,
    Video5299H2641920x1080Fps60BitrateKbps21672k,
    Video6137H2641920x1080Fps30BitrateKbps16987k,
    Video6299H2641920x1080Fps60BitrateKbps20378k,
    Video7137H2641920x1080Fps30BitrateKbps19046k,
    Video7299H2641920x1080Fps60BitrateKbps19551k,
    Video8137H2641920x1080Fps30BitrateKbps20227k,
    Video8299H2641920x1080Fps60BitrateKbps20195k,
    Video9137H2641920x1080Fps30BitrateKbps22215k,
    Video9299H2641920x1080Fps60BitrateKbps22758k,
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
  } as VideoStreamCollection,
};

// tslint:enable:enforce-name-casing
