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

/** Number of retries for appendBuffer if QuotaExceededError occurs. */
const RETRY_COUNT_LIMIT = 10;

/** Delay between retries for appendBuffer in milliseconds. */
const RETRY_DELAY_MS = 2000;

/**
 * Fetches media segment data from a URL and appends it to the SourceBuffer.
 *
 * @param contentBuffer The SourceBuffer to append to.
 * @param contentUrl URL of the media content.
 */
export async function appendContentToBuffer(
    contentBuffer: SourceBuffer,
    contentUrl: string,
    ): Promise<void> {
  console.log(`Fetching ${contentUrl}`);
  const response = await fetch(contentUrl);

  if (!response.ok) {
    const errorMsg =
        `Fetch failed for ${contentUrl}. Status: ${response.status}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const buffer = await response.arrayBuffer();
  console.log(
      `Fetch complete for ${contentUrl}. Byte length: ${buffer.byteLength}`);

  await appendToBufferWithRetry(contentBuffer, buffer, contentUrl);
}

/** Helper to append data to a SourceBuffer safely with retries on QuotaExceededError. */
export async function appendToBufferWithRetry(
  sb: SourceBuffer,
  data: ArrayBuffer | Uint8Array,
  label: string,
  retryCount = 0,
): Promise<void> {
  if (sb.updating) {
    console.log(`SourceBuffer (${label}) still updating...`);
    await new Promise<void>((resolve) => {
      sb.addEventListener(
        'updateend',
        () => {
          resolve();
        },
        {once: true},
      );
    });
  }

  try {
    sb.appendBuffer(data);
  } catch (e) {
    if ((e as DOMException).name === 'QuotaExceededError') {
      console.warn(
        `QuotaExceededError for ${label}. Retry ${retryCount + 1}/${RETRY_COUNT_LIMIT}`,
      );
      if (retryCount >= RETRY_COUNT_LIMIT) {
        throw new Error(
          `Failed to append ${label} after ${RETRY_COUNT_LIMIT} retries.`,
        );
      }
      await sleep(RETRY_DELAY_MS);
      return appendToBufferWithRetry(sb, data, label, retryCount + 1);
    }
    logError(e, `appendBuffer (${label})`);
    throw e;
  }

  await new Promise<void>((resolve) => {
    sb.addEventListener(
      'updateend',
      () => {
        resolve();
      },
      {once: true},
    );
  });
}

/** Efficiently combines two Uint8Arrays. */
export function combineUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  const combined = new Uint8Array(a.length + b.length);
  combined.set(a);
  combined.set(b, a.length);
  return combined;
}

/** Helper to log errors with details. */
export function logError(e: unknown, context: string) {
  const err = e as {
    name?: string;
    message?: string;
    code?: number;
    stack?: string;
  };
  console.error(
    `Error in ${context}: [${err.name || 'Unknown'}] ${err.message || String(e)} (Code: ${err.code || 'N/A'})`,
  );
  if (err.stack) console.error(err.stack);
}

/**
 * Fetches a chunk of data from the given URL and appends it to the SourceBuffer.
 *
 * @param url The URL of the media content.
 * @param byteStart The start byte of the chunk.
 * @param chunkSize The size of the chunk in bytes.
 * @param sourceBuffer The SourceBuffer to append to.
 */
export async function fetchChunk(
  url: string,
  byteStart: number,
  chunkSize: number,
  sourceBuffer: SourceBuffer,
  mediaSource: MediaSource,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const byteEnd = byteStart + chunkSize - 1;

    xhr.open('GET', url, true);
    xhr.setRequestHeader('Range', `bytes=${byteStart}-${byteEnd}`);
    xhr.responseType = 'arraybuffer';

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const doAppend = () => {
          if (mediaSource.readyState !== 'open') {
            reject(new Error('MediaSource is not open, cannot appendBuffer.'));
            return;
          }
          try {
            console.log('appending chunk from doAppend');
            sourceBuffer.appendBuffer(xhr.response);
            resolve();
          } catch (e: unknown) {
            console.error(
              'appendBuffer error in doAppend: ',
              (e as DOMException).name,
              e,
            );
            if ((e as DOMException).name === 'QuotaExceededError') {
              console.log('QuotaExceededError, retrying appendChunk.');
              retryAppendChunk(xhr.response, sourceBuffer, 0, mediaSource)
                .then(resolve)
                .catch(reject);
            } else {
              console.error(
                `appendBuffer other error in doAppend: ${
                  (e as DOMException).name
                }, sb.updating=${sourceBuffer.updating}`,
                e,
              );
              reject(
                new Error(
                  `appendBuffer other error in doAppend: ${
                    (e as DOMException).name
                  }, sb.updating=${sourceBuffer.updating}`,
                  e as ErrorOptions,
                ),
              );
            }
          }
        };

        if (sourceBuffer.updating) {
          console.log(
            'fetchChunk onload: buffer updating, scheduling append on updateend.',
          );
          sourceBuffer.addEventListener('updateend', doAppend, {once: true});
        } else {
          doAppend();
        }
      } else if (xhr.status === 416) {
        // Range not satisfiable (end of file)
        console.log('Success! Range not satisfiable (end of file)');
        resolve();
      } else {
        console.log('failed to fetch chunk');
        reject(
          new Error(`Failed to fetch chunk: ${xhr.status} ${xhr.statusText}`),
        );
      }
    };

    xhr.onerror = () => {
      console.log('network error during chunk fetch');
      reject(new Error('Network error during chunk fetch.'));
    };

    xhr.send();
  });
}

/**
 * Retries appending a chunk to the SourceBuffer if QuotaExceededError occurs.
 *
 * @param chunk The chunk to append.
 * @param sourceBuffer The SourceBuffer to append to.
 * @param retryCount The current retry count.
 * @param mediaSource The MediaSource object.
 */
export async function retryAppendChunk(
  chunk: ArrayBuffer,
  sourceBuffer: SourceBuffer,
  retryCount: number,
  mediaSource: MediaSource,
): Promise<void> {
  console.log(`retryAppendChunk: Attempt ${retryCount + 1}`);
  await sleep(RETRY_DELAY_MS);
  if (retryCount >= RETRY_COUNT_LIMIT) {
    throw new Error(
      `Failed to append chunk after ${RETRY_COUNT_LIMIT} retries.`,
    );
  }

  if (mediaSource.readyState !== 'open') {
    throw new Error(
      `MediaSource readyState is ${mediaSource.readyState}, cannot append.`,
    );
  }

  if (sourceBuffer.updating) {
    console.log(
      `retryAppendChunk retry ${retryCount}: buffer updating, waiting for updateend.`,
    );
    await new Promise<void>((resolve) => {
      sourceBuffer.addEventListener(
        'updateend',
        () => {
          resolve();
        },
        {once: true},
      );
    });
  }

  try {
    console.log(`retryAppendChunk retry ${retryCount}: appending chunk.`);
    sourceBuffer.appendBuffer(chunk);
  } catch (e: unknown) {
    console.log(
      'error name: ',
      (e as DOMException).name,
      'in retryAppendChunk retryCount: ',
      retryCount,
    );
    if ((e as DOMException).name === 'QuotaExceededError') {
      await retryAppendChunk(chunk, sourceBuffer, retryCount + 1, mediaSource);
    } else {
      throw e;
    }
  }
}
