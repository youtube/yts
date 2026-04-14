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

import {
  CobaltUserAgent,
  CobaltVersion,
  EvergreenVersion,
} from './parse_user_agent';

describe('CobaltUserAgent', () => {
  it('parses a basic user agent', () => {
    const agent = new CobaltUserAgent(
      'Mozilla/5.0 (Linux armeabi-v7a) Cobalt/21.lts.1.268598-qa (unlike Gecko) v8/7.7.299.8-jit gles Starboard/13, wei_TV_sux_2021/v1.0 (Wei_brand, Wei_Model, Wired)',
    );

    expect(agent.osNameAndVersion).toEqual('Linux armeabi-v7a');

    expect(agent.cobaltVersion.lts).toEqual(21);
    expect(agent.cobaltVersion.release).toEqual(1);
    expect(agent.cobaltVersion.buildId).toEqual(268598);
    expect(agent.cobaltVersion.flavor).toEqual('qa');

    expect(agent.starboardVersion).toEqual(13);
    expect(agent.firmware).toEqual('v1.0');
    expect(agent.brand).toEqual('Wei_brand');
    expect(agent.model).toEqual('Wei_Model');

    expect(agent.evergreenVersion.major).toEqual(-1);
    expect(agent.evergreenVersion.minor).toEqual(-1);
    expect(agent.evergreenVersion.patch).toEqual(-1);
    expect(agent.evergreenVersion.isEvergreenFull).toBeFalse();
  });

  it('parses a user agent with format 23', () => {
    const agent = new CobaltUserAgent(
      'Mozilla/5.0 (Linux armeabi-v7a) Cobalt/21.lts.1.268598-qa (unlike Gecko) v8/7.7.299.8-jit gles Starboard/13, wei_TV_sux_2021/v1.0 (Wei_.br-and, Wei_.Mo-del)',
    );

    expect(agent.osNameAndVersion).toEqual('Linux armeabi-v7a');

    expect(agent.cobaltVersion.lts).toEqual(21);
    expect(agent.cobaltVersion.release).toEqual(1);
    expect(agent.cobaltVersion.buildId).toEqual(268598);
    expect(agent.cobaltVersion.flavor).toEqual('qa');

    expect(agent.starboardVersion).toEqual(13);
    expect(agent.firmware).toEqual('v1.0');
    expect(agent.brand).toEqual('Wei_.br-and');
    expect(agent.model).toEqual('Wei_.Mo-del');

    expect(agent.evergreenVersion.major).toEqual(-1);
    expect(agent.evergreenVersion.minor).toEqual(-1);
    expect(agent.evergreenVersion.patch).toEqual(-1);
    expect(agent.evergreenVersion.isEvergreenFull).toBeFalse();
  });

  it('parses an evergreen user agent', () => {
    const agent = new CobaltUserAgent(
      'Mozilla/5.0 (LINUX; Tizen/5.5/2021.1.3) Cobalt/22.lts.6.308696-gold (unlike Gecko) v8/8.8.278.8-jit gles Evergreen/2.6.1 Evergreen-Full Starboard/12, Samsung_TV_KANTS2_2020/T-KTS2AKUC-2505.4 (Samsung, UN32M4500BFXZA, Wired)',
    );

    expect(agent.osNameAndVersion).toEqual('LINUX; Tizen/5.5/2021.1.3');

    expect(agent.cobaltVersion.lts).toEqual(22);
    expect(agent.cobaltVersion.release).toEqual(6);
    expect(agent.cobaltVersion.buildId).toEqual(308696);
    expect(agent.cobaltVersion.flavor).toEqual('gold');

    expect(agent.starboardVersion).toEqual(12);
    expect(agent.firmware).toEqual('T-KTS2AKUC-2505.4');
    expect(agent.brand).toEqual('Samsung');
    expect(agent.model).toEqual('UN32M4500BFXZA');

    expect(agent.evergreenVersion.major).toEqual(2);
    expect(agent.evergreenVersion.minor).toEqual(6);
    expect(agent.evergreenVersion.patch).toEqual(1);
    expect(agent.evergreenVersion.isEvergreenFull).toBeTrue();
  });

  it('parses a user agent with spaces in brand and model', () => {
    const agent = new CobaltUserAgent(
      'Mozilla/5.0 (X11; Linux armv7l) Cobalt/25.lts.21.1034899-qa (unlike Gecko) v8/8.8.278.17-jit gles Evergreen/5.1.2 Evergreen-Full Evergreen-Compressed Starboard/15, RaspberryPiFoundation_UNKNOWN_Unknown_0/Unknown (Raspberry Pi Foundation, Raspberry Pi 3 Model B)',
    );

    expect(agent.osNameAndVersion).toEqual('X11; Linux armv7l');

    expect(agent.cobaltVersion.lts).toEqual(25);
    expect(agent.cobaltVersion.release).toEqual(21);
    expect(agent.cobaltVersion.buildId).toEqual(1034899);
    expect(agent.cobaltVersion.flavor).toEqual('qa');

    expect(agent.starboardVersion).toEqual(15);
    expect(agent.firmware).toEqual('Unknown');
    expect(agent.brand).toEqual('Raspberry Pi Foundation');
    expect(agent.model).toEqual('Raspberry Pi 3 Model B');

    expect(agent.evergreenVersion.major).toEqual(5);
    expect(agent.evergreenVersion.minor).toEqual(1);
    expect(agent.evergreenVersion.patch).toEqual(2);
    expect(agent.evergreenVersion.isEvergreenFull).toBeTrue();
  });

  it('parses a user agent with random characters in place of "lts"', () => {
    const agent = new CobaltUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) Cobalt/26.trunk.0.1034999-qa (unlike Gecko) v8/8.8.278.17-jit gles Starboard/17, SystemIntegratorName_DESKTOP_ChipsetModelNumber_2026/FirmwareVersion (BrandName, ModelName)',
    );

    expect(agent.osNameAndVersion).toEqual('X11; Linux x86_64');

    expect(agent.cobaltVersion.lts).toEqual(26);
    expect(agent.cobaltVersion.release).toEqual(0);
    expect(agent.cobaltVersion.buildId).toEqual(1034999);
    expect(agent.cobaltVersion.flavor).toEqual('qa');

    expect(agent.starboardVersion).toEqual(17);
    expect(agent.firmware).toEqual('FirmwareVersion');
    expect(agent.brand).toEqual('BrandName');
    expect(agent.model).toEqual('ModelName');

    expect(agent.evergreenVersion.major).toEqual(-1);
    expect(agent.evergreenVersion.minor).toEqual(-1);
    expect(agent.evergreenVersion.patch).toEqual(-1);
    expect(agent.evergreenVersion.isEvergreenFull).toBeFalse();
  });
});

