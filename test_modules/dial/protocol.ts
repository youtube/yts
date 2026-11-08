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

/**
 * @fileoverview This is a collection of DIAL certification tests. Prior to
 * having the tests here, we were using GitHub repo
 * https://github.com/Netflix/dial-reference/ with YouTube-specific adjustments
 * hosted at
 * https://storage.googleapis.com/ytlr-cert.appspot.com/yt_dial_tests_2021.patch.
 */

import 'yts';

import {DialDevice} from 'google3/third_party/javascript/yts/devices/interfaces';
import {toDialDevice} from 'google3/third_party/javascript/yts/test_context';
import * as http from 'http';

const TIME_TO_WAIT_FOR_STATE_CHANGE = 5000;

let device: () => DialDevice = () => {
  throw new Error('Never happens because device is set inside beforeAll.');
};

function printHeaders(headers: object | undefined) {
  if (!headers) return;
  console.log(
    Object.entries(headers)
      .map(([name, value]) => `${name}: ${value}`)
      .join('\n'),
  );
}

function request(
  url: string,
  options: http.RequestOptions = {},
  body?: string | Buffer,
): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    const method = options.method || 'GET';
    console.log(`${method} ${url}`);
    printHeaders(options.headers);
    console.log('');
    const request = http.request(url, options, (res) => {
      console.log(`${res.statusCode} ${res.statusMessage}`);
      printHeaders(res.headers);
      console.log('');
      resolve(res);
    });
    request.on('error', reject);
    request.end(body);
  });
}

function stateChanged() {
  return new Promise((resolve) => {
    setTimeout(resolve, TIME_TO_WAIT_FOR_STATE_CHANGE);
  });
}

