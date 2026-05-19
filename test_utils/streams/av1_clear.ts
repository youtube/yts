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

import type {VideoStreamData} from './interfaces';

// tslint:disable:enforce-name-casing

/** AV1 clear stream: Small video, 240p. */
const VideoSmall: VideoStreamData = [
  'iPLm0O-flS8-56.62-Vlog_2160_240p.mp4',
  338002,
  18.08,
  {
    fps: 30,
    resolution: '240p',
    codecMetadata: {level: '2.0'},
  },
];
/** AV1 clear stream: 1MB video, 144p, 30fps (Big Buck Bunny). */
const Video1MB: VideoStreamData = [
  'big-buck-bunny-av1-144p-30fps.mp4',
  1000000,
  108.33,
  {
    fps: 30,
    resolution: '144p',
    codecMetadata: {level: '2.0'},
  },
];
/** AV1 clear stream: Big Buck Bunny, 144p, 30fps. */
const Bunny144p30fps: VideoStreamData = [
  'big-buck-bunny-av1-144p-30fps.mp4',
  5829002,
  634.6,
  {
    fps: 30,
    resolution: '144p',
    codecMetadata: {level: '2.0'},
  },
];
/** AV1 clear stream: Big Buck Bunny, 240p, 30fps. */
const Bunny240p30fps: VideoStreamData = [
  'big-buck-bunny-av1-240p-30fps.mp4',
  11684317,
  634.6,
  {
    fps: 30,
    resolution: '240p',
    codecMetadata: {level: '2.0'},
    videoChangeRate: 25.37,
  },
];
/** AV1 clear stream: Big Buck Bunny, 360p, 30fps. */
const Bunny360p30fps: VideoStreamData = [
  'big-buck-bunny-av1-360p-30fps.mp4',
  20805110,
  634.6,
  {
    fps: 30,
    resolution: '360p',
    codecMetadata: {level: '2.1'},
  },
];
/** AV1 clear stream: Big Buck Bunny, 480p, 30fps. */
const Bunny480p30fps: VideoStreamData = [
  'big-buck-bunny-av1-480p-30fps.mp4',
  36194938,
  634.6,
  {
    fps: 30,
    resolution: '480p',
    codecMetadata: {level: '3.0'},
  },
];
/** AV1 clear stream: Big Buck Bunny, 720p, 30fps. */
const Bunny720p30fps: VideoStreamData = [
  'big-buck-bunny-av1-720p-30fps.mp4',
  70832592,
  634.6,
  {
    fps: 30,
    resolution: '720p',
    codecMetadata: {level: '3.1'},
  },
];
/** AV1 clear stream: Big Buck Bunny, 720p, 60fps. */
const Bunny720p60fps: VideoStreamData = [
  'big-buck-bunny-av1-720p-60fps.mp4',
  77454477,
  634.57,
  {
    fps: 60,
    resolution: '720p',
    codecMetadata: {level: '4.0'},
  },
];
/** AV1 clear stream: Big Buck Bunny, 1080p, 30fps. */
const Bunny1080p30fps: VideoStreamData = [
  'big-buck-bunny-av1-1080p-30fps.mp4',
  131929783,
  634.6,
  {
    fps: 30,
    resolution: '1080p',
    codecMetadata: {level: '4.0'},
  },
];
/** AV1 clear stream: Big Buck Bunny, 1080p, 60fps. */
const Bunny1080p60fps: VideoStreamData = [
  'big-buck-bunny-av1-1080p-60fps.mp4',
  132082214,
  634.57,
  {
    fps: 60,
    resolution: '1080p',
    codecMetadata: {level: '4.1'},
  },
];
/** AV1 clear stream: Big Buck Bunny, 1440p, 30fps. */
const Bunny1440p30fps: VideoStreamData = [
  'big-buck-bunny-av1-1440p-30fps.mp4',
  389127462,
  624.0,
  {
    fps: 30,
    resolution: '1440p',
    codecMetadata: {level: '5.0'},
  },
];
/** AV1 clear stream: Big Buck Bunny, 1440p, 60fps. */
const Bunny1440p60fps: VideoStreamData = [
  'big-buck-bunny-av1-1440p-60fps.mp4',
  406942546,
  334.4,
  {
    fps: 60,
    resolution: '1440p',
    codecMetadata: {level: '5.0'},
  },
];
/** AV1 clear stream: Sports, 2160p, 30fps. */
const Sports2160p30fps: VideoStreamData = [
  'sports_2160p30.mp4',
  30760646,
  19.99,
  {
    fps: 30,
    resolution: '2160p',
    codecMetadata: {level: '5.0'},
  },
];
/** AV1 clear stream: SDR, 4320p, 30fps. */
const Sdr4320p30fps: VideoStreamData = [
  'av1/video1_571_av1_7680x4320_30fps.mp4',
  387032046,
  65,
  {
    fps: 30,
    resolution: '4320p',
    codecMetadata: {level: '6.0'},
  },
];
/** AV1 clear stream: SDR, 144p (Big Buck Bunny Sunflower). */
const Sdr144p: VideoStreamData = [
  'av1/bbb_sunflower_144p.mp4',
  236093,
  30.0,
  {
    fps: 30,
    resolution: '144p',
    codecMetadata: {level: '2.0'},
  },
];
/** AV1 clear stream: SDR, 240p (Big Buck Bunny Sunflower). */
const Sdr240p: VideoStreamData = [
  'av1/bbb_sunflower_240p.mp4',
  420869,
  30.0,
  {
    fps: 30,
    resolution: '240p',
    codecMetadata: {level: '2.0'},
  },
];
/** AV1 clear stream: SDR, 360p (Big Buck Bunny Sunflower). */
const Sdr360p: VideoStreamData = [
  'av1/bbb_sunflower_360p.mp4',
  873797,
  30.0,
  {
    fps: 30,
    resolution: '360p',
    codecMetadata: {level: '2.1'},
  },
];
/** AV1 clear stream: SDR, 480p (Big Buck Bunny Sunflower). */
const Sdr480p: VideoStreamData = [
  'av1/bbb_sunflower_480p.mp4',
  1623181,
  30.0,
  {
    fps: 30,
    resolution: '480p',
    codecMetadata: {level: '3.0'},
  },
];
/** AV1 clear stream: SDR, 720p, 30fps (Big Buck Bunny Sunflower). */
const Sdr720p30: VideoStreamData = [
  'av1/bbb_sunflower_720p30.mp4',
  3346131,
  30.0,
  {
    fps: 30,
    resolution: '720p',
    codecMetadata: {level: '3.1'},
  },
];
/** AV1 clear stream: SDR, 720p, 60fps (Big Buck Bunny Sunflower). */
const Sdr720p60: VideoStreamData = [
  'av1/bbb_sunflower_720p60.mp4',
  3545933,
  30.0,
  {
    fps: 60,
    resolution: '720p',
    codecMetadata: {level: '4.0'},
  },
];
/** AV1 clear stream: SDR, 1080p, 30fps (Big Buck Bunny Sunflower). */
const Sdr1080p30: VideoStreamData = [
  'av1/bbb_sunflower_1080p30.mp4',
  6055665,
  30.0,
  {
    fps: 30,
    resolution: '1080p',
    codecMetadata: {level: '4.0'},
  },
];
/** AV1 clear stream: SDR, 1080p, 60fps (Big Buck Bunny Sunflower). */
const Sdr1080p60: VideoStreamData = [
  'av1/bbb_sunflower_1080p60.mp4',
  6077973,
  30.0,
  {
    fps: 60,
    resolution: '1080p',
    codecMetadata: {level: '4.1'},
  },
];
/** AV1 clear stream: SDR, 1440p, 30fps (Big Buck Bunny Sunflower). */
const Sdr1440p30: VideoStreamData = [
  'av1/bbb_sunflower_1440p30.mp4',
  19682925,
  30.0,
  {
    fps: 30,
    resolution: '1440p',
    codecMetadata: {level: '5.0'},
  },
];
/** AV1 clear stream: SDR, 1440p, 60fps (Big Buck Bunny Sunflower). */
const Sdr1440p60: VideoStreamData = [
  'av1/bbb_sunflower_1440p60.mp4',
  20199687,
  30.0,
  {
    fps: 60,
    resolution: '1440p',
    codecMetadata: {level: '5.0'},
  },
];
/** AV1 clear stream: SDR, 2160p, 30fps (Big Buck Bunny Sunflower). */
const Sdr2160p30: VideoStreamData = [
  'av1/bbb_sunflower_2160p30.mp4',
  40943207,
  30.0,
  {
    fps: 30,
    resolution: '2160p',
    codecMetadata: {level: '5.0'},
  },
];

