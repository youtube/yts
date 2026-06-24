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

import * as os from 'os';

import {overrideConfig} from './config';
import {TEST_ONLY} from './ws_server';

describe('WsServer', () => {
  describe('getOwnHost', () => {
    function fakeNetworkInterfaces(
      networkInterfaces: NodeJS.Dict<Array<Partial<os.NetworkInterfaceInfo>>>,
    ) {
      spyOn(os, 'networkInterfaces').and.returnValue(
        networkInterfaces as NodeJS.Dict<os.NetworkInterfaceInfo[]>,
      );
    }

    it('no interfaces', () => {
      const wsServer = new TEST_ONLY.WsServer();
      fakeNetworkInterfaces({
        'lo': [
          {
            address: '127.0.0.1',
            netmask: '255.0.0.0',
            family: 'IPv4',
            internal: true,
          },
          {
            address: '::1',
            netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
            family: 'IPv6',
            internal: true,
          },
        ],
        'enp1s0': [
          {
            address: 'fd50:d5bd:9434:2dfa:c36f:6817:9243:f245',
            netmask: 'ffff:ffff:ffff:ffff::',
            family: 'IPv6',
            internal: false,
          },
        ],
      });
      expect(wsServer.getOwnHost(undefined)).toEqual('localhost');
    });

    it('one external interface', () => {
      const wsServer = new TEST_ONLY.WsServer();
      fakeNetworkInterfaces({
        'lo': [
          {
            address: '127.0.0.1',
            netmask: '255.0.0.0',
            family: 'IPv4',
            internal: true,
          },
          {
            address: '::1',
            netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
            family: 'IPv6',
            internal: true,
          },
        ],
        'enp1s0': [
          {
            address: '172.27.139.19',
            netmask: '255.255.252.0',
            family: 'IPv4',
            internal: false,
          },
          {
            address: 'fd50:d5bd:9434:2dfa:c36f:6817:9243:f245',
            netmask: 'ffff:ffff:ffff:ffff::',
            family: 'IPv6',
            internal: false,
          },
          {
            address: 'fd50:d5bd:9434:2dfa:f304:8c1f:9c02:f8d7',
            netmask: 'ffff:ffff:ffff:ffff::',
            family: 'IPv6',
            internal: false,
          },
          {
            address: 'fe80::3bdd:2104:5b9d:6a00',
            netmask: 'ffff:ffff:ffff:ffff::',
            family: 'IPv6',
            internal: false,
          },
        ],
      });
      expect(wsServer.getOwnHost(undefined)).toEqual('172.27.139.19');
    });

    it('two external interfaces with preferredNetworkInterface', () => {
      fakeNetworkInterfaces({
        'one': [
          {
            address: '172.27.139.19',
            netmask: '255.255.252.0',
            family: 'IPv4',
            internal: false,
          },
        ],
        'two': [
          {
            address: '192.168.1.111',
            netmask: '255.255.252.0',
            family: 'IPv4',
            internal: false,
          },
        ],
      });
      overrideConfig({preferredNetworkInterface: 'two'});
      const wsServer = new TEST_ONLY.WsServer();
      // deviceIp will be undefined when connected via USB
      expect(wsServer.getOwnHost(undefined)).toEqual('192.168.1.111');
    });

    it('two external interfaces with preferredNetworkInterface and deviceIp', () => {
      fakeNetworkInterfaces({
        'one': [
          {
            address: '172.27.139.19',
            netmask: '255.255.252.0',
            family: 'IPv4',
            internal: false,
          },
        ],
        'two': [
          {
            address: '192.168.1.111',
            netmask: '255.255.255.0',
            family: 'IPv4',
            internal: false,
          },
        ],
      });
      overrideConfig({preferredNetworkInterface: 'two'});
      const wsServer = new TEST_ONLY.WsServer();
      expect(wsServer.getOwnHost('172.27.139.200')).toEqual('192.168.1.111');
    });

    it('two external interfaces without preferredNetworkInterface but with deviceIp', () => {
      fakeNetworkInterfaces({
        'one': [
          {
            address: '172.27.139.19',
            netmask: '255.255.252.0',
            family: 'IPv4',
            internal: false,
          },
        ],
        'two': [
          {
            address: '192.168.1.111',
            netmask: '255.255.255.0',
            family: 'IPv4',
            internal: false,
          },
        ],
      });
      const wsServer = new TEST_ONLY.WsServer();
      expect(wsServer.getOwnHost('192.168.1.17')).toEqual('192.168.1.111');
    });
  });
});

describe('sameSubnet', () => {
  function checkSubnet(args: {
    ip1: string;
    ip2: string;
    netmask: string;
    expected: boolean | undefined;
  }) {
    expect(TEST_ONLY.sameSubnet(args))
      .withContext(`${args.ip1}, ${args.ip2}, ${args.netmask}`)
      .toBe(args.expected);
  }

  it('mask 255.255.0.0', () => {
    checkSubnet({
      ip1: '192.168.0.1',
      ip2: '192.168.1.2',
      netmask: '255.255.0.0',
      expected: true,
    });
    checkSubnet({
      ip1: '192.168.0.1',
      ip2: '127.0.0.1',
      netmask: '255.255.255.0',
      expected: false,
    });
  });

  it('mask 255.255.252.0', () => {
    checkSubnet({
      ip1: '172.27.139.19',
      ip2: '172.27.138.32',
      netmask: '255.255.252.0',
      expected: true,
    });
    checkSubnet({
      ip1: '172.27.137.179',
      ip2: '172.27.136.215',
      netmask: '255.255.252.0',
      expected: true,
    });
    checkSubnet({
      ip1: '172.27.140.1',
      ip2: '172.27.136.215',
      netmask: '255.255.252.0',
      expected: false,
    });
  });

  it('invalid inputs', () => {
    checkSubnet({
      ip1: '192.168.blah.blah',
      ip2: '192.168.ha.ha',
      netmask: '255.255.255.0',
      expected: undefined,
    });
    checkSubnet({
      ip1: '192.168.0.1',
      ip2: '192.168.0.2',
      netmask: '255.255.mask.mask',
      expected: undefined,
    });
  });
});
