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
 * @fileoverview Shared Cobalt 27+ `SystemMemoryInfo` telemetry interfaces and
 * helper utilities used by device-side scripts and Node.js YTS test runners.
 */

/** Raw Cobalt 27+ SystemMemoryInfo fields returned by `window.performance.measureSystemMemoryInfo()`. */
export interface SystemMemoryInfoData {
  usedRssMemory?: number;
  freeRssMemory?: number;
  usedSwapMemory?: number;
  reservedVirtualMemory?: number;
  rssHighWaterMarkMemory?: number;
  usedRssAnonMemory?: number;
  totalCpuMemory?: number;
  usedPssMemory?: number;
  applicationLimitMemory?: number;
  applicationUsageMemory?: number;
  usedGpuMemory?: number;
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
  mediaSourceTotalAllocatedMemory?: number;
  mediaSourceCurrentMemoryCapacity?: number;
  mediaSourceMaximumMemoryCapacity?: number;
}

/** Formatted system memory payload with both raw bytes and megabytes. */
export interface SystemMemoryPayload {
  usedRssBytes: number | null;
  usedRssMb: number | null;
  freeRssBytes: number | null;
  freeRssMb: number | null;
  usedSwapBytes: number | null;
  usedSwapMb: number | null;
  reservedVirtualBytes: number | null;
  reservedVirtualMb: number | null;
  rssHighWaterMarkBytes: number | null;
  rssHighWaterMarkMb: number | null;
  usedRssAnonBytes: number | null;
  usedRssAnonMb: number | null;
  totalCpuBytes: number | null;
  totalCpuMb: number | null;
  usedPssBytes: number | null;
  usedPssMb: number | null;
  applicationLimitBytes: number | null;
  applicationLimitMb: number | null;
  applicationUsageBytes: number | null;
  applicationUsageMb: number | null;
  usedGpuBytes: number | null;
  usedGpuMb: number | null;
  usedJsHeapBytes: number | null;
  usedJsHeapMb: number | null;
  totalJsHeapBytes: number | null;
  totalJsHeapMb: number | null;
  jsHeapLimitBytes: number | null;
  jsHeapLimitMb: number | null;
  mediaAllocatedBytes: number | null;
  mediaAllocatedMb: number | null;
  mediaCapacityBytes: number | null;
  mediaCapacityMb: number | null;
  mediaMaxCapacityBytes: number | null;
  mediaMaxCapacityMb: number | null;
}

/** Structured return type of `getAllMemoryStats()` on the DUT. */
export interface MemoryStats {
  timestamp: number;
  isoTime: string;
  userAgent: string;
  systemMemoryInfo: SystemMemoryPayload;
  domNodeCount?: number;
}

/** Result returned by `runStressLoopOnDUT()`. */
export interface StressLoopResult {
  reachedMB: number;
  stoppedReason: string;
}

/** Result returned by `measureMemoryApiAccuracy()`. */
export interface MemoryApiAccuracyResult {
  supported: boolean;
  usedRssBeforeBytes: number;
  usedRssAfterBytes: number;
  usedRssDeltaBytes: number;
  freeRssBeforeBytes: number | null;
  freeRssAfterBytes: number | null;
  totalCpuBytes: number | null;
  usedHeapBeforeBytes: number;
  totalHeapBeforeBytes: number;
  heapLimitBytes: number;
  allocatedBytes: number;
  usedHeapAfterBytes: number;
  totalHeapAfterBytes: number;
  usedHeapDeltaBytes: number;
}

/** Normalized per-sample memory telemetry entry. */
export interface MemorySample {
  allocatedMB?: number;
  elapsedSec?: number;
  timestamp?: number;
  rssMb?: number | null;
  swapMb?: number | null;
  availRamMb?: number | null;
  privateFootprintMb?: number | null;
  anonRssMb?: number | null;
  rssHwmMb?: number | null;
  pssMb?: number | null;
  appLimitMb?: number | null;
  appUsageMb?: number | null;
  jsHeapMb?: number | null;
  totalJsHeapMb?: number | null;
  jsHeapLimitMb?: number | null;
  reservedVirtualMb?: number | null;
  mediaAllocatedMb?: number | null;
  mediaCapacityMb?: number | null;
  mediaMaxCapacityMb?: number | null;
  gpuUsedMb?: number | null;
  domNodes?: number | null;
  rawStats?: MemoryStats | Record<string, unknown> | null;
}

