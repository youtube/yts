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

import * as emeUtil from 'google3/third_party/javascript/yts/test_utils/eme/eme_utils';

import type {StreamDef} from '../streams/interfaces';

/**
 * Constructs a license server URL.
 * @param flavor The DRM flavor.
 * @param key The key to use.
 * @param videoId The video ID.
 * @param signature The signature to use.
 * @return The constructed license server URL.
 */
function getLicenseServerUrl(
  flavor: string,
  key: string,
  videoId: string,
  signature: string,
): string {
  return `https://dash-mse-test.appspot.com/api/drm/${flavor}?drm_system=${flavor}&source=YOUTUBE&ip=0.0.0.0&ipbits=0&expire=19000000000&key=${key}&sparams=ip,ipbits,expire,drm_system,source,video_id&video_id=${videoId}&signature=${signature}`;
}

/**
 * Handles DRM license acquisition.
 */
export class LicenseManager {
  static CLEARKEY = 'clearkey';
  static WIDEVINE = 'widevine';
  static PLAYREADY = 'playready';

  /**
   * Mapping between DRM flavors to the accepted key systems.
   */
  static flavorToSystem: {[key: string]: string[]} = {
    'clearkey': ['org.w3.clearkey', 'webkit-org.w3.clearkey'],
    'widevine': ['com.widevine.alpha'],
    'playready': ['com.youtube.playready'],
  };

  readonly video: HTMLVideoElement;
  readonly mediaStreams: StreamDef[];
  readonly mime: string;
  readonly flavor: string;
  readonly keySystem: string;
  failedLicenseServerRequests: number;
  failedIndividualizationRequests: number;
  readonly licenseServer: string;

  private readonly pendingRequests = new Set<XMLHttpRequest>();
  private isDisposed = false;

  /**
   * Gets a string property from a stream's custom map.
   * @param stream The stream to get the property from.
   * @param key The key of the property to get.
   * @param defaultValue The default value to return if the property is not
   *   found.
   * @return The value of the property, or the default value.
   */
  private getStreamStringProperty(
    stream: StreamDef,
    key: string,
    defaultValue = '',
  ): string {
    const value = stream.get(key) as string;
    return value || defaultValue;
  }

  constructor(
    video: HTMLVideoElement,
    mediaStreams: StreamDef[],
    flavor: string,
  ) {
    this.video = video;
    this.mediaStreams =
      mediaStreams instanceof Array ? mediaStreams : [mediaStreams];
    const stream = this.mediaStreams[0];
    this.mime = this.mediaStreams[0].mimetype;
    this.flavor = flavor;
    this.keySystem = this.findCompatibleKeySystem();
    this.failedLicenseServerRequests = 0;
    this.failedIndividualizationRequests = 0;
    const licenseServer = this.getStreamStringProperty(
      stream,
      'license_server',
    );
    if (licenseServer) {
      this.licenseServer = licenseServer;
    } else {
      const key = this.getStreamStringProperty(stream, 'key', 'test_key1');
      const videoId = this.getStreamStringProperty(stream, 'video_id');
      const signature = this.getStreamStringProperty(
        stream,
        this.flavor + '_signature',
      );
      this.licenseServer = getLicenseServerUrl(
        this.flavor,
        key,
        videoId,
        signature,
      );
    }
  }

  /**
   * Gets an external PSSH atom if it is being used.
   */
  getExternalPSSH(): ArrayBuffer | null {
    const externalPSSH = this.mediaStreams[0].get('pssh') as Uint8Array | null;
    return externalPSSH?.buffer ?? null;
  }

  /**
   * Makes configuration for KeySystem.
   */
  makeKeySystemConfig(): MediaKeySystemConfiguration[] {
    const config: MediaKeySystemConfiguration = {
      initDataTypes: ['cenc'],
      audioCapabilities: [],
      videoCapabilities: [],
    };

    for (const stream of this.mediaStreams) {
      if (stream.container === 'webm') {
        config.initDataTypes!.push('webm');
        break;
      }
    }
    if (this.flavor === LicenseManager.PLAYREADY) {
      config.initDataTypes = ['keyids', 'cenc'];
    }
    for (const stream of this.mediaStreams) {
      const encryptionScheme = this.getStreamStringProperty(
        stream,
        'encryptionScheme',
        'cenc',
      );
      const capability: MediaKeySystemMediaCapability = {
        contentType: stream.mimetype,
        encryptionScheme,
      };
      if (stream.mediatype === 'audio') {
        config.audioCapabilities!.push(capability);
      } else {
        config.videoCapabilities!.push(capability);
      }
    }
    return [config];
  }

