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

import 'yts';

import {
  h5vcc,
  H5vccDeepLinkEvent,
} from 'google3/third_party/javascript/yts/yts_common/h5vcc';

(() => {
  if (!h5vcc?.runtime) {
    throw new Error(`window.h5vcc.runtime was undefined`);
  }

  const deepLinks: string[] = [];

  function listenDeepLink() {
    if (h5vcc?.runtime?.ondeeplink !== undefined) {
      h5vcc?.runtime?.addEventListener('deeplink', (e) => {
        deepLinks.push((e as H5vccDeepLinkEvent).url);
      });
    } else {
      h5vcc?.runtime?.onDeepLink?.addListener((link: string) => {
        deepLinks.push(link);
      });
    }
  }

  function getDeepLinks() {
    return deepLinks;
  }

  yts.script('listenDeepLink', listenDeepLink);
  yts.script('getDeepLinks', getDeepLinks);
})();
