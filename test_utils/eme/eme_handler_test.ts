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

import {LicenseRequest, Message, RequestId} from 'google3/third_party/javascript/yts/test_utils/proto/license_request.proto';

import {EMEHandler} from './eme_handler';
import {LicenseManager} from './license_manager';

describe('EMEHandler', () => {
  let emeHandler: EMEHandler;
  let videoElement: HTMLVideoElement;
  let licenseManager: LicenseManager;
  let xhrConfiguration: {
    status: number;
    responseText: string;
    response: ArrayBuffer;
    readyState: number;
  };
  let requestMediaKeySystemAccessSpy: jasmine.Spy;

  beforeEach(() => {
    emeHandler = new EMEHandler();
    videoElement = document.createElement('video');
    licenseManager = {
      getExternalPSSH: () => null,
      keySystem: 'com.widevine.alpha',
      makeKeySystemConfig: () => [],
      dispose: () => {},
    } as unknown as LicenseManager;

    // `navigator.requestMediaKeySystemAccess` only exists in secure contexts
    // (e.g. HTTPS) so we have to inject a fake method to avoid nullrefs.
    requestMediaKeySystemAccessSpy =
      navigator.requestMediaKeySystemAccess as jasmine.Spy;
    if (!requestMediaKeySystemAccessSpy) {
      requestMediaKeySystemAccessSpy = jasmine.createSpy(
        'requestMediaKeySystemAccess',
      );
      navigator.requestMediaKeySystemAccess = requestMediaKeySystemAccessSpy;
    }

    // Set up XHR spy.
    let listener: EventListener;
    xhrConfiguration = {
      readyState: 4,
      status: 200,
      responseText: 'response',
      response: new ArrayBuffer(0),
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
    spyOn(XMLHttpRequest.prototype, 'send').and.callFake(function (
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
  });

  it('should initialize correctly', () => {
    emeHandler.init(videoElement, licenseManager);
    expect(emeHandler.video).toBe(videoElement);
    expect(emeHandler.licenseManager).toBe(licenseManager);
  });

  it('should set the certificate source', () => {
    const certSrc = 'https://example.com/cert';
    emeHandler.setCertificateSrc(certSrc);
    expect(emeHandler.certificateSrc).toBe(certSrc);
  });

  it('should check key system successfully', (done) => {
    requestMediaKeySystemAccessSpy.and.returnValue(
      Promise.resolve({} as MediaKeySystemAccess),
    );
    emeHandler.init(videoElement, licenseManager);
    emeHandler.checkKeySystem().then(() => {
      expect(requestMediaKeySystemAccessSpy).toHaveBeenCalled();
      done();
    });
  });

  it('should handle key system check failure', (done) => {
    requestMediaKeySystemAccessSpy.and.rejectWith(new Error('test error'));
    emeHandler.init(videoElement, licenseManager);
    emeHandler.checkKeySystem().catch(() => {
      expect(requestMediaKeySystemAccessSpy).toHaveBeenCalled();
      done();
    });
  });

  it('should run onEncrypted spy if provided', () => {
    const onEncryptedSpy = jasmine.createSpy('onEncrypted');
    emeHandler.addEventSpies({'onEncrypted': onEncryptedSpy});
    emeHandler.onEncrypted({} as MediaEncryptedEvent);
    expect(onEncryptedSpy).toHaveBeenCalled();
  });

  it('should handle onEncrypted event', () => {
    spyOn(emeHandler, 'checkKeySystem').and.resolveTo(
      {} as MediaKeySystemAccess,
    );
    emeHandler.init(videoElement, licenseManager);
    emeHandler.onEncrypted({} as MediaEncryptedEvent);
    expect(emeHandler.checkKeySystem).toHaveBeenCalled();
  });

  it('should set the server certificate', (done) => {
    const mediaKeys = {
      setServerCertificate: jasmine
        .createSpy('setServerCertificate')
        .and.returnValue(Promise.resolve(true)),
    } as unknown as MediaKeys;
    const cert = 'cert';

    emeHandler.setServerCertificate(mediaKeys, cert);
    setTimeout(() => {
      expect(mediaKeys.setServerCertificate).toHaveBeenCalled();
      expect(emeHandler.isSetServerCertificateSupported).toBe(true);
      done();
    });
  });

  it('should handle individualization request', () => {
    emeHandler.init(videoElement, licenseManager);
    licenseManager.requestIndividualization = jasmine.createSpy(
      'requestIndividualization',
    );
    const event = {
      messageType: 'individualization-request',
      target: {update: () => Promise.resolve()},
    } as unknown as MediaKeyMessageEvent;
    emeHandler.onMessage(event);
    expect(licenseManager.requestIndividualization).toHaveBeenCalled();
  });

  it('should handle license request', () => {
    emeHandler.init(videoElement, licenseManager);
    licenseManager.acquireLicense = jasmine.createSpy('acquireLicense');
    const event = {
      messageType: 'license-request',
      target: {update: () => Promise.resolve()},
    } as unknown as MediaKeyMessageEvent;
    emeHandler.onMessage(event);
    expect(licenseManager.acquireLicense).toHaveBeenCalled();
  });

  it('should validate an encrypted message', () => {
    const licenseRequest = new LicenseRequest().setRequestId(new RequestId());
    const message = new Message()
      .setId(1)
      .setMsg(LicenseRequest.serializeBinary(licenseRequest));
    const buffer = Message.serializeBinary(message);

    emeHandler.validateEncryptedMessage(buffer.buffer);
    expect(emeHandler.messageEncrypted).toBe(true);
  });

  it('should handle key statuses change', () => {
    const event = {
      target: {
        keyStatuses: new Map([
          ['a', 'usable'],
          ['b', 'output-restricted'],
        ]),
      },
    } as unknown as Event;
    emeHandler.onKeyStatusesChange(event);
    expect(emeHandler.keyCount).toBe(2);
    expect(emeHandler.keyUnusable).toBe(true);
  });

  it('should close all key sessions', async () => {
    const keySession = {
      close: jasmine.createSpy('close').and.returnValue(Promise.resolve()),
    } as unknown as MediaKeySession;
    emeHandler.keySessions.push(keySession);
    await emeHandler.closeAllKeySessions();
    expect(keySession.close).toHaveBeenCalled();
  });

  it('should call onEncrypted from _onEncrypted', () => {
    const onEncryptedSpy = spyOn(emeHandler, 'onEncrypted');
    emeHandler._onEncrypted({} as MediaEncryptedEvent);
    expect(onEncryptedSpy).toHaveBeenCalled();
  });

  it('should dispose correctly', async () => {
    const removeEventListenerSpy = spyOn(videoElement, 'removeEventListener');
    const removeAttributeSpy = spyOn(videoElement, 'removeAttribute');
    const loadSpy = spyOn(videoElement, 'load');
    const licenseManagerDisposeSpy = spyOn(licenseManager, 'dispose');
    const abortSpy = spyOn(XMLHttpRequest.prototype, 'abort');

    const keySession = {
      close: jasmine.createSpy('close').and.returnValue(Promise.resolve()),
    } as unknown as MediaKeySession;
    emeHandler.keySessions.push(keySession);
    emeHandler.init(videoElement, licenseManager);

    // Trigger a request but don't complete it.
    xhrConfiguration.readyState = 1;
    emeHandler.setServerCertificate({} as MediaKeys, 'cert');

    await emeHandler.dispose();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'encrypted',
      jasmine.any(Function),
    );
    expect(removeAttributeSpy).toHaveBeenCalledWith('src');
    expect(loadSpy).toHaveBeenCalled();
    expect(licenseManagerDisposeSpy).toHaveBeenCalled();
    expect(abortSpy).toHaveBeenCalled();
    expect(keySession.close).toHaveBeenCalled();
  });

  it('should not process events if disposed', () => {
    spyOn(emeHandler, 'checkKeySystem');
    emeHandler.init(videoElement, licenseManager);
    emeHandler.dispose();

    emeHandler.onEncrypted({} as MediaEncryptedEvent);
    emeHandler.onMessage({} as MediaKeyMessageEvent);
    emeHandler.onKeyStatusesChange({} as Event);

    expect(emeHandler.checkKeySystem).not.toHaveBeenCalled();
  });
});