describe('CobaltVersion', () => {
  it('parses string', () => {
    const v = new CobaltVersion('25.lts.21.1034899-qa');
    expect(v.lts).toEqual(25);
    expect(v.release).toEqual(21);
    expect(v.buildId).toEqual(1034899);
    expect(v.flavor).toEqual('qa');
  });
  it('compares strings', () => {
    const v = new CobaltVersion('25.lts.21.1034899-qa');
    expect(v.compare('25.lts.21.1034899-qa')).toEqual(0);
    expect(v.compare('25.lts.21.1034898-qa')).toEqual(1);
    expect(v.compare('25.lts.21.1034900-gold')).toEqual(-1);
    expect(v.compare('25.lts.20.1034899-gold')).toEqual(1);
    expect(v.compare('25.lts.22.1034899-gold')).toEqual(-1);
    expect(v.compare('24.lts.21.1034899-gold')).toEqual(1);
    expect(v.compare('26.lts.21.1034899-gold')).toEqual(-1);
  });
  it('compares lessThan, lessOrEqualTo, greaterThan, greaterOrEqualTo', () => {
    const v = new CobaltVersion('25.lts.21.1034899-qa');
    expect(v.lessThan('25.lts.21.1034900-gold')).toBeTrue();
    expect(v.lessThan('25.lts.21.1034899-qa')).toBeFalse();
    expect(v.lessThan('25.lts.21.1034898-qa')).toBeFalse();
    expect(v.lessOrEqualTo('25.lts.21.1034900-gold')).toBeTrue();
    expect(v.lessOrEqualTo('25.lts.21.1034899-qa')).toBeTrue();
    expect(v.lessOrEqualTo('25.lts.21.1034898-qa')).toBeFalse();
    expect(v.greaterThan('25.lts.21.1034898-qa')).toBeTrue();
    expect(v.greaterThan('25.lts.21.1034899-qa')).toBeFalse();
    expect(v.greaterThan('25.lts.21.1034900-gold')).toBeFalse();
    expect(v.greaterOrEqualTo('25.lts.21.1034898-qa')).toBeTrue();
    expect(v.greaterOrEqualTo('25.lts.21.1034899-qa')).toBeTrue();
    expect(v.greaterOrEqualTo('25.lts.21.1034900-gold')).toBeFalse();
  });
  it('generates an accurate string', () => {
    const versionString = '25.lts.21.1034899-qa';
    const v = new CobaltVersion(versionString);
    expect(v.toString()).toEqual(versionString);
  });
});

describe('EvergreenVersion', () => {
  it('parses string', () => {
    const v = new EvergreenVersion('1.2.3', false);
    expect(v.major).toEqual(1);
    expect(v.minor).toEqual(2);
    expect(v.patch).toEqual(3);
    expect(v.isEvergreenFull).toBeFalse();
  });
  it('compares strings', () => {
    const v = new EvergreenVersion('1.2.3');
    expect(v.compare('1.2.3')).toEqual(0);
    expect(v.compare('0.2.3')).toEqual(1);
    expect(v.compare('1.1.3')).toEqual(1);
    expect(v.compare('1.2.2')).toEqual(1);
    expect(v.compare('2.2.3')).toEqual(-1);
    expect(v.compare('1.3.3')).toEqual(-1);
    expect(v.compare('1.2.4')).toEqual(-1);
  });
  it('compares lessThan, lessOrEqualTo, greaterThan, greaterOrEqualTo', () => {
    const v = new EvergreenVersion('1.2.3');
    expect(v.lessThan('1.2.4')).toBeTrue();
    expect(v.lessThan('1.2.3')).toBeFalse();
    expect(v.lessThan('1.2.2')).toBeFalse();
    expect(v.lessOrEqualTo('1.2.4')).toBeTrue();
    expect(v.lessOrEqualTo('1.2.3')).toBeTrue();
    expect(v.lessOrEqualTo('1.2.2')).toBeFalse();
    expect(v.greaterThan('1.2.2')).toBeTrue();
    expect(v.greaterThan('1.2.3')).toBeFalse();
    expect(v.greaterThan('1.2.4')).toBeFalse();
    expect(v.greaterOrEqualTo('1.2.2')).toBeTrue();
    expect(v.greaterOrEqualTo('1.2.3')).toBeTrue();
    expect(v.greaterOrEqualTo('1.2.4')).toBeFalse();
  });
  it('throws on invalid string', () => {
    expect(() => new EvergreenVersion('1.2')).toThrow();
    expect(() => new EvergreenVersion('a.b.c')).toThrow();
  });
  it('compares EvergreenVersions', () => {
    const v = new EvergreenVersion('1.2.3');
    expect(v.compare(new EvergreenVersion('1.2.3'))).toEqual(0);
  });
});
