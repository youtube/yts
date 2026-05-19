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

import {FpsCounter} from 'google3/third_party/javascript/yts/test_utils/fps_counter';
import {h5vcc} from 'google3/third_party/javascript/yts/yts_common/h5vcc';

import * as playbackUtil from '../playback_util';
import {StreamHandlerType, streamVideoByChunksV2} from '../streaming/playback_mp4_stream';

let errors: string[] = [];

const WEBP_COLS = 5;
const MAX_WEBP_OVERUNDER = 10;
const MIN_WEBP_FPS = 29;

const MAX_DROPPED_FRAMES = 10;

const MEASUREMENT_THRESHOLD = 2;
const TEST_DONE_THRESHOLD = 10;

const STREAM_VP9_HDR_720P = {
  mimetype: 'video/webm; codecs="vp09.02.51.10.01.09.18.09.00"',
  src: '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/news_vp9_hdr_30fps_720p.webm',
  fileSize: 18879511,
};

const STREAM_VP9_HDR_1080P = {
  mimetype: 'video/webm; codecs="vp09.02.51.10.01.09.18.09.00"',
  src: '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/news_vp9_hdr_30fps_1080p.webm',
  fileSize: 30050449,
};

const STREAM_VP9_HDR_4K = {
  mimetype: 'video/webm; codecs="vp09.02.51.10.01.09.18.09.00"',
  src: '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/news_vp9_hdr_30fps_4k.webm',
  fileSize: 74188399,
};

const STREAM_VP9_NOHDR_720P = {
  mimetype: 'video/webm; codecs="vp09.00.51.08"',
  src: '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/big-buck-bunny-vp9-720p-30fps.webm',
  fileSize: 91390585,
};

const STREAM_VP9_NOHDR_1080P = {
  mimetype: 'video/webm; codecs="vp09.00.51.08"',
  src: '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/big-buck-bunny-vp9-1080p-30fps.webm',
  fileSize: 168727073,
};

const STREAM_VP9_NOHDR_4K = {
  mimetype: 'video/webm; codecs="vp09.00.51.08"',
  src: '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/big-buck-bunny-vp9-2160p-30fps.webm',
  fileSize: 1089986842,
};

const STREAMS_HDR = [
  STREAM_VP9_HDR_720P,
  STREAM_VP9_HDR_1080P,
  STREAM_VP9_HDR_4K,
];
const STREAMS_NOHDR = [
  STREAM_VP9_NOHDR_720P,
  STREAM_VP9_NOHDR_1080P,
  STREAM_VP9_NOHDR_4K,
];
const WEBP_RESOURCE_BASE_URL =
  '//storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/manual/webp_animated_transparent';
const WEBP_RESOURCES: Array<{size: number; url: string}> = [
  {size: 144, url: `${WEBP_RESOURCE_BASE_URL}/bottleflip_144.webp`},
  {size: 288, url: `${WEBP_RESOURCE_BASE_URL}/bottleflip_288.webp`},
  {size: 576, url: `${WEBP_RESOURCE_BASE_URL}/bottleflip_576.webp`},
];

/**
 * Interface for WebP animation stats captured from Cobalt cVals.
 */
export interface WebpStats {
  decodedFrames: number;
  decodingUnderruns: number;
  decodingOverruns: number;
  wallTime: number;
}

const DEFAULT_WEBP_STATS: WebpStats = {
  decodedFrames: 0,
  decodingUnderruns: 0,
  decodingOverruns: 0,
  wallTime: 0,
};

function initializeStyle() {
  const style = document.createElement('style');
  style.textContent = `
  .fixed-position {
    position: absolute;
    top: 0;
    left: 0;
  }

  #webp-over-video-container {
    z-index: 10;
    width: 100%;
    height: 100%;
  }

  #webp-over-video-vid {
    z-index: 11;
  }

  video {
    width: 100%;
    height: 100%;
  }

  .webp-over-video-animation {
    position: absolute;
    z-index: 12;
    margin: 30px;
  }
  `;
  document.head.appendChild(style);
}

/**
 * Pulls WebP Animation stats from Cobalt cVals and returns in presentable
 * state.
 */
