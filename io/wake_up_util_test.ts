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

import * as dgram from 'dgram';

import * as wakeUp from './wake_up_util';

describe('wake up test', () => {
  it('correctly generates wake-on-lan packets', () => {
    const wakeUpHeader = 'MAC=dc:54:d7:5b:94:a6;Timeout=35';

    const buffStr = 'ff'.repeat(6) + 'dc54d75b94a6'.repeat(16);
    const packet = wakeUp.getWakeUpPacket(wakeUpHeader);
    expect(packet.toString('hex')).toEqual(buffStr);
  });

  it('sends wake-on-lan packets', async () => {
    const buffer = Buffer.from('00', 'hex');
    const socket = dgram.createSocket({type: 'udp4', reuseAddr: true});

    const address = '123.123.123.123';

    spyOn(socket, 'setBroadcast').and.callFake(() => {});
    // Spies on socket.bind to instantly execute its completion callback,
    // simulating an immediate successful bind operation.
    const bindSpy = spyOn(socket, 'bind').and.callFake(
      (...args: unknown[]) => {
        const bindCallback = args[args.length - 1] as (() => void) | undefined;
        if (typeof bindCallback === 'function') {
          bindCallback();
        }
        return socket;
      },
    );

    const sendSpy = spyOn(socket, 'send').and.callFake(
      (...args: unknown[]) => {
        const sendCallback = args[args.length - 1] as
          | ((err: Error | null) => void)
          | undefined;
        if (typeof sendCallback === 'function') {
          sendCallback(null);
        }
      },
    );

    await wakeUp.bindAndSend(socket, address, buffer);

    expect(bindSpy.calls.count()).toBe(1);
    expect(bindSpy.calls.first().args).toEqual([
      0,
      address,
      jasmine.anything(),
    ]);
    expect(sendSpy.calls.count()).toBe(1);
    expect(sendSpy.calls.first().args).toEqual([
      buffer,
      0,
      buffer.length,
      9,
      '255.255.255.255',
      jasmine.anything(),
    ]);
  });

  it('rejects if socket.bind fails asynchronously', async () => {
    const buffer = Buffer.from('00', 'hex');
    const socket = dgram.createSocket({type: 'udp4', reuseAddr: true});
    const address = '123.123.123.123';

    spyOn(socket, 'bind').and.callFake(() => {
      setTimeout(() => {
        socket.emit('error', new Error('Simulated bind error'));
      }, 5);
      return socket;
    });

    let error: unknown;
    try {
      await wakeUp.bindAndSend(socket, address, buffer);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
  });
});
