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

import {TrustedResourceUrl} from 'safevalues';
import {setLinkHrefAndRel, setScriptSrc} from 'safevalues/dom';

/**
 * Dynamically injects and loads a script safely into the DOM.
 */
export function loadScript(url: TrustedResourceUrl): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    setScriptSrc(script, url);
    script.onerror = () => {
      reject(new Error(`Failed to load script ${url}`));
    };
    script.onload = () => {
      resolve();
    };
    document.body.appendChild(script);
  });
}

/**
 * Dynamically injects and loads a CSS stylesheet safely into the DOM.
 */
export function loadCss(url: TrustedResourceUrl): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    setLinkHrefAndRel(link, url, 'stylesheet');
    link.onerror = () => {
      reject(new Error(`Failed to load CSS ${url}`));
    };
    link.onload = () => {
      resolve();
    };
    document.head.appendChild(link);
  });
}
