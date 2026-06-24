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
import 'yts';

import {appendUntil, FileSource, FixedAppendSize, playThrough, ResetInit, setDuration} from 'google3/third_party/javascript/yts/test_utils/mse/source_chain';
import {Segment} from 'google3/third_party/javascript/yts/test_utils/parsers/interfaces';
import {parseMp4} from 'google3/third_party/javascript/yts/test_utils/parsers/mp4';
import {parseWebM} from 'google3/third_party/javascript/yts/test_utils/parsers/webm';
import * as playbackUtil from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {AAC_STREAMS} from 'google3/third_party/javascript/yts/test_utils/streams/aac';
import {AV1_STREAMS} from 'google3/third_party/javascript/yts/test_utils/streams/av1';
import {H264_STREAMS} from 'google3/third_party/javascript/yts/test_utils/streams/h264';
import {StreamDef} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';
import {AAC, H264, Opus, VP9} from 'google3/third_party/javascript/yts/test_utils/streams/media_streams';
import {OPUS_STREAMS} from 'google3/third_party/javascript/yts/test_utils/streams/opus';
import {VP9_STREAMS} from 'google3/third_party/javascript/yts/test_utils/streams/vp9';
import {TimeoutManager} from 'google3/third_party/javascript/yts/test_utils/timeout_manager';
import {XhrManager} from 'google3/third_party/javascript/yts/test_utils/xhr_manager';

const DEFAULT_TIMEOUT_MS = 60_000;
const EXTENDED_TIMEOUT_MS = 200_000;

