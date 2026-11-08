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

import {ChildProcess, spawn} from 'child_process';
import * as stream from 'stream';
import * as constants from './constants';

/**
 * How long we sleep after sending a command (in order to give it time to
 * register)
 */
const CMD_DELAY_MS = 500;

/**
 * Represents a CEC message expectation in tests.
 */
interface ExpectedMessage {
  /** Substring of CEC message to look for (e.g '0f:82:') */
  substring: string;

  /** Description of the message */
  description: string;

  /** Marked as true when the message is received */
  received: boolean;
}

/**
 * Class that manages spawning cec-client process and handling stream data.
 */
export class CecClient {
  /** The child process of the running cec-client. */
  private proc: ChildProcess | undefined;

  /** Arguments used to spawn the cec-client process. */
  private readonly args =
    `-d ${constants.CEC_LOG_LEVEL} -t ${constants.PULSE8_DEVICE_TYPE} -p ${constants.HDMI_PORT_NUMBER}`.split(
      ' ',
    );

  /** Current state of the CEC client process lifecycle. */
  state: 'starting' | 'ready' | 'closing' | 'failed' = 'starting';

  /** Cached logical address detected during initialization. */
  private detectedAddress?: string;

  /** Gets the detected logical address, defaulting to '8' if not detected. */
  get logicalAddress(): string {
    return this.detectedAddress ?? '8';
  }

  /** Callback hook for internal stdout line interception (e.g. during detection). */
  private onStdout = (str: string) => {};

  /** Jasmine fail callback passed from the test framework. */
  private failCallback?: (msg: string) => void;

  /** Queue of expected messages registered for validation. */
  private expectedMessages: ExpectedMessage[] = [];

  /**
   *  Promise that resolves once the current round of tests is finished
   */
  finished: Promise<void>;

  /**
   * Function which resolves the finished member variable promise
   */
  finish = () => {};

  /**
   * Initializes a new instance of the CecClient class.
   * Sets up the finished promise.
   */
  constructor() {
    this.finished = new Promise<void>((resolve) => {
      this.finish = resolve;
    });
  }

  /**
   * Process provides exit code if exited
   */
  private isAlive() {
    return this.proc && !this.proc.exitCode;
  }

  /** Launches the cec-client if it isn't running */
  async init(failCallback?: (msg: string) => void) {
    if (failCallback) {
      this.failCallback = failCallback;
    }
    // complete old promise and make a new one
    this.finish();
    this.finished = new Promise<void>((resolve, reject) => {
      this.finish = resolve;
    });

    if (!this.isAlive()) {
      console.log('Initializing CEC client...');
      this.state = 'starting';

      console.log(
        `Spawning ${constants.CEC_CLIENT_BINARY} with args ${this.args.join(
          ' ',
        )}`,
      );
      this.proc = spawn(constants.CEC_CLIENT_BINARY, this.args);
      process.stdin.pipe(this.proc.stdin!);

      this.proc.stdout?.on('data', (data) => void this.onStdoutWrapper(data));
      this.proc.stderr?.on('data', (data) => void this.onStderrWrapper(data));
      this.proc.on(
        'error',
        (error: unknown) => void this.onErrorWrapper(error),
      );
      this.proc.on('close', (code) => void this.onCloseWrapper(code));

      // Waits until the process is ready for input, which is determined by
      // listening for the STARTUP_SEQUENCE text from stdout
      while (this.state === 'starting') {
        await sleep(300);
      }
      await this.detectLogicalAddress();

      console.log('CEC client initialization complete');
    }

    if (this.state === 'closing') {
      throw new Error('Unexpected error: process is already closed');
    }

    return this.state === 'ready';
  }

  /**
   * Dynamically detects the logical address of the OTT device.
   *
   * It sends a "Give Physical Address" (0x83) command to all possible playback
   * device logical addresses (4, 8, 11) and listens for a "Report Physical
   * Address" (0x84) response.
   *
   * @return  The detected logical address, or 8 (default fallback) if detection
   *          times out or fails.
   */
  private async detectLogicalAddress(): Promise<string> {
    if (this.detectedAddress !== undefined) {
      return this.detectedAddress;
    }
    const possibleAddresses = ['4', '8', 'b']; // Playback 1, 2, 3
    let resolvedAddress: string | undefined;

    this.onStdout = (str: string) => {
      // Matches a broadcast "Report Physical Address" (0x84) message from one of
      // the possible playback devices (4, 8, b).
      // Example line: "TRAFFIC: [123] >> 4f:84:10:00:04"
      // - Group 1 captures the source logical address ('4', '8', or 'b').
      // - 'f' is the destination (broadcast).
      // - '84:' is the Report Physical Address opcode.
      const match = str.match(/>>\s+([48b])f:84:/i);
      if (match) {
        resolvedAddress = match[1].toLowerCase();
        console.log(
          `Detected OTT logical address: ${resolvedAddress} from line: ${str}`,
        );
      }
    };

    for (const addr of possibleAddresses) {
      await this.sendCommand(`tx f${addr}:83`);
      if (resolvedAddress) break;
    }

    this.onStdout = () => {};
    this.detectedAddress = resolvedAddress ?? '8';
    return this.detectedAddress;
  }

