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
 * @fileoverview MQTT wrapper and helper interfaces, this will be used as the
 * infra layer for the MQTT DAB connection.
 */

import {AsyncMqttClient, connect, IClientOptions, Packet} from 'async-mqtt'; // from //third_party/javascript/node_modules/async_mqtt:typings
import {EventEmitter2, ListenerFn} from 'eventemitter2'; // from //third_party/javascript/node_modules/eventemitter2:typings
import {Buffer} from 'node:buffer'; // from //third_party/javascript/typings/node
import {v4 as uuidv4} from 'uuid'; // from //third_party/javascript/typings/uuid
import {Subscriber} from '../lib/interfaces';
import * as dns from '../lib/dns';
import * as util from '../lib/util';

/** Mqtt client options */
export interface MqttClientOptions extends IClientOptions {
  verbose?: boolean;
}

/**
 * MQTT wrapper class.
 */
export class MqttClient {
  client: AsyncMqttClient;
  emitter: EventEmitter2;
  subscriptions: Subscriber[];
  initialized: boolean;
  // Set to false unless set to true in the init function
  verbose = false;

  /** The default number of retries for MQTT connections. */
  static CONNECTION_RETRY_COUNT = 3;
  /** The default delay between connection retries. */
  static CONNECTION_RETRY_INTERVAL = 5000;
  /** The default MQTT client options. */
  static readonly DEFAULT_MQTT_OPTIONS: MqttClientOptions = {
    protocolVersion: 5,
    keepalive: 10,
    connectTimeout: 2000,
    reconnectPeriod: MqttClient.CONNECTION_RETRY_INTERVAL,
    resubscribe: true,
  };

  constructor(mqttClient: AsyncMqttClient) {
    this.emitter = new EventEmitter2({
      wildcard: true,
      delimiter: '/',
      verboseMemoryLeak: true,
    });
    this.subscriptions = [];
    this.initialized = false;
    this.client = mqttClient;
    this.client.on('message', this.onResponse.bind(this));
  }

  /**
   * Wrapper around the init function to retry initialization a set number of
   * times before giving up and throwing an error.
   */
  static async initWithRetry(
    uri: string,
    options: MqttClientOptions = {},
    retriesRemaining = MqttClient.CONNECTION_RETRY_COUNT,
    retryInterval = MqttClient.CONNECTION_RETRY_INTERVAL,
  ): Promise<MqttClient> {
    retriesRemaining--;
    try {
      return await MqttClient.init(uri, options);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : `${e}`;
      console.error(`Failed to connect to MQTT broker: ${message}`);

      // If we've exhausted our retries, throw the error.
      if (!retriesRemaining) {
        throw e;
      }

      // Otherwise, try again after a delay.
      console.log(`Trying again in ${retryInterval} milliseconds...`);
      await util.sleep(retryInterval);
      return MqttClient.initWithRetry(
        uri,
        options,
        retriesRemaining,
        retryInterval,
      );
    }
  }

