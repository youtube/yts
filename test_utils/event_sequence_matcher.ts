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
 * @fileoverview Validates visibility event sequences by walking through
 * event-to-event transitions.
 */

/**
 * Validates visibility event sequences by walking through the event-to-event
 * transitions.
 */
export class EventSequenceMatcher {
  /**
   * Verifies that the given event sequence is valid and reached the deepest
   * state.
   */
  verify(
    eventSequence: string[],
    deepestState: 'blur' | 'visibilitychange' | 'freeze',
    fail: (msg: string) => void,
    checkPartialSequence = false,
  ): boolean {
    eventSequence = this.stripReloadEvents(
        eventSequence,
        checkPartialSequence,
    );

    if (eventSequence.length === 0) {
      fail('Event sequence is empty.');
      return false;
    }

    let deepestStateReached = false;

    for (let i = 0; i < eventSequence.length; i++) {
      const currEvent = eventSequence[i];
      if (this.isDeepestState(currEvent, deepestState)) {
        deepestStateReached = true;
      }

      if (i < eventSequence.length - 1) {
        const nextEvent = eventSequence[i + 1];
        const prevEvent = eventSequence[i - 1];
        if (!this.isValidTransition(currEvent, nextEvent, prevEvent)) {
          fail(
              `Invalid transition: ${currEvent} -> ${nextEvent}. ` +
                  `Sequence: ${JSON.stringify(eventSequence)}`,
          );
          return false;
        }
      }
    }

    if (!deepestStateReached) {
      fail(
          `Deepest state '${deepestState}' was not reached. ` +
              `Sequence: ${JSON.stringify(eventSequence)}`,
      );
      return false;
    }

    if (!this.hasValidEndpoints(eventSequence, checkPartialSequence, fail)) {
      return false;
    }

    console.log(
        `Full event sequence received! ` +
            `Sequence: ${JSON.stringify(eventSequence)}`,
    );

    return true;
  }

  /**
   * Checks if the transition from currEvent to nextEvent is valid.
   *
   * `prevEvent` is needed because waking from `document.onfreeze` has two valid
   * orders: legacy Cobalt fires `onresume -> visible`, while Chromium-based
   * Cobalt fires `visible -> onresume`. Tracking `prevEvent` lets us know
   * which wake branch is being evaluated so we can ensure neither event is
   * skipped before `window.onfocus`.
   */
  private isValidTransition(
      currEvent: string,
      nextEvent: string,
      prevEvent?: string,
      ): boolean {
    if (currEvent === 'window.onblur') {
      return (
          nextEvent === 'window.onfocus' ||
          nextEvent === 'document.onvisibilitychange: hidden');
    }
    if (currEvent === 'document.onvisibilitychange: hidden') {
      return (
          nextEvent === 'document.onvisibilitychange: visible' ||
          nextEvent === 'document.onfreeze' || nextEvent === 'unload');
    }
    if (currEvent === 'document.onfreeze') {
      // Legacy Cobalt wakes with `onresume -> visibilitychange: visible`,
      // whereas Chromium-based Cobalt (Chrobalt) fires `visibilitychange:
      // visible -> onresume`.
      return (
          nextEvent === 'document.onresume' ||
          nextEvent === 'document.onvisibilitychange: visible' ||
          nextEvent === 'unload');
    }
    if (currEvent === 'document.onresume') {
      // In Chrobalt, `visibilitychange: visible` already fired right before
      // `onresume`, so `window.onfocus` is the next expected event.
      if (prevEvent === 'document.onvisibilitychange: visible') {
        return nextEvent === 'window.onfocus';
      }
      return nextEvent === 'document.onvisibilitychange: visible';
    }
    if (currEvent === 'document.onvisibilitychange: visible') {
      // In Chrobalt, `visibilitychange: visible` fires immediately after
      // `onfreeze`, and must be followed by `onresume` before `window.onfocus`.
      if (prevEvent === 'document.onfreeze') {
        return nextEvent === 'document.onresume';
      }
      if (prevEvent === undefined) {
        return (
            nextEvent === 'document.onresume' ||
            nextEvent === 'window.onfocus');
      }
      return nextEvent === 'window.onfocus';
    }
    if (currEvent === 'window.onfocus') {
      return nextEvent === 'window.onblur';
    }
    return false;
  }

  private isDeepestState(
    event: string,
    deepestState: 'blur' | 'visibilitychange' | 'freeze',
  ): boolean {
    if (deepestState === 'freeze') {
      return event === 'document.onfreeze' || event === 'document.onresume';
    }
    if (deepestState === 'visibilitychange') {
      return (
        event === 'document.onvisibilitychange: hidden' ||
        event === 'document.onvisibilitychange: visible'
      );
    }
    if (deepestState === 'blur') {
      return event === 'window.onblur' || event === 'window.onfocus';
    }
    return false;
  }

  private hasValidEndpoints(
    eventSequence: string[],
    checkPartialSequence: boolean,
    fail: (msg: string) => void,
  ): boolean {
    if (checkPartialSequence) {
      return true;
    }

    if (eventSequence[0] !== 'window.onblur') {
      fail(
        `Expected sequence to start with 'window.onblur', ` +
          `but got '${eventSequence[0]}'. ` +
          `Sequence: ${JSON.stringify(eventSequence)}`,
      );
      return false;
    }

    const lastEvent = eventSequence[eventSequence.length - 1];
    if (lastEvent !== 'window.onfocus') {
      fail(
        `Expected sequence to end with 'window.onfocus', ` +
          `but got '${lastEvent}'. ` +
          `Sequence: ${JSON.stringify(eventSequence)}`,
      );
      return false;
    }

    return true;
  }

  /**
   * Strips events caused by an in-page reload while the page is visible.
   *
   * When YouTube reloads itself in place (for example, during initial test
   * setup or after waking from standby), the browser tears down the visible
   * page without firing `window.onblur`, emitting
   * `document.onvisibilitychange: hidden` followed by `unload`.
   */
  private stripReloadEvents(
    eventSequence: string[],
    checkPartialSequence: boolean,
  ): string[] {
    // Partial conceal-only tests allow `['document.onvisibilitychange: hidden',
    // 'unload']` on its own without a preceding `window.onblur`.
    if (checkPartialSequence && eventSequence.length <= 2) {
      return eventSequence;
    }

    const filtered: string[] = [];
    let isReloadSequence = false;

    for (let i = 0; i < eventSequence.length; i++) {
      const event = eventSequence[i];
      const lastKeptEvent = filtered[filtered.length - 1];
      const isPageVisible =
        filtered.length === 0 || lastKeptEvent === 'window.onfocus';

      if (
        isPageVisible &&
        event === 'document.onvisibilitychange: hidden' &&
        eventSequence[i + 1] === 'unload'
      ) {
        isReloadSequence = true;
      }

      if (!isReloadSequence) {
        filtered.push(event);
      }

      if (isReloadSequence && event === 'unload') {
        isReloadSequence = false;
      }
    }
    if (eventSequence.length > filtered.length) {
      console.debug('Ignoring reload event sequence...');
    }

    return filtered;
  }
}

/**
 * Instance of EventSequenceMatcher.
 */
export const eventSequenceMatcher = new EventSequenceMatcher();
