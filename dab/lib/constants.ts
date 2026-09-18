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
 * Constants used for DAB clients, bridges and other DAB implementations.
 */

import {ParameterDefinition} from './interfaces';

/** Topics for the DAB protocol. */
export enum DabTopics {
  LIST_SUPPORTED_DAB_OPERATIONS = 'operations/list',

  APPLICATIONS_LIST = 'applications/list',
  APPLICATIONS_LAUNCH = 'applications/launch',
  APPLICATIONS_LAUNCH_WITH_CONTENT = 'applications/launch-with-content',
  APPLICATIONS_GET_STATE = 'applications/get-state',
  APPLICATIONS_EXIT = 'applications/exit',

  SYSTEM_RESTART = 'system/restart',
  SYSTEM_SETTINGS_LIST = 'system/settings/list',
  SYSTEM_SETTINGS_GET = 'system/settings/get',
  SYSTEM_SETTINGS_SET = 'system/settings/set',
  GET_POWER_MODE = 'system/power-mode/get',
  SET_POWER_MODE = 'system/power-mode/set',

  INPUT_KEY_LIST = 'input/key/list',
  INPUT_KEY_PRESS = 'input/key-press',
  INPUT_LONG_KEY_PRESS = 'input/long-key-press',

  OUTPUT_IMAGE = 'output/image',

  DEVICE_INFO = 'device/info',
  DEVICE_TELEMETRY_START = 'device-telemetry/start',
  DEVICE_TELEMETRY_STOP = 'device-telemetry/stop',
  DEVICE_TELEMETRY_METRICS = 'device-telemetry/metrics',

  APP_TELEMETRY_START = 'app-telemetry/start',
  APP_TELEMETRY_STOP = 'app-telemetry/stop',
  APP_TELEMETRY_METRICS = 'app-telemetry/metrics',

  HEALTH_CHECK = 'health-check/get',

  DAB_MESSAGES = 'messages',
  DISCOVERY = 'discovery',

  VOICE_LIST = 'voice/list',
  VOICE_SET = 'voice/set',
  VOICE_SEND_AUDIO = 'voice/send-audio',
  VOICE_SEND_TEXT = 'voice/send-text',

  SYSTEM_LOGS_COLLECT = 'system/logs/start-collection',
  SYSTEM_LOGS_RETRIEVE = 'system/logs/stop-collection',

  CLEAR_APPLICATION_DATA = 'applications/clear-data',

  DAB_VERSION = 'version',

  INSTALL_APPLICATION = 'applications/install',
  UNINSTALL_APPLICATION = 'applications/uninstall',
}

/** Topics specific to DAB bridge implementations. */
export enum DabBridgeTopics {
  ADD_DEVICE = 'add-device',
  REMOVE_DEVICE = 'remove-device',
  LIST_DEVICES = 'list-devices',
  MESSAGES = 'messages',
  VERSION = 'version',
}

/**
 * List of key commands as defined in the DAB spec:
 * https://github.com/device-automation-bus/dab-specification-2.0/blob/main/DAB.md
 *
 * This is not an exhaustive list of every key press that can be simulated with
 * DAB. Devices can also define KEY_CUSTOM_* keys, which do not belong in This
 * enum. ಠ_ಠ
 */
export enum DabKeys {
  /** Power keys */
  KEY_POWER = 'KEY_POWER',

  /** Universal remote keys */
  KEY_CHANNEL_UP = 'KEY_CHANNEL_UP',
  KEY_CHANNEL_DOWN = 'KEY_CHANNEL_DOWN',
  KEY_GUIDE = 'KEY_GUIDE',
  KEY_INFO = 'KEY_INFO',
  KEY_VOLUME_DOWN = 'KEY_VOLUME_DOWN',
  KEY_VOLUME_UP = 'KEY_VOLUME_UP',
  KEY_MUTE = 'KEY_MUTE',
  KEY_CAPTIONS = 'KEY_CAPTIONS',
  KEY_SUBTITLE = 'KEY_SUBTITLE',

  /** Navigation keys */
  KEY_BACK = 'KEY_BACK',
  KEY_ENTER = 'KEY_ENTER',
  KEY_HOME = 'KEY_HOME',
  KEY_MENU = 'KEY_MENU',
  KEY_PAGE_UP = 'KEY_PAGE_UP',
  KEY_PAGE_DOWN = 'KEY_PAGE_DOWN',
  KEY_EXIT = 'KEY_EXIT',

  /** Media keys */
  KEY_FAST_FORWARD = 'KEY_FAST_FORWARD',
  KEY_PAUSE = 'KEY_PAUSE',
  KEY_PLAY = 'KEY_PLAY',
  KEY_PLAY_PAUSE = 'KEY_PLAY_PAUSE',
  KEY_RECORD = 'KEY_RECORD',
  KEY_REWIND = 'KEY_REWIND',
  KEY_SKIP_FAST_FORWARD = 'KEY_SKIP_FAST_FORWARD',
  KEY_SKIP_REWIND = 'KEY_SKIP_REWIND',
  KEY_STOP = 'KEY_STOP',

  /** Directional keys */
  KEY_DOWN = 'KEY_DOWN',
  KEY_LEFT = 'KEY_LEFT',
  KEY_RIGHT = 'KEY_RIGHT',
  KEY_UP = 'KEY_UP',

  /** Color keys */
  KEY_RED = 'KEY_RED',
  KEY_GREEN = 'KEY_GREEN',
  KEY_YELLOW = 'KEY_YELLOW',
  KEY_BLUE = 'KEY_BLUE',

