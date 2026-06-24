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

import * as dgram from 'dgram';

const WAKE_UP_BROADCAST_ADDRESS = '255.255.255.255';
const WAKE_UP_PORT = 9;

/** Generates buffer representing a Wake-On-Lan packet */
export function getWakeUpPacket(wakeUpHeader: string) {
  let match: RegExpMatchArray | null;
  const macRgx = /(([a-fA-F0-9]{2}[:]){5}[a-fA-F0-9]{2})/i;

  match = wakeUpHeader.match(macRgx);
  if (!match || !match[1]) {
    throw new Error(`Invalid wake up header: ${wakeUpHeader}`);
  }
  const macAddr = match[1].replace(/:/g, '');

  const buffStr = 'ff'.repeat(6) + macAddr.repeat(16);
  const buff = Buffer.from(buffStr, 'hex');

  return buff;
}

/** Binds a provided socket to provided address and sends WoL packet */
export function bindAndSend(
  socket: dgram.Socket,
  address: string,
  packet: Buffer,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    socket.once('error', reject);
    socket.bind(0, address, () => {
      socket.setBroadcast(true);
      socket.send(
          packet as Uint8Array,
          0,
          packet.length,
          WAKE_UP_PORT,
          WAKE_UP_BROADCAST_ADDRESS,
          (err: Error|null) => {
            if (typeof socket.removeListener === 'function') {
              socket.removeListener('error', reject);
            }
            if (err) {
              reject(err);
            } else {
              console.debug('Magic packet sent!');
              resolve();
            }
          },
      );
    });
  });
}
