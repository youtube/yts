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

import 'jasmine';
import 'yts';

import {
  cleanupVideoElement,
  getVideoElement,
  initializeVideoElement,
} from './playback_util';
import {
  getMimeTypeWithTunnelMode,
  isTunnelModeCapabilityEnabled,
  isTunnelModeDisabled,
  isTunnelModeSupported,
  runWithTunnelModeDualPass,
} from './tunnel_mode';

const ATV_USER_AGENT =
  'Mozilla/5.0 (ATV; 14.0) Cobalt/25.lts.20.1034877-gold (unlike Gecko) v8/8.8.278.17-jit gles Starboard/16, Google_ATV_sabrina_2020/STTL.241013.003 (Google, Chromecast)';
const NON_ATV_USER_AGENT =
  'Mozilla/5.0 (LINUX; Tizen/5.5/2021.1.3) Cobalt/22.lts.6.308696-gold (unlike Gecko) v8/8.8.278.8-jit gles Starboard/12, Samsung_TV_KANTS2_2020/T-KTS2AKUC-2505.4 (Samsung, UN32M4500BFXZA, Wired)';
const VIDEO_MIME = 'video/mp4; codecs="avc1.4d401e"';
const AUDIO_MIME = 'audio/mp4; codecs="mp4a.40.2"';

