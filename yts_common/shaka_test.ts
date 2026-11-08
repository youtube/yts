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
 * @fileoverview Unit tests for Shaka Player text track mocking helpers.
 */

import 'jasmine';

import {TEST_ONLY} from './shaka';

const {mockTextTracks} = TEST_ONLY;

describe('mockTextTracks', () => {
  it('mocks textTracks and supports Shaka TextEngine teardown', () => {
    const video = {} as unknown as HTMLMediaElement;

    mockTextTracks(video);

    expect(video.textTracks.length).toBe(0);
    expect(() => {
      video.textTracks.addEventListener('change', () => {});
      video.textTracks.removeEventListener('change', () => {});
    }).not.toThrow();

    const track = video.addTextTrack('subtitles', 'Shaka Player TextTrack');
    track.mode = 'hidden';
    const cue = {} as unknown as TextTrackCue;
    track.addCue(cue);
    expect(track.cues).not.toBeNull();
    expect(track.cues!.length).toBe(0);

    // Simulate Shaka's TextEngine.destroy() cue cleanup loop.
    expect(() => {
      const cues = track.cues!;
      for (let i = 0; i < cues.length; i++) {
        track.removeCue(cues[i]);
      }
      track.removeCue(cue);
      track.mode = 'disabled';
    }).not.toThrow();
  });

  it('replaces existing or stub textTracks and addTextTrack', () => {
    const stubAddTextTrack = jasmine
        .createSpy<HTMLMediaElement['addTextTrack']>('addTextTrack')
        .and.throwError('NotSupportedError');
    const video = {addTextTrack: stubAddTextTrack} as unknown as
        HTMLMediaElement;
    Object.defineProperty(video, 'textTracks', {
      get: () => {
        throw new Error('Broken getter');
      },
      configurable: true,
    });

    mockTextTracks(video);

    expect(video.textTracks.length).toBe(0);
    const track = video.addTextTrack('subtitles');
    expect(stubAddTextTrack).not.toHaveBeenCalled();
    expect(track.cues).not.toBeNull();
    expect(track.cues!.length).toBe(0);
  });
});
