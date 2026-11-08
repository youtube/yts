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
 * @fileoverview Shared Shaka Player playback utilities for adaptive DASH and
 * YouTube CENC DRM streams on the YTS test page.
 */

import {
  DrmInfo,
  Player,
  PlayerEvent,
  RequestType,
  Response,
  getShakaPlayer,
} from 'google3/third_party/javascript/yts/yts_common/shaka';

import {
  cleanupVideoElement,
  getVideoElement,
  initializeVideoElement,
} from './playback_util';

const YOUTUBE_DRM_SCHEME_URI = 'http://youtube.com/drm/2012/10/10';
const GLS_HEADER_PREFIX = 'GLS/1.';
const HEADER_SEPARATOR = '\r\n\r\n';
const CR_BYTE = 0x0d;
const LF_BYTE = 0x0a;
const SD_MAX_HEIGHT = 576;
const DEFAULT_STARTUP_TIMEOUT_MS = 30_000;

const KEY_SYSTEMS_BY_YOUTUBE_TYPE: ReadonlyMap<string, readonly string[]> =
  new Map([
    ['widevine', ['com.widevine.alpha']],
    ['playready', ['com.youtube.playready', 'com.microsoft.playready']],
  ]);

/** Optional dependency and timing overrides for starting Shaka playback. */
export interface ShakaPlaybackOptions {
  readonly createPlayer?: (video: HTMLMediaElement) => Promise<Player>;
  readonly startupTimeoutMs?: number;
}

interface PlaybackStartupParams {
  readonly video: HTMLMediaElement;
  readonly manifestUri: string;
  readonly createPlayer: (video: HTMLMediaElement) => Promise<Player>;
  readonly startupTimeoutMs: number;
}

/**
 * Retains the in-flight player instance so teardown or retries can release
 * active MSE/EME resources before mounting another stream.
 */
let activePlayer: Player | null = null;

/**
 * Mounts a full-screen video element on the YTS page and starts DASH playback
 * using Shaka Player, returning the active `HTMLVideoElement` once `'playing'`
 * fires.
 *
 * Supports both clear streams and YouTube's custom `yt:SystemURL` CENC scheme
 * with `GLS/1.x` license responses. Cleans up the player and video element
 * before rejecting if startup or license acquisition fails.
 */
export async function startShakaPlayback(
  manifestUri: string,
  options: ShakaPlaybackOptions = {},
): Promise<HTMLVideoElement> {
  await stopShakaPlayback();

  initializeVideoElement();
  const video = getVideoElement();
  if (!video) {
    throw new Error('Failed to initialize video element.');
  }
  video.style.display = 'block';
  video.autoplay = true;

  const createPlayer = options.createPlayer ?? getShakaPlayer;
  const startupTimeoutMs =
    options.startupTimeoutMs ?? DEFAULT_STARTUP_TIMEOUT_MS;
  try {
    await initializeAndStartPlayback({
      video,
      manifestUri,
      createPlayer,
      startupTimeoutMs,
    });
    return video;
  } catch (error) {
    const message = formatPlaybackError(error);
    console.error('Failed to start Shaka playback:', error);
    await stopShakaPlayback();
    throw new Error(`Failed to start video playback: ${message}`);
  }
}

/**
 * Destroys any active Shaka Player instance and removes the test video DOM.
 */
export async function stopShakaPlayback(): Promise<void> {
  const player = activePlayer;
  activePlayer = null;
  if (player) {
    await destroyPlayerQuietly(player);
  }
  cleanupVideoElement();
}

/**
 * Creates and configures the Shaka Player instance, loads `manifestUri`,
 * triggers `<video>` playback, and waits for the first `'playing'` event under
 * a single `startupTimeoutMs` budget covering script load through playback.
 */