describe('MSE Conformance Tests', () => {
  let video: HTMLVideoElement;
  let xhrManager: XhrManager;
  let timeoutManager: TimeoutManager;

  beforeEach(() => {
    playbackUtil.initializeVideoElement();
    video = playbackUtil.getVideoElement()!;
    xhrManager = new XhrManager();
    timeoutManager = new TimeoutManager();
  });

  afterEach(() => {
    xhrManager.abortAll();
    timeoutManager.clearAll();
    playbackUtil.cleanupVideoElement();
  });

  function checkMandatory(mandatory: boolean) {
    if (!mandatory) {
      yts.markOptional();
    }
  }

  function getNestedAttr(obj: unknown, path: string): unknown {
    return path.split('.').reduce(
        (o: unknown, key: string) =>
            (o != null ? (o as Record<string, unknown>)[key] : undefined),
        obj);
  }

  describe('Media Element Core', () => {
    function createInitialMediaStateTest(
        name: string, state: string, expectedValue: string|number|boolean,
        checkNotEqual = false) {
      it(name, (done) => {
        const ms = new MediaSource();
        video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
        ms.addEventListener('sourceopen', () => {
          const actual = getNestedAttr(video, state);
          if (typeof expectedValue === 'number' &&
              Number.isNaN(expectedValue)) {
            expect(actual).withContext(`video.${state}`).toBeNaN();
          } else if (checkNotEqual) {
            expect(actual)
                .withContext(`video.${state}`)
                .not.toEqual(expectedValue);
          } else {
            expect(actual).withContext(`video.${state}`).toEqual(expectedValue);
          }
          done();
        }, {once: true});
      }, DEFAULT_TIMEOUT_MS);
    }

    createInitialMediaStateTest('InitialMediaDuration', 'duration', NaN);
    createInitialMediaStateTest('InitialMediaVideoWidth', 'videoWidth', 0);
    createInitialMediaStateTest('InitialMediaVideoHeight', 'videoHeight', 0);
    createInitialMediaStateTest(
        'InitialMediaReadyState', 'readyState', HTMLMediaElement.HAVE_NOTHING);
    createInitialMediaStateTest('InitialMediaSrc', 'src', '', true);
    createInitialMediaStateTest(
        'InitialMediaCurrentSrc', 'currentSrc', '', true);
    createInitialMediaStateTest(
        'InitialMediaDefaultPlaybackRate', 'defaultPlaybackRate', 1);
    createInitialMediaStateTest('InitialMediaPlaybackRate', 'playbackRate', 1);
    createInitialMediaStateTest('InitialMediaPaused', 'paused', true);
    createInitialMediaStateTest('InitialMediaSeeking', 'seeking', false);
    createInitialMediaStateTest('InitialMediaEnded', 'ended', false);
    createInitialMediaStateTest(
        'InitialMediaBuffered.length', 'buffered.length', 0);
    createInitialMediaStateTest(
        'InitialMediaPlayed.length', 'played.length', 0);
    createInitialMediaStateTest(
        'InitialMediaSeekable.length', 'seekable.length', 0);
    createInitialMediaStateTest(
        'InitialMediaNetworkState', 'networkState',
        HTMLMediaElement.NETWORK_LOADING);
  });

  describe('XHR', () => {
    it('XHRUint8Array', (done) => {
      const s = 'XHR DATA';
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i);
      }
      const xhr = xhrManager.createPostRequest('/echo', () => {
        const response = xhr.getResponseData();
        const responseStr =
            String.fromCharCode.apply(null, Array.from(response));
        expect(responseStr).withContext('XHR response').toEqual(s);
        done();
      }, view.length);
      xhr.send(view);
    }, 10_000);

    it('XHRAbort', (done) => {
      const N = 100;
      function startXHR(i: number) {
        const xhr = xhrManager.createRequest(
            VP9['VideoNormal'].src + '?x=' + Date.now() + '.' + i, () => {
              if (i >= N) {
                xhr.getResponseData();
                expect(true)
                    .withContext('XHR requests completed successfully')
                    .toBeTrue();
                done();
              }
            });
        if (i < N) {
          timeoutManager.setTimeout(() => {
            xhr.abort();
          }, 10);
          timeoutManager.setTimeout(() => {
            startXHR(i + 1);
          }, 1);
        }
        xhr.send();
      }
      startXHR(0);
    }, DEFAULT_TIMEOUT_MS);

    it('XHROpenState', () => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer';
      xhr.open('GET', 'http://google.com', true);
      expect(xhr.responseType)
          .withContext('XHR responseType')
          .toEqual('arraybuffer');
    });
  });

  describe('MSE Core', () => {
    it('Presence', () => {
      expect(window.MediaSource)
          .withContext('MediaSource available')
          .toBeDefined();
      const ms = new MediaSource();
      expect(ms).withContext('MediaSource instance created').toBeDefined();
    });

    it('Attach', (done) => {
      const ms = new MediaSource();
      ms.addEventListener('sourceopen', () => {
        expect(true).withContext('MediaSource sourceopen fired').toBeTrue();
        done();
      }, {once: true});
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      video.load();
    }, 2_000);

    it('AddSourceBuffer', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        expect(ms.sourceBuffers.length)
            .withContext('Source buffer number')
            .toBe(0);
        ms.addSourceBuffer(AAC['AudioNormal'].mimetype);
        expect(ms.sourceBuffers.length)
            .withContext('Source buffer number')
            .toBe(1);
        ms.addSourceBuffer(VP9['VideoNormal'].mimetype);
        expect(ms.sourceBuffers.length)
            .withContext('Source buffer number')
            .toBe(2);
        done();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    it('AddSBException', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        try {
          ms.addSourceBuffer('^^^');
          fail('Should throw NotSupportedError');
        } catch (e: unknown) {
          const err = e as {
            name?: string;
            code?: number
          };
          expect(
              err.name === 'NotSupportedError' ||
              err.code === DOMException.NOT_SUPPORTED_ERR)
              .withContext('NotSupportedError thrown')
              .toBeTrue();
        }
        try {
          const ms2 = new MediaSource();
          ms2.addSourceBuffer(AAC['AudioNormal'].mimetype);
          fail('Should throw InvalidStateError');
        } catch (e: unknown) {
          const err = e as {
            name?: string;
            code?: number
          };
          expect(
              err.name === 'InvalidStateError' ||
              err.code === DOMException.INVALID_STATE_ERR)
              .withContext('InvalidStateError thrown')
              .toBeTrue();
        }
        done();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    it('RemoveSourceBuffer', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        let sb = ms.addSourceBuffer(AAC['AudioNormal'].mimetype);
        ms.removeSourceBuffer(sb);
        expect(ms.sourceBuffers.length)
            .withContext('Source buffer number')
            .toBe(0);
        ms.addSourceBuffer(AAC['AudioNormal'].mimetype);
        expect(ms.sourceBuffers.length)
            .withContext('Source buffer number')
            .toBe(1);
        for (let i = 0; i < 10; ++i) {
          sb = ms.addSourceBuffer(VP9['VideoNormal'].mimetype);
          expect(ms.sourceBuffers.length)
              .withContext('Source buffer number')
              .toBe(2);
          ms.removeSourceBuffer(sb);
          expect(ms.sourceBuffers.length)
              .withContext('Source buffer number')
              .toBe(1);
        }
        done();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    function createInitialMSStateTest(
        name: string, state: keyof MediaSource, expectedValue: string|number) {
      it(name, (done) => {
        const ms = new MediaSource();
        video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
        ms.addEventListener('sourceopen', () => {
          const actual = ms[state] as unknown;
          if (actual instanceof SourceBufferList &&
              typeof expectedValue === 'number') {
            expect(actual.length)
                .withContext(`ms.${state}.length`)
                .toEqual(expectedValue);
          } else if (
              typeof expectedValue === 'number' &&
              Number.isNaN(expectedValue)) {
            expect(actual).withContext(`ms.${state}`).toBeNaN();
          } else {
            expect(actual).withContext(`ms.${state}`).toEqual(expectedValue);
          }
          done();
        }, {once: true});
      }, DEFAULT_TIMEOUT_MS);
    }

    createInitialMSStateTest('InitialMSDuration', 'duration', NaN);
    createInitialMSStateTest('InitialMSReadyState', 'readyState', 'open');
    createInitialMSStateTest(
        'InitialMSActiveSourceBuffers', 'activeSourceBuffers', 0);

    it('Duration', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        ms.duration = 10;
        expect(ms.duration).withContext('ms.duration').toBe(10);
        done();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    it('MediaElementEvents', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        const audioStream = AAC['Audio1MB'];
        const videoStream = VP9['Video1MB'];
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const videoXhr = xhrManager.createRequest(videoStream.src, () => {
          const onUpdate = () => {
            videoSb.removeEventListener('update', onUpdate);
            setDuration(1.0, ms, [videoSb, audioSb], () => {
              if (audioSb.updating || videoSb.updating) {
                fail('Source buffers are updating on duration change.');
                done();
                return;
              }
              ms.endOfStream();
              playbackUtil.playAndHandleErrors(video, (err) => {
                fail(err);
              });
            });
          };
          videoSb.addEventListener('update', onUpdate);
          videoSb.appendBuffer(videoXhr.getResponseData());
        });
        const audioXhr = xhrManager.createRequest(audioStream.src, () => {
          const onAudioUpdate = () => {
            audioSb.removeEventListener('update', onAudioUpdate);
            videoXhr.send();
          };
          audioSb.addEventListener('update', onAudioUpdate);
          audioSb.appendBuffer(audioXhr.getResponseData());
        });
        video.addEventListener('ended', () => {
          expect(true).withContext('Video ended successfully').toBeTrue();
          done();
        }, {once: true});
        audioXhr.send();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    it('MediaSourceEvents', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      let lastState = 'open';
      ms.addEventListener('sourceopen', () => {
        const audioStream = AAC['Audio1MB'];
        const videoStream = VP9['Video1MB'];
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const videoXhr = xhrManager.createRequest(videoStream.src, () => {
          videoSb.appendBuffer(videoXhr.getResponseData());
          videoSb.abort();
          ms.endOfStream();
        });
        const audioXhr = xhrManager.createRequest(audioStream.src, () => {
          audioSb.appendBuffer(audioXhr.getResponseData());
          audioSb.abort();
          videoXhr.send();
        });
        ms.addEventListener('sourceclose', () => {
          expect(lastState).withContext('The previous state').toBe('ended');
          done();
        });
        ms.addEventListener('sourceended', () => {
          expect(lastState).withContext('The previous state').toBe('open');
          lastState = 'ended';
          video.removeAttribute('src');
          video.load();
        });
        audioXhr.send();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    it('VideoBufferSize', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        const videoStream = VP9['Video1MB'];
        const audioStream = AAC['Audio1MB'];
        const sb = ms.addSourceBuffer(videoStream.mimetype);
        ms.addSourceBuffer(audioStream.mimetype);
        const MIN_SIZE = 12 * 1024 * 1024;
        const ESTIMATED_MIN_TIME = 12;
        let expectedTime = 0;
        let expectedSize = 0;
        const xhr = xhrManager.createRequest(videoStream.src, () => {
          const data = xhr.getResponseData();
          const onBufferFull = () => {
            expect(expectedTime - sb.buffered.start(0))
                .withContext('Estimated source buffer size')
                .toBeGreaterThanOrEqual(ESTIMATED_MIN_TIME);
            done();
          };
          const onUpdate = () => {
            if (sb.buffered.start(0) > 0 || expectedTime > sb.buffered.end(0)) {
              sb.removeEventListener('updateend', onUpdate);
              onBufferFull();
            } else {
              expectedTime += videoStream.duration;
              expectedSize += videoStream.fileSize;
              if (expectedSize > 10 * MIN_SIZE) {
                sb.removeEventListener('updateend', onUpdate);
                onBufferFull();
                return;
              }
              sb.timestampOffset = expectedTime;
              try {
                sb.appendBuffer(data);
              } catch (e: unknown) {
                const err = e as {
                  name?: string;
                  code?: number
                };
                const QUOTA_EXCEEDED_ERROR_CODE = 22;
                if (err.code === QUOTA_EXCEEDED_ERROR_CODE ||
                    err.name === 'QuotaExceededError') {
                  sb.removeEventListener('updateend', onUpdate);
                  onBufferFull();
                } else {
                  fail(String(e));
                  done();
                }
              }
            }
          };
          sb.addEventListener('updateend', onUpdate);
          sb.appendBuffer(data);
        });
        xhr.send();
      }, {once: true});
    }, EXTENDED_TIMEOUT_MS);

    it('VideoBufferSpeed', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        const videoStream = H264['Webgl720p30fps'];
        const audioStream = AAC['AudioNormal'];
        const sb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);
        let startTime = 0;
        const videoXhr = xhrManager.createRequest(videoStream.src, () => {
          video.addEventListener('canplaythrough', () => {
            expect(performance.now() - startTime)
                .withContext('Buffer time(ms)')
                .toBeLessThanOrEqual(500);
            done();
          }, {once: true});
          startTime = performance.now();
          sb.appendBuffer(videoXhr.getResponseData());
        }, 0, 2500000);
        const audioXhr = xhrManager.createRequest(audioStream.src, () => {
          audioSb.appendBuffer(audioXhr.getResponseData());
          videoXhr.send();
        }, 0, 2500000);
        audioXhr.send();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    it('StartPlayWithoutData', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        const audioStream = AAC['AudioHuge'];
        const videoStream = VP9['VideoHuge'];
        const videoChain = new ResetInit(
            new FileSource(videoStream.src, xhrManager, timeoutManager));
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioChain = new ResetInit(
            new FileSource(audioStream.src, xhrManager, timeoutManager));
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);
        playbackUtil.playAndHandleErrors(video, (err) => {
          fail(err);
        });
        appendUntil(timeoutManager, video, videoSb, videoChain, 1, () => {
          appendUntil(timeoutManager, video, audioSb, audioChain, 1, () => {
            playThrough(
                timeoutManager, video, 1, 2, videoSb, videoChain, audioSb,
                audioChain, () => {
                  expect(video.currentTime)
                      .withContext('currentTime')
                      .toBeGreaterThanOrEqual(2);
                  done();
                });
          });
        });
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    function createStartPlayAtNonZeroPositionTest(
        testTitle: string, audioStream: StreamDef, audioSegments: number[],
        videoStream: StreamDef, videoSegments: number[], startAtSec: number) {
      it(testTitle, (done) => {
        const ms = new MediaSource();
        video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
        ms.addEventListener('sourceopen', () => {
          const videoSb = ms.addSourceBuffer(videoStream.mimetype);
          const audioSb = ms.addSourceBuffer(audioStream.mimetype);

          const fetchStream =
              (stream: StreamDef, cb: (data: Uint8Array) => void,
               start?: number, length?: number) => {
                const xhr = xhrManager.createRequest(stream.src, () => {
                  cb(xhr.getResponseData());
                }, start, length);
                xhr.send();
              };

          const appendLoop =
              (stream: StreamDef, sb: SourceBuffer, segments: number[],
               seekTime?: number) => {
                fetchStream(stream, (data) => {
                  let parsedData: Segment[];
                  if (stream.codec === 'H264' || stream.codec === 'AAC') {
                    parsedData = parseMp4(data);
                  } else {
                    parsedData = parseWebM(data.buffer)!;
                  }
                  fetchStream(stream, (initData) => {
                    let segmentIdx = 0;
                    const maxSegments = segments.length;
                    const onUpdateEnd = () => {
                      if (seekTime && segmentIdx === 0) {
                        playbackUtil.playAndHandleErrors(video, (err) => {
                          fail(err);
                        });
                      }
                      if (segmentIdx >= maxSegments) {
                        sb.removeEventListener('updateend', onUpdateEnd);
                        if (seekTime) {
                          video.currentTime = seekTime;
                        }
                        return;
                      }
                      const seg = parsedData[segments[segmentIdx]];
                      fetchStream(stream, (segData) => {
                        sb.appendBuffer(segData);
                        segmentIdx++;
                      }, seg.offset, seg.size);
                    };
                    sb.addEventListener('updateend', onUpdateEnd);
                    sb.appendBuffer(initData);
                  }, 0, parsedData[0].offset);
                }, 0, 32 * 1024);
              };

          video.addEventListener('timeupdate', () => {
            if (!video.paused && video.currentTime > startAtSec + 5) {
              expect(video.currentTime)
                  .withContext('video.currentTime')
                  .toBeGreaterThan(startAtSec + 5);
              done();
            }
          });

          appendLoop(audioStream, audioSb, audioSegments);
          appendLoop(videoStream, videoSb, videoSegments, startAtSec);
        }, {once: true});
      }, DEFAULT_TIMEOUT_MS);
    }

    createStartPlayAtNonZeroPositionTest(
        'StartPlayAtTimeGt0H264+AAC', AAC['AudioNormal'], [1, 2],
        H264['VideoNormal'], [2, 3, 4], 12);
    createStartPlayAtNonZeroPositionTest(
        'StartPlayAtTimeGt0VP9+Opus', Opus['CarLow'], [1, 2],
        VP9['VideoNormal'], [2, 3, 4], 12);

    it('EventTimestamp', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        const videoStream = VP9['VideoTiny'];
        const audioStream = AAC['AudioTiny'];
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);
        expect(Date.now())
            .withContext('Date.now()')
            .toBeGreaterThan(1360000000000);
        let lastTime = 0.0;
        let requestCounter = 0;
        const audioXhr = xhrManager.createRequest(audioStream.src, () => {
          audioSb.appendBuffer(audioXhr.getResponseData());
          video.addEventListener('timeupdate', (e) => {
            expect(e.timeStamp)
                .withContext('event.timeStamp')
                .toBeGreaterThanOrEqual(lastTime);
            lastTime = e.timeStamp;
            if (!video.paused && video.currentTime >= 2 &&
                requestCounter >= 3) {
              done();
            }
            requestCounter++;
          });
          playbackUtil.playAndHandleErrors(video, (err) => {
            fail(err);
          });
        }, 0, 500000);
        const videoXhr = xhrManager.createRequest(videoStream.src, () => {
          videoSb.appendBuffer(videoXhr.getResponseData());
          audioXhr.send();
        }, 0, 1500000);
        videoXhr.send();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    it('SeekTimeUpdate', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        const videoStream = VP9['VideoNormal'];
        const audioStream = AAC['AudioNormal'];
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);
        let lastTime = 0;
        let updateCount = 0;
        const xhr = xhrManager.createRequest(videoStream.src, () => {
          videoSb.appendBuffer(xhr.getResponseData());
          const xhr2 = xhrManager.createRequest(audioStream.src, () => {
            audioSb.appendBuffer(xhr2.getResponseData());
            const onLoadedMetadata = () => {
              video.addEventListener('timeupdate', () => {
                if (!video.paused) {
                  updateCount++;
                  expect(video.currentTime)
                      .withContext('media.currentTime')
                      .toBeGreaterThanOrEqual(lastTime);
                  if (updateCount > 3) {
                    updateCount = 0;
                    lastTime += 10;
                    if (lastTime >= 35) {
                      done();
                    } else {
                      video.currentTime = lastTime + 6;
                    }
                  }
                }
              });
              playbackUtil.playAndHandleErrors(video, (err) => {
                fail(err);
              });
            };
            if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
              onLoadedMetadata();
            } else {
              video.addEventListener(
                  'loadedmetadata', onLoadedMetadata, {once: true});
            }
          }, 0, 1000000);
          xhr2.send();
        }, 0, 5000000);
        ms.duration = 100000000;
        xhr.send();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    it('AppendWindowStart', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        const start = 3.4;
        const videoStream = VP9['VideoNormal'];
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        expect(() => {
          videoSb.appendWindowStart = -1;
        }).toThrowError(TypeError);
        expect(() => {
          videoSb.appendWindowEnd = 10;
          videoSb.appendWindowStart = 11;
        }).toThrowError(TypeError);
        expect(videoSb.appendWindowStart)
            .withContext('appendWindowStart initial')
            .toBe(0);
        videoSb.appendWindowStart = start;
        const xhr = xhrManager.createRequest(videoStream.src, () => {
          videoSb.appendBuffer(xhr.getResponseData());
          videoSb.addEventListener('updateend', () => {
            expect(videoSb.appendWindowStart)
                .withContext('appendWindowStart')
                .toBe(start);
            expect(videoSb.buffered.start(0))
                .withContext('Buffered range start')
                .toBeGreaterThanOrEqual(start);
            done();
          }, {once: true});
        }, 0, 3000000);
        xhr.send();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    it('AppendWindowEnd', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        const end = 5.3;
        const videoStream = VP9['VideoNormal'];
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        expect(() => {
          videoSb.appendWindowStart = 2;
          videoSb.appendWindowEnd = 1;
        }).toThrowError(TypeError);
        videoSb.appendWindowStart = 0;
        videoSb.appendWindowEnd = end;
        const xhr = xhrManager.createRequest(videoStream.src, () => {
          videoSb.appendBuffer(xhr.getResponseData());
          videoSb.addEventListener('updateend', () => {
            expect(videoSb.appendWindowEnd)
                .withContext('appendWindowEnd')
                .toBe(end);
            expect(videoSb.buffered.end(0))
                .withContext('Buffered range end')
                .toBeCloseTo(end, 0.05);
            done();
          }, {once: true});
        }, 0, 3000000);
        xhr.send();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    it('PlaybackRateChange', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        const videoStream = VP9['VideoNormal'];
        const audioStream = AAC['AudioNormal'];
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);
        let baseMediaTime = 0.0;
        let baseRealTime = 0.0;
        let isBaseCaptured = false;
        let isRateChanged = false;
        let isBaseUpdated = false;
        let updateCount = 0;
        const xhr = xhrManager.createRequest(videoStream.src, () => {
          videoSb.appendBuffer(xhr.getResponseData());
          const xhr2 = xhrManager.createRequest(audioStream.src, () => {
            audioSb.appendBuffer(xhr2.getResponseData());
            const onLoadedMetadata = () => {
              video.addEventListener('timeupdate', () => {
                updateCount++;
                if (updateCount % 2 === 0) return;
                const time = video.currentTime;
                if (time < 0.5) {
                  if (!isBaseCaptured) {
                    isBaseCaptured = true;
                    baseRealTime = Date.now();
                    baseMediaTime = time;
                  }
                } else if (time < 1.5) {
                  const rate = getActualPlaybackRate(
                      time, Date.now(), baseMediaTime, baseRealTime);
                  expect(rate)
                      .withContext('Playback rate 1x')
                      .toBeLessThanOrEqual(1.05);
                } else if (time < 4) {
                  if (!isRateChanged) {
                    isRateChanged = true;
                    video.playbackRate = 2.0;
                  }
                } else if (time < 5) {
                  if (!isBaseUpdated) {
                    isBaseUpdated = true;
                    baseRealTime = Date.now();
                    baseMediaTime = time;
                  }
                } else if (time < 7) {
                  const rate = getActualPlaybackRate(
                      time, Date.now(), baseMediaTime, baseRealTime);
                  expect(rate)
                      .withContext('Playback rate 2x')
                      .toBeGreaterThanOrEqual(1.95);
                } else {
                  const droppedFrames =
                      video.getVideoPlaybackQuality().droppedVideoFrames;
                  expect(droppedFrames)
                      .withContext('Total dropped frames')
                      .toBeLessThanOrEqual(1);
                  done();
                }
              });
              playbackUtil.playAndHandleErrors(video, (err) => {
                fail(err);
              });
            };
            if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
              onLoadedMetadata();
            } else {
              video.addEventListener(
                  'loadedmetadata', onLoadedMetadata, {once: true});
            }
          }, 0, 1000000);
          xhr2.send();
        }, 0, 5000000);
        xhr.send();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    function getActualPlaybackRate(
        currMedia: number, currReal: number, baseMedia: number,
        baseReal: number): number {
      const mediaElapsed = currMedia - baseMedia;
      const realElapsed = (currReal - baseReal) / 1000.0;
      return Number((mediaElapsed / realElapsed).toFixed(3));
    }

    function createAvSyncAfterSwitch(
        testTitle: string, audioStream: StreamDef) {
      it(testTitle, (done) => {
        const ms = new MediaSource();
        video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
        ms.addEventListener('sourceopen', () => {
          const videoStream = H264['VideoTiny'];
          const audioSb = ms.addSourceBuffer(audioStream.mimetype);
          const videoSb = ms.addSourceBuffer(videoStream.mimetype);
          const QUARTERED_AU_DURATION_IN_SECONDS = 1024.0 / 44100 / 4;
          const MAX_DURATION_IN_SECONDS = 5;
          const COUNTER_PROGRESSION = QUARTERED_AU_DURATION_IN_SECONDS / 3;
          let offset = COUNTER_PROGRESSION % QUARTERED_AU_DURATION_IN_SECONDS +
              QUARTERED_AU_DURATION_IN_SECONDS;

          function appendMediaSegment(
              mediaSource: MediaSource, sourceBuffer: SourceBuffer,
              mediaSegment: Uint8Array, currentOffset = 0.0) {
            sourceBuffer.appendWindowEnd = MAX_DURATION_IN_SECONDS;
            const onUpdateEnd = () => {
              sourceBuffer.removeEventListener('updateend', onUpdateEnd);
              sourceBuffer.abort();
              currentOffset += QUARTERED_AU_DURATION_IN_SECONDS;
              if (currentOffset < MAX_DURATION_IN_SECONDS) {
                appendMediaSegment(
                    mediaSource, sourceBuffer, mediaSegment, currentOffset);
              } else {
                mediaSource.endOfStream();
                let startTime = performance.now();
                const startListener = () => {
                  if (video.currentTime >
                      QUARTERED_AU_DURATION_IN_SECONDS / 2) {
                    video.removeEventListener('timeupdate', startListener);
                    startTime = performance.now() - video.currentTime * 1000;
                  }
                };
                video.addEventListener('timeupdate', startListener);
                video.addEventListener('ended', () => {
                  const durationSec = (performance.now() - startTime) / 1000;
                  expect(durationSec)
                      .withContext('Video duration max')
                      .toBeLessThanOrEqual(MAX_DURATION_IN_SECONDS * 1.15);
                  expect(durationSec)
                      .withContext('Video duration min')
                      .toBeGreaterThanOrEqual(MAX_DURATION_IN_SECONDS * 0.90);
                  done();
                }, {once: true});
                video.currentTime = QUARTERED_AU_DURATION_IN_SECONDS / 2;
                playbackUtil.playAndHandleErrors(video, (err) => {
                  fail(err);
                });
              }
            };
            sourceBuffer.addEventListener('updateend', onUpdateEnd);
            sourceBuffer.timestampOffset = currentOffset;
            const appendWindowStart = currentOffset + offset;
            offset = (offset + COUNTER_PROGRESSION) %
                    QUARTERED_AU_DURATION_IN_SECONDS +
                QUARTERED_AU_DURATION_IN_SECONDS;
            if (currentOffset > 0 &&
                appendWindowStart < sourceBuffer.appendWindowEnd) {
              sourceBuffer.appendWindowStart = appendWindowStart;
            }
            sourceBuffer.appendBuffer(mediaSegment);
          }

          const audioXhr = xhrManager.createRequest(audioStream.src, () => {
            appendMediaSegment(ms, audioSb, audioXhr.getResponseData());
          }, 0, 8192);
          const videoXhr = xhrManager.createRequest(videoStream.src, () => {
            videoSb.appendBuffer(videoXhr.getResponseData());
            audioXhr.send();
          }, 0, 165757);
          videoXhr.send();
        }, {once: true});
      }, DEFAULT_TIMEOUT_MS);
    }

    createAvSyncAfterSwitch('AVSync.AAC', AAC['Audio44100']);
    createAvSyncAfterSwitch('AVSync.Opus', Opus['Audio48000']);

    function createInBufferSeekTest(testTitle: string, audioStream: StreamDef) {
      it(testTitle, (done) => {
        const ms = new MediaSource();
        video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
        ms.addEventListener('sourceopen', () => {
          const loadingTimeSecs = 2.0;
          const seekTargetSecs = 5.066;
          const maxAllowedSeekMs = 300;
          const videoStream = VP9['VideoNormal'];
          const videoSb = ms.addSourceBuffer(videoStream.mimetype);
          const audioSb = ms.addSourceBuffer(audioStream.mimetype);
          let startTime = performance.now();
          const audioXhr = xhrManager.createRequest(audioStream.src, () => {
            audioSb.appendBuffer(audioXhr.getResponseData());
            const onCanPlayThrough = () => {
              const onTimeUpdate = () => {
                if (video.currentTime > loadingTimeSecs) {
                  video.removeEventListener('timeupdate', onTimeUpdate);
                  video.addEventListener('seeked', () => {
                    const elapsedMs = performance.now() - startTime;
                    expect(elapsedMs)
                        .withContext('InBufferSeek time')
                        .toBeLessThanOrEqual(maxAllowedSeekMs);
                    video.addEventListener('timeupdate', () => {
                      done();
                    }, {once: true});
                  }, {once: true});
                  startTime = performance.now();
                  video.currentTime = seekTargetSecs;
                }
              };
              video.addEventListener('timeupdate', onTimeUpdate);
              playbackUtil.playAndHandleErrors(video, (err) => {
                fail(err);
              });
            };
            video.addEventListener(
                'canplaythrough', onCanPlayThrough, {once: true});
          }, 0, 500000);
          const videoXhr = xhrManager.createRequest(videoStream.src, () => {
            videoSb.appendBuffer(videoXhr.getResponseData());
            audioXhr.send();
          }, 0, 1500000);
          videoXhr.send();
        }, {once: true});
      }, DEFAULT_TIMEOUT_MS);
    }

    createInBufferSeekTest('InBufferSeek', Opus['CarMed']);
    createInBufferSeekTest('InBufferSeek (AAC)', AAC['AudioNormal']);
  });

  describe('MSE currentTime', () => {
    function createCurrentTimeAccuracyTest(
        testTitle: string, videoStream: StreamDef, audioStream: StreamDef,
        isSpec: boolean) {
      it(testTitle, (done) => {
        const ms = new MediaSource();
        video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
        ms.addEventListener('sourceopen', () => {
          let maxTimeDiff = 0;
          let baseTimeDiff = 0;
          let times = 0;
          const testStartTime = performance.now();
          const getElapsedS = () =>
              (performance.now() - testStartTime) / 1000.0;
          const videoSb = ms.addSourceBuffer(videoStream.mimetype);
          const audioSb = ms.addSourceBuffer(audioStream.mimetype);
          const videoXhr = xhrManager.createRequest(videoStream.src, () => {
            videoSb.appendBuffer(videoXhr.getResponseData());
            video.addEventListener('timeupdate', () => {
              const elapsedInS = getElapsedS();
              if (isSpec) {
                if (times === 0) {
                  baseTimeDiff = elapsedInS - video.currentTime;
                } else {
                  const timeDiff = elapsedInS - video.currentTime;
                  maxTimeDiff =
                      Math.max(Math.abs(timeDiff - baseTimeDiff), maxTimeDiff);
                  expect(maxTimeDiff)
                      .withContext('media.currentTime diff during playback')
                      .toBeLessThanOrEqual(0.25);
                  done();
                }
                times++;
              } else {
                const timeDiff = elapsedInS - video.currentTime;
                if (baseTimeDiff === 0) {
                  if (video.currentTime > 0.5) {
                    baseTimeDiff = timeDiff;
                  }
                } else {
                  maxTimeDiff =
                      Math.max(Math.abs(timeDiff - baseTimeDiff), maxTimeDiff);
                }
                if (video.currentTime > 10) {
                  expect(maxTimeDiff)
                      .withContext('media.currentTime diff during playback')
                      .toBeLessThanOrEqual(0.25);
                  done();
                }
              }
            });
            video.addEventListener('canplaythrough', () => {
              playbackUtil.playAndHandleErrors(video, (err) => {
                fail(err);
              });
            }, {once: true});
          }, 0, 2500000);
          const audioXhr = xhrManager.createRequest(audioStream.src, () => {
            audioSb.appendBuffer(audioXhr.getResponseData());
            videoXhr.send();
          }, 0, 2500000);
          audioXhr.send();
        }, {once: true});
      }, DEFAULT_TIMEOUT_MS);
    }

    createCurrentTimeAccuracyTest(
        'SFRAccuracy', H264['Webgl720p30fps'], AAC['AudioNormal'], false);
    createCurrentTimeAccuracyTest(
        'HFRAccuracy', H264['Webgl720p60fps'], AAC['AudioNormal'], false);
    createCurrentTimeAccuracyTest(
        'SFRSpecAccuracy', H264['Webgl720p30fps'], AAC['AudioNormal'], true);
    createCurrentTimeAccuracyTest(
        'HFRSpecAccuracy', H264['Webgl720p60fps'], AAC['AudioNormal'], true);

    function createCurrentTimePausedAccuracyTest(
        testTitle: string, videoStream: StreamDef, audioStream: StreamDef,
        maxDiffInS: number) {
      it(testTitle, (done) => {
        const ms = new MediaSource();
        video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
        ms.addEventListener('sourceopen', () => {
          let baseTimeDiff = 0;
          let times = 0;
          let assertTimeAtPlay = false;
          let currentTimeIsAccurate = false;
          const testStartTime = performance.now();
          const getElapsedS = () =>
              (performance.now() - testStartTime) / 1000.0;
          const videoSb = ms.addSourceBuffer(videoStream.mimetype);
          const audioSb = ms.addSourceBuffer(audioStream.mimetype);

          const videoXhr = xhrManager.createRequest(videoStream.src, () => {
            videoSb.appendBuffer(videoXhr.getResponseData());
            const onTimeUpdate = () => {
              if (times === 1) {
                baseTimeDiff = getElapsedS() - video.currentTime;
              }
              if (times > 500 || video.currentTime > 10) {
                video.removeEventListener('timeupdate', onTimeUpdate);
                video.pause();
              }
              times++;
            };
            video.addEventListener('play', () => {
              if (assertTimeAtPlay) {
                const timeDiff = getElapsedS() - video.currentTime;
                const currentTimeDiff = Math.abs(baseTimeDiff - timeDiff);
                currentTimeIsAccurate =
                    currentTimeIsAccurate || (currentTimeDiff <= maxDiffInS);
                expect(currentTimeIsAccurate)
                    .withContext(
                        `media.currentTime diff is within ${maxDiffInS}s`)
                    .toBeTrue();
                assertTimeAtPlay = false;
                done();
              }
            });
            video.addEventListener('pause', () => {
              const timeDiff = getElapsedS() - video.currentTime;
              const currentTimeDiff = Math.abs(baseTimeDiff - timeDiff);
              expect(video.paused).withContext('media.paused').toBeTrue();
              currentTimeIsAccurate = currentTimeDiff <= maxDiffInS;
              assertTimeAtPlay = true;
              playbackUtil.playAndHandleErrors(video, (err) => {
                fail(err);
              });
            }, {once: true});
            video.addEventListener('timeupdate', onTimeUpdate);
            video.addEventListener('canplaythrough', () => {
              playbackUtil.playAndHandleErrors(video, (err) => {
                fail(err);
              });
            }, {once: true});
          }, 0, 2500000);
          const audioXhr = xhrManager.createRequest(audioStream.src, () => {
            audioSb.appendBuffer(audioXhr.getResponseData());
            videoXhr.send();
          }, 0, 2500000);
          audioXhr.send();
        }, {once: true});
      }, DEFAULT_TIMEOUT_MS);
    }

    createCurrentTimePausedAccuracyTest(
        'SFRPausedAccuracy32ms', VP9['Webgl720p30fps'], AAC['AudioNormal'],
        0.032);
    createCurrentTimePausedAccuracyTest(
        'SFRPausedAccuracy100ms', VP9['Webgl720p30fps'], AAC['AudioNormal'],
        0.100);
    createCurrentTimePausedAccuracyTest(
        'HFRPausedAccuracy32ms', VP9['Webgl720p60fps'], AAC['AudioNormal'],
        0.032);
    createCurrentTimePausedAccuracyTest(
        'HFRPausedAccuracy100ms', VP9['Webgl720p60fps'], AAC['AudioNormal'],
        0.100);
  });

  describe('MSE Formats', () => {
    function createSupportTest(
        testTitle: string, mimetype: string, mandatory = true) {
      it(testTitle, (done) => {
        checkMandatory(mandatory);
        const ms = new MediaSource();
        video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
        ms.addEventListener('sourceopen', () => {
          expect(() => {
            ms.addSourceBuffer(mimetype);
          })
              .withContext(`Support for ${mimetype}`)
              .not.toThrow();
          done();
        }, {once: true});
      }, DEFAULT_TIMEOUT_MS);
    }

    createSupportTest('AACSupport', AAC_STREAMS.mimetype);
    createSupportTest('H264Support', H264_STREAMS.mimetype);
    createSupportTest('VP9Support', VP9_STREAMS.mimetype);
    createSupportTest('OpusSupport', OPUS_STREAMS.mimetype);
    createSupportTest('AV1Support', AV1_STREAMS.mimetype);
  });

  describe('Media', () => {
    function createFrameTest(testTitle: string, videoStream: StreamDef) {
      it(testTitle, (done) => {
        const ms = new MediaSource();
        video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
        ms.addEventListener('sourceopen', () => {
          const audioStream = AAC['AudioNormal'];
          const videoChain = new FixedAppendSize(new ResetInit(
              new FileSource(videoStream.src, xhrManager, timeoutManager)));
          const videoSb = ms.addSourceBuffer(H264_STREAMS.mimetype);
          const audioChain = new FixedAppendSize(new ResetInit(
              new FileSource(audioStream.src, xhrManager, timeoutManager)));
          const audioSb = ms.addSourceBuffer(AAC_STREAMS.mimetype);
          playbackUtil.playAndHandleErrors(video, (err) => {
            fail(err);
          });
          playThrough(
              timeoutManager, video, 5, 18, videoSb, videoChain, audioSb,
              audioChain, () => {
                expect(video.currentTime)
                    .withContext('Playback reached end')
                    .toBeGreaterThanOrEqual(18);
                done();
              });
        }, {once: true});
      }, DEFAULT_TIMEOUT_MS);
    }

    createFrameTest('H264FrameGaps', H264['FrameGap']);
    createFrameTest('H264FrameOverlaps', H264['FrameOverlap']);

    function createHeAacTest(testTitle: string, audioStream: StreamDef) {
      it(testTitle, (done) => {
        const ms = new MediaSource();
        video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
        ms.addEventListener('sourceopen', () => {
          const videoStream = H264['VideoHeAac'];
          const audioSb = ms.addSourceBuffer(audioStream.mimetype);
          const videoSb = ms.addSourceBuffer(videoStream.mimetype);
          const xhr = xhrManager.createRequest(audioStream.src, () => {
            audioSb.addEventListener('update', () => {
              const xhr2 = xhrManager.createRequest(videoStream.src, () => {
                videoSb.addEventListener('update', () => {
                  ms.endOfStream();
                  video.addEventListener('ended', () => {
                    expect(video.currentTime)
                        .withContext('media.currentTime upper bound')
                        .toBeLessThanOrEqual(audioStream.duration + 1);
                    expect(video.currentTime)
                        .withContext('media.currentTime lower bound')
                        .toBeGreaterThanOrEqual(audioStream.duration - 0.5);
                    done();
                  });
                  playbackUtil.playAndHandleErrors(video, (err) => {
                    fail(err);
                  });
                }, {once: true});
                videoSb.appendBuffer(xhr2.getResponseData());
              }, 0, videoStream.fileSize);
              xhr2.send();
            }, {once: true});
            audioSb.appendBuffer(xhr.getResponseData());
          }, 0, audioStream.fileSize);
          xhr.send();
        }, {once: true});
      }, DEFAULT_TIMEOUT_MS);
    }

    createHeAacTest('HE-AAC/ExplicitSBR', AAC['AudioLowExplicitHE']);
    createHeAacTest('HE-AAC/ImplicitSBR', AAC['AudioLowImplicitHE']);
  });

  describe('state', () => {
    it('paused', (done) => {
      video.addEventListener('error', (e) => {
        fail(String(e));
      });
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
      expect(video.paused).withContext('video.paused').toBeFalse();
      done();
    }, DEFAULT_TIMEOUT_MS);

    it('onwaiting', (done) => {
      video.addEventListener('waiting', () => {
        expect(video.currentTime).withContext('video.currentTime').toBe(0);
        done();
      }, {once: true});
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    }, DEFAULT_TIMEOUT_MS);

    function createEventFiredTest(
        testTitle: string, eventName: string, shouldPlay = false) {
      it(testTitle, (done) => {
        const ms = new MediaSource();
        video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
        ms.addEventListener('sourceopen', () => {
          const videoStream = VP9['VideoNormal'];
          const sb = ms.addSourceBuffer(videoStream.mimetype);
          const videoXhr = xhrManager.createRequest(videoStream.src, () => {
            video.addEventListener(eventName, () => {
              expect(true).withContext(`${eventName} event fired`).toBeTrue();
              done();
            }, {once: true});
            sb.appendBuffer(videoXhr.getResponseData());
            if (shouldPlay) {
              playbackUtil.playAndHandleErrors(video, (err) => {
                fail(err);
              });
            }
          }, 0, 3000000);
          videoXhr.send();
        }, {once: true});
      }, DEFAULT_TIMEOUT_MS);
    }

    createEventFiredTest('canplay', 'canplay');
    createEventFiredTest('progress', 'progress');
    createEventFiredTest('timeupdate', 'timeupdate', true);

    it('autoplay', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        const videoStream = VP9['VideoNormal'];
        const sb = ms.addSourceBuffer(videoStream.mimetype);
        const videoXhr = xhrManager.createRequest(videoStream.src, () => {
          video.addEventListener('timeupdate', () => {
            expect(true)
                .withContext('timeupdate fired from autoplay')
                .toBeTrue();
            done();
          }, {once: true});
          sb.appendBuffer(videoXhr.getResponseData());
        }, 0, 3000000);
        video.autoplay = true;
        videoXhr.send();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    it('networkState', (done) => {
      const videoStream = VP9['VideoNormal'];
      expect(video.networkState)
          .withContext('Initial networkState')
          .toBe(HTMLMediaElement.NETWORK_EMPTY);
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        expect(video.networkState)
            .withContext('networkState after sourceopen')
            .toBe(HTMLMediaElement.NETWORK_LOADING);
        const sb = ms.addSourceBuffer(videoStream.mimetype);
        sb.addEventListener('updateend', () => {
          expect(video.networkState)
              .withContext('networkState after updateend')
              .toBe(HTMLMediaElement.NETWORK_LOADING);
          done();
        }, {once: true});
        const videoXhr = xhrManager.createRequest(videoStream.src, () => {
          sb.appendBuffer(videoXhr.getResponseData());
        }, 0, 3000000);
        videoXhr.send();
      }, {once: true});
      video.load();
    }, DEFAULT_TIMEOUT_MS);
  });

  describe('timeupdate', () => {
    function createGranularityTest(
        testTitle: string, playbackRate: number, isMax: boolean,
        threshold: number) {
      it(testTitle, (done) => {
        const ms = new MediaSource();
        video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
        ms.addEventListener('sourceopen', () => {
          const videoStream = VP9['VideoNormal'];
          const audioStream = AAC['AudioNormal'];
          const videoSb = ms.addSourceBuffer(videoStream.mimetype);
          const audioSb = ms.addSourceBuffer(audioStream.mimetype);
          const warmUpCount = 15;
          let extremeGranularity = isMax ? 0 : Infinity;
          let times = 0;
          let last = 0;
          const videoXhr = xhrManager.createRequest(videoStream.src, () => {
            videoSb.appendBuffer(videoXhr.getResponseData());
            video.playbackRate = playbackRate;
            video.addEventListener('timeupdate', () => {
              if (times >= warmUpCount) {
                const interval = Date.now() - last;
                if (isMax) {
                  if (interval > extremeGranularity) {
                    extremeGranularity = interval;
                  }
                } else {
                  if (interval > 1 && interval < extremeGranularity) {
                    extremeGranularity = interval;
                  }
                }
              }
              if (times === 50 + warmUpCount) {
                extremeGranularity = extremeGranularity / 1000.0;
                if (isMax) {
                  expect(extremeGranularity)
                      .withContext('maxGranularity')
                      .toBeLessThanOrEqual(threshold);
                } else {
                  expect(extremeGranularity)
                      .withContext('minGranularity')
                      .toBeGreaterThanOrEqual(threshold);
                }
                done();
              }
              last = Date.now();
              times++;
            });
            playbackUtil.playAndHandleErrors(video, (err) => {
              fail(err);
            });
          }, 0, 3000000);
          const audioXhr = xhrManager.createRequest(audioStream.src, () => {
            audioSb.appendBuffer(audioXhr.getResponseData());
            videoXhr.send();
          });
          audioXhr.send();
        }, {once: true});
      }, DEFAULT_TIMEOUT_MS);
    }

    createGranularityTest('maxGranularityPlaybackRate0.25', 0.25, true, 0.28);
    createGranularityTest('maxGranularityPlaybackRate0.50', 0.50, true, 0.28);
    createGranularityTest('maxGranularityPlaybackRate1.00', 1.00, true, 0.28);
    createGranularityTest('maxGranularityPlaybackRate1.25', 1.25, true, 0.28);
    createGranularityTest('maxGranularityPlaybackRate1.50', 1.50, true, 0.28);
    createGranularityTest('maxGranularityPlaybackRate2.00', 2.00, true, 0.28);

    createGranularityTest('minGranularityPlaybackRate0.25', 0.25, false, 0.015);
    createGranularityTest('minGranularityPlaybackRate0.50', 0.50, false, 0.015);
    createGranularityTest('minGranularityPlaybackRate1.00', 1.00, false, 0.015);
    createGranularityTest('minGranularityPlaybackRate1.25', 1.25, false, 0.015);
    createGranularityTest('minGranularityPlaybackRate1.50', 1.50, false, 0.015);
    createGranularityTest('minGranularityPlaybackRate2.00', 2.00, false, 0.015);

    it('progressing', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        const videoStream = VP9['VideoNormal'];
        const audioStream = AAC['AudioNormal'];
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);
        let last = 0;
        let times = 0;
        const videoXhr = xhrManager.createRequest(videoStream.src, () => {
          videoSb.appendBuffer(videoXhr.getResponseData());
          video.addEventListener('timeupdate', () => {
            if (times === 0) {
              last = video.currentTime;
            } else {
              expect(video.currentTime)
                  .withContext('video.currentTime')
                  .toBeGreaterThanOrEqual(last);
              last = video.currentTime;
            }
            if (video.currentTime > 10) {
              done();
            }
            times++;
          });
          playbackUtil.playAndHandleErrors(video, (err) => {
            fail(err);
          });
        }, 0, 3000000);
        const audioXhr = xhrManager.createRequest(audioStream.src, () => {
          audioSb.appendBuffer(audioXhr.getResponseData());
          videoXhr.send();
        });
        audioXhr.send();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    it('duration on timeupdate', (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
      ms.addEventListener('sourceopen', () => {
        const videoStream = VP9['VideoNormal'];
        const audioStream = AAC['AudioNormal'];
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);
        const videoXhr = xhrManager.createRequest(videoStream.src, () => {
          videoSb.appendBuffer(videoXhr.getResponseData());
          video.addEventListener('timeupdate', () => {
            expect(video.duration)
                .withContext('video.duration')
                .toBeGreaterThanOrEqual(0);
            if (video.currentTime > 1) {
              done();
            }
          });
          playbackUtil.playAndHandleErrors(video, (err) => {
            fail(err);
          });
        }, 0, 3000000);
        const audioXhr = xhrManager.createRequest(audioStream.src, () => {
          audioSb.appendBuffer(audioXhr.getResponseData());
          videoXhr.send();
        });
        audioXhr.send();
      }, {once: true});
    }, DEFAULT_TIMEOUT_MS);

    function createPlaybackRateTest(testTitle: string, playbackRate: number) {
      it(testTitle, (done) => {
        const ms = new MediaSource();
        video.src = playbackUtil.createMediaSourceUrlFromSource(ms);
        ms.addEventListener('sourceopen', () => {
          const videoStream = VP9['VideoNormal'];
          const audioStream = AAC['AudioNormal'];
          const videoSb = ms.addSourceBuffer(videoStream.mimetype);
          const audioSb = ms.addSourceBuffer(audioStream.mimetype);
          const videoXhr = xhrManager.createRequest(videoStream.src, () => {
            videoSb.appendBuffer(videoXhr.getResponseData());
            video.playbackRate = playbackRate;
            const warmUpCount = 15;
            let times = 0;
            let realTimeLast = 0;
            let playTimeLast = 0;
            video.addEventListener('timeupdate', () => {
              if (times <= warmUpCount) {
                realTimeLast = Date.now();
                playTimeLast = video.currentTime;
              } else {
                const realTimeNext = Date.now();
                const playTimeNext = video.currentTime;
                const realTimeDelta = (realTimeNext - realTimeLast) / 1000.0;
                const playTimeDelta = playTimeNext - playTimeLast;
                const expectedDelta = realTimeDelta * playbackRate;
                expect(playTimeDelta)
                    .withContext('playback time delta min')
                    .toBeGreaterThanOrEqual(expectedDelta - 0.25);
                expect(playTimeDelta)
                    .withContext('playback time delta max')
                    .toBeLessThanOrEqual(expectedDelta + 0.25);
                realTimeLast = realTimeNext;
                playTimeLast = playTimeNext;
              }
              if (times === 50 + warmUpCount) {
                done();
              }
              times++;
            });
            playbackUtil.playAndHandleErrors(video, (err) => {
              fail(err);
            });
          });
          const audioXhr = xhrManager.createRequest(audioStream.src, () => {
            audioSb.appendBuffer(audioXhr.getResponseData());
            videoXhr.send();
          });
          audioXhr.send();
        }, {once: true});
      }, DEFAULT_TIMEOUT_MS);
    }

    createPlaybackRateTest('PlaybackRate0.25', 0.25);
    createPlaybackRateTest('PlaybackRate0.50', 0.50);
    createPlaybackRateTest('PlaybackRate1.00', 1.00);
    createPlaybackRateTest('PlaybackRate1.25', 1.25);
    createPlaybackRateTest('PlaybackRate1.50', 1.50);
    createPlaybackRateTest('PlaybackRate2.00', 2.00);
    createPlaybackRateTest('PlaybackRate0.75', 0.75);
    createPlaybackRateTest('PlaybackRate1.75', 1.75);
  });
});
