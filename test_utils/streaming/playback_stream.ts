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

import {sleep} from 'google3/third_party/javascript/yts/yts_common';
import {objectUrlFromSafeSource, unwrapUrl} from 'safevalues';
import {fetchChunk} from './stream_utils';

/**
 * Streams a video chunk by chunk using MediaSource.
 *
 * @param videoElement HTMLVideoElement to stream the video to.
 * @param contentInfo Array of content info (mimetype, src, fileSize).
 * @param chunkSize Size of each chunk in bytes.
 * @param appendChunkDelay Delay in milliseconds between appending chunks.
 * @param stopTime Time in seconds to stop appending chunks.
 * @param onSourceObjects Callback function for when SourceBuffer is created.
 */
export async function streamVideoByChunks(
  videoElement: HTMLVideoElement,
  contentInfo: Array<{mimetype: string; src: string; fileSize: number}>,
  chunkSize: number,
  appendChunkDelay: number,
  stopTime?: number | null,
  onSourceObjects?: (ms: MediaSource, sb: SourceBuffer) => void,
): Promise<void> {
  const mediaSource = new MediaSource();

  // Helper class to manage state for each stream
  class StreamManager {
    fetching = false;
    currentByteStart = 0;
    sourceBuffer!: SourceBuffer;
    constructor(
      public info: {mimetype: string; src: string; fileSize: number},
      public chunkSize: number,
    ) {
      console.log(
        `Streaming ${info.mimetype} from ${info.src} (${info.fileSize} bytes)`,
      );
    }

    /**
     * Returns whether the StreamManager has fetched all the bytes for its src.
     * This just means that the manager will not launch any more fetches. It
     * does NOT imply anything about whether there are fetch requests in flight.
     */
    isEndOfStream() {
      return this.currentByteStart >= this.info.fileSize;
    }

    /**
     * Returns whether the StreamManager doesn't currently have any requests
     * in flight. It is a prerequisite for launching the next fetch request.
     */
    isIdle() {
      return !this.fetching && !this.sourceBuffer.updating;
    }

    /**
     * Returns whether the StreamManager is completely done fetching its src.
     * This is used to determine whether the MediaSource can be ended.
     */
    isDone() {
      return this.isEndOfStream() && this.isIdle();
    }
  }

  const streamManagers = contentInfo.map(
    (info) => new StreamManager(info, chunkSize),
  );

  // Determine which streams need to fetch chunks.
  // For simple audio+video cases, we just fetch chunks for all streams independently.
  const fetchNextRelevantChunk = async (manager: StreamManager) => {
    // Check if MediaSource is still open before fetching/appending
    if (mediaSource.readyState !== 'open') {
      console.log(
        'MediaSource is not open. Aborting chunk fetching.',
        mediaSource.readyState,
      );
      return;
    }

    if (manager.isEndOfStream()) {
      if (manager.isIdle() && mediaSource.readyState === 'open') {
        console.log(
          'End of stream reached for',
          manager.info.mimetype,
          'fileSize:',
          manager.info.fileSize,
        );
        // Only endOfStream if all streams are done.
        if (streamManagers.every((m) => m.isDone())) {
          console.log(
            'Ending the whole MediaSource stream as all individual streams are done.',
          );
          mediaSource.endOfStream();
        }
      }
      return;
    }

    if (!manager.isIdle()) {
      console.log(
        `SourceBuffer is still updating or fetching for ${manager.info.src}; waiting for updateend to trigger the next fetch.`,
      );
      // The 'updateend' listener will call fetchNextRelevantChunk again.
      return;
    }

    const nextChunkStart = manager.currentByteStart;
    manager.chunkSize = Math.min(
      chunkSize,
      manager.info.fileSize - nextChunkStart,
    );
    manager.currentByteStart += manager.chunkSize; // Optimistically update for the next call
    manager.fetching = true;
    try {
      console.log(
        `Fetching ${manager.info.mimetype} chunk byteStart:${nextChunkStart}, chunkSize:${manager.chunkSize}`,
      );
      await fetchChunk(
        manager.info.src,
        nextChunkStart,
        manager.chunkSize,
        manager.sourceBuffer,
        mediaSource,
      );
      // fetchChunk will resolve after appendBuffer is successful (or retry logic finishes)
      // The 'updateend' listener will then call this function again to fetch the next chunk.
    } catch (e) {
      if (mediaSource.readyState === 'open') {
        // If a chunk fails, attempt to end the stream with an error
        // This might happen if fetchChunk exhausts its retries
        console.error(
          `Error fetching or appending chunk starting at ${nextChunkStart} for ${manager.info.mimetype}:`,
          e,
        );
        mediaSource.endOfStream('network');
      }
    } finally {
      manager.fetching = false;
    }
  };

  mediaSource.addEventListener('sourceopen', async () => {
    console.log('MediaSource sourceopen event');
    try {
      const chunkFetchPromises: Array<Promise<void>> = [];
      for (const manager of streamManagers) {
        manager.sourceBuffer = mediaSource.addSourceBuffer(
          manager.info.mimetype,
        );
        if (onSourceObjects) {
          onSourceObjects(mediaSource, manager.sourceBuffer);
        }
        if (stopTime) {
          manager.sourceBuffer.appendWindowEnd = stopTime;
        }
        console.log('SourceBuffer created for', manager.info.mimetype);

        manager.sourceBuffer.addEventListener('updateend', async () => {
          console.log(
            'SourceBuffer updateend event. Current byteStart:',
            manager.currentByteStart,
            'fileSize:',
            manager.info.fileSize,
          );
          await sleep(appendChunkDelay); // Optional delay
          await fetchNextRelevantChunk(manager);
        });

        manager.sourceBuffer.addEventListener('error', (event: Event) => {
          console.error(
            'SourceBuffer error event:',
            JSON.stringify({
              eventDetails: {
                type: event.type,
                timeStamp: event.timeStamp,
                isTrusted: event.isTrusted,
                bubbles: event.bubbles,
                cancelable: event.cancelable,
                composed: event.composed,
              },
              sourceBufferState: {
                updating: manager.sourceBuffer.updating,
              },
              mediaSourceState: {
                readyState: mediaSource.readyState,
              },
            }),
          );
          if (mediaSource.readyState === 'open') {
            mediaSource.endOfStream('decode');
          }
        });

        manager.sourceBuffer.addEventListener('abort', (event) => {
          console.log(
            'SourceBuffer abort event:',
            JSON.stringify({
              type: event.type,
              timeStamp: event.timeStamp,
            }),
          );
          if (mediaSource.readyState === 'open') {
            mediaSource.endOfStream('network');
          }
        });

        // Start fetching the first chunk
        chunkFetchPromises.push(fetchNextRelevantChunk(manager));
      }
      await Promise.all(chunkFetchPromises);
    } catch (error) {
      console.error(
        'Error during MediaSource setup:',
        JSON.stringify({
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack,
        }),
      );
      if (mediaSource.readyState === 'open') {
        mediaSource.endOfStream('network');
      }
    }
  });

  mediaSource.addEventListener('error', (event) => {
    console.error(
      'MediaSource error:',
      JSON.stringify({
        type: event.type,
        timeStamp: event.timeStamp,
      }),
    );
  });

  mediaSource.addEventListener('sourceclose', (event) => {
    console.log(
      'MediaSource sourceclose event:',
      JSON.stringify({
        type: event.type,
        timeStamp: event.timeStamp,
      }),
    );
  });

  videoElement.src = unwrapUrl(objectUrlFromSafeSource(mediaSource));
}
