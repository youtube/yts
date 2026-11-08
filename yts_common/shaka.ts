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
 * @fileoverview Loader, interfaces, and compatibility polyfills for the Shaka
 * Player library.
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

/** Override entry for EME initialization data in Shaka Player. */
export interface InitDataOverride {
  initData: Uint8Array;
  initDataType: string;
  keyId?: string | null;
}

/** Parsed DRM scheme configuration returned by custom manifest parsers. */
export interface DrmInfo {
  keySystem: string;
  licenseServerUri: string;
  distinctiveIdentifierRequired: boolean;
  persistentStateRequired: boolean;
  audioRobustness: string;
  videoRobustness: string;
  serverCertificate: Uint8Array | null;
  initData: InitDataOverride[];
  keyIds?: string[];
}

/** DASH-specific manifest parser configuration for Shaka Player. */
export interface DashManifestConfiguration {
  customScheme?: (element: Element) => DrmInfo[] | null;
}

/** Manifest parser configuration for Shaka Player. */
export interface ManifestConfiguration {
  dash?: DashManifestConfiguration;
}

/** Track selection restrictions for Shaka Player. */
export interface Restrictions {
  maxHeight?: number;
}

/** Minimal interface representing Shaka Player configurations. */
export interface PlayerConfiguration {
  drm?: DrmConfiguration;
  manifest?: ManifestConfiguration;
  restrictions?: Restrictions;
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

/** Minimal interface representing a Shaka Player network Response object. */
export interface Response {
  uri?: string;
  data: ArrayBuffer;
  headers?: {[key: string]: string};
}

/** Interface representing a Shaka Player instance. */
export interface Player {
  unload(): Promise<void>;
  destroy(): Promise<void>;
  configure(config: PlayerConfiguration): void;
  getNetworkingEngine(): NetworkingEngine;
  load(uri: string): Promise<void>;
  addEventListener(type: string, listener: (event: PlayerEvent) => void): void;
  removeEventListener(
      type: string, listener: (event: PlayerEvent) => void): void;
}

/** Interface representing a Shaka NetworkingEngine instance. */
export interface NetworkingEngine {
  registerRequestFilter(
      filter: (type: number, request: Request) => Promise<void>| void): void;
  registerResponseFilter(
      filter: (type: number, response: Response) => Promise<void> | void): void;
}

interface MockTextTrackList {
  length: number;
  [index: number]: TextTrack;
  addEventListener(
      type: string, listener: (event: Event) => void,
      options?: boolean | AddEventListenerOptions): void;
  removeEventListener(
      type: string, listener: (event: Event) => void,
      options?: boolean | EventListenerOptions): void;
}

/**
 * Creates a mock TextTrackList with no-op event listeners and zero length.
 */
function createMockTextTrackList(): TextTrackList {
  const list: unknown[] = [];
  const mockList = list as unknown as MockTextTrackList;
  mockList.addEventListener = () => {};
  mockList.removeEventListener = () => {};
  return mockList as unknown as TextTrackList;
}

interface MockableHTMLMediaElement {
  textTracks: TextTrackList;
  addTextTrack(): TextTrack;
}

/**
 * Mocks text tracks to prevent Shaka player constructor and destructor crashes.
 */
function mockTextTracks(video: HTMLMediaElement): void {
  const tracks = createMockTextTrackList();
  try {
    Object.defineProperty(video, 'textTracks', {
      value: tracks,
      writable: true,
      configurable: true,
    });
  } catch (e) {
    // Ignore read-only assignment error.
  }
  const mockableVideo = video as unknown as MockableHTMLMediaElement;
  if (!mockableVideo.textTracks) {
    try {
      mockableVideo.textTracks = tracks;
    } catch (e) {
      // Ignore assignment error.
    }
  }
  mockableVideo.addTextTrack = () => {
    // Cobalt lacks a TextTrack constructor; Shaka's TextEngine only accesses
    // mode, cues, addCue, and removeCue on the returned track.
    return {
      cues: [],
      addCue: () => {},
      removeCue: () => {},
    } as unknown as TextTrack;
  };
}

interface ShakaWindow extends Window {
  shaka?: {
    polyfill?: {installAll?: () => void};
    Player: new (video: HTMLMediaElement) => Player;
  };
}

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
  // Downcast window to read the external global populated by Shaka's script.
  const shakaWindow = globalThis.window as ShakaWindow | undefined;
  if (!shakaWindow?.shaka) {
    if (!shakaPromise) {
      shakaPromise = loadScript(
          trustedResourceUrl`https://storage.googleapis.com/ytlr-cert.appspot.com/test/2020/third_party/Shaka/shaka-player.compiled.js`,
      );
    }
    await shakaPromise;
  }

  const shaka = shakaWindow?.shaka;
  if (!shaka) {
    throw new Error('Shaka Player failed to load.');
  }

  // Install all required polyfills for older browser engines (e.g., Cobalt)
  // before instantiating the player.
  shaka.polyfill?.installAll?.();
  mockTextTracks(video);

  return new shaka.Player(video);
}

/** The global Shaka RequestType enum. */
// tslint:disable-next-line:variable-name
export const RequestType: RequestTypeEnum = {
  MANIFEST: 0,
  SEGMENT: 1,
  LICENSE: 2,
};

/** Internal helpers exported for unit testing only. */
export const TEST_ONLY = {mockTextTracks};
