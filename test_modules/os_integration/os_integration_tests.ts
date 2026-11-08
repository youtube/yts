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
import {
  deviceUnderTest,
  getDefaultAgentUrl,
} from 'google3/third_party/javascript/yts/test_context';
import {exitCobalt} from 'google3/third_party/javascript/yts/test_utils/host/launch_util';
import {sleep} from 'google3/third_party/javascript/yts/yts_common';
function seconds(x: number) {
  return x * 1000;
}

function minutes(x: number) {
  return seconds(x * 60);
}

describe('OS Integration', () => {
  let script!: Script;
  let device!: Device;

  beforeEach(async () => {
    device = await deviceUnderTest();
    if (device.deviceType === 'dial') {
      fail(
        'DialDevice can not run the test due to unsupported methods like stop()',
      );
    }
  });

  async function launchCobalt(agentUrl?: string): Promise<void> {
    console.debug('launchCobalt');
    script = await device.launchScript({
      scriptModule: 'test_modules/os_integration/scripts/scripts.js',
      agentUrl,
      reconnectTimeoutOverride: minutes(10),
    });
  }

  async function suspendCobalt(): Promise<void> {
    try {
      await device.suspend();
    } catch (e: unknown) {
      console.log('Ignoring error happened while trying to suspend Cobalt:');
      console.log(e);
    }
    await sleep(seconds(3));
  }

  async function resumeCobalt(): Promise<void> {
    try {
      await device.resume();
    } catch (e: unknown) {
      console.log('Ignoring error happened while trying to resume Cobalt:');
      console.log(e);
    }
    await sleep(seconds(3));
  }

  // This test is meaningful when run after app update to verify that the update
  // did not wipe out app data.
  describe('Storage', () => {
    yts.test({id: '0da26958-53c3-45ed-8d28-4492d4d5cb95'});
    it(
      'Checks that storage is sane after updates',
      async () => {
        const script = await device.launchScript({
          agentUrl: 'https://www.youtube.com/tv?automationRoutine=yts',
        });
        expect(await script.invoke('hasStorageIssues')).toEqual(false);
        await exitCobalt();
      },
      minutes(10),
    );
  });

  describe('Reset', () => {
    yts.test({id: '56763e81-1624-499e-8ed4-5eff868f3e5f'});
    it(
      'resets setting selections',
      async () => {
        // 1. Launch Cobalt and populate search history
        await launchCobalt();

        const testQuery =
          'test_query_' + Math.random().toString(36).substring(2, 7);
        await script.invoke('populateSearchHistory', testQuery);

        // Verify search history exists in Kabuki BEFORE the reboot
        const preExitState = await script.invoke('hasSearchHistory', testQuery);
        expect(preExitState).toEqual(true);

        // 2. Exit and relaunch to verify persistence of history before reset
        await exitCobalt();
        await launchCobalt();

        const postRelaunchState = await script.invoke(
          'hasSearchHistory',
          testQuery,
        );
        expect(postRelaunchState).toEqual(true);

        // 3. Trigger App Reset
        void script.invoke('resetApp');
        await sleep(seconds(5));

        // 4. Exit and relaunch to verify all history was wiped
        await exitCobalt();
        await launchCobalt();

        const testResult = await script.invoke('verifyAppReset');
        expect(testResult).toEqual(true);
        await exitCobalt();
      },
      minutes(10),
    );
  });

  describe('Suspend', () => {
    yts.test({id: '3d8f2a12-e0a5-4cc4-858e-d618ecd55d1e'});
    it(
      'remains in the same page after suspend and resume',
      async () => {
        const script = await device.launchScript({
          agentUrl:
            'https://www.youtube.com/tv?automationRoutine=yts&use_toa=true',
        });
        await script.invoke('addSuspendTestToken');
        await suspendCobalt();
        await resumeCobalt();
        await script.invoke('suspendTestTokenExists');
        await exitCobalt();
      },
      minutes(10),
    );
  });

  describe('URL Parameters', () => {
    yts.test({id: 'F4240EB1-9E02-4C1E-93A2-911268A56E00'});
    it(
      'preserves random parameters in window.location.search',
      async () => {
        // 1. Generate random parameters
        const randomParams: {[key: string]: string} = {};
        for (let i = 0; i < 3; i++) {
          const randStr = Math.random().toString(36);
          const key = 'test_param_' + randStr.substring(2, 7);
          const value = Math.random().toString(36).substring(2, 7);
          randomParams[key] = value;
          console.log(`Adding parameter: ${key} = ${value}`);
        }

        const url = getDefaultAgentUrl();
        for (const [key, value] of Object.entries(randomParams)) {
          url.searchParams.set(key, value);
        }
        const agentUrl = url.toString();
        console.log(`\nLaunching test with ${agentUrl}`);
        await launchCobalt(agentUrl);
        await sleep(seconds(5));

        // 2. Retrieve location search from the agent
        const locationSearch = (await script.invoke(
          'readProp',
          'location.search',
        )) as string | undefined;

        if (!locationSearch) {
          fail('window.location.search was empty.');
        } else {
          console.log(`window.location.search: ${locationSearch}`);

          const receivedParams = new URLSearchParams(locationSearch);
          console.log('Received parameters:');
          for (const [key, value] of receivedParams.entries()) {
            console.log(`  ${key} = ${value}`);
          }
          for (const [key, value] of Object.entries(randomParams)) {
            const receivedValue = receivedParams.get(key);
            if (receivedValue === null) {
              fail(
                `Parameter not found: '${key}'. Expected value: '${value}'.`,
              );
            } else {
              expect(receivedValue).toEqual(value);
            }
          }
        }

        // 3. Cleanup and Exit Cobalt
        await exitCobalt();
      },
      minutes(2),
    );
  });
});

// Separate OS integration block that can be run on DIAL devices
describe('OS Integration', () => {
  let script!: Script;
  let device!: Device;

  beforeEach(async () => {
    device = await deviceUnderTest();
  });

  async function launchCobalt(): Promise<void> {
    console.debug('launchCobalt');
    script = await device.launchScript({
      scriptModule: 'test_modules/os_integration/scripts/scripts.js',
      reconnectTimeoutOverride: minutes(10),
    });
  }

  describe('Friendly Name', () => {
    yts.test({id: 'f2b8f888-2975-4d7a-8f5b-9d4352b9b7ea'});
    it(
      'Checks that friendly name is exposed and valid',
      async () => {
        if (device.deviceType === 'dial') {
          await device.rediscover();
        }
        await launchCobalt();
        const friendlyName = (await script.invoke('getFriendlyName')) as
          | string
          | null;
        console.log(`Cobalt Friendly Name: "${friendlyName}"`);
        console.log(`Device Name: "${device.name}"`);
        if (friendlyName === null || friendlyName === undefined) {
          fail('Friendly name is not exposed by Cobalt');
          await exitCobalt();
          return;
        }

        expect(friendlyName.length).toBeGreaterThan(0);

        expect(device.name).toBeDefined();
        expect(device.name.toLowerCase()).toContain(friendlyName.toLowerCase());
        await exitCobalt();
      },
      minutes(2),
    );
  });
});
