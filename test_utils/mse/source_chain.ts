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
 * @fileoverview Ported legacy YTS source chain utilities with enhanced logging.
 */

import {Segment} from '../parsers/interfaces';
import {parseMp4} from '../parsers/mp4';
import {parseWebM} from '../parsers/webm';
import {TimeoutManager} from '../timeout_manager';
import {XhrManager} from '../xhr_manager';

/**
 * Interface representing a media source chain element.
 * Provides methods for initialization, seeking, and pulling data.
 */
export interface SourceChainElement {
  /**
   * Initializes the source chain element.
   * @param t The target time to initialize at.
   * @param cb Optional callback for asynchronous completion.
   * @return The initialization segment data if called synchronously.
   */
  init(t: number, cb?: (buf: Uint8Array) => void): Uint8Array|void;

  /**
   * Seeks to a specific time in the media.
   * @param t The time to seek to, in seconds.
   * @param sb Optional SourceBuffer to interact with.
   */
  seek(t: number, sb?: SourceBuffer): void;

  /**
   * Pulls the next chunk of media data.
   * @param cb Callback invoked with the data buffer, or null on EOS.
   */
  pull(cb: (buf: Uint8Array|null) => void): void;

  /**
   * Gets the total duration of the media stream.
   * @return The duration in seconds.
   */
  duration(): number;

  /**
   * Gets the duration of the currently active segment.
   * @return The segment duration in seconds.
   */
  currSegDuration(): number;
}

/**
 * Source element that reads media data from a file.
 */
export class FileSource implements SourceChainElement {
  segs: Segment[]|null|undefined = null;
  private segIndex = 0;
  private initBuf: Uint8Array|null = null;
  private initLength: number;

  /**
   * @param path The path to the media file.
   * @param xhrManager The XHR manager instance.
   * @param timeoutManager Optional timeout manager.
   * @param startIndex Optional start segment index.
   * @param endIndex Optional end segment index.
   * @param forceSize Optional forced chunk size.
   */
  constructor(
      private readonly path: string, private readonly xhrManager: XhrManager,
      private readonly timeoutManager: TimeoutManager,
      private startIndex?: number, private endIndex?: number,
      private readonly forceSize?: number) {
    this.initLength = forceSize || 32 * 1024;
  }

  /**
   * Initializes the source, fetching the init segment.
   * @param t The time to initialize at.
   * @param cb Optional callback for async completion.
   * @return The init segment if called synchronously.
   */
  init(t: number, cb?: (buf: Uint8Array) => void): Uint8Array|void {
    console.log(`[FileSource] init called for ${this.path} at time ${t}`);
    if (!cb) {
      if (!this.initBuf) {
        throw new Error(
            'Calling init synchronously when the init seg is not ready');
      }
      return this.initBuf;
    }
    if (this.initBuf) {
      console.log(`[FileSource] Using cached init segment for ${this.path}`);
      this.timeoutManager.setTimeout(cb.bind(this, this.initBuf), 1);
    } else {
      const fileExtPattern = /\.(webm|mp4)$/;
      const execResult = fileExtPattern.exec(this.path);
      if (!execResult) {
        throw new Error(
            `File extension not found or not supported for "${this.path}"!`);
      }
      const extResult = execResult[1];
      if (extResult !== 'mp4' && extResult !== 'webm') {
        throw new Error('File extension "' + extResult + '" not supported!');
      }
      const xhr = this.xhrManager.createRequest(this.path, () => {
        this.segs = null;
        const response = xhr.getResponseData();
        console.log(`[FileSource] Fetched init chunk of size ${
            response.length} for ${this.path}`);
        if (extResult === 'mp4') {
          this.segs = parseMp4(response);
        } else {
          if (this.forceSize) {
            this.segs = parseWebM(response.buffer, this.forceSize);
          } else {
            this.segs = parseWebM(response.buffer);
          }
        }
        console.log(`[FileSource] Parsed ${this.segs?.length} segments for ${
            this.path}`);
        this.startIndex = this.startIndex || 0;
        this.endIndex = this.endIndex || this.segs!.length - 1;
        this.endIndex = Math.min(this.endIndex, this.segs!.length - 1);
        this.startIndex = Math.min(this.startIndex, this.endIndex);
        this.segIndex = this.startIndex;

        const xhr2 = this.xhrManager.createRequest(this.path, () => {
          this.initBuf = xhr2.getResponseData();
          console.log(`[FileSource] Fetched full init segment of size ${
              this.initBuf.length} for ${this.path}`);
          cb.call(this, this.initBuf);
        }, 0, this.segs![0].offset);
        xhr2.send();
      }, 0, this.initLength);
      xhr.send();
    }
  }

