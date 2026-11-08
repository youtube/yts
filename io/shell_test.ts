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
 * @fileoverview Unit tests for the Shell utility.
 */

import 'jasmine';

import * as childProcess from 'child_process';
import {shell, TEST_ONLY} from './shell';

describe('Shell', () => {
  let execSyncSpy: jasmine.Spy;
  let execFileSyncSpy: jasmine.Spy;

  beforeEach(() => {
    shell.adbPath = 'adb';
    execSyncSpy = spyOn(childProcess, 'execSync').and.returnValue(
      Buffer.from('mock output'),
    );
    execFileSyncSpy = spyOn(childProcess, 'execFileSync').and.returnValue(
      Buffer.from('mock output'),
    );
  });

  it('runs adb command with default timeout and maxBuffer', () => {
    const output = shell.runAdbCommand(['devices']);
    expect(output).toBe('mock output');
    expect(execFileSyncSpy).toHaveBeenCalledWith('adb', ['devices'], {
      maxBuffer: 200 * 1024 * 1024,
      timeout: 10_000,
    });
  });

  it('runs adb command with custom numeric timeout', () => {
    shell.runAdbCommand(['devices'], 5000);
    expect(execFileSyncSpy).toHaveBeenCalledWith('adb', ['devices'], {
      maxBuffer: 200 * 1024 * 1024,
      timeout: 5000,
    });
  });

  it('runs adb command with custom ShellOptions', () => {
    shell.runAdbCommand(['devices'], {timeout: 3000, maxBuffer: 1024});
    expect(execFileSyncSpy).toHaveBeenCalledWith('adb', ['devices'], {
      maxBuffer: 1024,
      timeout: 3000,
    });
  });

  it('runs shell command with custom timeout', () => {
    shell.execSync('echo hello', 2500);
    expect(execSyncSpy).toHaveBeenCalledWith('echo hello', {
      maxBuffer: 200 * 1024 * 1024,
      timeout: 2500,
    });
  });

  it('suppresses stderr and console.error when silent is true', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    execSyncSpy.and.throwError(new Error('xcrun failed'));

    expect(() =>
      shell.execSync('xcrun --find devicectl', {timeout: 5000, silent: true}),
    ).toThrowError('xcrun failed');
    expect(execSyncSpy).toHaveBeenCalledWith('xcrun --find devicectl', {
      maxBuffer: 200 * 1024 * 1024,
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('reports adbExists false when execFileSync throws', () => {
    execFileSyncSpy.and.throwError(new Error('adb not found'));
    expect(shell.adbExists()).toBeFalse();
    expect(execFileSyncSpy).toHaveBeenCalledWith('adb', ['--version'], {
      stdio: 'ignore',
      timeout: 5000,
    });
  });

  it('reports adbExists false when adbPath is undefined', () => {
    shell.adbPath = undefined;
    expect(shell.adbExists()).toBeFalse();
    expect(execFileSyncSpy).not.toHaveBeenCalled();
  });

  it('reports adbExists true when execFileSync succeeds', () => {
    expect(shell.adbExists()).toBeTrue();
  });

  it('throws error when execFileSync fails during command execution', () => {
    execFileSyncSpy.and.throwError(new Error('command timed out'));
    expect(() => shell.runAdbCommand(['shell', 'getprop'])).toThrowError(
      'command timed out',
    );
  });

  it('custom instance respects custom adbPath', () => {
    const customShell = new TEST_ONLY.Shell();
    customShell.adbPath = '/custom/path/adb';
    customShell.runAdbCommand(['devices']);
    expect(execFileSyncSpy).toHaveBeenCalledWith(
      '/custom/path/adb',
      ['devices'],
      {
        maxBuffer: 200 * 1024 * 1024,
        timeout: 10_000,
      },
    );
  });

  it('passes arguments with shell metacharacters directly to execFileSync without shell expansion', () => {
    const maliciousArg = 'https://youtube.com/tv; $(whoami) `id`';
    shell.runAdbCommand(['-s', '127.0.0.1:5555', 'shell', maliciousArg]);
    expect(execFileSyncSpy).toHaveBeenCalledWith(
      'adb',
      ['-s', '127.0.0.1:5555', 'shell', maliciousArg],
      {
        maxBuffer: 200 * 1024 * 1024,
        timeout: 10_000,
      },
    );
    expect(execSyncSpy).not.toHaveBeenCalled();
  });
});
