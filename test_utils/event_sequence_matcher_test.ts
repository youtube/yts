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
import {eventSequenceMatcher} from './event_sequence_matcher';

describe('EventSequenceMatcher transition verification', () => {
  it('should verify a valid conceal sequence to freeze', () => {
    const sequence = [
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'document.onfreeze',
    ];
    expect(eventSequenceMatcher.verify(sequence, 'freeze', console.log)).toBe(
      true,
    );
  });

  it('should verify a valid reveal sequence from freeze', () => {
    const sequence = [
      'document.onresume',
      'document.onvisibilitychange: visible',
      'window.onfocus',
    ];
    expect(eventSequenceMatcher.verify(sequence, 'freeze', console.log)).toBe(
      true,
    );
  });

  it('should verify a valid full sequence', () => {
    const sequence = [
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'document.onfreeze',
      'document.onresume',
      'document.onvisibilitychange: visible',
      'window.onfocus',
    ];
    expect(eventSequenceMatcher.verify(sequence, 'freeze', console.log)).toBe(
      true,
    );
  });

  it('should fail if transition is invalid (blur directly to freeze)', () => {
    const sequence = ['window.onblur', 'document.onfreeze'];
    expect(eventSequenceMatcher.verify(sequence, 'freeze', console.log)).toBe(
      false,
    );
  });

  it('should fail if target state was not reached', () => {
    const sequence = ['window.onblur', 'document.onvisibilitychange: hidden'];
    expect(eventSequenceMatcher.verify(sequence, 'freeze', console.log)).toBe(
      false,
    );
  });

  it('should pass if deepestState is blur and only blur occurred', () => {
    const sequence = ['window.onblur'];
    expect(eventSequenceMatcher.verify(sequence, 'blur', console.log)).toBe(
      true,
    );
  });

  it('should fail if transition is invalid during reveal (resume to focus)', () => {
    const sequence = ['document.onresume', 'window.onfocus'];
    expect(eventSequenceMatcher.verify(sequence, 'freeze', console.log)).toBe(
      false,
    );
  });

  it('should verify valid conceal up to visibilitychange', () => {
    const sequence = ['window.onblur', 'document.onvisibilitychange: hidden'];
    expect(
      eventSequenceMatcher.verify(sequence, 'visibilitychange', fail),
    ).toBe(true);
  });

  it('should verify valid conceal sequence to freeze then unload', () => {
    const sequence = [
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'document.onfreeze',
      'unload',
    ];
    expect(eventSequenceMatcher.verify(sequence, 'freeze', fail)).toBe(true);
  });

  it('should verify valid conceal sequence to visibilitychange then unload', () => {
    const sequence = [
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'unload',
    ];
    expect(
      eventSequenceMatcher.verify(sequence, 'visibilitychange', fail),
    ).toBe(true);
  });
});
