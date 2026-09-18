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

import {getMicSupport} from 'google3/third_party/javascript/yts/test_utils/mic_support';
import {h5vcc} from 'google3/third_party/javascript/yts/yts_common/h5vcc';

describe('Functional Tests', () => {
  describe('Negative Settings', () => {
    /**
     * Cobalt h5vcc userOnExitStrategy values, as defined in Cobalt source code:
     * cobalt/h5vcc/h5vcc_system.idl
     */
    enum ExitStrategy {
      // Requests to leave the app should translate to window.close().
      USER_ON_EXIT_STRATEGY_CLOSE = 0,
      // Requests to leave the app should translate to window.minimize().
      USER_ON_EXIT_STRATEGY_MINIMIZE = 1,
      // The user may not initiate an application exit request.
      USER_ON_EXIT_STRATEGY_NO_EXIT = 2,
    }

    const customWindow = window as unknown as typeof window & {
      navigator?: {
        systemCaptionSettings?: {
          supportsIsEnabled?: boolean;
          isEnabled?: boolean;
        };
      };
    };

    yts.test({id: '743C4817-5F1B-4B28-8C3B-37D7C7F5AD91'});
    it('Negative TTS', () => {
      console.log('Checking window.h5vcc.accessibility.textToSpeech');
      expect(h5vcc?.accessibility?.textToSpeech)
        .withContext('window.h5vcc.accessibility.textToSpeech')
        .toBeFalsy();

      const isSpeechSynthesisEnabled =
        window.speechSynthesis.getVoices().length > 0;
      console.log('Checking window.speechSynthesis.getVoices().length');
      expect(isSpeechSynthesisEnabled)
        .withContext('window.speechSynthesis.getVoices().length > 0')
        .toBeFalsy();
    });

    yts.test({id: '037B8897-4F97-40DA-BACB-355ED9E5E728'});
    it('Negative Captions', () => {
      console.log(
        'Checking window.navigator.systemCaptionSettings.supportsIsEnabled',
      );
      expect(customWindow.navigator?.systemCaptionSettings?.supportsIsEnabled)
        .withContext('window.navigator.systemCaptionSettings.supportsIsEnabled')
        .toBeFalsy();

      console.log('Checking window.navigator.systemCaptionSettings.isEnabled');
      expect(customWindow.navigator?.systemCaptionSettings?.isEnabled)
        .withContext('window.navigator.systemCaptionSettings.isEnabled')
        .toBeFalsy();
    });

    yts.test({id: '4C455ED9-A0A9-4A0B-BD67-279EED5899A1'});
    it('Negative Background Mode', () => {
      console.log(
        'Checking h5vcc.system.userOnExitStrategy is not 1 (aka USER_ON_EXIT_STRATEGY_MINIMIZE)',
      );
      expect(h5vcc?.system?.userOnExitStrategy)
        .withContext('h5vcc.system.userOnExitStrategy')
        .not.toEqual(ExitStrategy.USER_ON_EXIT_STRATEGY_MINIMIZE);
    });

    yts.test({id: 'E52DE07F-0339-4DCF-AF88-4D9B2D994BC3'});
    it('Negative IFA', async () => {
      console.log('Checking window.h5vcc.system.advertisingId is not set');
      expect(h5vcc?.system?.advertisingId)
        .withContext('window.h5vcc.system.advertisingId')
        .toBeFalsy();
    });
  });

  describe('Voice Service', () => {
    yts.test({id: '41C03CC5-A8EE-4016-ACF8-D5A940569179'});
    it('Negative Soft Mic', async () => {
      console.log('Checking Soft Mic Support via H5vccPlatformService');
      const micSupport = await getMicSupport();

      if (micSupport?.hasSoftMicSupport !== undefined) {
        expect(micSupport.hasSoftMicSupport)
          .withContext('hasSoftMicSupport (via H5vccPlatformService)')
          .toBeFalse();
        return;
      }
      console.log('Unable to get Soft Mic Support via H5vccPlatformService.');
      console.log('Falling back to enumerateDevices() check.');

      if (!window.navigator?.mediaDevices?.enumerateDevices) {
        console.log(
          'Device does not support enumerateDevices API (likely no microphone).',
        );
        return;
      }

      let devices: MediaDeviceInfo[] = [];
      try {
        devices = await window.navigator.mediaDevices.enumerateDevices();
      } catch (e) {
        console.log('enumerateDevices threw an error:', e);
      }

      const audioDevices = devices.filter(
        (device) => device.kind === 'audioinput',
      );
      expect(audioDevices.length)
        .withContext('number of "audioinput" devices in enumerateDevices()')
        .toBe(0);
    });
  });
});
