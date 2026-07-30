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
 * Check to see if the expected key matches the received key. In Cobalt 26 and
 * above, we match on the key property as well and not just the keycode.
 */
export function keysMatch(
    expectedKey: ExpectedKey,
    receivedKey: ReceivedKey,
    isChrobalt: boolean,
    ): boolean {
  if (receivedKey.keyCode === expectedKey.keyCode) {
    console.debug('Keys match on keyCode property');
    return true;
  }
  if (receivedKey.key === expectedKey.key && isChrobalt) {
    console.log('Keys match on key property');
    return true;
  }
  return false;
}

/**
 * Converts a key to a string including the key name and key code.
 *
 * @param key The key to convert to a string.
 */
export function keyToStr(key: ReceivedKey | ExpectedKey) {
  const isExpectedKey = 'name' in key;
  const w3cKey = key.key;
  const keyCodeHex = `0x${key.keyCode.toString(16).padStart(2, '0')}`;

  const displayName = isExpectedKey
    ? key.name
    : w3cKey === 'Unidentified' && 'keyDbName' in key && key.keyDbName
      ? key.keyDbName
      : w3cKey;

  const keyStrs = [];
  if (displayName !== w3cKey && w3cKey !== 'Unidentified') {
    keyStrs.push(w3cKey);
  }
  keyStrs.push(keyCodeHex);

  return `${displayName} (${keyStrs.join(', ')})`;
}

/**
 * Representation of a KeyboardEvent that can be transferred over-the-wire
 */
export declare interface ReceivedKey {
  /**
   * Name of key as returned by KeyboardEvent.key
   */
  key: string;

  /**
   * Keycode of key as returned by KeyboardEvent.keyCode
   */
  keyCode: number;

  /**
   * Name of key as returned by a lookup of the keycode in key_db.ts:
   * google3/third_party/javascript/yts/test_utils/key_db.ts
   */
  keyDbName?: string;
}

/**
 * The set of key names as defined by the W3C KeyboardEvent.key property used by
 * our tests
 */
export type w3cKeyName =
    // go/keep-sorted start
    | ' '
    | '0'
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | 'Alt'
    | 'ArrowDown'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'ArrowUp'
    | 'AudioVolumeDown'
    | 'AudioVolumeMute'
    | 'AudioVolumeUp'
    | 'Backspace'
    | 'BrowserSearch'
    | 'ChannelDown'
    | 'ChannelUp'
    | 'ColorF0Red'
    | 'ColorF1Green'
    | 'ColorF2Yellow'
    | 'ColorF3Blue'
    | 'Delete'
    | 'Enter'
    | 'Escape'
    | 'Guide'
    | 'Info'
    | 'LaunchThisApplication'
    | 'MediaAudioTrack'
    | 'MediaFastForward'
    | 'MediaLast'
    | 'MediaPlayPause'
    | 'MediaRecord'
    | 'MediaRewind'
    | 'MediaStop'
    | 'MediaTrackNext'
    | 'MediaTrackPrevious'
    | 'MicrophoneToggle'
    | 'Pause'
    | 'Play'
    | 'Subtitle'
    | 'Unidentified'
    // go/keep-sorted end
;

/**
 * Representation of a key that is expected to be received
 */
export declare interface ExpectedKey {
  /**
   * Friendly name to be displayed on the UI
   */
  name: string;

  /**
   * Name of key as returned by KeyboardEvent.key
   */
  key: w3cKeyName;

  /**
   * Keycode of key as returned by KeyboardEvent.keyCode
   */
  keyCode: number;

  /**
   * A note about the key that will be displayed on the UI (for guided tests)
   */
  note?: string;
}

/**
 * The six point navigation keys
 */
export const sixPtNavKeys: ExpectedKey[] = [
  {
    name: 'Left',
    key: 'ArrowLeft',
    keyCode: 0x25,
  },
  {
    name: 'Right',
    key: 'ArrowRight',
    keyCode: 0x27,
  },
  {
    name: 'Up',
    key: 'ArrowUp',
    keyCode: 0x26,
  },
  {
    name: 'Down',
    key: 'ArrowDown',
    keyCode: 0x28,
  },
  {
    name: 'Enter/OK',
    key: 'Enter',
    keyCode: 0x0d,
  },
  {
    name: 'Escape/Back',
    key: 'Escape',
    keyCode: 0x1b,
  },
];

/////////////////////////////////////////////////////////////////////
// KEYCODE MAPPING
//
// See: https://www.w3.org/TR/uievents-key/
/////////////////////////////////////////////////////////////////////

/**
 * The volume keys
 */
export const volumeKeys: ExpectedKey[] = [
  {name: 'Volume up', key: 'AudioVolumeUp', keyCode: 0xaf},
  {name: 'Volume down', key: 'AudioVolumeDown', keyCode: 0xae},
  {name: 'Mute volume', key: 'AudioVolumeMute', keyCode: 0xad},
];

/**
 * An unidentified key reserved for a system function.
 */