/** Aggregated summary statistics across a sequence of `MemorySample` entries. */
export interface MemorySummary {
  durationSec: number;
  totalSamples: number;
  peakRssMb: number | null;
  meanRssMb: number | null;
  peakSwapMb: number | null;
  peakPrivateFootprintMb: number | null;
  peakJsHeapMb: number | null;
  peakDomNodes: number | null;
  lastAvailRamMb: number | null;
  baselineRssMb?: number | null;
  deltaFromBaselineMb?: number | null;
  ceilingPeakRssMb?: number | null;
  maxAllowedPeakRssMb?: number | null;
}

/** Formats a timestamped log line from a message and optional arguments. */
export function toLoggableString(msg: string, ...args: unknown[]): string {
  const time = new Date().toISOString().slice(11, 23);
  if (args.length === 0) {
    return `[${time}] ${msg}`;
  }
  const formattedArgs = args
    .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
    .join(' ');
  return `[${time}] ${msg} ${formattedArgs}`;
}

/**
 * Validates a byte count as a non-negative finite number, or returns null.
 */
export function parseSafeBytes(rawValue: unknown): number | null {
  return typeof rawValue === 'number' &&
    Number.isFinite(rawValue) &&
    rawValue >= 0
    ? rawValue
    : null;
}

/**
 * Converts a byte count into megabytes rounded to two decimal places, or
 * returns null if invalid.
 */
export function toSafeMb(rawBytes: unknown): number | null {
  const validBytes = parseSafeBytes(rawBytes);
  if (validBytes === null) return null;
  return Number((validBytes / (1024 * 1024)).toFixed(2));
}

interface PerformanceWithSystemMemoryInfo {
  measureSystemMemoryInfo?: () => SystemMemoryInfoData;
}

/**
 * Queries Cobalt 27+'s `window.performance.measureSystemMemoryInfo()` API.
 */
export function querySystemMemoryInfo(
  win?: Window,
): SystemMemoryInfoData | null {
  const targetWin =
    win ?? (typeof window !== 'undefined' ? window : undefined);
  const perf = targetWin?.performance as unknown as
    | PerformanceWithSystemMemoryInfo
    | undefined;
  if (typeof perf?.measureSystemMemoryInfo !== 'function') {
    return null;
  }
  try {
    return perf.measureSystemMemoryInfo();
  } catch {
    return null;
  }
}

/**
 * Converts a Cobalt 27+ `SystemMemoryInfoData` object into a normalized
 * `SystemMemoryPayload` with `*Bytes` and `*Mb` fields.
 */
export function buildSystemMemoryPayload(
  info: SystemMemoryInfoData | null | undefined,
): SystemMemoryPayload {
  return {
    usedRssBytes: parseSafeBytes(info?.usedRssMemory),
    usedRssMb: toSafeMb(info?.usedRssMemory),
    freeRssBytes: parseSafeBytes(info?.freeRssMemory),
    freeRssMb: toSafeMb(info?.freeRssMemory),
    usedSwapBytes: parseSafeBytes(info?.usedSwapMemory),
    usedSwapMb: toSafeMb(info?.usedSwapMemory),
    reservedVirtualBytes: parseSafeBytes(info?.reservedVirtualMemory),
    reservedVirtualMb: toSafeMb(info?.reservedVirtualMemory),
    rssHighWaterMarkBytes: parseSafeBytes(info?.rssHighWaterMarkMemory),
    rssHighWaterMarkMb: toSafeMb(info?.rssHighWaterMarkMemory),
    usedRssAnonBytes: parseSafeBytes(info?.usedRssAnonMemory),
    usedRssAnonMb: toSafeMb(info?.usedRssAnonMemory),
    totalCpuBytes: parseSafeBytes(info?.totalCpuMemory),
    totalCpuMb: toSafeMb(info?.totalCpuMemory),
    usedPssBytes: parseSafeBytes(info?.usedPssMemory),
    usedPssMb: toSafeMb(info?.usedPssMemory),
    applicationLimitBytes: parseSafeBytes(info?.applicationLimitMemory),
    applicationLimitMb: toSafeMb(info?.applicationLimitMemory),
    applicationUsageBytes: parseSafeBytes(info?.applicationUsageMemory),
    applicationUsageMb: toSafeMb(info?.applicationUsageMemory),
    usedGpuBytes: parseSafeBytes(info?.usedGpuMemory),
    usedGpuMb: toSafeMb(info?.usedGpuMemory),
    usedJsHeapBytes: parseSafeBytes(info?.usedJSHeapSize),
    usedJsHeapMb: toSafeMb(info?.usedJSHeapSize),
    totalJsHeapBytes: parseSafeBytes(info?.totalJSHeapSize),
    totalJsHeapMb: toSafeMb(info?.totalJSHeapSize),
    jsHeapLimitBytes: parseSafeBytes(info?.jsHeapSizeLimit),
    jsHeapLimitMb: toSafeMb(info?.jsHeapSizeLimit),
    mediaAllocatedBytes: parseSafeBytes(info?.mediaSourceTotalAllocatedMemory),
    mediaAllocatedMb: toSafeMb(info?.mediaSourceTotalAllocatedMemory),
    mediaCapacityBytes: parseSafeBytes(info?.mediaSourceCurrentMemoryCapacity),
    mediaCapacityMb: toSafeMb(info?.mediaSourceCurrentMemoryCapacity),
    mediaMaxCapacityBytes: parseSafeBytes(
      info?.mediaSourceMaximumMemoryCapacity,
    ),
    mediaMaxCapacityMb: toSafeMb(info?.mediaSourceMaximumMemoryCapacity),
  };
}

