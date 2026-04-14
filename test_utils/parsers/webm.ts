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
 * @fileoverview WebM parser ported from legacy YTS.
 */

import {Segment} from './interfaces';

const EBML_ID = 0x1a45dfa3;
const SEGMENT_ID = 0x18538067;
const SEEK_HEAD_ID = 0x114d9b74;
const SEEK_ID = 0x4dbb;
const SEEK_ELEMENT_ID = 0x53ab;
const CUES_ID = 0x1c53bb6b;
const SEEK_POSITION_ID = 0x53ac;
// Note: 0x1549a966 is actually "Info" element, not Segment. But keeping logic same.
const INFO_ID = 0x1549a966;
const TIMECODE_SCALE_ID = 0x2ad7b1;
const TIMECODE_SCALE_DENOM_ID = 0x2ad7b2;
const DURATION_ID = 0x4489;
const CLUSTER_ID = 0x1f43b675;
const TIMECODE_ID = 0xe7;
const CUE_POINT_ID = 0xbb;
const CUE_TIME_ID = 0xb3;
const CUE_TRACK_POSITIONS_ID = 0xb7;
const CUE_CLUSTER_POSITION_ID = 0xf1;
const VOID_ID = 0xec;

/**
 * Helper class for WebM parsing. Takes a DataView containing the elements to
 * be parsed. Lifted this out of dash-mse-test.appspot.com.
 */
class WebMElemParser {
  /**
   * The element data being processed.
   */
  private readonly elemData: DataView;

  /**
   * The offset of the next byte in the current element data view.
   */
  private pos = 0;

  /**
   * The start position of the first byte in the data view.
   */
  private readonly start: number;

  /**
   * @param elemData The element data view.
   * @param optStart The byte offset of the earliest stream, relative
   *     to an (unspecified) reference point. The current position relative to
   *     this start point can be queried on the element, and the information will
   *     be passed to subelements.
   */
  constructor(elemData: DataView, optStart?: number) {
    this.elemData = elemData;
    this.start = optStart || 0;
  }

  /**
   * Test if there is data remaining in the stream.
   * @return True if data remains.
   */
  atEos(): boolean {
    return this.pos >= this.elemData.byteLength;
  }

  /**
   * Read an element identifier from the stream, advancing the read pointer.
   *
   * Note that void elements will automatically be skipped.
   *
   * @return The element ID.
   */
  readId(): number {
    let id = this.readCodedInt(false);
    while (id === VOID_ID) {
      this.skipElement();
      id = this.readCodedInt(false);
    }
    return id;
  }

  /**
   * Read a subelement from the stream. Returns a new parser which contains the
   * subelement's data, and advances the position of the current parser to the
   * next element at the current level.
   *
   * @return The new parser.
   */
  readSubElement(): WebMElemParser {
    const size = this.readCodedInt(true);
    // 'size' could be the size of the entire WebM file, which is legal.
    const end = this.elemData.byteOffset + this.pos;
    const length = Math.min(size, this.elemData.buffer.byteLength - end);
    const subData = new DataView(this.elemData.buffer, end, length);
    const subStart = this.start + this.pos;
    const parser = new WebMElemParser(subData, subStart);
    this.pos += size;
    return parser;
  }

  /**
   * Peeks at the size of the next element in the stream.
   * @return The size value.
   */
  peekSize(): number {
    const pos = this.pos;
    const value = this.readCodedInt(true);
    this.pos = pos;
    return value;
  }

  /**
   * Read an integer element from the stream.
   *
   * @return The integer value.
   */
  readInt(): number {
    const size = this.readCodedInt(true);
    return this.readSizedInt(size);
  }

  /**
   * Read a floating-point element from the stream.
   *
   * @return The integer value.
   */
  readFloat(): number {
    const size = this.readCodedInt(true);
    return this.readSizedFloat(size);
  }

  /**
   * Advance the stream past the current element.
   */
  skipElement(): void {
    const size = this.readCodedInt(true);
    this.pos += size;
  }

  /**
   * Get the position of the current offset with respect to the start offset
   * supplied to the top-level element at creation.
   *
   * @return The offset.
   */
  getCurrentOffset(): number {
    return this.start + this.pos;
  }

