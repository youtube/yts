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

// Parses out the major parts of the Cobalt user agent string. Lower level details are parsed by other regexes.
// Sample UA: Mozilla/5.0 (OS_Name; 10.2) Cobalt/21.lts.1.268598-qa (unlike Gecko) v8/7.7.299.8-jit gles Starboard/13, wei_TV_sux_2021/v1.0 (Wei_brand, Wei_Model, Wired)
// See tests for other examples.
const UA_MATCHER = new RegExp(
    [
      /^.*? \((.+?)\) /,           // '(OS_Name; 10.2)'
      /.*Cobalt\/(.+?) .*/,        // 21.lts.1.268598-qa
      /Starboard\/([0-9]+), ?/,    // 13
      /(.*?)/,                     // wei_TV_sux_2021
      /\/([\-_.A-Za-z0-9]*) /,     // 'v1.0'
      /\(([a-zA-Z0-9\-_. ]+), ?/,  // 'Wei_brand'
      /([a-zA-Z0-9\-_. ]*)/,       // 'Wei_Model'
    ].map((regex) => regex.source)
        .join(''),
);

const COBALT_VERSION_MATCHER = /([0-9]+)\.[a-z]+\.([0-9]+)\.([0-9]+)-([a-z]+)/i;
const EVERGREEN_VERSION_MATCHER = /.*[Ee]vergreen\/([0-9.]+ .*)/;
const BARE_VERSION_MATCHER = /([0-9]+)\.([0-9]+)\.([0-9]+)/;

/** Basic version data structure. */
export class EvergreenVersion {
  major: number = -1;
  minor: number = -1;
  patch: number = -1;

  constructor(
    versionString = '',
    public isEvergreenFull = true,
  ) {
    if (!versionString) return;

    const bareMatches = BARE_VERSION_MATCHER.exec(versionString);
    if (bareMatches && bareMatches.length === 4) {
      this.major = Number(bareMatches[1]);
      this.minor = Number(bareMatches[2]);
      this.patch = Number(bareMatches[3]);
      if (
        isFinite(this.major) &&
        isFinite(this.minor) &&
        isFinite(this.patch)
      ) {
        return;
      }
    }
    throw new Error(`Invalid version: ${versionString}.`);
  }

  compare(other: EvergreenVersion | string): number {
    const otherVersion =
      typeof other === 'string' ? new EvergreenVersion(other) : other;
    return (
      this.major - otherVersion.major ||
      this.minor - otherVersion.minor ||
      this.patch - otherVersion.patch
    );
  }

  lessThan(other: EvergreenVersion | string): boolean {
    return this.compare(other) < 0;
  }

  lessOrEqualTo(other: EvergreenVersion | string): boolean {
    return this.compare(other) <= 0;
  }

  greaterThan(other: EvergreenVersion | string): boolean {
    return this.compare(other) > 0;
  }

  greaterOrEqualTo(other: EvergreenVersion | string): boolean {
    return this.compare(other) >= 0;
  }
}

/** Cobalt flavor. */
export enum CobaltFlavor {
  DEBUG = 'debug',
  DEVEL = 'devel',
  QA = 'qa',
  GOLD = 'gold',
  UNKNOWN = 'unknown',
}

/**
 * Represents a Cobalt version: "25.lts.21.1034899-qa".
 */
export class CobaltVersion {
  lts: number = -1;
  release: number = -1;
  buildId: number = -1;
  flavor: CobaltFlavor = CobaltFlavor.UNKNOWN;

  constructor(private readonly stringRep = '') {
    if (!stringRep) {
      return;
    }

    const cobaltMatches = COBALT_VERSION_MATCHER.exec(stringRep);
    if (!cobaltMatches || cobaltMatches.length !== 5) {
      throw new Error(`Invalid Cobalt version: ${stringRep}.`);
    }
    this.lts = Number(cobaltMatches[1]);
    this.release = Number(cobaltMatches[2]);
    this.buildId = Number(cobaltMatches[3]);
    this.flavor = cobaltMatches[4] as CobaltFlavor;
  }

  /** Compare the Cobalt versions, ignoring the flavor. */
  compare(other: CobaltVersion | string): number {
    const otherVersion =
      typeof other === 'string' ? new CobaltVersion(other) : other;
    return (
      this.lts - otherVersion.lts ||
      this.release - otherVersion.release ||
      this.buildId - otherVersion.buildId
    );
  }

  lessThan(other: CobaltVersion | string): boolean {
    return this.compare(other) < 0;
  }

  lessOrEqualTo(other: CobaltVersion | string): boolean {
    return this.compare(other) <= 0;
  }

  greaterThan(other: CobaltVersion | string): boolean {
    return this.compare(other) > 0;
  }

  greaterOrEqualTo(other: CobaltVersion | string): boolean {
    return this.compare(other) >= 0;
  }

  toString(): string {
    return this.stringRep;
  }
}

/**
 * Represents a UserAgent string parsed and converted to individual parts as an
 * object.
 */
export class CobaltUserAgent {
  osNameAndVersion: string;
  cobaltVersion: CobaltVersion;
  starboardVersion: number;
  deviceNameBlock: string;
  firmware: string;
  brand: string;
  model: string;
  evergreenVersion: EvergreenVersion;

  constructor(readonly userAgent: string) {
    const matched = UA_MATCHER.exec(userAgent);
    if (!matched) {
      throw new Error(`Unable to parse user agent format: ${userAgent}.`);
    }

    this.osNameAndVersion = matched[1];
    this.cobaltVersion = new CobaltVersion(matched[2]);
    this.starboardVersion = Number(matched[3]);
    this.deviceNameBlock = matched[4].trim();
    this.firmware = matched[5];
    this.brand = matched[6];
    this.model = matched[7];

    const evergreenMatches = EVERGREEN_VERSION_MATCHER.exec(userAgent);
    this.evergreenVersion = new EvergreenVersion(
      evergreenMatches?.[1] || '',
      userAgent.includes('Evergreen-Full'),
    );
  }
}