async function initializeAndStartPlayback(
  params: PlaybackStartupParams,
): Promise<void> {
  const {video, manifestUri, createPlayer, startupTimeoutMs} = params;
  let settled = false;
  let cleanup = () => {};
  let attachPlayerErrorListener: (player: Player) => void = () => {};

  const waitForPlayingOrError = new Promise<void>((resolve, reject) => {
    let listenedPlayer: Player | null = null;
    const onPlaying = () => {
      resolve();
    };
    const onPlayerError = (event: PlayerEvent) => {
      const detail = formatPlaybackError(event.detail ?? event);
      reject(new Error(detail));
    };
    const onVideoError = () => {
      const code = video.error?.code;
      const detail =
        code != null
          ? `MediaElement error (code ${code})`
          : 'MediaElement playback error';
      reject(new Error(detail));
    };
    const timeoutId = setTimeout(() => {
      reject(
        new Error(`Timed out after ${startupTimeoutMs}ms waiting for playback`),
      );
    }, startupTimeoutMs);

    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onVideoError);
    attachPlayerErrorListener = (player: Player) => {
      listenedPlayer = player;
      player.addEventListener('error', onPlayerError);
    };
    cleanup = () => {
      clearTimeout(timeoutId);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onVideoError);
      listenedPlayer?.removeEventListener('error', onPlayerError);
    };
  });

  const runStartup = async (): Promise<void> => {
    const player = await createPlayer(video);
    if (settled) {
      await destroyPlayerQuietly(player);
      return;
    }
    activePlayer = player;
    attachPlayerErrorListener(player);
    configureYouTubeShakaPlayer(player);
    await player.load(manifestUri);
    if (settled) {
      return;
    }
    await Promise.resolve(video.play());
  };

  try {
    await Promise.all([waitForPlayingOrError, runStartup()]);
  } finally {
    settled = true;
    cleanup();
  }
}

/**
 * Registers YouTube DASH CENC parsing and GLS license filtering on `player`.
 */
function configureYouTubeShakaPlayer(player: Player): void {
  player.configure({
    manifest: {
      dash: {
        customScheme: interpretYouTubeContentProtection,
      },
    },
  });
  player
    .getNetworkingEngine()
    .registerResponseFilter(createGlsLicenseResponseFilter(player));
}

/** Destroys a Shaka `Player` instance, logging and ignoring teardown errors. */
async function destroyPlayerQuietly(player: Player): Promise<void> {
  try {
    await player.destroy();
  } catch (error) {
    console.warn('Failed to destroy Shaka Player:', error);
  }
}

/**
 * Translates YouTube's custom DASH `<ContentProtection>` element into Shaka
 * `DrmInfo` entries.
 *
 * Leaves `initData` empty so Shaka v2.0 listens for `<video>` `encrypted`
 * events from each MP4 `moov` box, which is required when SD and HD
 * representations use distinct key IDs.
 */
function interpretYouTubeContentProtection(element: Element): DrmInfo[] | null {
  if (
    element.getAttribute('schemeIdUri')?.toLowerCase() !==
    YOUTUBE_DRM_SCHEME_URI
  ) {
    return null;
  }

  const configs: DrmInfo[] = [];
  for (let i = 0; i < element.childNodes.length; i++) {
    const child = element.childNodes[i];
    if (!(child instanceof Element)) {
      continue;
    }
    if (!isSystemUrlElement(child)) {
      continue;
    }
    const drmType = child.getAttribute('type')?.toLowerCase() ?? '';
    const keySystems = KEY_SYSTEMS_BY_YOUTUBE_TYPE.get(drmType);
    if (!keySystems) {
      continue;
    }
    const rawUri = (child.textContent ?? '').trim();
    if (!rawUri) {
      continue;
    }
    const licenseServerUri = rawUri.startsWith('//')
      ? `https:${rawUri}`
      : rawUri;
    for (const keySystem of keySystems) {
      configs.push({
        keySystem,
        licenseServerUri,
        distinctiveIdentifierRequired: false,
        persistentStateRequired: false,
        audioRobustness: '',
        videoRobustness: '',
        serverCertificate: null,
        initData: [],
      });
    }
  }
  return configs.length > 0 ? configs : null;
}

/**
 * Matches `<SystemURL>` or prefixed `<yt:SystemURL>` elements by `tagName`
 * because Cobalt's XML `DOMParser` is not namespace-aware and does not strip
 * prefixes into `localName`.
 */
function isSystemUrlElement(element: Element): boolean {
  return (
    element.tagName === 'SystemURL' || element.tagName.endsWith(':SystemURL')
  );
}

/**
 * Creates a Shaka response filter that validates and strips YouTube `GLS/1.x`
 * ASCII envelopes from license responses, tracking authorized formats across
 * sessions so SD-only video licenses cap height to 576p without letting
 * audio-only sessions block HD or permanently capping if HD is later granted.
 */