  /**
   * Internal function to determine the DRM key system to use.
   */
  private findCompatibleKeySystem(): string {
    const systems = LicenseManager.flavorToSystem[this.flavor];
    for (const system of systems) {
      if (!MediaSource.isTypeSupported(this.mime)) continue;
      return system;
    }
    throw new Error('Could not find a compatible key system');
  }

  /**
   * Function to acquire the key and initData/key id for the media.
   */
  acquireLicense(
    message: ArrayBuffer,
    cb: (license: Uint8Array) => void,
  ): void {
    if (
      LicenseManager.WIDEVINE === this.flavor ||
      LicenseManager.PLAYREADY === this.flavor
    ) {
      this.requestLicense(message, (license: Uint8Array) => {
        cb(license);
      });
    } else {
      console.log('Unsupported DRM flavor.');
    }
  }

  /**
   * Function to request a Widevine or PlayReady license from the license
   * server.
   */
  requestLicense(
    message: ArrayBuffer,
    cb: (license: Uint8Array) => void,
  ): void {
    if (this.isDisposed) {
      return;
    }
    if (this.failedLicenseServerRequests > 2) {
      console.log('Repeated license request failures. Retries exhausted.');
      return;
    }
    const xhr = new XMLHttpRequest();
    this.pendingRequests.add(xhr);
    xhr.open('POST', this.licenseServer);
    xhr.addEventListener('readystatechange', (evt: Event) => {
      if (this.isDisposed) {
        return;
      }
      const target = evt.target as XMLHttpRequest;
      if (target.readyState !== 4) {
        return;
      }
      this.pendingRequests.delete(xhr);
      const responseStatus = target.status;
      if (responseStatus < 200 || responseStatus > 299) {
        console.log(
          `License request failure, status ${responseStatus}. Retrying...`,
        );
        this.failedLicenseServerRequests++;
        this.requestLicense(message, cb);
        return;
      }
      let responseString =
          emeUtil.arrayToString(new Uint8Array(target.response));
      // Remove body header for responses from specific license servers.
      const licenseBodyHeaderMark = 'GLS/1.0 0 OK';
      if (
        responseString.substring(0, licenseBodyHeaderMark.length) ===
        licenseBodyHeaderMark
      ) {
        const headerMark = '\r\n\r\n';
        const headerIdx =
          responseString.indexOf(headerMark) + headerMark.length;
        responseString = responseString.slice(headerIdx);
      }
      const license = emeUtil.stringToArray(responseString);
      cb(license);
    });
    xhr.responseType = 'arraybuffer';
    xhr.send(message);
  }

  /**
   * Function to send individualization request to provisioning server.
   */
  requestIndividualization(
    message: ArrayBuffer,
    cb: (response: Uint8Array) => void,
  ): void {
    if (this.isDisposed) {
      return;
    }
    if (this.failedIndividualizationRequests > 2) {
      console.log(
        'Repeated individualization request failures. Retries exhausted.',
      );
      return;
    }
    const xhr = emeUtil.requestIndividualization(
        message,
        (response: Uint8Array) => {
          if (this.isDisposed) {
            return;
          }
          this.pendingRequests.delete(xhr);
          cb(response);
        },
        (status: number) => {
          if (this.isDisposed) {
            return;
          }
          this.pendingRequests.delete(xhr);
          console.log(
              `Individualization request failure, status ${
                  status}. Retrying...`,
          );
          this.failedIndividualizationRequests++;
          this.requestIndividualization(message, cb);
        },
    );
    this.pendingRequests.add(xhr);
  }



  /**
   * Aborts all pending requests and prevents further requests.
   */
  dispose(): void {
    this.isDisposed = true;
    for (const xhr of this.pendingRequests) {
      xhr.abort();
    }
    this.pendingRequests.clear();
  }
}
