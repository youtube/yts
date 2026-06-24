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

import {
  Config,
  getConfig,
  overrideConfig,
  updateOverrideConfigValues,
} from './config';
import {storage} from './storage';

function setConfig(value: string | undefined) {
  spyOn(storage, 'read').and.callFake((pathName: string) => {
    if (pathName !== 'configs.json') {
      throw new Error('Was only expecting you to read the config here');
    }
    return value;
  });
}

describe('config', () => {
  it('reads retryAttempts', () => {
    const json = `{
      "retryAttempts": 5
    }`;
    setConfig(json);
    const config = getConfig();
    expect(config.retryAttempts).toBe(5);
  });

  it('reads labconfig', () => {
    const json = `{
      "labConfig":{
        "company": "YouTube",
        "lab":"TW-LAB",
        "countryCode":"TW",
        "city":"Taipei",
        "region":"EA",
        "timeZone":"TST"
      }
    }`;
    setConfig(json);
    const config = getConfig();
    expect(config.labConfig!.lab).toBe('TW-LAB');
  });

  it('reads retryAttempts', () => {
    const json = `{
      "retryAttempts": 6,
      "foo": "asdf"
    }`;
    setConfig(json);

    const config = getConfig();
    expect(config.retryAttempts).toBe(6);
  });

  it('reads null strings', () => {
    setConfig(undefined);
    const config = getConfig();

    // Test random default value
    expect(config.retryAttempts).toBe(3);
  });

  it('warns about bad parameters', () => {
    const logs: string[] = [];
    console.error = (...args: string[]) => {
      logs.push(args[0]);
    };

    const json = `{
      "foo": "asdf",
      "retryAttempts": 2
    }`;
    setConfig(json);

    getConfig();

    expect(logs.length).toEqual(1);
    expect(logs[0]).toEqual('configs.json has unrecognized key(s): foo');
  });

  it("doesn't warn about optional parameters", () => {
    const logs: string[] = [];
    console.error = (...args: string[]) => {
      logs.push(args[0]);
    };

    const json = `{
      "minPort": 0,
      "preferredNetworkInterface": "terrence",
      "retryAttempts": 2
    }`;

    setConfig(json);
    getConfig();

    expect(logs.length).toEqual(0);
  });

  it('respects overrides', () => {
    const overrides: Partial<Config> = {
      preferredNetworkInterface: 'blah',
    };
    setConfig(JSON.stringify(overrides));
    const config = getConfig();
    expect(config.preferredNetworkInterface).toBe('blah');
  });

  it('sets defaults', () => {
    const config = getConfig();
    expect(config.dialLaunchTimeout).toBe(30000);
    expect(config.dialStopWait).toBe(3_000);
    expect(config.nodeLaunchTimeout).toBe(10_000);
    expect(config.heartbeatTimeout).toBe(60_000);
    expect(config.reconnectTimeout).toBe(20_000);
    expect(config.minPort).toBe(58500);
    expect(config.maxPort).toBe(59499);
    expect(config.httpTimeout).toBe(20_000);
    expect(config.retryAttempts).toBe(3);
    expect(config.discoverByIpTimeout).toBe(30_000);
  });

  it('caches the config in memory', () => {
    setConfig(undefined);

    getConfig();
    getConfig();
    expect(storage.read).toHaveBeenCalledTimes(1);
  });

  it('allows override via overrideConfig', () => {
    const json = `{
      "reconnectTimeout": 30000
    }`;
    setConfig(json);
    const defaultConfig = getConfig();
    expect(defaultConfig.reconnectTimeout).toBe(30000);
    overrideConfig({reconnectTimeout: 40000});
    expect(getConfig().reconnectTimeout).toBe(40000);
  });

  it('allows override via updateOverrideConfigValues', () => {
    const json = `{
      "reconnectTimeout": 30000,
      "dialLaunchTimeout": 30000
    }`;
    setConfig(json);
    const defaultConfig = getConfig();
    expect(defaultConfig.reconnectTimeout).toBe(30_000);
    expect(defaultConfig.dialLaunchTimeout).toBe(30_000);
    updateOverrideConfigValues({
      reconnectTimeout: 40_000,
      dialLaunchTimeout: 40_000,
    });
    updateOverrideConfigValues({reconnectTimeout: 50_000});
    expect(getConfig().reconnectTimeout).toBe(50_000);
    expect(getConfig().dialLaunchTimeout).toBe(40_000);
  });
});
