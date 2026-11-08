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
 * @fileoverview Interfaces for device and agent launcher classes.
 */

// taze: Buffer from //third_party/javascript/typings/node
import {VideoInputSource, VoiceSystem} from 'google3/third_party/javascript/yts/dab/proto/dab_service.jsonpb_decls';

/**
 * Represents solely the class properties of a generic device. Use when parsing
 * device information from JSON.
 */
export interface DeviceProperties {
  /** The specific protocol or type identifier of the device. */
  deviceType:|'adb'|'dab'|'dial'|'webdriver'|'cobalt'|'chrome'|'in-memory'|
      'ssh'|'tvos'|'rdk'|'remote';
  /** Unique short identifier assigned during device discovery. */
  shortId: string;
  /** Human-readable friendly name of the device. */
  name: string;
  /** Universally unique identifier (usually serial number or UUID). */
  uuid: string;
  /** IP address or network location of the device. */
  ip: string;
  /** Optional wakeup header string for network wake. */
  wakeup?: string;
}

/** Defines configuration parameters for launching an app or test script. */
export interface LaunchOptions {
  /** Optional path to the JavaScript module containing the test script. */
  scriptModule?: string;
  /** The target application to launch (e.g., 'YouTube' or 'YouTubeTV'). */
  app?: string;
  /** Explicit URL to load in the agent. */
  agentUrl?: string;
  /** Overrides the default reconnection timeout for special test cases. */
  reconnectTimeoutOverride?: number;
  /**
   * If true, allows direct navigation to target URLs without intermediate
   * loaders.
   */
  allowDirectNav?: boolean;
  /** Additional command-line arguments to pass to the Cobalt process. */
  cobaltArgs?: string;
  /** Optional development workspace path for loading uploaded scripts. */
  devWorkspace?: string;
  /** Optional callback invoked when the on-device agent emits a log message. */
  onLog?: (text: string) => void;
}

/** Defines configuration parameters for taking a screenshot. */
export interface ScreenshotOptions {
  /** If true, allows taking a screenshot via WebSocket when supported. */
  allowWebSocket?: boolean;
  /** Optional display name to target on multi-display devices. */
  displayName?: string;
  /** Optional filename or path to save the screenshot. */
  saveAs?: string;
}

/** Represents the result of a device health check. */
export interface HealthCheckStatus {
  /** True if the device is responsive and healthy. */
  healthy: boolean;
  /** Optional descriptive message explaining the health status. */
  message?: string;
  /** Optional error or status code associated with the check. */
  code?: string;
}

/** Proxy interface for a screenshot captured from a device. */
export interface ImageData {
  asDataUrl(): string;
  asBinary(): Buffer;
}

/**
 * Strictly defines the subset of device operations required by
 * AgentLauncher and Script, completely decoupled from the concrete Device
 * class.
 */
export interface AgentLaunchTarget {
  /** The specific protocol or type identifier of the device. */
  deviceType: string;
  /** Unique short identifier assigned during device discovery. */
  shortId: string;
  /** The validated, clean IP address of the device, if applicable. */
  cleanIp?: string;
  /** The Wake-on-LAN or SSDP wakeup header string, if supported. */
  wakeup?: string;

  /** Takes a screenshot of the target device screen. */
  screenshot?: (options?: ScreenshotOptions) => Promise<ImageData>;

  /**
   * Commands the target device to launch the application with the specified
   * payload.
   *
   * @param payload The URL query string or deep link payload to launch.
   * @param app The target application name (e.g., 'YouTube').
   * @param killOnExit If true, ensures the app is terminated when the process
   *     exits.
   * @param allowDirectNav If true, allows navigating directly to the URL.
   * @param cobaltArgs Additional command-line arguments for Cobalt.
   */
  launch(
      payload?: string,
      app?: string,
      killOnExit?: boolean,
      allowDirectNav?: boolean,
      cobaltArgs?: string,
      ): Promise<void>;

  /**
   * Stops or force-closes the running application on the target device.
   *
   * @param app The application name to stop.
   */
  stop(app?: string): Promise<void>;

  /**
   * Logs diagnostic status information about the device (memory, process
   * state).
   *
   * @param logPrefix Prefix string to prepend to diagnostic log messages.
   */
  diagnose(logPrefix: string): Promise<void>;

  /** Promise representing the most recent or ongoing health check status. */
  health?: Promise<HealthCheckStatus>;
  /** Timestamp of the last successful health check. */
  healthTime?: number;

  /**
   * Returns true if the target device is an emulator (e.g., Android emulator).
   * Used to determine loopback network aliases (like 10.0.2.2).
   */
  isEmulator: () => boolean;
}