/**
 * Gathers Cobalt 27+ memory metrics on the DUT via
 * `window.performance.measureSystemMemoryInfo()`.
 */
export function getAllMemoryStats(win?: Window): MemoryStats {
  const domNodeCount =
    typeof document !== 'undefined'
      ? document.getElementsByTagName('*').length
      : 0;
  return {
    timestamp: Date.now(),
    isoTime: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    systemMemoryInfo: buildSystemMemoryPayload(querySystemMemoryInfo(win)),
    domNodeCount,
  };
}

/**
 * Evaluates Cobalt 27+ `SystemMemoryInfo` measurements taken before and after
 * a known memory allocation.
 */
export function evaluateMemoryApiAccuracy(
  before: SystemMemoryInfoData | null,
  after: SystemMemoryInfoData | null,
  allocatedBytes: number,
): MemoryApiAccuracyResult {
  const usedRssBefore = parseSafeBytes(before?.usedRssMemory);
  const usedRssAfter = parseSafeBytes(after?.usedRssMemory);
  const usedHeapBefore = parseSafeBytes(before?.usedJSHeapSize);
  const usedHeapAfter = parseSafeBytes(after?.usedJSHeapSize);

  const supported =
    usedRssBefore !== null &&
    usedRssBefore > 0 &&
    usedRssAfter !== null &&
    usedRssAfter > 0 &&
    usedHeapBefore !== null &&
    usedHeapBefore > 0 &&
    usedHeapAfter !== null &&
    usedHeapAfter > 0;

  return {
    supported,
    usedRssBeforeBytes: usedRssBefore ?? 0,
    usedRssAfterBytes: usedRssAfter ?? 0,
    usedRssDeltaBytes:
      usedRssBefore !== null && usedRssAfter !== null
        ? usedRssAfter - usedRssBefore
        : 0,
    freeRssBeforeBytes: parseSafeBytes(before?.freeRssMemory),
    freeRssAfterBytes: parseSafeBytes(after?.freeRssMemory),
    totalCpuBytes:
      parseSafeBytes(after?.totalCpuMemory) ??
      parseSafeBytes(before?.totalCpuMemory),
    usedHeapBeforeBytes: usedHeapBefore ?? 0,
    totalHeapBeforeBytes: parseSafeBytes(before?.totalJSHeapSize) ?? 0,
    heapLimitBytes:
      parseSafeBytes(before?.jsHeapSizeLimit) ??
      parseSafeBytes(after?.jsHeapSizeLimit) ??
      0,
    allocatedBytes,
    usedHeapAfterBytes: usedHeapAfter ?? 0,
    totalHeapAfterBytes: parseSafeBytes(after?.totalJSHeapSize) ?? 0,
    usedHeapDeltaBytes:
      usedHeapBefore !== null && usedHeapAfter !== null
        ? usedHeapAfter - usedHeapBefore
        : 0,
  };
}

/**
 * Extracts a normalized `MemorySample` from a Cobalt 27+ `MemoryStats` payload.
 */
