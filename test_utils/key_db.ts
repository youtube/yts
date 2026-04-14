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

/** Maps keycodes to identifying strings */
export const keydb: Record<number, string> = {
  0x0: 'Unidentified',
  0x25: 'Left',
  0x27: 'Right',
  0x26: 'Up',
  0x28: 'Down',
  0x0d: 'Enter',
  0x1b: 'Back',
  0xfa: 'Play',
  0x13: 'Pause',
  0xb3: 'Play/Pause',
  0xb2: 'Stop',
  0xe4: 'Fast Forward',
  0xe3: 'Rewind',
  0x20: 'Space',
  0x08: 'Backspace',
  0x47: 'Delete',
  0x53: 'Search',
  0xaa: 'Search',
  0x3002: 'Mic/Voice',
  0xb1: 'Previous',
  0xb0: 'Next',
  0x1cc: 'Closed Captions',
  0x193: 'Red',
  0x194: 'Green',
  0x195: 'Yellow',
  0x196: 'Blue',
  0xac: 'YouTube button',
  0x3000: 'YouTube button',
  0x1ab: 'ChannelUp',
  0x1ac: 'ChannelDown',
  0x25f: 'Last',
  0x3001: 'AudioTrackSelection',
  0x1c9: 'Info',
  0x1ca: 'Guide',

  /* Number Pad */
  0x60: '0',
  0x61: '1',
  0x62: '2',
  0x63: '3',
  0x64: '4',
  0x65: '5',
  0x66: '6',
  0x67: '7',
  0x68: '8',
  0x69: '9',

  /* Numbers */
  0x30: '0',
  0x31: '1',
  0x32: '2',
  0x33: '3',
  0x34: '4',
  0x35: '5',
  0x36: '6',
  0x37: '7',
  0x38: '8',
  0x39: '9',

  /* Samsung Orsay */
  0x04: 'Left',
  0x05: 'Right',
  0x7314: 'Up',
  0x7315: 'Down',
  0x4a: 'Play/Pause',
  0x46: 'Stop',
  0x438: 'Previous',
  0x436: 'Next',

  /* Tizen */
  0x2719: 'Escape',
  0x019f: 'Play',
  0x280c: 'Play/Pause',
  0x019d: 'Stop',
  0x01a1: 'Fast Forward',
  0x019c: 'Rewind',
  0x002e: 'Delete',
  0x27f1: 'Search',
  0x27ce: 'Previous',
  0x27f8: 'Previous',
  0x27f9: 'Next',
  0x0022: 'Next',

  /* CEA 2014 */
  /* these lines commented out as they are already defined above */
  // 0x19C: 'Rewind',
  // 0x19D: 'Stop',
  // 0x19F: 'Play',
  // 0x1A1: 'Fast Forward',
  0x1a8: 'Previous',
  0x1a9: 'Next',
  0x1cd: 'Escape',

  /* Gamepad */
  0x8001: 'Escape',
  0x8000: 'Enter',
  0x8008: 'Enter',
  0x8009: 'Enter',
  0x800c: 'Up',
  0x800d: 'Down',
  0x800e: 'Left',
  0x800f: 'Right',
  0x8011: 'Up',
  0x8012: 'Down',
  0x8013: 'Left',
  0x8014: 'Right',
  0x8015: 'Up',
  0x8016: 'Down',
  0x8017: 'Left',
  0x8018: 'Right',
};
