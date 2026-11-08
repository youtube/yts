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

/** @fileoverview Deep link listener and inspection utilities for YTS tests. */

import {
  h5vcc,
  H5vccDeepLinkEvent,
} from 'google3/third_party/javascript/yts/yts_common/h5vcc';
import {firstValueFrom, Subject} from 'rxjs';

/** Local storage key written by tv_harness for the last received deep link. */
const LAST_DEEP_LINK_STORAGE_KEY = 'yts.last_deep_link';

if (!h5vcc?.runtime) {
  console.error('window.h5vcc.runtime was undefined');
}

// Subject that listens for deep links to avoid multiple listeners.
let deepLinkSubjectInst: Subject<string> | undefined;

// Store received deep links in arrival order.
const deepLinks: string[] = [];

/** Applies listener on deep links. */
export function listenDeepLink() {
  deepLinkSubject();
}

/** Reads deep links from array, pulling any reload fallback from storage. */
export function getDeepLinks(): string[] {
  const stored = consumeStoredDeepLink();
  if (stored && !deepLinks.length) {
    deepLinks.push(stored);
  }
  const result = [...deepLinks];
  deepLinks.length = 0;
  return result;
}

/** Waits until a deep link is received, then resolves. */
export function awaitDeepLink(): Promise<string> {
  return firstValueFrom(deepLinkSubject());
}

/** Clears recorded deep links and storage. */
export function clearDeepLinks() {
  deepLinks.length = 0;
  consumeStoredDeepLink();
}

/** Registers a callback for incoming H5VCC deep link events. */
export function addDeepLinkListener(listener: (link: string) => void) {
  const runtime = globalThis.window?.h5vcc?.runtime;
  if (runtime?.ondeeplink !== undefined) {
    runtime.addEventListener('deeplink', (e: H5vccDeepLinkEvent) => {
      if (typeof e?.url === 'string') {
        console.log(`Chrobalt deep link received: ${e.url}`);
        listener(e.url);
      }
    });
  } else {
    runtime?.onDeepLink?.addListener((link: string) => {
      console.log(`Cobalt deep link received: ${link}`);
      listener(link);
    });
  }
}

/** Stores last deep link received. Warning: value can be altered by tests. */
export function writeLastDeepLinkToLocalStorage(link: string) {
  try {
    window.localStorage.setItem(LAST_DEEP_LINK_STORAGE_KEY, link);
  } catch (e: unknown) {
    console.log('Error recording deep link to local storage');
    console.error(e);
  }
}

function handleDeepLink(url: string) {
  deepLinks.push(url);
  deepLinkSubjectInst?.next(url);
}

function consumeStoredDeepLink(): string | null {
  try {
    const link = window.localStorage?.getItem(LAST_DEEP_LINK_STORAGE_KEY);
    window.localStorage?.removeItem(LAST_DEEP_LINK_STORAGE_KEY);
    return link ?? null;
  } catch {
    return null;
  }
}

/** Returns a subject that listens for deep links. */
export function deepLinkSubject(): Subject<string> {
  console.log('Listening deep links');
  if (deepLinkSubjectInst) {
    return deepLinkSubjectInst;
  }

  deepLinkSubjectInst = new Subject<string>();
  addDeepLinkListener(handleDeepLink);
  return deepLinkSubjectInst;
}

export const TEST_ONLY = {
  resetForTesting: () => {
    deepLinkSubjectInst = undefined;
    clearDeepLinks();
  },
  handleDeepLinkForTesting: (url: string) => {
    handleDeepLink(url);
  },
};