  /**
   * Read a WebM-encoded integer. This encoding is used to represent element IDs,
   * element data sizes, and unsigned integers. Signed integers are not yet
   * supported.
   *
   * @param useMask Whether to mask out the EBML Length Descriptor.
   * @return The value.
   * @see http://www.matroska.org/technical/specs/index.html
   */
  private readCodedInt(useMask: boolean): number {
    let value = this.readByte();

    if (value === 0x01) {
      // We run into precision problems in this case, handle it separately.
      value = 0;
      for (let i = 0; i < 7; i++) {
        value = value * 256 + this.readByte();
      }
      return value;
    }

    let mask = 128;
    for (let i = 0; i < 6 && mask > value; i++) {
      value = value * 256 + this.readByte();
      mask *= 128;
    }

    if (useMask) {
      // Can't use bitwise operations because this value can exceed int31.
      return value - mask;
    } else {
      return value;
    }
  }

  /**
   * Read a raw integer with an arbitrary number of bytes.
   *
   * @param size Number of bytes to read.
   * @return The value.
   */
  private readSizedInt(size: number): number {
    let value = this.readByte();
    for (let i = 1; i < size; i++) {
      value = (value << 8) + this.readByte();
    }
    return value;
  }

  /**
   * Read a float.
   *
   * @param size Number of bytes (4 or 8).
   * @return The value.
   */
  private readSizedFloat(size: number): number {
    let value = 0;
    if (size === 4) {
      value = this.elemData.getFloat32(this.pos);
    } else if (size === 8) {
      value = this.elemData.getFloat64(this.pos);
    }
    this.pos += size;
    return value;
  }

  /**
   * Read a single byte from the stream and advance the stream position.
   *
   * @return The byte.
   */
  private readByte(): number {
    return this.elemData.getUint8(this.pos++);
  }

  /**
   * Parse a WebM 'CuePoint' element into a SegmentReference.
   *
   * @param timebase The timebase.
   * @param offset The offset in bytes from the start of the cluster.
   * @return A 2-tuple (first byte offset, start time), or
   *     null if there was an error.
   */
  readWebMCuePoint(timebase: number, offset: number): [number, number] | null {
    // Assumed structure: 'CueTime' followed by one 'CueTrackPositions'. This is
    // not intended to be a generalized parser, and will not handle muxed streams.
    if (this.readId() !== CUE_TIME_ID) {
      return null;
    }
    const time = this.readInt() * timebase;

    if (this.readId() !== CUE_TRACK_POSITIONS_ID) {
      return null;
    }

    const innerParser = this.readSubElement();

    let clusterPos = offset;
    while (!innerParser.atEos()) {
      const id = innerParser.readId();
      if (id === CUE_CLUSTER_POSITION_ID) {
        clusterPos = innerParser.readInt() + offset;
      } else {
        innerParser.skipElement();
      }
    }
    return [clusterPos, time];
  }
}

/**
 * Given a buffer contains the first 32k of a file, return a list of tables
 * containing 'time', 'duration', 'offset', and 'size' properties for each cue.
 * @param data The data buffer.
 * @param optTotalSize The total size of the file.
 * @return The list of cues.
 */