export function getWebpAnimationStats(): WebpStats {
  const output: WebpStats = {
    decodedFrames: 0,
    decodingUnderruns: 0,
    decodingOverruns: 0,
    wallTime: 0,
  };

  output.wallTime = performance.now();
  if (!h5vcc?.cVal) {
    const message =
      'Unable to fetch WebP animation stats - h5vcc.cVal not defined';
    errors.push(message);
    console.error(message);
    return output;
  }

  try {
    output.decodedFrames = Number(
      h5vcc.cVal.getValue('Count.MainWebModule.AnimatedImage.DecodedFrames'),
    );
    output.decodingUnderruns = Number(
      h5vcc.cVal.getValue(
        'Count.MainWebModule.AnimatedImage.DecodingUnderruns',
      ),
    );
    output.decodingOverruns = Number(
      h5vcc.cVal.getValue('Count.MainWebModule.AnimatedImage.DecodingOverruns'),
    );
  } catch (e) {
    const message = `Unable to fetch WebP animation stats - h5vcc.cVal threw error: ${e}`;
    errors.push(message);
    console.error(message);
    console.error((e as Error).stack);
  }

  return output;
}

/**
 * Computes the effective FPS between the last and current WebP stats.
 *
 * @param currentWebpStats Latest available webp stats.
 * @param previousWebpStats Previous webp stats.
 */
export function getEffectiveWebpFps(
  currentWebpStats: WebpStats,
  previousWebpStats: WebpStats,
) {
  const frameDiff =
    currentWebpStats.decodedFrames - previousWebpStats.decodedFrames;
  const timeDiff =
    0.0005 + (currentWebpStats.wallTime - previousWebpStats.wallTime) / 1000;
  const effectiveFps = frameDiff / timeDiff;
  console.log(
    `WebP decoded ${frameDiff} frames in ${timeDiff.toFixed(
      2,
    )} seconds (${effectiveFps.toFixed(2)} FPS)`,
  );
  return effectiveFps;
}

function testAnimationPerformance(lastCallWebpStats: WebpStats) {
  const currentWebpStats = getWebpAnimationStats();

  const overruns = currentWebpStats.decodingOverruns;
  const underruns = currentWebpStats.decodingUnderruns;
  console.log(
    `WebP decoding stats: ${overruns} overruns, ${underruns} underruns`,
  );
  const totalOverUnder =
    currentWebpStats.decodingOverruns + currentWebpStats.decodingUnderruns;

  if (totalOverUnder > MAX_WEBP_OVERUNDER) {
    errors.push(
      `Total WebP decoding overruns and underruns must be no greater than ${MAX_WEBP_OVERUNDER}. Actual value: ${totalOverUnder}`,
    );
  }

  if (lastCallWebpStats.wallTime) {
    const effectiveFps = getEffectiveWebpFps(
      currentWebpStats,
      lastCallWebpStats,
    );

    if (effectiveFps < MIN_WEBP_FPS) {
      errors.push(
        `WebP effective FPS must be at least ${MIN_WEBP_FPS}. Actual value: ${effectiveFps}`,
      );
    }
  }
  return lastCallWebpStats;
}

function testVideoPerformance(video: HTMLVideoElement) {
  const totalDroppedFrames = video.getVideoPlaybackQuality().droppedVideoFrames;
  console.log(`Total video frames dropped: ${totalDroppedFrames}`);
  if (totalDroppedFrames > MAX_DROPPED_FRAMES) {
    errors.push(
      `Total video frames dropped must be no greater than ${MAX_DROPPED_FRAMES}. Actual value: ${totalDroppedFrames}.`,
    );
  }
}

function createWebPAnimation(
  webpResource: {size: number; url: string},
  position: {top: number; left: number},
) {
  const webp = document.createElement('image') as HTMLImageElement;
  webp.classList.add('webp-over-video-animation');
  webp.style.height = `${webpResource.size}px`;
  webp.style.width = `${webpResource.size}px`;
  webp.style.position = 'absolute';
  webp.style.left = `${position.left}px`;
  webp.style.top = `${position.top}px`;
  webp.style.backgroundImage = `url(${webpResource.url})`;
  return webp;
}

