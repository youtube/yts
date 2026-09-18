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
 * Helper methods for testing.
 */
import {EventEmitter2} from 'eventemitter2'; // from //third_party/javascript/node_modules/eventemitter2:typings
import * as util from './util';

/**
 * Helper to emit a DAB message.
 *
 * @param emitter The emitter instance.
 * @param topic The short-form topic to emit to.
 * @param msg The message to emit.
 */
export async function emitDabMessage(
  emitter: EventEmitter2,
  topic: string,
  msg: object,
) {
  const fullTopicString = util.dabTopic(topic);
  await emitMessage(emitter, fullTopicString, msg);
}

/**
 * Helper to emit a DAB device message.
 *
 * @param emitter The emitter instance.
 * @param deviceId The target DAB device id.
 * @param topic The short-form topic to emit to.
 * @param msg The message to emit.
 */
export async function emitDeviceMessage(
  emitter: EventEmitter2,
  deviceId: string,
  topic: string,
  msg: object,
) {
  const fullTopicString = util.dabDeviceTopic(deviceId, topic);
  await emitMessage(emitter, fullTopicString, msg);
}

/**
 * Helper to emit a DAB bridge message.
 *
 * @param emitter The emitter instance.
 * @param bridgeId The target DAB bridge id.
 * @param topic The short-form topic to emit to.
 * @param msg The message to emit.
 */
export async function emitBridgeMessage(
  emitter: EventEmitter2,
  bridgeId: string,
  topic: string,
  msg: object,
) {
  const fullTopicString = util.dabBridgeTopic(bridgeId, topic);
  await emitMessage(emitter, fullTopicString, msg);
}

/**
 * Emits a message to a given topic.
 *
 * @param emitter The emitter instance.
 * @param fullTopicString The topic to emit to.
 * @param msg The message to emit.
 */
export async function emitMessage(
  emitter: EventEmitter2,
  fullTopicString: string,
  msg: object,
  responseTopic?: string,
) {
  emitter.emit(fullTopicString, msg, {
    topic: fullTopicString,
    properties: {
      responseTopic: responseTopic ?? `_response/${fullTopicString}/123456`,
    },
  });
  // Give the message time to go through.
  await util.sleep(10);
}
