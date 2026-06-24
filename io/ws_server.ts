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

import {getConfig} from 'google3/third_party/javascript/yts/io/config';
import {createHttpServer} from 'google3/third_party/javascript/yts/io/create_http_server';
import {log} from 'google3/third_party/javascript/yts/io/log';
import {Ports} from 'google3/third_party/javascript/yts/yts_common/types';
import * as os from 'os';
import * as ws from 'ws';

class WsServer {
  /**
   * Gets websocket server that opens on provided ports.
   * @param deviceIp The IP address of the device, used for network interface
   *     selection.
   * @param ports Optional ports to use for the HTTP server.
   * @param formatter An optional function to format incoming Uint8Array
   *     messages into a human-readable string for verbose debugging output.
   */
  async getServer(
      deviceIp: string|undefined,
      ports?: Ports,
      formatter?: (message: Uint8Array) => string | undefined,
  ) {
    const httpServer = await createHttpServer(ports);
    const wss = new ws.Server({server: httpServer});
    if (log.verbose || log.verboseOutputFile) {
      //
      // When '--verbose' flag is provided, we listen to all connections and
      // messages and print out detailed log. Useful for debugging.
      //
      wss.on('connection', (ws, request) => {
        const ip = request.socket.remoteAddress;
        console.debug(
          `WEBSOCKET client connected from ${ip} to path ${request.url}.`,
        );
        this.printHeaders(request.headers);

        ws.on('message', (message) => {
          this.printDebug(message, formatter);
        });

        ws.on('close', () => {
          console.debug('WEBSOCKET client disconnected.');
        });
      });
      const hostname = this.getOwnHost(deviceIp);
      const {port} = wss.address() as ws.AddressInfo;
      console.debug(`WEBSOCKET listening ws://${hostname}:${port}.`);
    }
    wss.on('close', () => {
      httpServer.close();
    });
    return wss;
  }

  /**
   * Returns local IPv4 address of the machine this is running on.
   *
   * @param deviceIp: IP address of the device we're trying to connect
   *     to. The function will prefer to return IP address that
   *     corresponds to the network interface that the device is connected to.
   *     This is needed for setups that have multiple network interfaces.
   */
  getOwnHost(deviceIp: string | undefined) {
    const {preferredNetworkInterface, forcedHostAddress} = getConfig();
    if (forcedHostAddress) {
      return forcedHostAddress;
    }

    const nets = os.networkInterfaces();
    const candidates: os.NetworkInterfaceInfo[] = [];
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]!) {
        // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          // Prefer a network interface, but if it is unavailable, return
          // another available one after finished searching
          if (preferredNetworkInterface === name) {
            return net.address;
          } else {
            candidates.push(net);
          }
        }
      }
    }

    if (candidates.length === 0) {
      // for tests
      return 'localhost';
    }

    if (candidates.length === 1) {
      return candidates[0].address;
    }

    console.debug(
      `Multiple network interfaces found: ${JSON.stringify(candidates, null, 2)}.`,
    );
    console.debug(
      `Will select one that is on the same subnet as the device: ${deviceIp}.`,
    );

    //
    // Detect best candidate based on matching subnet.
    //
    if (deviceIp) {
      for (const candidate of candidates) {
        const same = sameSubnet({
          ip1: candidate.address,
          ip2: deviceIp,
          netmask: candidate.netmask,
        });
        if (same) {
          console.debug(`Found subnet match: ${JSON.stringify(candidate)}.`);
          return candidate.address;
        }
      }
    }

    console.debug(`No subnet match found, returning first candidate.`);
    return candidates[0].address;
  }

  private printHeaders(headers: object | undefined) {
    if (headers) {
      console.debug(`Headers: ${JSON.stringify(headers)}`);
    }
  }

  /**
   * Prints a debug message to the console if a formatter is provided.
   *
   * @param message The message to print.
   * @param formatter An optional function to format the message into a
   *     human-readable string. If undefined, the message will not be printed.
   */
  private printDebug(
      message: ws.Data,
      formatter?: (message: Uint8Array) => string | undefined,
  ) {
    if (!formatter) return;
    const data = new Uint8Array(message as Buffer);
    const formatted = formatter(data);
    if (formatted) {
      console.debug(`WEBSOCKET received message: ${formatted}`);
    }
  }
}

function sameSubnet(args: {ip1: string; ip2: string; netmask: string}) {
  const {ip1, ip2, netmask} = args;
  const parts1 = ip1.split('.');
  const parts2 = ip2.split('.');
  const maskParts = netmask.split('.');
  const length = maskParts.length;
  if (parts1.length !== length || parts2.length !== length) {
    return undefined;
  }
  for (let i = 0; i < length; i++) {
    if (parts1[i] === parts2[i]) continue;
    const part1 = Number(parts1[i]);
    if (isNaN(part1)) return undefined;
    const part2 = Number(parts2[i]);
    if (isNaN(part2)) return undefined;
    const mask = Number(maskParts[i]);
    if (isNaN(mask)) return undefined;
    if ((part1 & mask) !== (part2 & mask)) {
      return false;
    }
  }
  return true;
}

/** Web socket server generator */
export const wsServer = new WsServer();

export const TEST_ONLY = {WsServer, sameSubnet};
