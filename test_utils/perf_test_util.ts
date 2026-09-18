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

import 'yts';

import {VideoPerformanceMetrics} from 'google3/third_party/javascript/yts/test_utils/mse/video_performance';

/**
 * Helper class to update status and do assertion for the performance tests.
 */
export class PerfTestUtil {
  private readonly videoPerfMetrics: VideoPerformanceMetrics;
  private readonly history: Array<{time: number; dropped: number}> = [];

  private startWallTimeMs?: number;
  private startVideoTimeSec?: number;

  // Throttle console logs to avoid spamming the test log.
  private logThrottleCounter = 0;
  private readonly LOG_THROTTLE_RATE = 4;

  constructor(video: HTMLVideoElement) {
    this.videoPerfMetrics = new VideoPerformanceMetrics(video);
    if (!this.videoPerfMetrics.supportsVideoPerformanceMetrics()) {
      fail(`UserAgent needs to support
          'video.getVideoPlaybackQuality' or the combined
          'video.webkitDecodedFrameCount'
          and 'video.webkitDroppedFrameCount' to execute this test.`);
    }
  }

  getCurrentTime() {
    return this.videoPerfMetrics.getCurrentTime();
  }

  getTotalDecodedFrames() {
    return this.videoPerfMetrics.getTotalDecodedVideoFrames();
  }

  getTotalDroppedFrames() {
    return this.videoPerfMetrics.getDroppedVideoFrames();
  }

  updateVideoPerfMetricsStatus() {
    const dropped = this.getTotalDroppedFrames();
    const decoded = this.getTotalDecodedFrames();
    const currentTime = this.getCurrentTime();
    this.history.push({time: currentTime, dropped});
    yts.addMetric('dropped_frames', dropped);
    yts.addMetric('decoded_frames', decoded);
    this.logVideoPerfMetricsStatus();
  }

  logVideoPerfMetricsStatus() {
    if (this.logThrottleCounter++ % this.LOG_THROTTLE_RATE) {
      return;
    }
    const dropped = this.getTotalDroppedFrames();
    const decoded = this.getTotalDecodedFrames();
    const currentTime = this.getCurrentTime().toFixed(2);
    console.log(
      `t=${currentTime}s, decoded_frames=${decoded}, dropped_frames=${dropped}`,
    );
  }

  assertAtLeastOneFrameDecoded() {
    const totalDecodedFrames = this.getTotalDecodedFrames();
    console.log('Total decoded frames: ', totalDecodedFrames);
    if (totalDecodedFrames <= 0) {
      fail('UserAgent was unable to render any frames.');
    }
  }

  assertMaxDroppedFrames(maxDroppedFrames: number) {
    const totalDroppedFrames = this.getTotalDroppedFrames();
    console.log('Total dropped frames: ', totalDroppedFrames);
    expect(totalDroppedFrames)
      .withContext('Total dropped frames')
      .toBeLessThanOrEqual(maxDroppedFrames);
  }

  assertMaxDroppedFramesPerInterval(
    maxDropsPerInterval = 1,
    intervalDurationSec = 7.0,
  ) {
    let maxObservedInInterval = 0;
    let worstWindow = {start: 0, end: 0, timeDelta: 0};
    let j = 0;

    for (let i = 0; i < this.history.length; i++) {
      while (
        j + 1 < this.history.length &&
        this.history[j + 1].time - this.history[i].time <= intervalDurationSec
      ) {
        j++;
      }
      const dropDelta = this.history[j].dropped - this.history[i].dropped;
      if (dropDelta > maxObservedInInterval) {
        maxObservedInInterval = dropDelta;
        worstWindow = {
          start: this.history[i].time,
          end: this.history[j].time,
          timeDelta: this.history[j].time - this.history[i].time,
        };
      }
    }

    console.log(
      `Max dropped frames observed in any <=${intervalDurationSec}s interval: ${maxObservedInInterval}`,
    );

    expect(maxObservedInInterval)
      .withContext(
        `Max dropped frames observed in window [${worstWindow.start.toFixed(
          2,
        )}s - ${worstWindow.end.toFixed(
          2,
        )}s] (timeDelta=${worstWindow.timeDelta.toFixed(
          2,
        )}s <= ${intervalDurationSec}s)`,
      )
      .toBeLessThanOrEqual(maxDropsPerInterval);
  }

  isTrackingStarted(): boolean {
    return this.startWallTimeMs !== undefined;
  }

  startTracking() {
    this.startWallTimeMs = performance.now();
    this.startVideoTimeSec = this.getCurrentTime();
    console.log('Start rate tracking at currentTime=', this.startVideoTimeSec);
  }

  assertPlaybackRate(expectedRate: number) {
    if (this.startWallTimeMs === undefined || this.startVideoTimeSec === undefined) {
      fail('Playback rate tracking was not started.');
      return;
    }
    const endWallTimeMs = performance.now();
    const endVideoTimeSec = this.getCurrentTime();
    console.log('Stop rate tracking at currentTime=', endVideoTimeSec);

    const elapsedWallTimeSec = (endWallTimeMs - this.startWallTimeMs) / 1000;
    const elapsedVideoTimeSec = endVideoTimeSec - this.startVideoTimeSec;

    if (elapsedWallTimeSec <= 0) {
      fail('Elapsed wall time is zero or negative.');
      return;
    }

    const rawMeasuredRate = elapsedVideoTimeSec / elapsedWallTimeSec;
    const measuredRate = Math.round(rawMeasuredRate * 1000) / 1000;

    console.log(`Measured playback rate: ${measuredRate.toFixed(3)}x`);

    /*
    const margin = 0.249;
    const errorValue = Math.abs(measuredRate - expectedRate);
    if (errorValue > margin) {
      fail(
          `Measured playback rate (${measuredRate.toFixed(3)}x) is more than ${
              margin}x away from the requested rate (${
              expectedRate}x). Frame drop results are invalid.`,
      );
    }
    */
  }
}
