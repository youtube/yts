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
  DialDevice,
  Script,
} from 'google3/third_party/javascript/yts/devices/interfaces';
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

  /**
   * Tests the DIAL additionalDataUrl functionality. See comments below.
   *
   * Additional context:
   *
   * Original doc on additionalDataUrl:
   *  https://docs.google.com/document/d/1L57y5R823dWrHH07XDcNov3sWN2LpjLohlXX5yAi1c4/edit?tab=t.0
   *
   * DIAL spec:
   *  https://www.dial-multiscreen.org/dial/protocol-specification
   *
   **/
  yts.test({id: '24.2.1.1'});
  it('AdditionalDataURL', async () => {
    // Ensure the DUT is a DIAL device
    const device = (await toDialDevice()) as DialDevice;
    script = await device.launchScript();

    // Invoke getAdditionalDataUrl to ensure it exists then log it
    const addDataUrl = (await script.invoke('getAdditionalDataUrl')) as string;
    if (!addDataUrl) {
      throw new Error(`URL parameter "additionalDataUrl" was not provided.`);
    }
    console.log('additionalDataUrl: ', addDataUrl);

    // Sleep for 10 seconds to allow any additionalDataUrl POSTS sent by the
    // Kabuki launch to settle
    console.log(
      'Sleeping for 10 seconds to allow YouTube launch POSTS to finish...',
    );
    await sleep(10_000);

    // Invoke postAdditionalData, which sends random data to the additionalDataUrl
    // and returns the data that was sent back to this test
    const data = (await script.invoke('postAdditionalData')) as string;
    const i = data.indexOf('=');
    const key = decodeURIComponent(data.substring(0, i));
    const value = decodeURIComponent(data.substring(i + 1));

    // Retrieve additionalData from the YouTube appStatus response
    const appStatus = await device.appStatus('YouTube');
    const additionalData = appStatus.service.additionalData;
    if (!additionalData) {
      throw new Error(
        `App status response didn't contain additionalData property.`,
      );
    }

    // Ensure that the key value pair returned by the appStatus response
    // matches the key value pair that was sent to the additionalDataUrl
    const actual = additionalData?.[0]?.[key]?.[0];
    if (!actual) {
      fail(
        `Posted key '${key}' to additionalDataUrl but additionalData received from app status didn't contain that key.`,
      );
    }
    if (actual !== value) {
      fail(
        `Posted value '${value}' to additionalDataUrl but got value '${actual}' from app status. Expected the two values to match.`,
      );
    }
  }, 60_000);
});
