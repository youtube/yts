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
 * @fileoverview Unit tests for shared Shaka Player playback utilities.
 */

import 'jasmine';

import {
  DrmInfo,
  NetworkingEngine,
  Player,
  PlayerConfiguration,
  PlayerError,
  PlayerEvent,
  RequestType,
  Response,
} from 'google3/third_party/javascript/yts/yts_common/shaka';

import {getVideoElement} from './playback_util';
import {
  ShakaPlaybackOptions,
  startShakaPlayback,
  stopShakaPlayback,
} from './shaka_playback';

describe('shaka_playback', () => {
  let playSpy: jasmine.Spy<() => Promise<void>>;

  beforeEach(() => {
    playSpy = spyOn(HTMLMediaElement.prototype, 'play').and.callFake(function (
      this: HTMLMediaElement,
    ) {
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    });
  });

  afterEach(async () => {
    await stopShakaPlayback();
  });

  it('loads the manifest and starts playback on a video element', async () => {
    const fakePlayer = new FakePlayer();
    const createPlayer = jasmine
      .createSpy<(video: HTMLMediaElement) => Promise<Player>>('createPlayer')
      .and.resolveTo(fakePlayer);

    const video = await startShakaPlayback(
      'https://example.com/waymo_vp9_opus.mpd',
      {createPlayer},
    );

    expect(getVideoElement()).toBe(video);
    expect(createPlayer).toHaveBeenCalledOnceWith(video);
    expect(video.autoplay).toBeTrue();
    expect(video.style.display).toBe('block');
    expect(fakePlayer.loadedUri).toBe('https://example.com/waymo_vp9_opus.mpd');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('parses YouTube ContentProtection DRM configs', async () => {
    const fakePlayer = new FakePlayer();
    await startShakaPlayback(
      'https://example.com/oops_cenc_pssh.mpd',
      stubPlayerOptions(fakePlayer),
    );
    const youtubeElement = createContentProtectionElement(
      'http://youtube.com/drm/2012/10/10',
      [
        {
          type: 'widevine',
          uri: '//dash-mse-test.appspot.com/api/drm/widevine?video_id=1',
        },
        {
          type: 'PlayReady',
          uri: 'https://dash-mse-test.appspot.com/api/drm/playready?video_id=1',
          tagName: 'SystemURL',
        },
        {
          type: 'clearkey',
          uri: 'https://dash-mse-test.appspot.com/api/drm/clearkey',
        },
      ],
    );
    const unrelatedElement = createContentProtectionElement(
      'urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed',
    );

    const drmInfos = fakePlayer.parseContentProtection(youtubeElement);
    const unrelatedInfos = fakePlayer.parseContentProtection(unrelatedElement);

    expect(unrelatedInfos).toBeNull();
    expect(drmInfos).toEqual([
      {
        keySystem: 'com.widevine.alpha',
        licenseServerUri:
          'https://dash-mse-test.appspot.com/api/drm/widevine?video_id=1',
        distinctiveIdentifierRequired: false,
        persistentStateRequired: false,
        audioRobustness: '',
        videoRobustness: '',
        serverCertificate: null,
        initData: [],
      },
      {
        keySystem: 'com.youtube.playready',
        licenseServerUri:
          'https://dash-mse-test.appspot.com/api/drm/playready?video_id=1',
        distinctiveIdentifierRequired: false,
        persistentStateRequired: false,
        audioRobustness: '',
        videoRobustness: '',
        serverCertificate: null,
        initData: [],
      },
      {
        keySystem: 'com.microsoft.playready',
        licenseServerUri:
          'https://dash-mse-test.appspot.com/api/drm/playready?video_id=1',
        distinctiveIdentifierRequired: false,
        persistentStateRequired: false,
        audioRobustness: '',
        videoRobustness: '',
        serverCertificate: null,
        initData: [],
      },
    ]);
  });

  it('strips GLS/1.0 envelopes from license responses', async () => {
    const fakePlayer = new FakePlayer();
    await startShakaPlayback(
      'https://example.com/oops_cenc_pssh.mpd',
      stubPlayerOptions(fakePlayer),
    );
    const glsResponse: Response = {
      data: encodeAsciiAndPayload(
        'GLS/1.0 0 OK\r\nAuthorized-Format-Types: SD, HD\r\n\r\n',
        [0x08, 0x01, 0x12, 0x04],
      ),
    };
    const rawLicense = new Uint8Array([0xde, 0xad, 0xbe, 0xef]).buffer;
    const rawResponse: Response = {data: rawLicense};

    await fakePlayer.networkingEngine.dispatchResponse(
      RequestType.LICENSE,
      glsResponse,
    );
    await fakePlayer.networkingEngine.dispatchResponse(
      RequestType.LICENSE,
      rawResponse,
    );

    expect(Array.from(new Uint8Array(glsResponse.data))).toEqual([
      0x08, 0x01, 0x12, 0x04,
    ]);
    expect(glsResponse.data.byteLength).toBe(4);
    expect(rawResponse.data).toBe(rawLicense);
    expect(
      fakePlayer.configurations.some((cfg) => cfg.restrictions !== undefined),
    ).toBeFalse();
  });

  it('rejects license responses with non-zero GLS status codes', async () => {
    const fakePlayer = new FakePlayer();
    await startShakaPlayback(
      'https://example.com/oops_cenc_pssh.mpd',
      stubPlayerOptions(fakePlayer),
    );
    const deniedResponse: Response = {
      data: encodeAsciiAndPayload('GLS/1.0 400 DENIED\r\n\r\n', [0x00]),
    };

    await expectAsync(
      fakePlayer.networkingEngine.dispatchResponse(
        RequestType.LICENSE,
        deniedResponse,
      ),
    ).toBeRejectedWithError('GLS license error (400 DENIED)');
  });

  it('rejects malformed GLS responses without header terminator', async () => {
    const fakePlayer = new FakePlayer();
    await startShakaPlayback(
      'https://example.com/oops_cenc_pssh.mpd',
      stubPlayerOptions(fakePlayer),
    );
    const truncatedResponse: Response = {
      data: encodeAsciiAndPayload(
        'GLS/1.0 0 OK\r\nAuthorized-Format-Types: SD',
        [],
      ),
    };

    await expectAsync(
      fakePlayer.networkingEngine.dispatchResponse(
        RequestType.LICENSE,
        truncatedResponse,
      ),
    ).toBeRejectedWithError(
      'Malformed GLS license response: missing header terminator',
    );
  });

  it('tracks format authorizations and clears SD cap on HD', async () => {
    const fakePlayer = new FakePlayer();
    await startShakaPlayback(
      'https://example.com/oops_cenc_pssh.mpd',
      stubPlayerOptions(fakePlayer),
    );
    const audioResponse: Response = {
      data: encodeAsciiAndPayload(
        'GLS/1.0 0 OK\r\nAuthorized-Format-Types: AUDIO\r\n\r\n',
        [0x11],
      ),
    };
    const sdOnlyResponse: Response = {
      data: encodeAsciiAndPayload(
        'GLS/1.0 0 OK\r\nAuthorized-Format-Types: SD\r\n\r\n',
        [0xaa, 0xbb],
      ),
    };
    const hdResponse: Response = {
      data: encodeAsciiAndPayload(
        'GLS/1.0 0 OK\r\nAuthorized-Format-Types: SD, HD\r\n\r\n',
        [0xcc, 0xdd],
      ),
    };

    await fakePlayer.networkingEngine.dispatchResponse(
      RequestType.LICENSE,
      audioResponse,
    );
    expect(
      fakePlayer.configurations.some((cfg) => cfg.restrictions !== undefined),
    ).toBeFalse();

    await fakePlayer.networkingEngine.dispatchResponse(
      RequestType.LICENSE,
      sdOnlyResponse,
    );
    expect(Array.from(new Uint8Array(sdOnlyResponse.data))).toEqual([
      0xaa, 0xbb,
    ]);
    expect(fakePlayer.configurations.at(-1)).toEqual({
      restrictions: {maxHeight: 576},
    });

    await fakePlayer.networkingEngine.dispatchResponse(
      RequestType.LICENSE,
      hdResponse,
    );
    expect(Array.from(new Uint8Array(hdResponse.data))).toEqual([0xcc, 0xdd]);
    expect(fakePlayer.configurations.at(-1)).toEqual({
      restrictions: {maxHeight: Infinity},
    });
  });

  it('cleans up player and rejects when load fails', async () => {
    const fakePlayer = new FakePlayer();
    const shakaError: PlayerError = {category: 6, code: 6001};
    spyOn(fakePlayer, 'load').and.rejectWith(shakaError);

    await expectAsync(
      startShakaPlayback(
        'https://example.com/oops_cenc_pssh.mpd',
        stubPlayerOptions(fakePlayer),
      ),
    ).toBeRejectedWithError(/category 6, code 6001/);

    expect(fakePlayer.destroyed).toBeTrue();
    expect(fakePlayer.errorListenerCount).toBe(0);
    expect(getVideoElement()).toBeNull();
  });

  it('surfaces post-load Shaka license errors and cleans up', async () => {
    const fakePlayer = new FakePlayer();
    playSpy.and.returnValue(new Promise<void>(() => {}));
    spyOn(fakePlayer, 'load').and.callFake(async () => {
      queueMicrotask(() => {
        fakePlayer.emitError({
          category: 6,
          code: 6007,
          data: [new Error('GLS license error (400 DENIED)')],
        });
      });
    });

    await expectAsync(
      startShakaPlayback(
        'https://example.com/oops_cenc_pssh.mpd',
        stubPlayerOptions(fakePlayer),
      ),
    ).toBeRejectedWithError(
      'Failed to start video playback: Shaka error (category 6, ' +
        'code 6007): GLS license error (400 DENIED)',
    );

    expect(fakePlayer.destroyed).toBeTrue();
    expect(fakePlayer.errorListenerCount).toBe(0);
    expect(getVideoElement()).toBeNull();
  });

  it('fails and cleans up when playback does not start in time', async () => {
    const fakePlayer = new FakePlayer();
    playSpy.and.resolveTo();

    await expectAsync(
      startShakaPlayback('https://example.com/oops_cenc_pssh.mpd', {
        createPlayer: () => Promise.resolve(fakePlayer),
        startupTimeoutMs: 10,
      }),
    ).toBeRejectedWithError(
      'Failed to start video playback: Timed out after 10ms waiting ' +
        'for playback',
    );

    expect(fakePlayer.destroyed).toBeTrue();
    expect(fakePlayer.errorListenerCount).toBe(0);
    expect(getVideoElement()).toBeNull();
  });

  it('times out when createPlayer hangs and destroys late player', async () => {
    const latePlayer = new FakePlayer();
    let resolveCreatePlayer: (player: Player) => void = () => {};

    await expectAsync(
      startShakaPlayback('https://example.com/oops_cenc_pssh.mpd', {
        createPlayer: () =>
          new Promise<Player>((resolve) => {
            resolveCreatePlayer = resolve;
          }),
        startupTimeoutMs: 10,
      }),
    ).toBeRejectedWithError(
      'Failed to start video playback: Timed out after 10ms waiting ' +
        'for playback',
    );
    resolveCreatePlayer(latePlayer);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(latePlayer.destroyed).toBeTrue();
    expect(latePlayer.loadedUri).toBeNull();
    expect(getVideoElement()).toBeNull();
  });

  it('destroys player and video element on stopShakaPlayback', async () => {
    const fakePlayer = new FakePlayer();
    await startShakaPlayback(
      'https://example.com/waymo_vp9_opus.mpd',
      stubPlayerOptions(fakePlayer),
    );
    expect(getVideoElement()).not.toBeNull();

    await stopShakaPlayback();

    expect(fakePlayer.destroyed).toBeTrue();
    expect(getVideoElement()).toBeNull();
  });
});

type ResponseFilter = (
  type: number,
  response: Response,
) => Promise<void> | void;

/** Creates `ShakaPlaybackOptions` bound to a fake player instance. */
function stubPlayerOptions(player: Player): ShakaPlaybackOptions {
  return {createPlayer: () => Promise.resolve(player)};
}

interface SystemUrlSpec {
  readonly type: string;
  readonly uri: string;
  readonly tagName?: string;
}

/** Builds a real XML `<ContentProtection>` node with `<yt:SystemURL>` items. */
function createContentProtectionElement(
  schemeIdUri: string,
  systemUrls: readonly SystemUrlSpec[] = [],
): Element {
  const xmlDoc = document.implementation.createDocument(
    'urn:mpeg:dash:schema:mpd:2011',
    'MPD',
    null,
  );
  const element = xmlDoc.createElementNS(
    'urn:mpeg:dash:schema:mpd:2011',
    'ContentProtection',
  );
  element.setAttribute('schemeIdUri', schemeIdUri);
  for (const entry of systemUrls) {
    const child = xmlDoc.createElementNS(
      'http://youtube.com/drm/2012/10/10',
      entry.tagName ?? 'yt:SystemURL',
    );
    child.setAttribute('type', entry.type);
    child.textContent = entry.uri;
    element.appendChild(child);
  }
  return element;
}

/** Concatenates an ASCII header string and raw binary license bytes. */
function encodeAsciiAndPayload(
  header: string,
  payload: readonly number[],
): ArrayBuffer {
  const out = new Uint8Array(header.length + payload.length);
  for (let i = 0; i < header.length; i++) {
    out[i] = header.charCodeAt(i);
  }
  out.set(payload, header.length);
  return out.buffer;
}

/** In-memory Shaka `NetworkingEngine` fake for exercising response filters. */
class FakeNetworkingEngine implements NetworkingEngine {
  readonly responseFilters: ResponseFilter[] = [];

  registerRequestFilter(): void {}

  registerResponseFilter(filter: ResponseFilter): void {
    this.responseFilters.push(filter);
  }

  async dispatchResponse(type: number, response: Response): Promise<void> {
    for (const filter of this.responseFilters) {
      await filter(type, response);
    }
  }
}

/** In-memory Shaka `Player` fake capturing configuration and lifecycle. */
class FakePlayer implements Player {
  readonly networkingEngine = new FakeNetworkingEngine();
  readonly configurations: PlayerConfiguration[] = [];
  loadedUri: string | null = null;
  destroyed = false;

  private customScheme: ((element: Element) => DrmInfo[] | null) | undefined;
  private readonly errorListeners = new Set<(event: PlayerEvent) => void>();

  get errorListenerCount(): number {
    return this.errorListeners.size;
  }

  unload(): Promise<void> {
    return Promise.resolve();
  }

  destroy(): Promise<void> {
    this.destroyed = true;
    return Promise.resolve();
  }

  configure(config: PlayerConfiguration): void {
    this.configurations.push(config);
    if (config.manifest?.dash?.customScheme) {
      this.customScheme = config.manifest.dash.customScheme;
    }
  }

  getNetworkingEngine(): NetworkingEngine {
    return this.networkingEngine;
  }

  load(uri: string): Promise<void> {
    this.loadedUri = uri;
    return Promise.resolve();
  }

  addEventListener(type: string, listener: (event: PlayerEvent) => void): void {
    if (type === 'error') {
      this.errorListeners.add(listener);
    }
  }

  removeEventListener(
    type: string,
    listener: (event: PlayerEvent) => void,
  ): void {
    if (type === 'error') {
      this.errorListeners.delete(listener);
    }
  }

  emitError(detail: PlayerError): void {
    for (const listener of [...this.errorListeners]) {
      listener({type: 'error', detail});
    }
  }

  parseContentProtection(element: Element): DrmInfo[] | null {
    if (!this.customScheme) {
      throw new Error('customScheme was not configured');
    }
    return this.customScheme(element);
  }
}
