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
 * The service name for SoftMic support in Cobalt Platform Services.
 */
const SOFT_MIC_SERVICE_NAME = 'com.google.youtube.tv.SoftMic';

/**
 * The message string sent to the SoftMic platform service to request mic support.
 */
const GET_MIC_SUPPORT_MSG = 'getMicSupport';

/**
 * Represents the device's voice support capabilities.
 */
export declare interface MicSupport {
  hasSoftMicSupport?: boolean;
  hasHardMicSupport?: boolean;
}

/**
 * Interface for interacting with Cobalt Platform Services.
 */
export declare interface PlatformService {
  has(serviceName: string): boolean;
  open(
    serviceName: string,
    receiveCallback: (service: PlatformService, data: ArrayBuffer) => void,
  ): PlatformService | null;
  send(data: ArrayBuffer): void;
  close(): void;
}

/**
 * Extension of the Window interface that includes Cobalt Platform Services.
 */
export declare interface H5vccWindowWithPlatformService extends Window {
  H5vccPlatformService?: PlatformService;
}

function arrayBufferToString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return str;
}

function stringToArrayBuffer(str: string): ArrayBuffer {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Local helper to check Cobalt Platform Services without relying on google3 living_room dependencies.
 *
 * @param localWindow The window object to use for checking platform services.
 * @return A promise that resolves to a MicSupport object if successful, or undefined if not supported or an error occurs.
 */
export async function getMicSupport(
  localWindow: Window = window,
): Promise<MicSupport | undefined> {
  const platformService = (
    localWindow as unknown as H5vccWindowWithPlatformService
  ).H5vccPlatformService;

  if (
    !platformService ||
    !platformService.has ||
    !platformService.has(SOFT_MIC_SERVICE_NAME)
  ) {
    return undefined;
  }

  return new Promise((resolve) => {
    let isResolved = false;
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        resolve(undefined);
      }
    }, 2000);

    const voiceService = platformService.open(
      SOFT_MIC_SERVICE_NAME,
      (service: PlatformService, data: ArrayBuffer) => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timeoutId);
        try {
          const str = arrayBufferToString(data);
          const micSupport = JSON.parse(str) as MicSupport;
          resolve(micSupport);
        } catch (e) {
          resolve(undefined);
        }
      },
    );

    if (!voiceService) {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        resolve(undefined);
      }
      return;
    }

    voiceService.send(stringToArrayBuffer(GET_MIC_SUPPORT_MSG));
  });
}
