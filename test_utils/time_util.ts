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
  const date = new Date();
  date.setUTCMilliseconds(date.getUTCMilliseconds() + offset);
  return date;
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

    function clear() {
      clearTimeout(timeoutHandle);
      socket.close();
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
      const data = new DataView(msg.buffer, msg.byteOffset, msg.length);
      clear();
      resolve(parseNtpResponse(data));
    });

    socket.send(new Uint8Array(createNtpRequest()), port, server);
  });
}

function createNtpRequest(): ArrayBuffer {
  const data = new ArrayBuffer(48);
  const view = new DataView(data);

  const leap = 3; // unknown (clock unsynchronized)
  const version = 4; // NTPv4
  const mode = 3; // client
  view.setUint8(0, (leap << 6) | (version << 3) | mode);

  const zero = new Date('Jan 01 1900 GMT');
  const now = new Date();
  const seconds = (now.getTime() - zero.getTime()) / 1000;
  const fraction = Math.floor((seconds % 1) * 0x100000000); // magic

  view.setUint32(40, Math.floor(seconds), false); // xmt seconds
  view.setUint32(44, fraction, false); // xmt fraction

  console.debug(`Constructed NTP request at ${now}.`);
  return data;
}

function parseNtpResponse(data: DataView): NtpPacket {
  function readTimestamp(byteOffset: number) {
    const seconds = data.getUint32(byteOffset, false);
    const fraction = data.getUint32(byteOffset + 4, false);
    const time = seconds + fraction / 0x100000000;
    const date = new Date('Jan 01 1900 GMT');
    date.setUTCMilliseconds(date.getUTCMilliseconds() + time * 1000);
    return date;
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
interface NtpPacket {
  org: Date; // T1
  rec: Date; // T2
  xmt: Date; // T3
  dst: Date; // T4
}
