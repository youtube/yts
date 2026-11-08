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

// 'any' is allowed in test code
// tslint:disable:no-any
import * as cp from 'child_process';
import {EventEmitter} from 'events';
import 'jasmine';
import {Writable} from 'stream';
import {CecClient} from './cec_client';
import * as constants from './constants';

describe('cecClient', () => {
  let client: CecClient;

  beforeEach(() => {
    client = new CecClient();
  });

  afterEach(() => {
    client.kill();
  });

  it('should initialize and become ready', async () => {
    localMockSpawn((fakeCecClientProcess) => {
      fakeCecClientProcess.stdout.emit(
        'data',
        Buffer.from(constants.StateStrs.STARTUP_SEQUENCE),
      );
      // Emit response after 500ms to allow init polling to finish and register listener
      setTimeout(() => {
        fakeCecClientProcess.stdout.emit(
          'data',
          Buffer.from('TRAFFIC: [123] >> 8f:84:10:00:04\n'),
        );
      }, 500);
    });

    const initPromise = client.init();
    await expectAsync(initPromise).toBeResolvedTo(true);
    expect(client.state).toBe('ready');
  });

  it('should fail to initialize if no device is detected', async () => {
    localMockSpawn((fakeCecClientProcess) => {
      fakeCecClientProcess.stdout.emit(
        'data',
        Buffer.from(constants.StateStrs.NO_DEVICE_FAILURE),
      );
    });

    const initPromise = client.init();
    await expectAsync(initPromise).toBeResolvedTo(false);
    expect(client.state).toBe('failed');
  });

  it('should detect logical address during init', async () => {
    localMockSpawn((fakeCecClientProcess) => {
      fakeCecClientProcess.stdout.emit(
        'data',
        Buffer.from(constants.StateStrs.STARTUP_SEQUENCE),
      );
      setTimeout(() => {
        fakeCecClientProcess.stdout.emit(
          'data',
          Buffer.from('TRAFFIC: [123] >> 4f:84:10:00:04\n'),
        );
      }, 500);
    });

    await client.init();
    expect(client.logicalAddress).toBe('4');
  });

  it('should fallback to 8 if detection times out during init', async () => {
    localMockSpawn((fakeCecClientProcess) => {
      fakeCecClientProcess.stdout.emit(
        'data',
        Buffer.from(constants.StateStrs.STARTUP_SEQUENCE),
      );
    });

    const initPromise = client.init();
    await expectAsync(initPromise).toBeResolvedTo(true);
    expect(client.logicalAddress).toBe('8');
  });

  it('should expect message and verify it', async () => {
    let activeProcess: FakeProcess | undefined;
    localMockSpawn((fakeCecClientProcess) => {
      activeProcess = fakeCecClientProcess;
      fakeCecClientProcess.stdout.emit(
        'data',
        Buffer.from(constants.StateStrs.STARTUP_SEQUENCE),
      );
    });

    await client.init();

    client.expectMessage({
      substring: '8f:82:',
      received: false,
      description: 'test message',
    });

    expect(activeProcess).toBeDefined();
    activeProcess!.stdout.emit('data', Buffer.from('>> 8f:82:10:00\n'));

    const failSpy = jasmine.createSpy('fail');
    client.checkExpectedMessages(failSpy);
    expect(failSpy).not.toHaveBeenCalled();
  });

  it('should expect message and fail if not received', async () => {
    localMockSpawn((fakeCecClientProcess) => {
      fakeCecClientProcess.stdout.emit(
        'data',
        Buffer.from(constants.StateStrs.STARTUP_SEQUENCE),
      );
    });

    await client.init();

    client.expectMessage({
      substring: '8f:82:',
      received: false,
      description: 'test message',
    });

    const failSpy = jasmine.createSpy('fail');
    client.checkExpectedMessages(failSpy);
    expect(failSpy).toHaveBeenCalled();
  });
});

/**
 * Mocks the spawn function to simulate a fake cec-client subprocess
 */
function localMockSpawn(cb: (p: FakeProcess, ...args: unknown[]) => void) {
  const fakeCecClientProcess = new FakeProcess();
  spyOn(cp as any, 'spawn').and.callFake((...args: unknown[]) => {
    setTimeout(() => {
      cb(fakeCecClientProcess, ...args);
    }, 0);
    return fakeCecClientProcess as any;
  });
}

/**
 * Mocks a subprocess
 */
class FakeProcess extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  stdin = new FakeWritable();
  kill() {}
}

/**
 * Mocks a writable stream
 */
class FakeWritable extends Writable {
  override _write(
    chunk: any,
    encoding: string,
    callback: (error?: Error | null) => void,
  ) {
    callback();
  }
}
