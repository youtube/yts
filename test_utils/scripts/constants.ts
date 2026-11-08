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
 * Scripts that are only used by util functions and not intended to be invoked
 * directly by tests
 */
export enum UtilScripts {
  APPLY_STICKY_LOADER = 'applyStickyLoader',
  REMOVE_STICKY_LOADER = 'removeStickyLoader',
  AWAIT_DEEP_LINK = 'awaitDeepLink',
  AWAIT_VISIBILITY_CHANGE = 'awaitVisibilityChange',
  EXIT_COBALT = 'exitCobalt',
  SUSPEND_COBALT = 'suspendCobalt',
  READ_AGENT_HREF = 'readAgentHref',
  REDIRECT = 'redirect',
  IS_CHROBALT = 'isChrobalt',
  LISTEN_VISIBILITY_EVENTS = 'listenVisibilityEvents',
  GET_USER_AGENT = 'getUserAgent',
}

/**
 * Args that can be sent to scripts
 */
export enum Args {
  /**
   * Cancel a script (only if it implements cancellation)
   */
  CANCEL = 'cancel',
}