/** Runs the WebP over video test */
export async function webpOverVideoTest(
  numAnimations: number,
): Promise<string[]> {
  let fpsCounter: FpsCounter | undefined;
  let stopFpsCounter: (() => void) | undefined;
  if (!h5vcc?.cVal) {
    fpsCounter = new FpsCounter();
    stopFpsCounter = fpsCounter.start();
  }

  errors = [];
  initializeStyle();
  const container = document.createElement('div');
  container.classList.add('fixed-position');
  container.id = 'webp-over-video-container';
  document.body.appendChild(container);

  const video = document.createElement('video');
  video.classList.add('fixed-position');
  video.id = 'webp-over-video-vid';
  playbackUtil.listenForErrors(video, 'backgroundVideo', true);
  container.appendChild(video);

  let scaleIdx: number;
  if (playbackUtil.isGreaterThan4K()) {
    scaleIdx = 2;
  } else if (playbackUtil.isGreaterThanFHDAndSmallerThanOrEqualTo4K()) {
    scaleIdx = 1;
  } else {
    scaleIdx = 0;
  }
  const webpResource = WEBP_RESOURCES[scaleIdx];
  console.log(`Selecting WebP size = ${webpResource.size}px`);
  let stream = STREAMS_NOHDR[scaleIdx];
  if (playbackUtil.isHdrSupported()) {
    stream = STREAMS_HDR[scaleIdx];
    console.log('Selecting HDR video');
  } else {
    console.log('Selecting non-HDR video');
  }

  const webpAnimations: HTMLImageElement[] = [];
  for (let i = 0; i < numAnimations; i++) {
    const top = Math.floor(i / WEBP_COLS) * webpResource.size;
    const left = (i % WEBP_COLS) * webpResource.size;
    webpAnimations.push(createWebPAnimation(webpResource, {top, left}));
  }

  let lastCallWebpStats: WebpStats = Object.assign({}, DEFAULT_WEBP_STATS);
  await new Promise<void>(async (resolve) => {
    let lastMeasureTime = 0;
    video.addEventListener('timeupdate', (e) => {
      const loggableTime = video.currentTime.toFixed(2);

      if (video.currentTime < lastMeasureTime + MEASUREMENT_THRESHOLD) {
        // Wait until MEASUREMENT_THRESHOLD seconds after the last
        // measurement (or since video start).
        return;
      }

      if (!lastMeasureTime) {
        // Need to initialize the WebP animation the first time around.
        console.log('Inserting WebP animations at time=', loggableTime);
        for (const webp of webpAnimations) {
          container.appendChild(webp);
        }
      } else {
        console.log('Measuring performance at time=', loggableTime);
        if (h5vcc?.cVal) {
          lastCallWebpStats = testAnimationPerformance(lastCallWebpStats);
        } else if (fpsCounter) {
          const fpsStats = fpsCounter.getFpsStats();
          console.log(
            `Above ${fpsStats?.pct25.toFixed(2)} FPS for over 75% of the time.`,
          );
          console.log(
            `Above ${fpsStats?.pct05.toFixed(2)} FPS for over 95% of the time.`,
          );
        } else {
          const message =
            'Unable to fetch WebP animation stats - both h5vcc.cVal and fpsCounter are undefined';
          errors.push(message);
        }

        testVideoPerformance(video);
      }

      lastMeasureTime = video.currentTime;

      if (video.currentTime > TEST_DONE_THRESHOLD) {
        if (fpsCounter && stopFpsCounter) {
          const fpsStats = fpsCounter.getFpsStats();
          console.log(`Average FPS: ${fpsStats?.avgFps.toFixed(2)}`);
          console.log(
            `Above ${fpsStats?.pct50.toFixed(2)} FPS for over 50% of the time.`,
          );
          console.log(
            `Above ${fpsStats?.pct25.toFixed(2)} FPS for over 75% of the time.`,
          );
          console.log(
            `Above ${fpsStats?.pct05.toFixed(2)} FPS for over 95% of the time.`,
          );
          stopFpsCounter();
        }
        resolve();
      }
    });
    video.muted = true;
    void streamVideoByChunksV2(video, StreamHandlerType.BASE, stream);
    await video.play();
  });

  for (const webp of webpAnimations) {
    webp.style.backgroundImage = '';
    container.removeChild(webp);
  }
  playbackUtil.removeCobaltVideo(video);

  return errors;
}
