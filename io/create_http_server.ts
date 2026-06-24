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

import * as http from 'http';

import {Ports} from '../yts_common/types';

import {getConfig} from './config';

declare interface NodeJsError extends Error {
  /**
   * https://nodejs.org/api/errors.html#errors_error_code
   */
  code?: string;
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

/**
 * Creates an HTTP server and starts listening on the first available port in
 * the given range. Throws error if all ports are already in use.
 */
export async function createHttpServer(
  ports: Ports | undefined,
  hostname?: string,
) {
  if (!ports) ports = getConfig();
  const server = http.createServer();
  const length = ports.maxPort - ports.minPort + 1;
  let port = ports.minPort + getRandomInt(length);
  for (let i = 0; i < length; i++) {
    console.debug(`Starting HTTP server on port ${port}...`);
    const open = await tryListen(server, port, hostname);
    if (open) {
      const address = JSON.stringify(server.address());
      console.debug(`Started at ${address}.`);
      return server;
    } else {
      console.debug(`Port ${port} is already in use.`);
      await close(server);
    }
    port++;
    if (port > ports.maxPort) {
      port = ports.minPort;
    }
  }
  throw new Error(
    `Failed to find an open port in the range ${ports.minPort}-${ports.maxPort}.`,
  );
}

async function tryListen(server: http.Server, port: number, hostname?: string) {
  try {
    await listen(server, port, hostname);
    return true;
  } catch (e: unknown) {
    if ((e as NodeJsError).code === 'EADDRINUSE') {
      return false;
    } else {
      throw e;
    }
  }
}

function listen(server: http.Server, port: number, hostname?: string) {
  return new Promise<void>((resolve, reject) => {
    function onListening() {
      off();
      resolve();
    }

    function onError(e: {code: string}) {
      off();
      reject(e);
    }

    function off() {
      server.off('listening', onListening);
      server.off('error', onError);
    }

    server.on('listening', onListening);
    server.on('error', onError);
    server.listen(port, hostname);
  });
}

function close(server: http.Server) {
  return new Promise<void>((resolve) => {
    server.close();
    server.once('close', resolve);
  });
}
