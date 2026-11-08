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
import {useUtilScripts} from 'google3/third_party/javascript/yts/test_utils/scripts/scripts';

useUtilScripts();

let visHandler: (e: Event) => void | undefined;
// Can't use function declaration because we need to reassign the function
// tslint:disable-next-line:prefer-function-declaration
let promiseResolver = () => {};

/**
 * Waits for the visibility state to change to the desired state.
 *
 * NOTE: if the desired visibility state is "visible" and the document is visible
 * when this function is called, it will return immediately.
 *
 * @param desiredVisState The desired visibility state.
 */
yts.script('awaitVisibilityChangeCec', async (...args: string[]) => {
  promiseResolver();
  if (visHandler) {
    document.removeEventListener('visibilitychange', visHandler);
  }

  const desiredVisState = args[0];
  console.log(
    `Initiating visibility listener. Listening for: ${desiredVisState}`,
  );

  if (desiredVisState === 'visible' && document.visibilityState === 'visible') {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    promiseResolver = resolve;
    visHandler = (e: Event) => {
      if (
        e.type === 'visibilitychange' &&
        document.visibilityState === desiredVisState
      ) {
        resolve();
      }
    };
    document.addEventListener('visibilitychange', visHandler);
  });
});

yts.script('abortAwaitVisibilityChangeCec', () => void promiseResolver());
