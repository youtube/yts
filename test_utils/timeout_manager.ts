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
 * @fileoverview A manager for tracking and clearing active timeouts and
 * intervals.
 */

interface TimerData {
  id: number;
  uid: number;
  func: () => void;
}

/**
 * A manager for tracking and clearing active timeouts and intervals.
 * Helps prevent zombie callbacks across test boundaries.
 */
export class TimeoutManager {
  private timers: Array<TimerData|undefined> = [];
  private intervals: Array<TimerData|undefined> = [];

  private getUniqueItem(container: Array<TimerData|undefined>): TimerData {
    let id = 0;
    while (container[id] !== undefined) {
      id++;
    }
    const item: TimerData = {id, uid: 0, func: () => {}};
    container[id] = item;
    return item;
  }

  private timeoutHandler(id: number): void {
    const timer = this.timers[id];
    if (timer) {
      this.timers[id] = undefined;
      timer.func();
    }
  }

  private intervalHandler(id: number): void {
    const interval = this.intervals[id];
    if (interval) {
      interval.func();
    }
  }

  /**
   * Sets a timeout, tracking it for potential cancellation.
   * @param func The function to execute.
   * @param timeout The delay in milliseconds.
   */
  setTimeout(func: () => void, timeout: number): void {
    const timer = this.getUniqueItem(this.timers);
    timer.func = func;
    timer.uid = window.setTimeout(() => {
      this.timeoutHandler(timer.id);
    }, timeout);
  }

  /**
   * Sets an interval, tracking it for potential cancellation.
   * @param func The function to execute.
   * @param timeout The interval in milliseconds.
   */
  setInterval(func: () => void, timeout: number): void {
    const interval = this.getUniqueItem(this.intervals);
    interval.func = func;
    interval.uid = window.setInterval(() => {
      this.intervalHandler(interval.id);
    }, timeout);
  }

  /**
   * Clears all active timeouts and intervals.
   */
  clearAll(): void {
    for (let id = 0; id < this.timers.length; id++) {
      const timer = this.timers[id];
      if (timer !== undefined) {
        window.clearTimeout(timer.uid);
      }
    }
    this.timers = [];

    for (let id = 0; id < this.intervals.length; id++) {
      const interval = this.intervals[id];
      if (interval !== undefined) {
        window.clearInterval(interval.uid);
      }
    }
    this.intervals = [];
  }
}
