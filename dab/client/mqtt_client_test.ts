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
 * @fileoverview Tests for MqttClient.
 */

import 'jasmine';

import {AsyncMqttClient, Packet} from 'async-mqtt'; // from //third_party/javascript/node_modules/async_mqtt:typings
import {ListenerFn} from 'eventemitter2'; // from //third_party/javascript/node_modules/eventemitter2:typings
import {Subscriber} from '../lib/interfaces';
import * as testHelpers from '../lib/test_helpers';
import * as dns from '../lib/dns';
import {
  formatResponseForLogging,
  MqttClient,
  truncateOutputImage,
} from './mqtt_client';

describe('MqttClient', () => {
  let client: MqttClient;
  let asyncMqttClient: jasmine.SpyObj<AsyncMqttClient>;

  beforeEach(() => {
    asyncMqttClient = jasmine.createSpyObj('asyncMqttClient', [
      'on',
      'publish',
      'subscribe',
      'unsubscribe',
      'end',
    ]);

    client = new MqttClient(asyncMqttClient);
    spyOn(client, 'subscribe').and.callThrough();
  });

  it('should be instantiated', () => {
    expect(client).toBeTruthy();
  });

  it('should initialize the client object correctly', () => {
    expect(client).toBeDefined();
    expect(client.client).toBeDefined();
    expect(client.emitter).toBeDefined();
    expect(client.subscriptions).toEqual([]);
  });

  it('should parse MQTT message and return response object', async () => {
    const responseMessage = {
      status: 200,
    };
    const emitSpy = spyOn(client.emitter, 'emit');
    client.onResponse(
      'my-device/hello',
      JSON.stringify(responseMessage),
      {} as Packet,
    );
    expect(emitSpy).toHaveBeenCalledWith(
      'my-device/hello',
      responseMessage,
      {},
    );
  });

  it('should respond gracefully to malformed message', async () => {
    const emitSpy = spyOn(client.emitter, 'emit');
    client.onResponse('my-device/malformed', '{{{invalidJSON}[', {} as Packet);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should respond gracefully to empty message', async () => {
    const emitSpy = spyOn(client.emitter, 'emit');
    client.onResponse('my-device/empty', '', {} as Packet);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should publish message', async () => {
    const topic = 'testTopic';
    const msg = {prop1: 'value1'};

    await client.publish(topic, msg);

    const expectedOptions = {qos: 2, retain: false};
    expect(asyncMqttClient.publish).toHaveBeenCalledWith(
      topic,
      JSON.stringify(msg),
      // We have to do some wonky casting here because 'publish' has multiple
      // overloads and compiler thinks we are using a different overload than
      // the one actually called.
      expectedOptions as unknown as jasmine.Expected<never>,
    );
  });

  it('should publish retained message', async () => {
    const topic = 'testTopic';
    const msg = {prop1: 'value1'};

    await client.publishRetained(topic, msg);

    const expectedOptions = {qos: 2, retain: true};
    expect(asyncMqttClient.publish).toHaveBeenCalledWith(
      topic,
      JSON.stringify(msg),
      // We have to do some wonky casting here because 'publish' has multiple
      // overloads and compiler thinks we are using a different overload than
      // the one actually called.
      expectedOptions as unknown as jasmine.Expected<never>,
    );
  });

  it('should clear retained message', async () => {
    const topic = 'testTopic';

    await client.clearRetained(topic);

    const expectedMessage = {};
    const expectedOptions = {qos: 2, retain: true};
    expect(asyncMqttClient.publish).toHaveBeenCalledWith(
      topic,
      JSON.stringify(expectedMessage),
      // We have to do some wonky casting here because 'publish' has multiple
      // overloads and compiler thinks we are using a different overload than
      // the one actually called.
      expectedOptions as unknown as jasmine.Expected<never>,
    );
  });

  it('should subscribe to a topic', async () => {
    const topic = 'test';
    const listener: ListenerFn = jasmine.createSpy(
      'listenerSpy',
      (msg, pkg) => {
        expect(msg.topic).toEqual(topic);
      },
    );

    const subscription = await client.subscribe(topic, listener);
    expect(subscription).toBeDefined();
    expect(subscription.alive).toBeTrue();
    client.emitter.emit(topic, {topic}, {});
    expect(listener).toHaveBeenCalled();
  });

  it('should unsubscribe from a topic', async () => {
    const topic = 'test';
    const listener: ListenerFn = jasmine.createSpy('listenerSpy');

    const subscription: Subscriber = await client.subscribe(topic, listener);
    await subscription.end();

    expect(subscription.alive).toBeFalse();
    client.emitter.emit(topic, {topic}, {});
    expect(listener).not.toHaveBeenCalled();
  });

  it('should unsubscribe from a topic', async () => {
    const topicA = 'testA';
    const topicB = 'testB';
    const listener: ListenerFn = jasmine.createSpy('listenerSpy');

    await client.handle(topicA, listener);
    expect(client.subscriptions.length).toEqual(1);
    const subscriptionA = client.subscriptions[0];
    expect(subscriptionA.alive).toBeTrue();
    expect(subscriptionA.topic).toEqual('testA');

    await client.handle(topicB, listener);
    expect(client.subscriptions.length).toEqual(2);
    const subscriptionB = client.subscriptions[1];
    expect(subscriptionB.alive).toBeTrue();
    expect(subscriptionB.topic).toEqual('testB');

    const topics = new Set<string>();
    topics.add(topicA);
    topics.add(topicB);
    await client.unsubscribe(topics);

    expect(subscriptionA.alive).toBeFalse();
    expect(client.subscriptions.length).toEqual(0);
  });

  it('should subscribe once to a topic', async () => {
    const topic = 'test';
    const expectedResponse = {status: 200, topic};
    const expectedResponse2 = {status: 500, topic};

    const promise = client.subscribeOnce(topic);
    client.emitter.emit(topic, expectedResponse, {});
    client.emitter.emit(topic, expectedResponse2, {});

    const response = await promise;
    expect(response).toEqual(expectedResponse);
  });

  it('should reject with an Error when status is greater than 299', async () => {
    const topic = 'test';
    const errorPayload = {status: 500, error: 'Internal error'};

    const promise = client.subscribeOnce(topic);
    client.emitter.emit(topic, errorPayload, {});

    await expectAsync(promise).toBeRejectedWithError(
      Error,
      /500: Internal error/,
    );
    try {
      await promise;
    } catch (err: unknown) {
      //tslint:disable-next-line:no-any
      expect((err as any).status).toBe(500);
      //tslint:disable-next-line:no-any
      expect((err as any).error).toBe('Internal error');
    }
  });

  it(
    'should format clean Error message when error property is missing',
    async () => {
      const topic = 'test';
      const errorPayload = {status: 500};

      const promise = client.subscribeOnce(topic);
      client.emitter.emit(topic, errorPayload, {});

      await expectAsync(promise).toBeRejectedWithError(Error, /^500$/);
      try {
        await promise;
      } catch (err: unknown) {
        //tslint:disable-next-line:no-any
        expect((err as any).status).toBe(500);
        //tslint:disable-next-line:no-any
        expect((err as any).message).toBe('500');
      }
    },
  );

  it(
    'should reject subscribeWithTimeout with an Error when status > 299',
    async () => {
      const topic = 'test';
      const errorPayload = {status: 500, error: 'Internal error'};

      const promise = client.subscribeWithTimeout(topic, 100);
      client.emitter.emit(topic, errorPayload, {});

      await expectAsync(promise).toBeRejectedWithError(
        Error,
        /500: Internal error/,
      );
      try {
        await promise;
      } catch (err: unknown) {
        //tslint:disable-next-line:no-any
        expect((err as any).status).toBe(500);
        //tslint:disable-next-line:no-any
        expect((err as any).error).toBe('Internal error');
      }
    },
  );

  it('should subscribe to a topic with timeout', async () => {
    const topic = 'test';

    const expectedMessages = [
      {id: 0, topic},
      {id: 1, topic},
      {id: 2, topic},
    ];

    const promise = client.subscribeWithTimeout(topic, 100);
    client.emitter.emit(topic, expectedMessages[0], {});
    client.emitter.emit(topic, expectedMessages[1], {});
    client.emitter.emit(topic, expectedMessages[2], {});

    const actualMessages = await promise;
    // Messages sent post-timeout will not be received.
    client.emitter.emit(topic, {id: -1, topic}, {});

    expect(actualMessages).toEqual(expectedMessages);
  });

  it('should throw error if subscribe times out without messages', async () => {
    const topic = 'test';

    const promise = client.subscribeWithTimeout(topic, 100);

    let caughtError = false;
    try {
      await promise;
    } catch (err: unknown) {
      caughtError = true;
    }
    expect(caughtError).toBeTrue();
  });

  it('should request a message from a device', async () => {
    const requestTopic = 'discovery';
    const expectedResponseTopic = '_response/discovery/';

    spyOn(client, 'subscribeOnce').and.callFake(
      (responseTopic, timeout, requestId, promise) => {
        expect(responseTopic).toContain(expectedResponseTopic);
        expect(requestId).not.toEqual('');
        return Promise.resolve();
      },
    );
    await client.request(requestTopic);
    expect(client.subscribeOnce).toHaveBeenCalledTimes(1);
  });

  it('should request a message from a device', async () => {
    const requestTopic = 'discovery';
    const expectedResponseTopic = '_response/discovery/';

    spyOn(client, 'subscribeOnce').and.callFake(
      (responseTopic, timeout, requestId, promise, alwaysReturnResponse) => {
        expect(responseTopic).toContain(expectedResponseTopic);
        expect(requestId).not.toEqual('');
        return Promise.resolve();
      },
    );
    await client.request(requestTopic, {}, {qos: 2, timeoutMs: 10000}, true);
    expect(client.subscribeOnce).toHaveBeenCalledTimes(1);
  });

  it('should request with multiple responses', async () => {
    const requestTopic = 'discovery';
    const expectedResponseTopic = '_response/discovery/';
    const expectedMessages = [
      {id: 0, requestTopic},
      {id: 1, requestTopic},
      {id: 2, requestTopic},
    ];

    spyOn(client, 'subscribeWithTimeout').and.callFake(
      (responseTopic, timeout, requestId, promise) => {
        expect(responseTopic).toContain(expectedResponseTopic);
        expect(requestId).not.toEqual('');
        return Promise.resolve(expectedMessages);
      },
    );
    const actualMessages =
      await client.requestWithMultipleResponses(requestTopic);
    expect(actualMessages).toEqual(expectedMessages);
    expect(client.subscribeWithTimeout).toHaveBeenCalledTimes(1);
  });

  it('should subscribe callbacks for topics', async () => {
    spyOn(client, 'publish').and.callThrough();

    const responseMessages: Array<{id: string; received: string}> = [];
    const callbacks = [
      jasmine.createSpy('callback1').and.callFake((msg: object) => {
        const responseMessage = {
          id: 'callback1',
          received: JSON.stringify(msg),
        };
        responseMessages.push(responseMessage);
        return responseMessage;
      }),
      jasmine.createSpy('callback2').and.callFake((msg: object) => {
        const responseMessage = {
          id: 'callback2',
          received: JSON.stringify(msg),
        };
        responseMessages.push(responseMessage);
        return responseMessage;
      }),
      jasmine.createSpy('callback3').and.callFake((msg: object) => {
        const responseMessage = {
          id: 'callback3',
          received: JSON.stringify(msg),
        };
        responseMessages.push(responseMessage);
        return responseMessage;
      }),
    ];

    await client.handle('topic1', callbacks[0]);
    await client.handle('topic1', callbacks[1]);
    await client.handle('topic2', callbacks[2]);
    expect(client.subscriptions).toHaveSize(3);

    await testHelpers.emitMessage(client.emitter, 'topic1', {prop1: 'value1'});
    await testHelpers.emitMessage(client.emitter, 'topic2', {prop2: 'value2'});

    expect(responseMessages).toEqual([
      {id: 'callback1', received: '{"prop1":"value1"}'},
      {id: 'callback2', received: '{"prop1":"value1"}'},
      {id: 'callback3', received: '{"prop2":"value2"}'},
    ]);

    expect(client.publish).toHaveBeenCalledTimes(3);
    expect(client.publish).toHaveBeenCalledWith(
      jasmine.stringContaining('_response/topic1'),
      {id: 'callback1', received: '{"prop1":"value1"}'},
      jasmine.anything(),
    );
    expect(client.publish).toHaveBeenCalledWith(
      jasmine.stringContaining('_response/topic1'),
      {id: 'callback2', received: '{"prop1":"value1"}'},
      jasmine.anything(),
    );
    expect(client.publish).toHaveBeenCalledWith(
      jasmine.stringContaining('_response/topic2'),
      {id: 'callback3', received: '{"prop2":"value2"}'},
      jasmine.anything(),
    );
  });

  it('should gracefully handle errors thrown by responder', async () => {
    spyOn(client, 'publish').and.callThrough();

    // Register faulty handler.
    await client.handle(
      'topic1',
      jasmine.createSpy('callback').and.throwError('test error'),
    );

    await testHelpers.emitMessage(client.emitter, 'topic1', {prop1: 'value1'});

    expect(client.publish).toHaveBeenCalledWith(
      jasmine.stringContaining('_response/topic1'),
      jasmine.objectContaining({
        status: 500,
        error: jasmine.stringContaining('Error: test error'),
      }),
      jasmine.anything(),
    );
  });

  it('should gracefully handle requests with no request topic', async () => {
    spyOn(client, 'publish').and.callThrough();

    // Register simple handler.
    await client.handle(
      '',
      jasmine.createSpy('callback').and.callFake(() => {
        expect(true).withContext('handler was called').toBeFalse();
      }),
    );

    await testHelpers.emitMessage(client.emitter, '', {prop1: 'value1'}, '');

    expect(client.publish).not.toHaveBeenCalled();
  });

  it('should gracefully handle requests with no response topic', async () => {
    spyOn(client, 'publish').and.callThrough();

    // Register simple handler.
    await client.handle(
      'topic1',
      jasmine.createSpy('callback').and.callFake(() => {
        expect(true).withContext('handler was called').toBeFalse();
      }),
    );

    await testHelpers.emitMessage(
      client.emitter,
      'topic1',
      {prop1: 'value1'},
      '',
    );

    expect(client.publish).not.toHaveBeenCalled();
  });

  it('should gracefully end the mqtt client', async () => {
    const calls: string[] = [];
    const callbacks = [
      jasmine.createSpy('callback1').and.callFake(() => {
        calls.push('callback1');
      }),
      jasmine.createSpy('callback2').and.callFake(() => {
        calls.push('callback2');
      }),
      jasmine.createSpy('callback3').and.callFake(() => {
        calls.push('callback3');
      }),
    ];

    await client.handle('topic1', callbacks[0]);
    await client.handle('topic1', callbacks[1]);
    await client.handle('topic2', callbacks[2]);

    await client.end();
    client.emitter.emit('topic1', {prop1: 'value1'}, {});
    client.emitter.emit('topic2', {prop2: 'value2'}, {});

    expect(asyncMqttClient.end).toHaveBeenCalledTimes(1);
    expect(calls).toHaveSize(0);
  });

  it('should retry initialization', async () => {
    const initSpy = spyOn(MqttClient, 'init').and.rejectWith(
      new Error('fake error'),
    );
    const retryCount = 5;
    const retryIntervalMs = 0;
    let errorMessage = '';
    try {
      await MqttClient.initWithRetry(
        'http-malformed-url',
        {verbose: true},
        retryCount,
        retryIntervalMs,
      );
    } catch (e: unknown) {
      errorMessage = e instanceof Error ? e.message : `${e}`;
    }
    // This is to ensure we caught an error
    expect(initSpy).toHaveBeenCalledWith('http-malformed-url', {verbose: true});
    expect(initSpy).toHaveBeenCalledTimes(retryCount);
    expect(errorMessage).toEqual('fake error');
  });

  it('resolves service name and prepends mqtt protocol header', async () => {
    spyOn(dns, 'resolve').and.resolveTo('127.0.0.1');
    const resolvedIpFromAddress = await MqttClient.resolveToMqttAddress(
      'http://www.google.com',
    );
    expect(resolvedIpFromAddress).toEqual('mqtt://127.0.0.1');
  });

  it('should publish multiple messages if the callback returns an array', async () => {
    const topic = 'test/multi-response';
    const responseMessages = [{msg: 'first'}, {msg: 'second'}];
    const callback = jasmine
      .createSpy('callback')
      .and.resolveTo(responseMessages);
    const publishSpy = spyOn(client, 'publish').and.resolveTo();

    await client.handle(topic, callback);
    // Use emitMessage to trigger the handler
    await testHelpers.emitMessage(client.emitter, topic, {request: 'data'});

    expect(callback).toHaveBeenCalled();
    expect(publishSpy).toHaveBeenCalledTimes(2);
    // zeroth index is used to get the first call made to publish
    const responseTopic = (client.publish as jasmine.Spy).calls.argsFor(0)[0];
    expect(responseTopic).toContain('_response/test/multi-response');
    expect(publishSpy).toHaveBeenCalledWith(
      responseTopic,
      responseMessages[0],
      jasmine.any(Object),
    );
    expect(publishSpy).toHaveBeenCalledWith(
      responseTopic,
      responseMessages[1],
      jasmine.any(Object),
    );
  });

  describe('screenshot response truncation', () => {
    interface ScreenshotResponse {
      status?: number;
      outputImage?: string;
      output_image?: string;
    }

    const longBase64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAAQ4CAIAAABnsVY' +
      'UAAAgAElEQVR4XuzYsQ0AIAwEMWD/nYPYgeucAb6wUt2emeUIECBAgAABAgQIECB';
    const truncatedBase64 = `${longBase64.slice(0, 80)}...`;

    it('truncates outputImage longer than 80 characters', () => {
      const response = {status: 200, outputImage: longBase64};
      const result = truncateOutputImage(response) as ScreenshotResponse;
      expect(result.outputImage).toEqual(truncatedBase64);
      expect(result.status).toEqual(200);
      // Original object is not mutated
      expect(response.outputImage).toEqual(longBase64);
    });

    it('truncates output_image longer than 80 characters', () => {
      const response = {status: 200, output_image: longBase64};
      const result = truncateOutputImage(response) as ScreenshotResponse;
      expect(result.output_image).toEqual(truncatedBase64);
      expect(result.status).toEqual(200);
      expect(response.output_image).toEqual(longBase64);
    });

    it('does not truncate outputImage of 80 characters or fewer', () => {
      const shortImage = 'data:image/png;base64,short';
      const response = {status: 200, outputImage: shortImage};
      const result = truncateOutputImage(response) as ScreenshotResponse;
      expect(result.outputImage).toEqual(shortImage);
    });

    it('returns non-object inputs unmodified', () => {
      expect(truncateOutputImage(null)).toBeNull();
      expect(truncateOutputImage(undefined)).toBeUndefined();
      expect(truncateOutputImage('string')).toEqual('string');
    });

    it('formats response with truncated outputImage for logging', () => {
      const response = {status: 200, outputImage: longBase64};
      const logged = formatResponseForLogging(response);
      expect(logged).toContain(truncatedBase64);
      expect(logged).not.toContain(longBase64);
    });

    it('formats array of responses with truncated outputImage', () => {
      const responses = [{status: 200, outputImage: longBase64}];
      const logged = formatResponseForLogging(responses);
      expect(logged).toContain(truncatedBase64);
      expect(logged).not.toContain(longBase64);
    });

    it(
      'logs truncated screenshot response but returns original in request()',
      async () => {
        client.verbose = true;
        const debugSpy = spyOn(console, 'debug');
        const responseTopic = 'dab/test-device/output/image';
        const response = {status: 200, outputImage: longBase64};

        spyOn(client, 'subscribeOnce').and.resolveTo(response);

        const result = (await client.request(
          responseTopic,
        )) as ScreenshotResponse;

        const expectedLog = JSON.stringify({
          status: 200,
          outputImage: truncatedBase64,
        });
        expect(debugSpy).toHaveBeenCalledWith(
          `Response from ${responseTopic}: ${expectedLog}`,
        );
        // Verify caller receives the complete untruncated image
        expect(result.outputImage).toEqual(longBase64);
      },
    );
  });
});
