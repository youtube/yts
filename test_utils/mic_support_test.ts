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

import {getMicSupport, H5vccWindowWithPlatformService, PlatformService} from 'google3/third_party/javascript/yts/test_utils/mic_support';

describe('voice_support', () => {
  let mockWindow: H5vccWindowWithPlatformService;
  let mockPlatformService: jasmine.SpyObj<PlatformService>;
  let mockVoiceService: jasmine.SpyObj<PlatformService>;

  beforeEach(() => {
    mockVoiceService = jasmine.createSpyObj('PlatformService', [
      'send',
      'close',
    ]);
    mockPlatformService = jasmine.createSpyObj('PlatformService', [
      'has',
      'open',
    ]);
    mockWindow = {
      // tslint:disable-next-line:enforce-name-casing
      H5vccPlatformService: mockPlatformService,
    } as unknown as H5vccWindowWithPlatformService;
  });

  it('returns undefined if H5vccPlatformService is not present', async () => {
    const result = await getMicSupport({} as Window);
    expect(result).toBeUndefined();
  });

  it('returns undefined if platform service does not have SoftMic', async () => {
    mockPlatformService.has.and.returnValue(false);

    const result = await getMicSupport(mockWindow);

    expect(result).toBeUndefined();
    expect(mockPlatformService.has).toHaveBeenCalledWith(
      'com.google.youtube.tv.SoftMic',
    );
  });

  it('returns undefined if open returns null', async () => {
    mockPlatformService.has.and.returnValue(true);
    mockPlatformService.open.and.returnValue(null);

    const result = await getMicSupport(mockWindow);

    expect(result).toBeUndefined();
  });

  it('returns voice support on successful parse', async () => {
    mockPlatformService.has.and.returnValue(true);
    mockPlatformService.open.and.callFake(
      (
        name: string,
        callback: (service: PlatformService, data: ArrayBuffer) => void,
      ) => {
        const payloadStr = JSON.stringify({
          hasSoftMicSupport: true,
          hasHardMicSupport: false,
        });
        const bytes = new Uint8Array(payloadStr.length);
        for (let i = 0; i < payloadStr.length; i++) {
          bytes[i] = payloadStr.charCodeAt(i);
        }
        setTimeout(() => {
          callback(mockVoiceService, bytes.buffer);
        }, 0);
        return mockVoiceService;
      },
    );

    const result = await getMicSupport(mockWindow);

    expect(result).toEqual({
      hasSoftMicSupport: true,
      hasHardMicSupport: false,
    });
    expect(mockVoiceService.send).toHaveBeenCalled();
  });

  it('returns undefined on invalid json payload', async () => {
    mockPlatformService.has.and.returnValue(true);
    mockPlatformService.open.and.callFake(
      (
        name: string,
        callback: (service: PlatformService, data: ArrayBuffer) => void,
      ) => {
        const payloadStr = 'invalid json';
        const bytes = new Uint8Array(payloadStr.length);
        for (let i = 0; i < payloadStr.length; i++) {
          bytes[i] = payloadStr.charCodeAt(i);
        }
        setTimeout(() => {
          callback(mockVoiceService, bytes.buffer);
        }, 0);
        return mockVoiceService;
      },
    );

    const result = await getMicSupport(mockWindow);

    expect(result).toBeUndefined();
  });

  it('returns undefined on timeout', async () => {
    jasmine.clock().install();
    mockPlatformService.has.and.returnValue(true);
    mockPlatformService.open.and.returnValue(mockVoiceService);

    const promise = getMicSupport(mockWindow);

    // Fast-forward past the 2000ms timeout.
    jasmine.clock().tick(2001);

    const result = await promise;

    expect(result).toBeUndefined();
    jasmine.clock().uninstall();
  });
});
