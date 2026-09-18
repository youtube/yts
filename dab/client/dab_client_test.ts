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

import 'jasmine';

import {DiscoverDevicesResponse} from '../proto/dab_service.jsonpb_decls';
import {DabTopics} from '../lib/constants';
import {Subscriber} from '../lib/interfaces';
import {DabClient} from './dab_client';
import {MqttClient} from './mqtt_client';

describe('DabClient', () => {
  let dab: DabClient;
  let fakeMqttClient: jasmine.SpyObj<MqttClient>;

  beforeEach(() => {
    fakeMqttClient = jasmine.createSpyObj('fakeMqttClient', [
      'subscribe',
      'subscribeOnce',
      'request',
      'requestWithMultipleResponses',
    ]);

    dab = new DabClient(fakeMqttClient, 'testDeviceId');
  });

  it('initializes the client object', () => {
    expect(dab).toBeDefined();
    expect(dab.client).toBeDefined();
    expect(dab.messagesSub.alive).toBeFalse();
    expect(dab.deviceTelemetrySub.alive).toBeFalse();
    expect(dab.appTelemetrySub.alive).toBeFalse();
  });

  it('discovers devices on the network', async () => {
    const device1: DiscoverDevicesResponse = {
      status: 200,
      ip: '111.111.111.111',
      deviceId: 'testDeviceId1',
    };
    const device2: DiscoverDevicesResponse = {
      status: 200,
      ip: '222.222.222.222',
      deviceId: 'testDeviceId2',
    };
    fakeMqttClient.requestWithMultipleResponses.and.resolveTo([
      device1,
      device2,
    ]);

    expect(await DabClient.discovery(fakeMqttClient)).toEqual([
      device1,
      device2,
    ]);
  });

  it('shows messages', async () => {
    const fakeSubscriber: Subscriber = {
      topic: '',
      alive: true,
      end: async () => {},
    };
    fakeMqttClient.subscribe.and.resolveTo(fakeSubscriber);

    await dab.showMessages(() => {});
    expect(fakeMqttClient.subscribe).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.DAB_MESSAGES),
      jasmine.anything(),
    );
    expect(dab.messagesSub.alive).toBeTrue();
  });

  it('hides messages', async () => {
    dab.messagesSub.alive = true;
    spyOn(dab.messagesSub, 'end').and.resolveTo();

    await dab.hideMessages();
    expect(dab.messagesSub.end).toHaveBeenCalled();
  });

  it('gets DAB versions', async () => {
    await dab.version();
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.DAB_VERSION),
    );
  });

  it('gets device info', async () => {
    await dab.deviceInfo();
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.DEVICE_INFO),
    );
  });

  it('capture screenshot', async () => {
    await dab.captureScreenshot();
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.OUTPUT_IMAGE),
    );
  });

  it('restarts device', async () => {
    await dab.restart();
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.SYSTEM_RESTART),
      {},
      {qos: 2, timeoutMs: 60_000},
    );
  });

  it('checks health', async () => {
    await dab.healthCheck();
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.HEALTH_CHECK),
      {},
      {qos: 2, timeoutMs: 60_000},
    );
  });

  it('lists apps', async () => {
    await dab.listApps();
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.APPLICATIONS_LIST),
    );
  });

  it('exits app', async () => {
    const appId = 'testApp';
    const background = true;
    await dab.exitApp(appId, background);

    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.APPLICATIONS_EXIT),
      {appId, background},
    );
  });

  it('launches app', async () => {
    const appId = 'testApp';
    const parameters = ['v=qfweqf', 'kd=f234ifj!'];
    const uriParameters = ['v%3Dqfweqf', 'kd%3Df234ifj!'];
    await dab.launchApp(appId, parameters);
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.APPLICATIONS_LAUNCH),
      {appId, parameters: uriParameters},
    );
  });

  it('presses key', async () => {
    const keyCode = 'testKey';
    await dab.pressKey(keyCode);
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.INPUT_KEY_PRESS),
      {keyCode},
    );
  });

  it('presses key long', async () => {
    const keyCode = 'testKey';
    const durationMs = 500;
    await dab.pressKeyLong(keyCode, durationMs);
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.INPUT_LONG_KEY_PRESS),
      {keyCode, durationMs},
    );
  });

  it('lists supported keys', async () => {
    await dab.listSupportedKeys();
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.INPUT_KEY_LIST),
    );
  });

  it('sends voice text', async () => {
    const requestText = 'testVoiceString';
    const voiceSystem = 'testVoiceSystem';
    await dab.sendVoiceText(requestText, voiceSystem);
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.VOICE_SEND_TEXT),
      {requestText, voiceSystem},
    );
  });

  it('starts device telemetry', async () => {
    const duration = 500;
    await dab.startDeviceTelemetry(duration);
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.DEVICE_TELEMETRY_START),
      {duration},
    );
  });

  it('stops device telemetry', async () => {
    await dab.stopDeviceTelemetry();
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.DEVICE_TELEMETRY_STOP),
    );
  });

  it('shows device telemetry', async () => {
    const fakeSubscriber: Subscriber = {
      topic: '',
      alive: true,
      end: async () => {},
    };
    fakeMqttClient.subscribe.and.resolveTo(fakeSubscriber);

    await dab.showDeviceTelemetry();
    expect(fakeMqttClient.subscribe).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.DEVICE_TELEMETRY_METRICS),
      jasmine.anything(),
    );
    expect(dab.deviceTelemetrySub.alive).toBeTrue();
  });

  it('hides device telemetry', async () => {
    dab.deviceTelemetrySub.alive = true;
    spyOn(dab.deviceTelemetrySub, 'end').and.resolveTo();

    await dab.hideDeviceTelemetry();
    expect(dab.deviceTelemetrySub.end).toHaveBeenCalled();
  });

  it('starts app telemetry', async () => {
    const appId = 'testApp';
    const duration = 500;
    await dab.startAppTelemetry(appId, duration);
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.APP_TELEMETRY_START),
      {appId, duration},
    );
  });

  it('stops app telemetry', async () => {
    const appId = 'testApp';
    await dab.stopAppTelemetry(appId);
    expect(fakeMqttClient.request).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.APP_TELEMETRY_STOP),
      {appId},
    );
  });

  it('shows app telemetry', async () => {
    const fakeSubscriber: Subscriber = {
      topic: '',
      alive: true,
      end: async () => {},
    };
    fakeMqttClient.subscribe.and.resolveTo(fakeSubscriber);

    await dab.showAppTelemetry();
    expect(fakeMqttClient.subscribe).toHaveBeenCalledWith(
      jasmine.stringContaining(DabTopics.APP_TELEMETRY_METRICS),
      jasmine.anything(),
    );
    expect(dab.appTelemetrySub.alive).toBeTrue();
  });

  it('hides app telemetry', async () => {
    dab.appTelemetrySub.alive = true;
    spyOn(dab.appTelemetrySub, 'end').and.resolveTo();

    await dab.hideAppTelemetry();
    expect(dab.appTelemetrySub.end).toHaveBeenCalled();
  });
});
