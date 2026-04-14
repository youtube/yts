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
 * Interface for HTMLVideoElement with webkitDecodedFrameCount and
 * webkitDroppedFrameCount properties.
 */
export interface VideoElementWithWebkit extends HTMLVideoElement {
  webkitDroppedFrameCount?: number;
  webkitDecodedFrameCount?: number;
}

/**
 * Class for retrieving video performance metrics.
 */
export class VideoPerformanceMetrics {
  constructor(private readonly video: VideoElementWithWebkit) {}

  /**
   * Determines if the UA supports the expected APIs to get data on decoded frames
   * and dropped frames.
   */
  supportsVideoPerformanceMetrics(): boolean {
    return (
      this.supportsGetVideoPlaybackQuality() ||
      this.supportsWebkitDecodedFrameCount() ||
      this.supportsWebkitDroppedFrameCount()
    );
  }

  private supportsGetVideoPlaybackQuality(): boolean {
    return this.video.getVideoPlaybackQuality !== undefined;
  }

  private supportsWebkitDecodedFrameCount(): boolean {
    return this.video.webkitDecodedFrameCount !== undefined;
  }

  private supportsWebkitDroppedFrameCount(): boolean {
    return this.video.webkitDroppedFrameCount !== undefined;
  }

  /**
   * Returns the number of dropped video frames.
   */
  getDroppedVideoFrames(): number {
    if (this.supportsWebkitDroppedFrameCount()) {
      return this.video.webkitDroppedFrameCount!;
    } else if (this.supportsGetVideoPlaybackQuality()) {
      return this.video.getVideoPlaybackQuality().droppedVideoFrames;
    }
    return NaN;
  }

  /**
   * Returns the total number of decoded video frames.
   */
  getTotalDecodedVideoFrames(): number {
    if (this.supportsWebkitDecodedFrameCount()) {
      return this.video.webkitDecodedFrameCount!;
    } else if (this.supportsGetVideoPlaybackQuality()) {
      return this.video.getVideoPlaybackQuality().totalVideoFrames;
    }
    return NaN;
  }

  /**
   * Returns the current time of the video.
   */
  getCurrentTime(): number {
    return this.video.currentTime;
  }
}