  /**
   * Seeks to the segment corresponding to time t.
   * @param t The target time.
   * @param sb Optional SourceBuffer to abort.
   */
  seek(t: number, sb?: SourceBuffer): void {
    console.log(`[FileSource] seek called for ${this.path} to time ${t}`);
    if (!this.initBuf) {
      throw new Error('Seek must be called after init');
    }

    if (sb) {
      sb.abort();
    } else if (t !== 0) {
      throw new Error(
          'You can only seek to the beginning without providing a sb');
    }

    t += this.segs![this.startIndex!].time;
    let i = this.startIndex!;
    while (i <= this.endIndex! && this.segs![i].time <= t) {
      ++i;
    }
    this.segIndex = i - 1;
    console.log(`[FileSource] seek resolved to segIndex ${this.segIndex}`);
  }

  /**
   * Pulls the next media segment.
   * @param cb Callback receiving the segment data or null for EOS.
   */
  pull(cb: (buf: Uint8Array|null) => void): void {
    if (this.segIndex > this.endIndex!) {
      console.log(`[FileSource] pull reached EOS for ${this.path}`);
      this.timeoutManager.setTimeout(cb.bind(this, null), 1);
      return;
    }
    const seg = this.segs![this.segIndex];

    ++this.segIndex;
    const xhr = this.xhrManager.createRequest(this.path, () => {
      cb.call(this, xhr.getResponseData());
    }, seg.offset, seg.size);
    xhr.send();
  }

  /**
   * Returns the total duration of the file.
   * @return The duration in seconds.
   */
  duration(): number {
    const last = this.segs![this.segs!.length - 1];
    return last.time + last.duration;
  }

  /**
   * Returns the duration of the current segment.
   * @return The duration in seconds.
   */
  currSegDuration(): number {
    if (!this.segs || !this.segs[this.segIndex]) {
      return 0;
    }
    return this.segs[this.segIndex].duration;
  }
}

/**
 * Source element that resets the init segment state.
 */
export class ResetInit implements SourceChainElement {
  private init_sent = false;

  constructor(private readonly upstream: SourceChainElement) {}

  /**
   * Forwards init call and tracks that init was sent.
   */
  init(t: number, cb?: (buf: Uint8Array) => void): Uint8Array|void {
    console.log(`[ResetInit] init called at time ${t}`);
    this.init_sent = true;
    return this.upstream.init(t, cb);
  }

  /**
   * Forwards seek call and resets init state.
   */
  seek(t: number, sb?: SourceBuffer): void {
    console.log(`[ResetInit] seek called to time ${t}`);
    this.init_sent = false;
    return this.upstream.seek(t, sb);
  }

  /**
   * Pulls data, injecting init segment if not yet sent.
   */
  pull(cb: (buf: Uint8Array|null) => void): void {
    if (!this.init_sent) {
      console.log(`[ResetInit] pull intercepting to send init segment first`);
      this.init_sent = true;
      this.upstream.init(0, (init_seg) => {
        cb(init_seg as Uint8Array);
      });
      return;
    }
    this.upstream.pull((rsp) => {
      if (!rsp) {
        console.log(`[ResetInit] pull received EOS, resetting init state`);
        this.init_sent = false;
      }
      cb(rsp);
    });
  }

  duration(): number {
    return this.upstream.duration();
  }

  currSegDuration(): number {
    return this.upstream.currSegDuration();
  }
}

