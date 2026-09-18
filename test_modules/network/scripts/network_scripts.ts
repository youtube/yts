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

const SECOND = 1000;

function openWebSocket(wssAddress: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wssAddress);
    ws.addEventListener('open', () => {
      resolve(ws);
    });
    ws.addEventListener('error', (error) => {
      reject(new Error('WebSocket connection failed.'));
    });
  });
}

function megabits(bytes: number) {
  return (bytes * 8) / 1_000_000;
}

async function measureMbps(wssAddress: string, throttleMbps: number) {
  const ws = await openWebSocket(wssAddress);
  return new Promise((resolve, reject) => {
    const chunkSize = 1_000_000;
    ws.send(chunkSize.toString());
    let bytes = 0;
    const start = Date.now();
    const minDuration = 3;  // seconds
    console.log(
        `Will now measure Mbps by transferring data over WebSocket for ${
            minDuration} seconds (throttled at ${throttleMbps} Mbps)...`,
    );
    ws.addEventListener('message', (event) => {
      const size = event.data.length;
      console.debug(`Mbps measuring message: ${size} bytes.`);
      if (size !== chunkSize) {
        reject(
            new Error(
                `Mbps measuring message returned ${size} bytes, expected ${
                    chunkSize}.`,
                ),
        );
      }
      bytes += size;
      const duration = (Date.now() - start) / SECOND;  // in seconds
      if (duration > minDuration) {
        // done, computing Mbps
        const durationStr = duration.toFixed(2);
        console.log(`Transmitted ${bytes} bytes in ${durationStr} seconds.`);

        //
        // Mbps (with lower case "b"):
        //   - megabits per second
        //   - megabit = 1,000,000 bits
        //
        // https://en.wikipedia.org/wiki/Data-rate_units
        //
        const actualMbps = megabits(bytes) / duration;
        const actualMbpsStr = actualMbps.toFixed(1);
        console.log(`Measured Mbps: at least ${actualMbpsStr}.`);
        resolve(actualMbps);
      } else {
        // next message
        const throttledDuration = megabits(bytes) / throttleMbps;  // in seconds
        const throttleDelay = throttledDuration - duration;
        if (throttleDelay > 0) {
          setTimeout(() => {
            ws.send(chunkSize.toString());
          }, throttleDelay * SECOND);
        } else {
          ws.send(chunkSize.toString());
        }
      }
    });
  });
}
yts.script('measureMbps', measureMbps);
