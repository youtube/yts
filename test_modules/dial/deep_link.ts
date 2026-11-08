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

import {Script} from 'google3/third_party/javascript/yts/devices/interfaces';
import {toDialDevice} from 'google3/third_party/javascript/yts/test_context';
import {sleep} from 'google3/third_party/javascript/yts/yts_common';

describe('YouTube DIAL', () => {
  let script: Script | undefined;

  afterEach(() => {
    if (script) {
      script.disconnect();
      script = undefined;
    }
  });

  yts.test({id: '24.3.1.1'});
  it('Passing Parameters to Running application', async () => {
    const device = await toDialDevice();
    script = await device.launchScript('test_modules/dial/scripts/scripts.js');
    await script.invoke('listenDeepLink');
    await device.launch('v=dMH0bHeiRNg');
    await sleep(5000);
    const deepLinks = (await script.invoke('getDeepLinks')) as string[];

    if (!deepLinks.length) {
      fail('window.h5vcc.runtime.onDeepLink event was never received.');
    } else {
      const lastDeepLink = deepLinks[deepLinks.length - 1];
      const url = new URL(lastDeepLink, 'https://youtube.com/tv');
      const params = url.searchParams;
      const v = params.get('v');
      if (v !== 'dMH0bHeiRNg') {
        fail(`Expected deep link to contain v=dMH0bHeiRNg but got v=${v}.`);
      }
      const inApp = params.get('inApp');
      if (inApp !== 'true') {
        fail(
          `Expected deep link to contain inApp=true but got inApp=${inApp}.`,
        );
      }
      const launch = params.get('launch');
      if (launch !== 'dial') {
        fail(
          `Expected deep link to contain launch=dial but got launch=${launch}.`,
        );
      }
    }
  }, 60_000);
});