  /**
   * Init function to connect a new MQTT client.
   * uri should be the address of the MQTT broker, not the client itself.
   * This should always be called before calling other functions.
   *
   * @param uri Address of the MQTT broker to connect to.
   * @param options Custom options, if applicable.
   */
  static async init(
    uri: string,
    options: MqttClientOptions = {},
  ): Promise<MqttClient> {
    return asyncPromiseWrapper(async (resolve, reject) => {
      const {...otherOptions} = options;
      options = Object.assign(MqttClient.DEFAULT_MQTT_OPTIONS, otherOptions);

      try {
        uri = await MqttClient.resolveToMqttAddress(uri);
      } catch (e: unknown) {
        console.error(`Failed to resolve URI "${uri}" to MQTT address.`);
        reject(e);
        return;
      }

      const mqttClient = connect(uri, options);
      const timeout = setTimeout(() => {
        mqttClient.end();
        reject(
          new Error('Additional connect timed out, IP might not be valid'),
        );
        // Need to have this here, or else error won't get catch.
      }, options.connectTimeout! + 2000);
      let connected = false;
      let initialized = false;

      const onError = (error: Error) => {
        if (options.verbose) {
          console.debug('MQTT connection error:');
          console.debug(error);
        }
        // Destroy the MQTT client if it's not connected and not initialized.
        // Otherwise, we swallow the error and allow the MQTT client reconnect
        // logic to take effect.
        if (!connected && !initialized) {
          mqttClient.end();
          mqttClient.removeAllListeners();
          reject(error);
        }
      };

      mqttClient.on('error', onError);
      mqttClient.on('offline', () => {
        const message = `MQTT client went offline at ${uri}`;
        console.error(message);
        reject(new Error(message));
      });
      mqttClient.on('reconnect', () => {
        console.log(`MQTT client attempting to reconnect to ${uri}`);
      });
      mqttClient.on('connect', () => {
        if (!initialized) {
          console.debug(`MQTT client connected to ${uri}`);
          clearTimeout(timeout);
          connected = true;
          const client = new MqttClient(mqttClient);
          client.verbose = options.verbose ?? false;
          resolve(client);
        } else {
          console.debug(`MQTT client reconnected to ${uri}`);
        }
        initialized = true;
      });
    });
  }

  /**
   * Callback when the client receives a message to one of the subscribed topics
   * - the message could be a response from the client / device to the previous
   * request
   * - the message could be a request to the client / device
   */
  onResponse(topic: string, msg: string | Buffer, pkt: Packet) {
    if (!msg?.length) {
      console.error(`Empty message received from topic ${topic}.`);
      return;
    }

    try {
      const response = JSON.parse(msg.toString());
      this.emitter.emit(topic, response, pkt);
    } catch (error) {
      console.error(
        `Failed to parse message from topic ${topic}: '${msg.toString()}'`,
      );
    }
  }

  /**
   * Publish messages to subscribers in the given topic.
   * more complicated way of setting the options can be found in here:
   * https://github.com/mqttjs/MQTT.js#mqttclientpublishtopic-message-options-callback
   */
  async publish(topic: string, pkt: object, options = {}) {
    const defaultOptions = {qos: 2, retain: false};
    options = Object.assign(defaultOptions, options);
    await this.client.publish(topic, JSON.stringify(pkt), options);
  }

  /**
   * Publishes a retained message to a topic
   */
  async publishRetained(topic: string, pkt: object, options = {}) {
    options = Object.assign(options, {retain: true});
    await this.publish(topic, pkt, options);
  }

  /**
   * Removes a previously published retained message from a topic
   */
  async clearRetained(topic: string, options = {}) {
    options = Object.assign(options, {retain: true});
    await this.publish(topic, {}, options);
  }

