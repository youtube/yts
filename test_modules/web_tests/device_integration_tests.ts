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

interface ExtendedWindow extends Window {
  onScreenKeyboard: boolean;
  SpeechRecognition?: object;
  webkitSpeechRecognition?: object;
  MediaRecorder?: object;
}
const extendedWindow = window as unknown as ExtendedWindow;

async function checkAudioInputDevice(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'audioinput');
  } catch (e) {
    return false;
  }
}

function checkWebSpeechSupport(): boolean {
  return !!extendedWindow.SpeechRecognition ||
      !!extendedWindow.webkitSpeechRecognition;
}

describe('Functional Tests', () => {
  describe('EnumerateDevices', () => {
    it('EnumerateDevices', async () => {
      if (!navigator.mediaDevices?.enumerateDevices) {
        fail('enumerateDevices API is not supported');
      }

      const listOfDevices = await navigator.mediaDevices.enumerateDevices();
      let hasAudioInput = false;
      console.log(
          'Iterating through devices returned by enumerateDevices API:');
      for (const device of listOfDevices) {
        console.log('device: ' + JSON.stringify(device));
        expect(device.kind).withContext('device.kind').toBeDefined();
        expect(device.label).withContext('device.label').toBeDefined();
        if (device.kind === 'audioinput') {
          hasAudioInput = true;
        }
      }
      expect(hasAudioInput)
          .withContext('Should find at least one audioinput device')
          .toBeTrue();
    });

    it('No Mic', async () => {
      if (!navigator.mediaDevices?.enumerateDevices) {
        fail('enumerateDevices API is not supported');
      }

      const listOfDevices = await navigator.mediaDevices.enumerateDevices();
      expect(listOfDevices.length)
          .withContext('enumerateDevices().length')
          .toBe(0);
    });
  });

  describe('On-screen Keyboard', () => {
    it('No keyboard', () => {
      expect(extendedWindow.onScreenKeyboard)
          .withContext('window.onScreenKeyboard')
          .toBeFalsy();  // using toBeFalsy to handle undefined or false
    });
  });

  describe('Assorted', () => {
    it('WebSpeech API', async () => {
      const hasAudioInput = await checkAudioInputDevice();
      if (!hasAudioInput) {
        console.log('No audio input device found, skipping WebSpeech API test');
        return;
      }

      expect(checkWebSpeechSupport())
          .withContext('SpeechRecognition API support')
          .toBeTrue();
    });

    it('MediaRecorder API', () => {
      expect(extendedWindow.MediaRecorder)
          .withContext('MediaRecorder should be supported')
          .toBeDefined();
    });
  });
});