export function parseWebM(
  data: ArrayBuffer,
  optTotalSize?: number,
): Segment[] | undefined {
  let parser = new WebMElemParser(new DataView(data));

  if (parser.readId() !== EBML_ID) {
    console.debug('SegmentIndex: Invalid EBML ID');
    return;
  }
  // Skip the EBML header, which must come first.
  parser.skipElement();

  if (parser.readId() !== SEGMENT_ID) {
    console.debug('SegmentIndex: Invalid Segment ID');
    return;
  }

  // Grab the segment size to cap the last segment in the file.
  parser.peekSize();

  // Discard the segment parser, we're only interested in its contents now
  parser = parser.readSubElement();

  // Capture the offset to the first byte of the contents of the segment to use
  // as the relative base for 'Cues' elements.
  const segmentOffset = parser.getCurrentOffset();
  let cuesDone = false;
  let needsCluster = false;
  let hasTiming = false;
  let id: number | null = null;
  let totalDuration = 0;
  let cuesPosition = 0;
  let timebase = 0;

  while ((!cuesDone || !hasTiming) && !parser.atEos()) {
    id = parser.readId();
    switch (id) {
      case SEEK_HEAD_ID: {
        const seekParser = parser.readSubElement();
        while (!seekParser.atEos()) {
          if (seekParser.readId() === SEEK_ID) {
            const seekElementParser = seekParser.readSubElement();
            if (seekElementParser.readId() !== SEEK_ELEMENT_ID) {
              console.debug('Seek: Invalid SeekID');
            }
            const seekId = seekElementParser.readSubElement().readId();
            if (seekId === CUES_ID) {
              if (seekElementParser.readId() !== SEEK_POSITION_ID) {
                console.debug('Seek: Invalid SeekPosition');
              }
              cuesPosition = seekElementParser.readInt();
              cuesDone = true;
              break;
            }
          } else {
            console.debug('Seek: Invalid SeekID');
          }
        }
        break;
      }

      case INFO_ID:
        if (!cuesDone) {
          // we don't have cues...uh oh, we'll need to manually parse the cluster
          needsCluster = true;
          cuesDone = true;
        }

        const segmentParser = parser.readSubElement();

        let timescaleNum = 1_000_000; // Default timescale numerator
        let timescaleDen = 1_000_000_000; // Default timescale denominator

        while (!segmentParser.atEos()) {
          id = segmentParser.readId();
          if (id === TIMECODE_SCALE_ID) {
            timescaleNum = segmentParser.readInt();
          } else if (id === TIMECODE_SCALE_DENOM_ID) {
            timescaleDen = segmentParser.readInt();
          } else if (id === DURATION_ID) {
            totalDuration = segmentParser.readFloat();
          } else {
            segmentParser.skipElement();
          }
        }

        timebase = timescaleNum / timescaleDen;
        totalDuration *= timebase;

        hasTiming = true;
        break;

      default:
        parser.skipElement();
        break;
    }
  }

  // Done with initialization segment. On to the cues...if there's any.
  const res: Segment[] = [];
  if (needsCluster) {
    while (!parser.atEos()) {
      if (parser.readId() === CLUSTER_ID) {
        // Subtract 4 bytes for the size of the id.
        const clusterOffset = parser.getCurrentOffset() - 4;
        const clusterSize = parser.peekSize();
        const clusterParser = parser.readSubElement();
        if (clusterParser.readId() !== TIMECODE_ID) {
          console.debug('Cluster: Invalid Timecode');
        }
        const timecode = clusterParser.readInt();

        res.push({
          time: timecode,
          duration: 0,
          offset: clusterOffset,
          size: clusterSize,
        });

        if (res.length > 1) {
          const rLen = res.length;
          res[rLen - 2].duration = res[rLen - 1].time - res[rLen - 2].time;
          res[rLen - 2].size = res[rLen - 1].offset - res[rLen - 2].offset;
        }
      } else {
        parser.skipElement();
      }
    }
  } else {
    parser = new WebMElemParser(
      new DataView(data, segmentOffset + cuesPosition),
    );
    if (parser.readId() !== CUES_ID) {
      console.debug('SegmentIndex: Invalid Cues ID');
      return;
    }

    // As before, we only care about the 'Cues' element contents
    parser = parser.readSubElement();

    while (!parser.atEos()) {
      id = parser.readId();
      if (id === CUE_POINT_ID) {
        const subelem = parser.readSubElement();
        const offAndTime = subelem.readWebMCuePoint(timebase, segmentOffset);
        if (offAndTime) {
          res.push({
            time: offAndTime[1],
            duration: 0,
            offset: offAndTime[0],
            size: 0,
          });
          if (res.length > 1) {
            const rLen = res.length;
            res[rLen - 2].duration = res[rLen - 1].time - res[rLen - 2].time;
            res[rLen - 2].size = res[rLen - 1].offset - res[rLen - 2].offset;
          }
        }
      } else {
        parser.skipElement();
      }
    }
  }

  if (res.length > 0) {
    res[res.length - 1].duration = totalDuration - res[res.length - 1].time;
    if (!!optTotalSize) {
      res[res.length - 1].size = optTotalSize - res[res.length - 1].offset;
    }
  }
  return res;
}
