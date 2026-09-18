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
import {exitCobalt} from 'google3/third_party/javascript/yts/test_utils/host/launch_util';
import {sleep} from 'google3/third_party/javascript/yts/yts_common';

function seconds(x: number) {
  return x * 1000;
}

function minutes(x: number) {
  return seconds(x * 60);
}

describe('Device Lifecycle', () => {
  let script!: Script;
  let device!: Device;

  beforeEach(async () => {
    device = await deviceUnderTest();
  });

  async function launchCobalt(): Promise<void> {
    console.log('launchCobalt');
    script = await device.launchScript(
      'test_modules/device_lifecycle/scripts/scripts.js',
    );
  }

  describe('Preload', () => {
    yts.test({id: '2036EE71-1D7F-4978-9F8D-907293F93571'});
    it(
      'Preloads YouTube',
      async () => {
        await launchCobalt();
        await sleep(seconds(3));
        await script.invoke('recordPerformanceEntry');
        const cobaltURL = (await script.invoke('getCobaltURL')) as string;
        const launchParam = new URL(cobaltURL).searchParams.get('launch');
        expect(launchParam)
          .withContext('launch query param should be launch=preload')
          .toEqual('preload');

        const appStart = Number(await script.invoke('getAppStart'));
        const appPreload = Number(await script.invoke('getAppPreload'));
        console.log(`appPreload=${appPreload}`);
        console.log(`appStart=${appStart}`);

        expect(appPreload).withContext('appPreload timestamp').not.toEqual(0);
        expect(appStart - appPreload)
          .withContext('Time from appPreload timestamp to appStart timestamp')
          .toBeGreaterThan(0);

        await script.invoke('clearPerformanceEntry');
        await exitCobalt();
      },
      minutes(5),
    );

    yts.test({id: '81133464-B127-402A-AE8E-2AECCC194A40'});
    it(
      'Negative Preload',
      async () => {
        await launchCobalt();
        await sleep(seconds(3));
        await script.invoke('recordPerformanceEntry');
        const cobaltURL = (await script.invoke('getCobaltURL')) as string;
        const launchParam = new URL(cobaltURL).searchParams.get('launch');
        expect(launchParam)
          .withContext('launch query param should not be launch=preload')
          .not.toContain('preload');

        const appStart = Number(await script.invoke('getAppStart'));
        const appPreload = Number(await script.invoke('getAppPreload'));
        console.log(`appPreload=${appPreload}`);
        console.log(`appStart=${appStart}`);

        expect(appPreload).withContext('appPreload timestamp').toBeFalsy();
        expect(appStart).withContext('appStart timestamp').not.toEqual(0);

        await script.invoke('clearPerformanceEntry');
        await exitCobalt();
      },
      minutes(5),
    );
  });
});