export function extractMemorySampleFromStats(
  stats: MemoryStats | Record<string, unknown>,
  extra?: Partial<MemorySample>,
): MemorySample {
  const record = stats as Record<string, unknown>;
  const sys =
    (record['systemMemoryInfo'] as Partial<SystemMemoryPayload> | undefined) ??
    {};

  const rssMb = sys.usedRssMb ?? null;
  const swapMb = sys.usedSwapMb ?? null;
  const availRamMb = sys.freeRssMb ?? null;
  const anonRssMb = sys.usedRssAnonMb ?? null;
  const rssHwmMb = sys.rssHighWaterMarkMb ?? null;
  const pssMb = sys.usedPssMb ?? null;
  const appLimitMb = sys.applicationLimitMb ?? null;
  const appUsageMb = sys.applicationUsageMb ?? null;
  const mediaAllocatedMb = sys.mediaAllocatedMb ?? null;
  const mediaCapacityMb = sys.mediaCapacityMb ?? null;
  const mediaMaxCapacityMb = sys.mediaMaxCapacityMb ?? null;
  const baseRss = anonRssMb ?? rssMb;
  const privateFootprintMb =
    baseRss !== null && swapMb !== null
      ? Number((baseRss + swapMb).toFixed(2))
      : baseRss;

  return {
    timestamp: Date.now(),
    rssMb,
    swapMb,
    availRamMb,
    privateFootprintMb,
    anonRssMb,
    rssHwmMb,
    pssMb,
    appLimitMb,
    appUsageMb,
    jsHeapMb: sys.usedJsHeapMb ?? null,
    totalJsHeapMb: sys.totalJsHeapMb ?? null,
    jsHeapLimitMb: sys.jsHeapLimitMb ?? null,
    reservedVirtualMb: sys.reservedVirtualMb ?? null,
    mediaAllocatedMb,
    mediaCapacityMb,
    mediaMaxCapacityMb,
    gpuUsedMb: sys.usedGpuMb ?? null,
    domNodes:
      typeof record['domNodeCount'] === 'number' ? record['domNodeCount'] : 0,
    ...extra,
  };
}

/**
 * Computes summary statistics across a sequence of `MemorySample` entries.
 */
export function computeMemorySummary(
  samples: readonly MemorySample[],
  durationSec = 0,
  baselineRssMb?: number,
): MemorySummary {
  const nums = (getter: (sample: MemorySample) => unknown): number[] =>
    samples
      .map(getter)
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  const maxOrNull = (values: readonly number[]): number | null =>
    values.length > 0 ? Math.max(...values) : null;

  const rssVals = nums((sample) => sample.rssMb);
  const peakRssVals = nums((sample) => sample.rssHwmMb ?? sample.rssMb);
  const availVals = nums((sample) => sample.availRamMb);
  const peakRssMb = maxOrNull(peakRssVals);
  const deltaFromBaselineMb =
    typeof baselineRssMb === 'number' &&
    Number.isFinite(baselineRssMb) &&
    peakRssMb !== null
      ? Number((peakRssMb - baselineRssMb).toFixed(2))
      : null;

  return {
    durationSec,
    totalSamples: samples.length,
    peakRssMb,
    meanRssMb:
      rssVals.length > 0
        ? Number(
            (rssVals.reduce((a, b) => a + b, 0) / rssVals.length).toFixed(2),
          )
        : null,
    peakSwapMb: maxOrNull(nums((sample) => sample.swapMb)),
    peakPrivateFootprintMb: maxOrNull(
      nums((sample) => sample.privateFootprintMb),
    ),
    peakJsHeapMb: maxOrNull(nums((sample) => sample.jsHeapMb)),
    peakDomNodes: maxOrNull(nums((sample) => sample.domNodes)),
    lastAvailRamMb:
      availVals.length > 0 ? availVals[availVals.length - 1] : null,
    ...(typeof baselineRssMb === 'number'
      ? {baselineRssMb, deltaFromBaselineMb}
      : {}),
  };
}

/**
 * Computes the effective memory ceiling (in MB) reached at a single balloon
 * probe sample, taking the maximum of RSS High Water Mark (`rssHwmMb`),
 * total resident + swapped memory (`rssMb + swapMb`), and private memory
 * footprint (`privateFootprintMb`) so that kernel zRAM swapping of cold
 * `ArrayBuffer` chunks does not artificially depress the measured device
 * ceiling.
 */
export function computeSampleCeilingPeakMb(
  sample: MemorySample,
): number | null {
  const candidates: number[] = [];
  if (typeof sample.rssHwmMb === 'number' && Number.isFinite(sample.rssHwmMb)) {
    candidates.push(sample.rssHwmMb);
  }
  if (typeof sample.rssMb === 'number' && Number.isFinite(sample.rssMb)) {
    const swapMb =
      typeof sample.swapMb === 'number' && Number.isFinite(sample.swapMb)
        ? sample.swapMb
        : 0;
    candidates.push(Number((sample.rssMb + swapMb).toFixed(2)));
  }
  if (
    typeof sample.privateFootprintMb === 'number' &&
    Number.isFinite(sample.privateFootprintMb)
  ) {
    candidates.push(sample.privateFootprintMb);
  }
  return candidates.length > 0 ? Math.max(...candidates) : null;
}

