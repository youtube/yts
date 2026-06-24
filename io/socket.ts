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
import * as os from 'os';
import * as wakeUp from './wake_up_util';

const SSDP_IP = '239.255.255.250';
const SSDP_PORT = 1900;

/**
 * Simplified UDP socket for SSDP. Unit tests can provide simulated DIAL
 * devices.
 */
export interface Socket {
  bind(callback: (buffer: Buffer) => void): Promise<void>;
  msearch(): Promise<void>;
  close(): void;
  wakeUp(wakeUpHeader: string): Promise<void>;
}

/**
 * Implements a UDP socket for SSDP and Wake-On-Lan functionality.
 * It creates and manages multiple UDP sockets, one for each non-internal IPv4
 * network interface.
 */
class SsdpSocket implements Socket {
  private readonly sockets: {[address: string]: dgram.Socket} = createSockets();

  async bind(callback: (buffer: Buffer) => void): Promise<void> {
    for (const [address, socket] of Object.entries(this.sockets)) {
      await bindSocket(socket, address, (buffer) => {
        console.debug(buffer.toString());
        callback(buffer);
      });
    }
  }

  async msearch(): Promise<void> {
    const message: string[] = [
      'M-SEARCH * HTTP/1.1',
      `HOST: ${SSDP_IP}:${SSDP_PORT}`,
      'ST: urn:dial-multiscreen-org:service:dial:1',
      'MAN: "ssdp:discover"',
      'MX: 3',
      '\r\n',
    ];
    const buffer = Buffer.from(message.join('\r\n'), 'ascii');
    console.debug(buffer.toString());
    for (const socket of Object.values(this.sockets)) {
      await sendMessage(socket, buffer);
    }
  }

  /**
   * Broadcasts Wake-On-Lan packet to network and wakes device with given MAC
   * address
   */
  async wakeUp(wakeUpHeader: string): Promise<void> {
    console.log(`Wake up header: ${wakeUpHeader}`);
    const wakeUpPacket = wakeUp.getWakeUpPacket(wakeUpHeader);

    const promises: Array<Promise<void>> = [];
    for (const [address, socket] of Object.entries(this.sockets)) {
      console.log(`Sending wake up packet from ${address}`);
      promises.push(wakeUp.bindAndSend(socket, address, wakeUpPacket));
    }
    await Promise.allSettled(promises);
  }

  close() {
    for (const socket of Object.values(this.sockets)) {
      socket.close();
    }
  }
}

/**
 * Factory function to create a new SsdpSocket instance.
 */
export function makeSsdpSocket(): Socket {
  return new SsdpSocket();
}

function createSockets() {
  const sockets: {[address: string]: dgram.Socket} = {};
  const interfaces = os.networkInterfaces();
  for (const ipInfos of Object.values(interfaces)) {
    for (const ipInfo of ipInfos!) {
      if (ipInfo.internal === false && ipInfo.family === 'IPv4') {
        const socket = dgram.createSocket({type: 'udp4', reuseAddr: true});
        socket.unref();
        sockets[ipInfo.address] = socket;
      }
    }
  }
  return sockets;
}

function bindSocket(
  socket: dgram.Socket,
  iface: string,
  callback: (buffer: Buffer, rinfo: dgram.RemoteInfo) => void,
) {
  return new Promise<void>((resolve, reject) => {
    socket.on('error', reject);
    socket.on('message', callback);
    socket.on('listening', () => {
      socket.addMembership(SSDP_IP, iface);
      socket.setMulticastTTL(4);
      resolve();
    });
    socket.bind(0, iface);
  });
}

function sendMessage(socket: dgram.Socket, buffer: Buffer) {
  return new Promise<void>((resolve, reject) => {
    socket.send(
      buffer as Uint8Array,
      0,
      buffer.length,
      SSDP_PORT,
      SSDP_IP,
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      },
    );
  });
}
