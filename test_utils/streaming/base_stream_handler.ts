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

import type {StreamInfo} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';
import {sleep} from 'google3/third_party/javascript/yts/yts_common';

import {appendToBufferWithRetry, logError} from './stream_utils';

/** Target buffer depth in seconds to maintain to avoid QuotaExceededError. */
const TARGET_BUFFER_DEPTH = 10;

/** Interval to poll the buffer status when throttling in milliseconds. */
const THROTTLE_POLL_INTERVAL_MS = 500;

/** Default stream controller class. */
export class BaseStreamHandler {
  protected isStopped = false;

  constructor(
      protected readonly videoElement: HTMLVideoElement,
      protected readonly videoInfo: StreamInfo,
      protected readonly sb: SourceBuffer,
      protected readonly ms: MediaSource,
      protected readonly stopTime?: number,
  ) {}

  /** Explicitly stop streaming on the next loop iteration. */
  stop(): void {
    this.isStopped = true;
  }

  /** Main stream feed framework. */
  async handleStreaming(): Promise<void> {
    try {
      console.log(
          `Fetching ${this.videoInfo.mimetype} video: ${this.videoInfo.src}`,
      );
      const response = await fetch(this.videoInfo.src);
      if (!response.ok || !response.body) {
        throw new Error(
            `Video fetch failed: ${response.status} ${response.statusText}`,
        );
      }
      const reader = response.body.getReader();
      let totalBytesRead = 0;

      while (!this.isStopped) {
        const currentBufferEnd = this.getBufferEnd();

        if (this.stopTime && currentBufferEnd >= this.stopTime) {
          console.log(
              `Stopping data fetch at buffered time ${currentBufferEnd}s.`,
          );
          this.isStopped = true;
          break;
        }

        await this.throttleIfNecessary();
        // Guards against stops during the throttle wait.
        if (this.isStopped) {
          break;
        }

        const {done, value} = await reader.read();
        if (done) {
          await this.onStreamEnded();
          break;
        }

        totalBytesRead += value.length;
        await this.onChunkRead(value);
      }


      await reader.cancel();
    } catch (e) {
      logError(e, 'video stream processing');
      throw e;
    }
  }

  /** Sub-actions for chunk routing. */
  protected async onChunkRead(value: Uint8Array): Promise<void> {
    await appendToBufferWithRetry(this.sb, value, 'video-raw');
  }

  /** Lifecycle termination logic hook. */
  protected async onStreamEnded(): Promise<void> {}



  /** Limit flow to guarantee stability. */
  private async throttleIfNecessary(): Promise<void> {
    while (this.ms.readyState === 'open' && !this.isStopped) {
      const bufferDepth = this.getBufferEnd() - this.videoElement.currentTime;
      if (bufferDepth > TARGET_BUFFER_DEPTH) {
        console.log(`Throttling buffer at ${bufferDepth.toFixed(2)}s depth.`);
        await sleep(THROTTLE_POLL_INTERVAL_MS);
      } else {
        break;
      }
    }
  }

  /** Calculate timeline values accurately. */
  protected getBufferEnd(): number {
    const time = this.videoElement.currentTime;
    const buffered = this.sb.buffered;
    for (let i = 0; i < buffered.length; i++) {
      if (time >= buffered.start(i) && time <= buffered.end(i)) {
        return buffered.end(i);
      }
    }
    // If not in a buffered range, assume we need data.
    return time;
  }
}
