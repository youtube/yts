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

import {resetVideoElement} from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {LicenseRequest, Message} from 'google3/third_party/javascript/yts/test_utils/proto/license_request.proto';

import {LicenseManager} from './license_manager';

/**
 * Handles EME events.
 */
export class EMEHandler {
  onEncryptedSpy?: (event: MediaEncryptedEvent) => void;
  video?: HTMLVideoElement;
  licenseManager?: LicenseManager;
  keySystem = '';
  keyUnusable = false;
  keyCount = 0;
  keySessions: MediaKeySession[] = [];
  licenseDelay = 10; // In milliseconds.
  isSetServerCertificateSupported = false;
  messageEncrypted = false;
  certificateSrc = '';

  // We keep track of these for cleanup in dispose().
  private isDisposed = false;
  private readonly pendingRequests = new Set<XMLHttpRequest>();
  private readonly onEncryptedHandler = this.onEncrypted.bind(this);

  init(video: HTMLVideoElement, licenseManager: LicenseManager): EMEHandler {
    this.video = video;
    this.licenseManager = licenseManager;
    this.keySystem = licenseManager.keySystem;

    video.addEventListener('encrypted', this.onEncryptedHandler);

    return this;
  }

  setCertificateSrc(cert: string): void {
    this.certificateSrc = cert;
  }

  /**
   * This method is only used to override onEncrypted event in one type of test.
   * Narrowing its scope from the entire EMEHandler class to only the
   * onEncrypted event.
   */
  addEventSpies(eventSpies: {[key: string]: Function}): void {
    const onEncryptedSpy = eventSpies['onEncrypted'];
    if (onEncryptedSpy) {
      this.onEncryptedSpy = onEncryptedSpy as (
        event: MediaEncryptedEvent,
      ) => void;
    }
  }

  /** @return Promise */
  checkKeySystem(
    config?: MediaKeySystemConfiguration[],
  ): Promise<MediaKeySystemAccess> {
    if (typeof navigator.requestMediaKeySystemAccess !== 'function') {
      return new Promise((resolve, reject) => {
        reject(
          new Error(
            'requestMediaKeySystemAccess is not defined (requires HTTPS)',
          ),
        );
      });
    }
    if (!config) {
      config = this.licenseManager!.makeKeySystemConfig();
    }
    return navigator.requestMediaKeySystemAccess(this.keySystem, config);
  }

  // Preserving this method definition to avoid potentially breaking existing
  // EME tests.
  // tslint:disable-next-line:enforce-name-casing
  _onEncrypted(event: MediaEncryptedEvent): void {
    this.onEncrypted(event);
  }
  // tslint:enable:enforce-name-casing

  /**
   * Default callback for onEncrypted event from EME system.
   * @param event Event passed in by the EME system.
   */
  onEncrypted(event: MediaEncryptedEvent): void {
    if (this.isDisposed) {
      return;
    }

    // If a spy is provided, run it instead of the default behavior.
    if (this.onEncryptedSpy) {
      console.log('Running the provided onEncrypted spy');
      this.onEncryptedSpy(event);
      return;
    }

    if (!this.keySystem) {
      throw new Error('Not initialized! Bad manifest parse?');
    }
    console.log('onEncrypted()');
    const initData = this.licenseManager?.getExternalPSSH() || event.initData!;
    const initDataType = event.initDataType;
    const video = event.target as HTMLVideoElement;

    this.checkKeySystem()
      .then((keySystemAccess) => {
        if (this.isDisposed) {
          return;
        }
        keySystemAccess.createMediaKeys().then((createdMediaKeys) => {
          if (this.isDisposed) {
            return;
          }
          let mediaKeys = video.mediaKeys;
          if (!mediaKeys) {
            video.setMediaKeys(createdMediaKeys);
            mediaKeys = createdMediaKeys;
          }
          if (this.certificateSrc) {
            this.setServerCertificate(createdMediaKeys, this.certificateSrc);
          }
          const keySession = mediaKeys.createSession();
          keySession.addEventListener(
            'message',
            this.onMessage.bind(this),
            false,
          );
          keySession.addEventListener(
            'keystatuseschange',
            this.onKeyStatusesChange.bind(this),
            false,
          );
          keySession.generateRequest(initDataType, initData);
          this.keySessions.push(keySession);
        });
      })
      .catch((error) => {
        console.log('error requesting media keys system access');
      });
  }

