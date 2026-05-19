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

import type {StreamDef} from '../streams/interfaces';

import {LicenseManager} from './license_manager';

describe('LicenseManager', () => {
  let videoElement: HTMLVideoElement;
  let mockStream: StreamDef;
  let licenseManager: LicenseManager;
  let xhrConfiguration: {
    status: number;
    responseText: string;
    response: ArrayBuffer;
    readyState: number;
  };
  let sendSpy: jasmine.Spy;

  beforeEach(() => {
    // Set up XHR spy.
    let listener: EventListener;
    xhrConfiguration = {
      readyState: 4,
      status: 200,
      responseText: 'response',
      response: new ArrayBuffer(8),
    };

    spyOn(XMLHttpRequest.prototype, 'open');
    spyOn(XMLHttpRequest.prototype, 'setRequestHeader');
    spyOn(XMLHttpRequest.prototype, 'addEventListener').and.callFake(
      (type: string, l: EventListener) => {
        if (type === 'readystatechange') {
          listener = l;
        }
      },
    );
    sendSpy = spyOn(XMLHttpRequest.prototype, 'send').and.callFake(function (
      this: XMLHttpRequest,
    ) {
      Object.defineProperties(this, {
        'readyState': {value: xhrConfiguration.readyState},
        'status': {value: xhrConfiguration.status},
        'responseText': {value: xhrConfiguration.responseText},
        'response': {value: xhrConfiguration.response},
      });
      const event = new Event('readystatechange');
      Object.defineProperty(event, 'target', {value: this});
      if (listener) {
        listener(event);
      }
    });

    // Set up License Manager,
    videoElement = {} as unknown as HTMLVideoElement;
    mockStream = {
      mimetype: 'video/mp4; codecs="avc1.42E01E"',
      get: (key: string) => {
        if (key === 'license_server') {
          return 'https://example.com/license';
        }
        return null;
      },
    } as unknown as StreamDef;
    licenseManager = new LicenseManager(videoElement, [mockStream], 'widevine');
  });

  it('should initialize with a license server from the stream', () => {
    expect(licenseManager.licenseServer).toBe('https://example.com/license');
  });

  it('should construct a license server URL if not in stream', () => {
    mockStream.get = (key: string) => null; // No license server in stream
    licenseManager = new LicenseManager(videoElement, [mockStream], 'widevine');
    expect(licenseManager.licenseServer).toContain(
      'https://dash-mse-test.appspot.com',
    );
  });

  it('should create a valid key system config', () => {
    const config = licenseManager.makeKeySystemConfig();
    expect(config[0].initDataTypes).toEqual(['cenc']);
    expect(config[0].videoCapabilities).toBeDefined();
  });

  it('should return null when external PSSH is not present', () => {
    mockStream.get = (key: string) => null;
    expect(licenseManager.getExternalPSSH()).toBeNull();
  });

  it('should return the external PSSH when it is present', () => {
    const pssh = new Uint8Array([0, 1, 2]);
    mockStream.get = (key: string) => {
      if (key === 'pssh') {
        return pssh;
      }
      return null;
    };
    expect(licenseManager.getExternalPSSH()).toEqual(pssh.buffer);
  });

  it('should call requestLicense', () => {
    const requestLicenseSpy = spyOn(licenseManager, 'requestLicense');
    const cb = () => {};
    licenseManager.acquireLicense(new ArrayBuffer(0), cb);
    expect(requestLicenseSpy).toHaveBeenCalled();
  });

  it('should request a license successfully', (done) => {
    licenseManager.requestLicense(new ArrayBuffer(0), (license) => {
      expect(license.byteLength).toBe(8);
      done();
    });
  });

  it('should retry license requests on failure', () => {
    xhrConfiguration.status = 500;
    licenseManager.requestLicense(new ArrayBuffer(0), () => {});
    expect(sendSpy.calls.count()).toBe(3);
  });

  it('should request individualization successfully', (done) => {
    licenseManager.requestIndividualization(new ArrayBuffer(0), (response) => {
      expect(response.byteLength).toBe(8);
      done();
    });
  });

  it('should abort pending requests on dispose', () => {
    const abortSpy = spyOn(XMLHttpRequest.prototype, 'abort');
    // Trigger a request but don't complete it.
    xhrConfiguration.readyState = 1;
    licenseManager.requestLicense(new ArrayBuffer(0), () => {});

    licenseManager.dispose();

    expect(abortSpy).toHaveBeenCalled();
  });

  it('should not send requests if disposed', () => {
    licenseManager.dispose();
    licenseManager.requestLicense(new ArrayBuffer(0), () => {});
    licenseManager.requestIndividualization(new ArrayBuffer(0), () => {});

    // First call was in beforeEach, should not have increased.
    expect(sendSpy.calls.count()).toBe(0);
  });
});
