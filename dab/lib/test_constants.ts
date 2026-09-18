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
 * @fileoverview Test constants.
 */

import {DabTopics} from './constants';

/**
 * Test DAB request payloads by DAB topic.
 * If a topic is not here, it means the topic expects empty requests.
 */
export const TEST_DAB_REQUESTS = new Map<DabTopics, object>([
  [DabTopics.APPLICATIONS_LAUNCH, {appId: 'test'}],
  [
    DabTopics.APPLICATIONS_LAUNCH_WITH_CONTENT,
    {appId: 'test', contentId: 'test'},
  ],
  [DabTopics.APPLICATIONS_GET_STATE, {appId: 'test'}],
  [DabTopics.APPLICATIONS_EXIT, {appId: 'test'}],
  [DabTopics.INPUT_KEY_PRESS, {keyCode: 'test'}],
  [DabTopics.INPUT_LONG_KEY_PRESS, {keyCode: 'test', durationMs: 500}],
  [DabTopics.DEVICE_TELEMETRY_START, {duration: 500}],
  [DabTopics.APP_TELEMETRY_START, {appId: 'test', duration: 500}],
  [DabTopics.VOICE_SET, {voiceSystem: {name: 'test'}}],
  [DabTopics.VOICE_SEND_TEXT, {voiceSystem: 'test', requestText: 'test'}],
  [DabTopics.VOICE_SEND_AUDIO, {fileLocation: 'test'}],
  [DabTopics.INSTALL_APPLICATION, {appId: 'test', url: 'http://'}],
  [DabTopics.UNINSTALL_APPLICATION, {appId: 'test'}],
  [DabTopics.CLEAR_APPLICATION_DATA, {appId: 'test'}],
  [DabTopics.SET_POWER_MODE, {powerMode: 'On'}],
]);
