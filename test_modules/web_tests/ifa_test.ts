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

import {h5vcc} from 'google3/third_party/javascript/yts/yts_common/h5vcc';

describe('Functional Tests', () => {
  describe('IFA', () => {
    // IFA should be a UUID.
    const IFA_REGEX = new RegExp(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );

    yts.test({id: '24FDCA61-9DEA-4DE6-8129-BF54FDB3C0B2'});
    it('Has Advertising ID', async () => {
      const system = h5vcc?.system;
      const advertisingId = system?.getAdvertisingId
        ? await system.getAdvertisingId()
        : system?.advertisingId;
      const limitAdTracking = system?.getLimitAdTracking
        ? await system.getLimitAdTracking()
        : system?.limitAdTracking;

      console.log(
        `window.h5vcc.system.limitAdTracking value: "${limitAdTracking}"`,
      );
      console.log(
        `window.h5vcc.system.advertisingId value: "${advertisingId}"`,
      );
      expect(advertisingId)
        .withContext("window.h5vcc.system.advertisingId shouldn't be empty")
        .toBeTruthy();
      if (limitAdTracking && !advertisingId) {
        console.warn('Please re-run this test with limitAdTracking disabled.');
      }
    });

    yts.test({id: 'F15BC4E3-E94B-4F6E-9AF6-A3D04F5329B7'});
    it('Advertising ID format is correct', async () => {
      const system = h5vcc?.system;
      const advertisingId = system?.getAdvertisingId
        ? await system.getAdvertisingId()
        : system?.advertisingId;
      console.log(
        `window.h5vcc.system.advertisingId value: "${advertisingId}"`,
      );
      expect(advertisingId?.toLowerCase() ?? '')
        .withContext('advertisingId should be a UUID')
        .toMatch(IFA_REGEX);
    });
  });
});
