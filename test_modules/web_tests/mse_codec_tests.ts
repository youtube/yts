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

import * as legacyYtsUtils from 'google3/third_party/javascript/yts/test_utils/legacy_yts_utils';
import {appendInit, appendUntil, FileSource, FixedAppendSize, playThrough, ResetInit, setDuration, waitUntil} from 'google3/third_party/javascript/yts/test_utils/mse/source_chain';
import * as playbackUtil from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {StreamDef} from 'google3/third_party/javascript/yts/test_utils/streams/interfaces';
import {AAC, AC3, AV1, EAC3, H264, Iamf, Opus, VP9} from 'google3/third_party/javascript/yts/test_utils/streams/media_streams';
import {TimeoutManager} from 'google3/third_party/javascript/yts/test_utils/timeout_manager';
import {XhrManager} from 'google3/third_party/javascript/yts/test_utils/xhr_manager';

describe('MSE Codec Tests', () => {
  const DEFAULT_TIMEOUT_MS = 60_000;
  const EXTENDED_TIMEOUT_MS = 200_000;

  let video: HTMLVideoElement;
  let timeoutManager: TimeoutManager;

  beforeEach(() => {
    playbackUtil.initializeVideoElement();
    video = playbackUtil.getVideoElement()!;
    timeoutManager = new TimeoutManager();
  });

  afterEach(() => {
    playbackUtil.cleanupVideoElement();
    timeoutManager.clearAll();
  });

  function checkMandatory(mandatory: boolean) {
    if (!mandatory) {
      yts.markOptional();
    }
  }

  function checkApproxEq(actual: number, expected: number, eps: number) {
    expect(actual).toBeGreaterThanOrEqual(expected - eps);
    expect(actual).toBeLessThanOrEqual(expected + eps);
  }

  // --- Test Templates (Factory Functions) ---

  function createAppendTest(
      stream: StreamDef, unused_stream: StreamDef, mandatory = true) {
    it(`Append${stream.codec}${
           legacyYtsUtils.makeCapitalName(stream.mediatype)}`,
        (done) => {
          checkMandatory(mandatory);
          const ms = new MediaSource();
          video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

          const onSourceOpen = () => {
            ms.removeEventListener('sourceopen', onSourceOpen);
            const xhrManager = new XhrManager();
            const sb = ms.addSourceBuffer(stream.mimetype);
            ms.addSourceBuffer(unused_stream.mimetype);

            const xhr = xhrManager.createRequest(stream.src, () => {
              const data = xhr.getResponseData();
              const updateEnd = () => {
                sb.removeEventListener('updateend', updateEnd);
                expect(sb.buffered.length)
                    .withContext('Source buffer number')
                    .toBe(1);
                expect(sb.buffered.start(0)).withContext('Range start').toBe(0);
                expect(sb.buffered.end(0))
                    .withContext('Range end')
                    .toBeCloseTo(stream.duration, 0);

                let caught = false;
                try {
                  sb.appendBuffer(data);
                  sb.appendBuffer(data);
                  // Preserving legacy test behavior as-is.
                  // tslint:disable-next-line:no-any
                } catch (e: any) {
                  if (e.code === e.INVALID_STATE_ERR) {
                    done();
                  } else {
                    fail('Invalid error on double append: ' + e);
                    done();
                  }
                  caught = true;
                }

                if (!caught) {
                  if (sb.updating) {
                    fail('Implementation did not throw INVALID_STATE_ERR.');
                  }
                  done();
                }
              };
              sb.addEventListener('updateend', updateEnd);
              sb.appendBuffer(data);
            }, 0, stream.fileSize);
            xhr.send();
          };
          ms.addEventListener('sourceopen', onSourceOpen);
        },
        DEFAULT_TIMEOUT_MS);
  }

  function createAbortTest(
      stream: StreamDef, unused_stream: StreamDef, mandatory = true) {
    it(`Abort${stream.codec}${
           legacyYtsUtils.makeCapitalName(stream.mediatype)}`,
        (done) => {
          checkMandatory(mandatory);
          const ms = new MediaSource();
          video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

          const onSourceOpen = () => {
            ms.removeEventListener('sourceopen', onSourceOpen);
            const xhrManager = new XhrManager();
            const sb = ms.addSourceBuffer(stream.mimetype);
            ms.addSourceBuffer(unused_stream.mimetype);

            const xhr = xhrManager.createRequest(stream.src, () => {
              const responseData = xhr.getResponseData();
              const abortEnded = () => {
                sb.removeEventListener('updateend', abortEnded);
                const onUpdate = () => {
                  sb.removeEventListener('update', onUpdate);
                  expect(sb.buffered.length)
                      .withContext('Source buffer number')
                      .toBe(1);
                  expect(sb.buffered.start(0))
                      .withContext('Range start')
                      .toBe(0);
                  expect(sb.buffered.end(0))
                      .withContext('Range end')
                      .toBeGreaterThan(0);
                  done();
                };
                sb.addEventListener('update', onUpdate);
                sb.appendBuffer(responseData);
              };
              const appendStarted = () => {
                sb.removeEventListener('update', appendStarted);
                sb.addEventListener('updateend', abortEnded);
                sb.abort();
              };
              sb.addEventListener('update', appendStarted);
              sb.appendBuffer(responseData);
            }, 0, stream.fileSize);
            xhr.send();
          };
          ms.addEventListener('sourceopen', onSourceOpen);
        },
        DEFAULT_TIMEOUT_MS);
  }

  function createTimestampOffsetTest(
      stream: StreamDef, unused_stream: StreamDef, mandatory = true) {
    it(`TimestampOffset${stream.codec}${
           legacyYtsUtils.makeCapitalName(stream.mediatype)}`,
        (done) => {
          checkMandatory(mandatory);
          const ms = new MediaSource();
          video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

          const onSourceOpen = () => {
            ms.removeEventListener('sourceopen', onSourceOpen);
            const xhrManager = new XhrManager();
            const sb = ms.addSourceBuffer(stream.mimetype);
            ms.addSourceBuffer(unused_stream.mimetype);

            const xhr = xhrManager.createRequest(stream.src, () => {
              sb.timestampOffset = 5;
              sb.appendBuffer(xhr.getResponseData());
              const onUpdateEnd = () => {
                sb.removeEventListener('updateend', onUpdateEnd);
                expect(sb.buffered.length)
                    .withContext('Source buffer number')
                    .toBe(1);
                expect(sb.buffered.start(0)).withContext('Range start').toBe(5);
                expect(sb.buffered.end(0))
                    .withContext('Range end')
                    .toBeCloseTo(stream.duration + 5, 0);
                done();
              };
              sb.addEventListener('updateend', onUpdateEnd);
            }, 0, stream.fileSize);
            xhr.send();
          };
          ms.addEventListener('sourceopen', onSourceOpen);
        },
        DEFAULT_TIMEOUT_MS);
  }

  /**
   * Test if the duration expands after appending data.
   * @param stream The stream to test.
   * @param unused_stream An unused stream to add to MediaSource.
   * @param mandatory Whether the test is mandatory.
   */
  function createDurationAfterAppendTest(
      stream: StreamDef, unused_stream: StreamDef, mandatory = true) {
    it(`DurationAfterAppend${stream.codec}${
           legacyYtsUtils.makeCapitalName(stream.mediatype)}`,
        (done) => {
          checkMandatory(mandatory);
          const ms = new MediaSource();
          video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

          const onSourceOpen = () => {
            ms.removeEventListener('sourceopen', onSourceOpen);
            const xhrManager = new XhrManager();
            const sb = ms.addSourceBuffer(stream.mimetype);
            ms.addSourceBuffer(unused_stream.mimetype);

            const xhr = xhrManager.createRequest(stream.src, () => {
              const data = xhr.getResponseData();
              const updateCb = () => {
                sb.removeEventListener('updateend', updateCb);
                console.log('[DurationAfterAppend] Abort source buffer');
                sb.abort();

                if (sb.updating) {
                  fail('Source buffer is still updating after abort');
                  done();
                  return;
                }

                let durationChanged = false;
                let sbUpdated = false;
                let halfDuration = 0;

                const onDurationChange = () => {
                  video.removeEventListener('durationchange', onDurationChange);
                  console.log(
                      '[DurationAfterAppend] Duration change complete.');
                  expect(ms.duration)
                      .withContext('ms.duration')
                      .toBeCloseTo(halfDuration, 0);
                  durationChanged = true;
                  if (durationChanged && sbUpdated) {
                    done();
                  }
                  sb.appendBuffer(data);
                };
                video.addEventListener('durationchange', onDurationChange);

                halfDuration = sb.buffered.end(0) / 2;
                console.log(
                    `[DurationAfterAppend] Set duration to halfDuration=${
                        halfDuration}`);
                setDuration(halfDuration, ms, sb, () => {
                  console.log('[DurationAfterAppend] Set duration complete.');
                  expect(ms.duration)
                      .withContext('ms.duration')
                      .toBeCloseTo(halfDuration, 0);
                  expect(sb.buffered.end(0))
                      .withContext('sb.buffered.end(0)')
                      .toBeCloseTo(halfDuration, 0);

                  const onUpdate = () => {
                    sb.removeEventListener('updateend', onUpdate);
                    expect(ms.duration)
                        .withContext('ms.duration')
                        .toBeCloseTo(sb.buffered.end(0), 0);
                    sbUpdated = true;
                    if (durationChanged && sbUpdated) {
                      done();
                    }
                  };
                  sb.addEventListener('updateend', onUpdate);
                });
              };
              sb.addEventListener('updateend', updateCb);
              sb.appendBuffer(data);
            }, 0, stream.fileSize);
            xhr.send();
          };
          ms.addEventListener('sourceopen', onSourceOpen);
        },
        DEFAULT_TIMEOUT_MS);
  }

  function createPausedTest(stream: StreamDef, mandatory = true) {
    it(`PausedStateWith${stream.codec}${
           legacyYtsUtils.makeCapitalName(stream.mediatype)}`,
        (done) => {
          checkMandatory(mandatory);
          const ms = new MediaSource();
          video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

          const onSourceOpen = () => {
            ms.removeEventListener('sourceopen', onSourceOpen);
            const xhrManager = new XhrManager();
            const sb = ms.addSourceBuffer(stream.mimetype);

            expect(video.paused).withContext('video.paused initial').toBeTrue();

            const xhr = xhrManager.createRequest(stream.src, () => {
              expect(video.paused)
                  .withContext('video.paused before append')
                  .toBeTrue();
              sb.appendBuffer(xhr.getResponseData());
              expect(video.paused)
                  .withContext('video.paused after append')
                  .toBeTrue();
              const onUpdateEnd = () => {
                sb.removeEventListener('updateend', onUpdateEnd);
                expect(video.paused)
                    .withContext('video.paused after append complete')
                    .toBeTrue();
                done();
              };
              sb.addEventListener('updateend', onUpdateEnd);
            }, 0, stream.fileSize);
            xhr.send();
          };
          ms.addEventListener('sourceopen', onSourceOpen);
        },
        DEFAULT_TIMEOUT_MS);
  }

  function createIncrementalAudioTest(stream: StreamDef) {
    it(`Incremental${stream.codec}Audio`, (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        const sb = ms.addSourceBuffer(stream.mimetype);
        ms.addSourceBuffer(H264['VideoNormal'].mimetype);

        const xhr = xhrManager.createRequest(stream.src, () => {
          sb.appendBuffer(xhr.getResponseData());
          const onUpdateEnd = () => {
            sb.removeEventListener('updateend', onUpdateEnd);
            expect(sb.buffered.length)
                .withContext('Source buffer number')
                .toBe(1);
            expect(sb.buffered.start(0)).withContext('Range start').toBe(0);

            const expectedEnd = stream.get('200000') as number;
            checkApproxEq(sb.buffered.end(0), expectedEnd, 0.5);
            done();
          };
          sb.addEventListener('updateend', onUpdateEnd);
        }, 0, 200000);
        xhr.send();
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, DEFAULT_TIMEOUT_MS);
  }

  function createLimitedAudioTest(stream: StreamDef) {
    it(`Limited${stream.codec}Audio`, (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        const videoStream = H264['VideoNormal'];
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(stream.mimetype);

        const videoXhr = xhrManager.createRequest(videoStream.src, () => {
          videoSb.appendBuffer(videoXhr.getResponseData());
          video.addEventListener('playing', function onPlaying() {
            video.removeEventListener('playing', onPlaying);
            if (!video.paused) {
              video.pause();
              done();
            }
          });
          video.play();
        }, 0, 1500000);

        const audioXhr = xhrManager.createRequest(stream.src, () => {
          const onUpdateEnd = () => {
            audioSb.removeEventListener('updateend', onUpdateEnd);
            expect(audioSb.buffered.length)
                .withContext('Source buffer number')
                .toBe(1);
            expect(audioSb.buffered.start(0))
                .withContext('Range start')
                .toBe(0);
            checkApproxEq(audioSb.buffered.end(0), 0.5, 0.02);
          };
          audioSb.addEventListener('updateend', onUpdateEnd);
          audioSb.appendBuffer(audioXhr.getResponseData());
          videoXhr.send();
        }, 0, stream.get('halfSecondRangeEnd') as number || 200000);
        audioXhr.send();
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, DEFAULT_TIMEOUT_MS);
  }

  function createIncrementalLimitedAudioTest(
      stream: StreamDef, highBitRate = false) {
    let testName = `IncrementalLimited${stream.codec}Audio`;
    if (highBitRate) {
      testName = `HighBitRateIncrementalLimited${stream.codec}Audio`;
    }
    it(testName, (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        let videoStream = H264['VideoNormal'];
        if (highBitRate) {
          videoStream = H264['Video1137H2641920x1080Fps30BitrateKbps20227k'];
        }
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(stream.mimetype);

        const videoPromise = new Promise<void>((resolve) => {
          const videoXhr = xhrManager.createRequest(videoStream.src, () => {
            videoSb.appendBuffer(videoXhr.getResponseData());
            video.addEventListener('timeupdate', function onTimeUpdate() {
              if (!video.paused &&
                  video.currentTime >=
                      (stream.get('halfSecondDurationEnd') as number || 0.5)) {
                video.removeEventListener('timeupdate', onTimeUpdate);
                done();
              }
            });
            const onUpdateEnd = () => {
              videoSb.removeEventListener('updateend', onUpdateEnd);
              resolve();
            };
            videoSb.addEventListener('updateend', onUpdateEnd);
          }, 0, highBitRate ? 5398253 : 3500000);
          videoXhr.send();
        });

        const audioPromise = new Promise<void>((resolve) => {
          const halfSecondBytes =
              stream.get('halfSecondBytes') as number[] || [0, 200000];
          const nextAudioXhr = (byteIndex: number) => {
            const startBytes = halfSecondBytes[byteIndex];
            const endBytes = halfSecondBytes[byteIndex + 1] - 1;
            const bytesLength = endBytes - startBytes + 1;
            const xhr = xhrManager.createRequest(stream.src, () => {
              const onUpdateEnd = () => {
                audioSb.removeEventListener('updateend', onUpdateEnd);
                if (byteIndex < halfSecondBytes.length - 2) {
                  nextAudioXhr(byteIndex + 1);
                } else {
                  resolve();
                }
              };
              audioSb.addEventListener('updateend', onUpdateEnd);
              audioSb.appendBuffer(xhr.getResponseData());
            }, startBytes, bytesLength);
            xhr.send();
          };
          nextAudioXhr(0);
        });

        const maxPollTime = 5;
        const pollInterval = 0.1;
        Promise.all([videoPromise, audioPromise]).then(() => {
          let retryCount = maxPollTime / pollInterval;
          const checkReady = () => {
            if ((videoSb.updating || audioSb.updating) && retryCount > 0) {
              retryCount--;
              setTimeout(checkReady, 1000 * pollInterval);
            } else {
              ms.endOfStream();
              video.play();
            }
          };
          checkReady();
        });
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, DEFAULT_TIMEOUT_MS);
  }

  function createAppendAudioOffsetTest(stream1: StreamDef, stream2: StreamDef) {
    it(`Append${stream1.codec}AudioOffset`, (done) => {
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        ms.addSourceBuffer(H264['VideoNormal'].mimetype);
        const sb = ms.addSourceBuffer(stream1.mimetype);

        const xhr = xhrManager.createRequest(stream1.src, () => {
          sb.timestampOffset = 5;
          sb.appendBuffer(xhr.getResponseData());
          const onUpdateEnd = () => {
            sb.removeEventListener('updateend', onUpdateEnd);
            sb.abort();
            sb.timestampOffset = 0;
            const xhr2 = xhrManager.createRequest(stream2.src, () => {
              sb.appendBuffer(xhr2.getResponseData());
              const onUpdateEnd2 = () => {
                sb.removeEventListener('updateend', onUpdateEnd2);
                expect(sb.buffered.length)
                    .withContext('Source buffer number')
                    .toBe(1);
                expect(sb.buffered.start(0)).withContext('Range start').toBe(0);
                expect(sb.buffered.end(0))
                    .toBeCloseTo(stream2.get('appendAudioOffset') as number, 0);
                done();
              };
              sb.addEventListener('updateend', onUpdateEnd2);
            }, 0, 200000);
            xhr2.send();
          };
          sb.addEventListener('updateend', onUpdateEnd);
        }, 0, 200000);
        xhr.send();
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, DEFAULT_TIMEOUT_MS);
  }

  function createAppendVideoOffsetTest(
      stream1: StreamDef, stream2: StreamDef, audioStream: StreamDef,
      mandatory = true) {
    it(`Append${stream1.codec}VideoOffset`, (done) => {
      checkMandatory(mandatory);
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        const sb = ms.addSourceBuffer(stream1.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);

        const xhr = xhrManager.createRequest(stream1.src, () => {
          sb.timestampOffset = 5;
          sb.appendBuffer(xhr.getResponseData());
          const callXhr2 = () => {
            sb.removeEventListener('update', callXhr2);
            const xhr2 = xhrManager.createRequest(stream2.src, () => {
              sb.abort();
              sb.timestampOffset = 0;
              sb.appendBuffer(xhr2.getResponseData());
              const onUpdateEnd = () => {
                sb.removeEventListener('updateend', onUpdateEnd);
                expect(sb.buffered.length)
                    .withContext('Source buffer number')
                    .toBe(1);
                expect(sb.buffered.start(0)).withContext('Range start').toBe(0);
                expect(sb.buffered.end(0))
                    .toBeCloseTo(stream2.get('videoChangeRate') as number, 0);

                const onLoadedMetadata = () => {
                  video.removeEventListener('loadedmetadata', onLoadedMetadata);
                  const onSeeked = () => {
                    video.removeEventListener('seeked', onSeeked);
                    video.addEventListener(
                        'timeupdate', function onTimeUpdate() {
                          if (!video.paused && video.currentTime >= 6) {
                            video.removeEventListener(
                                'timeupdate', onTimeUpdate);
                            done();
                          }
                        });
                  };
                  video.addEventListener('seeked', onSeeked);
                  video.currentTime = 6;
                };

                if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
                  onLoadedMetadata();
                } else {
                  video.addEventListener('loadedmetadata', onLoadedMetadata);
                }
              };
              sb.addEventListener('updateend', onUpdateEnd);
              video.play();
            }, 0, 400000);
            xhr2.send();
          };
          sb.addEventListener('update', callXhr2);
        }, 0, 200000);

        ms.duration = 100000000;
        const audioXhr = xhrManager.createRequest(audioStream.src, () => {
          audioSb.appendBuffer(audioXhr.getResponseData());
          xhr.send();
        });
        audioXhr.send();
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, DEFAULT_TIMEOUT_MS);
  }

  function createAppendMultipleInitTest(
      stream: StreamDef, unused_stream: StreamDef, mandatory = true) {
    it(`AppendMultipleInit${stream.codec}${
           legacyYtsUtils.makeCapitalName(stream.mediatype)}`,
        (done) => {
          checkMandatory(mandatory);
          const ms = new MediaSource();
          video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

          const onSourceOpen = () => {
            ms.removeEventListener('sourceopen', onSourceOpen);
            const xhrManager = new XhrManager();
            const chain = new FileSource(
                stream.src, xhrManager, timeoutManager, 0, stream.fileSize,
                stream.fileSize);
            const src = ms.addSourceBuffer(stream.mimetype);
            ms.addSourceBuffer(unused_stream.mimetype);

            chain.init(0, (buf) => {
              const init = buf as Uint8Array;
              chain.pull((buf) => {
                let chainCount = 0;
                const firstAppend = () => {
                  if (chainCount < 10) {
                    chainCount++;
                    src.appendBuffer(init);
                  } else {
                    src.removeEventListener('update', firstAppend);
                    const abortAppend = () => {
                      src.removeEventListener('update', abortAppend);
                      src.abort();
                      const end = src.buffered.end(0);

                      let secondChainCount = 0;
                      const secondAppend = () => {
                        if (secondChainCount < 10) {
                          secondChainCount++;
                          src.appendBuffer(init);
                        } else {
                          src.removeEventListener('update', secondAppend);
                          expect(src.buffered.end(0))
                              .withContext('Range end')
                              .toBeCloseTo(end, 0);
                          done();
                        }
                      };
                      src.addEventListener('update', secondAppend);
                      secondAppend();
                    };
                    src.addEventListener('update', abortAppend);
                    src.appendBuffer(buf as Uint8Array);
                  }
                };
                src.addEventListener('update', firstAppend);
                firstAppend();
              });
            });
          };
          ms.addEventListener('sourceopen', onSourceOpen);
        },
        DEFAULT_TIMEOUT_MS);
  }

  function createAppendOutOfOrderTest(
      stream: StreamDef, unused_stream: StreamDef, mandatory = true) {
    it(`Append${stream.codec}${
           legacyYtsUtils.makeCapitalName(stream.mediatype)}OutOfOrder`,
        (done) => {
          checkMandatory(mandatory);
          const ms = new MediaSource();
          video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

          const onSourceOpen = () => {
            ms.removeEventListener('sourceopen', onSourceOpen);
            const xhrManager = new XhrManager();
            const chain =
                new FileSource(stream.src, xhrManager, timeoutManager);
            const sb = ms.addSourceBuffer(stream.mimetype);
            ms.addSourceBuffer(unused_stream.mimetype);
            const bufs: Uint8Array[] = [];

            const appendOrder = [0, 2, 1, 4, 3];
            const bufferedLength = [0, 1, 1, 2, 1];
            let i = 0;

            const onUpdateEnd = () => {
              expect(sb.buffered.length)
                  .withContext('Source buffer number')
                  .toBe(bufferedLength[i]);
              if (i === 1) {
                expect(sb.buffered.start(0))
                    .withContext('Range start')
                    .toBeGreaterThan(0);
              } else if (i > 0) {
                expect(sb.buffered.start(0)).withContext('Range start').toBe(0);
              }

              i++;
              if (i >= bufs.length) {
                sb.removeEventListener('updateend', onUpdateEnd);
                done();
              } else {
                sb.appendBuffer(bufs[appendOrder[i]]);
              }
            };
            sb.addEventListener('updateend', onUpdateEnd);

            chain.init(0, (buf) => {
              bufs.push(buf as Uint8Array);
              chain.pull((buf) => {
                bufs.push(buf as Uint8Array);
                chain.pull((buf) => {
                  bufs.push(buf as Uint8Array);
                  chain.pull((buf) => {
                    bufs.push(buf as Uint8Array);
                    chain.pull((buf) => {
                      bufs.push(buf as Uint8Array);
                      sb.appendBuffer(bufs[0]);
                    });
                  });
                });
              });
            });
          };
          ms.addEventListener('sourceopen', onSourceOpen);
        },
        DEFAULT_TIMEOUT_MS);
  }

  function createBufferedRangeTest(
      stream: StreamDef, unused_stream: StreamDef, mandatory = true) {
    it(`BufferedRange${stream.codec}${
           legacyYtsUtils.makeCapitalName(stream.mediatype)}`,
        (done) => {
          checkMandatory(mandatory);
          const ms = new MediaSource();
          video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

          const onSourceOpen = () => {
            ms.removeEventListener('sourceopen', onSourceOpen);
            const xhrManager = new XhrManager();
            const chain = new ResetInit(
                new FileSource(stream.src, xhrManager, timeoutManager));
            const sb = ms.addSourceBuffer(stream.mimetype);
            ms.addSourceBuffer(unused_stream.mimetype);

            expect(sb.buffered.length)
                .withContext('Count of buffered ranges initial')
                .toBe(0);
            appendInit(video, sb, chain, 0, () => {
              expect(sb.buffered.length)
                  .withContext('Count of buffered ranges after init')
                  .toBe(0);
              appendUntil(timeoutManager, video, sb, chain, 5, () => {
                expect(sb.buffered.length)
                    .withContext('Count of buffered ranges after append')
                    .toBe(1);
                expect(sb.buffered.start(0))
                    .withContext('Buffered range start')
                    .toBe(0);
                expect(sb.buffered.end(0))
                    .withContext('Buffered range end')
                    .toBeGreaterThanOrEqual(5);
                done();
              });
            });
          };
          ms.addEventListener('sourceopen', onSourceOpen);
        },
        DEFAULT_TIMEOUT_MS);
  }

  function createOverlapTest(
      stream: StreamDef, unused_stream: StreamDef, mandatory = true) {
    it(`${stream.codec}${
           legacyYtsUtils.makeCapitalName(stream.mediatype)}WithOverlap`,
        (done) => {
          checkMandatory(mandatory);
          const ms = new MediaSource();
          video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

          const onSourceOpen = () => {
            ms.removeEventListener('sourceopen', onSourceOpen);
            const xhrManager = new XhrManager();
            const chain = new ResetInit(
                new FileSource(stream.src, xhrManager, timeoutManager));
            const sb = ms.addSourceBuffer(stream.mimetype);
            ms.addSourceBuffer(unused_stream.mimetype);
            const GAP = 0.1;

            appendInit(video, sb, chain, 0, () => {
              chain.pull((buf) => {
                const appendOuter = () => {
                  sb.removeEventListener('update', appendOuter);
                  expect(sb.buffered.length)
                      .withContext('Source buffer number')
                      .toBe(1);
                  const segmentDuration = sb.buffered.end(0);
                  sb.timestampOffset = segmentDuration - GAP;
                  chain.seek(0);
                  chain.pull((buf) => {
                    const appendMiddle = () => {
                      sb.removeEventListener('update', appendMiddle);
                      chain.pull((buf) => {
                        const appendInner = () => {
                          sb.removeEventListener('update', appendInner);
                          expect(sb.buffered.length)
                              .withContext('Source buffer number')
                              .toBe(1);
                          expect(sb.buffered.end(0))
                              .withContext('Range end')
                              .toBeCloseTo(segmentDuration * 2 - GAP, 0);
                          done();
                        };
                        sb.addEventListener('update', appendInner);
                        sb.appendBuffer(buf as Uint8Array);
                      });
                    };
                    sb.addEventListener('update', appendMiddle);
                    sb.appendBuffer(buf as Uint8Array);
                  });
                };
                sb.addEventListener('update', appendOuter);
                sb.appendBuffer(buf as Uint8Array);
              });
            });
          };
          ms.addEventListener('sourceopen', onSourceOpen);
        },
        DEFAULT_TIMEOUT_MS);
  }

  function createSmallGapTest(
      stream: StreamDef, unused_stream: StreamDef, mandatory = true) {
    it(`${stream.codec}${
           legacyYtsUtils.makeCapitalName(stream.mediatype)}WithSmallGap`,
        (done) => {
          checkMandatory(mandatory);
          const ms = new MediaSource();
          video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

          const onSourceOpen = () => {
            ms.removeEventListener('sourceopen', onSourceOpen);
            const xhrManager = new XhrManager();
            const chain = new ResetInit(
                new FileSource(stream.src, xhrManager, timeoutManager));
            const sb = ms.addSourceBuffer(stream.mimetype);
            ms.addSourceBuffer(unused_stream.mimetype);
            const GAP = 0.01;

            appendInit(video, sb, chain, 0, () => {
              chain.pull((buf) => {
                const appendOuter = () => {
                  sb.removeEventListener('update', appendOuter);
                  expect(sb.buffered.length)
                      .withContext('Source buffer number')
                      .toBe(1);
                  const segmentDuration = sb.buffered.end(0);
                  sb.timestampOffset = segmentDuration + GAP;
                  chain.seek(0);
                  chain.pull((buf) => {
                    const appendMiddle = () => {
                      sb.removeEventListener('update', appendMiddle);
                      chain.pull((buf) => {
                        const appendInner = () => {
                          sb.removeEventListener('update', appendInner);
                          expect(sb.buffered.length)
                              .withContext('Source buffer number')
                              .toBe(1);
                          expect(sb.buffered.end(0))
                              .withContext('Range end')
                              .toBeCloseTo(segmentDuration * 2 + GAP, 0);
                          done();
                        };
                        sb.addEventListener('update', appendInner);
                        sb.appendBuffer(buf as Uint8Array);
                      });
                    };
                    sb.addEventListener('update', appendMiddle);
                    sb.appendBuffer(buf as Uint8Array);
                  });
                };
                sb.addEventListener('update', appendOuter);
                sb.appendBuffer(buf as Uint8Array);
              });
            });
          };
          ms.addEventListener('sourceopen', onSourceOpen);
        },
        DEFAULT_TIMEOUT_MS);
  }

  function createLargeGapTest(
      stream: StreamDef, unused_stream: StreamDef, mandatory = true) {
    it(`${stream.codec}${
           legacyYtsUtils.makeCapitalName(stream.mediatype)}WithLargeGap`,
        (done) => {
          checkMandatory(mandatory);
          const ms = new MediaSource();
          video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

          const onSourceOpen = () => {
            ms.removeEventListener('sourceopen', onSourceOpen);
            const xhrManager = new XhrManager();
            const chain = new ResetInit(
                new FileSource(stream.src, xhrManager, timeoutManager));
            const sb = ms.addSourceBuffer(stream.mimetype);
            ms.addSourceBuffer(unused_stream.mimetype);
            const GAP = 0.3;

            appendInit(video, sb, chain, 0, () => {
              chain.pull((buf) => {
                const appendOuter = () => {
                  sb.removeEventListener('update', appendOuter);
                  expect(sb.buffered.length)
                      .withContext('Source buffer number')
                      .toBe(1);
                  const segmentDuration = sb.buffered.end(0);
                  sb.timestampOffset = segmentDuration + GAP;
                  chain.seek(0);
                  chain.pull((buf) => {
                    const appendMiddle = () => {
                      sb.removeEventListener('update', appendMiddle);
                      chain.pull((buf) => {
                        const appendInner = () => {
                          sb.removeEventListener('update', appendInner);
                          expect(sb.buffered.length)
                              .withContext('Source buffer number')
                              .toBe(2);
                          done();
                        };
                        sb.addEventListener('update', appendInner);
                        sb.appendBuffer(buf as Uint8Array);
                      });
                    };
                    sb.addEventListener('update', appendMiddle);
                    sb.appendBuffer(buf as Uint8Array);
                  });
                };
                sb.addEventListener('update', appendOuter);
                sb.appendBuffer(buf as Uint8Array);
              });
            });
          };
          ms.addEventListener('sourceopen', onSourceOpen);
        },
        DEFAULT_TIMEOUT_MS);
  }

  /**
   * Test if we can play properly when there is not enough audio or video data.
   * @param delayed The delayed stream definition.
   * @param nonDelayed The non-delayed stream definition.
   * @param mandatory Whether the test is mandatory.
   */
  function createDelayedTest(
      delayed: StreamDef, nonDelayed: StreamDef, mandatory = true) {
    it(`Delayed${delayed.codec}${
           legacyYtsUtils.makeCapitalName(delayed.mediatype)}`,
        (done) => {
          checkMandatory(mandatory);
          const ms = new MediaSource();
          video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

          const onSourceOpen = () => {
            ms.removeEventListener('sourceopen', onSourceOpen);
            const xhrManager = new XhrManager();
            let underflowTime = 0.0;
            if (delayed.mediatype === 'video') {
              underflowTime = 3.0;
            }

            const chain = new FixedAppendSize(
                new ResetInit(
                    new FileSource(nonDelayed.src, xhrManager, timeoutManager)),
                16384);
            const src = ms.addSourceBuffer(nonDelayed.mimetype);
            const delayedChain = new FixedAppendSize(
                new ResetInit(
                    new FileSource(delayed.src, xhrManager, timeoutManager)),
                16384);
            const delayedSrc = ms.addSourceBuffer(delayed.mimetype);

            const ontimeupdate = () => {
              if (!video.paused) {
                const end = delayedSrc.buffered.end(0);
                expect(video.currentTime)
                    .withContext(
                        `media.currentTime (readyState=${video.readyState})`)
                    .toBeLessThanOrEqual(end + 1.0 + underflowTime);
              }
            };

            console.log(
                `[DelayedTest] Append 15 seconds of non-delayed stream: ${
                    nonDelayed.mimetype}`);
            appendUntil(timeoutManager, video, src, chain, 15, () => {
              console.log(`[DelayedTest] Append 8 seconds of delayed stream: ${
                  delayed.mimetype}`);
              appendUntil(
                  timeoutManager, video, delayedSrc, delayedChain, 8, () => {
                    const end = delayedSrc.buffered.end(0);
                    console.log(`[DelayedTest] Start play when there is only ${
                        end} seconds of ${delayed.codec} data.`);
                    video.play();
                    video.addEventListener('timeupdate', ontimeupdate);

                    console.log(`[DelayedTest] Play until ${
                        end + underflowTime} seconds.`);
                    waitUntil(
                        timeoutManager, video, end + underflowTime, () => {
                          video.removeEventListener('timeupdate', ontimeupdate);
                          console.log('[DelayedTest] Verify currentTime');
                          expect(video.currentTime)
                              .withContext('media.currentTime')
                              .toBeLessThanOrEqual(end + 1.0 + underflowTime);
                          expect(video.currentTime)
                              .withContext('media.currentTime')
                              .toBeGreaterThan(end - 1.0 - underflowTime);
                          done();
                        });
                  });
            });
          };
          ms.addEventListener('sourceopen', onSourceOpen);
        },
        DEFAULT_TIMEOUT_MS);
  }

  function createSingleSourceBufferPlaybackTest(
      stream: StreamDef, mandatory = true) {
    it(`PlaybackOnly${stream.codec}${
           legacyYtsUtils.makeCapitalName(stream.mediatype)}`,
        (done) => {
          checkMandatory(mandatory);
          const ms = new MediaSource();
          video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

          const onSourceOpen = () => {
            ms.removeEventListener('sourceopen', onSourceOpen);
            const xhrManager = new XhrManager();
            const sb = ms.addSourceBuffer(stream.mimetype);

            const xhr = xhrManager.createRequest(stream.src, () => {
              sb.appendBuffer(xhr.getResponseData());
              video.addEventListener('timeupdate', function onTimeUpdate() {
                if (video.currentTime > 5) {
                  video.removeEventListener('timeupdate', onTimeUpdate);
                  done();
                }
              });
              video.play();
            }, 0, 300000);
            xhr.send();
          };
          ms.addEventListener('sourceopen', onSourceOpen);
        },
        DEFAULT_TIMEOUT_MS);
  }

  function createDASHLatencyTest(
      videoStream: StreamDef, audioStream: StreamDef, mandatory = true) {
    it(`DASHLatency${videoStream.codec}`, (done) => {
      checkMandatory(mandatory);
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);

        const videoXhr = xhrManager.createRequest(videoStream.src, () => {
          const videoContent = videoXhr.getResponseData();
          let expectedTime = 0;
          let loopCount = 0;

          const onBufferFull = () => {
            const newContentStartTime = videoSb.buffered.start(0) + 2;
            video.addEventListener('timeupdate', function onTimeUpdate() {
              if (video.currentTime > newContentStartTime + 1) {
                video.removeEventListener('timeupdate', onTimeUpdate);
                done();
              }
            });
            video.play();
          };

          const onUpdate = () => {
            expectedTime += videoStream.duration;
            videoSb.timestampOffset = expectedTime;
            loopCount++;

            if (loopCount > 300) {
              videoSb.removeEventListener('update', onUpdate);
              fail('Failed to fill up source buffer');
              done();
              return;
            }

            if (expectedTime > videoSb.buffered.end(0) + 1.0) {
              videoSb.removeEventListener('update', onUpdate);
              onBufferFull();
            }
            try {
              videoSb.appendBuffer(videoContent);
              // Preserving legacy test behavior as-is.
              // tslint:disable-next-line:no-any
            } catch (e: any) {
              videoSb.removeEventListener('update', onUpdate);
              if (e.code === 22 || e.name === 'QuotaExceededError') {
                onBufferFull();
              } else {
                fail(e);
                done();
              }
            }
          };
          videoSb.addEventListener('update', onUpdate);
          videoSb.appendBuffer(videoContent);
        });

        const audioXhr = xhrManager.createRequest(audioStream.src, () => {
          audioSb.appendBuffer(audioXhr.getResponseData());
          videoXhr.send();
        });
        audioXhr.send();
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, DEFAULT_TIMEOUT_MS);
  }

  function createVideoDimensionTest(
      videoStream: StreamDef, audioStream: StreamDef, mandatory = true) {
    it(`VideoDimension${videoStream.codec}`, (done) => {
      checkMandatory(mandatory);
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);

        expect(video.videoWidth).withContext('videoWidth').toBe(0);
        expect(video.videoHeight).withContext('videoHeight').toBe(0);

        let totalSuccess = 0;
        function checkSuccess() {
          totalSuccess++;
          if (totalSuccess === 2) done();
        }

        const onLoadedMetadata = () => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          expect(video.videoWidth).withContext('videoWidth loaded').toBe(640);
          expect(video.videoHeight).withContext('videoHeight loaded').toBe(360);
          checkSuccess();
        };
        video.addEventListener('loadedmetadata', onLoadedMetadata);

        const audioXhr = xhrManager.createRequest(audioStream.src, () => {
          audioSb.appendBuffer(audioXhr.getResponseData());
          appendInit(
              video, videoSb,
              new FileSource(videoStream.src, xhrManager, timeoutManager), 0,
              checkSuccess);
        });
        audioXhr.send();
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, DEFAULT_TIMEOUT_MS);
  }

  /**
   * Test if the playback state transition is correct.
   * @param stream The stream to test.
   * @param mandatory Whether the test is mandatory.
   */
  function createPlaybackStateTest(stream: StreamDef, mandatory = true) {
    it(`PlaybackState${stream.codec}`, (done) => {
      checkMandatory(mandatory);
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        const audioStream = AAC['AudioTiny'];
        const videoSb = ms.addSourceBuffer(stream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);
        const videoChain = new ResetInit(new FixedAppendSize(
            new FileSource(stream.src, xhrManager, timeoutManager), 65536));
        const audioChain = new ResetInit(new FixedAppendSize(
            new FileSource(audioStream.src, xhrManager, timeoutManager),
            65536));

        console.log('[PlaybackState] Play media without appending data');
        video.play();
        expect(video.currentTime).withContext('media.currentTime').toBe(0);
        console.log('[PlaybackState] Pause media');
        video.pause();
        expect(video.currentTime).withContext('media.currentTime').toBe(0);

        console.log('[PlaybackState] Append initial audio segment');
        appendInit(video, audioSb, audioChain, 0, () => {
          console.log('[PlaybackState] Append initial video segment');
          appendInit(video, videoSb, videoChain, 0, () => {
            console.log('[PlaybackState] Set up load event handler');
            const onLoadedMetadata = () => {
              video.removeEventListener('loadedmetadata', onLoadedMetadata);
              console.log(
                  '[PlaybackState] Play media with only initial segment appended');
              video.play();
              expect(video.currentTime)
                  .withContext('media.currentTime')
                  .toBe(0);
              console.log('[PlaybackState] Pause media');
              video.pause();
              expect(video.currentTime)
                  .withContext('media.currentTime')
                  .toBe(0);
              console.log(
                  '[PlaybackState] Play again in preparation for appending more data');
              video.play();

              console.log('[PlaybackState] Append 5 seconds of audio');
              appendUntil(timeoutManager, video, audioSb, audioChain, 5, () => {
                console.log('[PlaybackState] Append 5 seconds of video');
                appendUntil(timeoutManager, video, videoSb, videoChain, 5, () => {
                  console.log(
                      '[PlaybackState] Play through 2 seconds of the media');
                  playThrough(
                      timeoutManager, video, 1, 2, audioSb, audioChain, videoSb,
                      videoChain, () => {
                        console.log(
                            '[PlaybackState] Capturing current time right before pausing');
                        const time = video.currentTime;
                        video.pause();
                        console.log(
                            '[PlaybackState] Current time after pause should be the same as the captured time before pause');
                        expect(video.currentTime)
                            .withContext('media.currentTime')
                            .toBeCloseTo(time, 0);
                        done();
                      });
                });
              });
            };

            if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
              onLoadedMetadata();
            } else {
              video.addEventListener('loadedmetadata', onLoadedMetadata);
            }
          });
        });
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, DEFAULT_TIMEOUT_MS);
  }

  function createPlayPartialSegmentTest(stream: StreamDef, mandatory = true) {
    it(`PlayPartial${stream.codec}Segment`, (done) => {
      checkMandatory(mandatory);
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        const audioStream = AAC['AudioTiny'];
        const videoSb = ms.addSourceBuffer(stream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);

        const videoXhr = xhrManager.createRequest(stream.src, () => {
          videoSb.appendBuffer(videoXhr.getResponseData());
          video.addEventListener('timeupdate', function onTimeUpdate() {
            if (!video.paused && video.currentTime >= 2) {
              video.removeEventListener('timeupdate', onTimeUpdate);
              done();
            }
          });
          video.play();
        }, 0, 1500000);

        const audioXhr = xhrManager.createRequest(audioStream.src, () => {
          audioSb.appendBuffer(audioXhr.getResponseData());
          videoXhr.send();
        }, 0, 500000);
        audioXhr.send();
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, DEFAULT_TIMEOUT_MS);
  }

  /**
   * Test if the duration on MediaSource can be set and retrieved successfully.
   * @param videoStream The video stream definition.
   * @param audioStream The audio stream definition.
   * @param mandatory Whether the test is mandatory.
   */
  function createMediaSourceDurationTest(
      videoStream: StreamDef, audioStream: StreamDef, mandatory = true) {
    it(`MediaSourceDuration${videoStream.codec}`, (done) => {
      checkMandatory(mandatory);
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        const videoFileSource =
            new FileSource(videoStream.src, xhrManager, timeoutManager);
        const videoChain = new ResetInit(videoFileSource);
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);

        const onsourceclose = () => {
          console.log('[MediaSourceDuration] onsourceclose called');
          expect(Number.isNaN(ms.duration))
              .withContext('Duration is NaN on close')
              .toBeTrue();
          done();
        };

        const appendVideo = () => {
          expect(Number.isNaN(video.duration))
              .withContext('Initial media duration not NaN')
              .toBeTrue();
          console.log(
              '[MediaSourceDuration] Play media in anticipation of incoming video data');
          video.play();
          console.log('[MediaSourceDuration] Append video init segment');
          appendInit(video, videoSb, videoChain, 0, () => {
            const duration1 = videoFileSource.segs![1].time;
            const duration2 = videoFileSource.segs![2].time;
            const eps = 0.01;
            console.log(`[MediaSourceDuration] Append video until ${
                duration2} seconds`);
            appendUntil(timeoutManager, video, videoSb, videoChain, duration2, () => {
              console.log(
                  `[MediaSourceDuration] Set media duration to ${duration1}`);
              setDuration(duration1, ms, [videoSb, audioSb], () => {
                checkApproxEq(ms.duration, duration1, eps);
                checkApproxEq(video.duration, duration1, eps);
                expect(videoSb.buffered.end(0))
                    .withContext('Range end')
                    .toBeLessThanOrEqual(duration1 + 0.1);

                console.log('[MediaSourceDuration] Abort video source buffer');
                videoSb.abort();
                console.log('[MediaSourceDuration] Reset video source chain');
                videoChain.seek(0);
                console.log('[MediaSourceDuration] Append video init segment');
                appendInit(video, videoSb, videoChain, 0, () => {
                  console.log(`[MediaSourceDuration] Append video until ${
                      duration2} seconds`);
                  appendUntil(
                      timeoutManager, video, videoSb, videoChain, duration2,
                      () => {
                        checkApproxEq(ms.duration, duration2, eps);
                        console.log(
                            `[MediaSourceDuration] Set media duration to ${
                                duration1}`);
                        setDuration(duration1, ms, [videoSb, audioSb], () => {
                          if (videoSb.updating) {
                            fail(
                                'Source buffer is updating on duration change');
                            done();
                            return;
                          }
                          const duration = videoSb.buffered.end(0);
                          console.log(
                              '[MediaSourceDuration] Force end of stream');
                          ms.endOfStream();
                          checkApproxEq(ms.duration, duration, eps);

                          const onSourceEnded = () => {
                            ms.removeEventListener(
                                'sourceended', onSourceEnded);
                            console.log(
                                '[MediaSourceDuration] Caught sourceended event');
                            checkApproxEq(ms.duration, duration, eps);
                            checkApproxEq(video.duration, duration, eps);
                            ms.addEventListener('sourceclose', onsourceclose);
                            video.removeAttribute('src');
                            video.load();
                          };
                          ms.addEventListener('sourceended', onSourceEnded);
                          video.play();
                        });
                      });
                });
              });
            });
          });
        };

        console.log('[MediaSourceDuration] Fetch audio stream');
        const audioXhr = xhrManager.createRequest(audioStream.src, () => {
          const onAudioUpdate = () => {
            audioSb.removeEventListener('updateend', onAudioUpdate);
            console.log('[MediaSourceDuration] Append video stream');
            appendVideo();
          };
          audioSb.addEventListener('updateend', onAudioUpdate);
          audioSb.appendBuffer(audioXhr.getResponseData());
        });
        audioXhr.send();
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, DEFAULT_TIMEOUT_MS);
  }

  /**
   * Test if we can seek during playing.
   * @param videoStream The video stream definition.
   * @param mandatory Whether the test is mandatory.
   */
  function createSeekTest(videoStream: StreamDef, mandatory = true) {
    it(`Seek${videoStream.codec}`, (done) => {
      checkMandatory(mandatory);
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        const audioStream = AAC['AudioNormal'];
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);
        const videoChain = new ResetInit(
            new FileSource(videoStream.src, xhrManager, timeoutManager));
        const audioChain = new ResetInit(
            new FileSource(audioStream.src, xhrManager, timeoutManager));

        ms.duration = 100000000;

        console.log('[SeekTest] Appending 20s of video');
        appendUntil(timeoutManager, video, videoSb, videoChain, 20, () => {
          console.log('[SeekTest] Appending 20s of audio');
          appendUntil(timeoutManager, video, audioSb, audioChain, 20, () => {
            console.log('[SeekTest] Seek to 17s');

            const onLoadedMetadata = () => {
              video.removeEventListener('loadedmetadata', onLoadedMetadata);
              video.currentTime = 17;
              console.log('[SeekTest] Play media');
              video.play();

              playThrough(
                  timeoutManager, video, 10, 19, videoSb, videoChain, audioSb,
                  audioChain, () => {
                    expect(video.currentTime)
                        .withContext('currentTime')
                        .toBeGreaterThanOrEqual(19);
                    console.log('[SeekTest] Seek to 28s, 53s, 58s');
                    video.currentTime = 53;
                    video.currentTime = 58;

                    playThrough(
                        timeoutManager, video, 10, 60, videoSb, videoChain,
                        audioSb, audioChain, () => {
                          expect(video.currentTime)
                              .withContext('currentTime')
                              .toBeGreaterThanOrEqual(60);
                          console.log('[SeekTest] Seek to 7s, 0s, 7s');
                          video.currentTime = 0;
                          video.currentTime = 7;
                          videoChain.seek(7, videoSb);
                          audioChain.seek(7, audioSb);

                          playThrough(
                              timeoutManager, video, 10, 9, videoSb, videoChain,
                              audioSb, audioChain, () => {
                                expect(video.currentTime)
                                    .withContext('currentTime')
                                    .toBeGreaterThanOrEqual(9);
                                done();
                              });
                        });
                  });
            };

            if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
              onLoadedMetadata();
            } else {
              video.addEventListener('loadedmetadata', onLoadedMetadata);
            }
          });
        });
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, DEFAULT_TIMEOUT_MS);
  }

  /**
   * Test loop functionality.
   * @param videoStream The video stream definition.
   * @param mandatory Whether the test is mandatory.
   */
  function createLoopTest(videoStream: StreamDef, mandatory = true) {
    it(`Loop${videoStream.codec}`, (done) => {
      checkMandatory(mandatory);
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        const audioStream = AAC['AudioShorts'];
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);
        let loopCount = 0;

        const videoXhr = xhrManager.createRequest(videoStream.src, () => {
          const onUpdate = () => {
            videoSb.removeEventListener('updateend', onUpdate);
            console.log(
                '[LoopTest] Video buffer update done, calling endOfStream');
            ms.endOfStream();
            console.log('[LoopTest] Play media');
            video.play();
          };
          videoSb.addEventListener('updateend', onUpdate);
          console.log('[LoopTest] Append video buffer');
          videoSb.appendBuffer(videoXhr.getResponseData());
        });

        const audioXhr = xhrManager.createRequest(audioStream.src, () => {
          const onAudioUpdate = () => {
            audioSb.removeEventListener('updateend', onAudioUpdate);
            console.log('[LoopTest] Audio buffer update done, fetching video');
            videoXhr.send();
          };
          audioSb.addEventListener('updateend', onAudioUpdate);
          console.log('[LoopTest] Append audio buffer');
          audioSb.appendBuffer(audioXhr.getResponseData());
        });

        video.loop = true;
        let lastMediaTime = video.currentTime;
        let timeupdateCount = 0;
        video.addEventListener('timeupdate', function onTimeUpdate() {
          if (++timeupdateCount % 10 === 0) {
            console.log(`[LoopTest] video.currentTime = ${video.currentTime}`);
          }
          if (!video.paused && video.currentTime < lastMediaTime) {
            console.log(`[LoopTest] Detected loop #${++loopCount}`);
            if (loopCount >= 10) {
              video.removeEventListener('timeupdate', onTimeUpdate);
              done();
            }
          }
          lastMediaTime = video.currentTime;
        });

        console.log('[LoopTest] Fetch audio stream');
        audioXhr.send();
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, EXTENDED_TIMEOUT_MS);
  }

  /**
   * Play to the end and seek.
   * @param videoStream The video stream definition.
   * @param mandatory Whether the test is mandatory.
   * @param seekBack Whether to seek back to 0.
   */
  function createLoopAfterEnded(
      videoStream: StreamDef, mandatory = true, seekBack = true) {
    const testName =
        `LoopAfterEnded${seekBack ? '' : 'NoSeek'}${videoStream.codec}`;
    it(testName, (done) => {
      checkMandatory(mandatory);
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        const audioStream = AAC['AudioShorts'];
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);

        const onVideoUpdate = () => {
          console.log('[LoopAfterEnded] Video buffer update done');
          videoSb.removeEventListener('updateend', onVideoUpdate);

          const onEnded = () => {
            console.log('[LoopAfterEnded] video ended');
            video.removeEventListener('ended', onEnded);
            if (seekBack) {
              console.log('[LoopAfterEnded] Seek back to 0');
              video.currentTime = 0;
            }

            video.addEventListener('timeupdate', function onTimeUpdate() {
              if (!video.paused && video.currentTime > 1) {
                video.removeEventListener('timeupdate', onTimeUpdate);
                done();
              }
            });
            console.log('[LoopAfterEnded] Replay media');
            video.play();
          };
          video.addEventListener('ended', onEnded);

          console.log('[LoopAfterEnded] Calling endOfStream');
          ms.endOfStream();
          console.log('[LoopAfterEnded] Play media');
          video.play();
        };

        const videoXhr = xhrManager.createRequest(videoStream.src, () => {
          console.log('[LoopAfterEnded] onload called for video stream');
          videoSb.addEventListener('updateend', onVideoUpdate);
          console.log('[LoopAfterEnded] Append video buffer');
          videoSb.appendBuffer(videoXhr.getResponseData());
        });

        const audioXhr = xhrManager.createRequest(audioStream.src, () => {
          console.log('[LoopAfterEnded] onload called for audio stream');
          const onAudioUpdate = () => {
            audioSb.removeEventListener('updateend', onAudioUpdate);
            console.log('[LoopAfterEnded] Fetch video stream');
            videoXhr.send();
          };
          audioSb.addEventListener('updateend', onAudioUpdate);
          console.log('[LoopAfterEnded] Append audio buffer');
          audioSb.appendBuffer(audioXhr.getResponseData());
        });

        console.log('[LoopAfterEnded] Fetch audio stream');
        audioXhr.send();
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, DEFAULT_TIMEOUT_MS);
  }

  /**
   * Seek into and out of a buffered region.
   * @param videoStream The video stream definition.
   * @param mandatory Whether the test is mandatory.
   */
  function createBufUnbufSeekTest(videoStream: StreamDef, mandatory = true) {
    it(`BufUnbufSeek${videoStream.codec}`, (done) => {
      checkMandatory(mandatory);
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        const audioStream = AAC['AudioNormal'];
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(audioStream.mimetype);

        const duration = 100000000;
        console.log(`[BufUnbufSeek] Set duration to ${
            duration} so we can seek to any position.`);
        ms.duration = duration;

        const xhr = xhrManager.createRequest(videoStream.src, () => {
          console.log('[BufUnbufSeek] Append video buffer');
          videoSb.appendBuffer(xhr.getResponseData());

          const xhr2 = xhrManager.createRequest(audioStream.src, () => {
            console.log('[BufUnbufSeek] Append audio buffer');
            audioSb.appendBuffer(xhr2.getResponseData());

            const onLoadedMetadata = () => {
              video.removeEventListener('loadedmetadata', onLoadedMetadata);
              const numExpectedLoops = 30;
              let i = 0;

              const loop = () => {
                if (i > numExpectedLoops) {
                  console.log(
                      '[BufUnbufSeek] Seek to t=1.005 and let the test finish');
                  video.currentTime = 1.005;
                  const onTimeUpdate = () => {
                    if (!video.paused && video.currentTime > 3) {
                      video.removeEventListener('timeupdate', onTimeUpdate);
                      done();
                    }
                  };
                  video.addEventListener('timeupdate', onTimeUpdate);
                  return;
                }
                const seekTarget = (i++ % 2) * 1.0e6 + 1;
                console.log(`[BufUnbufSeek] Seek to t=${seekTarget}`);
                video.currentTime = seekTarget;
                setTimeout(loop, 50);
              };

              console.log('[BufUnbufSeek] Play media');
              video.play();
              const onPlay = () => {
                video.removeEventListener('play', onPlay);
                loop();
              };
              video.addEventListener('play', onPlay);
            };

            if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
              onLoadedMetadata();
            } else {
              video.addEventListener('loadedmetadata', onLoadedMetadata);
            }
          }, 0, 100000);
          xhr2.send();
        }, 0, 1000000);
        xhr.send();
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, DEFAULT_TIMEOUT_MS);
  }

  function createIAMFPlaybackTest(stream: StreamDef, mandatory = true) {
    it(stream.customMap?.['testDisplayName'] as string ||
           `IAMFPlayback${stream.codec}`,
       (done) => {
         checkMandatory(mandatory);
         const ms = new MediaSource();
         video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

         const onSourceOpen = () => {
           ms.removeEventListener('sourceopen', onSourceOpen);
           const xhrManager = new XhrManager();
           const videoSb = ms.addSourceBuffer(stream.mimetype);

           const xhr = xhrManager.createRequest(stream.src, () => {
             videoSb.appendBuffer(xhr.getResponseData());
             video.addEventListener('timeupdate', function onTimeUpdate() {
               if (video.currentTime > 5) {
                 video.removeEventListener('timeupdate', onTimeUpdate);
                 done();
               }
             });
             video.play();
           }, 0, 900000);
           xhr.send();
         };
         ms.addEventListener('sourceopen', onSourceOpen);
       },
       DEFAULT_TIMEOUT_MS);
  }

  function createAAC256kPlaybackTest(stream: StreamDef, mandatory = true) {
    it('AAC256kbpsPlayback', (done) => {
      checkMandatory(mandatory);
      const ms = new MediaSource();
      video.src = playbackUtil.createMediaSourceUrlFromSource(ms);

      const onSourceOpen = () => {
        ms.removeEventListener('sourceopen', onSourceOpen);
        const xhrManager = new XhrManager();
        const videoStream = H264['VideoNormal'];
        const videoSb = ms.addSourceBuffer(videoStream.mimetype);
        const audioSb = ms.addSourceBuffer(stream.mimetype);

        const audioXhr = xhrManager.createRequest(stream.src, () => {
          audioSb.appendBuffer(audioXhr.getResponseData());
          const videoXhr = xhrManager.createRequest(videoStream.src, () => {
            videoSb.appendBuffer(videoXhr.getResponseData());
            video.addEventListener('timeupdate', function onTimeUpdate() {
              if (video.currentTime > 60) {
                video.removeEventListener('timeupdate', onTimeUpdate);
                done();
              }
            });
            video.play();
          }, 0, 10000000);
          videoXhr.send();
        }, 0, 10000000);
        audioXhr.send();
      };
      ms.addEventListener('sourceopen', onSourceOpen);
    }, EXTENDED_TIMEOUT_MS);
  }


  // --- Test Invocations ---

  describe('MSE (Opus)', () => {
    createAppendTest(Opus['SantaHigh'], H264['Video1MB']);
    createAbortTest(Opus['SantaHigh'], H264['Video1MB']);
    createTimestampOffsetTest(Opus['CarLow'], H264['Video1MB']);
    createDurationAfterAppendTest(Opus['CarLow'], H264['Video1MB']);
    createPausedTest(Opus['CarLow']);
    createIncrementalAudioTest(Opus['CarMed']);
    createLimitedAudioTest(Opus['CarMed']);
    createIncrementalLimitedAudioTest(Opus['CarMed']);
    createIncrementalLimitedAudioTest(Opus['CarMed'], true);
    createAppendAudioOffsetTest(Opus['CarMed'], Opus['CarHigh']);
    createAppendMultipleInitTest(Opus['CarLow'], H264['Video1MB']);
    createAppendOutOfOrderTest(Opus['CarMed'], H264['Video1MB']);
    createBufferedRangeTest(Opus['CarMed'], H264['Video1MB']);
    createOverlapTest(Opus['CarMed'], H264['Video1MB']);
    createSmallGapTest(Opus['CarMed'], H264['Video1MB']);
    createLargeGapTest(Opus['CarMed'], H264['Video1MB']);
    createDelayedTest(Opus['CarMed'], H264['VideoNormal']);
    createSingleSourceBufferPlaybackTest(Opus['SantaHigh']);
  });

  describe('MSE (AC3)', () => {
    createSingleSourceBufferPlaybackTest(AC3['Audio51'], false);
  });

  describe('MSE (EAC3)', () => {
    createSingleSourceBufferPlaybackTest(EAC3['Audio51'], false);
  });

  describe('MSE (Iamf)', () => {
    createIAMFPlaybackTest(Iamf['IamfAnimationIamfOpus3oa48khz'], false);
    createIAMFPlaybackTest(
        Iamf['IamfAnimationIamfOpus3oaAndStereo48khz2mixpresentations'], false);
    createIAMFPlaybackTest(
        Iamf['IamfAnimationIamfOpus3oaAndStereo48khz'], false);
    createIAMFPlaybackTest(Iamf['IamfAnimationIamfOpus5148khz'], false);
    createIAMFPlaybackTest(Iamf['IamfAnimationIamfOpusFoa48khz'], false);
    createIAMFPlaybackTest(
        Iamf['IamfAnimationIamfOpusFoaAndStereo48khz'], false);
    createIAMFPlaybackTest(Iamf['IamfSpeechIamfOpus71448khz'], false);
    createIAMFPlaybackTest(Iamf['IamfSpeechIamfOpusStereo48khz'], false);
    createIAMFPlaybackTest(Iamf['IamfChannelTest71448khzOpusF'], false);
  });

  describe('MSE (AAC)', () => {
    createAppendTest(AAC['Audio1MB'], H264['Video1MB']);
    createAbortTest(AAC['Audio1MB'], H264['Video1MB']);
    createTimestampOffsetTest(AAC['Audio1MB'], H264['Video1MB']);
    createDurationAfterAppendTest(AAC['Audio1MB'], H264['Video1MB']);
    createPausedTest(AAC['Audio1MB']);
    createIncrementalAudioTest(AAC['AudioNormal']);
    createLimitedAudioTest(AAC['AudioNormal']);
    createIncrementalLimitedAudioTest(AAC['AudioNormal']);
    createIncrementalLimitedAudioTest(AAC['AudioNormal'], true);
    createAppendAudioOffsetTest(AAC['AudioNormal'], AAC['AudioHuge']);
    createAppendMultipleInitTest(AAC['Audio1MB'], H264['Video1MB']);
    createAppendOutOfOrderTest(AAC['AudioNormal'], H264['Video1MB']);
    createBufferedRangeTest(AAC['AudioNormal'], H264['Video1MB']);
    createOverlapTest(AAC['AudioNormal'], H264['Video1MB']);
    createSmallGapTest(AAC['AudioNormal'], H264['Video1MB']);
    createLargeGapTest(AAC['AudioNormal'], H264['Video1MB']);
    createDelayedTest(AAC['AudioNormal'], VP9['VideoNormal']);
    createSingleSourceBufferPlaybackTest(AAC['Audio1MB']);
    createAAC256kPlaybackTest(AAC['Audio256k'], false);
  });

  describe('MSE (VP9)', () => {
    createAppendTest(VP9['Video1MB'], AAC['Audio1MB']);
    createAbortTest(VP9['Video1MB'], AAC['Audio1MB']);
    createTimestampOffsetTest(VP9['Video1MB'], AAC['Audio1MB']);
    createDASHLatencyTest(VP9['VideoTiny'], AAC['Audio1MB']);
    createDurationAfterAppendTest(VP9['Video1MB'], AAC['Audio1MB']);
    createPausedTest(VP9['Video1MB']);
    createVideoDimensionTest(VP9['VideoNormal'], AAC['AudioNormal']);
    createPlaybackStateTest(VP9['VideoNormal']);
    createPlayPartialSegmentTest(VP9['VideoTiny']);
    createAppendVideoOffsetTest(
        VP9['VideoNormal'], VP9['VideoTiny'], AAC['AudioNormal']);
    createAppendMultipleInitTest(VP9['Video1MB'], AAC['Audio1MB']);
    createAppendOutOfOrderTest(VP9['VideoNormal'], AAC['AudioNormal']);
    createBufferedRangeTest(VP9['VideoNormal'], AAC['AudioNormal']);
    createMediaSourceDurationTest(VP9['VideoNormal'], AAC['AudioNormal']);
    createOverlapTest(VP9['VideoNormal'], AAC['AudioNormal']);
    createSmallGapTest(VP9['VideoNormal'], AAC['AudioNormal']);
    createLargeGapTest(VP9['VideoNormal'], AAC['AudioNormal']);
    createSeekTest(VP9['VideoNormal']);
    createLoopTest(VP9['VideoShorts']);
    createLoopAfterEnded(VP9['VideoShorts']);
    createLoopAfterEnded(VP9['VideoShorts'], true, false);
    createBufUnbufSeekTest(VP9['VideoNormal']);
    createDelayedTest(VP9['VideoNormal'], AAC['AudioNormal']);
    createSingleSourceBufferPlaybackTest(VP9['VideoTiny']);
  });

  describe('MSE (H264)', () => {
    createAppendTest(H264['Video1MB'], AAC['Audio1MB']);
    createAbortTest(H264['Video1MB'], AAC['Audio1MB']);
    createTimestampOffsetTest(H264['Video1MB'], AAC['Audio1MB']);
    createDASHLatencyTest(H264['VideoTiny'], AAC['Audio1MB']);
    createDurationAfterAppendTest(H264['Video1MB'], AAC['Audio1MB']);
    createPausedTest(H264['Video1MB']);
    createVideoDimensionTest(H264['VideoNormal'], AAC['Audio1MB']);
    createPlaybackStateTest(H264['VideoNormal']);
    createPlayPartialSegmentTest(H264['VideoTiny']);
    createAppendVideoOffsetTest(
        H264['VideoNormal'], H264['VideoTiny'], AAC['Audio1MB']);
    createAppendMultipleInitTest(H264['Video1MB'], AAC['Audio1MB']);
    createAppendOutOfOrderTest(H264['CarMedium'], AAC['Audio1MB']);
    createBufferedRangeTest(H264['VideoNormal'], AAC['Audio1MB']);
    createMediaSourceDurationTest(H264['VideoNormal'], AAC['Audio1MB']);
    createOverlapTest(H264['VideoNormal'], AAC['Audio1MB']);
    createSmallGapTest(H264['VideoNormal'], AAC['Audio1MB']);
    createLargeGapTest(H264['VideoNormal'], AAC['Audio1MB']);
    createSeekTest(H264['VideoNormal']);
    createLoopTest(H264['VideoShorts']);
    createLoopAfterEnded(H264['VideoShorts']);
    createLoopAfterEnded(H264['VideoShorts'], true, false);
    createBufUnbufSeekTest(H264['VideoNormal']);
    createDelayedTest(H264['VideoNormal'], AAC['AudioNormal']);
    createSingleSourceBufferPlaybackTest(H264['VideoTiny']);
  });

  describe('MSE (AV1)', () => {
    createAppendTest(AV1['Video1MB'], AAC['Audio1MB']);
    createAbortTest(AV1['Video1MB'], AAC['Audio1MB']);
    createTimestampOffsetTest(AV1['Bunny144p30fps'], AAC['Audio1MB']);
    createDASHLatencyTest(AV1['Bunny240p30fps'], AAC['Audio1MB']);
    createDurationAfterAppendTest(AV1['VideoSmall'], AAC['Audio1MB']);
    createPausedTest(AV1['Bunny144p30fps']);
    createVideoDimensionTest(AV1['Bunny360p30fps'], AAC['Audio1MB']);
    createPlaybackStateTest(AV1['Bunny360p30fps']);
    createPlayPartialSegmentTest(AV1['Bunny240p30fps']);
    createAppendVideoOffsetTest(
        AV1['Bunny360p30fps'], AV1['Bunny240p30fps'], AAC['Audio1MB']);
    createAppendMultipleInitTest(AV1['Bunny144p30fps'], AAC['Audio1MB']);
    createAppendOutOfOrderTest(AV1['Bunny360p30fps'], AAC['Audio1MB']);
    createBufferedRangeTest(AV1['Bunny360p30fps'], AAC['Audio1MB']);
    createMediaSourceDurationTest(AV1['Bunny360p30fps'], AAC['Audio1MB']);
    createOverlapTest(AV1['Bunny360p30fps'], AAC['Audio1MB']);
    createSmallGapTest(AV1['Bunny360p30fps'], AAC['Audio1MB']);
    createLargeGapTest(AV1['Bunny360p30fps'], AAC['Audio1MB']);
    createSeekTest(AV1['Bunny360p30fps']);
    createBufUnbufSeekTest(AV1['Bunny360p30fps']);
    createDelayedTest(AV1['Bunny360p30fps'], AAC['AudioNormal']);
    createSingleSourceBufferPlaybackTest(AV1['Bunny240p30fps']);
  });
});
