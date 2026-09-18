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

import {arrayToString} from 'google3/third_party/javascript/yts/test_utils/eme/eme_utils';
import {getShakaPlayer, Player, PlayerEvent, Request, RequestType} from 'google3/third_party/javascript/yts/yts_common/shaka';

const WIDEVINE_UA =
    /([-.A-Za-z0-9\\\/]*)_([-.A-Za-z0-9\\\/]*)_([-.A-Za-z0-9\\\/]*)_([0-9]+) ?\/ ?[-_.A-Za-z0-9\\]* \(([-_.A-Za-z0-9\\\/ ]+), ?([-_.A-Za-z0-9\\\/ ]+)/;

interface ClientCapabilities {
  oem_crypto_api_version: string|number;
  max_hdcp_version?: string;
}

interface ClientInfoItem {
  name: string;
  value: string;
}

interface ClientCredentials {
  type?: string;
  credential_type?: string;
}

interface WidevineProxyResponse {
  client_capabilities: ClientCapabilities;
  client_info: ClientInfoItem[];
  type?: string;
  device_credentials?: ClientCredentials;
}

interface WidevineLicenseInfo {
  clientInfo: WidevineProxyResponse;
  license: {[key: string]: string};
}

interface ParsedUA {
  system_integrator: string;
  brand: string;
  model: string;
}


/**
 * Parses Brand, Model, and System Integrator from the User Agent.
 */
function parseWidevineUA(): ParsedUA {
  const userAgentParsed = WIDEVINE_UA.exec(navigator.userAgent);
  expect(userAgentParsed)
      .withContext('User agent should be in correct format')
      .not.toBeNull();
  if (!userAgentParsed) {
    throw new Error('User agent is not in correct format');
  }
  return {
    system_integrator: userAgentParsed[1],
    brand: userAgentParsed[5],
    model: userAgentParsed[6],
  };
}

function getExpectedCertScope(): string|null {
  const regex = new RegExp('(\\?|\\&)cert_scope=([-:,\\w]+)', 'g');
  const value = regex.exec(document.URL);
  return value ? value[2] : null;
}

/**
 * Headless EME flow that contacts the Widevine UAT proxy and returns decrypted
 * license info.
 */
describe('Functional Tests', () => {
  let originalTimeout: number;

  beforeAll(() => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  describe('User Agent', () => {
    let video: HTMLMediaElement;
    let player: Player|null = null;

    beforeEach(() => {
      video = document.createElement('video');
      document.body.appendChild(video);
    });

    afterEach(async () => {
      if (player) {
        try {
          await player.unload();
          await player.destroy();
        } catch (e) {
          console.log('Error during player teardown: ' + e);
        }
        player = null;
      }
      if (video && video.parentNode) {
        document.body.removeChild(video);
      }
    });

    function fetchWidevineLicenseInfo(): Promise<WidevineLicenseInfo> {
      return new Promise(async (resolve, reject) => {
        try {
          const manifestUri =
              'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/manual/wv_license_request.mpd';
          const licenseServer = 'https://cwip-shaka-proxy.appspot.com/no_auth';

          player = await getShakaPlayer(video);

          player.addEventListener('error', (event: PlayerEvent) => {
            reject(new Error(
                'Shaka player error: ' + JSON.stringify(event.detail)));
          });

          player.configure(
              {drm: {servers: {'com.widevine.alpha': licenseServer}}});

          player.getNetworkingEngine().registerRequestFilter(
              async (type: number, request: Request) => {
                if (type === RequestType.LICENSE) {
                  try {
                    const rawLicenseRequest = new Uint8Array(request.body!);
                    const rawLicenseRequestBase64 =
                        btoa(arrayToString(rawLicenseRequest));
                    console.log(
                        'License request (base64): ' + rawLicenseRequestBase64);

                    const url =
                        'https://proxy.uat.widevine.com/proxy?get_client_id=true';
                    const response = await fetch(
                        url, {method: 'POST', body: rawLicenseRequest});

                    if (!response.ok) {
                      throw new Error(
                          `Failed to contact Widevine proxy, HTTP status ${
                              response.status}`);
                    }

                    const parsedResponse =
                        await response.json() as WidevineProxyResponse;
                    console.log('Proxy response parsed successfully');

                    const clientInfo = parsedResponse.client_info;
                    if (!clientInfo || clientInfo.length === 0) {
                      console.log(
                          'client_info is empty in proxy response (provisioning step). Awaiting actual license request...');
                      return;
                    }

                    const license: {[key: string]: string} = {};
                    for (const item of clientInfo) {
                      license[item.name] = item.value;
                    }

                    if (parsedResponse.client_capabilities &&
                        parsedResponse.client_capabilities.oem_crypto_api_version !== undefined) {
                      yts.addMetric(
                          'oem_crypto_api_version',
                          parsedResponse.client_capabilities.oem_crypto_api_version);
                    }
                    if (parsedResponse.type) {
                      yts.addMetric('widevine_provisioning_token_type', parsedResponse.type);
                    }
                    if (parsedResponse.device_credentials &&
                        parsedResponse.device_credentials.credential_type) {
                      yts.addMetric(
                          'widevine_provisioning_credential_type',
                          parsedResponse.device_credentials.credential_type);
                    }
                    if (license['widevine_cdm_version']) {
                      yts.addMetric('widevine_cdm_version', license['widevine_cdm_version']);
                    }

                    resolve({clientInfo: parsedResponse, license});
                  } catch (error) {
                    reject(error);
                  }
                }
              });

          void player.load(manifestUri).catch((error: unknown) => {
            reject(new Error('Shaka load error: ' + error));
          });

        } catch (e) {
          reject(e);
        }
      });
    }

    yts.test({id: '67F381B6-1A8E-424D-903E-0FE0A75EE0D6'});
    it('Widevine License - V14', async () => {
      const {clientInfo, license} = await fetchWidevineLicenseInfo();
      const {brand, model, system_integrator} = parseWidevineUA();

      const companyNameMatch = license['company_name'] === brand ||
          license['company_name'] === system_integrator;
      expect(companyNameMatch)
          .withContext(`License company_name (${
              license['company_name']}) should equal UA brand (${
              brand}) or system integrator (${system_integrator})`)
          .toBeTrue();
      expect(license['model_name'])
          .withContext('Model Name should match')
          .toBe(model);

      expect(Number(clientInfo.client_capabilities.oem_crypto_api_version))
          .withContext('OEMCrypto version check')
          .toBeGreaterThanOrEqual(14);
    });

    yts.test({id: '14.17.4.1'});
    it('Widevine License - v15', async () => {
      const {clientInfo, license} = await fetchWidevineLicenseInfo();
      const {brand, model, system_integrator} = parseWidevineUA();

      const companyNameMatch = license['company_name'] === brand ||
          license['company_name'] === system_integrator;
      expect(companyNameMatch)
          .withContext(`License company_name (${
              license['company_name']}) should equal UA brand (${
              brand}) or system integrator (${system_integrator})`)
          .toBeTrue();
      expect(license['model_name'])
          .withContext('Model Name should match')
          .toBe(model);

      expect(Number(clientInfo.client_capabilities.oem_crypto_api_version))
          .withContext('OEMCrypto version check')
          .toBeGreaterThanOrEqual(15);
    });

    yts.test({id: '14.17.4.3'});
    it('Widevine License', async () => {
      const {clientInfo, license} = await fetchWidevineLicenseInfo();
      const {brand, model, system_integrator} = parseWidevineUA();

      const companyNameMatch = license['company_name'] === brand ||
          license['company_name'] === system_integrator;
      expect(companyNameMatch)
          .withContext(`License company_name (${
              license['company_name']}) should equal UA brand (${
              brand}) or system integrator (${system_integrator})`)
          .toBeTrue();
      expect(license['model_name'])
          .withContext('Model Name should match')
          .toBe(model);

      expect(license['youtube_cert_scope'])
          .withContext('License Cert Scope should not be null')
          .not.toBeNull();
      const expectedCertScope = getExpectedCertScope();
      expect(expectedCertScope)
          .withContext('Expected Cert Scope should not be null')
          .not.toBeNull();
      expect(license['youtube_cert_scope'])
          .withContext('Device Cert Scope should match')
          .toBe(expectedCertScope!);

      expect(Number(clientInfo.client_capabilities.oem_crypto_api_version))
          .withContext('OEMCrypto version check')
          .toBeGreaterThanOrEqual(16);

      const widevine_cdm_version = license['widevine_cdm_version'].split('.');
      const cdm_major_version = Number(widevine_cdm_version[0]);
      const cdm_minor_version = Number(widevine_cdm_version[1]);

      expect(cdm_major_version)
          .withContext('CE CDM major version')
          .toBeGreaterThanOrEqual(16);
      if (cdm_major_version === 16) {
        expect(cdm_minor_version)
            .withContext('CE CDM minor version')
            .toBeGreaterThanOrEqual(2);
      }
    });

    yts.test({id: '757DD616-9E15-4164-9BB3-EACF00857CE3'});
    it('Widevine License - brandAndModel', async () => {
      const {license} = await fetchWidevineLicenseInfo();
      const {brand, model, system_integrator} = parseWidevineUA();

      const companyNameMatch = license['company_name'] === brand ||
          license['company_name'] === system_integrator;
      expect(companyNameMatch)
          .withContext(`License company_name (${
              license['company_name']}) should equal UA brand (${
              brand}) or system integrator (${system_integrator})`)
          .toBeTrue();
      expect(license['model_name'])
          .withContext('Model Name should match')
          .toBe(model);
    });

    yts.test({id: 'A5AFB221-25E4-4A67-B3A4-50110417C4FB'});
    it('Widevine License - certScope', async () => {
      const {license} = await fetchWidevineLicenseInfo();

      expect(license['youtube_cert_scope'])
          .withContext('License Cert Scope should not be null')
          .not.toBeNull();
      const expectedCertScope = getExpectedCertScope();
      expect(expectedCertScope)
          .withContext('Expected Cert Scope should not be null')
          .not.toBeNull();
      expect(license['youtube_cert_scope'])
          .withContext('Device Cert Scope should match')
          .toBe(expectedCertScope!);
    });

    yts.test({id: '0F23C7EA-BFF0-4A32-9182-2F195432A051'});
    it('Widevine License - oemVersion', async () => {
      const {clientInfo} = await fetchWidevineLicenseInfo();

      expect(Number(clientInfo.client_capabilities.oem_crypto_api_version))
          .withContext('OEMCrypto version check')
          .toBeGreaterThanOrEqual(16);
    });

    yts.test({id: '151B042B-A90A-438E-8E06-AFCDA8FD3FD3'});
    it('Widevine License - v19.3', async () => {
      const {clientInfo} = await fetchWidevineLicenseInfo();

      const oemCryptoVersion =
          String(clientInfo.client_capabilities.oem_crypto_api_version)
              .split('.');
      const major = Number(oemCryptoVersion[0]);
      const minor = oemCryptoVersion[1] ? Number(oemCryptoVersion[1]) : 0;

      expect(major)
          .withContext('OEMCrypto major version')
          .toBeGreaterThanOrEqual(19);
      if (major === 19) {
        expect(minor)
            .withContext('OEMCrypto minor version')
            .toBeGreaterThanOrEqual(3);
      }
    });
  });
});
