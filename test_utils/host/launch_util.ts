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
 * @fileoverview Cobalt lifecycle management utilities.
 */

import {Device, Script} from 'google3/third_party/javascript/yts/devices/interfaces';
import {deviceUnderTest} from 'google3/third_party/javascript/yts/test_context';
import {sleep} from 'google3/third_party/javascript/yts/yts_common';

/** Arguments for launchCobalt */
export declare interface LaunchCobaltArgs {
  device?: Device;
  scriptModule: string;
  numAttempts?: number;
  reconnectDelayMs?: number;
  reconnectTimeoutOverride?: number;
  applyStickyLoader?: boolean;
  app?: 'YouTube'|'YouTubeTV';
}

/** Attempts to launch Cobalt */
export async function launchCobalt(args: LaunchCobaltArgs): Promise<Script> {
  const numAttempts = args.numAttempts ?? 10;
  const reconnectDelayMs = args.reconnectDelayMs ?? 30_000;
  const device = args.device ?? (await deviceUnderTest());
  const app = args.app;

  for (let attemptNum = 1; attemptNum <= numAttempts; attemptNum++) {
    try {
      if (attemptNum > 1) {
        console.log(
            `Could not reconnect to the yts agent! Waiting ${
                reconnectDelayMs / 1000} sec and trying again.`,
        );
        if (app === 'YouTubeTV') {
          console.log(`Make sure ${app} is installed.`);
        }
        console.log(
            `If the ${
                app} application is currently closed, try manually launching it.`,
        );
        await sleep(reconnectDelayMs);
      }

      const script = await device.launchScript({
        scriptModule: args.scriptModule,
        reconnectTimeoutOverride: args.reconnectTimeoutOverride,
        app,
      });

      if (args.applyStickyLoader === true) {
        await script.invoke('applyStickyLoader');
      }

      return script;
    } catch (e: unknown) {
      continue;
    }
  }
  throw new Error('Failure to launch Cobalt');
}

/**
 * Removes the sticky loader from the Cobalt UI.
 *
 * @param device Optional device instance where the script is currently active.
 *     Pass this when the test launched its script on a separate `Device`
 *     instance (e.g., a `DialDevice` converted via `toDialDevice()`) rather
 *     than the default `deviceUnderTest()`.
 */
export async function removeStickyLoader(device?: Device): Promise<void> {
  try {
    const targetDevice = device ?? (await deviceUnderTest());
    const script = targetDevice.getActiveScript();
    await script.invoke('removeStickyLoader');
  } catch (e: unknown) {
    console.log(
        'Ignoring error that happened while trying to remove sticky loader:',
    );
    console.log(e);
  }
}

/**
 * Exits Cobalt process (compatible with both Cobalt and Chrobalt).
 *
 * @param device Optional device instance where the script is currently active.
 *     Pass this when the test launched its script on a separate `Device`
 *     instance (e.g., a `DialDevice` converted via `toDialDevice()`) rather
 *     than the default `deviceUnderTest()`.
 */
export async function exitCobalt(device?: Device): Promise<void> {
  console.log('exitCobalt');
  try {
    const dut = await deviceUnderTest();
    const targetDevice = device ?? dut;
    const script = targetDevice.activeScript;
    if (!script?.isConnected()) {
      return;
    }
    const isChrobalt = (await script.invoke(
                           'exitCobalt',
                           /* migratedToDeviceStop = */ true,
                           )) as boolean;
    if (isChrobalt) {
      const stopDevice =
          targetDevice.deviceType === 'dial' ? dut : targetDevice;
      if (stopDevice.deviceType === 'dial') {
        // As an example, FireTV doesn't exit Cobalt process in response to DIAL
        // stop request.
        throw new Error(
            'Cannot exit C26+ via the DIAL interface. Use DAB or ADB instead.',
        );
      }
      await stopDevice.stop();
    }
  } catch (e: unknown) {
    console.log('Ignoring error that happened while trying to exit Cobalt:');
    console.log(e);
  }
  await sleep(3000);
}

/**
 * Suspends Cobalt process (compatible with both Cobalt and Chrobalt).
 *
 * @param device Optional device instance where the script is currently active.
 *     Pass this when the test launched its script on a separate `Device`
 *     instance (e.g., a `DialDevice` converted via `toDialDevice()`) rather
 *     than the default `deviceUnderTest()`.
 */
export async function suspendCobalt(device?: Device): Promise<void> {
  console.log('suspendCobalt');
  try {
    const dut = await deviceUnderTest();
    const targetDevice = device ?? dut;
    const script = targetDevice.getActiveScript();
    const isChrobalt = (await script.invoke(
                           'suspendCobalt',
                           /* migratedToDeviceSuspend = */ true,
                           )) as boolean;
    if (isChrobalt) {
      const suspendDevice =
          targetDevice.deviceType === 'dial' ? dut : targetDevice;
      if (suspendDevice.deviceType === 'dial') {
        throw new Error(
            'Cannot suspend C26+ via the DIAL interface. Use DAB or ADB instead.',
        );
      }
      await suspendDevice.suspend();
    }
  } catch (e: unknown) {
    console.log('Ignoring error that happened while trying to suspend Cobalt:');
    console.log(e);
  }
  await sleep(3000);
}
