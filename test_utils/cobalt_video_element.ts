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
 * Video element interface that includes custom properties from Cobalt.
 *
 * Copied from google3/video/youtube/web/living_room/core/lib/cobalt/cobalt.ts
 */
export declare interface CobaltVideoElement extends HTMLVideoElement {
  /**
   * Introduced in Cobalt 20. See b/130291062 for context. The input string
   * format is the same as for HTMLMediaElement.canPlayType().
   */
  setMaxVideoCapabilities?: (s: string) => void;
}
