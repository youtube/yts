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
 * @fileoverview Utility functions for EME (Encrypted Media Extensions) tests.
 */

/**
 * The Widevine key system string.
 */
export const WIDEVINE_KEY_SYSTEM = 'com.widevine.alpha';

/**
 * Basic content types for EME tests.
 */
export enum EmeContentType {
  MP4_VIDEO_AVC1 = 'video/mp4; codecs="avc1.640028"',
  WEBM_VIDEO_VP9 = 'video/webm; codecs="vp9"',
  MP4_AUDIO_AAC = 'audio/mp4; codecs="mp4a.40.2"',
}

/**
 * The robustness levels for Widevine.
 */
export enum WidevineRobustness {
  HW_SECURE_ALL = 'HW_SECURE_ALL',
  SW_SECURE_DECODE = 'SW_SECURE_DECODE',
  SW_SECURE_CRYPTO = 'SW_SECURE_CRYPTO',
}

/**
 * Cobalt specific extension to MediaKeys.
 */
export interface CobaltMediaKeys extends MediaKeys {
  /**
   * Widevine specific extension to gather EME metrics.
   * Returns base64 encoded protobuf or raw binary data.
   */
  // getMetrics can return multiple different types (string, Uint8Array,
  // ArrayBuffer, Record) depending on the platform and Cobalt version. To
  // preserve parity with legacy YTS JS tests without introducing complex type
  // guards, we use 'any' here.
  // tslint:disable-next-line:no-any
  getMetrics?(): any;
}

/**
 * The URL for the provisioning server.
 */
const PROVISION_SERVER_URL =
    'https://content.googleapis.com/certificateprovisioning/v1/devicecertificates/create?key=REDACTED_API_KEY&yts=eme';

/**
 * Sends an individualization request to the provisioning server.
 *
 * @param message The message from the MediaKeyMessageEvent.
 * @param cb Callback for successful response.
 * @param onError Callback for error response.
 * @return The XMLHttpRequest object used for the request.
 */
export function requestIndividualization(
    message: ArrayBuffer,
    cb: (response: Uint8Array) => void,
    onError?: (status: number) => void,
    ): XMLHttpRequest {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', PROVISION_SERVER_URL);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.addEventListener('readystatechange', () => {
    if (xhr.readyState !== 4) return;
    const responseStatus = xhr.status;
    if (responseStatus < 200 || responseStatus > 299) {
      console.log('Individualization failed with status: ', responseStatus);
      if (onError) {
        onError(responseStatus);
      }
      return;
    }
    cb(stringToArray(xhr.responseText));
  });
  xhr.send(
      JSON.stringify({
        signedRequest: arrayToString(new Uint8Array(message)),
      }),
  );
  return xhr;
}

/**
 * Converts a Uint8Array to a binary string.
 */
export function arrayToString(arr: Uint8Array): string {
  return String.fromCharCode.apply(null, arr as unknown as number[]);
}

/**
 * Converts a string to a Uint8Array.
 */
export function stringToArray(str: string): Uint8Array {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

/**
 * Counts pssh atoms in init data.
 * @param initData Init data for the media segment.
 * @return Returns the count of pssh atoms in initData.
 */
export function countPsshAtoms(initData: Uint8Array): number {
  const abuf = new ArrayBuffer(initData.length);
  const view = new Uint8Array(abuf);
  view.set(initData);

  let psshCount = 0;
  const dv = new DataView(abuf);
  let pos = 0;
  while (pos < abuf.byteLength) {
    const boxSize = dv.getUint32(pos, false);
    const type = dv.getUint32(pos + 4, false);

    if (type === 0x70737368) {  // 'pssh'
      psshCount++;
    }

    pos += boxSize;
  }
  return psshCount;
}
