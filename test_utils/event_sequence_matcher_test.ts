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
 * @fileoverview Unit tests for EventSequenceMatcher.
 */

import 'jasmine';
import {eventSequenceMatcher} from './event_sequence_matcher';

describe('EventSequenceMatcher transition verification', () => {
  it('verifies conceal sequence to freeze when checkPartialSequence is true', () => {
    const sequence = [
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'document.onfreeze',
    ];
    expect(
      eventSequenceMatcher.verify(
        sequence,
        'freeze',
        console.log,
        /* checkPartialSequence= */ true,
      ),
    ).toBe(true);
  });

  it('should fail a partial conceal sequence to freeze by default', () => {
    const sequence = [
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'document.onfreeze',
    ];
    expect(eventSequenceMatcher.verify(sequence, 'freeze', console.log)).toBe(
      false,
    );
  });

  it('verifies reveal sequence from freeze when checkPartialSequence is true', () => {
    const sequence = [
      'document.onresume',
      'document.onvisibilitychange: visible',
      'window.onfocus',
    ];
    expect(
      eventSequenceMatcher.verify(
        sequence,
        'freeze',
        console.log,
        /* checkPartialSequence= */ true,
      ),
    ).toBe(true);
  });

  it('should fail a partial reveal sequence from freeze by default', () => {
    const sequence = [
      'document.onresume',
      'document.onvisibilitychange: visible',
      'window.onfocus',
    ];
    expect(eventSequenceMatcher.verify(sequence, 'freeze', console.log)).toBe(
      false,
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

  it('should verify a valid C26+ full sequence without freeze or resume', () => {
    const sequence = [
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'document.onvisibilitychange: visible',
      'window.onfocus',
    ];
    expect(
      eventSequenceMatcher.verify(sequence, 'visibilitychange', console.log),
    ).toBe(true);
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

  it('passes blur-only sequence when checkPartialSequence is true', () => {
    const sequence = ['window.onblur'];
    expect(
      eventSequenceMatcher.verify(
        sequence,
        'blur',
        console.log,
        /* checkPartialSequence= */ true,
      ),
    ).toBe(true);
  });

  it('should fail if deepestState is blur and only blur occurred by default', () => {
    const sequence = ['window.onblur'];
    expect(eventSequenceMatcher.verify(sequence, 'blur', console.log)).toBe(
      false,
    );
  });

  it('passes if deepestState is blur and full blur-focus sequence occurred', () => {
    const sequence = ['window.onblur', 'window.onfocus'];
    expect(eventSequenceMatcher.verify(sequence, 'blur', console.log)).toBe(
      true,
    );
  });

  it('should fail if transition is invalid during reveal (resume to focus)', () => {
    const sequence = ['document.onresume', 'window.onfocus'];
    expect(
      eventSequenceMatcher.verify(
        sequence,
        'freeze',
        console.log,
        /* checkPartialSequence= */ true,
      ),
    ).toBe(false);
  });

  it('verifies conceal to visibilitychange when checkPartialSequence is true', () => {
    const sequence = ['window.onblur', 'document.onvisibilitychange: hidden'];
    expect(
      eventSequenceMatcher.verify(
        sequence,
        'visibilitychange',
        fail,
        /* checkPartialSequence= */ true,
      ),
    ).toBe(true);
  });

  it('verifies conceal to freeze then unload when checkPartialSequence is true', () => {
    const sequence = [
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'document.onfreeze',
      'unload',
    ];
    expect(
      eventSequenceMatcher.verify(
        sequence,
        'freeze',
        fail,
        /* checkPartialSequence= */ true,
      ),
    ).toBe(true);
  });

  it('verifies conceal to visibilitychange and unload when partial is true', () => {
    const sequence = [
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'unload',
    ];
    expect(
      eventSequenceMatcher.verify(
        sequence,
        'visibilitychange',
        fail,
        /* checkPartialSequence= */ true,
      ),
    ).toBe(true);
  });

  it('should fail if sequence does not start with window.onblur', () => {
    const sequence = [
      'document.onvisibilitychange: hidden',
      'document.onvisibilitychange: visible',
      'window.onfocus',
    ];
    expect(
      eventSequenceMatcher.verify(sequence, 'visibilitychange', console.log),
    ).toBe(false);
  });

  it('allows conceal sequence without window.onblur when partial is true', () => {
    const sequence = ['document.onvisibilitychange: hidden', 'unload'];
    expect(
      eventSequenceMatcher.verify(
        sequence,
        'visibilitychange',
        console.log,
        /* checkPartialSequence= */ true,
      ),
    ).toBe(true);
  });

  it('should fail if reveal sequence does not end with window.onfocus', () => {
    const sequence = [
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'document.onvisibilitychange: visible',
    ];
    expect(
      eventSequenceMatcher.verify(sequence, 'visibilitychange', console.log),
    ).toBe(false);
  });

  it('allows partial reveal without window.onfocus when partial is true', () => {
    const sequence = [
      'document.onresume',
      'document.onvisibilitychange: visible',
    ];
    expect(
      eventSequenceMatcher.verify(
        sequence,
        'freeze',
        console.log,
        /* checkPartialSequence= */ true,
      ),
    ).toBe(true);
  });

  it('verifies Chrobalt sequence with visible before onresume', () => {
    const sequence = [
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'document.onfreeze',
      'document.onvisibilitychange: visible',
      'document.onresume',
      'window.onfocus',
    ];
    expect(eventSequenceMatcher.verify(sequence, 'freeze', console.log)).toBe(
      true,
    );
  });

  it('fails if onfreeze goes to visible then focus without onresume', () => {
    const sequence = [
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'document.onfreeze',
      'document.onvisibilitychange: visible',
      'window.onfocus',
    ];
    expect(eventSequenceMatcher.verify(sequence, 'freeze', console.log)).toBe(
      false,
    );
  });

  it('strips visible-page reload events at the end of a full sequence', () => {
    const sequence = [
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'document.onvisibilitychange: visible',
      'window.onfocus',
      'document.onvisibilitychange: hidden',
      'unload',
    ];
    expect(
      eventSequenceMatcher.verify(sequence, 'visibilitychange', console.log),
    ).toBe(true);
  });

  it('strips visible-page reload events at the start of a sequence', () => {
    const sequence = [
      'document.onvisibilitychange: hidden',
      'unload',
      'window.onblur',
      'document.onvisibilitychange: hidden',
      'document.onfreeze',
      'document.onvisibilitychange: visible',
      'document.onresume',
      'window.onfocus',
    ];
    expect(eventSequenceMatcher.verify(sequence, 'freeze', console.log)).toBe(
      true,
    );
  });

  it('fails when only reload events occurred in a full sequence check', () => {
    const sequence = ['document.onvisibilitychange: hidden', 'unload'];
    expect(
      eventSequenceMatcher.verify(sequence, 'visibilitychange', console.log),
    ).toBe(false);
  });

  it('does not swallow invalid events after a reload sequence', () => {
    const sequence = [
      'document.onvisibilitychange: hidden',
      'unload',
      'document.onvisibilitychange: hidden',
      'document.onvisibilitychange: visible',
      'window.onfocus',
    ];
    expect(
      eventSequenceMatcher.verify(sequence, 'visibilitychange', console.log),
    ).toBe(false);
  });
});
