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
 * @fileoverview This file contains the video metadata for the playback analysis
 * device tests.
 */

import {StreamInfo} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';

/**
 * Video metadata for playback analysis.
 */
export interface VideoMetadata extends StreamInfo {
  name: string;
  mimetype: string;
  src: string;
  fileSize: number;
  width?: number;
  height?: number;
  fps: number;
  initialPaddingDelay: number;
  grayCodeStartValue: number;
  grayCodeCycle: number;
}

/**
 * Frame code configuration for playback analysis.
 */
export interface FrameCodeConfig {
  fps: number;
  initialPaddingDelay: number;
  grayCodeStartValue: number;
  grayCodeCycle: number;
}

/**
 * Playback analysis event.
 */
export declare interface PatEvent {
  event: string;
  wall_clock_timestamp: number; // Unix Epoch Time in ms
  media_time_sec: number;
  video_fps: number | null;
  expected_frame_code: number | null; // This will be the Gray code
  event_id?: string;
  additional_data?: Record<string, unknown>;
}

/**
 * The video metadata for the 2k VP9 30fps video.
 */
export const VIDEO_2K_VP9_30FPS: VideoMetadata = {
  'name': '2k VP9 30fps',
  'mimetype': 'video/mp4; codecs="vp09.00.40.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/output_2k_vp9.mp4',
  'fileSize': 1098318411,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};

/**
 * The video metadata for the 2k calibration video.
 */
export const VIDEO_2K_CALIBRATION: VideoMetadata = {
  'name': '2k Calibration',
  'mimetype': 'video/mp4; codecs="vp09.00.40.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/output_2k_calibration.mp4',
  'fileSize': 215927239,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};

/**
 * The video metadata for the 4k VP9 120fps video.
 */
export const VIDEO_4K_VP9_120FPS: VideoMetadata = {
  'name': '4k VP9 120fps',
  'mimetype': 'video/mp4; codecs="vp09.00.60.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/02-13/4k_120fps_vp9_in.mp4',
  'fileSize': 141033500,
  'fps': 120,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};

/**
 * The video metadata for the 2k VP9 60fps video.
 */
export const VIDEO_2K_VP9_60FPS: VideoMetadata = {
  'name': '2k VP9 60fps',
  'mimetype': 'video/mp4; codecs="vp09.00.51.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/output_mse_compatible.mp4',
  'fileSize': 1373196567,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};

/**
 * The video metadata for the 2k VP9 6001fps video.
 * This can potentially force frame drops.
 */
export const VIDEO_2K_VP9_6001FPS: VideoMetadata = {
  'name': '2k VP9 6001fps',
  'mimetype': 'video/mp4; codecs="vp09.00.51.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/output_2k_vp9_60fps.mp4',
  'fileSize': 2301645540,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};