  /**
   * Adds a listener to the corresponding topic.
   */
  async subscribe(topic: string, listener: ListenerFn): Promise<Subscriber> {
    const event = topic.replace(/#/g, '**').replace(/\+/g, '*');
    this.emitter.on(event, listener);
    await this.client.subscribe(topic);
    const subscription: Subscriber = {
      topic,
      alive: true,
      end: async () => {
        subscription.alive = false;
        this.emitter.removeListener(event, listener);
        if (this.emitter.listeners(event).length === 0) {
          await this.client.unsubscribe(topic);
        }
      },
    };
    return subscription;
  }

  /**
   * Remove subscription by topic
   * @param topics a set of full topic string
   */
  async unsubscribe(topics: Set<string>) {
    if (topics.size === 0 || this.subscriptions.length === 0) {
      return; // Early exit if nothing to do
    }

    try {
      for (const subscription of this.subscriptions) {
        if (topics.has(subscription.topic)) {
          await this.client.unsubscribe(subscription.topic);
          await subscription.end();
          // No need to explicitly filter, we'll update later
        }
      }

      // Update subscriptions in-place after unsubscriptions finish
      this.subscriptions = this.subscriptions.filter(
        (subscription) => !topics.has(subscription.topic),
      );
    } catch (e) {
      // Handle errors appropriately - log, notify user, etc.
      console.error('Error during unsubscription:', e);
      throw e; // Rethrow to allow caller to handle
    }
  }

  /**
   * Subscribes to a topic until first message is received or timeout occurs,
   * convenience function for reading a retained message
   * @param topic the topic to subscribe to
   * @param timeoutMs the timeout in milliseconds
   * @param correlationID The MQTT version 5 Correlation ID
   * @param publish the publish function to call
   * @param alwaysReturnResponse if true, always return the response even if
   *     the status is not 2xx
   */
  subscribeOnce(
    topic: string,
    timeoutMs = 2000,
    correlationID = '',
    publish: Promise<void> = Promise.resolve(),
    alwaysReturnResponse = false,
  ) {
    return asyncPromiseWrapper(async (resolve, reject) => {
      const timer = setTimeout(() => {
        reject(
          new Error(
            `Failed to receive response from ${topic} within ${timeoutMs}ms`,
          ),
        );
      }, timeoutMs);
      const sub = await this.subscribe(topic, async (msg, pkg) => {
        // Checks for the correct Correlation Data.
        if (
          correlationID.length !== 0 &&
          pkg.correlationData !== correlationID
        ) {
          // Wait for the next one if Correlation ID doesn't match.
          // This is currently broken on RDK, disabling this for now.
        }
        if (sub) {
          await sub.end();
        }
        clearTimeout(timer);
        if (!alwaysReturnResponse && msg.status > 299) {
          const error = createDabError(msg);
          console.error(error.message);
          console.debug(`   in topic ${topic}`);
          reject(error);
        } else {
          resolve(msg);
        }
      });
      await publish;
    });
  }

  /**
   * Subscribes to a topic until timeout occurs, this will return a list
   * of object
   * @param topic the topic to subscribe to
   * @param timeoutMs the timeout in milliseconds
   * @param correlationID The MQTT version 5 correlation ID
   * @param publish the publish function to call
   */
  async subscribeWithTimeout(
    topic: string,
    timeoutMs = 2000,
    correlationID = '',
    publish: Promise<void> = Promise.resolve(),
    alwaysReturnResponse = false,
  ): Promise<object[]> {
    return asyncPromiseWrapper(async (resolve, reject) => {
      const responseList: object[] = [];
      const subscription = await this.subscribe(topic, async (msg, pkg) => {
        // Checks for the correct correlation Data.
        if (
          correlationID.length !== 0 &&
          pkg.correlationData !== correlationID
        ) {
          // Wait for the next one if Correlation ID doesn't match.
          // This is currently broken on RDK, disabling this for now.
        }
        if (!alwaysReturnResponse && msg.status > 299) {
          reject(createDabError(msg));
        } else {
          responseList.push(msg);
        }
      });
      await publish;

      setTimeout(async () => {
        await subscription.end();
        if (responseList.length === 0) {
          reject(
            new Error(
              `Failed to receive response from ${topic} within ${timeoutMs}ms`,
            ),
          );
        }
        resolve(responseList);
      }, timeoutMs);
    });
  }

  /**
   * Makes a single request to the DAB-enabled device, using the request/response
   * convention This method will automatically generate the request ID and
   * append it to the request If operation timed-out, it will throw an error.
   * @param topic The topic to send the request to
   * @param payload The payload of the request
   * @param options The options for the request
   * @param alwaysReturnResponse If true, always return the response even if
   *     the status is not 2xx
   */
  async request(
    topic: string,
    payload: object = {},
    options = {qos: 2, timeoutMs: 60_000},
    alwaysReturnResponse = false,
  ) {
    if (this.verbose) {
      console.debug(
        `Requesting ${topic} with payload ${JSON.stringify(payload)}`,
      );
    }

    const requestId = uuidv4();
    const requestTopic = topic;
    const responseTopic = `_response/${requestTopic}/${requestId}`;

    options = Object.assign(
      {properties: {responseTopic, correlationData: requestId}},
      options,
    );

    const timeout = options.timeoutMs;
    const response = await this.subscribeOnce(
      responseTopic,
      timeout,
      requestId,
      this.publish(requestTopic, payload, options),
      alwaysReturnResponse,
    );

    if (this.verbose) {
      console.debug(
        `Response from ${topic}: ${formatResponseForLogging(response)}`,
      );
    }
    return response;
  }

  /**
   * This is usually used for discovery request.
   * Apply to any request where you were expecting more than 1 response.
   * But please don't use this method for telemetry, just subscribe to
   * that topic directly. Don't use this method for anything that doesn't have
   * an expected end time.
   * This is different from the request operation as we were expecting
   * more than one devices for bridge implementation.
   * @param topic The topic to send the request to
   * @param timeout The timeout in milliseconds
   * @param payload The payload of the request
   * @param options The options for the request
   * @param alwaysReturnResponse If true, always return the response even if
   *     the status is not 2xx
   */
  async requestWithMultipleResponses(
    topic: string,
    timeout = 2000 /*This timeout should general be longer*/,
    payload: object = {},
    options = {
      qos: 2,
    },
    alwaysReturnResponse = false,
  ) {
    if (this.verbose) {
      console.debug(
        `Requesting ${topic} with payload ${JSON.stringify(payload)}`,
      );
    }

    const requestId = uuidv4();
    const requestTopic = topic;
    const responseTopic = `_response/${requestTopic}/${requestId}`;

    options = Object.assign(
      {properties: {responseTopic, correlationData: requestId}},
      options,
    );
    const response = await this.subscribeWithTimeout(
      responseTopic,
      timeout,
      requestId,
      this.publish(requestTopic, payload, options),
      alwaysReturnResponse,
    );

    if (this.verbose) {
      console.debug(
        `Response from ${topic}: ${formatResponseForLogging(response)}`,
      );
    }
    return response;
  }

  /**
   * call back subscriber. This is usually used by device client side, but it's
   * very useful for debugging where you want to subscribe to everything
   * and log out the messages.
   * @param topic The topic to subscribe to
   * @param callback The callback function to call when a message is received
   */
  async handle(topic: string, callback: Function) {
    const subscription = await this.subscribe(`${topic}`, async (msg, pkg) => {
      if (!pkg?.topic) {
        console.warn(
          `Handler for "${topic}" received message with no request topic. Discarding message.`,
        );
        return Promise.resolve();
      }
      const responseTopic = pkg?.properties?.responseTopic;
      if (!responseTopic) {
        console.warn(
          `Handler for "${topic}" received message with no response topic. Discarding message.`,
        );
        return Promise.resolve();
      }
      const correlationData = pkg?.properties?.correlationData ?? '';
      try {
        const responseMsg = await callback(msg);
        const messages = Array.isArray(responseMsg)
          ? responseMsg
          : [responseMsg];
        return Promise.all(
          messages.map(async (message) => {
            return this.publishWithRetries(
              responseTopic,
              message,
              correlationData,
            );
          }),
        );
      } catch (error) {
        return this.publish(
          responseTopic,
          {
            ...util.handleError(error),
            request: msg,
          },
          {properties: {correlationData}},
        );
      }
    });
    this.subscriptions.push(subscription);
  }

  /**
   * Publishes a message to a topic with retries.
   * @param responseTopic The topic to publish to.
   * @param message The message to publish.
   * @param correlationData The correlation data to use.
   */
  async publishWithRetries(
    responseTopic: string,
    message: object,
    correlationData: string,
  ) {
    for (let retryCount = 0; retryCount < 3; retryCount++) {
      try {
        return this.publish(responseTopic, message, {
          properties: {correlationData},
        });
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message.includes('Quota exceeded') &&
          retryCount < 2 // Retry up to 3 times
        ) {
          console.warn(
            `Publish error: Quota exceeded. Retrying in ${
              retryCount * 1000
            }ms...`,
          );
          await new Promise((resolve) => {
            setTimeout(resolve, retryCount * 1000);
          });
          continue;
        } else {
          throw error; // Re-throw other errors or if retries are exhausted
        }
      }
    }
    // If we get here, it means all retries failed.
    throw new Error(
      `Failed to publish message after multiple retries due to Quota Exceeded.`,
    );
  }

