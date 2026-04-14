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

import {Segment} from 'google3/third_party/javascript/yts/test_utils/parsers/interfaces';
import {parseMp4} from 'google3/third_party/javascript/yts/test_utils/parsers/mp4';
import {sleep} from 'google3/third_party/javascript/yts/yts_common';
import {
  StreamInfo,
  appendToBufferWithRetry,
  combineUint8Arrays,
  logError,
} from './stream_utils';

/** Initial buffer size needed before attempting to parse MP4 sidx box. */
const MIN_BUFFER_FOR_SIDX_PARSING = 32768;

/** Maximum bytes to read before giving up on sidx-aligned streaming. */
const MAX_DATA_BEFORE_RAW_APPEND = 1024 * 1024;

/** Target buffer depth in seconds to maintain to avoid QuotaExceededError. */
const TARGET_BUFFER_DEPTH = 10;

/** Interval to poll the buffer status when throttling in milliseconds. */
const THROTTLE_POLL_INTERVAL_MS = 500;

/** Class to manage state and logic for MP4 video streaming. */
export class Mp4StreamHandler {
  private segments: Segment[] = [];
  private segmentsParsed = false;
  private bufferedData = new Uint8Array(0);
  private totalBytesRead = 0;
  private currentSegmentIndex = 0;
  private initSegmentAppended = false;
  private isStopped = false;

  constructor(
    private readonly videoElement: HTMLVideoElement,
    private readonly videoInfo: StreamInfo,
    private readonly sb: SourceBuffer,
    private readonly ms: MediaSource,
    private readonly stopTime?: number,
  ) {}

  /** Main entry point for starting the video stream. */
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

      while (!this.isStopped) {
        const {done, value} = await reader.read();
        if (done) break;

        this.bufferedData = combineUint8Arrays(this.bufferedData, value);
        this.totalBytesRead += value.length;

        await this.processBufferedData();
      }

      if (this.bufferedData.length > 0 && !this.isStopped) {
        console.log(
          `Appending remaining data of size ${this.bufferedData.length}`,
        );
        await appendToBufferWithRetry(this.sb, this.bufferedData, 'video-tail');
      }

      if (this.isStopped) {
        await reader.cancel();
      }
    } catch (e) {
      logError(e, 'video stream processing');
      throw e;
    }
  }

  /** Checks if any buffered data can be parsed or appended. */
  private async processBufferedData(): Promise<void> {
    await this.throttleIfNecessary();

    if (!this.segmentsParsed) {
      if (
        this.bufferedData.length >= MIN_BUFFER_FOR_SIDX_PARSING ||
        this.totalBytesRead >= this.videoInfo.fileSize
      ) {
        this.tryParsingSegments();
      }
    }

    if (this.segmentsParsed) {
      if (!this.initSegmentAppended && this.segments.length > 0) {
        await this.tryAppendInitSegment();
      }
      await this.appendAvailableSegments();
    } else if (this.totalBytesRead > MAX_DATA_BEFORE_RAW_APPEND) {
      console.warn(
        `Appending unparsed video data (${this.bufferedData.length} bytes) to avoid bloat`,
      );
      await appendToBufferWithRetry(this.sb, this.bufferedData, 'video-raw');
      this.bufferedData = new Uint8Array(0);
    }
  }

  /** Wait if the buffer is already full enough to prevent QuotaExceededError. */
  private async throttleIfNecessary(): Promise<void> {
    while (this.ms.readyState === 'open') {
      const bufferEnd = this.getBufferEnd();
      const bufferDepth = bufferEnd - this.videoElement.currentTime;

      if (bufferDepth > TARGET_BUFFER_DEPTH) {
        console.log(`Throttling buffer at ${bufferDepth.toFixed(2)}s depth.`);
        await sleep(THROTTLE_POLL_INTERVAL_MS);
      } else {
        break;
      }
    }
  }

  /** Returns the end time of the buffered range around the current playhead. */
  private getBufferEnd(): number {
    const time = this.videoElement.currentTime;
    const buffered = this.sb.buffered;
    for (let i = 0; i < buffered.length; i++) {
      if (time >= buffered.start(i) && time <= buffered.end(i)) {
        return buffered.end(i);
      }
    }
    return time; // If not in a buffered range, assume we need data.
  }

  /** Attempts to parse MP4 segments from the current buffer. */
  private tryParsingSegments(): void {
    try {
      this.segments = parseMp4(this.bufferedData);
      this.segmentsParsed = true;
      console.log(`Parsed ${this.segments.length} MP4 segment(s).`);
    } catch (e) {
      console.warn(`parseMp4 failed: ${(e as Error).message}.`);
      if (this.totalBytesRead > MAX_DATA_BEFORE_RAW_APPEND) {
        console.error(
          `Failed to parse segments after ${MAX_DATA_BEFORE_RAW_APPEND} bytes. Aborting alignment.`,
        );
        this.segmentsParsed = true;
      }
    }
  }

  /** Appends initialization data preceding the first segment. */
  private async tryAppendInitSegment(): Promise<void> {
    const firstSegmentOffset = this.segments[0].offset;
    if (this.bufferedData.length >= firstSegmentOffset) {
      const initSegment = this.bufferedData.slice(0, firstSegmentOffset);
      console.log(`Appending init segment of size ${initSegment.length}`);
      await appendToBufferWithRetry(this.sb, initSegment, 'video-init');
      this.initSegmentAppended = true;
      this.bufferedData = this.bufferedData.slice(firstSegmentOffset);
    }
  }

  /** Appends all full MP4 segments currently in the buffer. */
  private async appendAvailableSegments(): Promise<void> {
    if (!this.initSegmentAppended) return;

    while (this.currentSegmentIndex < this.segments.length) {
      if (this.isStopped) break;

      const segment = this.segments[this.currentSegmentIndex];
      if (this.stopTime !== undefined && segment.time >= this.stopTime) {
        console.log(`Stopping data fetch at segment time ${segment.time}s.`);
        this.isStopped = true;
        break;
      }

      if (this.bufferedData.length < segment.size) {
        console.log(
          `Waiting for segment ${this.currentSegmentIndex} (received ${this.bufferedData.length} of ${segment.size})`,
        );
        break;
      }

      const segmentData = this.bufferedData.slice(0, segment.size);
      console.log(
        `Appending segment ${this.currentSegmentIndex} (time:${segment.time.toFixed(2)}, size:${segment.size})`,
      );
      await appendToBufferWithRetry(
        this.sb,
        segmentData,
        `video-seg-${this.currentSegmentIndex}`,
      );
      this.bufferedData = this.bufferedData.slice(segment.size);
      this.currentSegmentIndex++;
    }
  }
}
