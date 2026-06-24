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

import {Ports} from '../yts_common/types';

import {cache} from './cache';
import {storage} from './storage';

/** Config file name */
const CONFIGS_JSON = 'configs.json';

/**
 * Configuration options for developers (e.g. you)
 */
export declare interface DevConfig {
  /**
   * Enables debug mode (shows variables on the agent page instead of black
   * screen)
   */
  debug?: boolean;

  /**
   * Prelaunch the app before launching it for real. This is a workaround for
   * Samsung devices that don't implement the DAB launch command correctly.
   */
  dabPrelaunch?: boolean;

  /**
   * Can be used to override the default yts kabuki loader with ytstest
   */
  useTestLoader?: boolean;

  /**
   * RDK doesn't support encoded parameters, so we introduce this setting to
   * work around the issue for now. When set to false, yts doesn't encode DAB
   * TODO(dneu): fix workaround for parameter encoding after RDK bug is fixed
   */
  encodeDab?: boolean;

  /**
   * When enabled, YTS will log additional device status information for ADB
   * devices when a launch attempt fails.
   */
  enableDeviceDiagnostics?: boolean;

  /**
   * Regular expressions to be applied to log messages in order to filter them.
   * Leave "replace" values empty to remove messages entirely.
   */
  logRegexFilters?: LogRegexFilter[];
}
/**
 * Lab configuration.
 */
export declare interface LabConfig {
  // Partner's company name. e.g. Samsung
  company?: string;
  // Lab configuration / information in the format of:
  // {country code}-{city code}-{Building code}-{floor}-{room}
  lab?: string;
  // two digit country code use to identify rough device location.
  countryCode?: string;
  city?: string;
  region?: string;
  // time zone use to identify rough device location.
  timeZone?: string;
}

/**
 * YTS CLI configuration.
 */
export declare interface Config extends Ports {
  preferredNetworkInterface?: string;
  forcedHostAddress?: string;
  dialLaunchTimeout: number;
  dabBrokerConnectTimeout: number;
  dialStopWait: number;
  nodeLaunchTimeout: number;
  heartbeatTimeout: number;
  reconnectTimeout: number;
  httpTimeout: number;
  retryAttempts: number;
  retryLimitMinutes: number;
  discoverByIpTimeout: number;
  wakeUpShutdownDelay: number;
  wakeUpStartupDelay: number;
  labConfig?: LabConfig;
  // Parts of output to suppress, even in verbose mode. Currently the only
  // suppression option is HTTP_BODY.
  suppressOutput: Array<'HTTP_BODY'>;

  /**
   * Allows overriding User-Agent and cert_scope for multiple devices. Works
   * similar to --user-agent and --cert-scope arguments on `yts cert` command
   * but for `yts cluster` command which normally operates on multiple devices.
   */
  deviceOverrides: DeviceOverride[];

  /**
   * Experimental feature that enables running YTS tests on ADB devices
   * connected via USB even if the device is on a different network (normal YTS
   * requirement is that the device is on the same).
   *
   * The implementation is based on port forwarding with "adb reverse" command.
   */
  useAdbReverse: boolean;

  /**
   * When enabled, launch params will be added to enable Chrome DevTools.
   */
  enableDevTools?: boolean;

  /**
   * Developer configuration options
   */
  devConfig?: DevConfig;

  /** [Remote YTS] Delay between test progress reporting updates */
  throttleReportingMs: number;

  /** [Remote YTS] How long to keep test results in memory */
  resultRetentionMs: number;

  /** [Remote YTS] How long to wait before retrying to reconnect to backend */
  reconnectBackoffMs: number[];

  /** [Remote YTS] How long to wait before running health check on a device */
  healthCheckIntervalMs: number;

  /** Hide DIAL device if a DAB device is present at the same IP address. */
  dedupeDevices: boolean;

  /** Number of times to attempt to launch YouTube on devices. Defaults to 4. */
  launchAttempts: number;

  // TODO(b/455670830): Remove this once Cobalt gracefully handles reloads.
  /**
   * When set, add an artificial delay between device reloads. This is to allow
   * Cobalt to properly save cookies and storage between reloads.
   */
  delayBetweenReloadsMs: number;
}

/**
 * User-Agent and cert_scope overrides per device.
 */
export declare interface DeviceOverride {
  shortId: string;
  userAgent?: string;
  certScope?: string;
}

/**
 * Regular expression to be applied to log messages.
 */
export declare interface LogRegexFilter {
  find: string;
  replace?: string;
}

let configOverrides: Partial<Config> | undefined;

