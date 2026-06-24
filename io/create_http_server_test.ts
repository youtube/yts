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

import * as http from 'http';
import * as net from 'net'; // from //third_party/javascript/typings/node

import {Ports} from '../yts_common/types';

import {createHttpServer} from './create_http_server';

describe('createHttpServer', () => {
  it('find available port', async () => {
    const ports: Ports = {
      minPort: 55000,
      maxPort: 55002,
    };
    const server0 = await createHttpServer(ports, 'localhost');
    expectPort(server0, ports);
    const server1 = await createHttpServer(ports, 'localhost');
    expectPort(server1, ports);
    const server3 = await createHttpServer(ports, 'localhost');
    expectPort(server3, ports);
    let error: Error | undefined;
    try {
      await createHttpServer(ports);
    } catch (e: unknown) {
      error = e as Error;
    }
    expect(error).withContext('error').toBeDefined();
    expect(error!.message).toEqual(
      'Failed to find an open port in the range 55000-55002.',
    );

    server0.close();
    server1.close();
    server3.close();
  });

  it('two at the same time', async () => {
    const ports: Ports = {
      minPort: 55000,
      maxPort: 55002,
    };
    const [server0, server1] = await Promise.all([
      createHttpServer(ports, 'localhost'),
      createHttpServer(ports, 'localhost'),
    ]);
    expectPort(server0, ports);
    expectPort(server1, ports);

    server0.close();
    server1.close();
  });
});

function expectPort(server: http.Server, ports: Ports) {
  const port = (server.address() as net.AddressInfo).port;
  expect(port).withContext('port').toBeGreaterThanOrEqual(ports.minPort);
  expect(port).withContext('port').toBeLessThanOrEqual(ports.maxPort);
}
