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

import {CobaltUserAgent} from 'google3/third_party/javascript/yts/yts_common/parse_user_agent';

function getDeviceModelYear(): string {
  const parsedUA = new CobaltUserAgent(navigator.userAgent);
  const deviceNameBlock = parsedUA.deviceNameBlock;
  const parts = deviceNameBlock.split('_');

  expect(parts.length)
      .withContext(
          `Device name "${deviceNameBlock}" should have exactly 4 parts`)
      .toBe(4);

  return parts[3];
}


async function fetchCobaltBuildId(url: string): Promise<number> {
  const r = await fetch(url);
  if (!r.ok) {
    throw new Error(`Failed to fetch Cobalt build ID: ${r.statusText}`);
  }
  const base64Text = await r.text();
  return Number(window.atob(base64Text.trim()));
}

describe('Functional Tests', () => {
  describe('User Agent', () => {
    it('Starboard 14 User Agent', () => {
      const ua = new CobaltUserAgent(navigator.userAgent);
      expect(ua.starboardVersion)
          .withContext('Starboard version should be >= 14')
          .toBeGreaterThanOrEqual(14);
    });

    it('Starboard 15 User Agent', () => {
      const ua = new CobaltUserAgent(navigator.userAgent);
      expect(ua.starboardVersion)
          .withContext('Starboard version should be >= 15')
          .toBeGreaterThanOrEqual(15);
    });

    it('Starboard 16 User Agent', () => {
      const ua = new CobaltUserAgent(navigator.userAgent);
      expect(ua.starboardVersion)
          .withContext('Starboard version should be >= 16')
          .toBeGreaterThanOrEqual(16);
    });

    it('Starboard User Agent', () => {
      const ua = new CobaltUserAgent(navigator.userAgent);
      expect(ua.starboardVersion)
          .withContext('Starboard version should be >= 12')
          .toBeGreaterThanOrEqual(12);
    });

    it('gles in User Agent', () => {
      const hasGles = navigator.userAgent.includes(' gles ') ||
          navigator.userAgent.includes(' direct-gles ');
      expect(hasGles)
          .withContext(
              'User agent did not contain \'gles\' or \'direct-gles\' substring')
          .toBeTrue();
    });

    it('Cobalt User Agent', async () => {
      const buildVersion = await fetchCobaltBuildId(
          'https://cobalt.googlesource.com/cobalt/+/refs/heads/21.lts.stable/cobalt/build/build.id?format=TEXT');
      const ua = new CobaltUserAgent(navigator.userAgent);

      expect(ua.cobaltVersion.lts)
          .withContext('Cobalt major version should be 21')
          .toBe(21);

      expect(ua.cobaltVersion.buildId)
          .withContext(
              `Cobalt build ID should match build version ${buildVersion}`)
          .toBe(buildVersion);
    });

    it('User Agent Format 2023', () => {
      const ua = navigator.userAgent;
      const parsedUA = new CobaltUserAgent(ua);
      const deviceNameBlock = parsedUA.deviceNameBlock;
      const parts = deviceNameBlock.split('_');

      expect(parts.length)
          .withContext(`Device name "${
              deviceNameBlock}" should have exactly 4 parts (SysIntegrator_Type_Chip_Year)`)
          .toBe(4);

      const [sysIntegrator, deviceType, chipset, modelYear] = parts;

      const VALID_DEVICE_CHARS = /[A-Za-z0-9-]+/;

      expect(sysIntegrator.match(VALID_DEVICE_CHARS))
          .withContext(
              `SystemIntegrator "${sysIntegrator}" MUST be from [a-zA-Z0-9-]`)
          .not.toBeNull();

      expect(deviceType)
          .withContext(
              `DeviceType "${deviceType}" must be a valid YTS device type`)
          .toMatch(
              /^(BDP|GAME|OTT|STB|TV|PROJECTOR|MMD|MONITOR|AUTO|SOUNDBAR)$/);

      expect(chipset.match(VALID_DEVICE_CHARS))
          .withContext(`ChipsetModel "${chipset}" MUST be from [a-zA-Z0-9-]`)
          .not.toBeNull();

      expect(modelYear)
          .withContext(`ModelYear "${
              modelYear}" must be a 4-digit year starting with 20`)
          .toMatch(/^20\d{2}$/);

      const expectedParens = `(${parsedUA.brand}, ${parsedUA.model})`;
      expect(ua.endsWith(expectedParens))
          .withContext(
              `User Agent trailing parenthesis must contain exactly "(Brand, Model)", expected "${
                  expectedParens}"`)
          .toBeTrue();
    });

    it('User Agent Format', () => {
      const ua = navigator.userAgent;
      const parsedUA = new CobaltUserAgent(ua);
      const deviceNameBlock = parsedUA.deviceNameBlock;
      const parts = deviceNameBlock.split('_');

      expect(parts.length)
          .withContext(`Device name "${
              deviceNameBlock}" should have exactly 4 parts (Type_Brand_Model_Year)`)
          .toBe(4);

      const [deviceType, brand, model, modelYear] = parts;

      const VALID_DEVICE_CHARS = /[A-Za-z0-9-]+/;

      expect(deviceType)
          .withContext(
              `DeviceType "${deviceType}" must be a valid YTS device type`)
          .toMatch(
              /^(BDP|GAME|OTT|STB|TV|PROJECTOR|MMD|MONITOR|AUTO|SOUNDBAR)$/);

      expect(brand.match(VALID_DEVICE_CHARS))
          .withContext(`Brand "${brand}" MUST be from [a-zA-Z0-9-]`)
          .not.toBeNull();

      expect(model.match(VALID_DEVICE_CHARS))
          .withContext(`Model "${model}" MUST be from [a-zA-Z0-9-]`)
          .not.toBeNull();

      expect(modelYear)
          .withContext(`ModelYear "${
              modelYear}" must be a 4-digit year starting with 20`)
          .toMatch(/^20\d{2}$/);

      // Legacy 3-element trailing parentheses check "(Brand, Model,
      // Connection)"
      const parensIdx = ua.lastIndexOf('(');
      expect(parensIdx)
          .withContext('Could not locate trailing parentheses')
          .toBeGreaterThan(-1);
      const trailingBlock = ua.substring(parensIdx + 1, ua.length - 1).trim();
      const trailingParts = trailingBlock.split(',').map(s => s.trim());

      expect(trailingParts.length)
          .withContext(
              `Trailing block "${trailingBlock}" must have exactly 3 parts`)
          .toBe(3);
      expect(trailingParts[0]).toBe(parsedUA.brand);
      expect(trailingParts[1]).toBe(parsedUA.model);
      expect(trailingParts[2])
          .withContext(
              'Connection parameter must be Wired, Wireless, or similar')
          .toMatch(/^(WIRED|WIRELESS|Wired|Wireless|[\w-\/]+)$/);
    });

    it('User Agent Year 2022', () => {
      expect(getDeviceModelYear()).toBe('2022');
    });

    it('User Agent Year 2023', () => {
      expect(getDeviceModelYear()).toBe('2023');
    });

    it('User Agent Year 2024', () => {
      expect(getDeviceModelYear()).toBe('2024');
    });

    it('User Agent Year 2025', () => {
      expect(getDeviceModelYear()).toBe('2025');
    });

    it('User Agent Year 2026', () => {
      expect(getDeviceModelYear()).toBe('2026');
    });

    it('User Agent Year 2027', () => {
      expect(getDeviceModelYear()).toBe('2027');
    });

    it('Cobalt Version User Agent', async () => {
      const buildVersion = await fetchCobaltBuildId(
          'https://cobalt.googlesource.com/cobalt/+/refs/heads/22.lts.stable/cobalt/build/build.id?format=TEXT');
      const ua = new CobaltUserAgent(navigator.userAgent);

      expect(ua.cobaltVersion.lts)
          .withContext('Cobalt major version should be 22')
          .toBe(22);

      expect(ua.cobaltVersion.buildId)
          .withContext(
              `Cobalt build ID should match build version ${buildVersion}`)
          .toBe(buildVersion);
    });

    it('Cobalt Version 23 User Agent', async () => {
      const buildVersion = await fetchCobaltBuildId(
          'https://cobalt.googlesource.com/cobalt/+/refs/heads/23.lts.stable/cobalt/build/build.id?format=TEXT');
      const ua = new CobaltUserAgent(navigator.userAgent);

      expect(ua.cobaltVersion.lts)
          .withContext('Cobalt major version should be 23')
          .toBe(23);

      expect(ua.cobaltVersion.buildId)
          .withContext(
              `Cobalt build ID should match build version ${buildVersion}`)
          .toBe(buildVersion);
    });

    it('Evergreen Full User Agent', () => {
      expect(navigator.userAgent.includes(' Evergreen-Full '))
          .withContext(`User Agent did not contain 'Evergreen-Full' substring`)
          .toBeTrue();
    });

    it('Evergreen Lite User Agent', () => {
      expect(navigator.userAgent.includes(' Evergreen-Lite '))
          .withContext(`User Agent did not contain 'Evergreen-Lite' substring`)
          .toBeTrue();
    });

    it('Negative Evergreen User Agent', () => {
      const hasEvergreen = navigator.userAgent.includes(' Evergreen-Full ') ||
          navigator.userAgent.includes(' Evergreen-Lite ');
      expect(hasEvergreen)
          .withContext(`User Agent did contain 'Evergreen' substring`)
          .toBeFalse();
    });

    it('Firmware Version', () => {
      const ua = new CobaltUserAgent(navigator.userAgent);
      expect(ua.firmware)
          .withContext('Firmware version should be defined')
          .toBeDefined();
      expect(ua.firmware)
          .withContext(
              `Invalid User-Agent firmware version format: "${ua.firmware}"`)
          .toMatch(/^[\w\W]+\.\w+$/);
    });
  });
});