  /**
   * Destructor for mqtt client class.
   * Removes all listeners to topics and closes out the client.
   */
  async end(force = false) {
    await Promise.all(
      this.subscriptions.map((sub) => {
        sub.end();
      }),
    );
    await this.client.end(force);
  }

  /**
   * Resolves the uri to an IP address and sets the protocol to MQTT.
   *
   * @param uri The uri to resolve.
   */
  static async resolveToMqttAddress(uri: string): Promise<string> {
    // This step is a noop if the URI already contains an IP address.
    let resolvedIp = await dns.resolve(uri);

    if (!resolvedIp.startsWith('mqtt://')) {
      // Strip other protocols if present.
      if (resolvedIp.includes('://')) {
        resolvedIp = resolvedIp.split('://')[1];
      }
      // Add in the MQTT protocol.
      resolvedIp = `mqtt://${resolvedIp}`;
    }
    return resolvedIp;
  }
}

/**
 * Similar to `new Promise(executor)` but allows the executor to be async and
 * throw errors. If executor throws an error, the promise will be rejected with
 * that error.
 */
function asyncPromiseWrapper<T>(
  executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: unknown) => void,
  ) => Promise<void>,
): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    try {
      await executor(resolve, reject);
    } catch (e: unknown) {
      reject(e);
    }
  });
}

