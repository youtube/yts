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
 * @fileoverview Common library of scripts that are used by utility functions
 * and shared among test modules
 */

import 'yts';

import {
  exitCobalt,
  isChrobalt,
  suspendCobalt,
} from 'google3/third_party/javascript/yts/test_utils/cobalt';
import {deepLinkSubject} from 'google3/third_party/javascript/yts/test_utils/deep_link';
import {
  addVisibilityListeners,
  getDetailedEventName,
  removeVisibilityListeners,
} from 'google3/third_party/javascript/yts/test_utils/event_listener_util';
import {
  applyStickyLoader,
  removeStickyLoader,
} from 'google3/third_party/javascript/yts/test_utils/sticky_loader';
import {
  keepUrlParams,
  navigateTo,
} from 'google3/third_party/javascript/yts/test_utils/url_utils';
import {Subject, firstValueFrom, merge} from 'rxjs';
import {Args, UtilScripts} from './constants';

const VISIBILITY_EVENTS_KEY = 'yts.util.visibility_events';

declare interface StoredVisibilityEvent {
  name: string;
  ts: number;
}

/**
 * Registers common util scripts
 */
export function useUtilScripts() {
  yts.script(UtilScripts.APPLY_STICKY_LOADER, async (testProd = false) => {
    await applyStickyLoader(testProd);
  });

  yts.script(UtilScripts.REMOVE_STICKY_LOADER, async (testProd = false) => {
    await removeStickyLoader(testProd);
  });

  yts.script(UtilScripts.EXIT_COBALT, exitCobalt);

  yts.script(UtilScripts.SUSPEND_COBALT, suspendCobalt);

  yts.script(UtilScripts.READ_AGENT_HREF, () => {
    return window.location.href;
  });

  /**
   * Redirects to URL provided in first parameter
   */
  yts.script(UtilScripts.REDIRECT, async (...args: string[]) => {
    const redirectUrl = args[0];
    console.debug(`Redirecting to ${redirectUrl}`);
    const currentUrl = window.location.toString();
    const newUrl = keepUrlParams(currentUrl, redirectUrl);
    navigateTo(newUrl);
    // Never resolves
    await new Promise(() => {});
  });

  yts.script(UtilScripts.IS_CHROBALT, () => {
    return isChrobalt();
  });

  yts.script(UtilScripts.GET_USER_AGENT, () => {
    return navigator.userAgent;
  });

  /**
   * Listens for a deep link or a cancel command. Returns an empty string if
   * cancelled.
   */
  const cancelDlSubject = new Subject<string>();
  yts.script(UtilScripts.AWAIT_DEEP_LINK, (...args: string[]) => {
    cancelDlSubject.next('');

    if (args[0] === Args.CANCEL) {
      return;
    }

    yts.prepareForReload();
    return firstValueFrom(merge(cancelDlSubject, deepLinkSubject()));
  });

  let visibilityStates: string[] = [];
  let lastResolver = (vs: string[]) => {};
  yts.script(UtilScripts.AWAIT_VISIBILITY_CHANGE, (...args: string[]) => {
    // Reset test state
    lastResolver(visibilityStates);
    removeVisibilityListeners();
    visibilityStates = [];

    if (args[0] === Args.CANCEL) {
      return;
    }

    const awaitedType = args[0];
    if (!awaitedType) {
      throw new Error('No visibility event type specified');
    }

    const expectedTypes = [
      'unload',
      'blur',
      'focus',
      'visibilitychange',
      'freeze',
      'resume',
    ];
    if (!expectedTypes.includes(awaitedType)) {
      throw new Error(`Unexpected visibility event type: ${awaitedType}`);
    }

    yts.prepareForReload();
    // TODO(dneu): ensure this works when Cobalt is closed completely
    return new Promise<string[]>((resolve) => {
      lastResolver = resolve;
      addVisibilityListeners((e: Event) => {
        if (e.type === 'visibilitychange') {
          console.log(
            `Received visibility event: ${e.type} (${document.visibilityState})`,
          );
        } else {
          console.log(`Received visibility event: ${e.type}`);
        }
        visibilityStates.push(e.type);
        if (e.type === awaitedType) {
          resolve(visibilityStates);
        }
      });
    });
  });

  let activeResolver: ((events: string[]) => void) | undefined;

  yts.script(
    UtilScripts.LISTEN_VISIBILITY_EVENTS,
    (action?: string, ignoreNewerThanMs?: number | null) => {
      try {
        removeVisibilityListeners();
      } catch (e) {
        // Ignore
      }

      if (action === 'STOP') {
        const now = Date.now();
        const capturedEvents = readStoredVisibilityEvents()
          .filter(
            (e) =>
              typeof e === 'string' ||
              ignoreNewerThanMs == null ||
              now - e.ts > ignoreNewerThanMs,
          )
          .map((e) => (typeof e === 'string' ? e : e.name));
        window.localStorage.removeItem(VISIBILITY_EVENTS_KEY);

        if (activeResolver) {
          activeResolver(capturedEvents);
          activeResolver = undefined;
        }
        return capturedEvents;
      }

      yts.prepareForReload();

      // Start listening: resolve any previous unresolved listener first
      if (activeResolver) {
        activeResolver([]);
      }

      window.localStorage.setItem(VISIBILITY_EVENTS_KEY, '[]');

      addVisibilityListeners((event: Event) => {
        try {
          const detailedName = getDetailedEventName(event);
          console.log(`Received: ${detailedName}`);
          const events = readStoredVisibilityEvents();
          events.push({name: detailedName, ts: Date.now()});
          window.localStorage.setItem(
            VISIBILITY_EVENTS_KEY,
            JSON.stringify(events),
          );
        } catch (e) {
          console.error('Failed to record visibility event:', e);
        }
      });

      return new Promise<string[]>((resolve) => {
        activeResolver = resolve;
      });
    },
  );
}

/** Reads recorded visibility events from localStorage. */
function readStoredVisibilityEvents(): Array<StoredVisibilityEvent | string> {
  const eventsString = window.localStorage.getItem(VISIBILITY_EVENTS_KEY);
  if (!eventsString) {
    return [];
  }
  try {
    return JSON.parse(eventsString) as Array<StoredVisibilityEvent | string>;
  } catch (e) {
    console.error('Failed to parse stored events:', e);
    return [];
  }
}