  /**
   * Sends HTTP request to get the certification and apply it to
   * setServerCertificate.
   */
  setServerCertificate(mediaKeys: MediaKeys, cert: string): void {
    console.log('setServerCertificate()');
    const xhr = new XMLHttpRequest();
    this.pendingRequests.add(xhr);
    xhr.open('GET', cert);
    xhr.addEventListener('readystatechange', (evt) => {
      if (this.isDisposed) {
        return;
      }
      if ((evt.target as XMLHttpRequest).readyState !== 4) {
        return;
      }
      this.pendingRequests.delete(xhr);
      const responseStatus = (evt.target as XMLHttpRequest).status;
      if (responseStatus < 200 || responseStatus > 299) {
        return;
      }
      // Ignore if promise returns false or is rejected.
      mediaKeys
        .setServerCertificate((evt.target as XMLHttpRequest).response)
        .then(
          (result) => {
            if (this.isDisposed) {
              return;
            }
            if (result === true) {
              this.isSetServerCertificateSupported = true;
              console.log('SetServerCertificate returns true');
            }
          },
          (rejected) => {
            console.log('SetServerCertificate rejected');
          },
        );
    });
    xhr.responseType = 'arraybuffer';
    xhr.send();
  }

  /**
   * Default callback for onMessage event from EME system.
   * @param event Event passed in by the EME system.
   */
  onMessage(event: MediaKeyMessageEvent): void {
    if (this.isDisposed) {
      return;
    }
    console.log('onMessage()');

    const keySession = event.target as MediaKeySession;
    const message = event.message;
    const messageType = event.messageType;
    const licenseDelay = this.licenseDelay;

    const updateSession = (response: BufferSource) => {
      setTimeout(() => {
        if (this.isDisposed) {
          return;
        }
        keySession.update(response).catch(() => {
          console.log('keySession.update failed');
        });
      }, licenseDelay);
    };
    if (messageType === 'individualization-request') {
      this.licenseManager!.requestIndividualization(message, updateSession);
    } else if (messageType === 'license-request') {
      if (this.isSetServerCertificateSupported) {
        this.validateEncryptedMessage(message);
      }
      this.licenseManager!.acquireLicense(message, updateSession);
    } else {
      console.log(`Unknown message:${messageType}`);
    }
  }

  /**
   * Checks if the license request is encrypted.
   */
  validateEncryptedMessage(message: ArrayBuffer): void {
    console.log('validateEncryptedMessage()');
    const msg: Message = Message.deserializeBinary(new Uint8Array(message));
    if (msg.getId() !== 1) {
      return;
    }
    const licenseRequest = LicenseRequest.deserializeBinary(msg.getMsg());
    if (!licenseRequest.hasRequestInfo() && licenseRequest.hasRequestId()) {
      this.messageEncrypted = true;
    }
  }

  /**
   * Default callback for keystatuseschange event from EME system.
   * @param event Event passed in by the EME system.
   */
  onKeyStatusesChange(event: Event): void {
    if (this.isDisposed) {
      return;
    }
    console.log('onKeyStatusesChange()');
    (event.target as MediaKeySession).keyStatuses.forEach((status, kid) => {
      this.keyCount++;
      if (status !== 'usable') {
        this.keyUnusable = true;
      }
    });
  }

  async closeAllKeySessions(): Promise<void> {
    while (this.keySessions?.length ?? 0 > 0) {
      console.log('Closing key session');
      const keySession = this.keySessions.pop();
      await keySession?.close();
    }
  }

  /**
   * Closes all key sessions and disposes of the media keys.
   */
  async dispose(): Promise<void> {
    this.isDisposed = true;
    this.video?.removeEventListener('encrypted', this.onEncryptedHandler);

    this.licenseManager?.dispose();
    for (const xhr of this.pendingRequests) {
      xhr.abort();
    }
    this.pendingRequests.clear();

    try {
      await this.closeAllKeySessions();
      if (this.video) {
        resetVideoElement(this.video);
      }
      await this.video?.setMediaKeys?.(null);
    } catch (e: unknown) {
      console.log('Error disposing EME handler: ', e);
    }
  }
}
