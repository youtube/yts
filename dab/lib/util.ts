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
 * @fileoverview Common utilities for DAB bridge files.
 */

import {DabTopics} from './constants';
import {ParameterDefinition} from './interfaces';
import * as dab from '../proto/dab_service.jsonpb_decls';
import * as logger from './logger';

/**
 * Creates a simple DAB response representing a status code and optional
 * error message.
 *
 * @param status HTTP status code
 * @param error Error message, if applicable
 */
export function dabResponse(
  status = 200,
  error?: string | Error,
): dab.DabResponse {
  const response: dab.DabResponse = {status};
  if (Math.floor(status / 100) !== 2) {
    if (!error) {
      throw new Error(
        'Error message must be returned for non 2XX status results',
      );
    }
    response.error = error instanceof Error ? stackTrace(error) : `${error}`;
    logger.error(response);
  }
  logger.info(response);
  return response;
}

/**
 * Creates a simple DAB response with status code 501 and an error message
 * indicating that the desired DAB operation is not implemented by the bridge
 * and/or the device.
 *
 * @param topic the DAB topic that is not implemented.
 */
export function notImplemented(topic: DabTopics) {
  return dabResponse(501, `Topic "${topic}" is not implemented`);
}

/**
 * Custom error type for signaling a 400 Bad Request.
 */
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

/**
 * Handles an error by converting it into a DAB response with error code 500,
 * unless it's a BadRequestError, in which case it returns 400.
 *
 * @param e The thrown error.
 */
export function handleError(e: unknown) {
  if (e instanceof BadRequestError) {
    return dabResponse(400, e.message);
  }
  const errorString =
    e instanceof Error ? stackTrace(e) : `${JSON.stringify(e)}`;
  logger.error(`Bridge error: ${errorString}`);
  return dabResponse(500, errorString);
}

/**
 * The function passes the error object back to the caller without modification.
 *
 * @param e The thrown error.
 */
export function raiseError(e: unknown, message?: string) {
  logger.error(`Bridge error: ${message}`);
  if (e instanceof Error) {
    return e;
  } else {
    return new Error(`${e}`);
  }
}

function stackTrace(error: Error) {
  return `${error.name}: ${error.message}${
    error.stack ? '\n' + error.stack : ''
  }`;
}

/**
 * Returns the DAB topic string for the given topic.
 */
export function dabTopic(topic: string) {
  return `dab/${topic}`;
}

/**
 * Returns the DAB topic string for the given deviceId and topic.
 */
export function dabDeviceTopic(deviceId: string, topic: string) {
  return `dab/${deviceId}/${topic}`;
}

/**
 * Returns the DAB topic string for the given deviceId and topic.
 */
export function dabDeviceAppTopic(
  deviceId: string,
  topic: string,
  appId: string,
) {
  return `dab/${deviceId}/${topic}/${appId}`;
}

/**
 * Returns the DAB topic string for the given deviceId and topic.
 */
export function dabBridgeTopic(bridgeId: string, topic: string) {
  return `dab/bridge/${bridgeId}/${topic}`;
}

/**
 * Asynchronously sleep for the requested duration.
 *
 * @param ms Sleep duration in millisecons.
 */
export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Wraps a DAB function with retry logic and a custom timeout.
 *
 * @param request Input DAB request.
 * @param callee Function to call with the request.
 * @param retryCount Number of retries to attempt.
 * @param timeoutMs Timeout duration in milliseconds.
 */
export async function callWithRetryAndTimeout(
  request: dab.DabRequest,
  callee: Function,
  retryCount: number,
  timeoutMs: number,
) {
  const timeoutWrapper = async (input: dab.DabRequest) => {
    return await callWithTimeout(input, callee, timeoutMs);
  };
  return await callWithRetry(request, timeoutWrapper, retryCount);
}

/**
 * Wraps a DAB function with retry logic and a custom timeout.
 *
 * @param request Input DAB request.
 * @param callee Function to call with the request.
 * @param retryCount Number of retries to attempt.
 */
export async function callWithRetry(
  request: dab.DabRequest,
  callee: Function,
  retryCount: number,
) {
  let latestError: dab.DabResponse = dabResponse();
  for (let retry = 0; retry < retryCount; retry++) {
    console.log(`Handling request (attempt #${retry + 1})`);
    try {
      const response = await callee(request);
      if (response.status !== 500) {
        // We only want to retry explicit server errors. Other error codes
        // such as 400 (bad request) or 501 (not implemented) are not
        // retryable.
        return response;
      }
      latestError = response;
    } catch (e: unknown) {
      latestError = handleError(e);
    }
  }
  return latestError;
}

/**
 * Wraps a DAB function with a custom timeout.
 *
 * @param request Input DAB request.
 * @param callee Function to call with the request.
 * @param timeoutMs Timeout duration in milliseconds.
 */
export async function callWithTimeout(
  request: dab.DabRequest,
  callee: Function,
  timeoutMs: number,
) {
  return await new Promise<dab.DabResponse>(async (resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    try {
      const response = await callee(request);
      resolve(response);
    } catch (e: unknown) {
      reject(e);
    }
  });
}

/**
 * Validates that the request object contains the required arguments.
 *
 * @param request The request object.
 * @param expectedParams The required parameters.
 */
export function validateRequest(
  request: {[key: string]: unknown},
  expectedParams?: ParameterDefinition[],
) {
  for (const arg of expectedParams ?? []) {
    // Handle missing parameters.
    if (!request.hasOwnProperty(arg.name)) {
      if (arg.required) {
        throw new Error(`Request must contain '${arg.name}' parameter`);
      } else {
        continue;
      }
    }

    // Handle type checking for found parameters.
    if (!checkParameterType(request[arg.name], arg.type, arg.isArray)) {
      const expectedType = arg.isArray ? `${arg.type} array` : arg.type;
      throw new Error(
        `Request parameter '${arg.name}' must be of type '${expectedType}'`,
      );
    }
  }
}

/**
 * Returns whether a parameter matches the desired type.
 *
 * @param parameter The parameter to validate.
 * @param type The expected type of the parameter. If the parameter is an array,
 * then this is the expected type for elements of the array.
 * @param isArray Whether the parameter is expected to be an array.
 */
function checkParameterType(
  parameter: unknown | unknown[],
  type: string,
  isArray?: boolean,
) {
  if (isArray) {
    return Array.isArray(parameter) && typeof parameter[0] === type;
  } else {
    return typeof parameter === type;
  }
}

/** Interface for the return type of chunkLogs. */
export interface ChunkLogsResult {
  chunks: string[];
  totalChunks: number;
}

/**
 * Chunks the logs into pieces of bufferSize bytes.
 * @param logs The logs to chunk.
 * @return An array of chunks and the total number of chunks.
 */
export function chunkLogs(logs: string, bufferSize: number): ChunkLogsResult {
  const chunks: string[] = [];
  let offset = 0;
  const totalChunks = Math.ceil(logs.length / bufferSize);
  while (offset < logs.length) {
    const chunk = logs.substring(offset, offset + bufferSize);
    chunks.push(chunk);
    offset += bufferSize;
  }
  return {chunks, totalChunks};
}
