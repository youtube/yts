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
 * @fileoverview Unit tests for Cobalt helper utilities.
 */

import 'jasmine';

import type {H5vcc, H5vccScreen} from 'google3/third_party/javascript/yts/yts_common/h5vcc';
import {getScreenDiagonal, isAndroidTv, isCobalt26} from './cobalt';

describe('isAndroidTv', () => {

  it('returns true for 2026 standard ATV Cobalt user agents', () => {
    const atvUa =
        'Mozilla/5.0 (ATV; 14.0) Cobalt/25.lts.20.1034877-gold (unlike Gecko) v8/8.8.278.17-jit gles Starboard/16, Google_ATV_sabrina_2020/STTL.241013.003 (Google, Chromecast)';
    expect(isAndroidTv(atvUa)).toBeTrue();
  });

  it('returns true for Android TV (CoAT) Cobalt user agents with ATV device type', () => {
    const atvUa =
        'Mozilla/5.0 (Linux armeabi-v7a; Android 14) Cobalt/25.lts.30.1035005-qa (unlike Gecko) v8/8.8.278.17-jit gles Starboard/16, Google_ATV_mt8696_2024/UTTK.250305.003 (google, Google TV Streamer) dev.cobalt.coat/0';
    expect(isAndroidTv(atvUa)).toBeTrue();
  });

  it('returns false for AOSP user agents', () => {
    const aospUa =
        'Mozilla/5.0 (AOSP; Android 14) Cobalt/25.lts.30.1034943-gold (unlike Gecko) v8/8.8.278.17-jit gles Starboard/16, odm_AOSP_chipset_2024/fw-01 (brand, model)';
    expect(isAndroidTv(aospUa)).toBeFalse();
  });

  it('returns false for Android devices without ATV designation', () => {
    const androidNonAtvUa =
        'Mozilla/5.0 (Linux armeabi-v7a; Android 14) Cobalt/25.lts.30.1034943-gold (unlike Gecko) v8/8.8.278.17-jit gles Starboard/16, Partner_TV_chip_2024/fw-01 (brand, model)';
    expect(isAndroidTv(androidNonAtvUa)).toBeFalse();
  });

  it('returns false for FireOS user agents', () => {
    const fireOsUa =
        'Mozilla/5.0 (FireOS; 7.0) Cobalt/25.lts.10.1032622-gold (unlike Gecko) v8/8.8.278.8-jit gles Starboard/15, Amazon_OTT_karnak_2020/fw (Amazon, FireTV)';
    expect(isAndroidTv(fireOsUa)).toBeFalse();
  });

  it('returns false for non-Android / 3P TV user agents', () => {
    const tizenUa =
        'Mozilla/5.0 (LINUX; Tizen/5.5/2021.1.3) Cobalt/22.lts.6.308696-gold (unlike Gecko) v8/8.8.278.8-jit gles Evergreen/2.6.1 Evergreen-Full Starboard/12, Samsung_TV_KANTS2_2020/T-KTS2AKUC-2505.4 (Samsung, UN32M4500BFXZA, Wired)';
    expect(isAndroidTv(tizenUa)).toBeFalse();
  });

  it('returns false for LG webOS user agents', () => {
    const webOsUa =
        'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.215 Safari/537.36 WebAppManager';
    expect(isAndroidTv(webOsUa)).toBeFalse();
  });
});

describe('isCobalt26', () => {
  it('returns true for Cobalt 26 user agents', () => {
    const c26Ua =
        'Mozilla/5.0 (RDK; Linux 5.15.137-amlogic) Cobalt/26.eap.1.1037103-qa (unlike Gecko) v8/11.4.183.40-jit gles Evergreen/1.0.0 Evergreen-Full Evergreen-Compressed Starboard/17, AMLOGIC_STB_AmlogicS905X4_2025/2.2 (RDKCommonPort, AH212)';
    expect(isCobalt26(c26Ua)).toBeTrue();
  });

  it('returns false for Cobalt 25 user agents', () => {
    const c25Ua =
        'Mozilla/5.0 (ATV; 14.0) Cobalt/25.lts.20.1034877-gold (unlike Gecko) v8/8.8.278.17-jit gles Starboard/16, Google_ATV_sabrina_2020/STTL.241013.003 (Google, Chromecast)';
    expect(isCobalt26(c25Ua)).toBeFalse();
  });

  it('returns false for Cobalt 27 user agents', () => {
    const c27Ua =
        'Mozilla/5.0 (Linux; Android 15) Cobalt/27.lts.1.1040319-gold (unlike Gecko) v8/12.0.0-jit gles Starboard/18, Google_ATV_mt8696_2026/UTTK.260101.001 (google, Google TV Streamer)';
    expect(isCobalt26(c27Ua)).toBeFalse();
  });
});

describe('getScreenDiagonal', () => {
  const originalH5vcc = window.h5vcc;
  const originalH5vccScreen = window.H5vccScreen;

  afterEach(() => {
    window.h5vcc = originalH5vcc;
    window.H5vccScreen = originalH5vccScreen;
  });

  it('returns diagonal from h5vcc.system.getScreenDiagonal', async () => {
    window.h5vcc = {
      system: {
        getScreenDiagonal: async () => 55,
      },
    } as H5vcc;
    window.H5vccScreen = undefined;
    const diagonal = await getScreenDiagonal();
    expect(diagonal).toBe(55);
  });

  it('returns diagonal from window.H5vccScreen.GetDiagonal', async () => {
    window.h5vcc = undefined;
    window.H5vccScreen = {
      GetDiagonal: () => 65,
    } as H5vccScreen;
    const diagonal = await getScreenDiagonal();
    expect(diagonal).toBe(65);
  });

  it('throws descriptive error when API is unsupported', async () => {
    window.h5vcc = undefined;
    window.H5vccScreen = undefined;
    await expectAsync(getScreenDiagonal()).toBeRejectedWithError(
      'Screen diagonal API is not supported',
    );
  });

  it('throws descriptive error when API returns NaN', async () => {
    window.h5vcc = {
      system: {
        getScreenDiagonal: async () => NaN,
      },
    } as H5vcc;
    await expectAsync(getScreenDiagonal()).toBeRejectedWithError(
      'Screen diagonal API returned an invalid value: NaN',
    );
  });
});
