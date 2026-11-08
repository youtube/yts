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
 * @fileoverview Unit tests for Cobalt lifecycle management utilities.
 */

import 'jasmine';

import {
  Device,
  Script,
} from 'google3/third_party/javascript/yts/devices/interfaces';
import * as testContext from 'google3/third_party/javascript/yts/test_context';
import * as ytsCommon from 'google3/third_party/javascript/yts/yts_common';
import {exitCobalt} from './launch_util';

describe('exitCobalt', () => {
  let mockScript: jasmine.SpyObj<Script>;
  let mockDevice: jasmine.SpyObj<Device>;

  beforeEach(() => {
    jasmine.clock().install();
    spyOn(console, 'log');
    spyOn(ytsCommon, 'sleep').and.resolveTo();

    mockScript = jasmine.createSpyObj<Script>('Script', [
      'invoke',
      'invokeIgnoringDisconnect',
      'isConnected',
      'disconnect',
    ]);
    mockScript.isConnected.and.returnValue(true);

    mockDevice = jasmine.createSpyObj<Device>(
        'Device',
        ['stop'],
        {
          deviceType: 'dab',
          activeScript: mockScript,
        },
    );
    mockDevice.stop.and.resolveTo();
    spyOn(testContext, 'deviceUnderTest').and.resolveTo(mockDevice);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('skips teardown when activeScript is disconnected', async () => {
    mockScript.isConnected.and.returnValue(false);

    await exitCobalt();

    expect(mockScript.invokeIgnoringDisconnect).not.toHaveBeenCalled();
    expect(mockDevice.stop).not.toHaveBeenCalled();
  });

  it('skips device.stop for legacy Cobalt (returns false)', async () => {
    mockScript.invokeIgnoringDisconnect.and.resolveTo(false);

    await exitCobalt();

    expect(mockScript.invokeIgnoringDisconnect).toHaveBeenCalledOnceWith(
        'exitCobalt',
        true,
    );
    expect(mockDevice.stop).not.toHaveBeenCalled();
    expect(mockScript.disconnect).not.toHaveBeenCalled();
  });

  it('flushes storage and stops Chrobalt (returns true)', async () => {
    mockScript.invokeIgnoringDisconnect.and.resolveTo(true);

    await exitCobalt();

    expect(ytsCommon.sleep).toHaveBeenCalledWith(1500);
    expect(mockDevice.stop).toHaveBeenCalledOnceWith();
    expect(mockScript.disconnect).not.toHaveBeenCalled();
  });

  it('stops device and disconnects when script times out', async () => {
    mockScript.invokeIgnoringDisconnect.and.returnValue(
        new Promise<never>(() => {}),
    );

    const exitPromise = exitCobalt();
    await Promise.resolve();
    jasmine.clock().tick(5000);
    await exitPromise;

    expect(mockDevice.stop).toHaveBeenCalledOnceWith();
    expect(mockScript.disconnect).toHaveBeenCalledOnceWith();
    expect(ytsCommon.sleep).not.toHaveBeenCalledWith(1500);
  });
});
