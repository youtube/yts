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

import {promises as dnsPromises} from 'dns';
import * as dns from './dns';
import 'jasmine';

describe('Dns', () => {
  let mockResolver: jasmine.SpyObj<dnsPromises.Resolver>;

  beforeEach(() => {
    mockResolver = jasmine.createSpyObj('Resolver', ['resolve']);
    spyOn(dnsPromises, 'Resolver').and.returnValue(mockResolver);
    mockResolver.resolve.and.resolveTo(['127.0.0.1']);
  });

  it('Leaves valid ipv4 addresses alone', async () => {
    // We don't iterate through every possible valid IP address, because it
    // takes too long
    for (let oct1 = 0; oct1 < 256; oct1++) {
      const validIp = `10.0.0.${oct1}`;
      expect(await dns.resolve(validIp)).toEqual(validIp);
    }
  });

  it('Leaves valid ipv4 addresses with protocol', async () => {
    expect(await dns.resolve('http://127.0.0.1')).toEqual('http://127.0.0.1');
  });

  it('Leaves valid ipv4 addresses with port', async () => {
    expect(await dns.resolve('127.0.0.1:22')).toEqual('127.0.0.1:22');
  });

  it('Leaves valid ipv4 addresses with port and path', async () => {
    expect(await dns.resolve('127.0.0.1:22/path')).toEqual('127.0.0.1:22/path');
  });

  it('Performs a DNS lookup for a simple service name', async () => {
    expect(await dns.resolve('www.google.com')).toEqual('127.0.0.1');
  });

  it('Performs a DNS lookup for a valid URL', async () => {
    expect(await dns.resolve('http://www.google.com')).toEqual(
      'http://127.0.0.1',
    );
  });

  it('Maintains path formatting from input', async () => {
    expect(await dns.resolve('http://www.google.com/')).toEqual(
      'http://127.0.0.1/',
    );
    expect(await dns.resolve('http://www.google.com/this/is/a/path')).toEqual(
      'http://127.0.0.1/this/is/a/path',
    );
    expect(await dns.resolve('http://www.google.com/this/is/a/path/')).toEqual(
      'http://127.0.0.1/this/is/a/path/',
    );
  });

  it('Maintains port number formatting from input', async () => {
    expect(await dns.resolve('http://www.google.com:1883')).toEqual(
      'http://127.0.0.1:1883',
    );
    expect(await dns.resolve('www.google.com:1883')).toEqual('127.0.0.1:1883');
    expect(await dns.resolve('www.google.com:1883/path')).toEqual(
      '127.0.0.1:1883/path',
    );
    expect(await dns.resolve('mqtt://www.google.com:1883/path')).toEqual(
      'mqtt://127.0.0.1:1883/path',
    );
  });

  it('Resolves Kubernetes service names', async () => {
    expect(
      await dns.resolve('namespace.servicename.svc.cluster.local'),
    ).toEqual('127.0.0.1');
  });

  it('Resolves Kubernetes with protocol', async () => {
    expect(
      await dns.resolve('mqtt://namespace.servicename.svc.cluster.local'),
    ).toEqual('mqtt://127.0.0.1');
  });

  it('Errors on timeout', async () => {
    mockResolver.resolve.and.rejectWith(new Error('DNS timeout'));
    await expectAsync(dns.resolve('www.google.com')).toBeRejectedWithError(
      /DNS lookup for www.google.com failed with code .*/,
    );
  });
});