/**
 * Source element that enforces a fixed chunk size for appends.
 */
export class FixedAppendSize implements SourceChainElement {
  private cache = new Uint8Array(0);

  constructor(
      private readonly upstream: SourceChainElement,
      private readonly size?: number) {}

  /**
   * Returns the configured chunk size.
   */
  appendSize(): number {
    return this.size || 512 * 1024;
  }

  init(t: number, cb?: (buf: Uint8Array) => void): Uint8Array|void {
    return this.upstream.init(t, cb);
  }

  seek(t: number, sb?: SourceBuffer): void {
    console.log(`[FixedAppendSize] seek called, clearing cache`);
    this.cache = new Uint8Array(0);
    return this.upstream.seek(t, sb);
  }

  /**
   * Pulls data via pullBytes helper.
   */
  pull(cb: (buf: Uint8Array|null) => void): void {
    const len = this.appendSize();
    pullBytes(this.upstream, len, this.cache, (buf, cache) => {
      this.cache = cache || new Uint8Array(0);
      cb(buf);
    });
  }

  duration(): number {
    return this.upstream.duration();
  }

  currSegDuration(): number {
    return this.upstream.currSegDuration();
  }
}

/**
 * Helper function to pull a specific number of bytes from upstream.
 * @param elem The upstream element.
 * @param len The number of bytes to pull.
 * @param cache The current leftover bytes cache.
 * @param cb Callback receiving the buffer and the new cache.
 */
function pullBytes(
    elem: SourceChainElement, len: number, cache: Uint8Array|null,
    cb: (buf: Uint8Array|null, newCache: Uint8Array|null) => void): void {
  if (!cache) {
    cb(cache, null);
    return;
  }

  if (len <= cache.length) {
    const buf = cache.subarray(0, len);
    const newCache = cache.subarray(len);
    cb(buf, newCache);
    return;
  }

  elem.pull((buf) => {
    if (!buf) {
      cb(cache, buf);
      return;
    }
    const newCache = new Uint8Array(cache.length + buf.length);
    newCache.set(cache);
    newCache.set(buf, cache.length);

    if (newCache.length <= len) {
      cb(newCache, new Uint8Array(0));
    } else {
      const resultBuf = newCache.subarray(0, len);
      const remainingCache = newCache.subarray(len);
      cb(resultBuf, remainingCache);
    }
  });
}

/**
 * Finds the end of the buffered range containing time t.
 * @param sb The SourceBuffer.
 * @param t The time in seconds.
 * @return The end time of the range, or null if not found.
 */
export function findBufferedRangeEndForTime(
    sb: SourceBuffer, t: number): number|null {
  const buf = sb.buffered;
  for (let i = 0; i < buf.length; ++i) {
    const s = buf.start(i);
    const e = buf.end(i);
    if (t >= s && t <= e) {
      return e;
    }
  }
  return null;
}

/**
 * Appends the init segment to the SourceBuffer.
 * @param video The HTMLVideoElement.
 * @param sb The SourceBuffer.
 * @param chain The source chain.
 * @param t The time to init at.
 * @param cb Callback called when append completes.
 */
export function appendInit(
    video: HTMLVideoElement, sb: SourceBuffer, chain: SourceChainElement,
    t: number, cb: () => void): void {
  console.log(`[appendInit] starting for time ${t}`);
  chain.init(t, (init_seg) => {
    if (init_seg) {
      console.log(
          `[appendInit] appending init segment of size ${init_seg.length}`);
      const appendedCb = () => {
        sb.removeEventListener('update', appendedCb);
        console.log(`[appendInit] append completed. Buffered length: ${
            sb.buffered.length}`);
        cb();
      };
      sb.addEventListener('update', appendedCb);
      sb.appendBuffer(init_seg);
    } else {
      console.log(`[appendInit] no init segment received`);
      cb();
    }
  });
}

/**
 * Appends data from chain to sb until buffered range covers time t.
 * @param timeoutManager Optional timeout manager.
 * @param mp The HTMLVideoElement.
 * @param sb The SourceBuffer.
 * @param chain The source chain.
 * @param t The target time in seconds.
 * @param cb Callback called when target reached.
 */
