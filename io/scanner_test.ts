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
import * as scanner from './scanner';
import {shell} from './shell';

describe('scanner', () => {
  describe('getSubnetRange', () => {
    it('calculates correct IPs for a /24 subnet', () => {
      const ips = scanner.getSubnetRange('192.168.1.10', '255.255.255.0');
      expect(ips.length).toBe(254);
      expect(ips[0]).toBe('192.168.1.1');
      expect(ips[253]).toBe('192.168.1.254');
    });

    it('calculates correct IPs for a /30 subnet', () => {
      const ips = scanner.getSubnetRange('10.0.0.1', '255.255.255.252');
      // Subnet: 10.0.0.0, Broadcast: 10.0.0.3, IPs: 10.0.0.1, 10.0.0.2
      expect(ips.length).toBe(2);
      expect(ips).toContain('10.0.0.1');
      expect(ips).toContain('10.0.0.2');
    });
  });

  describe('scanAllNetworks', () => {
    let runAdbCommandSpy: jasmine.Spy;

    beforeEach(() => {
      runAdbCommandSpy = jasmine.createSpy('runAdbCommand');
      spyOn(shell, 'runAdbCommand').and.callFake(runAdbCommandSpy);
      spyOn(shell, 'adbExists').and.returnValue(true);

      spyOn(os, 'networkInterfaces').and.returnValue({
        'eth0': [
          {
            address: '192.168.1.1',
            netmask: '255.255.255.252', // Subnet: 192.168.1.0, Range: .1, .2
            family: 'IPv4',

            internal: false,
            mac: '00:00:00:00:00:00',
            cidr: '192.168.1.1/30',
            // Casting to any to avoid providing all fields of
            // NetworkInterfaceInfo.
            // tslint:disable-next-line:no-any
          } as any,
        ],
      });
    });

    it('scans detected subnets and attempts connections', async () => {
      // Mock isPortOpen on the scanner module
      spyOn(scanner, 'isPortOpen').and.callFake(
        (ip: string, port: number | undefined) => {
          return Promise.resolve(ip === '192.168.1.1' && port === 5555);
        },
      );

      const foundBrokers: string[] = [];
      await scanner.scanAllNetworks(foundBrokers, 1);

      expect(runAdbCommandSpy).toHaveBeenCalledWith('connect 192.168.1.1');
      expect(runAdbCommandSpy).not.toHaveBeenCalledWith('connect 192.168.1.2');
    });
  });

  describe('isPortOpen', () => {
    let connectSpy: jasmine.Spy;
    let setTimeoutSpy: jasmine.Spy;
    let connectCallback: () => void;

    beforeEach(() => {
      connectSpy = jasmine.createSpy('connect').and.callFake(() => {
        if (connectCallback) connectCallback();
      });
      setTimeoutSpy = jasmine.createSpy('setTimeout');
      const mockSocket = {
        setTimeout: setTimeoutSpy,
        on: jasmine
          .createSpy('on')
          .and.callFake((event: string, cb: () => void) => {
            if (event === 'connect') {
              connectCallback = cb;
            }
          }),
        connect: connectSpy,
        destroy: jasmine.createSpy('destroy'),
      };
      // "any" is ok in tests
      //tslint:disable-next-line:no-any
      spyOn(net, 'Socket').and.returnValue(mockSocket as any);
    });

    it('handles separate ip and port', async () => {
      await scanner.isPortOpen('1.2.3.4', 80);
      expect(connectSpy).toHaveBeenCalledWith(80, '1.2.3.4');
      expect(setTimeoutSpy).toHaveBeenCalledWith(500);
    });

    it('handles separate ip and port with timeout', async () => {
      await scanner.isPortOpen('1.2.3.4', 80, 1000);
      expect(connectSpy).toHaveBeenCalledWith(80, '1.2.3.4');
      expect(setTimeoutSpy).toHaveBeenCalledWith(1000);
    });

    it('handles ip:port string', async () => {
      await scanner.isDeviceIdPortOpen('1.2.3.4:80');
      expect(connectSpy).toHaveBeenCalledWith(80, '1.2.3.4');
      expect(setTimeoutSpy).toHaveBeenCalledWith(500);
    });

    it('handles ip:port string with timeout', async () => {
      await scanner.isDeviceIdPortOpen('1.2.3.4:80', 1000);
      expect(connectSpy).toHaveBeenCalledWith(80, '1.2.3.4');
      expect(setTimeoutSpy).toHaveBeenCalledWith(1000);
    });
  });
});
