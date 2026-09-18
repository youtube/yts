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

describe('Functional Tests', () => {
  interface ExtendedWindow extends Window {
    AudioContext: new() => AudioContext;
    webkitAudioContext: new() => AudioContext;
  }

  let audioCtx: AudioContext;

  beforeEach(() => {
    const extendedWindow = window as unknown as ExtendedWindow;
    const AudioContextClass =
        extendedWindow.AudioContext || extendedWindow.webkitAudioContext;
    audioCtx = new AudioContextClass();
  });

  describe('AudioContext', () => {
    yts.test({id: '14.1.1.1'});
    it('AudioContext', () => {
      expect(audioCtx)
          .withContext('AudioContext should be defined')
          .toBeDefined();
    });

    yts.test({id: '14.1.3.1'});
    it('AudioContext.sampleRate', () => {
      expect(typeof audioCtx.sampleRate)
          .withContext('sampleRate should be a number')
          .toBe('number');
    });

    yts.test({id: '14.1.4.1'});
    it('AudioContext.currentTime', () => {
      expect(isNaN(audioCtx.currentTime))
          .withContext('currentTime should not be NaN')
          .toBeFalse();
    });

    yts.test({id: '14.1.5.1'});
    it('AudioContext.decodeAudioData', () => {
      expect(audioCtx.decodeAudioData)
          .withContext('decodeAudioData should be defined')
          .toBeDefined();
    });

    yts.test({id: '14.1.6.1'});
    it('AudioContext.createBufferSource', () => {
      expect(audioCtx.createBufferSource)
          .withContext('createBufferSource should be defined')
          .toBeDefined();
      expect(audioCtx.createBufferSource() instanceof AudioBufferSourceNode)
          .withContext(
              'createBufferSource() should return an AudioBufferSourceNode')
          .toBeTrue();
    });
  });

  describe('AudioBufferSourceNode', () => {
    let source: AudioBufferSourceNode;

    beforeEach(() => {
      source = audioCtx.createBufferSource();
    });

    yts.test({id: '14.2.1.1'});
    it('AudioBufferSourceNode', () => {
      expect(source)
          .withContext('AudioBufferSourceNode should be defined')
          .toBeDefined();
    });

    yts.test({id: '14.2.2.1'});
    it('AudioBufferSourceNode.buffer', () => {
      expect(source.buffer)
          .withContext('buffer property should be defined')
          .toBeDefined();
    });

    yts.test({id: '14.2.3.1'});
    it('AudioBufferSourceNode.onended', () => {
      expect(source.onended)
          .withContext('onended should be defined')
          .toBeDefined();
    });

    yts.test({id: '14.2.5.1'});
    it('AudioBufferSourceNode.start', () => {
      expect(source.start).withContext('start should be defined').toBeDefined();
    });

    yts.test({id: '14.2.6.1'});
    it('AudioBufferSourceNode.stop', () => {
      expect(source.stop).withContext('stop should be defined').toBeDefined();
    });
  });

  describe('AudioNode', () => {
    let node: AudioNode;

    beforeEach(() => {
      node = audioCtx.destination;
    });

    yts.test({id: '14.3.1.1'});
    it('AudioNode', () => {
      expect(node)
          .withContext('AudioNode (destination) should be defined')
          .toBeDefined();
    });

    yts.test({id: '14.3.2.1'});
    it('AudioNode.context', () => {
      expect(node.context)
          .withContext('context should match AudioContext')
          .toBe(audioCtx);
    });

    yts.test({id: '14.3.3.1'});
    it('AudioNode.numberOfInputs', () => {
      expect(typeof node.numberOfInputs)
          .withContext('numberOfInputs should be a number')
          .toBe('number');
    });

    yts.test({id: '14.3.4.1'});
    it('AudioNode.numberOfOutputs', () => {
      expect(typeof node.numberOfOutputs)
          .withContext('numberOfOutputs should be a number')
          .toBe('number');
    });

    yts.test({id: '14.3.5.1'});
    it('AudioNode.channelCountMode', () => {
      expect(typeof node.channelCountMode)
          .withContext('channelCountMode should be a string')
          .toBe('string');
    });

    yts.test({id: '14.3.6.1'});
    it('AudioNode.channelInterpretation', () => {
      expect(typeof node.channelInterpretation)
          .withContext('channelInterpretation should be a string')
          .toBe('string');
    });

    yts.test({id: '14.3.7.1'});
    it('AudioNode.connect', () => {
      expect(audioCtx.createBufferSource().connect)
          .withContext('connect method should be defined')
          .toBeDefined();
    });

    yts.test({id: '14.3.8.1'});
    it('AudioNode.disconnect', () => {
      expect(audioCtx.createBufferSource().disconnect)
          .withContext('disconnect method should be defined')
          .toBeDefined();
    });
  });
});