/** AV1 clear stream: Concatenated SDR, 1080p, 30fps. */
const Concat: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video9_399_av1_1920x1080_fps=30_bitrate_kbps=14124k.mp4',
  2890805,
  11,
  {
    fps: 30,
    resolution: '1080p',
    codecMetadata: {level: '4.1'},
  },
];

/** AV1 clear stream: Test Materials, Spherical VP9, 1080s, 60fps to AV1 1080p, 29.97fps. */
const TestMaterialsMediaSphericalVp91080s60fps399Av11920x1080Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_399_av1_1920x1080_fps=29.97_bitrate_kbps=1808k.mp4',
    1241395,
    11,
    {
      codecMetadata: {level: '4.1'},
      fps: 30,
      resolution: '1080p',
      bitrate: '1808k',
    },
  ];
/** AV1 clear stream: Test Materials, Spherical VP9, 1080s, 60fps to AV1 2160p, 29.97fps. */
const TestMaterialsMediaSphericalVp91080s60fps401Av13840x2160Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_401_av1_3840x2160_fps=29.97_bitrate_kbps=2445k.mp4',
    5271874,
    11,
    {
      codecMetadata: {level: '4.1'},
      fps: 30,
      resolution: '2160p',
      bitrate: '2445k',
    },
  ];
/** AV1 clear stream: Test Materials, Spherical VP9, 1080s, 60fps to AV1 4320p, 29.97fps. */
const TestMaterialsMediaSphericalVp91080s60fps571Av17680x4320Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_1080s_60fps_571_av1_7680x4320_fps=29.97_bitrate_kbps=3834k.mp4',
    12322964,
    11,
    {
      codecMetadata: {level: '4.1'},
      fps: 30,
      resolution: '4320p',
      bitrate: '3834k',
    },
  ];
/** AV1 clear stream: Test Materials, Spherical VP9, 2160s, 60fps to AV1 1080p, 29.97fps. */
const TestMaterialsMediaSphericalVp92160s60fps399Av11920x1080Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_399_av1_1920x1080_fps=29.97_bitrate_kbps=2157k.mp4',
    1388135,
    11,
    {
      codecMetadata: {level: '4.1'},
      fps: 30,
      resolution: '1080p',
      bitrate: '2157k',
    },
  ];
/** AV1 clear stream: Test Materials, Spherical VP9, 2160s, 60fps to AV1 2160p, 29.97fps. */
const TestMaterialsMediaSphericalVp92160s60fps401Av13840x2160Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_401_av1_3840x2160_fps=29.97_bitrate_kbps=2467k.mp4',
    6852759,
    11,
    {
      codecMetadata: {level: '4.1'},
      fps: 30,
      resolution: '2160p',
      bitrate: '2467k',
    },
  ];
