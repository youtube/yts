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
  isDialDevice,
} from 'google3/third_party/javascript/yts/devices/interfaces';
import {
  deviceUnderTest,
  toDialDevice,
} from 'google3/third_party/javascript/yts/test_context';
import {parseXml} from 'google3/third_party/javascript/yts/yts_common/xml';
import * as http from 'http';

const CUSTOM_TIMEOUT_MS = 10_000;

function get(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const request = http.request(
      url,
      {
        method: 'GET',
        headers: {'Origin': 'https://www.youtube.com'},
      },
      (response) => {
        let responseBody = '';
        response.on('data', (chunk) => {
          responseBody += chunk;
        });
        response.on('end', () => {
          const code = response.statusCode;
          if (code && code >= 200 && code < 300) {
            resolve(responseBody);
          } else {
            reject(new Error(`${code} ${response.statusMessage}.`));
          }
        });
      },
    );
    request.on('error', reject);
    request.end();
  });
}

interface UpnpDeviceDescriptionXml {
  root: {device: UpnpDeviceItemXml[]};
}

interface UpnpDeviceItemXml {
  friendlyName: string[];
  manufacturer: string[];
  modelName: string[];
}

// from third_party/javascript/yts/functional/functionalTest.js
const USER_AGENT_REGEX =
  /([-\\.A-Za-z0-9\\\/]*)_([-\\.A-Za-z0-9\\\/]*)_([-\\.A-Za-z0-9\\\/]*) ?\/ ?[-_\\.A-Za-z0-9\\]* \(([-_\\.A-Za-z0-9\\\/ ]+), ?([^,]*)?([WIREDLSwiredls, \\\/]*)\)/;

// Wake on lan property format
const WAKE_UP_REGEX = new RegExp('MAC=([a-zA-Z0-9:]*);Timeout=([0-9]*)');

describe('YouTube DIAL', () => {
  let script: Script | undefined;

  afterEach(() => {
    if (script) {
      script.disconnect();
      script = undefined;
    }
  });

  yts.test({id: '24.4.1.1'});
  it('Device Description', async () => {
    const device = (await toDialDevice()) as DialDevice;
    script = await device.launchScript('test_modules/dial/scripts/scripts.js');
    const userAgent = (await script.invoke('getUserAgent')) as string;

    const matches = USER_AGENT_REGEX.exec(userAgent);
    if (!matches) {
      throw new Error('User agent was not in correct format.');
    }

    const uaBrand = matches[4];
    const uaModel = matches[5];

    const descXml = await get(device.location);
    const desc = (await parseXml(descXml)) as UpnpDeviceDescriptionXml;
    const upnpDesc = desc.root?.device?.[0];
    const upnpFriendlyName = upnpDesc?.friendlyName?.[0];
    const upnpManufacturer = upnpDesc?.manufacturer?.[0];
    const upnpModelName = upnpDesc?.modelName?.[0];

    if (!upnpFriendlyName) {
      fail(
        `friendlyName property is missing or empty in UPnP device description`,
      );
    }
    if (upnpManufacturer.toLocaleUpperCase() !== uaBrand.toLocaleUpperCase()) {
      fail(
        `manufacturer defined in UPnP device description (${upnpManufacturer}) doesn't match brand defined in user agent (${uaBrand})`,
      );
    }
    if (upnpModelName.toLocaleUpperCase() !== uaModel.toLocaleUpperCase()) {
      fail(
        `model name defined in UPnP device description (${upnpModelName}) doesn't match model defined in user agent (${uaModel})`,
      );
    }
  }, 60_000);

  yts.test({id: '24.5.1.1'});
  it('WakeUp Protocol', async () => {
    const device = await toDialDevice();
    if (!device.wakeup) {
      console.warn(
        'Device did not have WAKEUP header. Rediscovering DIAL device using IP address and SSDP.',
      );
      await device.rediscover();
    }
    if (!device.wakeup) {
      fail('Expect WAKEUP header to be presented during DIAL discover.');
    } else {
      console.log(`Found WAKEUP header: "${device.wakeup}"`);
    }
    const wakeupProperty = device.wakeup!.match(WAKE_UP_REGEX);
    expect(wakeupProperty)
      .withContext('Expect WAKEUP header to be presented during discover.')
      .not.toBeNull();
    expect(wakeupProperty!.length)
      .withContext('Expect WAKEUP header to contain MAC and Timeout variables.')
      .toBe(3);
  });

  yts.test({id: '28202266-9555-47D2-B272-B9AD03619497'});
  it(
    'Negative DIAL',
    async () => {
      let device = await deviceUnderTest();
      try {
        if (!isDialDevice(device)) {
          // Even if the device isn't currently using a DIAL connection, it may
          // still be supporting DIAL. Attempt to reconstruct as DIAL device to
          // ensure it's not a DIAL device.
          console.log(
            'Constructing DIAL device object using IP address and SSDP.',
          );
          device = await toDialDevice(device);
        }
      } catch (e) {
        // Encountering an error is a good sign since we don't want the device
        // to support DIAL. Swallow the error and continue validations.
      }

      if (!isDialDevice(device)) {
        console.log(
          'Device does not support DIAL: Could not construct device object from SSDP response.',
        );
        return;
      }

      if (!device.location) {
        console.log(
          `Device does not support DIAL: "location" header is missing.`,
        );
        return;
      } else {
        console.log(`location header is present: ${device.location}`);
      }

      if (!device.appUrl) {
        console.log(
          `Device does not support DIAL: "application-url" header is missing.`,
        );
        return;
      } else {
        console.log(`application-url header is present: ${device.appUrl}`);
      }

      console.log(
        `Querying ${device.resourceUrl('YouTube')} (expecting invalid response).`,
      );
      const hasYouTube = await device.checkYouTubeApp();
      expect(hasYouTube)
        .withContext(
          "Device supports launching YouTube with DIAL when it shouldn't",
        )
        .toBeFalse();
    },
    CUSTOM_TIMEOUT_MS,
  );

  yts.test({id: '958468F4-BA22-442C-869F-8BF28B2D2313'});
  it('Negative Wake On LAN', async () => {
    const device = await toDialDevice();
    if (!device.wakeup) {
      console.warn(
        'Device did not have WAKEUP header. Rediscovering DIAL device using IP address and SSDP.',
      );
      await device.rediscover();
    }
    expect(device.wakeup)
      .withContext('Expect WAKEUP header to be missing during DIAL discover.')
      .toBeFalsy();
  });
});