function createGlsLicenseResponseFilter(
  player: Player,
): (type: number, response: Response) => void {
  const authorizedFormats = new Set<string>();
  let currentMaxHeight = Infinity;

  return (type: number, response: Response) => {
    if (type !== RequestType.LICENSE) {
      return;
    }
    const bytes = new Uint8Array(response.data);
    if (!startsWithGlsPrefix(bytes)) {
      return;
    }
    const headerEnd = findHeaderTerminator(bytes);
    if (headerEnd < 0) {
      throw new Error(
        'Malformed GLS license response: missing header terminator',
      );
    }

    const headerText = decodeAsciiPrefix(bytes, headerEnd);
    validateGlsStatusLine(headerText);
    const formatTypesMatch = /^Authorized-Format-Types:\s*(.+)$/im.exec(
      headerText,
    );
    const rawFormatTypes = formatTypesMatch?.[1];
    if (rawFormatTypes != null) {
      for (const token of rawFormatTypes.split(',')) {
        const format = token.trim().toUpperCase();
        if (format) {
          authorizedFormats.add(format);
        }
      }
      const hasHd = [...authorizedFormats].some(
        (format) => format.startsWith('HD') || format.startsWith('UHD'),
      );
      const targetMaxHeight =
        hasHd || !authorizedFormats.has('SD') ? Infinity : SD_MAX_HEIGHT;
      if (targetMaxHeight !== currentMaxHeight) {
        currentMaxHeight = targetMaxHeight;
        player.configure({restrictions: {maxHeight: targetMaxHeight}});
      }
    }

    response.data = response.data.slice(headerEnd + HEADER_SEPARATOR.length);
  };
}

/** Throws if the `GLS/1.x` response header reports a non-zero status code. */
function validateGlsStatusLine(headerText: string): void {
  const statusLine = headerText.split('\r\n', 1)[0] ?? '';
  const statusMatch = /^GLS\/1\.\d+\s+(\d+)(?:\s+(.*))?$/.exec(statusLine);
  if (!statusMatch) {
    throw new Error(`Malformed GLS license status line: ${statusLine}`);
  }
  const statusCode = statusMatch[1];
  if (statusCode !== '0') {
    const statusReason = statusMatch[2]?.trim() ?? '';
    const suffix = statusReason ? ` ${statusReason}` : '';
    throw new Error(`GLS license error (${statusCode}${suffix})`);
  }
}

/** Returns whether `bytes` begins with the ASCII `GLS/1.` envelope prefix. */
function startsWithGlsPrefix(bytes: Uint8Array): boolean {
  if (bytes.length < GLS_HEADER_PREFIX.length) {
    return false;
  }
  for (let i = 0; i < GLS_HEADER_PREFIX.length; i++) {
    if (bytes[i] !== GLS_HEADER_PREFIX.charCodeAt(i)) {
      return false;
    }
  }
  return true;
}

/**
 * Locates the `\r\n\r\n` boundary ending a `GLS/1.x` ASCII envelope directly
 * on raw bytes so binary license payloads are never UTF-8 decoded.
 */
function findHeaderTerminator(bytes: Uint8Array): number {
  const maxSeparatorStart = bytes.length - HEADER_SEPARATOR.length;
  for (let i = GLS_HEADER_PREFIX.length; i <= maxSeparatorStart; i++) {
    if (
      bytes[i] === CR_BYTE &&
      bytes[i + 1] === LF_BYTE &&
      bytes[i + 2] === CR_BYTE &&
      bytes[i + 3] === LF_BYTE
    ) {
      return i;
    }
  }
  return -1;
}

/**
 * Decodes the ASCII header prefix of `bytes` up to `length` without requiring
 * `TextDecoder`, which is unavailable on older Cobalt targets.
 */
function decodeAsciiPrefix(bytes: Uint8Array, length: number): string {
  let text = '';
  for (let i = 0; i < length; i++) {
    text += String.fromCharCode(bytes[i]);
  }
  return text;
}

/**
 * Extracts a human-readable reason from caught playback errors, including
 * Shaka `PlayerError` objects which are plain objects rather than `Error`
 * instances.
 */
function formatPlaybackError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error != null) {
    if (
      'message' in error &&
      typeof error.message === 'string' &&
      error.message
    ) {
      return error.message;
    }
    if ('code' in error && typeof error.code === 'number') {
      const category =
        'category' in error && typeof error.category === 'number'
          ? `category ${error.category}, `
          : '';
      const cause = extractNestedErrorMessage(error);
      const causeSuffix = cause ? `: ${cause}` : '';
      return `Shaka error (${category}code ${error.code})${causeSuffix}`;
    }
  }
  return String(error);
}

/** Extracts a nested `Error` message from Shaka `PlayerError.data`, if any. */
function extractNestedErrorMessage(error: object): string {
  if (!('data' in error) || !Array.isArray(error.data)) {
    return '';
  }
  for (const item of error.data) {
    if (item instanceof Error && item.message) {
      return item.message;
    }
  }
  return '';
}
