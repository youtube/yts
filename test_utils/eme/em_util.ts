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

import {StreamDef} from '../streams/media_streams';
import {EMEHandler} from './eme_handler';
import {LicenseManager} from './license_manager';

/**
 * Sets up EME (Encrypted Media Extensions) for a video element.
 *
 * This function initializes the EME handler, creates a license manager, and
 * checks for the availability of the required key system.
 *
 * @param emeHandler An instance of the EMEHandler class.
 * @param video The HTMLVideoElement to which EME will be applied.
 * @param mediaStreams An array of StreamDef objects representing the media
 *     streams to be used.
 * @param flavor A string representing the flavor of the media (e.g., 'widevine',
 *     'playready').
 */
export function setupEme(
  emeHandler: EMEHandler,
  video: HTMLVideoElement,
  mediaStreams: StreamDef[],
  flavor: string,
) {
  console.log('Setting up EME');
  try {
    const licenseManager = new LicenseManager(video, mediaStreams, flavor);
    emeHandler.init(video, licenseManager);
    emeHandler.checkKeySystem();
    console.log('EME setup complete');
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Failed to setup EME: ' + errorMessage);
    throw err;
  }
}