/** AV1 clear stream: Test Materials, Spherical VP9, 2160s, 60fps to AV1 4320p, 29.97fps. */
const TestMaterialsMediaSphericalVp92160s60fps571Av17680x4320Fps29: VideoStreamData =
  [
    'high-bitrate/concat/sdr-fps-30/test-materials_media_spherical_vp9_2160s_60fps_571_av1_7680x4320_fps=29.97_bitrate_kbps=4648k.mp4',
    15228251,
    11,
    {
      codecMetadata: {level: '4.1'},
      fps: 30,
      resolution: '4320p',
      bitrate: '4648k',
    },
  ];
/** AV1 clear stream: Video10, 1080p, 30fps, 14641kbps bitrate. */
const Video10399Av11920x1080Fps30BitrateKbps14641k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video10_399_av1_1920x1080_fps=30_bitrate_kbps=14641k.mp4',
  4841194,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '1080p',
    bitrate: '14641k',
  },
];
/** AV1 clear stream: Video10, 2160p, 30fps, 33929kbps bitrate. */
const Video10401Av13840x2160Fps30BitrateKbps33929k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video10_401_av1_3840x2160_fps=30_bitrate_kbps=33929k.mp4',
  22149330,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '2160p',
    bitrate: '33929k',
  },
];
/** AV1 clear stream: Video10, 4320p, 30fps, 55775kbps bitrate. */
const Video10571Av17680x4320Fps30BitrateKbps55775k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video10_571_av1_7680x4320_fps=30_bitrate_kbps=55775k.mp4',
  43096824,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '4320p',
    bitrate: '55775k',
  },
];
/** AV1 clear stream: Video1, 1080p, 30fps, 12365kbps bitrate. */
const Video1399Av11920x1080Fps30BitrateKbps12365k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video1_399_av1_1920x1080_fps=30_bitrate_kbps=12365k.mp4',
  3248677,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '1080p',
    bitrate: '12365k',
  },
];
/** AV1 clear stream: Video1, 2160p, 30fps, 29631kbps bitrate. */
const Video1401Av13840x2160Fps30BitrateKbps29631k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video1_401_av1_3840x2160_fps=30_bitrate_kbps=29631k.mp4',
  16101585,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '2160p',
    bitrate: '29631k',
  },
];
/** AV1 clear stream: Video1, 4320p, 30fps, 36573kbps bitrate. */
const Video1571Av17680x4320Fps30BitrateKbps36573k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video1_571_av1_7680x4320_fps=30_bitrate_kbps=36573k.mp4',
  33600690,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '4320p',
    bitrate: '36573k',
  },
];
/** AV1 clear stream: Video2, 1080p, 30fps, 14453kbps bitrate. */
const Video2399Av11920x1080Fps30BitrateKbps14453k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video2_399_av1_1920x1080_fps=30_bitrate_kbps=14453k.mp4',
  3867063,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '1080p',
    bitrate: '14453k',
  },
];
/** AV1 clear stream: Video2, 2160p, 30fps, 31443kbps bitrate. */
const Video2401Av13840x2160Fps30BitrateKbps31443k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video2_401_av1_3840x2160_fps=30_bitrate_kbps=31443k.mp4',
  18749430,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '2160p',
    bitrate: '31443k',
  },
];
/** AV1 clear stream: Video2, 4320p, 30fps, 43935kbps bitrate. */
const Video2571Av17680x4320Fps30BitrateKbps43935k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video2_571_av1_7680x4320_fps=30_bitrate_kbps=43935k.mp4',
  41242922,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '4320p',
    bitrate: '43935k',
  },
];
/** AV1 clear stream: Video3, 1080p, 30fps, 12337kbps bitrate. */
const Video3399Av11920x1080Fps30BitrateKbps12337k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video3_399_av1_1920x1080_fps=30_bitrate_kbps=12337k.mp4',
  4521425,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '1080p',
    bitrate: '12337k',
  },
];
/** AV1 clear stream: Video3, 2160p, 30fps, 28080kbps bitrate. */
const Video3401Av13840x2160Fps30BitrateKbps28080k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video3_401_av1_3840x2160_fps=30_bitrate_kbps=28080k.mp4',
  21517716,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '2160p',
    bitrate: '28080k',
  },
];
/** AV1 clear stream: Video3, 4320p, 30fps, 41688kbps bitrate. */
const Video3571Av17680x4320Fps30BitrateKbps41688k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video3_571_av1_7680x4320_fps=30_bitrate_kbps=41688k.mp4',
  43558843,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '4320p',
    bitrate: '41688k',
  },
];
/** AV1 clear stream: Video4, 1080p, 30fps, 12876kbps bitrate. */
const Video4399Av11920x1080Fps30BitrateKbps12876k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video4_399_av1_1920x1080_fps=30_bitrate_kbps=12876k.mp4',
  2517114,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '1080p',
    bitrate: '12876k',
  },
];
/** AV1 clear stream: Video4, 2160p, 30fps, 22089kbps bitrate. */
const Video4401Av13840x2160Fps30BitrateKbps22089k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video4_401_av1_3840x2160_fps=30_bitrate_kbps=22089k.mp4',
  11316437,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '2160p',
    bitrate: '22089k',
  },
];
/** AV1 clear stream: Video4, 4320p, 30fps, 33592kbps bitrate. */
const Video4571Av17680x4320Fps30BitrateKbps33592k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video4_571_av1_7680x4320_fps=30_bitrate_kbps=33592k.mp4',
  32904875,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '4320p',
    bitrate: '33592k',
  },
];
/** AV1 clear stream: Video5, 1080p, 30fps, 12942kbps bitrate. */
const Video5399Av11920x1080Fps30BitrateKbps12942k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video5_399_av1_1920x1080_fps=30_bitrate_kbps=12942k.mp4',
  1986916,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '1080p',
    bitrate: '12942k',
  },
];
/** AV1 clear stream: Video5, 2160p, 30fps, 26742kbps bitrate. */
const Video5401Av13840x2160Fps30BitrateKbps26742k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video5_401_av1_3840x2160_fps=30_bitrate_kbps=26742k.mp4',
  13996197,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '2160p',
    bitrate: '26742k',
  },
];
/** AV1 clear stream: Video5, 4320p, 30fps, 33847kbps bitrate. */
const Video5571Av17680x4320Fps30BitrateKbps33847k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video5_571_av1_7680x4320_fps=30_bitrate_kbps=33847k.mp4',
  49037352,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '4320p',
    bitrate: '33847k',
  },
];
/** AV1 clear stream: Video6, 1080p, 30fps, 12077kbps bitrate. */
const Video6399Av11920x1080Fps30BitrateKbps12077k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video6_399_av1_1920x1080_fps=30_bitrate_kbps=12077k.mp4',
  3404054,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '1080p',
    bitrate: '12077k',
  },
];
/** AV1 clear stream: Video6, 2160p, 30fps, 22615kbps bitrate. */
const Video6401Av13840x2160Fps30BitrateKbps22615k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video6_401_av1_3840x2160_fps=30_bitrate_kbps=22615k.mp4',
  17289098,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '2160p',
    bitrate: '22615k',
  },
];
/** AV1 clear stream: Video6, 4320p, 30fps, 36237kbps bitrate. */
const Video6571Av17680x4320Fps30BitrateKbps36237k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video6_571_av1_7680x4320_fps=30_bitrate_kbps=36237k.mp4',
  49267413,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '4320p',
    bitrate: '36237k',
  },
];
/** AV1 clear stream: Video7, 1080p, 30fps, 11478kbps bitrate. */
const Video7399Av11920x1080Fps30BitrateKbps11478k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video7_399_av1_1920x1080_fps=30_bitrate_kbps=11478k.mp4',
  4218952,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '1080p',
    bitrate: '11478k',
  },
];
/** AV1 clear stream: Video7, 2160p, 30fps, 24895kbps bitrate. */
const Video7401Av13840x2160Fps30BitrateKbps24895k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video7_401_av1_3840x2160_fps=30_bitrate_kbps=24895k.mp4',
  21543032,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '2160p',
    bitrate: '24895k',
  },
];
/** AV1 clear stream: Video7, 4320p, 30fps, 37875kbps bitrate. */
const Video7571Av17680x4320Fps30BitrateKbps37875k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video7_571_av1_7680x4320_fps=30_bitrate_kbps=37875k.mp4',
  42814700,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '4320p',
    bitrate: '37875k',
  },
];
/** AV1 clear stream: Video8, 1080p, 30fps, 12366kbps bitrate. */
const Video8399Av11920x1080Fps30BitrateKbps12365k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video8_399_av1_1920x1080_fps=30_bitrate_kbps=12365k.mp4',
  3238167,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '1080p',
    bitrate: '12366k',
  },
];
/** AV1 clear stream: Video8, 2160p, 30fps, 29632kbps bitrate. */
const Video8401Av13840x2160Fps30BitrateKbps29631k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video8_401_av1_3840x2160_fps=30_bitrate_kbps=29631k.mp4',
  16384547,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '2160p',
    bitrate: '29632k',
  },
];
/** AV1 clear stream: Video8, 4320p, 30fps, 36574kbps bitrate. */
const Video8571Av17680x4320Fps30BitrateKbps36573k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video8_571_av1_7680x4320_fps=30_bitrate_kbps=36573k.mp4',
  33600690,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '4320p',
    bitrate: '36574k',
  },
];
/** AV1 clear stream: Video9, 1080p, 30fps, 14124kbps bitrate. */
const Video9399Av11920x1080Fps30BitrateKbps14124k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video9_399_av1_1920x1080_fps=30_bitrate_kbps=14124k.mp4',
  2890805,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '1080p',
    bitrate: '14124k',
  },
];
/** AV1 clear stream: Video9, 2160p, 30fps, 32721kbps bitrate. */
const Video9401Av13840x2160Fps30BitrateKbps32721k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video9_401_av1_3840x2160_fps=30_bitrate_kbps=32721k.mp4',
  17571152,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '2160p',
    bitrate: '32721k',
  },
];
/** AV1 clear stream: Video9, 4320p, 30fps, 36168kbps bitrate. */
const Video9571Av17680x4320Fps30BitrateKbps36168k: VideoStreamData = [
  'high-bitrate/concat/sdr-fps-30/video9_571_av1_7680x4320_fps=30_bitrate_kbps=36168k.mp4',
  41741411,
  11,
  {
    codecMetadata: {level: '4.1'},
    fps: 30,
    resolution: '4320p',
    bitrate: '36168k',
  },
];