/** Maximum length of outputImage string before truncating for logs. */
const MAX_OUTPUT_IMAGE_LOG_LENGTH = 80;

/**
 * Truncates outputImage or output_image in an object for log readability.
 *
 * @param obj The object potentially containing an outputImage property.
 * @return A shallow copy with truncated image data, or the original object.
 */
export function truncateOutputImage(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  const record = obj as Record<string, unknown>;
  let modified: Record<string, unknown> | undefined;
  for (const key of ['outputImage', 'output_image']) {
    const val = record[key];
    if (typeof val === 'string' && val.length > MAX_OUTPUT_IMAGE_LOG_LENGTH) {
      if (!modified) {
        modified = {...record};
      }
      modified[key] = `${val.slice(0, MAX_OUTPUT_IMAGE_LOG_LENGTH)}...`;
    }
  }
  return modified ?? record;
}

/**
 * Formats a response object into a JSON string for logging, truncating large
 * screenshot data if present.
 *
 * @param response The response object or array to format.
 * @return JSON string of the response with screenshot data truncated.
 */
export function formatResponseForLogging(response: unknown): string {
  if (response && typeof response === 'object') {
    if (Array.isArray(response)) {
      return JSON.stringify(
        response.map((item) => truncateOutputImage(item)),
      );
    }
    return JSON.stringify(truncateOutputImage(response));
  }
  return JSON.stringify(response);
}

/**
 * Interface representing a DAB message response with status and optional
 * error.
 */
interface DabMessage {
  status?: number;
  error?: unknown;
  [key: string]: unknown;
}

/**
 * Creates an Error from a DAB response message with status > 299.
 *
 * @param msg The DAB message object containing status and optional error.
 * @return An Error instance enriched with properties from msg.
 */
function createDabError(msg: DabMessage): Error {
  let errorMsg = msg?.error;
  if (errorMsg && typeof errorMsg === 'object') {
    errorMsg = JSON.stringify(errorMsg);
  }
  const suffix = errorMsg ? `: ${errorMsg}` : '';
  return Object.assign(new Error(`${msg?.status}${suffix}`), msg);
}