describe('tunnel_mode helpers', () => {
  let flags: Map<string, string>;
  let userAgentSpy: jasmine.Spy;
  // tslint:disable-next-line:no-any
  let originalYts: any;

  beforeEach(() => {
    flags = new Map<string, string>();
    // tslint:disable-next-line:no-any
    originalYts = (globalThis as any).yts;
    // tslint:disable-next-line:no-any
    (globalThis as any).yts = {
      ...originalYts,
      getFlag: (key: string) => flags.get(key),
    };
    userAgentSpy = spyOnProperty(
      window.navigator,
      'userAgent',
      'get',
    ).and.returnValue(ATV_USER_AGENT);
    spyOn(MediaSource, 'isTypeSupported').and.callFake((mime: string) =>
      mime.includes('tunnelmode=true'),
    );
  });

  afterEach(() => {
    // tslint:disable-next-line:no-any
    (globalThis as any).yts = originalYts;
  });

  describe('isTunnelModeDisabled', () => {
    it('returns false by default', () => {
      expect(isTunnelModeDisabled()).toBeFalse();
    });

    it('returns true when disable_tunnel flag is true or 1', () => {
      flags.set('disable_tunnel', 'true');
      expect(isTunnelModeDisabled()).toBeTrue();

      flags.set('disable_tunnel', '1');
      expect(isTunnelModeDisabled()).toBeTrue();
    });

    it('returns true when PlaybackOptions.disableTunnel is true', () => {
      expect(isTunnelModeDisabled({disableTunnel: true})).toBeTrue();
    });

    it('returns false without throwing when yts.getFlag is undefined', () => {
      // tslint:disable-next-line:no-any
      (globalThis as any).yts = {};
      expect(isTunnelModeDisabled()).toBeFalse();
    });
  });

  describe('isTunnelModeCapabilityEnabled', () => {
    it('defaults to false when supports_tunnel_mode flag is unset', () => {
      expect(isTunnelModeCapabilityEnabled()).toBeFalse();
    });

    it('returns true when supports_tunnel_mode flag is true or 1', () => {
      flags.set('supports_tunnel_mode', 'true');
      expect(isTunnelModeCapabilityEnabled()).toBeTrue();

      flags.set('supports_tunnel_mode', '1');
      expect(isTunnelModeCapabilityEnabled()).toBeTrue();
    });

    it('returns false when supports_tunnel_mode flag is false or 0', () => {
      flags.set('supports_tunnel_mode', 'false');
      expect(isTunnelModeCapabilityEnabled()).toBeFalse();

      flags.set('supports_tunnel_mode', '0');
      expect(isTunnelModeCapabilityEnabled()).toBeFalse();
    });

    it('returns false without throwing when yts.getFlag is undefined', () => {
      // tslint:disable-next-line:no-any
      (globalThis as any).yts = {};
      expect(isTunnelModeCapabilityEnabled()).toBeFalse();
    });
  });

  describe('isTunnelModeSupported & getMimeTypeWithTunnelMode', () => {
    it('upgrades video MIME type on ATV when supports_tunnel_mode capability is enabled, without relying on MediaSource.isTypeSupported', () => {
      flags.set('supports_tunnel_mode', 'true');
      (MediaSource.isTypeSupported as jasmine.Spy).and.returnValue(false);

      expect(isTunnelModeSupported()).toBeTrue();
      expect(getMimeTypeWithTunnelMode(VIDEO_MIME)).toBe(
        `${VIDEO_MIME};tunnelmode=true`,
      );
    });

    it('does not upgrade when supports_tunnel_mode is unset or false even if MediaSource supports tunnel mode', () => {
      expect(isTunnelModeSupported()).toBeFalse();
      expect(getMimeTypeWithTunnelMode(VIDEO_MIME)).toBe(VIDEO_MIME);

      flags.set('supports_tunnel_mode', 'false');
      expect(isTunnelModeSupported()).toBeFalse();
      expect(getMimeTypeWithTunnelMode(VIDEO_MIME)).toBe(VIDEO_MIME);
    });

    it('does not upgrade when disable_tunnel is set', () => {
      flags.set('supports_tunnel_mode', 'true');
      flags.set('disable_tunnel', 'true');

      expect(isTunnelModeSupported()).toBeFalse();
      expect(getMimeTypeWithTunnelMode(VIDEO_MIME)).toBe(VIDEO_MIME);
    });

    it('does not upgrade when options.disableTunnel is true', () => {
      flags.set('supports_tunnel_mode', 'true');

      expect(isTunnelModeSupported({disableTunnel: true})).toBeFalse();
      expect(
        getMimeTypeWithTunnelMode(VIDEO_MIME, {disableTunnel: true}),
      ).toBe(VIDEO_MIME);
    });

    it('does not upgrade on non-ATV user agents', () => {
      flags.set('supports_tunnel_mode', 'true');
      userAgentSpy.and.returnValue(NON_ATV_USER_AGENT);

      expect(isTunnelModeSupported()).toBeFalse();
      expect(getMimeTypeWithTunnelMode(VIDEO_MIME)).toBe(VIDEO_MIME);
    });

    it('does not upgrade audio MIME types', () => {
      flags.set('supports_tunnel_mode', 'true');

      expect(getMimeTypeWithTunnelMode(AUDIO_MIME)).toBe(AUDIO_MIME);
    });
  });

  describe('runWithTunnelModeDualPass', () => {
    beforeEach(() => {
      initializeVideoElement();
    });

    afterEach(() => {
      cleanupVideoElement();
    });

    it('executes Pass 1 (Tunnel ON) and Pass 2 (Tunnel OFF) with DOM reset when tunnel mode is active', (done) => {
      flags.set('supports_tunnel_mode', 'true');
      const seenMimes: string[] = [];
      const seenDisableTunnelOptions: Array<boolean | undefined> = [];
      const seenVideoElements: Array<HTMLVideoElement | null> = [];
      let teardownCalled = 0;

      runWithTunnelModeDualPass(
        () => {
          expect(seenMimes).toEqual([
            `${VIDEO_MIME};tunnelmode=true`,
            VIDEO_MIME,
          ]);
          expect(seenDisableTunnelOptions).toEqual([false, true]);
          expect(teardownCalled).toBe(1);
          expect(seenVideoElements.length).toBe(2);
          expect(seenVideoElements[0]).not.toBeNull();
          expect(seenVideoElements[1]).not.toBeNull();
          expect(seenVideoElements[0]).not.toBe(seenVideoElements[1]);
          done();
        },
        (passDone, options) => {
          seenVideoElements.push(getVideoElement());
          seenDisableTunnelOptions.push(options.disableTunnel);
          // Even if a nested caller omits `options`, Pass 2 forces non-tunnel.
          seenMimes.push(getMimeTypeWithTunnelMode(VIDEO_MIME));
          passDone();
        },
        {
          onBeforePass2: async () => {
            teardownCalled++;
            cleanupVideoElement();
            initializeVideoElement();
          },
        },
      );
    });

    it('executes only Pass 1 when device model supports_tunnel_mode is false', (done) => {
      flags.set('supports_tunnel_mode', 'false');
      const seenMimes: string[] = [];
      let teardownCalled = 0;

      runWithTunnelModeDualPass(
        () => {
          expect(seenMimes).toEqual([VIDEO_MIME]);
          expect(teardownCalled).toBe(0);
          done();
        },
        (passDone, options) => {
          seenMimes.push(getMimeTypeWithTunnelMode(VIDEO_MIME, options));
          passDone();
        },
        {
          onBeforePass2: () => {
            teardownCalled++;
          },
        },
      );
    });

    it('executes only Pass 1 when disable_tunnel is set', (done) => {
      flags.set('supports_tunnel_mode', 'true');
      flags.set('disable_tunnel', 'true');
      let passes = 0;

      runWithTunnelModeDualPass(
        () => {
          expect(passes).toBe(1);
          done();
        },
        (passDone) => {
          passes++;
          passDone();
        },
      );
    });

    it('short-circuits and skips Pass 2 when Pass 1 calls passDone.fail', (done) => {
      flags.set('supports_tunnel_mode', 'true');
      let passes = 0;
      let teardownCalled = 0;
      const outerDone = (() => {
        done.fail('outerDone should not be called on Pass 1 failure');
      }) as DoneFn;
      outerDone.fail = (err?: Error | string) => {
        expect(err).toBe('Pass 1 playback error');
        expect(passes).toBe(1);
        expect(teardownCalled).toBe(0);
        done();
      };

      runWithTunnelModeDualPass(
        outerDone,
        (passDone) => {
          passes++;
          passDone.fail('Pass 1 playback error');
        },
        {
          onBeforePass2: () => {
            teardownCalled++;
          },
        },
      );
    });
  });
});
