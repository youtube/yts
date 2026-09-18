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
 * Validates visibility event sequences by walking through the event-to-event transitions.
 */
export class EventSequenceMatcher {
  /**
   * Verifies that the given event sequence is valid and reached the deepest state.
   */
  verify(
    eventSequence: string[],
    deepestState: 'blur' | 'visibilitychange' | 'freeze',
    fail: (msg: string) => void,
  ): boolean {
    if (eventSequence.length === 0) {
      fail('Event sequence is empty.');
      return false;
    }

    let deepestStateReached = false;

    for (let i = 0; i < eventSequence.length; i++) {
      const event = eventSequence[i];
      if (this.isDeepestState(event, deepestState)) {
        deepestStateReached = true;
      }

      if (i < eventSequence.length - 1) {
        const nextEvent = eventSequence[i + 1];
        if (!this.isValidTransition(event, nextEvent)) {
          fail(
            `Invalid transition: ${event} -> ${nextEvent}. Sequence: ${JSON.stringify(eventSequence)}`,
          );
          return false;
        }
      }
    }

    if (!deepestStateReached) {
      fail(
        `Deepest state '${deepestState}' was not reached. Sequence: ${JSON.stringify(eventSequence)}`,
      );
      return false;
    }

    console.log(
      `Full event sequence received! Sequence: ${JSON.stringify(eventSequence)}`,
    );

    return true;
  }

  /**
   * Checks if the transition from event1 to event2 is valid.
   */
  private isValidTransition(event1: string, event2: string): boolean {
    if (event1 === 'window.onblur') {
      return (
        event2 === 'window.onfocus' ||
        event2 === 'document.onvisibilitychange: hidden'
      );
    }
    if (event1 === 'document.onvisibilitychange: hidden') {
      return (
        event2 === 'document.onvisibilitychange: visible' ||
        event2 === 'document.onfreeze' ||
        event2 === 'unload'
      );
    }
    if (event1 === 'document.onfreeze') {
      return event2 === 'document.onresume' || event2 === 'unload';
    }
    if (event1 === 'document.onresume') {
      return event2 === 'document.onvisibilitychange: visible';
    }
    if (event1 === 'document.onvisibilitychange: visible') {
      return event2 === 'window.onfocus';
    }
    if (event1 === 'window.onfocus') {
      return event2 === 'window.onblur';
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
}

/**
 * Instance of EventSequenceMatcher.
 */
export const eventSequenceMatcher = new EventSequenceMatcher();
