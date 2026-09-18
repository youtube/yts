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

import {isChrobalt} from 'google3/third_party/javascript/yts/test_utils/cobalt';
import {getGlobal} from 'google3/third_party/javascript/yts/yts_common/global';
import {h5vcc} from 'google3/third_party/javascript/yts/yts_common/h5vcc';
import {firstValueFrom, Subject} from 'rxjs';

///////////////// Deep link tools////////////////
if (!h5vcc?.runtime) {
  console.error(`window.h5vcc.runtime was undefined`);
}

// Subject that listens for deeplinks to avoid multiple listeners
let deepLinkSubjectInst: Subject<string>|undefined;

// Store the first location href
const deepLinks: string[] = [];
if (getGlobal().window) {
  deepLinks.push(window.location.href);
}

/**
 * Applies listener on deeplinks
 */
export function listenDeepLink() {
  // Calling this function adds the deep link listener if it's not already
  // present.
  deepLinkSubject();
}

/** Reads deep links from array */
export function getDeepLinks() {
  return deepLinks;
}

/**
 * Waits until a deeplink is received, then resolves
 */
export function awaitDeepLink(): Promise<string> {
  return firstValueFrom(deepLinkSubject());
}

/**
 * Returns a subject that listens for deeplinks
 */
export function deepLinkSubject(): Subject<string> {
  console.log('Listening deep links');
  if (deepLinkSubjectInst) {
    return deepLinkSubjectInst;
  }

  deepLinkSubjectInst = new Subject<string>();
  const handleDeepLink = (url: string) => {
    if (url.includes('yts.devicecertification.youtube')) {
      console.log(`No deeplink received`);
    } else {
      deepLinks.push(url);
    }
    deepLinkSubjectInst?.next(url);
  };
  if (isChrobalt()) {
    h5vcc?.runtime?.addEventListener('deeplink', (e) => {
      console.log(`Chrobalt deeplink received: ${e.url}`);
      handleDeepLink(e.url);
    });
  } else {
    h5vcc?.runtime?.onDeepLink?.addListener((link: string) => {
      console.log(`Cobalt deeplink received: ${link}`);
      handleDeepLink(link);
    });
  }
  return deepLinkSubjectInst;
}
