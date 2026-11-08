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

/** Converts seconds to milliseconds. */
export function seconds(x: number): number {
  return x * 1000;
}

/** Converts minutes to milliseconds. */
export function minutes(x: number): number {
  return seconds(x * 60);
}

/** Converts hours to milliseconds. */
export function hours(x: number): number {
  return minutes(x * 60);
}

/**
 * Formats a duration in milliseconds as a human-readable string (e.g. "10s",
 * "1m", "1h 30m 1s").
 */
export function prettyMs(ms: number): string {
  if (!Number.isFinite(ms)) {
    return String(ms);
  }
  if (ms < 0) {
    return `-${prettyMs(-ms)}`;
  }
  const totalMs = Math.round(ms);
  if (totalMs === 0) {
    return '0s';
  }
  const h = Math.floor(totalMs / hours(1));
  const m = Math.floor((totalMs % hours(1)) / minutes(1));
  const s = Math.floor((totalMs % minutes(1)) / seconds(1));
  const remMs = totalMs % seconds(1);

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);
  if (remMs > 0) parts.push(`${remMs}ms`);
  return parts.join(' ');
}
