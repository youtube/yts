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
 * @fileoverview Custom logger for DAB
 */

/**
 * Log levels for log function
 */
enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Custom console log function that adds a timestamp in UTC and log level to the log message.
 */
function log(level: LogLevel, ...data: unknown[]) {
  try {
    const utcDate = new Date();
    const pstDate = utcDate.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
    });

    const formattedData = data.map((item) => {
      if (item instanceof Error) {
        return item.stack || item.toString(); // Prioritize stack trace for debugging
      } else if (typeof item === 'object') {
        return JSON.stringify(item, null, 2);
      } else if (item == null) {
        return '';
      } else {
        return item.toString();
      }
    });

    const message = formattedData.join(' ');

    console.log(`[${pstDate}] [${level}] ${message}`);
  } catch (e: unknown) {
    return;
  }
}

/**
 * Logs an info message to the console.
 */
export function info(...data: unknown[]) {
  log(LogLevel.INFO, ...data);
}

/**
 * Logs a warning message to the console.
 */
export function warn(...data: unknown[]) {
  log(LogLevel.WARN, ...data);
}

/**
 * Logs an error message to the console.
 */
export function error(...data: unknown[]) {
  log(LogLevel.ERROR, ...data);
}
