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

import {isChrobalt} from 'google3/third_party/javascript/yts/test_utils/cobalt';
import {
  h5vcc,
  VerifyTestResponse,
  WriteTestResponse,
} from 'google3/third_party/javascript/yts/yts_common/h5vcc';
import 'yts';

/** Name of the test cache to use for persistence tests. */
const TEST_CACHE_NAME = 'yts-persistence-test-cache';
/** Fake URL to put in the test cache. */
const TEST_CACHE_URL = 'http://yts-persistence-test-fake-url/';
/** Size of individual test files to write to the cache. */
const TEST_DATA_SIZE = 24 * 10 ** 6; // 24 MB
/** Repeating string to write to the cache. */
const TEST_STRING = 'x';
/** Contents of the test file to repeatedly write to the cache. */
const TEST_DATA = TEST_STRING.repeat(TEST_DATA_SIZE);

/**
 * Writes 24MB of test data to the cache under a test cache key.
 */
async function writeCache(): Promise<WriteTestResponse | undefined> {
  console.log('writeCache');
  return isChrobalt() ? writeCacheWithCacheApi() : writeCacheWithH5vcc();
}
yts.script('writeCache', writeCache);

/**
 * Verifies whether the test cache key maps to the expected 24MB of test data,
 * then removes the data from the cache.
 */
async function verifyCache(): Promise<VerifyTestResponse | undefined> {
  console.log('verifyCache');
  return isChrobalt() ? verifyCacheWithCacheApi() : verifyCacheWithH5vcc();
}
yts.script('verifyCache', verifyCache);

async function writeCacheWithCacheApi(): Promise<WriteTestResponse> {
  console.log('Using cache API for cache write');
  const response: WriteTestResponse = {
    bytes_written: 0,
    error: '',
  };
  console.log(`Opening cache ${TEST_CACHE_NAME}`);
  const cache = await window.caches.open(TEST_CACHE_NAME);
  try {
    console.log(
      `Writing ${TEST_DATA_SIZE} bytes to cache ${TEST_CACHE_NAME} for fake URL "${TEST_CACHE_URL}"`,
    );
    await cache.put(TEST_CACHE_URL, new Response(TEST_DATA));
    response.bytes_written += TEST_DATA_SIZE;
  } catch (e: unknown) {
    response.error = e instanceof Error ? e.toString() : String(e);
    console.log(response.error);
  }
  return response;
}

async function writeCacheWithH5vcc(): Promise<WriteTestResponse | undefined> {
  console.log('Using h5vcc for cache write');
  return h5vcc?.storage?.writeTest(TEST_DATA_SIZE, TEST_STRING);
}

async function verifyCacheWithCacheApi(): Promise<VerifyTestResponse> {
  console.log('Using cache API for cache verification');
  const response: VerifyTestResponse = {
    verified: false,
    bytes_read: 0,
    error: '',
  };
  console.log(`Opening cache ${TEST_CACHE_NAME}`);
  const cache = await window.caches.open(TEST_CACHE_NAME);
  try {
    console.log(
      `Reading cache ${TEST_CACHE_NAME} for fake URL "${TEST_CACHE_URL}"`,
    );
    const cachedResponse = await cache.match(TEST_CACHE_URL);
    const data = (await cachedResponse?.text()) ?? '';
    response.bytes_read += data.length;

    if (data === TEST_DATA) {
      response.verified = true;
      console.log(`Data integrity verified.`);
    } else {
      console.log(
        `Data integrity verification failed. Data appears to be corrupted.`,
      );
    }

    console.log(`Clearing cache "${TEST_CACHE_NAME}"`);
    await window.caches.delete(TEST_CACHE_NAME);
  } catch (e: unknown) {
    response.error = e instanceof Error ? e.toString() : String(e);
    console.log(response.error);
  }
  return response;
}

async function verifyCacheWithH5vcc(): Promise<VerifyTestResponse | undefined> {
  console.log('Using h5vcc for cache verification');
  return h5vcc?.storage?.verifyTest(TEST_DATA_SIZE, TEST_STRING);
}
