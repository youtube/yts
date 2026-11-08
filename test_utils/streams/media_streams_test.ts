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

import 'jasmine';

import {StreamDef} from './interfaces';
import {AV1, H264, VP9} from './media_streams';

describe('Media Streams Minimum Resolution', () => {
  const videoCodecs: Array<{
    name: string;
    streams: {[key: string]: StreamDef};
  }> = [
    {name: 'H264', streams: H264},
    {name: 'VP9', streams: VP9},
    {name: 'AV1', streams: AV1},
  ];

  for (const {name, streams} of videoCodecs) {
    describe(`${name} streams`, () => {
      for (const [streamName, stream] of Object.entries(streams)) {
        const isNegativeTest =
            streamName.toLowerCase().includes('negative') ||
            streamName.toLowerCase().includes('invalid') ||
            streamName.toLowerCase().includes('corrupt');

        if (isNegativeTest) {
          continue;
        }

        it(`${streamName} is at least 128x128`, () => {
          expect(stream.mediatype).toBe('video');
          const width = Number(stream.get('width'));
          const height = Number(stream.get('height'));

          expect(width)
              .withContext(
                  `${name}.${streamName} width (${width}) should be >= 128`)
              .toBeGreaterThanOrEqual(128);
          expect(height)
              .withContext(
                  `${name}.${streamName} height (${height}) should be >= 128`)
              .toBeGreaterThanOrEqual(128);
        });
      }
    });
  }
});
