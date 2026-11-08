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
 * binary to call as shell command to monitor CEC
 * https://manpages.debian.org/testing/cec-utils/cec-client.1.en.html
 */
export const CEC_CLIENT_BINARY = 'cec-client';

/**
 * Verbosity of cec-client. For definitions, see:
 * https://github.com/Pulse-Eight/libcec/blob/master/include/cectypes.h#L829C27-L830C1
 */
export const CEC_LOG_LEVEL = 31;

/**
 * Device type of Pulse-Eight passed as a flag to cec-client
 */
export const PULSE8_DEVICE_TYPE: 'p' | 'r' | 't' | 'a' = 'r';

/** HDMI port the cec monitor is plugged into */
export const HDMI_PORT_NUMBER = 1;

/**
 * Logical addresses of devices
 */
export enum LogicalAddresses {
  PULSE8 = 1,
  OTT_DEVICE = 8,
}

/**
 * Physical addresses of devices
 */
export enum PhysicalAddresses {
  PULSE8 = 1,
  OTT_DEVICE = 2,
}

/**
 * Stdout strings that indicate the state of cec-client has changed
 */
export enum StateStrs {
  // cec-client prints "waiting for input" after it has initialized and is ready
  // to receive commands
  STARTUP_SEQUENCE = 'waiting for input',

  // cec-client prints this when it cannot detect a device
  NO_DEVICE_FAILURE = 'trying autodetect: FAILED',

  NO_CONNECTION_FAILURE = 'unable to open the device on port',
}

/**
 * Commands to send to the cec-client
 */
export enum Commands {
  OTT_STANDBY = `standby ${LogicalAddresses.OTT_DEVICE}`,
  TV_ON = `on 0`,
  TV_OFF = `standby 0`,
  PULSE8_ACTIVE_SOURCE = `as`,
  PULSE8_INACTIVE_SOURCE = `is`,
  TV_BROADCAST_STANDBY = `tx 0f:36`,
}