/** AV1 clear stream: SDR, 2160p, 60fps (Big Buck Bunny Sunflower). */
const Sdr2160p60: VideoStreamData = [
  'av1/bbb_sunflower_2160p60.mp4',
  41562198,
  30.0,
  {
    fps: 60,
    resolution: '2160p',
    codecMetadata: {level: '5.1'},
  },
];
/** AV1 clear stream: SDR, 4320p, 30fps (Sports). */
const Sdr4320p30: VideoStreamData = [
  'av1/Sample4-6141.04-Sports_2160_8k.mp4',
  72517369,
  20.19,
  {
    fps: 30,
    resolution: '4320p',
    codecMetadata: {level: '6.0'},
  },
];
/** AV1 clear stream: SDR, 1MB, 4320p, 30fps (Sports). */
const Sdr1mb4320p30: VideoStreamData = [
  'av1/Sample4-1mb-6141.04-Sports_2160_8k.mp4',
  1967277,
  6.01,
  {
    fps: 30,
    resolution: '4320p',
    codecMetadata: {level: '6.0'},
  },
];
/** AV1 clear stream: HDR HLG, 144p, 30fps. */
const HdrHlg144p: VideoStreamData = [
  'av1/hdr3_hlg_30fps_144p.mp4',
  313183,
  35.0,
  {
    fps: 30,
    resolution: '144p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '2.0'},
  },
];
/** AV1 clear stream: HDR HLG, 240p, 30fps. */
const HdrHlg240p: VideoStreamData = [
  'av1/hdr3_hlg_30fps_240p.mp4',
  652385,
  35.0,
  {
    fps: 30,
    resolution: '240p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '2.0'},
  },
];
/** AV1 clear stream: HDR HLG, 360p, 30fps. */
const HdrHlg360p: VideoStreamData = [
  'av1/hdr3_hlg_30fps_360p.mp4',
  1290043,
  35.0,
  {
    fps: 30,
    resolution: '360p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '2.1'},
  },
];
/** AV1 clear stream: HDR HLG, 480p, 30fps. */
const HdrHlg480p: VideoStreamData = [
  'av1/hdr3_hlg_30fps_480p.mp4',
  2177095,
  35.0,
  {
    fps: 30,
    resolution: '480p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '3.0'},
  },
];
/** AV1 clear stream: HDR HLG, 720p, 24fps. */
const HdrHlg720p24: VideoStreamData = [
  'av1/hdr2_hlg_24fps_720p.mp4',
  1312552,
  29.99,
  {
    fps: 24,
    resolution: '720p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '3.1'},
  },
];
/** AV1 clear stream: HDR HLG, 720p, 60fps. */
const HdrHlg720p60: VideoStreamData = [
  'av1/hdr3_hlg_60fps_720p.mp4',
  4911991,
  35.0,
  {
    fps: 60,
    resolution: '720p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '4.0'},
  },
];
/** AV1 clear stream: HDR HLG, 1080p, 24fps. */
const HdrHlg1080p24: VideoStreamData = [
  'av1/hdr2_hlg_24fps_1080p.mp4',
  2302811,
  29.99,
  {
    fps: 24,
    resolution: '1080p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '4.0'},
  },
];
/** AV1 clear stream: HDR HLG, 1080p, 60fps. */
const HdrHlg1080p60: VideoStreamData = [
  'av1/hdr3_hlg_60fps_1080p.mp4',
  8570043,
  35.0,
  {
    fps: 60,
    resolution: '1080p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '4.1'},
  },
];
/** AV1 clear stream: HDR HLG, 1440p (2k), 24fps. */
const HdrHlg1440p24: VideoStreamData = [
  'av1/hdr2_hlg_24fps_2k.mp4',
  7382834,
  29.99,
  {
    fps: 24,
    resolution: '1440p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '5.0'},
  },
];
/** AV1 clear stream: HDR HLG, 1440p (2k), 60fps. */
const HdrHlg1440p60: VideoStreamData = [
  'av1/hdr3_hlg_60fps_2k.mp4',
  25648476,
  35.0,
  {
    fps: 60,
    resolution: '1440p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '5.0'},
  },
];
/** AV1 clear stream: HDR HLG, 2160p (4k), 24fps. */
const HdrHlg2160p24: VideoStreamData = [
  'av1/hdr2_hlg_24fps_4k.mp4',
  15670569,
  29.99,
  {
    fps: 24,
    resolution: '2160p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '5.0'},
  },
];
/** AV1 clear stream: HDR HLG, 2160p (4k), 60fps. */
const HdrHlg2160p60: VideoStreamData = [
  'av1/hdr3_hlg_60fps_4k.mp4',
  51335401,
  35.0,
  {
    fps: 60,
    resolution: '2160p',
    transferFunction: 'HLG',
    codecMetadata: {...HLG_AV1_METADATA, level: '5.1'},
  },
];
/** AV1 clear stream: HDR PQ (HDR10), 144p, 29.97fps (Meridian). */
const HdrPq144p: VideoStreamData = [
  'av1/Meridian_2997fps_HDR10_144p.mp4',
  255658,
  30.0,
  {
    fps: 30,
    resolution: '144p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '2.0'},
  },
];
/** AV1 clear stream: HDR PQ (HDR10), 240p, 29.97fps (Meridian). */
const HdrPq240p: VideoStreamData = [
  'av1/Meridian_2997fps_HDR10_240p.mp4',
  501232,
  30.0,
  {
    fps: 30,
    resolution: '240p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '2.0'},
  },
];
/** AV1 clear stream: HDR PQ (HDR10), 360p, 29.97fps (Meridian). */
const HdrPq360p: VideoStreamData = [
  'av1/Meridian_2997fps_HDR10_360p.mp4',
  943353,
  30.0,
  {
    fps: 30,
    resolution: '360p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '2.1'},
  },
];
/** AV1 clear stream: HDR PQ (HDR10), 480p, 29.97fps (Meridian). */
const HdrPq480p: VideoStreamData = [
  'av1/Meridian_2997fps_HDR10_480p.mp4',
  1617903,
  30.0,
  {
    fps: 30,
    resolution: '480p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '3.0'},
  },
];
/** AV1 clear stream: HDR PQ, 720p, 24fps. */
const HdrPq720p24: VideoStreamData = [
  'av1/hdr1_pq_24fps_720p.mp4',
  3431261,
  29.99,
  {
    fps: 24,
    resolution: '720p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '3.1'},
  },
];
/** AV1 clear stream: HDR PQ (HDR10), 720p, 59.94fps (Meridian). */
const HdrPq720p60: VideoStreamData = [
  'av1/Meridian_5994fps_HDR10_720p.mp4',
  3924396,
  30.0,
  {
    fps: 60,
    resolution: '720p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '4.0'},
  },
];
/** AV1 clear stream: HDR PQ, 1080p, 24fps. */
const HdrPq1080p24: VideoStreamData = [
  'av1/hdr1_pq_24fps_1080p.mp4',
  6257103,
  29.99,
  {
    fps: 24,
    resolution: '1080p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '4.0'},
  },
];
/** AV1 clear stream: HDR PQ (HDR10), 1080p, 59.94fps (Meridian). */
const HdrPq1080p60: VideoStreamData = [
  'av1/Meridian_5994fps_HDR10_1080p.mp4',
  7098382,
  30.0,
  {
    fps: 60,
    resolution: '1080p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '4.1'},
  },
];
/** AV1 clear stream: HDR PQ, 1440p (2k), 24fps. */
const HdrPq1440p24: VideoStreamData = [
  'av1/hdr1_pq_24fps_2k.mp4',
  19168087,
  29.99,
  {
    fps: 24,
    resolution: '1440p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '5.0'},
  },
];
/** AV1 clear stream: HDR PQ (HDR10), 1440p (2k), 59.94fps (Meridian). */
const HdrPq1440p60: VideoStreamData = [
  'av1/Meridian_5994fps_HDR10_2k.mp4',
  24412883,
  30.0,
  {
    fps: 60,
    resolution: '1440p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '5.0'},
  },
];
/** AV1 clear stream: HDR PQ, 2160p (4k), 24fps. */
const HdrPq2160p24: VideoStreamData = [
  'av1/hdr1_pq_24fps_4k.mp4',
  39713839,
  29.99,
  {
    fps: 24,
    resolution: '2160p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '5.0'},
  },
];
/** AV1 clear stream: HDR PQ (HDR10), 2160p (4k), 59.94fps (Meridian). */
const HdrPq2160p60: VideoStreamData = [
  'av1/Meridian_5994fps_HDR10_4k.mp4',
  50552758,
  30.0,
  {
    fps: 60,
    resolution: '2160p',
    transferFunction: 'PQ',
    codecMetadata: {...PQ_AV1_METADATA, level: '5.1'},
  },
];
/** AV1 clear stream: Video11, 8K HDR PQ (Sky and Ocean), 1080p, 30fps, 12348kbps. */
const Video118KHDRPQSkyAndOcean699Av1Hdr1920x1080Fps30BitrateKbps12348k: VideoStreamData =
  [
    'high-bitrate/hdr-30fps/Video11_8K_HDR_PQ_Sky_and_Ocean_699_av1_hdr_1920x1080_fps=30_bitrate_kbps=12348k',
    46306278,
    30,
    {
      transferFunction: 'PQ',
      codecMetadata: {...PQ_AV1_METADATA, level: '4.1'},
      fps: 30,
      resolution: '1080p',
      bitrate: '12348k',
    },
  ];
