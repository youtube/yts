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
 * @fileoverview FPS counter class ported from:
 * //depot/google3/video/youtube/web/living_room/core/automation/util/performance_util.ts.
 */

const ONE_SECOND_MS = 1000;
const MAX_TIMESTAMPS = 60;

interface FpsStats {
  runningFrameIntervals: number[];
  avgFps: number;
  minFps: number;
  maxFps: number;
  pct05: number;
  pct25: number;
  pct50: number;
  pct75: number;
  pct95: number;
}

/**
 * This class is used to calculate the FPS of the web page. It uses the
 * requestAnimationFrame API and has start and stop methods to control the
 * duration of the FPS measurement.
 */
export class FpsCounter {
  private rafRequestId: number|undefined = undefined;
  private readonly frameTimestamps: number[] = [];

  // The callback function for the requestAnimationFrame API to start a loop.
  private rafCallbackLoop(time: DOMHighResTimeStamp) {
    this.frameTimestamps.push(time);

    // Only store a running set of 60 timestamps at a time.
    if (this.frameTimestamps.length >= MAX_TIMESTAMPS) {
      this.frameTimestamps.shift();
    }

    this.rafRequestId = requestAnimationFrame((time) => {
      this.rafCallbackLoop(time);
    });
  }

  // Begin FPS measurement.
  start() {
    if (!this.rafRequestId) {
      // Clear any previously measured timestamps.
      this.frameTimestamps.length = 0;
      requestAnimationFrame((time) => {
        this.rafCallbackLoop(time);
      });
    }

    // Return a function to stop the FPS measurement.
    return () => {
      this.stop();
    };
  }

  stop() {
    // Cancel the requestAnimationFrame callback if it's still running, this
    // will prevent the loop from running indefinitely.
    if (this.rafRequestId) {
      cancelAnimationFrame(this.rafRequestId);
      this.rafRequestId = undefined;
    }
  }

  getFpsStats(): FpsStats|undefined {
    // Use the frame timestamps array to calculate intervals between frames.
    const frameIntervals = [];
    if (this.frameTimestamps.length < 2) {
      return;
    }

    for (let i = 1; i < this.frameTimestamps.length; i++) {
      frameIntervals.push(
          this.frameTimestamps[i] - this.frameTimestamps[i - 1],
      );
    }

    const fpsStats: FpsStats = {
      runningFrameIntervals: [],
      avgFps: 0,
      minFps: 0,
      maxFps: 0,
      pct05: 0,
      pct25: 0,
      pct50: 0,
      pct75: 0,
      pct95: 0,
    };

    // To convert a frame interval to FPS, we need to divide 1 second (in ms) by
    // the frame interval (also in ms).
    fpsStats.runningFrameIntervals = frameIntervals;
    fpsStats.avgFps = ONE_SECOND_MS /
        (frameIntervals.reduce((a, b) => a + b, 0) / frameIntervals.length);
    fpsStats.minFps = ONE_SECOND_MS / Math.max(...frameIntervals);
    fpsStats.maxFps = ONE_SECOND_MS / Math.min(...frameIntervals);
    fpsStats.pct05 = this.calculateFpsQuantile(frameIntervals, 5);
    fpsStats.pct25 = this.calculateFpsQuantile(frameIntervals, 25);
    fpsStats.pct50 = this.calculateFpsQuantile(frameIntervals, 50);
    fpsStats.pct75 = this.calculateFpsQuantile(frameIntervals, 75);
    fpsStats.pct95 = this.calculateFpsQuantile(frameIntervals, 95);

    return fpsStats;
  }

  private calculateFpsQuantile(arr: number[], quantile: number) {
    // Sort the array in descending order. The longer the frame interval,
    // the lower the FPS, therefore when we're calculating the perentiles, we
    // want the worse intervals to be at the beginning of the array.
    const sortedArr = [...arr].sort((a, b) => b - a);

    // Depending on the length of the array, the index will either be a whole
    // number or a decimal number. If the index is a whole number, then the
    // quantile is the value at that index in the array. If the index is a
    // decimal number, then the quantile is a weighted average of the values at
    // the two indices that the decimal number falls between.
    const index = (sortedArr.length - 1) * (quantile / 100);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (lower === upper) {
      return ONE_SECOND_MS / sortedArr[lower];
    }
    return (
        ONE_SECOND_MS /
        (sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight));
  }
}
