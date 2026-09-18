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

import {asUnsafeAny, extendedPerformance, is4k, is8k, isGt4K, isGtFHD} from 'google3/third_party/javascript/yts/test_utils/legacy_yts_utils';
import {createMediaSourceUrlFromSource, getMimeTypeWithTunnelMode, isHdrSupported} from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {AAC, AV1, H264, VP9} from 'google3/third_party/javascript/yts/test_utils/streams/media_streams';
import {h5vcc} from 'google3/third_party/javascript/yts/yts_common/h5vcc';


describe('Functional Tests', () => {
  describe('Memory Allocation', () => {
    function testCpuSystemMemoryWithFallback(sizeMB: number) {
      console.log(`Running memory test with expected size: ${sizeMB}MB.`);
      const size = sizeMB * 1024 * 1024;

      if (extendedPerformance.measureAvailableCpuMemory &&
          extendedPerformance.measureUsedCpuMemory) {
        const totalMemory = extendedPerformance.measureAvailableCpuMemory() +
            extendedPerformance.measureUsedCpuMemory();
        expect(totalMemory)
            .withContext(`CPU memory allocated less than ${sizeMB} MB`)
            .toBeGreaterThanOrEqual(size);
      } else if (h5vcc?.cVal) {
        const memFree = Number(h5vcc.cVal.getValue('Memory.CPU.Free'));
        const memUsed = Number(h5vcc.cVal.getValue('Memory.CPU.Used'));
        expect(memFree + memUsed)
            .withContext(`CPU memory allocated less than ${size}`)
            .toBeGreaterThanOrEqual(size);
      } else {
        fail('Neither measureAvailableCpuMemory nor h5vcc.cVal is available');
      }
    }

    function testCpuSystemMemory(sizeMB: number) {
      console.log(`Running memory test with expected size: ${sizeMB}MB.`);
      const size = sizeMB * 1024 * 1024;

      if (extendedPerformance.measureAvailableCpuMemory &&
          extendedPerformance.measureUsedCpuMemory) {
        const totalMemory = extendedPerformance.measureAvailableCpuMemory() +
            extendedPerformance.measureUsedCpuMemory();
        expect(totalMemory)
            .withContext(`CPU memory allocated less than ${sizeMB} MB`)
            .toBeGreaterThanOrEqual(size);
      } else {
        fail(
            'Performance APIs (measureAvailableCpuMemory/measureUsedCpuMemory) are not available');
      }
    }

    yts.test({id: '14.18.1.1'});
    it('CPU System Memory', () => {
      let sizeMB: number;
      if (isGt4K()) {
        sizeMB = 355;
      } else if (isGtFHD()) {
        sizeMB = isHdrSupported() ? 230 : 195;
      } else {
        sizeMB = 170;
      }
      testCpuSystemMemoryWithFallback(sizeMB);
    });

    yts.test({id: '2DB25455-99CD-4591-B223-7938261362F3'});
    it('CPU System Memory 2027', () => {
      let sizeMB: number;
      if (isGt4K()) {
        sizeMB = 355;
      } else if (isGtFHD()) {
        sizeMB = isHdrSupported() ? 230 : 195;
      } else {
        sizeMB = 181;
      }
      testCpuSystemMemory(sizeMB);
    });

    yts.test({id: '14.18.2.1'});
    it('JavaScript Memory Allocation', () => {
      const size = 80;  // MB
      const a = new ArrayBuffer(size * 1024 * 1024);
      expect(a.byteLength).toBe(size * 1024 * 1024);
    });
  });

  describe('Assorted', () => {
    yts.test({id: '14.9.2.1'});
    it('ECMA262-5 Strict Mode', () => {
      const obj = {};
      Object.defineProperty(obj, 'readOnly', {value: 1, writable: false});
      expect(() => {
        'use strict';
        asUnsafeAny(obj).readOnly = 2;
      }).toThrowError(TypeError);
    });

    yts.test({id: '14.9.3.1'});
    it('RequestAnimationFrame', () => {
      expect('requestAnimationFrame' in window)
          .withContext('window.requestAnimationFrame should exist')
          .toBeTrue();
    });

    yts.test({id: '14.9.4.1'});
    it('JavaScript Date Object', () => {
      const dateObj = new Date(Date.parse('2012-11-01T14:12:09.000Z'));
      const dateObjFormatted = dateObj.getUTCDate() + '/' +
          (dateObj.getUTCMonth() + 1) + '/' +
          dateObj.getUTCFullYear().toString().substr(2, 2);
      expect(dateObjFormatted === '1/11/12' || dateObjFormatted === '2012/11/2')
          .withContext('Date object should be supported correctly')
          .toBeTrue();
    });

    yts.test({id: '14.9.7.1'});
    it('Window Size', () => {
      const EXPECTED_WINDOW_SIZES =
          ['1280x720', '1920x1080', '2560x1440', '3840x2160', '7680x4320'];
      const windowSize = `${window.innerWidth}x${window.innerHeight}`;
      console.log(`Window size is ${windowSize}.`);
      if (EXPECTED_WINDOW_SIZES.includes(windowSize)) {
        console.log('Window size matches a commonly used resolution.');
        return;
      }

      const screenSize = `${screen.width}x${screen.height}`;
      console.log(
          `Uncommon window size detected. Comparing against screen size (${
              screenSize}).`);
      if (windowSize === screenSize) {
        console.log('Window size matches screen size.');
      }
      expect(windowSize === screenSize)
          .withContext(`Window size "${
              windowSize}" does not match screen size "${screenSize}".`)
          .toBeTrue();
    });
  });

  describe('Buffer', () => {
    function getVideoSrc() {
      if (is8k()) {
        return AV1['Sdr4320p30'];
      } else if (
          is4k() && MediaSource.isTypeSupported('video/webm; codecs=vp9')) {
        return isHdrSupported() ? VP9['Video2160pHdr1MB'] :
                                  VP9['Video2160p1MB'];
      } else {
        if (MediaSource.isTypeSupported(VP9['Video1080p1MB'].mimetype)) {
          return VP9['Video1080p1MB'];
        } else {
          return H264['Video1MB'];
        }
      }
    }

    function GetMinVideoBufferSizeInMB() {
      if (isGt4K()) {
        return 200;
      } else if (isGtFHD()) {
        return isHdrSupported() ? 80 : 50;
      } else {
        return 30;
      }
    }

    function appendBufferAsync(
        sb: SourceBuffer, data: Uint8Array): Promise<void> {
      return new Promise((resolve, reject) => {
        const onUpdateEnd = () => {
          sb.removeEventListener('updateend', onUpdateEnd);
          sb.removeEventListener('error', onError);
          resolve();
        };
        const onError = (e: Event) => {
          sb.removeEventListener('updateend', onUpdateEnd);
          sb.removeEventListener('error', onError);
          reject(new Error('SourceBuffer append error: ' + e));
        };
        sb.addEventListener('updateend', onUpdateEnd);
        sb.addEventListener('error', onError);
        sb.appendBuffer(data);
      });
    }

    yts.test({id: '14.19.1.1'});
    it('Source Buffer Size', async () => {
      const ms = new MediaSource();
      const videoStream = getVideoSrc();
      const audioStream = AAC['AudioHuge'];

      const video = document.createElement('video');
      document.body.appendChild(video);

      const [videoSb, audioSb] =
          await new Promise<[SourceBuffer, SourceBuffer]>((resolve) => {
            ms.addEventListener('sourceopen', () => {
              resolve([
                ms.addSourceBuffer(getMimeTypeWithTunnelMode(videoStream.mimetype)),
                ms.addSourceBuffer(audioStream.mimetype)
              ]);
            }, {once: true});
            video.src = createMediaSourceUrlFromSource(ms);
          });

      const minVideoBufferSizeMb = GetMinVideoBufferSizeInMB();
      const minVideoBufferSize = minVideoBufferSizeMb * 1024 * 1024;
      const threshold = 0.9;
      const videoEstimatedMinTime =
          minVideoBufferSize * videoStream.duration / videoStream.fileSize;

      // 1. Fetch audio and video segments concurrently
      const [audioResponse, videoResponse] =
          await Promise.all([fetch(audioStream.src), fetch(videoStream.src)]);
      const [audioData, videoData] = await Promise.all([
        audioResponse.arrayBuffer().then(b => new Uint8Array(b)),
        videoResponse.arrayBuffer().then(b => new Uint8Array(b))
      ]);

      // 2. Append Audio
      const minAudioBufferSizeMb = 5;
      const minAudioBufferSize = minAudioBufferSizeMb * 1024 * 1024;
      const audioEstimatedMinTime = minAudioBufferSize *
          (audioStream.duration / audioStream.fileSize) * 0.95;

      await appendBufferAsync(audioSb, audioData);
      expect(audioSb.buffered.end(0) - audioSb.buffered.start(0))
          .withContext('Time range in source buffer (audio)')
          .toBeGreaterThanOrEqual(audioEstimatedMinTime);

      // 3. Append Video in a loop
      let expectedTime = 0;
      let expectedSize = 0;
      let appendCount = 0;

      try {
        while (expectedSize < minVideoBufferSize) {
          console.log('Append count ' + appendCount++);
          videoSb.timestampOffset = expectedTime;

          if (expectedSize + videoStream.fileSize > minVideoBufferSize) {
            // Last chunk: slice it
            const cutRatio = (videoEstimatedMinTime - expectedTime) /
                videoStream.duration * threshold;
            const sliceLength = Math.floor(videoData.byteLength * cutRatio);
            await appendBufferAsync(videoSb, videoData.slice(0, sliceLength));
            expectedSize = minVideoBufferSize;  // force exit
          } else {
            await appendBufferAsync(videoSb, videoData);
            expectedSize += videoStream.fileSize;
          }

          // Check if eviction occurred
          if (videoSb.buffered.length > 0 &&
              (videoSb.buffered.start(0) > 0 ||
               expectedTime > videoSb.buffered.end(0))) {
            console.log('Buffer eviction occurred, stopping.');
            break;
          }
          expectedTime += videoStream.duration;
        }
        if (expectedSize >= minVideoBufferSize) {
          console.log('Source buffer exceeded minimum: ' + minVideoBufferSize);
        }
      } catch (e: unknown) {
        console.debug(e);
        if (!(e instanceof DOMException) || e.name !== 'QuotaExceededError') {
          throw e;  // rethrow unexpected errors
        }
        console.log('QuotaExceededError occurred, buffer is full.');
      }

      // 4. Final Assertion
      expect(videoSb.buffered.end(0) - videoSb.buffered.start(0))
          .withContext('Time range in source buffer (video)')
          .toBeGreaterThanOrEqual(videoEstimatedMinTime * threshold);

      // Cleanup
      if (video.src) {
        window.URL.revokeObjectURL(video.src);
      }
      document.body.removeChild(video);
    }, 60000);
  });
});
