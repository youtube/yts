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

import {trustedResourceUrl} from 'safevalues';

import {loadScript} from './load_resource';

/** Strongly-typed interface representing the Shaka RequestType enum. */
export interface RequestTypeEnum {
  MANIFEST: number;
  SEGMENT: number;
  LICENSE: number;
}

/** Minimal interface representing Shaka DRM configuration. */
export interface DrmConfiguration {
  servers: {[key: string]: string};
}

/** Minimal interface representing Shaka Player configurations. */
export interface PlayerConfiguration {
  drm?: DrmConfiguration;
}

/** Minimal interface representing a Shaka Player Error object. */
export interface PlayerError {
  category: number;
  code: number;
  message?: string;
  data?: unknown[];
}

/** Minimal interface representing Shaka Player Event objects. */
export interface PlayerEvent {
  type: string;
  detail?: PlayerError|unknown;
}

/** Minimal interface representing a Shaka Player network Request object. */
export interface Request {
  body: ArrayBuffer|null|undefined;
  allowCrossSiteCredentials?: boolean;
  headers?: {[key: string]: string};
  method?: string;
  uris?: string[];
}

/** Interface representing a Shaka Player instance. */
export interface Player {
  unload(): Promise<void>;
  destroy(): Promise<void>;
  configure(config: PlayerConfiguration): void;
  getNetworkingEngine(): NetworkingEngine;
  load(uri: string): Promise<void>;
  addEventListener(type: string, listener: (event: PlayerEvent) => void): void;
}

/** Interface representing a Shaka NetworkingEngine instance. */
export interface NetworkingEngine {
  registerRequestFilter(
      filter: (type: number, request: Request) => Promise<void>| void): void;
}

interface MockableHTMLMediaElement {
  textTracks: TextTrack[];
  addTextTrack(): TextTrack;
}

/**
 * Mocks text tracks to prevent Shaka player constructor crashes.
 *
 * @param video The HTMLMediaElement to attach the mocked text tracks to.
 */
function mockTextTracks(video: HTMLMediaElement) {
  const mockableVideo = video as unknown as MockableHTMLMediaElement;
  try {
    mockableVideo.textTracks = [];
  } catch (e) {
    // Ignore read-only assignment error.
  }
  mockableVideo.addTextTrack = () => {
    return {
      addCue: () => {},
    } as unknown as TextTrack;
  };
}

// Bind to the global window.shaka object at runtime, and export the references
// tslint:disable-next-line:no-any
const globalWindow = window as any;

/** Promise that resolves when the Shaka Player script has been loaded. */
let shakaPromise: Promise<void>|undefined;

/**
 * Factory function to create and return a Shaka Player instance attached to the
 * given media element.
 *
 * @param video The HTMLMediaElement (video tag) to attach the player to.
 * @return A Promise resolving to a strongly-typed Shaka Player instance.
 */
export async function getShakaPlayer(video: HTMLMediaElement): Promise<Player> {
  if (typeof globalWindow.shaka === 'undefined') {
    if (!shakaPromise) {
      shakaPromise = loadScript(
          trustedResourceUrl`https://storage.googleapis.com/ytlr-cert.appspot.com/test/2020/third_party/Shaka/shaka-player.compiled.js`,
      );
    }
    await shakaPromise;
  }

  // Install all required polyfills for older browser engines (e.g., Cobalt)
  // before instantiating the player.
  globalWindow.shaka.polyfill?.installAll?.();
  mockTextTracks(video);

  return new globalWindow.shaka.Player(video) as Player;
}

/** The global Shaka RequestType enum. */
// tslint:disable-next-line:variable-name
export const RequestType: RequestTypeEnum = {
  MANIFEST: 0,
  SEGMENT: 1,
  LICENSE: 2,
};