/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_1080p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_1080P: VideoMetadata =
  {
    'name': 'tv_30fps_cfr_ch2_60sec_1080p',
    'mimetype':
      'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"; width=1920; height=1080; framerate=30',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_30fps_600s_cfr_ch1_1080p_vp9.mp4',
    'fileSize': 79835483,
    'width': 1920,
    'height': 1080,
    'fps': 30,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_1440p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_1440P: VideoMetadata =
  {
    'name': 'tv_30fps_cfr_ch2_60sec_1440p',
    'mimetype':
      'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"; width=2560; height=1440; framerate=30',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_30fps_600s_cfr_ch1_1440p_vp9.mp4',
    'fileSize': 116377775,
    'width': 2560,
    'height': 1440,
    'fps': 30,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_144p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_144P: VideoMetadata =
  {
    'name': 'tv_30fps_cfr_ch2_60sec_144p',
    'mimetype':
      'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"; width=256; height=144; framerate=30',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_30fps_600s_test_video_cfr_ch1_144p_vp9.mp4',
    'fileSize': 4881693,
    'width': 256,
    'height': 144,
    'fps': 30,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_2160p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_2160P: VideoMetadata =
  {
    'name': 'tv_30fps_cfr_ch2_60sec_2160p',
    'mimetype':
      'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"; width=3840; height=2160; framerate=30',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_30fps_600s_cfr_ch1_2160p_vp9.mp4',
    'fileSize': 186319123,
    'width': 3840,
    'height': 2160,
    'fps': 30,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_240p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_240P: VideoMetadata =
  {
    'name': 'tv_30fps_cfr_ch2_60sec_240p',
    'mimetype':
      'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"; width=426; height=240; framerate=30',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_30fps_600s_test_video_cfr_ch1_240p_vp9.mp4',
    'fileSize': 9845703,
    'width': 426,
    'height': 240,
    'fps': 30,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_360p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_360P: VideoMetadata =
  {
    'name': 'tv_30fps_cfr_ch2_60sec_360p',
    'mimetype':
      'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"; width=640; height=360; framerate=30',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_30fps_600s_test_video_cfr_ch1_360p_vp9.mp4',
    'fileSize': 17462450,
    'width': 640,
    'height': 360,
    'fps': 30,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_480p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_480P: VideoMetadata =
  {
    'name': 'tv_30fps_cfr_ch2_60sec_480p',
    'mimetype':
      'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"; width=640; height=480; framerate=30',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_30fps_600s_test_video_cfr_ch1_480p_vp9.mp4',
    'fileSize': 26770875,
    'width': 640,
    'height': 480,
    'fps': 30,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_720p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_720P: VideoMetadata =
  {
    'name': 'tv_30fps_cfr_ch2_60sec_720p',
    'mimetype':
      'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"; width=1280; height=720; framerate=30',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_30fps_600s_cfr_ch1_720p_vp9.mp4',
    'fileSize': 48040285,
    'width': 1280,
    'height': 720,
    'fps': 30,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_1080p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_1080P: VideoMetadata =
  {
    'name': 'tv_60fps_cfr_ch2_60sec_1080p',
    'mimetype':
      'video/mp4; codecs="vp09.00.40.08.01.01.01.01.00, mp4a.40.2"; width=1920; height=1080; framerate=60',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_60fps_600s_cfr_ch1_1080p_vp9.mp4',
    'fileSize': 98895819,
    'width': 1920,
    'height': 1080,
    'fps': 60,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_1440p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_1440P: VideoMetadata =
  {
    'name': 'tv_60fps_cfr_ch2_60sec_1440p',
    'mimetype':
      'video/mp4; codecs="vp09.00.41.08.01.01.01.01.00, mp4a.40.2"; width=2560; height=1440; framerate=60',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_60fps_600s_cfr_ch1_1440p_vp9.mp4',
    'fileSize': 146050425,
    'width': 2560,
    'height': 1440,
    'fps': 60,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_144p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_144P: VideoMetadata =
  {
    'name': 'tv_60fps_cfr_ch2_60sec_144p',
    'mimetype':
      'video/mp4; codecs="vp09.00.11.08.01.01.01.01.00, mp4a.40.2"; width=256; height=144; framerate=60',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_60fps_600s_test_video_cfr_ch1_144p_vp9.mp4',
    'fileSize': 6089616,
    'width': 256,
    'height': 144,
    'fps': 60,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_2160p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_2160P: VideoMetadata =
  {
    'name': 'tv_60fps_cfr_ch2_60sec_2160p',
    'mimetype':
      'video/mp4; codecs="vp09.00.50.08.01.01.01.01.00, mp4a.40.2"; width=3840; height=2160; framerate=60',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_60fps_600s_cfr_ch1_2160p_vp9.mp4',
    'fileSize': 229315444,
    'width': 3840,
    'height': 2160,
    'fps': 60,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_240p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_240P: VideoMetadata =
  {
    'name': 'tv_60fps_cfr_ch2_60sec_240p',
    'mimetype':
      'video/mp4; codecs="vp09.00.21.08.01.01.01.01.00, mp4a.40.2"; width=426; height=240; framerate=60',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_60fps_600s_test_video_cfr_ch1_240p_vp9.mp4',
    'fileSize': 12401842,
    'width': 426,
    'height': 240,
    'fps': 60,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_360p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_360P: VideoMetadata =
  {
    'name': 'tv_60fps_cfr_ch2_60sec_360p',
    'mimetype':
      'video/mp4; codecs="vp09.00.30.08.01.01.01.01.00, mp4a.40.2"; width=640; height=360; framerate=60',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_60fps_600s_test_video_cfr_ch1_360p_vp9.mp4',
    'fileSize': 21888339,
    'width': 640,
    'height': 360,
    'fps': 60,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_480p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_480P: VideoMetadata =
  {
    'name': 'tv_60fps_cfr_ch2_60sec_480p',
    'mimetype':
      'video/mp4; codecs="vp09.00.30.08.01.01.01.01.00, mp4a.40.2"; width=640; height=480; framerate=60',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_60fps_600s_test_video_cfr_ch1_480p_vp9.mp4',
    'fileSize': 33486375,
    'width': 640,
    'height': 480,
    'fps': 60,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_720p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_720P: VideoMetadata =
  {
    'name': 'tv_60fps_cfr_ch2_60sec_720p',
    'mimetype':
      'video/mp4; codecs="vp09.00.40.08.01.01.01.01.00, mp4a.40.2"; width=1280; height=720; framerate=60',
    'src':
      'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_60fps_600s_cfr_ch1_720p_vp9.mp4',
    'fileSize': 59707623,
    'width': 1280,
    'height': 720,
    'fps': 60,
    'initialPaddingDelay': 0,
    'grayCodeStartValue': 1,
    'grayCodeCycle': 256,
  };

/**
 * Video metadata for tv_10fps_600s_test_video_cfr_ch1_1080p.
 */
export const VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_1080P: VideoMetadata = {
  'name': 'tv_10fps_600s_test_video_cfr_ch1_1080p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_10fps_600s_cfr_ch1_1080p_vp9.mp4',
  'fileSize': 36814732,
  'fps': 10,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_10fps_600s_test_video_cfr_ch1_1440p.
 */
export const VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_1440P: VideoMetadata = {
  'name': 'tv_10fps_600s_test_video_cfr_ch1_1440p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_10fps_600s_cfr_ch1_1440p_vp9.mp4',
  'fileSize': 52159158,
  'fps': 10,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_10fps_600s_test_video_cfr_ch1_144p.
 */
export const VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_144P: VideoMetadata = {
  'name': 'tv_10fps_600s_test_video_cfr_ch1_144p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_10fps_600s_cfr_ch1_144p_vp9.mp4',
  'fileSize': 2735541,
  'fps': 10,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_10fps_600s_test_video_cfr_ch1_2160p.
 */
export const VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_2160P: VideoMetadata = {
  'name': 'tv_10fps_600s_test_video_cfr_ch1_2160p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_10fps_600s_cfr_ch1_2160p_vp9.mp4',
  'fileSize': 86356683,
  'fps': 10,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_10fps_600s_test_video_cfr_ch1_240p.
 */
export const VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_240P: VideoMetadata = {
  'name': 'tv_10fps_600s_test_video_cfr_ch1_240p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_10fps_600s_cfr_ch1_240p_vp9.mp4',
  'fileSize': 4902652,
  'fps': 10,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_10fps_600s_test_video_cfr_ch1_360p.
 */
export const VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_360P: VideoMetadata = {
  'name': 'tv_10fps_600s_test_video_cfr_ch1_360p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_10fps_600s_cfr_ch1_360p_vp9.mp4',
  'fileSize': 8320114,
  'fps': 10,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_10fps_600s_test_video_cfr_ch1_480p.
 */
export const VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_480P: VideoMetadata = {
  'name': 'tv_10fps_600s_test_video_cfr_ch1_480p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_10fps_600s_cfr_ch1_480p_vp9.mp4',
  'fileSize': 12517343,
  'fps': 10,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_10fps_600s_test_video_cfr_ch1_720p.
 */
export const VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_720P: VideoMetadata = {
  'name': 'tv_10fps_600s_test_video_cfr_ch1_720p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_10fps_600s_cfr_ch1_720p_vp9.mp4',
  'fileSize': 22043009,
  'fps': 10,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_24fps_600s_test_video_cfr_ch1_1080p.
 */
export const VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_1080P: VideoMetadata = {
  'name': 'tv_24fps_600s_test_video_cfr_ch1_1080p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_24fps_600s_cfr_ch1_1080p_vp9.mp4',
  'fileSize': 67718171,
  'fps': 24,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_24fps_600s_test_video_cfr_ch1_1440p.
 */
export const VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_1440P: VideoMetadata = {
  'name': 'tv_24fps_600s_test_video_cfr_ch1_1440p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_24fps_600s_cfr_ch1_1440p_vp9.mp4',
  'fileSize': 98123228,
  'fps': 24,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_24fps_600s_test_video_cfr_ch1_144p.
 */
export const VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_144P: VideoMetadata = {
  'name': 'tv_24fps_600s_test_video_cfr_ch1_144p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_24fps_600s_cfr_ch1_144p_vp9.mp4',
  'fileSize': 4309761,
  'fps': 24,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_24fps_600s_test_video_cfr_ch1_2160p.
 */
export const VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_2160P: VideoMetadata = {
  'name': 'tv_24fps_600s_test_video_cfr_ch1_2160p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_24fps_600s_cfr_ch1_2160p_vp9.mp4',
  'fileSize': 158770213,
  'fps': 24,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_24fps_600s_test_video_cfr_ch1_240p.
 */
export const VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_240P: VideoMetadata = {
  'name': 'tv_24fps_600s_test_video_cfr_ch1_240p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_24fps_600s_cfr_ch1_240p_vp9.mp4',
  'fileSize': 8404267,
  'fps': 24,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_24fps_600s_test_video_cfr_ch1_360p.
 */
export const VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_360P: VideoMetadata = {
  'name': 'tv_24fps_600s_test_video_cfr_ch1_360p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_24fps_600s_cfr_ch1_360p_vp9.mp4',
  'fileSize': 14777029,
  'fps': 24,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_24fps_600s_test_video_cfr_ch1_480p.
 */
export const VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_480P: VideoMetadata = {
  'name': 'tv_24fps_600s_test_video_cfr_ch1_480p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_24fps_600s_cfr_ch1_480p_vp9.mp4',
  'fileSize': 22585140,
  'fps': 24,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_24fps_600s_test_video_cfr_ch1_720p.
 */
export const VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_720P: VideoMetadata = {
  'name': 'tv_24fps_600s_test_video_cfr_ch1_720p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_24fps_600s_cfr_ch1_720p_vp9.mp4',
  'fileSize': 40466183,
  'fps': 24,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_1080p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_1080P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_1080p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_30fps_600s_cfr_ch1_1080p_vp9.mp4',
  'fileSize': 79835483,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_1440p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_1440P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_1440p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_30fps_600s_cfr_ch1_1440p_vp9.mp4',
  'fileSize': 116377775,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_144p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_144P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_144p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/02-18/tv_30fps_600s_test_video_cfr_ch1_144p_vp9.mp4',
  'fileSize': 4881693,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_2160p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_2160P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_2160p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_30fps_600s_cfr_ch1_2160p_vp9.mp4',
  'fileSize': 186319123,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_240p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_240P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_240p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/02-18/tv_30fps_600s_test_video_cfr_ch1_240p_vp9.mp4',
  'fileSize': 9845703,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_360p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_360P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_360p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/02-18/tv_30fps_600s_test_video_cfr_ch1_360p_vp9.mp4',
  'fileSize': 17462450,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_480p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_480P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_480p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/02-18/tv_30fps_600s_test_video_cfr_ch1_480p_vp9.mp4',
  'fileSize': 26770875,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_720p.
 */
export const VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_720P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_720p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_30fps_600s_cfr_ch1_720p_vp9.mp4',
  'fileSize': 48040285,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_48fps_600s_test_video_cfr_ch1_1080p.
 */
export const VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_1080P: VideoMetadata = {
  'name': 'tv_48fps_600s_test_video_cfr_ch1_1080p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_48fps_600s_cfr_ch1_1080p_vp9.mp4',
  'fileSize': 91246910,
  'fps': 48,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_48fps_600s_test_video_cfr_ch1_1440p.
 */
export const VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_1440P: VideoMetadata = {
  'name': 'tv_48fps_600s_test_video_cfr_ch1_1440p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_48fps_600s_cfr_ch1_1440p_vp9.mp4',
  'fileSize': 133934713,
  'fps': 48,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_48fps_600s_test_video_cfr_ch1_144p.
 */
export const VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_144P: VideoMetadata = {
  'name': 'tv_48fps_600s_test_video_cfr_ch1_144p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_48fps_600s_cfr_ch1_144p_vp9.mp4',
  'fileSize': 5663486,
  'fps': 48,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_48fps_600s_test_video_cfr_ch1_2160p.
 */
export const VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_2160P: VideoMetadata = {
  'name': 'tv_48fps_600s_test_video_cfr_ch1_2160p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_48fps_600s_cfr_ch1_2160p_vp9.mp4',
  'fileSize': 211926368,
  'fps': 48,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_48fps_600s_test_video_cfr_ch1_240p.
 */
export const VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_240P: VideoMetadata = {
  'name': 'tv_48fps_600s_test_video_cfr_ch1_240p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_48fps_600s_cfr_ch1_240p_vp9.mp4',
  'fileSize': 11338117,
  'fps': 48,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_48fps_600s_test_video_cfr_ch1_360p.
 */
export const VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_360P: VideoMetadata = {
  'name': 'tv_48fps_600s_test_video_cfr_ch1_360p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_48fps_600s_cfr_ch1_360p_vp9.mp4',
  'fileSize': 20065086,
  'fps': 48,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_48fps_600s_test_video_cfr_ch1_480p.
 */
export const VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_480P: VideoMetadata = {
  'name': 'tv_48fps_600s_test_video_cfr_ch1_480p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_48fps_600s_cfr_ch1_480p_vp9.mp4',
  'fileSize': 30687854,
  'fps': 48,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_48fps_600s_test_video_cfr_ch1_720p.
 */
export const VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_720P: VideoMetadata = {
  'name': 'tv_48fps_600s_test_video_cfr_ch1_720p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_48fps_600s_cfr_ch1_720p_vp9.mp4',
  'fileSize': 55151071,
  'fps': 48,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_50fps_600s_test_video_cfr_ch1_1080p.
 */
export const VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_1080P: VideoMetadata = {
  'name': 'tv_50fps_600s_test_video_cfr_ch1_1080p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_50fps_600s_cfr_ch1_1080p_vp9.mp4',
  'fileSize': 92311380,
  'fps': 50,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_50fps_600s_test_video_cfr_ch1_1440p.
 */
export const VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_1440P: VideoMetadata = {
  'name': 'tv_50fps_600s_test_video_cfr_ch1_1440p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_50fps_600s_cfr_ch1_1440p_vp9.mp4',
  'fileSize': 135657464,
  'fps': 50,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_50fps_600s_test_video_cfr_ch1_144p.
 */
export const VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_144P: VideoMetadata = {
  'name': 'tv_50fps_600s_test_video_cfr_ch1_144p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_50fps_600s_cfr_ch1_144p_vp9.mp4',
  'fileSize': 5733869,
  'fps': 50,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_50fps_600s_test_video_cfr_ch1_2160p.
 */
export const VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_2160P: VideoMetadata = {
  'name': 'tv_50fps_600s_test_video_cfr_ch1_2160p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_50fps_600s_cfr_ch1_2160p_vp9.mp4',
  'fileSize': 215028435,
  'fps': 50,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_50fps_600s_test_video_cfr_ch1_240p.
 */
export const VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_240P: VideoMetadata = {
  'name': 'tv_50fps_600s_test_video_cfr_ch1_240p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_50fps_600s_cfr_ch1_240p_vp9.mp4',
  'fileSize': 11460727,
  'fps': 50,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_50fps_600s_test_video_cfr_ch1_360p.
 */
export const VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_360P: VideoMetadata = {
  'name': 'tv_50fps_600s_test_video_cfr_ch1_360p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_50fps_600s_cfr_ch1_360p_vp9.mp4',
  'fileSize': 20269547,
  'fps': 50,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_50fps_600s_test_video_cfr_ch1_480p.
 */
export const VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_480P: VideoMetadata = {
  'name': 'tv_50fps_600s_test_video_cfr_ch1_480p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-18/tv_50fps_600s_cfr_ch1_480p_vp9.mp4',
  'fileSize': 30991702,
  'fps': 50,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_50fps_600s_test_video_cfr_ch1_720p.
 */
export const VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_720P: VideoMetadata = {
  'name': 'tv_50fps_600s_test_video_cfr_ch1_720p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_50fps_600s_cfr_ch1_720p_vp9.mp4',
  'fileSize': 55719162,
  'fps': 50,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_1080p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_1080P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_1080p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_60fps_600s_cfr_ch1_1080p_vp9.mp4',
  'fileSize': 98895819,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_1440p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_1440P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_1440p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_60fps_600s_cfr_ch1_1440p_vp9.mp4',
  'fileSize': 146050425,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_144p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_144P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_144p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/02-18/tv_60fps_600s_test_video_cfr_ch1_144p_vp9.mp4',
  'fileSize': 6089616,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_2160p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_2160P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_2160p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_60fps_600s_cfr_ch1_2160p_vp9.mp4',
  'fileSize': 229315444,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_240p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_240P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_240p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/02-18/tv_60fps_600s_test_video_cfr_ch1_240p_vp9.mp4',
  'fileSize': 12401842,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_360p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_360P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_360p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/02-18/tv_60fps_600s_test_video_cfr_ch1_360p_vp9.mp4',
  'fileSize': 21888339,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_480p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_480P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_480p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/02-18/tv_60fps_600s_test_video_cfr_ch1_480p_vp9.mp4',
  'fileSize': 33486375,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_720p.
 */
export const VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_720P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_720p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-31/tv_60fps_600s_cfr_ch1_720p_vp9.mp4',
  'fileSize': 59707623,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};

// Generated on Thu Mar  5 16:37:55 PST 2026

/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_1080p.
 */
export const VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_1080P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_1080p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_30fps_600s_test_video_cfr_ch1_1080p_vp9.mp4',
  'fileSize': 79884516,
  'width': 1920,
  'height': 1080,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_1440p.
 */
export const VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_1440P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_1440p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_30fps_600s_test_video_cfr_ch1_1440p_vp9.mp4',
  'fileSize': 117088101,
  'width': 2560,
  'height': 1440,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_144p.
 */
export const VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_144P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_144p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_30fps_600s_test_video_cfr_ch1_144p_vp9.mp4',
  'fileSize': 4881693,
  'width': 256,
  'height': 144,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_2160p.
 */
export const VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_2160P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_2160p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_30fps_600s_test_video_cfr_ch1_2160p_vp9.mp4',
  'fileSize': 186709669,
  'width': 3840,
  'height': 2160,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_240p.
 */
export const VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_240P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_240p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_30fps_600s_test_video_cfr_ch1_240p_vp9.mp4',
  'fileSize': 9845703,
  'width': 426,
  'height': 240,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_360p.
 */
export const VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_360P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_360p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_30fps_600s_test_video_cfr_ch1_360p_vp9.mp4',
  'fileSize': 17462450,
  'width': 640,
  'height': 360,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_480p.
 */
export const VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_480P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_480p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_30fps_600s_test_video_cfr_ch1_480p_vp9.mp4',
  'fileSize': 26770875,
  'width': 640,
  'height': 480,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_30fps_600s_test_video_cfr_ch1_720p.
 */
export const VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_720P: VideoMetadata = {
  'name': 'tv_30fps_600s_test_video_cfr_ch1_720p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_30fps_600s_test_video_cfr_ch1_720p_vp9.mp4',
  'fileSize': 47901654,
  'width': 1280,
  'height': 720,
  'fps': 30,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_1080p.
 */
export const VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_1080P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_1080p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_60fps_600s_test_video_cfr_ch1_1080p_vp9.mp4',
  'fileSize': 100028670,
  'width': 1920,
  'height': 1080,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_1440p.
 */
export const VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_1440P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_1440p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_60fps_600s_test_video_cfr_ch1_1440p_vp9.mp4',
  'fileSize': 149729707,
  'width': 2560,
  'height': 1440,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_144p.
 */
export const VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_144P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_144p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_60fps_600s_test_video_cfr_ch1_144p_vp9.mp4',
  'fileSize': 6089616,
  'width': 256,
  'height': 144,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_2160p.
 */
export const VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_2160P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_2160p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_60fps_600s_test_video_cfr_ch1_2160p_vp9.mp4',
  'fileSize': 228728796,
  'width': 3840,
  'height': 2160,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_240p.
 */
export const VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_240P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_240p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_60fps_600s_test_video_cfr_ch1_240p_vp9.mp4',
  'fileSize': 12401842,
  'width': 426,
  'height': 240,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_360p.
 */
export const VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_360P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_360p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_60fps_600s_test_video_cfr_ch1_360p_vp9.mp4',
  'fileSize': 21888339,
  'width': 640,
  'height': 360,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_480p.
 */
export const VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_480P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_480p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_60fps_600s_test_video_cfr_ch1_480p_vp9.mp4',
  'fileSize': 33486375,
  'width': 640,
  'height': 480,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};
/**
 * Video metadata for tv_60fps_600s_test_video_cfr_ch1_720p.
 */
export const VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_720P: VideoMetadata = {
  'name': 'tv_60fps_600s_test_video_cfr_ch1_720p',
  'mimetype': 'video/mp4; codecs="vp09.00.10.08.01.01.01.01.00, mp4a.40.2"',
  'src':
    'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/2025/Spectrascope/03-05/tv_60fps_600s_test_video_cfr_ch1_720p_vp9.mp4',
  'fileSize': 60178953,
  'width': 1280,
  'height': 720,
  'fps': 60,
  'initialPaddingDelay': 0,
  'grayCodeStartValue': 1,
  'grayCodeCycle': 256,
};

/**
 * A list of media videos, ordered from most to least capable.
 */
export const ORDERED_MEDIA_VIDEOS: VideoMetadata[] = [
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_2160P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_2160P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_1440P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_1440P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_1080P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_1080P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_720P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_720P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_480P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_480P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_360P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_360P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_240P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_240P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_144P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_144P,
];

/**
 * A list of all the video metadata objects.
 */
export const ALL_STREAMS: VideoMetadata[] = [
  VIDEO_2K_VP9_30FPS,
  VIDEO_2K_CALIBRATION,
  VIDEO_2K_VP9_60FPS,
  VIDEO_2K_VP9_6001FPS,
  VIDEO_4K_VP9_120FPS,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_1080P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_1440P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_144P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_2160P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_240P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_360P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_480P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_720P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_1080P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_1440P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_144P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_2160P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_240P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_360P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_480P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH2_60SEC_720P,
  VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_1080P,
  VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_1440P,
  VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_144P,
  VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_2160P,
  VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_240P,
  VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_360P,
  VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_480P,
  VIDEO_TV_10FPS_600S_TEST_VIDEO_CFR_CH1_720P,
  VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_1080P,
  VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_1440P,
  VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_144P,
  VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_2160P,
  VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_240P,
  VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_360P,
  VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_480P,
  VIDEO_TV_24FPS_600S_TEST_VIDEO_CFR_CH1_720P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_1080P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_1440P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_144P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_2160P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_240P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_360P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_480P,
  VIDEO_TV_30FPS_600S_TEST_VIDEO_CFR_CH1_720P,
  VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_1080P,
  VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_1440P,
  VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_144P,
  VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_2160P,
  VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_240P,
  VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_360P,
  VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_480P,
  VIDEO_TV_48FPS_600S_TEST_VIDEO_CFR_CH1_720P,
  VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_1080P,
  VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_1440P,
  VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_144P,
  VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_2160P,
  VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_240P,
  VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_360P,
  VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_480P,
  VIDEO_TV_50FPS_600S_TEST_VIDEO_CFR_CH1_720P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_1080P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_1440P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_144P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_2160P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_240P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_360P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_480P,
  VIDEO_TV_60FPS_600S_TEST_VIDEO_CFR_CH1_720P,
  VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_1080P,
  VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_1440P,
  VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_144P,
  VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_2160P,
  VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_240P,
  VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_360P,
  VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_480P,
  VIDEO_TV_V2_30FPS_600S_TEST_VIDEO_CFR_CH1_720P,
  VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_1080P,
  VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_1440P,
  VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_144P,
  VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_2160P,
  VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_240P,
  VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_360P,
  VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_480P,
  VIDEO_TV_V2_60FPS_600S_TEST_VIDEO_CFR_CH1_720P,
];