/**
 * Defines the public interface for a device.
 */
export interface Device extends AgentLaunchTarget, DeviceProperties {
  /** The specific protocol or type identifier of the device. */
  deviceType:|'adb'|'dab'|'dial'|'webdriver'|'cobalt'|'chrome'|'in-memory'|
      'ssh'|'tvos'|'rdk'|'remote';
  /** Takes a screenshot of the target device screen. */
  screenshot(options?: ScreenshotOptions): Promise<ImageData>;

  /**
   * Captures a screenshot and returns it as a data URL string.
   * @deprecated Use `screenshot()` instead.
   */
  screenCapture?(options?: ScreenshotOptions): Promise<string>;

  /**
   * Commands the target device to launch the application with the specified
   * payload.
   */
  launch(
      payload?: string,
      app?: string,
      killOnExit?: boolean,
      allowDirectNav?: boolean,
      cobaltArgs?: string,
      userAgent?: string,
      ): Promise<void>;

  /**
   * Stops or force-closes the running application on the target device.
   */
  stop(app?: string): Promise<void>;

  /**
   * Logs diagnostic status information about the device (memory, process
   * state).
   */
  diagnose(logPrefix: string): Promise<void>;

  /** Promise representing the most recent or ongoing health check status. */
  health?: Promise<HealthCheckStatus>;
  /** Timestamp of the last successful health check. */
  healthTime?: number;

  /**
   * Returns true if the target device is an emulator (e.g., Android emulator).
   */
  isEmulator(): boolean;

  /** Launches a test script on the device. */
  launchScript(
      scriptModule?: string,
      app?: string,
      ): Promise<Script>;
  launchScript(options: LaunchOptions): Promise<Script>;

  /** Resumes the application on the device. */
  resume(app?: string): Promise<void>;

  /** Suspends the application on the device. */
  suspend(app?: string): Promise<void>;

  /** Restarts the device. */
  restart(): Promise<void>;

  /** The currently active script on the device. */
  activeScript?: Script;

  /** Returns the currently active script on the device. */
  getActiveScript(): Script;

  /**
   * Re-discovers the device dynamically (e.g. via SSDP/M-Search) to refresh
   * connection and descriptive metadata.
   */
  rediscover(): Promise<void>;

  /** Runs a health check on the device. */
  healthCheck(args?: {rediscover?: boolean; timeoutMs?: number}):
      Promise<HealthCheckStatus>;

  /** Returns info string. */
  getInfoString(): string;

  /** Returns whether devtools is supported. */
  supportsDevTools(): boolean;

  /** Returns devtools port. */
  getDevToolsPort(): number;

  /** Sends voice command. */
  sendVoice(command: string, voiceSystem?: string): Promise<void>;

  /** Sends key. */
  sendKey(keyCode: string, durationMs?: number): Promise<void>;

  /** Returns display resolution. */
  getDisplayResolution(): Promise<{width: number; height: number}>;

  /** Clicks coordinates. */
  clickCoordinates(x: number, y: number): Promise<void>;

  /** Reads from local storage. */
  readLocalStorage(key: string): Promise<string>;

  /** Writes to local storage. */
  writeLocalStorage(key: string, value: string): Promise<void>;

  /** Deeplinks to the specified URL or path on the device. */
  deeplink(deeplink: string, app?: string): Promise<void>;

  /** Streams raw runtime logs from the device line-by-line. */
  streamLog(onLine: (line: string) => void): () => void;

  /** Destroys the device connection. */
  destroy(): Promise<void>;
}

/**
 * Represents serializable properties of a DIAL device.
 */
export interface DialDeviceProperties extends DeviceProperties {
  location: string;
  appUrl: string;
}

/**
 * Represents the App Status.
 */
export interface DialAppStatusXml {
  service: {
    name: string[]; options: Array<{$?: {allowStop?: boolean}}>;
    state?: string[];
    link?: Array<{$?: {rel?: string; href?: string}}>;
    additionalData?: Array<{[name: string]: string[]}>;
  };
}

/**
 * Defines the public interface for a DIAL device.
 */
export interface DialDevice extends Device, DialDeviceProperties {
  stopUrl(app: string): Promise<string>;
  resourceUrl(app?: string): string;
  appStatus(app: string, clientDialVer?: string): Promise<DialAppStatusXml>;
  checkYouTubeApp(): Promise<boolean>;
  href(status: DialAppStatusXml): string;
}

/**
 * Returns true if the given device is a DIAL device.
 */
export function isDialDevice(device: Device): device is DialDevice {
  return device.deviceType === 'dial';
}

/**
 * Represents serializable properties of a DAB device.
 */