export function appendUntil(
    timeoutManager: TimeoutManager, mp: HTMLVideoElement, sb: SourceBuffer,
    chain: SourceChainElement, t: number, cb: () => void): void {
  const started = sb.buffered.length !== 0;
  const current = mp.currentTime;
  let buffered_end = findBufferedRangeEndForTime(sb, current);
  console.log(`[appendUntil] Target: ${t.toFixed(2)}, Current Time: ${
      current.toFixed(2)}, Initial Buffered End: ${buffered_end?.toFixed(2)}`);

  if (buffered_end) {
    buffered_end = buffered_end + 0.1;
  } else {
    buffered_end = 0;
    if (started) {
      console.log(
          `[appendUntil] No range found for current time, seeking chain to 0`);
      chain.seek(0, sb);
    }
  }

  class AppendHandler {
    private totalAppends = 0;
    private appendCbs = 0;
    private shouldCallCb = false;
    private postAppendBufferCb: (() => void)|null = null;

    constructor() {
      this.appendBufferFinished = this.appendBufferFinished.bind(this);
      sb.addEventListener('update', this.appendBufferFinished);
    }

    startedAppendBuffer(cb: () => void) {
      this.totalAppends++;
      this.postAppendBufferCb = cb;
    }

    private appendBufferFinished() {
      this.appendCbs++;
      buffered_end = findBufferedRangeEndForTime(sb, buffered_end!);
      if (buffered_end) {
        buffered_end = buffered_end + 0.1;
      } else {
        buffered_end = 0;
      }
      console.log(`[appendUntil] Append #${
          this.totalAppends} finished. New Buffered End: ${
          buffered_end?.toFixed(2)}`);

      if (this.shouldCallCb && (this.appendCbs === this.totalAppends)) {
        this.done();
      } else {
        if (this.postAppendBufferCb) this.postAppendBufferCb();
      }
    }

    done() {
      if (this.totalAppends === this.appendCbs) {
        sb.removeEventListener('update', this.appendBufferFinished);
        console.log(`[appendUntil] Completed successfully at target ${t}`);
        cb();
      }
      this.shouldCallCb = true;
    }
  }

  const appendHandler = new AppendHandler();

  function checkAndPull() {
    if (t >= buffered_end! && !mp.error) {
      chain.pull(loop);
    } else {
      if (mp.error) {
        console.error(`[appendUntil Loop] Error occurred. Error: ${mp.error}`);
      } else {
        console.log(`[appendUntil Loop] Target reached. Target: ${t}, End: ${
            buffered_end}`);
      }
      appendHandler.done();
    }
  }

  function loop(buffer?: Uint8Array|null) {
    if (buffer) {
      try {
        sb.appendBuffer(buffer);
      } catch (e) {
        console.error('[appendUntil Loop] Error appending buffer:', e);
        appendHandler.done();
        return;
      }
      appendHandler.startedAppendBuffer(checkAndPull);
    } else {
      checkAndPull();
    }
  }

  loop();
}

/**
 * Appends data from chain to sb ensuring gap coverage beyond time t.
 * @param timeoutManager Optional timeout manager.
 * @param mp The HTMLVideoElement.
 * @param sb The SourceBuffer.
 * @param chain The source chain.
 * @param t The time in seconds.
 * @param gap The gap size in seconds.
 * @param cb Callback called when target reached.
 */
export function appendAt(
    timeoutManager: TimeoutManager, mp: HTMLVideoElement, sb: SourceBuffer,
    chain: SourceChainElement, t: number, gap: number, cb: () => void): void {
  gap = gap || 3;
  let buffered_end = findBufferedRangeEndForTime(sb, t);
  console.log(`[appendAt] Time: ${t.toFixed(2)}, Gap: ${
      gap}, Initial Buffered End: ${buffered_end?.toFixed(2)}`);

  (function loop(buffer?: Uint8Array|null) {
    if (buffer) {
      if (sb.updating) {
        timeoutManager.setTimeout(() => {
          loop(buffer);
        }, 0);
      } else {
        try {
          sb.appendBuffer(buffer);
        } catch (e) {
          console.error('[appendAt Loop] Error appending buffer:', e);
          cb();
          return;
        }
        timeoutManager.setTimeout(loop, 0);
      }
    } else {
      buffered_end = findBufferedRangeEndForTime(sb, t);
      if (t + gap >= (buffered_end || 0) && !mp.error) {
        chain.pull(loop);
      } else {
        cb();
      }
    }
  })();
}

