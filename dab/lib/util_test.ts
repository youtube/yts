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

// taze: Buffer from //third_party/javascript/typings/node
import 'jasmine';

import {DabTopics} from './constants';
import * as util from './util';

describe('Util', () => {
  const TEST_REQUEST = {};
  const TEST_RETRY_COUNT = 3;
  const TEST_TIMEOUT_MS = 50;
  let TEST_SHORT_FUNC: jasmine.Spy;
  let TEST_LONG_FUNC: jasmine.Spy;
  let TEST_ERROR_FUNC: jasmine.Spy;

  beforeEach(() => {
    TEST_SHORT_FUNC = jasmine
      .createSpy('shortFunc')
      .and.resolveTo(util.dabResponse());
    TEST_LONG_FUNC = jasmine.createSpy('longFunc').and.callFake(async () => {
      await util.sleep(TEST_TIMEOUT_MS + 10);
      return util.dabResponse();
    });
    TEST_ERROR_FUNC = jasmine
      .createSpy('errorFunc')
      .and.rejectWith(new Error('test error'));
  });

  it('creates dab response', () => {
    expect(util.dabResponse()).toEqual({status: 200});

    expect(util.dabResponse(400, 'test error')).toEqual({
      status: 400,
      error: 'test error',
    });

    // Don't allow non-200 messages without errors.
    let caughtError = false;
    try {
      util.dabResponse(400);
    } catch (error: unknown) {
      caughtError = true;
    }
    expect(caughtError).toBeTrue();
  });

  it('creates "not implemented" response', () => {
    expect(util.notImplemented(DabTopics.APPLICATIONS_LAUNCH)).toEqual({
      status: 501,
      error: `Topic "${DabTopics.APPLICATIONS_LAUNCH}" is not implemented`,
    });
  });

  it('handles an error', () => {
    expect(util.handleError('test error 1')).toEqual({
      status: 500,
      error: jasmine.stringContaining('test error 1'),
    });

    expect(util.handleError(new Error('test error 2'))).toEqual({
      status: 500,
      error: jasmine.stringContaining('Error: test error 2'),
    });
  });

  it('returns dab topic string', () => {
    expect(util.dabTopic('topic')).toEqual('dab/topic');
  });

  it('returns dab device topic string', () => {
    expect(util.dabDeviceTopic('deviceId', 'topic')).toEqual(
      'dab/deviceId/topic',
    );
  });

  it('returns dab device app topic string', () => {
    expect(util.dabDeviceAppTopic('deviceId', 'topic', 'appId')).toEqual(
      'dab/deviceId/topic/appId',
    );
  });

  it('returns dab bridge topic string', () => {
    expect(util.dabBridgeTopic('bridgeId', 'topic')).toEqual(
      'dab/bridge/bridgeId/topic',
    );
  });

  it('validates request', () => {
    // Request with no validation.
    util.validateRequest({'prop1': 'val1', 'prop2': 2});

    // Request with optional parameters that passes validation.
    util.validateRequest({'prop1': 'val1', 'prop2': 2}, [
      {name: 'prop1', type: 'string'},
      {name: 'prop3', type: 'boolean'},
    ]);

    // Request with array parameters that passes validation.
    util.validateRequest({'prop1': [1, 2, 3], 'prop2': {key1: 'val1'}}, [
      {name: 'prop1', type: 'number', isArray: true},
      {name: 'prop2', type: 'object'},
    ]);

    // Request with required parameters that passes validation.
    util.validateRequest({'prop1': 'val1', 'prop2': 2, 'prop3': false}, [
      {name: 'prop1', type: 'string', required: true},
      {name: 'prop3', type: 'boolean', required: true},
    ]);
  });

  it('throws error for invalid requests', () => {
    // Request with optional parameters that fails validation.
    let isError = false;
    try {
      util.validateRequest({'prop1': 'val1', 'prop2': 2}, [
        {name: 'prop1', type: 'number'},
        {name: 'prop3', type: 'boolean'},
      ]);
    } catch (e: unknown) {
      isError = true;
    }
    expect(isError).toBeTrue();

    // Request with array parameters that fails validation.
    isError = false;
    try {
      util.validateRequest({'prop1': [1, 2, 3], 'prop2': {key1: 'val1'}}, [
        {name: 'prop1', type: 'string', isArray: true},
        {name: 'prop2', type: 'object'},
      ]);
    } catch (e: unknown) {
      isError = true;
    }
    expect(isError).toBeTrue();

    // Request with required parameters that fails validation.
    isError = false;
    try {
      util.validateRequest({'prop1': 'val1', 'prop2': 2}, [
        {name: 'prop1', type: 'string', required: true},
        {name: 'prop3', type: 'boolean', required: true},
      ]);
    } catch (e: unknown) {
      isError = true;
    }
    expect(isError).toBeTrue();
  });

  it('calls function with timeout', async () => {
    let caught = false;
    try {
      await util.callWithTimeout(
        TEST_REQUEST,
        TEST_SHORT_FUNC,
        TEST_TIMEOUT_MS,
      );
    } catch (e: unknown) {
      caught = true;
    }
    expect(TEST_SHORT_FUNC).toHaveBeenCalled();
    expect(caught).toBeFalse();
  });

  it('rejects function longer than timeout', async () => {
    let caught = false;
    try {
      await util.callWithTimeout(TEST_REQUEST, TEST_LONG_FUNC, TEST_TIMEOUT_MS);
    } catch (e: unknown) {
      caught = true;
    }
    expect(TEST_LONG_FUNC).toHaveBeenCalled();
    expect(caught).toBeTrue();
  });

  it('rejects function with non-timeout error', async () => {
    let caught = false;
    try {
      await util.callWithTimeout(
        TEST_REQUEST,
        TEST_ERROR_FUNC,
        TEST_TIMEOUT_MS,
      );
    } catch (e: unknown) {
      caught = true;
      expect((e as Error).message).toEqual('test error');
    }
    expect(TEST_ERROR_FUNC).toHaveBeenCalled();
    expect(caught).toBeTrue();
  });

  it('calls function with retry', async () => {
    let caught = false;
    try {
      await util.callWithRetry(TEST_REQUEST, TEST_ERROR_FUNC, TEST_RETRY_COUNT);
    } catch (e: unknown) {
      caught = true;
      expect((e as Error).message).toEqual('test error');
    }
    expect(TEST_ERROR_FUNC).toHaveBeenCalledTimes(TEST_RETRY_COUNT);
    expect(caught).toBeFalse();
  });

  it('calls function with retry and timeout', async () => {
    let caught = false;
    try {
      await util.callWithRetryAndTimeout(
        TEST_REQUEST,
        TEST_LONG_FUNC,
        TEST_RETRY_COUNT,
        TEST_TIMEOUT_MS,
      );
    } catch (e: unknown) {
      caught = true;
      expect((e as Error).message).toEqual(
        `Request timed out after ${TEST_TIMEOUT_MS}ms`,
      );
    }
    expect(TEST_LONG_FUNC).toHaveBeenCalledTimes(TEST_RETRY_COUNT);
    expect(caught).toBeFalse();
  });

  it('should return chunks of logs with remaining chunk count', () => {
    const SYSTEM_LOGS_BUFFER_SIZE = 268435455; // 256MB -1
    const longString = 'a'.repeat(SYSTEM_LOGS_BUFFER_SIZE + 10);
    const longBuffer = Buffer.from(longString, 'utf-8');
    const longBufferBase64 = longBuffer.toString('base64');

    const result = util.chunkLogs(longBufferBase64, SYSTEM_LOGS_BUFFER_SIZE);

    expect(result).toEqual({
      chunks: [
        longBufferBase64.slice(0, SYSTEM_LOGS_BUFFER_SIZE),
        longBufferBase64.slice(
          SYSTEM_LOGS_BUFFER_SIZE,
          longBufferBase64.length,
        ),
      ],
      totalChunks: 2,
    });
  });
});
