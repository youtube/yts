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

import {isAndroidTv} from 'google3/third_party/javascript/yts/test_utils/cobalt';
import type {PlaybackOptions} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';

/**
 * Tracks whether Pass 2 of a dual-pass test is forcing non-tunnel execution.
 */
let forceDisableTunnelInCurrentPass = false;

/**
 * Determines whether tunnel mode is disabled via URL query parameters,
 * runtime runner flags, or explicit PlaybackOptions.
 */
export function isTunnelModeDisabled(options?: PlaybackOptions): boolean {
  const disableTunnelFlag = yts.getFlag?.('disable_tunnel');
  return (
    forceDisableTunnelInCurrentPass ||
    window.location.search.includes('disable_tunnel=true') ||
    window.location.search.includes('disable_tunnel=1') ||
    disableTunnelFlag === 'true' ||
    disableTunnelFlag === '1' ||
    Boolean(options?.disableTunnel)
  );
}

/**
 * Determines whether the target device series has tunnel mode capability
 * enabled (`supports_tunnel_mode`) according to runtime runner flags or URL
 * query parameters.
 *
 * Defaults to `false` unless `supports_tunnel_mode` is explicitly enabled via
 * the Saltmine test plan or CLI `--flags supports_tunnel_mode=true`, because
 * Android TV devices unconditionally report `isTypeSupported` for
 * `;tunnelmode=true` at the platform level even when not certified for tunnel
 * mode.
 */
export function isTunnelModeCapabilityEnabled(): boolean {
  const flag = yts.getFlag?.('supports_tunnel_mode');
  return (
    window.location.search.includes('supports_tunnel_mode=true') ||
    window.location.search.includes('supports_tunnel_mode=1') ||
    flag === 'true' ||
    flag === '1'
  );
}

/**
 * Determines whether tunnel mode is supported and active for the current
 * device, device series capability (`supports_tunnel_mode`), and runtime
 * options (`disable_tunnel`).
 *
 * Does not rely on `MediaSource.isTypeSupported(mimetype + ';tunnelmode=true')`
 * because Android TV devices report tunnel mode MIME support at the platform
 * level even when tunnel mode is not enabled for YouTube certification.
 */
export function isTunnelModeSupported(options?: PlaybackOptions): boolean {
  return (
    isAndroidTv(
      typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    ) &&
    isTunnelModeCapabilityEnabled() &&
    !isTunnelModeDisabled(options)
  );
}

/**
 * Returns the MIME type with ';tunnelmode=true' appended if running on Android TV
 * with tunnel mode capability enabled and not explicitly disabled.
 */
export function getMimeTypeWithTunnelMode(
  mimetype: string,
  options?: PlaybackOptions,
): string {
  if (!mimetype.startsWith('video/')) {
    return mimetype;
  }
  if (isTunnelModeSupported(options)) {
    const tunnelMimeType = mimetype + ';tunnelmode=true';
    console.log('Upgrading video stream to tunnel mode:', tunnelMimeType);
    return tunnelMimeType;
  }
  return mimetype;
}

/** Options for configuring a dual-pass tunnel mode playback test. */
export interface DualPassPlaybackOptions {
  /**
   * Optional mid-test cleanup callback invoked after Pass 1 completes and
   * before the video element is reset and re-initialized for Pass 2 (e.g., to
   * stop active streams, clear timeouts/XHRs, or dispose EME handlers).
   */
  onBeforePass2?: () => void | Promise<void>;
}

/**
 * Executes a video playback test in up to two passes:
 * - Pass 1 runs with default options (upgrading to Tunnel Mode ON when
 *   supported by the Android TV device and enabled for the device series).
 * - If Tunnel Mode is supported, performs mid-test teardown
 *   (`onBeforePass2`, `cleanupVideoElement`, `initializeVideoElement`) and
 *   executes Pass 2 with `{disableTunnel: true}` (Tunnel Mode OFF).
 *
 * Kept modular in one place so dual-run can be easily removed once Tunnel Mode
 * is enforced across certification without a non-tunnel fallback pass.
 */
export function runWithTunnelModeDualPass(
  done: DoneFn | (() => void),
  runPass: (passDone: DoneFn, options: PlaybackOptions) => void,
  dualPassOptions?: DualPassPlaybackOptions,
): void {
  forceDisableTunnelInCurrentPass = false;
  let pass1Completed = false;

  const failOuter = (message?: Error | string) => {
    const doneWithFail = done as Partial<DoneFn>;
    if (typeof doneWithFail.fail === 'function') {
      doneWithFail.fail(message);
    } else {
      fail(message);
      done();
    }
  };

  const runPass2 = async () => {
    try {
      console.log(
        'Tunnel mode active in Pass 1. Tearing down for Pass 2 (Non-Tunnel)...',
      );
      await dualPassOptions?.onBeforePass2?.();
      forceDisableTunnelInCurrentPass = true;

      let pass2Completed = false;
      const onPass2Done = (() => {
        if (pass2Completed) return;
        pass2Completed = true;
        forceDisableTunnelInCurrentPass = false;
        console.log('Pass 2 (Non-Tunnel) playback completed.');
        done();
      }) as DoneFn;
      onPass2Done.fail = (message?: Error | string) => {
        if (pass2Completed) return;
        pass2Completed = true;
        forceDisableTunnelInCurrentPass = false;
        failOuter(message);
      };

      console.log('Starting Pass 2 (Non-Tunnel)...');
      runPass(onPass2Done, {disableTunnel: true});
    } catch (err: unknown) {
      forceDisableTunnelInCurrentPass = false;
      const msg = err instanceof Error ? err.message : String(err);
      fail('Error during mid-test teardown before Pass 2: ' + msg);
      done();
    }
  };

  const onPass1Done = (() => {
    if (pass1Completed) return;
    pass1Completed = true;

    if (isTunnelModeSupported()) {
      void runPass2();
    } else {
      forceDisableTunnelInCurrentPass = false;
      done();
    }
  }) as DoneFn;
  onPass1Done.fail = (message?: Error | string) => {
    if (pass1Completed) return;
    pass1Completed = true;
    forceDisableTunnelInCurrentPass = false;
    failOuter(message);
  };

  runPass(onPass1Done, {disableTunnel: false});
}