/** AV1 clear stream: Video11, 8K HDR PQ (Sky and Ocean), 2160p, 30fps, 27291kbps. */
const Video118KHDRPQSkyAndOcean701Av1Hdr3840x2160Fps30BitrateKbps27291k: VideoStreamData =
  [
    'high-bitrate/hdr-30fps/Video11_8K_HDR_PQ_Sky_and_Ocean_701_av1_hdr_3840x2160_fps=30_bitrate_kbps=27291k',
    102344498,
    30,
    {
      transferFunction: 'PQ',
      codecMetadata: {...PQ_AV1_METADATA, level: '4.1'},
      fps: 30,
      resolution: '2160p',
      bitrate: '27291k',
    },
  ];
/** AV1 clear stream: Video11, 8K HDR PQ (Sky and Ocean), 4320p, 30fps, 44547kbps. */
const Video118KHDRPQSkyAndOcean702Av1Hdr7680x4320Fps30BitrateKbps44547k: VideoStreamData =
  [
    'high-bitrate/hdr-30fps/Video11_8K_HDR_PQ_Sky_and_Ocean_702_av1_hdr_7680x4320_fps=30_bitrate_kbps=44547k',
    167053893,
    30,
    {
      transferFunction: 'PQ',
      codecMetadata: {...PQ_AV1_METADATA, level: '4.1'},
      fps: 30,
      resolution: '4320p',
      bitrate: '44547k',
    },
  ];
