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

describe('EME Request Tests', () => {
  it('generates a Widevine request without a video tag', async () => {
    const keySystem = 'com.widevine.alpha';
    const ROBUSTNESS_HW = 'HW_SECURE_ALL';
    const ROBUSTNESS_SW = 'SW_SECURE_DECODE';

    const config = [
      {
        initDataTypes: ['cenc'],
        videoCapabilities: [
          {
            contentType: 'video/mp4; codecs="avc1.640028"',
            robustness: ROBUSTNESS_HW,
          },
        ],
      },
      {
        initDataTypes: ['cenc'],
        videoCapabilities: [
          {
            contentType: 'video/mp4; codecs="avc1.640028"',
            robustness: ROBUSTNESS_SW,
          },
        ],
      },
    ];

    const access = await navigator.requestMediaKeySystemAccess(
      keySystem,
      config,
    );
    const configuration = access.getConfiguration();

    console.log(
      'Selected Robustness: ' +
        (configuration.videoCapabilities![0].robustness || 'None'),
    );

    const keys = await access.createMediaKeys();
    const session = keys.createSession();

    const messagePromise = new Promise<void>((resolve, reject) => {
      session.addEventListener('message', (event) => {
        const message = (event as MediaKeyMessageEvent).message;
        console.log(`Message size ${message.byteLength}`);
        if (message.byteLength < 100) {
          reject(
            new Error(
              'First EME message is too small, probably a service cert request',
            ),
          );
          return;
        }
        resolve();
      });
    });

    const initDataType = 'cenc';
    const initData = new Uint8Array([
      0,
      0,
      0,
      32, // size
      112,
      115,
      115,
      104, // 'pssh'
      0,
      0,
      0,
      0, // version=0, flags=0
      237,
      239,
      139,
      169,
      121,
      214,
      74,
      206, // SystemID (Widevine)
      163,
      200,
      39,
      220,
      213,
      29,
      33,
      237,
      0,
      0,
      0,
      0, // Data size 0 (empty PSSH)
    ]);

    await session.generateRequest(initDataType, initData);
    await messagePromise;
  });
});