function getConfigFile() {
  return cache.get('config', () => {
    // Read configs.json from disk
    const configStr = storage.read(CONFIGS_JSON);
    let partialConfig: Partial<Config> | undefined;
    if (configStr) {
      try {
        partialConfig = JSON.parse(configStr) as Partial<Config>;
      } catch (e: unknown) {
        console.error(`Failed to parse ${CONFIGS_JSON} file.`);
        throw e;
      }
    }
    if (!partialConfig) {
      partialConfig = {};
    }

    // Warn about misspelled configuration options
    const misspelledKeys = checkConfig(partialConfig);
    if (misspelledKeys.length > 0) {
      const keys = misspelledKeys.join(', ');
      console.error(`configs.json has unrecognized key(s): ${keys}`);
    }
    return partialConfig;
  });
}

/**
 * Reads configuration from cache, or, failing that, disk. Temporarily exported
 * to be used in MockIo. Will be later absorbed into the storage class.
 */
export function getConfig() {
  return Object.assign(getDefaultConfig(), getConfigFile(), configOverrides);
}

/**
 * Returns config overrides set by overrideConfig function.
 */
export function getConfigOverrides(): Partial<Config> | undefined {
  return configOverrides;
}

/**
 * Prints configuration options to the console. Only prints the config that was
 * actually customized by the user and omits the default values.
 */
export function printConfig() {
  const customConfig = Object.assign(getConfigFile(), configOverrides);
  console.debug('Custom config:');
  console.debug(JSON.stringify(customConfig, null, 2));
}

/**
 * Overrides configuration (which is normally read from configs.json file)
 * programmatically. These overrides take precedence over the configs.json file.
 */
export function overrideConfig(overrides: Partial<Config> | undefined) {
  configOverrides = overrides;
}

/**
 * Updates individual values in the configuration (which is normally read from configs.json file)
 * programmatically. These overrides take precedence over the configs.json file.
 *
 * This will not affect any overrides that were previously set.
 */
export function updateOverrideConfigValues(overrides: Partial<Config>) {
  if (configOverrides) {
    configOverrides = {...configOverrides, ...overrides};
  } else {
    configOverrides = {...overrides};
  }
}

function getDefaultConfig(): Config {
  //
  // Optional properties of Config interface should be set to undefined here.
  // This allows checkParameters function to spell-check the configuration provided by the user.
  //
  return {
    preferredNetworkInterface: undefined,
    forcedHostAddress: undefined,
    dialLaunchTimeout: 30_000,
    dabBrokerConnectTimeout: 2_000,
    dialStopWait: 3_000,
    nodeLaunchTimeout: 10_000,
    heartbeatTimeout: 60_000,
    reconnectTimeout: 20_000,
    minPort: 58500,
    maxPort: 59499,
    httpTimeout: 20_000,
    retryAttempts: 3,
    retryLimitMinutes: 10,
    discoverByIpTimeout: 30_000,
    wakeUpShutdownDelay: 30_000,
    wakeUpStartupDelay: 30_000,
    labConfig: undefined,
    suppressOutput: [],
    deviceOverrides: [],
    useAdbReverse: true,
    enableDevTools: false,
    devConfig: {
      debug: false,
      dabPrelaunch: false,
      useTestLoader: false,
      encodeDab: false,
      enableDeviceDiagnostics: false,
      logRegexFilters: [],
    },

    throttleReportingMs: 1000,
    resultRetentionMs: 60_000,
    reconnectBackoffMs: [2_000, 10_000, 20_000, 30_000, 60_000],
    healthCheckIntervalMs: 60_000,
    dedupeDevices: true,
    launchAttempts: 4,
    delayBetweenReloadsMs: 0,
  };
}

/**
 * Warns users about misspelled parameters. Returns a list of misspelled keys.
 */
export function checkConfig(partialConfig: Partial<Config>) {
  const defaultConfig = getDefaultConfig();
  const validKeys = new Set(Object.keys(defaultConfig));
  const partialRecord = partialConfig as Record<string, unknown>;
  const misspelledKeys: string[] = [];
  for (const key of Object.keys(partialRecord)) {
    if (!validKeys.has(key)) {
      misspelledKeys.push(key);
    }
  }

  if (partialConfig.devConfig) {
    const devKeys = Object.keys(partialConfig.devConfig);
    const validDevKeys = new Set(Object.keys(defaultConfig.devConfig ?? {}));
    const misspelledDevKeys = devKeys.filter((key) => !validDevKeys.has(key));
    misspelledKeys.push(...misspelledDevKeys);
  }
  return misspelledKeys;
}

/**
 * Get loader. Defaults to 'yts'.
 */
export function getKabukiLoader() {
  return getConfig().devConfig?.useTestLoader === true ? 'ytstest' : 'yts';
}
