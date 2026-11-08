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
 * @fileoverview Unit tests for shared Cobalt 27+ memory telemetry utilities.
 */

import 'jasmine';

import {
  buildSystemMemoryPayload,
  computeMemorySummary,
  computeSampleCeilingPeakMb,
  evaluateMemoryApiAccuracy,
  extractMemorySampleFromStats,
  getAllMemoryStats,
  parseSafeBytes,
  querySystemMemoryInfo,
  toLoggableString,
  toSafeMb,
} from './memory_utils';

describe('memory_utils', () => {
  describe('toLoggableString', () => {
    it('formats timestamped log lines with optional arguments', () => {
      expect(toLoggableString('Starting CUJ')).toMatch(
        /^\[\d{2}:\d{2}:\d{2}\.\d{3}\] Starting CUJ$/,
      );
      expect(toLoggableString('Sample:', 42, {ok: true})).toMatch(
        /^\[\d{2}:\d{2}:\d{2}\.\d{3}\] Sample: 42 \{"ok":true\}$/,
      );
    });
  });

  describe('parseSafeBytes', () => {
    it('returns non-negative finite numbers', () => {
      expect(parseSafeBytes(0)).toBe(0);
      expect(parseSafeBytes(1048576)).toBe(1048576);
    });

    it('returns null for negative, non-finite, or non-numeric values', () => {
      expect(parseSafeBytes(-1)).toBeNull();
      expect(parseSafeBytes(NaN)).toBeNull();
      expect(parseSafeBytes(Infinity)).toBeNull();
      expect(parseSafeBytes(null)).toBeNull();
      expect(parseSafeBytes(undefined)).toBeNull();
      expect(parseSafeBytes('2097152')).toBeNull();
      expect(parseSafeBytes(true)).toBeNull();
      expect(parseSafeBytes({})).toBeNull();
    });
  });

  describe('toSafeMb', () => {
    it('converts bytes to megabytes rounded to two decimals', () => {
      expect(toSafeMb(0)).toBe(0);
      expect(toSafeMb(1048576)).toBe(1);
      expect(toSafeMb(1572864)).toBe(1.5);
    });

    it('returns null for invalid inputs', () => {
      expect(toSafeMb(null)).toBeNull();
      expect(toSafeMb(-1024)).toBeNull();
      expect(toSafeMb('abc')).toBeNull();
    });
  });

  describe('querySystemMemoryInfo', () => {
    it('invokes measureSystemMemoryInfo on window.performance', () => {
      const fakeWindow = {
        performance: {
          measureSystemMemoryInfo: () => ({
            usedRssMemory: 150 * 1024 * 1024,
            usedJSHeapSize: 25 * 1024 * 1024,
          }),
        },
      } as unknown as Window;

      expect(querySystemMemoryInfo(fakeWindow)).toEqual({
        usedRssMemory: 157286400,
        usedJSHeapSize: 26214400,
      });
    });

    it('returns null when measureSystemMemoryInfo is absent or throws', () => {
      const noPerfWin = {} as unknown as Window;
      expect(querySystemMemoryInfo(noPerfWin)).toBeNull();

      const throwingWin = {
        performance: {
          measureSystemMemoryInfo: () => {
            throw new Error('IPC error');
          },
        },
      } as unknown as Window;
      expect(querySystemMemoryInfo(throwingWin)).toBeNull();
    });
  });

  describe('buildSystemMemoryPayload and getAllMemoryStats', () => {
    it('converts SystemMemoryInfoData into *Bytes and *Mb fields', () => {
      const mb = 1024 * 1024;
      const payload = buildSystemMemoryPayload({
        usedRssMemory: 120 * mb,
        freeRssMemory: 300 * mb,
        usedSwapMemory: 10 * mb,
        usedJSHeapSize: 16 * mb,
      });
      expect(payload.usedRssBytes).toBe(120 * mb);
      expect(payload.usedRssMb).toBe(120);
      expect(payload.freeRssMb).toBe(300);
      expect(payload.usedSwapMb).toBe(10);
      expect(payload.usedJsHeapMb).toBe(16);
      expect(payload.rssHighWaterMarkMb).toBeNull();

      const fakeWin = {
        performance: {
          measureSystemMemoryInfo: () => ({
            usedRssMemory: 90 * mb,
            usedJSHeapSize: 12 * mb,
          }),
        },
      } as unknown as Window;
      const stats = getAllMemoryStats(fakeWin);
      expect(stats.systemMemoryInfo.usedRssMb).toBe(90);
      expect(stats.systemMemoryInfo.usedJsHeapMb).toBe(12);
    });
  });

  describe('evaluateMemoryApiAccuracy', () => {
    it('computes accurate RSS and JS heap deltas when SystemMemoryInfoData is valid', () => {
      const mb = 1024 * 1024;
      const before = {
        usedRssMemory: 120 * mb,
        freeRssMemory: 400 * mb,
        totalCpuMemory: 1024 * mb,
        usedJSHeapSize: 20 * mb,
        totalJSHeapSize: 32 * mb,
        jsHeapSizeLimit: 512 * mb,
      };
      const after = {
        usedRssMemory: 172 * mb,
        freeRssMemory: 348 * mb,
        totalCpuMemory: 1024 * mb,
        usedJSHeapSize: 28 * mb,
        totalJSHeapSize: 40 * mb,
        jsHeapSizeLimit: 512 * mb,
      };

      const result = evaluateMemoryApiAccuracy(before, after, 50 * mb);

      expect(result).toEqual({
        supported: true,
        usedRssBeforeBytes: 120 * mb,
        usedRssAfterBytes: 172 * mb,
        usedRssDeltaBytes: 52 * mb,
        freeRssBeforeBytes: 400 * mb,
        freeRssAfterBytes: 348 * mb,
        totalCpuBytes: 1024 * mb,
        usedHeapBeforeBytes: 20 * mb,
        totalHeapBeforeBytes: 32 * mb,
        heapLimitBytes: 512 * mb,
        allocatedBytes: 50 * mb,
        usedHeapAfterBytes: 28 * mb,
        totalHeapAfterBytes: 40 * mb,
        usedHeapDeltaBytes: 8 * mb,
      });
    });

    it('returns supported: false when SystemMemoryInfoData or required fields are missing', () => {
      expect(evaluateMemoryApiAccuracy(null, null, 0).supported).toBe(false);

      expect(
        evaluateMemoryApiAccuracy(
          {usedJSHeapSize: 20 * 1024 * 1024},
          {usedJSHeapSize: 25 * 1024 * 1024},
          50 * 1024 * 1024,
        ).supported,
      ).toBe(false);

      expect(
        evaluateMemoryApiAccuracy(
          {usedRssMemory: 120 * 1024 * 1024},
          {usedRssMemory: 170 * 1024 * 1024},
          50 * 1024 * 1024,
        ).supported,
      ).toBe(false);

      expect(
        evaluateMemoryApiAccuracy(
          {usedRssMemory: 0, usedJSHeapSize: 20 * 1024 * 1024},
          {
            usedRssMemory: 50 * 1024 * 1024,
            usedJSHeapSize: 25 * 1024 * 1024,
          },
          50 * 1024 * 1024,
        ).supported,
      ).toBe(false);
    });
  });

  describe('extractMemorySampleFromStats', () => {
    it('normalizes SystemMemoryPayload fields and derives privateFootprintMb', () => {
      const sample = extractMemorySampleFromStats(
        {
          systemMemoryInfo: {
            usedRssMb: 210,
            usedRssAnonMb: 180,
            usedSwapMb: 20,
            freeRssMb: 300,
            rssHighWaterMarkMb: 240,
            usedPssMb: 195,
            applicationLimitMb: 512,
            applicationUsageMb: 210,
            mediaAllocatedMb: 45,
            mediaCapacityMb: 60,
            mediaMaxCapacityMb: 120,
            usedJsHeapMb: 32,
            totalJsHeapMb: 48,
            jsHeapLimitMb: 512,
            reservedVirtualMb: 1024,
            usedGpuMb: 55,
          },
          domNodeCount: 1450,
        },
        {elapsedSec: 12},
      );

      expect(sample.elapsedSec).toBe(12);
      expect(sample.rssMb).toBe(210);
      expect(sample.anonRssMb).toBe(180);
      expect(sample.swapMb).toBe(20);
      expect(sample.privateFootprintMb).toBe(200);
      expect(sample.availRamMb).toBe(300);
      expect(sample.rssHwmMb).toBe(240);
      expect(sample.pssMb).toBe(195);
      expect(sample.mediaAllocatedMb).toBe(45);
      expect(sample.mediaCapacityMb).toBe(60);
      expect(sample.mediaMaxCapacityMb).toBe(120);
      expect(sample.jsHeapMb).toBe(32);
      expect(sample.gpuUsedMb).toBe(55);
      expect(sample.domNodes).toBe(1450);
    });
  });

  describe('computeMemorySummary', () => {
    it('computes peak and mean statistics across samples', () => {
      const summary = computeMemorySummary(
        [
          {
            rssMb: 200,
            swapMb: 10,
            privateFootprintMb: 190,
            availRamMb: 310,
            jsHeapMb: 30,
            domNodes: 1200,
          },
          {
            rssMb: 250,
            swapMb: 20,
            privateFootprintMb: 240,
            availRamMb: 260,
            jsHeapMb: 42,
            domNodes: 1500,
          },
        ],
        60,
        180,
      );

      expect(summary.durationSec).toBe(60);
      expect(summary.totalSamples).toBe(2);
      expect(summary.peakRssMb).toBe(250);
      expect(summary.meanRssMb).toBe(225);
      expect(summary.peakSwapMb).toBe(20);
      expect(summary.peakPrivateFootprintMb).toBe(240);
      expect(summary.peakJsHeapMb).toBe(42);
      expect(summary.peakDomNodes).toBe(1500);
      expect(summary.lastAvailRamMb).toBe(260);
      expect(summary.baselineRssMb).toBe(180);
      expect(summary.deltaFromBaselineMb).toBe(70);
    });

    it('prefers rssHwmMb over rssMb when computing peakRssMb', () => {
      const summary = computeMemorySummary(
        [
          {
            rssMb: 200,
            rssHwmMb: 215,
            swapMb: 0,
            privateFootprintMb: 200,
            availRamMb: 300,
          },
          {
            rssMb: 230,
            rssHwmMb: 265,
            swapMb: 10,
            privateFootprintMb: 240,
            availRamMb: 270,
          },
        ],
        60,
        180,
      );

      expect(summary.peakRssMb).toBe(265);
      expect(summary.meanRssMb).toBe(215);
      expect(summary.deltaFromBaselineMb).toBe(85);
    });
  });

  describe('computeSampleCeilingPeakMb', () => {
    it('accounts for zRAM swap when rssHwmMb is throttled by cold-chunk eviction', () => {
      const ceilingMb = computeSampleCeilingPeakMb({
        rssMb: 22.28,
        rssHwmMb: 137,
        swapMb: 257.22,
        privateFootprintMb: 277.5,
      });

      expect(ceilingMb).toBe(279.5);
    });

    it('returns rssHwmMb on devices without swap activity', () => {
      const ceilingMb = computeSampleCeilingPeakMb({
        rssMb: 230,
        rssHwmMb: 265,
        swapMb: 0,
        privateFootprintMb: 230,
      });

      expect(ceilingMb).toBe(265);
    });

    it('returns privateFootprintMb when it exceeds rssHwmMb and rssMb is absent', () => {
      const ceilingMb = computeSampleCeilingPeakMb({
        rssMb: null,
        rssHwmMb: 137,
        swapMb: 257.22,
        privateFootprintMb: 277.5,
      });

      expect(ceilingMb).toBe(277.5);
    });

    it('returns null when all memory metrics are null or undefined', () => {
      expect(computeSampleCeilingPeakMb({})).toBeNull();
      expect(
        computeSampleCeilingPeakMb({
          rssMb: null,
          rssHwmMb: null,
          swapMb: null,
          privateFootprintMb: null,
        }),
      ).toBeNull();
    });
  });
});