export interface DabDeviceProperties extends DeviceProperties {
  deviceId: string;
  brokerUrl: string;
}

/**
 * Defines the public interface for a DAB device.
 */
export interface DabDevice extends Device, DabDeviceProperties {
  init(): Promise<void>;
  getDeviceID(): string;
  getState(
      app?: string,
      ): Promise<'FOREGROUND'|'BACKGROUND'|'STOPPED'|undefined>;
  version(): Promise<string[]>;
  listSupportedKeys(): Promise<string[]>;
  sendKeyLong(keyCode: string, durationMs?: number): Promise<void>;
  listSupportedLanguages(): Promise<string[]>;
  setLanguage(language: string): Promise<void>;
  getPersonalizedAds(): Promise<boolean>;
  setPersonalizedAds(personalizedAds: boolean): Promise<void>;
  getTextToSpeech(): Promise<boolean>;
  getTextToSpeechSupport(): Promise<boolean>;
  setTextToSpeech(textToSpeech: boolean): Promise<void>;
  getVideoInputSource(): Promise<VideoInputSource>;
  setVideoInputSource(source: VideoInputSource): Promise<void>;
  listSupportedVoiceSystems(): Promise<VoiceSystem[]>;
}

/**
 * Returns true if the given device is a DAB device.
 */
export function isDabDevice(device: Device): device is DabDevice {
  return device.deviceType === 'dab';
}

/**
 * Strictly defines the public E2E orchestration lifecycle of an active agent
 * session.
 */
export interface AgentLauncher<TFromServer = unknown, TFromAgent = unknown> {
  /**
   * Returns true if the WebSocket session is currently active and listening.
   */
  isConnected(): boolean;

  /**
   * Ensures the living room application or subprocess is launched and
   * connected.
   */
  ensureLaunched(): Promise<void>;

  /** Wakes up the physical device screen or power state if supported. */
  wakeUp(): Promise<void>;

  /**
   * Resolves to true when WebSocket connection is established, or false on
   * timeout.
   */
  whenConnected(timeout: number): Promise<boolean>;

  /**
   * Executes the task on the device by passing firstMessage to the agent
   * and forwarding all responses to the receive callback. Handles disconnects.
   */
  runTask(
      firstMessage: TFromServer,
      receive: (fromAgent: TFromAgent, done: () => void) => void,
      ignoreDisconnects?: boolean,
      ): Promise<void>;

  /**
   * Sends a raw protobuf server message payload across the active socket.
   *
   * @deprecated Avoid one-shot fire-and-forget messages; use `runTask` instead.
   *     `RemoteClient` cannot provide message-level delivery guarantees and
   *     instead provides app-level delivery guarantees (both sides hold
   *     messages in memory until acknowledged).
   */
  send(message: TFromServer): void;

  /** Resolves when the active WebSocket session disconnects or times out. */
  whenDisconnected(timeoutMs: number, silentlyTimeout?: boolean): Promise<void>;

  /**
   * Closes the active socket connection and detaches connection event
   * listeners.
   */
  disconnect(): Promise<void>;

  /** Aborts any work currently in progress by this launcher session. */
  abort(): void;
}

/**
 * Takes an interface and returns a type where all methods return promises. E.g.
 * `method(): string` becomes `method(): Promise<string>`.
 * `method(): Promise<string>` remains `method(): Promise<string>`.
 * `method(): ArrayBuffer` becomes `method(): Promise<Buffer>`.
 */
export type ScriptProxy<T> = {
  [K in keyof T]: T[K] extends(...args: infer A) => infer R ?
  R extends ArrayBuffer|Promise<ArrayBuffer>?
      (...args: A) => Promise<Buffer>  // if script returns an ArrayBuffer,
                                       // proxy returns a Promise<Buffer>
      :
      R extends Promise<unknown>?
      (...args: A) => R  // if script returns a promise, proxy returns it as is
      :
      (...args: A) => Promise<R>  // otherwise, proxy returns a promise of the
                                  // script's return type
  :
  T[K];
};

/**
 * Represents a proxy for a script running remotely on a device.
 */
export interface Script {
  displayStatus: string;
  invoke(func: string, ...args: unknown[]): Promise<unknown>;
  invokeIgnoringDisconnect(func: string, ...args: unknown[]): Promise<unknown>;
  wakeUp(): Promise<void>;
  isConnected(): boolean;
  disconnect(): void;
  whenDisconnected(timeoutMs: number, silentlyTimeout?: boolean): Promise<void>;
  whenConnected(timeoutMs: number): Promise<boolean>;
  proxy<T>(): ScriptProxy<T>;
}
