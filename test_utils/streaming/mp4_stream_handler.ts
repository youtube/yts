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
import type {StreamInfo} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';

import {BaseStreamHandler} from './base_stream_handler';
import {appendToBufferWithRetry, combineUint8Arrays} from './stream_utils';

/** Initial buffer size needed before attempting to parse MP4 sidx box. */
const MIN_BUFFER_FOR_SIDX_PARSING = 32768;

/** Maximum bytes to read before giving up on sidx-aligned streaming. */
const MAX_DATA_BEFORE_RAW_APPEND = 1024 * 1024;

/** Class to manage state and logic for MP4 video streaming. */
export class Mp4StreamHandler extends BaseStreamHandler {
  private segments: Segment[] = [];
  private segmentsParsed = false;
  private bufferedData = new Uint8Array(0);
  private totalBytesRead = 0;
  private currentSegmentIndex = 0;
  private initSegmentAppended = false;

  constructor(
      videoElement: HTMLVideoElement,
      videoInfo: StreamInfo,
      sb: SourceBuffer,
      ms: MediaSource,
      stopTime?: number,
  ) {
    super(videoElement, videoInfo, sb, ms, stopTime);
  }

  /** Hook executed for incoming chunk events. */
  protected override async onChunkRead(value: Uint8Array): Promise<void> {
    this.bufferedData = combineUint8Arrays(this.bufferedData, value);
    this.totalBytesRead += value.length;
    await this.processBufferedData();
  }

  /** Hook executed when pipeline completes. */
  protected override async onStreamEnded(): Promise<void> {
    if (this.bufferedData.length > 0 && !this.isStopped) {
      console.log(
          `Appending remaining data of size ${this.bufferedData.length}`,
      );
      await appendToBufferWithRetry(this.sb, this.bufferedData, 'video-tail');
    }
  }


  /** Checks if any buffered data can be parsed or appended. */
  private async processBufferedData(): Promise<void> {
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