function registerDialTests(app: string) {
  const stopApp = async () => {
    const stopUrl = await device().stopUrl(app);
    const headers = baseHeaders();
    const response = await request(stopUrl, {method: 'DELETE', headers});
    return response;
  };

  const stopAndWait = async () => {
    const response = await stopApp();
    await stateChanged();
    await assertState('stopped');
    return response;
  };

  const ensureStopped = async () => {
    const state = await getState();
    if (state === 'stopped') return;
    await stopAndWait();
  };

  async function assertState(expected: string) {
    const actual = await getState();
    if (actual !== expected) {
      throw new Error(
        `Expected app status to be '${expected}' but got '${actual}'.`,
      );
    }
  }

  const launchApp = (options?: {app?: string; payload?: string}) => {
    const resUrl = device().resourceUrl(options?.app || app);
    const headers = baseHeaders();
    headers['Content-Type'] = 'text/plain;charset="utf-8"';
    const payload = options?.payload;
    if (!payload) {
      headers['Content-Length'] = '0';
    }
    return request(resUrl, {method: 'POST', headers}, payload);
  };

  const launchAndWait = async (payload?: string) => {
    const response = await launchApp({payload});
    await stateChanged();
    await assertState('running');
    return response;
  };

  const hideApp = async () => {
    const resUrl = device().resourceUrl(app);
    const status = await device().appStatus(app);
    const href = device().href(status);
    const hideUrl = `${resUrl}/${href}/hide`;
    const headers = baseHeaders();
    const response = await request(hideUrl, {method: 'POST', headers});
    if (response.statusCode === 501) {
      throw new Error('/hide request returned 501 Not Implemented.');
    }
    return response;
  };

  const hideAndWait = async () => {
    const response = await hideApp();
    await stateChanged();
    await assertState('hidden');
    return response;
  };

  const ensureHidden = async () => {
    const state = await getState();
    if (state === 'hidden') return;
    if (state === 'stopped') {
      await launchAndWait();
    }
    await hideAndWait();
  };

  function baseHeaders(): {[name: string]: string} {
    return {'ORIGIN': 'https://www.youtube.com'};
  }

  async function getState(clientDialVer = '2.1') {
    const status = await device().appStatus(app, clientDialVer);
    return status.service.state?.[0];
  }

  describe(`${app} DIAL`, () => {
    beforeAll(async () => {
      const dialDevice = (await toDialDevice()) as DialDevice;
      device = () => {
        return dialDevice;
      };
    });

    describe('Protocol Compliance', () => {
      const setTestId = (ids: {[app: string]: string}) => {
        const id = ids[app];
        if (id) {
          yts.test({id});
        }
      };

      let defaultTimeout: number | undefined;

      beforeAll(() => {
        defaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = TIME_TO_WAIT_FOR_STATE_CHANGE * 10;
      });

      afterAll(() => {
        if (defaultTimeout != null) {
          jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout;
        }
      });

      setTestId({
        'YouTube': '24.1.1.1',
        'YouTubeKids': '18A3D5E5-5AFB-4B54-96FA-D88161CDD997',
        'YouTubeTV': '65F5E35C-7A76-4FAB-BB76-1DE2E175D8CA',
      });
      it('launch application with invalid CORS', async () => {
        await ensureStopped();
        const resUrl = device().resourceUrl(app);

        async function checkOrigin(origin: string) {
          const response = await request(resUrl, {
            method: 'POST',
            headers: {'Origin': origin},
          });
          const message = `Unexpected status code. Tried to launch application from Origin: ${origin}. Per DIAL Requirement 6.6 and the YouTube Technical Requirements, only requests with the ORIGIN header set to https://*.youtube.com or package:* can be allowed.`;
          expect(response.statusCode).withContext(message).toBe(403);
        }

        await checkOrigin('https://www.evil.com');
        await checkOrigin('http://www.evil.com');
        await checkOrigin('https://www.google.com');
        await checkOrigin('https://www.netflix.com');
        await checkOrigin('http://www.netflix.com');
        await checkOrigin('https://youtube.evil.com');
        await checkOrigin('netflix');
        await checkOrigin('youtube');
        await checkOrigin('http://www.youtube.com');
      });

      setTestId({
        'YouTube': '24.1.2.1',
        'YouTubeKids': '94372764-0D86-4CBD-A78D-826D39D4C1CF',
        'YouTubeTV': '833B4536-4061-4922-ACB9-F01313E753BC',
      });
      it('launch application with valid CORS', async () => {
        const resUrl = device().resourceUrl(app);

        async function checkOrigin(origin: string, checkHeaders: boolean) {
          await ensureStopped();
          const response = await request(resUrl, {
            method: 'POST',
            headers: {'Origin': origin},
          });
          const message1 = `Unexpected status code. Tried to launch application from valid Origin: ${origin}.`;
          expect(response.statusCode).withContext(message1).toBe(201);
          if (checkHeaders) {
            const message2 = `Tried to launch application from valid Origin: ${origin}. Expected accepted request to include the ACCESS-CONTROL-ALLOW-ORIGIN header but no header was present.`;
            expect('access-control-allow-origin' in response.headers)
              .withContext(message2)
              .toBe(true);
          }
          await stateChanged();
        }

        await checkOrigin('https://www.youtube.com', /*checkHeaders*/ true);
        await checkOrigin('https://dial.youtube.com', /*checkHeaders*/ true);
        await checkOrigin('package: com.youtube.app', /*checkHeaders*/ false);
      });

      setTestId({
        'YouTube': '24.1.3.1',
        'YouTubeKids': 'B837EC30-A331-47F6-B171-0656402FA307',
        'YouTubeTV': '563100F5-7290-4921-B81B-970EDD205DB8',
      });
      it('launch application without origin header', async () => {
        await ensureStopped();
        const resUrl = device().resourceUrl(app);
        const response = await request(resUrl, {method: 'POST'});
        const message =
          'Unexpected status code. Per the YouTube Technical Requirements, only requests with the ORIGIN header set to https://*.youtube.com or package:* can be allowed.';
        expect(response.statusCode).withContext(message).toBe(403);
      });

      setTestId({
        'YouTube': '24.1.4.1',
        'YouTubeKids': 'CCFFDAD4-89C3-4C59-9E99-DCDFC88CCA1E',
        'YouTubeTV': '7E43BFCB-198A-47A5-A361-BCD8E4CBA453',
      });
      it('launch application not recognized', async () => {
        await ensureStopped();
        const response = await launchApp({app: 'ApplicationNotRecognized'});
        expect(response.statusCode)
          .withContext('launch request returned unexpected status code')
          .toBe(404);
      });

      setTestId({
        'YouTube': '24.1.5.1',
        'YouTubeKids': 'FA5227C4-0750-4AD6-B220-9F03FA85E08F',
        'YouTubeTV': 'D15B6929-42DE-480A-B31D-F5144EA9DC94',
      });
      it('launch application in running state with no payload', async () => {
        await launchAndWait();
        const response = await launchAndWait();
        expect(response.statusCode)
          .withContext('launch request returned unexpected status code')
          .toBe(200);
      });

      setTestId({
        'YouTube': '24.1.6.1',
        'YouTubeKids': '70B3FF7F-DA15-4787-8B08-147E46AED8FE',
        'YouTubeTV': 'AED0BCEC-F6CB-4809-8467-F0189CD30ACF',
      });
      it('launch application in running state with payload', async () => {
        await launchAndWait();
        const response = await launchAndWait('key1=val1&key2=val2');
        expect(response.statusCode)
          .withContext('launch request returned unexpected status code')
          .toBe(200);
      });

      setTestId({
        'YouTube': '24.1.7.1',
        'YouTubeKids': '2A622EDE-344D-469F-866C-81B5F1C10F00',
        'YouTubeTV': '42E9A656-DC51-4A2C-8EBB-9616E42A3377',
      });
      it('launch application in stopped state with no payload', async () => {
        await ensureStopped();
        const response = await launchAndWait();
        expect(response.statusCode)
          .withContext('launch request returned unexpected status code')
          .toBe(201);
      });

      setTestId({
        'YouTube': '24.1.8.1',
        'YouTubeKids': 'C1DF6AEF-4153-4440-A025-51DD5A72D887',
        'YouTubeTV': 'DA2B716F-3AAA-4E94-93C8-168BBE55BF11',
      });
      it('launch application in stopped state with payload', async () => {
        await ensureStopped();
        const response = await launchAndWait('key1=val1&key2=val2');
        expect(response.statusCode)
          .withContext('launch request returned unexpected status code')
          .toBe(201);
      });

      setTestId({
        'YouTube': '24.1.9.1',
        'YouTubeKids': '3C175FA2-D3BE-4E5D-BE49-3FF6CC34E7F9',
        'YouTubeTV': 'C9A1FBC7-5353-4AA4-9896-FEC9F434547C',
      });
      it('launch application in hidden state with no payload', async () => {
        await ensureHidden();
        const response = await launchAndWait();
        expect(response.statusCode)
          .withContext('launch request returned unexpected status code')
          .toBe(201);
      });

      setTestId({
        'YouTube': '24.1.10.1',
        'YouTubeKids': 'CFC9A053-0B2F-46C8-86A4-49DF75FEBF60',
        'YouTubeTV': 'D0A1FADF-B5CA-420E-ACA5-4390F085C2EB',
      });
      it('launch application in hidden state with payload', async () => {
        await ensureHidden();
        const response = await launchAndWait('key1=val1&key2=val2');
        expect(response.statusCode)
          .withContext('launch request returned unexpected status code')
          .toBe(201);
      });

      setTestId({
        'YouTube': '24.1.11.1',
        'YouTubeKids': '421E770B-77F9-4382-8144-56B30DD4D6F8',
        'YouTubeTV': 'C857DB1D-14A9-4F0D-9AD0-BFED0CA5842',
      });
      it('launch application with excess payload', async () => {
        await ensureStopped();
        const payload = new Array(517).fill('key=value').join('&');
        const response = await launchApp({payload});
        expect(response.statusCode)
          .withContext(`launch request returned unexpected status code`)
          .toBe(413);
      });

      setTestId({
        'YouTube': '24.1.12.1',
        'YouTubeKids': 'EDF262B4-463B-4F31-8FFE-3AFE55CD70DB',
        'YouTubeTV': 'C85E891D-7F1C-4E72-A954-FA28C108DFA0',
      });
      it('stop invalid application instance', async () => {
        await launchAndWait();
        const resUrl = device().resourceUrl(app);
        const instanceUrl = resUrl + '/xyz';
        const headers = baseHeaders();
        const response = await request(instanceUrl, {
          method: 'DELETE',
          headers,
        });
        expect(response.statusCode)
          .withContext(`stop request returned unexpected status code`)
          .toBe(404);
      });

      setTestId({
        'YouTube': '24.1.13.1',
        'YouTubeKids': '0CA760DC-9C96-4EE8-89A5-C5EAECAC4D3B',
        'YouTubeTV': '9C347688-1793-48A4-BDC2-7D9C3C997D8A',
      });
      it('stop application in running state', async () => {
        await launchAndWait();
        const response = await stopAndWait();
        expect(response.statusCode)
          .withContext(`stop request returned unexpected status code`)
          .toBe(200);
      });

      setTestId({
        'YouTube': '24.1.14.1',
        'YouTubeKids': '2AEC0112-99C3-4EFF-BA0F-405EBD0CAB68',
        'YouTubeTV': '4FF63A49-DD43-49C3-8677-7BC9CC0C2825',
      });
      it('stop application in stopped state', async () => {
        await launchAndWait();
        const stopUrl = await device().stopUrl(app);
        await stopAndWait();
        const headers = baseHeaders();
        const response = await request(stopUrl, {method: 'DELETE', headers});
        expect(response.statusCode)
          .withContext(`stop request returned unexpected status code`)
          .toBe(404);
        await assertState('stopped');
      });

      setTestId({
        'YouTube': '24.1.15.1',
        'YouTubeKids': 'DA5E577E-A734-4C08-A1DF-A77B9BD28CBA',
        'YouTubeTV': 'A1A1FDA5-E052-453F-99F8-CDFD53D222A2',
      });
      it('stop application in hidden state', async () => {
        await ensureHidden();
        const response = await stopAndWait();
        expect(response.statusCode)
          .withContext(`stop request returned unexpected status code`)
          .toBe(200);
      });

      setTestId({
        'YouTube': '24.1.16.1',
        'YouTubeKids': '53FC0DEB-5A11-4B08-B25E-D5CA8583276D',
        'YouTubeTV': 'F50D5EAA-F26A-470A-B3F2-27D062191206',
      });
      it('hide application in hidden state', async () => {
        await ensureHidden();
        const response = await hideAndWait();
        expect(response.statusCode)
          .withContext(`hide request returned unexpected status code`)
          .toBe(200);
      });

      setTestId({
        'YouTube': '24.1.17.1',
        'YouTubeKids': 'F7777AB8-9691-42CF-8113-90711F7466C3',
        'YouTubeTV': 'C8B750C6-D2B9-4130-94AB-8B739294718A',
      });
      it('hide application in running state', async () => {
        await launchAndWait();
        const response = await hideAndWait();
        expect(response.statusCode)
          .withContext(`hide request returned unexpected status code`)
          .toBe(200);
      });

      setTestId({
        'YouTube': '24.1.18.1',
        'YouTubeKids': '60C5C650-8FA6-4141-8002-43DD66BEBD2E',
        'YouTubeTV': 'A1A1B04D-D872-4AF6-800B-0973DACD0144',
      });
      it('receive state response in hidden state', async () => {
        await launchAndWait();
        await hideApp();
        await stateChanged();

        console.log(`requesting app state without any ?clientDialVer=`);
        const state20 = await getState('');
        if (state20 === 'stopped') {
          console.log(`correct state: ${state20}`);
        } else {
          console.log(`incorrect state: ${state20}`);
          fail(
            `Expected app state to be 'stopped' but got '${state20}'. Per DIAL 2.1 spec paragraph 6.1.2, state of a hidden app should return as 'stopped' if client doesn't set clientDialVer=2.1 or higher on the state GET request.`,
          );
        }

        console.log(`requesting app state with ?clientDialVer=2.1`);
        const state21 = await getState('2.1');
        if (state21 === 'hidden') {
          console.log(`correct state: ${state21}`);
        } else {
          console.log(`incorrect state: ${state21}`);
          fail(`Expected app state to be 'hidden' but got '${state21}'.`);
        }

        console.log(`requesting app state with ?clientDialVer=2.2`);
        const state22 = await getState('2.2');
        if (state22 === 'hidden') {
          console.log(`correct state: ${state22}`);
        } else {
          console.log(`incorrect state: ${state22}`);
          fail(`Expected app state to be 'stopped' but got '${state22}'.`);
        }
      });
    });
  });
}

registerDialTests('YouTube');
registerDialTests('YouTubeTV');
registerDialTests('YouTubeKids');
