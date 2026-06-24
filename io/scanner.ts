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

import * as net from 'net';
import * as os from 'os';

import {shell} from './shell';

/**
 * Checks if a port is open before calling heavy connection logic.
 */
export async function isPortOpen(
  ip: string,
  port: number,
  timeout?: number,
): Promise<boolean> {
  timeout = timeout ?? 500;

  return await new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true); // Port is open!
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, ip);
  });
}

/**
 * Checks if a device ID is in the format <ip>:<port>.
 */
export function isAuthorityString(deviceId: string): boolean {
  // regex to check if an IP and port are included
  const regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}:\d+$/;
  return regex.test(deviceId);
}

/**
 * Checks if a port is open for a given device ID in the format <ip>:<port>.
 *
 * Wrapper function for isPortOpen
 */
export async function isDeviceIdPortOpen(deviceId: string, timeout?: number) {
  // Return true in case the deviceId is not in the format <ip>:<port>
  if (!isAuthorityString(deviceId)) {
    return true;
  }
  try {
    const parts = deviceId.split(':');
    const ip = parts[0];
    const port = Number(parts[1]);
    return await isPortOpen(ip, port, timeout);
  } catch (e: unknown) {
    console.error(`Failed to parse device ID: ${deviceId}`, e);
    return true;
  }
}

/**
 * Scans the given IP for ADB and MQTT ports and attempts handshakes if open.
 */
export async function scanAndConnect(
  ip: string,
  foundBrokers: string[],
): Promise<void> {
  // Check for ADB
  if (await exports.isPortOpen(ip, 5555)) {
    console.log(`[${ip}] 5555 open. Attempting ADB connect...`);
    try {
      shell.runAdbCommand(`connect ${ip}`);
    } catch (e: unknown) {
      console.error(`Failed to connect to ADB on ${ip}:`, e);
    }
  }

  // Check for MQTT
  if (await exports.isPortOpen(ip, 1883)) {
    console.debug(`[${ip}] 1883 open. Adding to DAB brokers...`);
    foundBrokers.push(`mqtt://${ip}:1883`);
  }
}

/**
 * Converts an IP address string to a 32-bit integer.
 */
function ipToLong(ip: string): number {
  const parts = ip.split('.').map(Number);
  return (
    ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
  );
}

/**
 * Converts a 32-bit integer back to an IP address string.
 */
function longToIp(long: number): string {
  return [
    (long >>> 24) & 0xff,
    (long >>> 16) & 0xff,
    (long >>> 8) & 0xff,
    long & 0xff,
  ].join('.');
}

/**
 * Returns all IP addresses in a subnet given an interface address and netmask.
 */
export function getSubnetRange(address: string, netmask: string): string[] {
  const ipLong = ipToLong(address);
  const maskLong = ipToLong(netmask);
  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (networkLong | (~maskLong >>> 0)) >>> 0;

  const ips: string[] = [];
  // Skip network address (networkLong) and broadcast address (broadcastLong)
  for (let i = networkLong + 1; i < broadcastLong; i++) {
    ips.push(longToIp(i));
  }
  return ips;
}

/**
 * Scans all non-internal IPv4 network interfaces for devices.
 */
export async function scanAllNetworks(
  foundBrokers: string[],
  concurrencyLimit = 50,
): Promise<void> {
  const interfaces = os.networkInterfaces();
  const allIps: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const ifaceInfo = interfaces[name];
    if (!ifaceInfo) continue;

    for (const info of ifaceInfo) {
      if (info.family === 'IPv4' && !info.internal) {
        console.log(
          `Subnet detected on ${name}: ${info.address}/${info.netmask}`,
        );
        allIps.push(...getSubnetRange(info.address, info.netmask));
      }
    }
  }

  console.debug(`Starting scan of ${allIps.length} potential IP addresses...`);

  const queue = [...allIps];
  const activeScans: Array<Promise<void>> = [];

  while (queue.length > 0 || activeScans.length > 0) {
    while (queue.length > 0 && activeScans.length < concurrencyLimit) {
      const ip = queue.shift()!;
      const scanPromise = exports
        .scanAndConnect(ip, foundBrokers)
        .finally(() => {
          activeScans.splice(activeScans.indexOf(scanPromise), 1);
        });
      activeScans.push(scanPromise);
    }
    if (activeScans.length > 0) {
      await Promise.race(activeScans);
    }
  }

  console.debug('Finished scanning all networks.');
}