/** AV1 clear stream: Video12, 8K HDR HLG (Color and Texture), 1080p, 30fps, 11879kbps. */
const Video128KHDRHLGColorAndTexture699Av1Hdr1920x1080Fps30BitrateKbps11879k: VideoStreamData =
  [
    'high-bitrate/hdr-30fps/Video12_8K_HDR_HLG_Color_and_Texture_699_av1_hdr_1920x1080_fps=30_bitrate_kbps=11879k',
    44546621,
    30,
    {
      transferFunction: 'PQ', // Note: Original JS had PQ here, filename says HLG. Using PQ as per original data.
      codecMetadata: {...PQ_AV1_METADATA, level: '4.1'},
      fps: 30,
      resolution: '1080p',
      bitrate: '11879k',
    },
  ];
/** AV1 clear stream: Video12, 8K HDR HLG (Color and Texture), 2160p, 30fps, 27159kbps. */
const Video128KHDRHLGColorAndTexture701Av1Hdr3840x2160Fps30BitrateKbps27159k: VideoStreamData =
  [
    'high-bitrate/hdr-30fps/Video12_8K_HDR_HLG_Color_and_Texture_701_av1_hdr_3840x2160_fps=30_bitrate_kbps=27159k',
    101846275,
    30,
    {
      transferFunction: 'PQ', // Note: Original JS had PQ here, filename says HLG. Using PQ as per original data.
      codecMetadata: {...PQ_AV1_METADATA, level: '4.1'},
      fps: 30,
      resolution: '2160p',
      bitrate: '27159k',
    },
  ];