  /**
   * Process can be killed when we encounter an unrecoverable error or after all
   * CEC tests are completed.
   */
  kill() {
    if (this.state !== 'failed') {
      this.state = 'closing';
    }
    this.proc?.kill('SIGINT');
    this.finish();
  }

  /**
   * Add a message that the logger will listen for
   */
  expectMessage(message: ExpectedMessage) {
    console.log(`Expecting ${message.description}...`);
    this.expectedMessages.push(message);
  }

  /**
   * Return list of expected messages, marked if they have been received or not.
   * Then resets list of expected messages so a new set of expectations can be
   * defined later.
   */
  checkExpectedMessages(failMethod: (e?: unknown) => void) {
    for (const expectedMess of this.expectedMessages) {
      if (!expectedMess.received) {
        failMethod(
          `Expected message ${expectedMess.substring}* not received (${expectedMess.description}).`,
        );
      }
    }
    this.expectedMessages = [];
  }

  /**
   * Reset list of expected messages
   */
  resetMessageExpectations() {
    this.expectedMessages = [];
  }

  /**
   * Internal wrapper for the child process stdout stream.
   *
   * It processes raw stdout chunks by:
   * 1. Checking for expected messages registered via `expectMessage`.
   * 2. Monitoring startup output to update the client state ('ready' or 'failed').
   * 3. Splitting the output into individual lines and forwarding them to the
   *    registered `onStdout` handler.
   */
  private onStdoutWrapper(data: stream.Readable) {
    let strData = `${data}`;

    for (const message of this.expectedMessages) {
      if (message.received) {
        continue;
      }

      const messagePrefix = '>> '; // string preceding messages
      if (strData.includes(messagePrefix + message.substring)) {
        console.log(
          `Expected message ${message.substring} received! (${message.description})`,
        );
        for (const logLine of strData.split('\n')) {
          console.log(logLine);
        }
        message.received = true;
      }
    }

    if (strData.includes(constants.StateStrs.STARTUP_SEQUENCE)) {
      this.state = 'ready';
    }

    if (strData.includes(constants.StateStrs.NO_DEVICE_FAILURE)) {
      this.state = 'failed';
      console.error('Error: no Pulse-Eight device detected');
    }

    if (strData.includes(constants.StateStrs.NO_CONNECTION_FAILURE)) {
      this.state = 'failed';
      console.error(strData);
    }

    if (strData.endsWith('\n')) {
      strData = strData.trim();
    }

    for (const str of strData.split('\n')) {
      console.debug(str);
      this.onStdout(str);
    }
  }

  /**
   * Internal wrapper for the child process stderr stream.
   */
  private onStderrWrapper(data: stream.Readable) {
    const strData = `${data}`;
    console.error(strData);
  }

  /**
   * Internal wrapper for the child process error events.
   *
   * It handles catastrophic process failures (e.g. process crashes or binary not
   * found) by:
   * 1. Setting client state to 'failed'.
   * 2. Constructing a helpful error message (especially if the `cec-client` binary
   *    is missing, i.e., ENOENT).
   * 3. Calling the registered `failCallback` to fail the test immediately.
   * 4. Triggering process cleanup via `kill()`.
   */
  private onErrorWrapper(error: unknown) {
    this.state = 'failed';
    console.debug(error);

    let message = '';
    // Just checking to see if "code" exists on the error object
    // tslint:disable-next-line:no-any
    if ((error as any).code === 'ENOENT') {
      //TODO (dneu): write the documentation for how to install cec-utils
      message = `
Cannot run ${constants.CEC_CLIENT_BINARY}. Check that it is properly installed, and see
yts documentation for more information on how to install ${constants.CEC_CLIENT_BINARY}
on your system.`;
    } else {
      message = `${error}`;
    }
    console.error(message);
    if (this.failCallback) {
      this.failCallback(message);
    }
    this.kill();
  }

  /**
   * Internal wrapper for the child process close event.
   *
   * Updates the client state based on the exit code (0 -> 'closing', non-zero -> 'failed')
   * and resolves the `finished` promise to signal that the current round is done.
   */
  private onCloseWrapper(code: number | null) {
    console.log(`child process exited with code ${code}`);
    if (code === 0) {
      this.state = 'closing';
    } else {
      this.state = 'failed';
    }
    this.finish();
  }

  /**
   * Sends a string command to the running cec-client
   */
  async sendCommand(command: string) {
    console.log(`Sending command: ${command}`);
    if (!this.proc) {
      throw new Error('Process not yet started');
    } else if (this.state === 'failed') {
      return;
    } else if (this.state !== 'ready') {
      throw new Error(`Process isn't ready yet. Current state: ${this.state}`);
    }

    this.proc.stdin?.write(command);
    await sleep(CMD_DELAY_MS);
  }
}

/**
 * Helper function to sleep for a given interval.
 *
 * @param sleepMs The duration to sleep in milliseconds.
 */
export async function sleep(sleepMs: number) {
  await new Promise((r) => void setTimeout(r, sleepMs));
}
