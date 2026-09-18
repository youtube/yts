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

import 'yts';

import {wsServer} from 'google3/third_party/javascript/yts/io/ws_server';
import {deviceUnderTest} from 'google3/third_party/javascript/yts/test_context';
import * as ws from 'ws';

const SECOND = 1000;

describe('Network', () => {
  describe('Throughput', () => {
    yts.test({id: '06FC3F4D-C1E9-4778-A4F9-5DBDBCD71EAE'});
    it('100 Mbps', networkThroughputTest(100), 30 * SECOND);

    yts.test({id: '7CD9242B-7783-420E-A18B-21163603D133'});
    it('40 Mbps', networkThroughputTest(40), 30 * SECOND);

    yts.test({id: '58BA5CA0-C8AC-4C45-BBC7-50E79E46A1B9'});
    it('20 Mbps', networkThroughputTest(20), 30 * SECOND);
  });
});

let cachedMbps: number|undefined;

function networkThroughputTest(expectedMbps: number) {
  return async () => {
    const throttleMbps = expectedMbps * 1.2;
    const actualMbps = await measureMbps(throttleMbps);
    if (actualMbps < expectedMbps) {
      fail(
          `Measured ${actualMbps.toFixed(1)} Mbps. Expected at least ${
              expectedMbps} Mbps.`,
      );
    }
  };
}

async function measureMbps(throttleMbps: number) {
  if (cachedMbps != null) {
    console.log(`Cached Mbps: ${cachedMbps.toFixed(1)}.`);
    return cachedMbps;
  }
  const device = await deviceUnderTest();
  const script = await device.launchScript(
      'test_modules/network/scripts/scripts.js',
  );
  const wss = await wsServer.getServer(device.cleanIp);
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      const chunkSize = Number(message);
      const word = '1234567890';
      ws.send(word.repeat(chunkSize / word.length));
    });
  });
  const hostname = wsServer.getOwnHost(device.cleanIp);
  const {port} = wss.address() as ws.AddressInfo;
  const url = `ws://${hostname}:${port}`;
  cachedMbps = (await script.invoke(
                   'measureMbps',
                   url,
                   throttleMbps,
                   )) as number;
  return cachedMbps;
}