/** AV1 clear stream: Video12, 8K HDR HLG (Color and Texture), 4320p, 30fps, 45209kbps. */
const Video128KHDRHLGColorAndTexture702Av1Hdr7680x4320Fps30BitrateKbps45209k: VideoStreamData =
  [
    'high-bitrate/hdr-30fps/Video12_8K_HDR_HLG_Color_and_Texture_702_av1_hdr_7680x4320_fps=30_bitrate_kbps=45209k',
    169535033,
    30,
    {
      transferFunction: 'PQ', // Note: Original JS had PQ here, filename says HLG. Using PQ as per original data.
      codecMetadata: {...PQ_AV1_METADATA, level: '4.1'},
      fps: 30,
      resolution: '4320p',
      bitrate: '45209k',
    },
  ];
/** AV1 clear stream: Video11, 8K HDR PQ (Sky and Ocean), 1080p, 60fps, 12171kbps. */
const Video118KHDRPQSkyAndOcean699Av1Hdr1920x1080Fps60BitrateKbps12171k: VideoStreamData =
  [
    'high-bitrate/hdr-60fps/Video11_8K_HDR_PQ_Sky_and_Ocean_699_av1_hdr_1920x1080_fps=60_bitrate_kbps=12171k',
    45641782,
    30,
    {
      transferFunction: 'PQ',
      codecMetadata: {...PQ_AV1_METADATA, level: '4.1'},
      fps: 60,
      resolution: '1080p',
      bitrate: '12171k',
    },
  ];
/** AV1 clear stream: Video11, 8K HDR PQ (Sky and Ocean), 2160p, 60fps, 314582kbps. */
const Video118KHDRPQSkyAndOcean701Av1Hdr3840x2160Fps60BitrateKbps314582k: VideoStreamData =
  [
    'high-bitrate/hdr-60fps/Video11_8K_HDR_PQ_Sky_and_Ocean_701_av1_hdr_3840x2160_fps=60_bitrate_kbps=314582k',
    1179686093,
    30,
    {
      transferFunction: 'PQ',
      codecMetadata: {...PQ_AV1_METADATA, level: '4.1'},
      fps: 60,
      resolution: '2160p',
      bitrate: '314582k',
    },
  ];
/** AV1 clear stream: Video12, 8K HDR HLG (Color and Texture), 1080p, 60fps, 11580kbps. */
const Video128KHDRHLGColorAndTexture699Av1Hdr1920x1080Fps60BitrateKbps11580k: VideoStreamData =
  [
    'high-bitrate/hdr-60fps/Video12_8K_HDR_HLG_Color_and_Texture_699_av1_hdr_1920x1080_fps=60_bitrate_kbps=11580k',
    43427029,
    30,
    {
      transferFunction: 'PQ', // Note: Original JS had PQ here, filename says HLG. Using PQ as per original data.
      codecMetadata: {...PQ_AV1_METADATA, level: '4.1'},
      fps: 60,
      resolution: '1080p',
      bitrate: '11580k',
    },
  ];
/** AV1 clear stream: Video12, 8K HDR HLG (Color and Texture), 2160p, 60fps, 293629kbps. */
const Video128KHDRHLGColorAndTexture701Av1Hdr3840x2160Fps60BitrateKbps293629k: VideoStreamData =
  [
    'high-bitrate/hdr-60fps/Video12_8K_HDR_HLG_Color_and_Texture_701_av1_hdr_3840x2160_fps=60_bitrate_kbps=293629k',
    1101112069,
    30,
    {
      transferFunction: 'PQ', // Note: Original JS had PQ here, filename says HLG. Using PQ as per original data.
      codecMetadata: {...PQ_AV1_METADATA, level: '4.1'},
      fps: 60,
      resolution: '2160p',
      bitrate: '293629k',
    },
  ];
/** AV1 clear stream: 8K, 60fps, 100Mbps, SDR (Tango Lying Down). */
const AV18K60FPS100MBPSSDR: VideoStreamData = [
  '2025/AV1/tango_lying_down_a_8K60_100M_SDR.mp4',
  326940957,
  35,
  {
    fps: 60,
    resolution: '4320p',
    codecMetadata: {level: '6.1'},
    bitrate: '79000k',
  },
];
/** AV1 clear stream: 8K, 60fps, 100Mbps, HDR HLG (Tango Lying Down). */
const AV18K60FPS100MBPSHDRHLG: VideoStreamData = [
  '2025/AV1/tango_lying_down_b_8K60_100M_HDR_HLG.mp4',
  368219413,
  35,
  {
    fps: 60,
    resolution: '4320p',
    transferFunction: 'HLG',
    HDRFormat: 'HLG',
    bitrate: '79000k',
    codecMetadata: {...HLG_AV1_METADATA, level: '6.1'},
  },
];
/** AV1 clear stream: 8K, 60fps, 100Mbps, HDR PQ (Tango Lying Down). */
const AV18K60FPS100MBPSHDRPQ: VideoStreamData = [
  '2025/AV1/tango_lying_down_c_8K60_100M_HDR_PQ.mp4',
  347360194,
  35,
  {
    fps: 60,
    resolution: '4320p',
    transferFunction: 'PQ',
    HDRFormat: 'PQ',
    bitrate: '79000k',
    codecMetadata: {...PQ_AV1_METADATA, level: '6.1'},
  },
];

