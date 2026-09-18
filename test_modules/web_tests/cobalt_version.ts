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

import 'jasmine';

import {CobaltUserAgent} from 'google3/third_party/javascript/yts/yts_common/index';

function cobaltVersionTest(majorVersion: number) {
  return async () => {
    const branchSuffix = majorVersion >= 27 ? 'lts' : 'lts.stable';
    const url = `https://raw.githubusercontent.com/youtube/cobalt/${majorVersion}.${branchSuffix}/cobalt/version.h`;
    console.log(`Loading ${url} to determine latest Cobalt version.`);
    const r = await fetch(url);
    const text = await r.text();
    const matches = /COBALT_VERSION "((\d+).lts.(\d+))"/.exec(text);
    if (!matches) {
      throw new Error('Failed to determine latest Cobalt version.');
    }
    const latestMajorStr = matches[2];
    const latestMinorStr = matches[3];
    const latestMinor = Number(latestMinorStr);
    console.log(
      `Latest Cobalt version: ${matches[1]}. Minor version: ${latestMinorStr}.`,
    );
    const ua = new CobaltUserAgent(navigator.userAgent);
    const cobaltVersionStr = ua.cobaltVersion.toString();
    const actualMatches = /(\d+).lts.(\d+)/.exec(cobaltVersionStr);
    if (!actualMatches) {
      throw new Error(
        `Failed to parse Cobalt version on this device (${cobaltVersionStr}).`,
      );
    }
    const actualMajorStr = actualMatches[1];
    if (actualMajorStr !== latestMajorStr) {
      fail(
        `Expected Cobalt major version on this device (${actualMajorStr}) to equal latest (${latestMajorStr}).`,
      );
    }
    const actualMinorStr = actualMatches[2];
    const actualMinor = Number(actualMinorStr);
    console.log(
      `Cobalt version on this device: ${cobaltVersionStr}. Minor version: ${actualMinorStr}.`,
    );
    if (majorVersion < 27 && actualMinor % 10 !== 0) {
      fail(
        `Expected Cobalt minor version on this device (${actualMinorStr}) to be a stable version. Stable versions are a multiple of 10.`,
      );
    }
    const maxDelta = majorVersion >= 27 ? 2 : 20;
    if (latestMinor - actualMinor <= maxDelta) {
      console.log(
        `Cobalt minor version on this device (${actualMinorStr}) is correctly no older than ${maxDelta} minor versions behind latest (${latestMinorStr}).`,
      );
    } else {
      fail(
        `Expected Cobalt minor version on this device (${actualMinorStr}) to be no older than ${maxDelta} minor versions behind latest (${latestMinorStr}).`,
      );
    }
  };
}

describe('Functional Tests', () => {
  describe('User Agent', () => {
    yts.test({id: 'D41E8C73-AA72-480F-912E-F4B3235F3F14'});
    it('Cobalt Version 24', cobaltVersionTest(24));
    yts.test({id: 'C97ED4CC-3B7A-4B82-A021-68462EFF72D5'});
    it('Cobalt Version 25', cobaltVersionTest(25));
    yts.test({id: '75ACD551-9C42-4842-8D52-948442B170CE'});
    it('Cobalt Version 27', cobaltVersionTest(27));
  });
});