export const unknownKey: ExpectedKey = {
  name: 'Unidentified',
  key: 'Unidentified',
  keyCode: 0x0,
};

/**
 * The keys that are required if present
 */
export const reqIfPresentKeys: ExpectedKey[] = [
  {
    name: 'Play',
    key: 'Play',
    keyCode: 0xfa,
  },
  {
    name: 'Pause',
    key: 'Pause',
    keyCode: 0x13,
  },
  {
    name: 'Play/Pause',
    key: 'MediaPlayPause',
    keyCode: 0xb3,
    note:
        'Applies only to remotes that use the same button to implement play and pause functionality',
  },
  {
    name: 'Stop',
    key: 'MediaStop',
    keyCode: 0xb2,
  },
  {
    name: 'Fast Forward',
    key: 'MediaFastForward',
    keyCode: 0xe4,
  },
  {
    name: 'Rewind',
    key: 'MediaRewind',
    keyCode: 0xe3,
  },
  {
    name: 'Space',
    key: ' ',
    keyCode: 0x20,
  },
  {
    name: 'Backspace',
    key: 'Backspace',
    keyCode: 0x08,
  },
  {
    name: 'Delete',
    key: 'Delete',
    keyCode: 0x2e,
  },
  {
    name: 'Search',
    key: 'BrowserSearch',
    keyCode: 0xaa,
  },
  {
    name: 'Microphone / Voice',
    key: 'MicrophoneToggle',
    keyCode: 0x3002,
    note:
        'Applies only to remotes that have a microphone and the microphone button is dedicated to voice queries or commands directed to one of the YouTube apps. Applies to buttons with combined microphone and AI capabilities.',
  },
  {
    name: 'Previous',
    key: 'MediaTrackPrevious',
    keyCode: 0xb1,
  },
  {
    name: 'Next',
    key: 'MediaTrackNext',
    keyCode: 0xb0,
  },
  {
    name: 'Closed Captions / Subtitle',
    key: 'Subtitle',
    keyCode: 0x1cc,
  },
  {
    name: 'Red',
    key: 'ColorF0Red',
    keyCode: 0x193,
  },
  {
    name: 'Green',
    key: 'ColorF1Green',
    keyCode: 0x194,
  },
  {
    name: 'Yellow',
    key: 'ColorF2Yellow',
    keyCode: 0x195,
  },
  {
    name: 'Blue',
    key: 'ColorF3Blue',
    keyCode: 0x196,
  },
  {
    name: 'YouTube button',
    // Currently, ATV doesn't encode a key value for the YouTube button, but
    // ATV is working to resolve this.
    key: 'LaunchThisApplication',
    keyCode: 0x3000,
    note:
        'Applies only to remotes that implement dedicated hardware buttons for YouTube applications',
  },
];

/**
 * The keys that are required if not reserved for system functions
 */
export const reqIfNotReservedKeys2024Plus: ExpectedKey[] = [
  {
    name: 'Record / Add to DVR / Add to Library',
    key: 'MediaRecord',
    keyCode: 0x1a0,
  },
  {
    name: 'Channel up',
    key: 'ChannelUp',
    keyCode: 0x1ab,
  },
  {
    name: 'Channel down',
    key: 'ChannelDown',
    keyCode: 0x1ac,
  },
  {
    name: 'Last / Previous / Recall Channel',
    key: 'MediaLast',
    keyCode: 0x25f,
  },
  {
    name: 'Audio Track Selection',
    key: 'MediaAudioTrack',
    keyCode: 0x3001,
  },
  {
    name: 'Info / display',
    key: 'Info',
    keyCode: 0x1c9,
    note:
        'When selected, this key displays information about the channel or content that the viewer is watching or browsing',
  },
  {
    name: 'Guide / EPG',
    key: 'Guide',
    keyCode: 0x1ca,
  },
  {
    name: 'Number button: 0',
    key: '0',
    keyCode: 0x30,
  },
  {
    name: 'Number button: 1',
    key: '1',
    keyCode: 0x31,
  },
  {
    name: 'Number button: 2',
    key: '2',
    keyCode: 0x32,
  },
  {
    name: 'Number button: 3',
    key: '3',
    keyCode: 0x33,
  },
  {
    name: 'Number button: 4',
    key: '4',
    keyCode: 0x34,
  },
  {
    name: 'Number button: 5',
    key: '5',
    keyCode: 0x35,
  },
  {
    name: 'Number button: 6',
    key: '6',
    keyCode: 0x36,
  },
  {
    name: 'Number button: 7',
    key: '7',
    keyCode: 0x37,
  },
  {
    name: 'Number button: 8',
    key: '8',
    keyCode: 0x38,
  },
  {
    name: 'Number button: 9',
    key: '9',
    keyCode: 0x39,
  },
];

/**
 * The keys that are required if not reserved for system functions, updated
 * for 2026+ requirements
 */
export const reqIfNotReservedKeys2026Plus: ExpectedKey[] = [
  ...reqIfNotReservedKeys2024Plus,
  {
    name: 'Menu',
    key: 'Alt',
    keyCode: 0x12,
  },
];
