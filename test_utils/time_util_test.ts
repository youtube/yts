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

import {createNtpRequest, parseNtpResponse} from './time_util';

describe('TimeUtil', () => {
  it('creates a valid 48-byte NTPv4 client request', () => {
    const beforeMs = Date.now();
    const buffer = createNtpRequest();
    const afterMs = Date.now();

    expect(buffer.byteLength).toBe(48);

    const view = new DataView(buffer);
    const firstByte = view.getUint8(0);
    const leap = (firstByte >> 6) & 0x03;
    const version = (firstByte >> 3) & 0x07;
    const mode = firstByte & 0x07;

    expect(leap).toBe(3); // Clock unsynchronized
    expect(version).toBe(4); // NTPv4
    expect(mode).toBe(3); // Client mode

    // Check transmit timestamp in request
    const xmtSeconds = view.getUint32(40, false);
    const xmtFraction = view.getUint32(44, false);
    const NTP_DELTA_SECONDS = 2208988800;
    const unixSeconds = xmtSeconds - NTP_DELTA_SECONDS;

    expect(unixSeconds).toBeGreaterThanOrEqual(Math.floor(beforeMs / 1000));
    expect(unixSeconds).toBeLessThanOrEqual(Math.ceil(afterMs / 1000));
    expect(xmtFraction).toBeGreaterThanOrEqual(0);
  });

  it('parses an NTP response packet correctly', () => {
    const buffer = new ArrayBuffer(48);
    const view = new DataView(buffer);

    // Set mock timestamps (2026-10-29 00:00:00 UTC)
    // Unix seconds: 1793232000
    // NTP seconds: 1793232000 + 2208988800 = 4002220800
    const NTP_DELTA_SECONDS = 2208988800;
    const unixTargetSec = 1793232000;
    const ntpSec = unixTargetSec + NTP_DELTA_SECONDS;
    const halfFrac = 0x80000000; // 0.5s = 500ms

    // Org timestamp at byte 24
    view.setUint32(24, ntpSec, false);
    view.setUint32(28, halfFrac, false);

    // Rec timestamp at byte 32
    view.setUint32(32, ntpSec + 1, false);
    view.setUint32(36, 0, false);

    // Xmt timestamp at byte 40
    view.setUint32(40, ntpSec + 1, false);
    view.setUint32(44, halfFrac, false);

    const packet = parseNtpResponse(view);

    expect(packet.org.getTime()).toBe((unixTargetSec * 1000) + 500);
    expect(packet.rec.getTime()).toBe((unixTargetSec + 1) * 1000);
    expect(packet.xmt.getTime()).toBe(((unixTargetSec + 1) * 1000) + 500);
    expect(packet.dst).toBeDefined();
    expect(packet.dst.getTime()).toBeGreaterThan(0);
  });

  it('handles zero or unset timestamps in response gracefully', () => {
    const buffer = new ArrayBuffer(48);
    const view = new DataView(buffer);

    const packet = parseNtpResponse(view);

    expect(packet.org.getTime()).toBe(0);
    expect(packet.rec.getTime()).toBe(0);
    expect(packet.xmt.getTime()).toBe(0);
  });

  it('preserves sub-millisecond precision with BigInt rounding', () => {
    const buffer = new ArrayBuffer(48);
    const view = new DataView(buffer);

    const NTP_DELTA_SECONDS = 2208988800;
    const unixTargetSec = 1793232000;
    const ntpSec = unixTargetSec + NTP_DELTA_SECONDS;

    // 123 ms in fraction: (123 * 2^32) / 1000 = 528280977.4... -> 528280977
    const frac123Ms = 528280977;

    view.setUint32(40, ntpSec, false);
    view.setUint32(44, frac123Ms, false);

    const packet = parseNtpResponse(view);
    expect(packet.xmt.getTime()).toBe((unixTargetSec * 1000) + 123);
  });
});