  /** Numpad keys */
  KEY_0 = 'KEY_0',
  KEY_1 = 'KEY_1',
  KEY_2 = 'KEY_2',
  KEY_3 = 'KEY_3',
  KEY_4 = 'KEY_4',
  KEY_5 = 'KEY_5',
  KEY_6 = 'KEY_6',
  KEY_7 = 'KEY_7',
  KEY_8 = 'KEY_8',
  KEY_9 = 'KEY_9',
}

/**
 * List of app ids corresponding to the apps in the DAB application registry:
 * https://github.com/device-automation-bus/dab-specification-2.0/blob/main/DAB.md#7-appendix
 */
export enum DabAppIds {
  NETFLIX = 'Netflix',
  YOUTUBE = 'YouTube',
  PRIME_VIDEO = 'PrimeVideo',
  TEST_FLIGHT = 'com.apple.TestFlight',
}

/**
 * Required parameters for DAB requests.
 * Does not contain topics with no input parameters.
 */
export const DAB_REQUEST_PARAMS = new Map<DabTopics, ParameterDefinition[]>([
  [
    DabTopics.APPLICATIONS_LAUNCH,
    [
      {name: 'appId', type: 'string', required: true},
      {name: 'parameters', type: 'string', isArray: true},
    ],
  ],
  [
    DabTopics.APPLICATIONS_LAUNCH_WITH_CONTENT,
    [
      {name: 'appId', type: 'string', required: true},
      {name: 'contentId', type: 'string', required: true},
      {name: 'parameters', type: 'string', isArray: true},
    ],
  ],
  [
    DabTopics.APPLICATIONS_GET_STATE,
    [{name: 'appId', type: 'string', required: true}],
  ],
  [
    DabTopics.APPLICATIONS_EXIT,
    [
      {name: 'appId', type: 'string', required: true},
      {name: 'background', type: 'boolean'},
    ],
  ],
  [
    DabTopics.SYSTEM_SETTINGS_SET,
    [
      {name: 'language', type: 'string'},
      {name: 'outputResolution', type: 'object'},
      {name: 'memc', type: 'boolean'},
      {name: 'cec', type: 'boolean'},
      {name: 'lowLatencyMode', type: 'boolean'},
      {name: 'matchContentFrameRate', type: 'string'},
      {name: 'hdrOutputMode', type: 'string'},
      {name: 'pictureMode', type: 'string'},
      {name: 'audioOutputMode', type: 'string'},
      {name: 'audioOutputSource', type: 'string'},
      {name: 'videoInputSource', type: 'string'},
      {name: 'audioVolume', type: 'number'},
      {name: 'mute', type: 'boolean'},
      {name: 'textToSpeech', type: 'boolean'},
      {name: 'screenSaver', type: 'boolean'},
      {name: 'screenSaverMinTimeout', type: 'number'},
      {name: 'personalizedAds', type: 'boolean'},
    ],
  ],
  [
    DabTopics.INPUT_KEY_PRESS,
    [{name: 'keyCode', type: 'string', required: true}],
  ],
  [
    DabTopics.INPUT_LONG_KEY_PRESS,
    [
      {name: 'keyCode', type: 'string', required: true},
      {name: 'durationMs', type: 'number', required: true},
    ],
  ],
  [
    DabTopics.DEVICE_TELEMETRY_START,
    [{name: 'duration', type: 'number', required: true}],
  ],
  [
    DabTopics.APP_TELEMETRY_START,
    [
      {name: 'appId', type: 'string', required: true},
      {name: 'duration', type: 'number', required: true},
    ],
  ],
  [
    DabTopics.VOICE_SET,
    [
      {
        name: 'voiceSystem',
        type: 'object',
        required: true,
      },
    ],
  ],
  [
    DabTopics.VOICE_SEND_AUDIO,
    [
      {name: 'fileLocation', type: 'string', required: true},
      {name: 'voiceSystem', type: 'string'},
    ],
  ],
  [
    DabTopics.VOICE_SEND_TEXT,
    [
      {name: 'requestText', type: 'string', required: true},
      {name: 'voiceSystem', type: 'string', required: true},
    ],
  ],
  [
    DabTopics.INSTALL_APPLICATION,
    [
      {name: 'appId', type: 'string', required: true},
      {name: 'url', type: 'string', required: true},
      {name: 'timeout', type: 'number'},
    ],
  ],
  [
    DabTopics.UNINSTALL_APPLICATION,
    [{name: 'appId', type: 'string', required: true}],
  ],
  [
    DabTopics.CLEAR_APPLICATION_DATA,
    [{name: 'appId', type: 'string', required: true}],
  ],
  [
    DabTopics.SET_POWER_MODE,
    [{name: 'powerMode', type: 'string', required: true}],
  ],
]);

/**
 * Required parameters for DAB bridge requests.
 * Does not contain topics with no input parameters.
 */
export const DAB_BRIDGE_REQUEST_PARAMS = new Map<
  DabBridgeTopics,
  ParameterDefinition[]
>([
  [
    DabBridgeTopics.ADD_DEVICE,
    [
      {name: 'ip', type: 'string'},
      {name: 'deviceId', type: 'string'},
      {name: 'serial', type: 'string'},
    ],
  ],
  [
    DabBridgeTopics.REMOVE_DEVICE,
    [
      {name: 'ip', type: 'string'},
      {name: 'serial', type: 'string'},
    ],
  ],
]);

/** Default binary spawn options. */
export const DEFAULT_BINARY_OPTIONS = {encoding: 'utf8'};

/** Default archive name for the log files. */
export const DEFAULT_ARCHIVE_NAME = 'logs.tar.gz';
