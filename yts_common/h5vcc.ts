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
 * @fileoverview Type definitions and an instance of the Cobalt h5vcc interface.
 */

/**
 * h5vcc userOnExitStrategy values, as defined in Cobalt source code:
 * cobalt/h5vcc/h5vcc_system.idl?q=f:h5vcc_system.idl
 */
export enum ExitStrategy {
  // Requests to leave the app should translate to window.close().
  USER_ON_EXIT_STRATEGY_CLOSE = 0,
  // Requests to leave the app should translate to window.minimize().
  USER_ON_EXIT_STRATEGY_MINIMIZE = 1,
  // The user may not initiate an application exit request.
  USER_ON_EXIT_STRATEGY_NO_EXIT = 2,
}

/**
 * H5VCC crash types as defined in Cobalt source code:
 * cobalt/h5vcc/h5vcc_crash_type.idl
 */
export enum CrashType {
  NULL_DEREFERENCE = 'null_dereference',
  ILLEGAL_INSTRUCTION = 'illegal_instruction',
  DEBUGGER = 'debugger',
  OUT_OF_MEMORY = 'out_of_memory',
}

/**
 * Return type for Cobalt cache writeTest.
 */
export declare interface WriteTestResponse {
  // Snake casing is determined by Cobalt implementation.
  // tslint:disable-next-line:enforce-name-casing
  bytes_written: number;
  error: string;
}

/**
 * Return type for Cobalt cache verifyTest.
 */
export declare interface VerifyTestResponse {
  verified: boolean;
  // Snake casing is determined by Cobalt implementation.
  // tslint:disable-next-line:enforce-name-casing
  bytes_read: number;
  error: string;
}

/**
 * H5VCC deep link event.
 */
export declare interface H5vccDeepLinkEvent extends Event {
  readonly url: string;
}

/**
 * Subset of the Cobalt h5vcc interface used by YTS tests.
 * The complete interface is defined in Cobalt source code:
 * cobalt/h5vcc/h5vcc.idl
 */
export declare interface H5vcc {
  experiments?: {
    setExperimentState(experimentConfig: object): Promise<void>;
    resetExperimentState(): Promise<void>;
    getActiveExperimentIds(): number[];
    /** Returns the state of an active feature (not latest feature). */
    getFeature(featureName: string): string;
    /** Returns the value of an active feature parameter (not latest feature parameter). */
    getFeatureParam(featureParamName: string): string;
  };
  accessibility?: {
    /** Whether high contrast accessibility setting is enabled. */
    highContrastText?: boolean;
    /** Whether text to speech setting is enabled. */
    textToSpeech?: boolean;
    addHighContrastTextListener: (callback: () => void) => void;
    addTextToSpeechListener: (callback: () => void) => void;
    ontexttospeechchange?: (event: Event) => void;
  };
  system?: {
    /** IFA value for Cobalt 25 and below. Expected to be a UUID. */
    advertisingId?: string;
    /** IFA value for Cobalt 26 and above. */
    getAdvertisingId?: () => Promise<string>;
    /** Whether IFA is enabled for Cobalt 25 and below. */
    limitAdTracking?: boolean;
    /** Whether IFA is enabled for Cobalt 26 and above. */
    getLimitAdTracking?: () => Promise<boolean>;
    /** Whether background mode (aka suspend / resume) is enabled. */
    userOnExitStrategy?: ExitStrategy;
    /** Exit Cobalt using the specified exit strategy on the platform. */
    exit?: () => void;
  };
  crashLog?: {
    /** Registers a Watchdog client with Cobalt; removed in Cobalt 26. */
    register?: (
      name: string,
      description: string,
      watchdogState: string,
      timeIntervalMilliseconds: number,
      timeWaitMilliseconds: number,
      watchdogReplace: string,
    ) => boolean;
    /** Unregisters a Watchdog client; removed in Cobalt 26. */
    unregister?: (name: string) => boolean;
    /** Pings a Watchdog client; removed in Cobalt 26. */
    ping?: (name: string, pingInfo: string) => void;
    /** Returns the violations since previous call; removed in Cobalt 26. */
    getWatchdogViolations?: () => string;
    triggerCrash: (intent?: CrashType) => void;
    setString: (key: string, value: string) => Promise<void>;
  };
  cVal?: {
    /** Gets the value of a cVal. */
    getValue: (name: string) => string | null | undefined;
  };
  runtime?: {
    onDeepLink?: {
      addListener: (callback: (link: string) => void) => void;
    };

    readonly ondeeplink?: ((event: H5vccDeepLinkEvent) => void) | null;

    addEventListener(
      eventType: 'deeplink',
      callback: (event: H5vccDeepLinkEvent) => void,
    ): void;
    addEventListener(eventType: string, callback: (event: Event) => void): void;
  };
  updater?: {
    getUpdateStatus: () => Promise<string>;
    getUpdaterChannel: () => Promise<string>;
    setUpdaterChannel: (channel: string) => Promise<void>;
    setAllowSelfSignedPackages: (
      allowSelfSignedPackages: boolean,
    ) => Promise<void>;
    setUpdateServerUrl: (url: string) => Promise<void>;
    setRequireNetworkEncryption: (
      requireNetworkEncryption: boolean,
    ) => Promise<void>;
    getInstallationIndex: () => Promise<number>;
    resetInstallations: () => Promise<void>;
  };
  storage?: {
    writeTest: (testSize: number, testString: string) => WriteTestResponse;
    verifyTest: (testSize: number, testString: string) => VerifyTestResponse;
    clearCookies: () => void;
    clearCrashpadDatabase: () => void;
  };
  settings?: {
    set?: (key: string, value: number) => boolean;
  };
}

/**
 * Extension of the Window interface to include the h5vcc object.
 */
declare interface H5vccWindow extends Window {
  h5vcc?: H5vcc;
}

/**
 * Current window.h5vcc instance, defined in a platform-independent way.
 */
export const h5vcc = (globalThis.window as H5vccWindow)?.h5vcc;
