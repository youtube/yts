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

import {
  Device,
  Script,
} from 'google3/third_party/javascript/yts/devices/interfaces';
import {deviceUnderTest} from 'google3/third_party/javascript/yts/test_context';
import {getCurrentTime} from 'google3/third_party/javascript/yts/test_utils/time_util';
const SECOND = 1000;
const MINUTE = 60 * SECOND;

describe('Time', () => {
  let script!: Script;
  let device!: Device;

  beforeEach(async () => {
    device = await deviceUnderTest();
    script = await device.launchScript('test_modules/time/scripts/scripts.js');
  }, 1 * MINUTE);

  /**
   * Verifies that the time on the device matches the actual time obtained by
   * querying NTP servers
   */
  yts.test({id: '8EA31D34-7CF0-4969-AC73-5F6DFC9D1BB4'});
  it('Current Time', async () => {
    const deviceTimeNum = (await script.invoke('getTime')) as number;
    const deviceTime = new Date(deviceTimeNum);
    const actualTime = await getCurrentTime();
    const actualTimeNum = actualTime.getTime();
    console.log(`device time: ${deviceTime}`);
    console.log(`actual time: ${actualTime}`);
    const ACCURACY_MS = 1500;
    if (Math.abs(deviceTimeNum - actualTimeNum) > ACCURACY_MS) {
      fail(
        `Device time (${deviceTime.toISOString()}) did not match actual time (${actualTime.toISOString()}) from an NTP server. Expected to match +/-1s.`,
      );
    }
  }, 10_000);

  /**
   * Confirms the time zone offset from device matches the offset on the device
   * running yts cli
   */
  yts.test({id: 'DD84D5B7-0044-4932-A545-B81E94BF7829'});
  it('Time Zone', async () => {
    const deviceTimezoneOffset = (await script.invoke(
      'getTimezoneOffset',
    )) as number;
    const hostTimezoneOffset = new Date().getTimezoneOffset();
    if (deviceTimezoneOffset !== hostTimezoneOffset) {
      fail(
        `Device time zone offset (${
          deviceTimezoneOffset / 60
        } hours from UTC) did not match host time zone offset (${
          hostTimezoneOffset / 60
        } hours from UTC).`,
      );
    }
  });

  /**
   * Logs time zone name from device and passes when any string is returned
   */
  yts.test({id: 'E2814E1C-2178-4F39-824D-A3BA3C836B2E'});
  it('Time Zone Name', async () => {
    const tzId = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(`IANA timezone ID from host nodejs: ${tzId}`);
    const deviceTimezoneName = (await script.invoke(
      'getTimezoneName',
    )) as string;
    console.log(`device timezone name: ${deviceTimezoneName}`);
    if (!deviceTimezoneName) {
      fail(`Device timezone name is unimplemented.`);
    }
  });
});