/**
 * Plays through media streams maintaining lead time.
 * @param timeoutManager Optional timeout manager.
 * @param mp The HTMLVideoElement.
 * @param lead The lead time in seconds.
 * @param endTime The end time in seconds.
 * @param s1 The first SourceBuffer.
 * @param f1 The first source chain.
 * @param s2 The second SourceBuffer (optional).
 * @param f2 The second source chain (optional).
 * @param cb Callback called when endTime reached.
 */
export function playThrough(
    timeoutManager: TimeoutManager, mp: HTMLVideoElement, lead: number,
    endTime: number, s1: SourceBuffer, f1: SourceChainElement,
    s2: SourceBuffer|null, f2: SourceChainElement|null, cb: () => void): void {
  const yieldTime = 0.03;

  function loop() {
    if (mp.currentTime <= endTime && !mp.error) {
      timeoutManager.setTimeout(() => {
        playThrough(timeoutManager, mp, lead, endTime, s1, f1, s2, f2, cb);
      }, yieldTime * 1000);
    } else {
      console.log(`[playThrough] Reached end time ${endTime}`);
      cb();
    }
  }

  appendAt(timeoutManager, mp, s1, f1, mp.currentTime, yieldTime + lead, () => {
    if (s2 && f2) {
      appendAt(
          timeoutManager, mp, s2, f2, mp.currentTime, yieldTime + lead, loop);
    } else {
      loop();
    }
  });
}

/**
 * Removes segments from all 'buffers' to satisfy 'duration'.
 * @param duration The target duration.
 * @param ms The MediaSource.
 * @param buffers The SourceBuffer or array of SourceBuffers.
 * @param cb Callback called when complete.
 */
export function setDuration(
    duration: number, ms: MediaSource, buffers: SourceBuffer|SourceBuffer[],
    cb: () => void): void {
  const bufferList = buffers instanceof Array ? buffers : [buffers];
  if (bufferList.length === 0) {
    console.log(`[setDuration] Setting MediaSource duration to ${duration}`);
    ms.duration = duration;
    cb();
    return;
  }
  const buffer = bufferList.pop()!;
  for (let rangeIdx = 0; rangeIdx < buffer.buffered.length; rangeIdx++) {
    const bufferedEnd = buffer.buffered.end(rangeIdx);
    if (bufferedEnd > duration) {
      const onDurationChange = () => {
        buffer.removeEventListener('updateend', onDurationChange);
        setDuration(duration, ms, bufferList, cb);
      };
      buffer.addEventListener('updateend', onDurationChange);
      buffer.remove(duration, bufferedEnd);
      return;
    }
  }
  setDuration(duration, ms, bufferList, cb);
}

/**
 * Waits until the media currentTime reaches the target or stops advancing.
 * @param timeoutManager Optional timeout manager.
 * @param media The HTMLVideoElement.
 * @param target The target time in seconds.
 * @param cb Callback called when condition met.
 */
export function waitUntil(
    timeoutManager: TimeoutManager, media: HTMLVideoElement, target: number,
    cb: () => void): void {
  const initTime = media.currentTime;
  let lastTime = initTime;

  const check = () => {
    if (media.currentTime === initTime) {
      timeoutManager.setTimeout(check, 500);
    } else if (media.currentTime === lastTime || media.currentTime > target) {
      cb();
    } else {
      lastTime = media.currentTime;
      timeoutManager.setTimeout(check, 500);
    }
  };

  timeoutManager.setTimeout(check, 500);
}
