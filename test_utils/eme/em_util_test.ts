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
import {setupEme} from './em_util';
import {EMEHandler} from './eme_handler';
import {LicenseManager} from './license_manager';

describe('em_util', () => {
  let mockEmeHandler: jasmine.SpyObj<EMEHandler>;
  let videoElement: HTMLVideoElement;
  let mockStream: StreamDef;

  beforeEach(() => {
    mockEmeHandler = jasmine.createSpyObj('EMEHandler', [
      'init',
      'checkKeySystem',
    ]);
    mockEmeHandler.checkKeySystem.and.resolveTo({} as MediaKeySystemAccess);
    videoElement = document.createElement('video');
    mockStream = {
      mimetype: 'video/mp4; codecs="avc1.42E01E"',
      get: (key: string) => null,
    } as unknown as StreamDef;

    spyOn(MediaSource, 'isTypeSupported').and.returnValue(true);
  });

  it('should initialize EMEHandler with correct arguments', () => {
    setupEme(mockEmeHandler, videoElement, [mockStream], 'widevine');

    expect(mockEmeHandler.init).toHaveBeenCalledWith(
      videoElement,
      jasmine.any(LicenseManager),
    );
    expect(mockEmeHandler.checkKeySystem).toHaveBeenCalled();
  });

  it('should throw an error if checkKeySystem throws an error', () => {
    const testError = new Error('test error');
    mockEmeHandler.checkKeySystem.and.throwError(testError);
    expect(() => {
      setupEme(mockEmeHandler, videoElement, [mockStream], 'widevine');
    }).toThrow(testError);
  });
});
