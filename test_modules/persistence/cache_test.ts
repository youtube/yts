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

import {
  Device,
  Script,
} from 'google3/third_party/javascript/yts/devices/interfaces';
import {deviceUnderTest} from 'google3/third_party/javascript/yts/test_context';
import {exitCobalt} from 'google3/third_party/javascript/yts/test_utils/host/launch_util';
import {
  VerifyTestResponse,
  WriteTestResponse,
} from 'google3/third_party/javascript/yts/yts_common/h5vcc';
const SECOND = 1000;
const MINUTE = SECOND * 60;
const TWENTY_FOUR_MB = 24 * 10 ** 6;

describe('Persistence', () => {
  let script: Script | undefined | void;
  let device!: Device;

  beforeEach(async () => {
    device = await deviceUnderTest();
  });

  async function launchCobalt(): Promise<void> {
    console.log('launchCobalt');
    script = await device.launchScript(
      'test_modules/persistence/scripts/scripts.js',
    );
  }

  describe('Cache', () => {
    yts.test({id: '2868E4A2-308C-4AA9-BEA9-AABDFAA22358'});
    it(
      'persists 24 MBytes in storage cache through Cobalt restart',
      async () => {
        await launchCobalt();
        const write = (await script!.invoke('writeCache')) as WriteTestResponse;
        console.log('writeTest: ', JSON.stringify(write));
        expect(write.bytes_written).toEqual(TWENTY_FOUR_MB);
        expect(write.error).toEqual('');
        await exitCobalt();
        await launchCobalt();
        const verify = (await script!.invoke(
          'verifyCache',
        )) as VerifyTestResponse;
        console.log('verifyTest: ', JSON.stringify(verify));
        expect(verify.verified)
          .withContext('verifyTest.verified (i.e. data is uncorrupted)')
          .toBeTrue();
        expect(verify.bytes_read).toEqual(TWENTY_FOUR_MB);
        expect(verify.error).toEqual('');
        await exitCobalt();
      },
      MINUTE * 5,
    );
  });
});
