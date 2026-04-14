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
 * @fileoverview MP4 parser ported from legacy YTS.
 */

import {btofourcc, btoi} from '../legacy_byte_utils';

import {Segment} from './interfaces';

/**
 * Return the offset of sidx box.
 * @param data The data array.
 * @return The offset of the sidx box.
 */
function getSIDXOffset(data: Uint8Array): number {
  const length = data.length;
  let pos = 0;

  while (pos + 8 <= length) {
    const sizeArr: number[] = [];

    for (let i = 0; i < 4; ++i) sizeArr.push(data[pos + i]);

    const size = btoi(sizeArr);
    if (size < 8) throw new Error('Unexpectedly small size');
    if (pos + size >= data.length) break;

    if (btofourcc(data, pos + 4) === 'sidx') return pos;

    pos += size;
  }

  throw new Error(`Cannot find sidx box in first ${data.length} bytes of file`);
}

/**
 * Reads bytes from the buffer.
 * @param data The data buffer.
 * @param pos The current position.
 * @param bytes The number of bytes to read.
 * @return A tuple containing the new position and the read bytes.
 */
function readBytes(
  data: Uint8Array,
  pos: number,
  bytes: number,
): [number, number[]] {
  if (pos + bytes > data.length) {
    throw new Error('sidx box is incomplete.');
  }
  const result: number[] = [];
  for (let i = 0; i < bytes; ++i) result.push(data[pos + i]);
  return [pos + bytes, result];
}

/**
 * Given a buffer contains the first 32k of a file, return a list of tables
 * containing 'time', 'duration', 'offset', and 'size' properties for each
 * subsegment.
 * @param data The data array.
 * @return The list of segments.
 */
export function parseMp4(data: Uint8Array): Segment[] {
  const sidxStartBytes = getSIDXOffset(data);
  let currPos = sidxStartBytes;
  let bytesRead: number[];

  [currPos, bytesRead] = readBytes(data, currPos, 4);
  const size = btoi(bytesRead);
  const sidxEnd = sidxStartBytes + size;

  [currPos, bytesRead] = readBytes(data, currPos, 4);
  const boxType = btofourcc(bytesRead);
  if (boxType !== 'sidx') throw new Error('Unrecognized box type ' + boxType);

  [currPos, bytesRead] = readBytes(data, currPos, 4);
  const verFlags = btoi(bytesRead);

  [currPos, bytesRead] = readBytes(data, currPos, 4);
  // refId skipped

  [currPos, bytesRead] = readBytes(data, currPos, 4);
  const timescale = btoi(bytesRead);

  let earliestPts: number;
  let offset: number;

  if (verFlags === 0) {
    [currPos, bytesRead] = readBytes(data, currPos, 4);
    earliestPts = btoi(bytesRead);
    [currPos, bytesRead] = readBytes(data, currPos, 4);
    offset = btoi(bytesRead);
  } else {
    console.debug('Warning: may be truncating sidx values');
    currPos += 4; // Skip
    [currPos, bytesRead] = readBytes(data, currPos, 4);
    earliestPts = btoi(bytesRead);
    currPos += 4; // Skip
    [currPos, bytesRead] = readBytes(data, currPos, 4);
    offset = btoi(bytesRead);
  }
  offset = offset + sidxEnd;

  currPos += 2; // Reserved
  [currPos, bytesRead] = readBytes(data, currPos, 2);
  const count = btoi(bytesRead); // reference_count is 16 bits
  let time = earliestPts;

  const res: Segment[] = [];
  for (let i = 0; i < count; ++i) {
    [currPos, bytesRead] = readBytes(data, currPos, 4);
    const segmentSize = btoi(bytesRead);
    [currPos, bytesRead] = readBytes(data, currPos, 4);
    const duration = btoi(bytesRead);
    currPos += 4; // sapStuff
    res.push({
      time: time / timescale,
      duration: duration / timescale,
      offset,
      size: segmentSize,
    });
    time = time + duration;
    offset = offset + segmentSize;
  }
  if (currPos !== sidxEnd) {
    throw new Error(`Bad end point ${currPos} ${sidxEnd}`);
  }
  return res;
}
