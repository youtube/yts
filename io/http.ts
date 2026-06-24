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

// Renamed so as to not conflict with this class's name
import * as dns from 'dns';
import * as httpNode from 'http';

import {getConfig} from './config';
import {log} from './log';

dns.setDefaultResultOrder('ipv4first');

/**
 * Represents HTTP headers as documented in
 * https://nodejs.org/api/http.html#http_message_headers
 */
export interface HttpHeaders {
  [header: string]: string | string[] | undefined;
}

/**
 * HTTP request parameters. We use simplified custom interface instead of
 * standard http.ClientRequest to allow unit tests to simulate HTTP activity.
 */
export interface HttpRequest {
  url: string;
  body?: string;
  method?: 'GET' | 'POST' | 'DELETE';
  headers?: HttpHeaders;
}

/**
 * Represents a response to an HTTP request. We use simplified custom interface
 * instead of standard http.IncomingMessage to allow unit tests to simulate HTTP
 * activity.
 */
export interface HttpResponse {
  body?: string;
  headers: HttpHeaders;
}

/**
 * Simple HTTP request implementation. Unit tests can provide simulated HTTP
 * services.
 */
class Http {
  request(options: HttpRequest): Promise<HttpResponse> {
    let body = '';
    return new Promise((resolve, reject) => {
      const headers = Object.assign({}, options.headers);
      headers['Origin'] = 'package:com.yts.app';
      printRequest(headers, options);
      const url = new URL(options.url);
      const nativeOptions: httpNode.RequestOptions = {
        host: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: options.method,
        headers,
      };
      const request = httpNode.request(nativeOptions, (response) => {
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          printResponse(body, response);
          const code = response.statusCode;
          clearTimeout(h);
          if (code && code >= 200 && code < 300) {
            resolve({body, headers: response.headers});
          } else {
            let helpfulMessage = '';
            if (code === 401) {
              helpfulMessage =
                'A 401 error usually means a prompt has appeared on the screen asking the user to approve connections from the machine running this code. ';
            }
            reject(
              new Error(
                `${code} ${response.statusMessage} (${options.url}). ${helpfulMessage}` +
                  `To reproduce this error using curl execute: ${getRequestAsCurlCommand(options)}\n`,
              ),
            );
          }
        });
      });
      request.on('error', (error) => {
        console.debug(`Error ${options.method}ing ${options.url}: ${error}`);
        console.debug(
          'To reproduce this error using curl, execute: ' +
            getRequestAsCurlCommand(options),
        );
        clearTimeout(h);
        reject(error);
      });
      const h = setTimeout(() => {
        request.destroy(
          new Error(
            `HTTP request timed out after ${getConfig().httpTimeout} ms`,
          ),
        );
      }, getConfig().httpTimeout);
      request.end(options.body);
    });
  }
}

function getRequestAsCurlCommand(options: HttpRequest): string {
  let curlCommand = 'curl';
  if (options.method) {
    curlCommand += ` -X ${options.method}`;
  }
  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      curlCommand += ` -H '${key}: ${value}'`;
    }
  }
  if (options.body) {
    curlCommand += ` -d '${options.body}'`;
  }
  curlCommand += ` ${options.url}`;
  return curlCommand;
}

function printRequest(headers: HttpHeaders, options: HttpRequest) {
  console.debug(`${options.method || 'GET'} ${options.url}`);
  if (headers) {
    console.debug(`  Headers: ${JSON.stringify(headers)}`);
  }
  if (options.body) {
    console.debug('  Body: ' + options.body);
  }
}

function printResponse(body: string, response: httpNode.IncomingMessage) {
  const suppressBody = getConfig().suppressOutput.includes('HTTP_BODY');
  if (log.verbose && !suppressBody) {
    console.debug(`${response.statusCode} ${response.statusMessage}`);
    if (response.headers) {
      console.debug(`  Headers: ${JSON.stringify(response.headers)}`);
    }
    if (body) {
      console.debug(`  Body: ${body}`);
    }
  }
}

/** Global yts_server value store */
export const http = new Http();

/** Allow reference to individual class for testing purposes */
export const TEST_ONLY = {Http, getRequestAsCurlCommand};
