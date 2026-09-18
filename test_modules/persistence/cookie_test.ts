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
import {sleep} from 'google3/third_party/javascript/yts/yts_common';
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const ON_OFF_TIMES = 200;

describe('Persistence', () => {
  let script!: Script;
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

  function getCookieValueByKey(cookie: string, key: string) {
    return cookie
      .split(';')
      .find((row) => row.startsWith(`${key}=`))
      ?.split('=')[1];
  }

  describe('Cookie', () => {
    yts.test({id: '0BFECC1B-79B2-45DC-AE79-8004E22E9F56'});
    it(
      'clears cookie with expiration time of 1 minute',
      async () => {
        await launchCobalt();
        await script.invoke('clearAllCookies');
        await script.invoke('setCookie1Min');
        const initialCookie = (await script.invoke('getCookie')) as string;
        expect(initialCookie.includes('PERSIST_1Min')).toBeTrue();
        await sleep(MINUTE * 1);
        const currentCookie = (await script.invoke('getCookie')) as string;
        expect(currentCookie.includes('PERSIST_1Min')).toBeFalse();
        await exitCobalt();
      },
      MINUTE * 5,
    );

    yts.test({id: 'CA2D8A58-A3CE-4867-B1A6-8EC3DDB13E85'});
    it(
      'keeps cookie intact after waiting for 1 minute',
      async () => {
        await launchCobalt();
        await script.invoke('clearAllCookies');
        await script.invoke('setCookie24H');
        const initialCookie = (await script.invoke('getCookie')) as string;
        expect(initialCookie.includes('PERSIST_24H')).toBeTrue();
        await sleep(MINUTE * 1);
        const currentCookie = (await script.invoke('getCookie')) as string;
        expect(currentCookie).toEqual(initialCookie);
        await exitCobalt();
      },
      MINUTE * 5,
    );

    yts.test({id: '05531D06-68E4-4822-8E2E-72BD5C0FEB25'});
    it(
      'keeps cookie intact after 200 times of device on/off',
      async () => {
        await launchCobalt();
        let startIteration = 0;
        // Check if there is loop number stored in cookie at the beginning of test
        // setup.
        const loopNumber = (await script.invoke(
          'getCookieByKey',
          'LoopNumber',
        )) as string;
        // If the device is able to read the loop number, we admit it persist the
        // cookie rules and allow this retry to continue from where it failed in
        // the previous run.
        if (loopNumber) {
          // Unary operator to convert string to number
          startIteration = +loopNumber;
          console.log(
            `Device "${device.shortId}" resumed cookie persistence at ${
              startIteration + 1
            } iteration.`,
          );
        }
        await script.invoke('clearAllCookies');
        await script.invoke('setCookie24H');
        const initialCookie = (await script.invoke('getCookie')) as string;
        const initialPersist24HCookieValue = getCookieValueByKey(
          initialCookie,
          'PERSIST_24H',
        );
        for (let i = startIteration; i < ON_OFF_TIMES; i++) {
          await exitCobalt();
          await sleep(SECOND * 1);
          await launchCobalt();
          console.log(`Restarting Cobalt ${i + 1} of ${ON_OFF_TIMES} times.`);
          // Add loop number to cookie for paused or failed test to continue in
          // upcoming retry.
          await script.invoke('setLoopNumberInCookie', i);
          const currentCookie = (await script.invoke('getCookie')) as string;
          const currentPersist24HCookieValue = getCookieValueByKey(
            currentCookie,
            'PERSIST_24H',
          );

          if (currentPersist24HCookieValue !== initialPersist24HCookieValue) {
            throw new Error(
              `Device "${device.shortId}" lost cookie persistence at ${i + 1} iteration.`,
            );
          }
        }
        await exitCobalt();
      },
      HOUR * 2,
    );
  });
});
