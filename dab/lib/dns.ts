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

/**
 * @fileoverview DNS resolution utility functions.
 */

import {promises as dnsPromises} from 'dns';

/**
 * DNS error interface. Based on https://nodejs.org/api/dns.html#error-codes.
 */
export interface DnsError extends Error {
  code: string;
}

const IPV4_REGEX = new RegExp('((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}');

const DNS_TIMEOUT_MS = 250;

async function resolveHostname(hostname: string): Promise<string> {
  let addresses: string[] = [];
  try {
    const resolver = new dnsPromises.Resolver({
      timeout: DNS_TIMEOUT_MS,
      tries: 1,
    });
    addresses = await resolver.resolve(hostname);
  } catch (e: unknown) {
    if (e instanceof Error) {
      // Assume is DnsError is described in
      // https://nodejs.org/api/dns.html#error-codes
      const code = (e as DnsError).code;
      throw new Error(`DNS lookup for ${hostname} failed with code ${code}`);
    } else {
      // Unexpected throw type
      throw e;
    }
  }
  if (addresses.length === 0) {
    throw new Error(`No addresses found for DNS lookup ${hostname}`);
  }
  return addresses[0];
}

/**
 * Helper function to perform a basic DNS resolution.
 *
 * If the URI string looks already resolved into an IP address then the string
 * is left alone.
 *
 * @param uri The URI to resolve.
 * @return An IP address of the resolved URI.
 */
export async function resolve(uri: string): Promise<string> {
  // If it's already an IP address, nothing to do.
  if (IPV4_REGEX.test(uri)) {
    return uri;
  }

  // Otherwise, we assume it's a uri
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(uri);
  } catch (e: unknown) {
    if (uri.split(':').length === 2) {
      const [hostname, remainder] = uri.split(':');
      const resolvedIp = await resolveHostname(hostname);
      return `${resolvedIp}:${remainder}`;
    }
    // If fail, assume it's a raw service name and try to resolve anyway
    return resolveHostname(uri);
  }

  let missingProtocol = false;
  if (!parsedUrl.hostname) {
    // We were missing the protocol, reparse again with a protocol
    parsedUrl = new URL(`mqtt://${uri}`);
    missingProtocol = true;
  }

  parsedUrl.hostname = await resolveHostname(parsedUrl.hostname);

  // Edge case: if no path is provided we trim the trailing slash if originally
  // trimmed
  if (!uri.endsWith('/') && parsedUrl.pathname === '/') {
    return parsedUrl.toString().slice(0, -1);
  }

  if (missingProtocol) {
    return parsedUrl.toString().split('://')[1];
  }
  return parsedUrl.toString();
}
