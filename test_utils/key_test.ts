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

import {ExpectedKey, keyToStr, keysMatch, micKey, ReceivedKey} from './key';

describe('key utils', () => {
  const expectedEnter: ExpectedKey = {
    name: 'Enter/OK',
    key: 'Enter',
    keyCode: 13,
  };

  it('matches on keyCode even if isChrobalt is false', () => {
    const received: ReceivedKey = {
      key: 'Unidentified',
      keyCode: 13,
    };
    expect(keysMatch(expectedEnter, received, /* isChrobalt= */ false)).toBe(
      true,
    );
  });

  it('matches on keyCode if isChrobalt is true', () => {
    const received: ReceivedKey = {
      key: 'Unidentified',
      keyCode: 13,
    };
    expect(keysMatch(expectedEnter, received, /* isChrobalt= */ true)).toBe(
      true,
    );
  });

  it('does not match if key and keyCode do not match', () => {
    const received: ReceivedKey = {
      key: 'ArrowLeft',
      keyCode: 37,
    };
    expect(keysMatch(expectedEnter, received, /* isChrobalt= */ true)).toBe(
      false,
    );
    expect(keysMatch(expectedEnter, received, /* isChrobalt= */ false)).toBe(
      false,
    );
  });

  it('matches on key string if isChrobalt is true and key matches but keyCode is different', () => {
    const received: ReceivedKey = {
      key: 'Enter',
      keyCode: 999, // Different keycode
    };
    expect(keysMatch(expectedEnter, received, /* isChrobalt= */ true)).toBe(
      true,
    );
  });

  it('does not match on key string if isChrobalt is false and key matches but keyCode is different', () => {
    const received: ReceivedKey = {
      key: 'Enter',
      keyCode: 999, // Different keycode
    };
    expect(keysMatch(expectedEnter, received, /* isChrobalt= */ false)).toBe(
      false,
    );
  });

  describe('keyToStr', () => {
    it('formats micKey correctly', () => {
      expect(keyToStr(micKey)).toBe('Microphone / Voice (MicrophoneToggle, 0x3002)');
    });

    it('formats ExpectedKey correctly', () => {
      expect(keyToStr(expectedEnter)).toBe('Enter/OK (Enter, 0x0d)');
    });

    it('formats ReceivedKey with identified key correctly', () => {
      const received: ReceivedKey = {
        key: 'Enter',
        keyCode: 13,
        keyDbName: 'Enter/OK',
      };
      expect(keyToStr(received)).toBe('Enter (0x0d)');
    });

    it('formats ReceivedKey with Unidentified key and valid keyDbName correctly (C25 fallback)', () => {
      const received: ReceivedKey = {
        key: 'Unidentified',
        keyCode: 0x195,
        keyDbName: 'Yellow',
      };
      expect(keyToStr(received)).toBe('Yellow (0x195)');
    });

    it('formats ReceivedKey with Unidentified key and missing keyDbName correctly', () => {
      const received: ReceivedKey = {
        key: 'Unidentified',
        keyCode: 0x0,
      };
      expect(keyToStr(received)).toBe('Unidentified (0x00)');
    });

    it('formats ReceivedKey with Unidentified key and Unidentified keyDbName correctly', () => {
      const received: ReceivedKey = {
        key: 'Unidentified',
        keyCode: 0x0,
        keyDbName: 'Unidentified',
      };
      expect(keyToStr(received)).toBe('Unidentified (0x00)');
    });
  });
});