/**
 * Collection of all clear AV1 streams.
 * Each property is an AV1 stream with its associated metadata.
 */
export const AV1_STREAMS_CLEAR = {
  VideoSmall,
  Video1MB,
  Bunny144p30fps,
  Bunny240p30fps,
  Bunny360p30fps,
  Bunny480p30fps,
  Bunny720p30fps,
  Bunny720p60fps,
  Bunny1080p30fps,
  Bunny1080p60fps,
  Bunny1440p30fps,
  Bunny1440p60fps,
  Sports2160p30fps,
  Sdr4320p30fps,
  Sdr144p,
  Sdr240p,
  Sdr360p,
  Sdr480p,
  Sdr720p30,
  Sdr720p60,
  Sdr1080p30,
  Sdr1080p60,
  Sdr1440p30,
  Sdr1440p60,
  Sdr2160p30,
  Concat,
  TestMaterialsMediaSphericalVp91080s60fps399Av11920x1080Fps29,
  TestMaterialsMediaSphericalVp91080s60fps401Av13840x2160Fps29,
  TestMaterialsMediaSphericalVp91080s60fps571Av17680x4320Fps29,
  TestMaterialsMediaSphericalVp92160s60fps399Av11920x1080Fps29,
  TestMaterialsMediaSphericalVp92160s60fps401Av13840x2160Fps29,
  TestMaterialsMediaSphericalVp92160s60fps571Av17680x4320Fps29,
  Video10399Av11920x1080Fps30BitrateKbps14641k,
  Video10401Av13840x2160Fps30BitrateKbps33929k,
  Video10571Av17680x4320Fps30BitrateKbps55775k,
  Video1399Av11920x1080Fps30BitrateKbps12365k,
  Video1401Av13840x2160Fps30BitrateKbps29631k,
  Video1571Av17680x4320Fps30BitrateKbps36573k,
  Video2399Av11920x1080Fps30BitrateKbps14453k,
  Video2401Av13840x2160Fps30BitrateKbps31443k,
  Video2571Av17680x4320Fps30BitrateKbps43935k,
  Video3399Av11920x1080Fps30BitrateKbps12337k,
  Video3401Av13840x2160Fps30BitrateKbps28080k,
  Video3571Av17680x4320Fps30BitrateKbps41688k,
  Video4399Av11920x1080Fps30BitrateKbps12876k,
  Video4401Av13840x2160Fps30BitrateKbps22089k,
  Video4571Av17680x4320Fps30BitrateKbps33592k,
  Video5399Av11920x1080Fps30BitrateKbps12942k,
  Video5401Av13840x2160Fps30BitrateKbps26742k,
  Video5571Av17680x4320Fps30BitrateKbps33847k,
  Video6399Av11920x1080Fps30BitrateKbps12077k,
  Video6401Av13840x2160Fps30BitrateKbps22615k,
  Video6571Av17680x4320Fps30BitrateKbps36237k,
  Video7399Av11920x1080Fps30BitrateKbps11478k,
  Video7401Av13840x2160Fps30BitrateKbps24895k,
  Video7571Av17680x4320Fps30BitrateKbps37875k,
  Video8399Av11920x1080Fps30BitrateKbps12365k,
  Video8401Av13840x2160Fps30BitrateKbps29631k,
  Video8571Av17680x4320Fps30BitrateKbps36573k,
  Video9399Av11920x1080Fps30BitrateKbps14124k,
  Video9401Av13840x2160Fps30BitrateKbps32721k,
  Video9571Av17680x4320Fps30BitrateKbps36168k,
  Sdr2160p60,
  Sdr4320p30,
  Sdr1mb4320p30,
  HdrHlg144p,
  HdrHlg240p,
  HdrHlg360p,
  HdrHlg480p,
  HdrHlg720p24,
  HdrHlg720p60,
  HdrHlg1080p24,
  HdrHlg1080p60,
  HdrHlg1440p24,
  HdrHlg1440p60,
  HdrHlg2160p24,
  HdrHlg2160p60,
  HdrPq144p,
  HdrPq240p,
  HdrPq360p,
  HdrPq480p,
  HdrPq720p24,
  HdrPq720p60,
  HdrPq1080p24,
  HdrPq1080p60,
  HdrPq1440p24,
  HdrPq1440p60,
  HdrPq2160p24,
  HdrPq2160p60,
  Video118KHDRPQSkyAndOcean699Av1Hdr1920x1080Fps30BitrateKbps12348k,
  Video118KHDRPQSkyAndOcean701Av1Hdr3840x2160Fps30BitrateKbps27291k,
  Video118KHDRPQSkyAndOcean702Av1Hdr7680x4320Fps30BitrateKbps44547k,
  Video128KHDRHLGColorAndTexture699Av1Hdr1920x1080Fps30BitrateKbps11879k,
  Video128KHDRHLGColorAndTexture701Av1Hdr3840x2160Fps30BitrateKbps27159k,
  Video128KHDRHLGColorAndTexture702Av1Hdr7680x4320Fps30BitrateKbps45209k,
  Video118KHDRPQSkyAndOcean699Av1Hdr1920x1080Fps60BitrateKbps12171k,
  Video118KHDRPQSkyAndOcean701Av1Hdr3840x2160Fps60BitrateKbps314582k,
  Video128KHDRHLGColorAndTexture699Av1Hdr1920x1080Fps60BitrateKbps11580k,
  Video128KHDRHLGColorAndTexture701Av1Hdr3840x2160Fps60BitrateKbps293629k,
  AV18K60FPS100MBPSSDR,
  AV18K60FPS100MBPSHDRHLG,
  AV18K60FPS100MBPSHDRPQ,
};

// tslint:enable:enforce-name-casing
