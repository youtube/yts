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

/**
 * Difference between Unix epoch (1970-01-01) and NTP epoch (1900-01-01) in seconds and milliseconds.
 * RFC 5905 section 6.
 */
const NTP_DELTA_SECONDS = 2208988800n;
const NTP_DELTA_MS = 2208988800000n;
const FRAC_DIVISOR = 0x100000000n;

/**
 * Obtains current time from public NTP server at time.google.com.
 * Spec: https://www.rfc-editor.org/rfc/rfc5905.html
 */
export async function getCurrentTime(): Promise<Date> {
  if (!dgram.createSocket) {
    throw new Error(
      'Cannot use this class library within Cobalt in yts agent; please only use cli-side.',
    );
  }
  const offset = await getNtpOffset();
  return new Date(Date.now() + Math.round(offset));
}

/**
 * https://www.rfc-editor.org/rfc/rfc5905.html
 * 8.  On-Wire Protocol
 *
 * @return offset in milliseconds
 */
async function getNtpOffset(): Promise<number> {
  const servers = [
    'time1.google.com',
    'time2.google.com',
    'time3.google.com',
    'time4.google.com',
  ];

  const sampleSize = 8;
  const maxErrors = 3;
  const samples: number[] = [];
  let errorCount = 0;
  while (samples.length < sampleSize && errorCount < maxErrors) {
    const p: Array<Promise<unknown>> = [];
    for (const server of servers) {
      p.push(
        queryNtpServer(server)
          .then((p) => {
            const t1 = p.org.getTime();
            const t2 = p.rec.getTime();
            const t3 = p.xmt.getTime();
            const t4 = p.dst.getTime();
            const theta = (t2 - t1 + (t3 - t4)) / 2;
            samples.push(theta);
          })
          .catch((e) => {
            errorCount++;
            console.debug(
              `An error occurred requesting NTP server ${server}. Error count: ${errorCount}.`,
            );
            console.debug(e);
          }),
      );
    }
    await Promise.all(p);
  }

  if (samples.length < sampleSize) {
    throw new Error(
      `Failed to obtain ${sampleSize} samples from NTP servers. (Received ${samples.length}.)`,
    );
  }

  const avgTheta = samples.reduce((a, b) => a + b) / samples.length;
  console.debug(
    `NTP offset (milliseconds) samples: ${samples}. Average: ${avgTheta}.`,
  );

  return avgTheta;
}

function queryNtpServer(server: string): Promise<NtpPacket> {
  const port = 123;
  const replyTimeout = 3; //seconds

  console.debug(`Querying NTP server ${server}.`);

  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket('udp4');
    let isSettled = false;

    function clear() {
      clearTimeout(timeoutHandle);
      if (!isSettled) {
        isSettled = true;
      }
      try {
        socket.close();
      } catch {
        // Socket may already be closed or closing.
      }
    }

    function rejectImpl(e: unknown) {
      clear();
      reject(e);
    }

    const timeoutHandle = setTimeout(() => {
      rejectImpl(
        new Error(
          `No reply from NTP server ${server} after ${replyTimeout} seconds (timeout error).`,
        ),
      );
    }, replyTimeout * 1000);

    socket.on('error', rejectImpl);

    socket.on('message', (msg: Buffer) => {
      console.debug(
        `Received NTP response from ${server}: 0x${msg.toString('hex')}.`,
      );
      if (msg.length < 48) {
        rejectImpl(
          new Error(
            `Invalid NTP response length (${msg.length} bytes, expected >= 48) from ${server}.`,
          ),
        );
        return;
      }
      clear();
      try {
        const data = new DataView(msg.buffer, msg.byteOffset, msg.length);
        resolve(parseNtpResponse(data));
      } catch (e) {
        reject(e);
      }
    });

    try {
      const request = new Uint8Array(createNtpRequest());
      socket.send(request, port, server, (err) => {
        if (err) {
          rejectImpl(err);
        }
      });
    } catch (err) {
      rejectImpl(err);
    }
  });
}

export function createNtpRequest(): ArrayBuffer {
  const data = new ArrayBuffer(48);
  const view = new DataView(data);

  const leap = 3; // unknown (clock unsynchronized)
  const version = 4; // NTPv4
  const mode = 3; // client
  view.setUint8(0, (leap << 6) | (version << 3) | mode);

  const nowMs = BigInt(Date.now());
  const ntpMs = nowMs + NTP_DELTA_MS;
  const seconds = ntpMs / 1000n;
  const fraction = ((ntpMs % 1000n) * FRAC_DIVISOR) / 1000n;

  view.setUint32(40, Number(seconds), false); // xmt seconds
  view.setUint32(44, Number(fraction), false); // xmt fraction

  console.debug(`Constructed NTP request at ${new Date(Number(nowMs))}.`);
  return data;
}

export function parseNtpResponse(data: DataView): NtpPacket {
  function readTimestamp(byteOffset: number): Date {
    const seconds = BigInt(data.getUint32(byteOffset, false));
    const fraction = BigInt(data.getUint32(byteOffset + 4, false));
    if (seconds === 0n && fraction === 0n) {
      return new Date(0);
    }
    const unixSeconds = seconds - NTP_DELTA_SECONDS;
    const fractionMs = (fraction * 1000n + (FRAC_DIVISOR / 2n)) / FRAC_DIVISOR;
    const totalMs = Number(unixSeconds * 1000n + fractionMs);
    return new Date(totalMs);
  }

  const p: NtpPacket = {
    org: readTimestamp(24),
    rec: readTimestamp(32),
    xmt: readTimestamp(40),
    dst: new Date(),
  };

  console.debug(`Parsed NTP response: ${JSON.stringify(p)}.`);
  return p;
}

/**
 * https://www.rfc-editor.org/rfc/rfc5905.html
 * 7.3.  Packet Header Variables
 * (only the fields that we need)
 */
export interface NtpPacket {
  org: Date; // T1
  rec: Date; // T2
  xmt: Date; // T3
  dst: Date; // T4
}
