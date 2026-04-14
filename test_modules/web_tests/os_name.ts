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

const VALID_OS_NAMES = [
  'RokuOS',
  'Tizen',
  'webOS',
  'Vidaa',
  'FireOS',
  'VegaOS',
  'SmartCast',
  'JioOS',
  'TitanOS',
  'Xperi',
  'Xumo',
  'RDK',
  'ATV',
  'AOSP',
  'PLAYSTATION',
  'XBOX',
  'APPLE_TVOS',
  'NINTENDO',
];

describe('Functional Tests', () => {
  describe('User Agent', () => {
    it('OS Name', () => {
      const ua = new CobaltUserAgent(navigator.userAgent);
      const osNameAndVersion = ua.osNameAndVersion;
      console.log(
        `Parsed OS name and version: (${osNameAndVersion}) from user agent: ${navigator.userAgent}`,
      );

      // Valid for "OS Name; OS Version" or "OS Name" (no version).
      const osNameParts = osNameAndVersion.split(';');
      if (!VALID_OS_NAMES.includes(osNameParts[0])) {
        fail(
          `OS name (${osNameParts[0]}) is not a valid OS name. Valid OS names are: ${VALID_OS_NAMES.join(', ')}.`,
        );
      }
    });
  });
});
