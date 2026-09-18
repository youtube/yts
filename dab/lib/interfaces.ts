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
 * @fileoverview Defines interfaces used by DAB verticals.
 */

/**
 * Listener class to keep track of a subscribed topic in MQTT.
 */
export interface Subscriber {
  alive: boolean;
  end(): Promise<void>;
  topic: string;
}

/**
 * Definition of an expected parameter for a DAB request.
 */
export interface ParameterDefinition {
  // Expected name of the parameter.
  name: string;
  // Expected type of the parameter. If array is set, then this is the
  // expected tyoe of each element of the array.
  type: string;
  // Whether the parameter is supposed to be an array.
  isArray?: boolean;
  // Whether the parameter is required.
  required?: boolean;
}

/**
 * Interface for the log data structure.
 */
export interface LogData {
  system?: {[applicationName: string]: string[]};
  application?: {[applicationName: string]: string[]};
  crash?: {[applicationName: string]: string[]};
}

/**
 * IP connection configuration.
 */
export declare interface IpConnectionConfig {
  type: 'ip';
  ip: string;
}

/**
 * Serial connection configuration.
 */
export declare interface SerialConnectionConfig {
  type: 'serial';
  serial: string;
}

/**
 * Device connection configuration.
 */
export declare type DeviceConnectionConfig =
  | IpConnectionConfig
  | SerialConnectionConfig;
