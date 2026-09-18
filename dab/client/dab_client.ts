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

import * as dab from '../proto/dab_service.jsonpb_decls';
import {MqttClient} from './mqtt_client';
import {DabTopics} from '../lib/constants';
import {Subscriber} from '../lib/interfaces';
import * as util from '../lib/util';

// Time to wait for response from "restart" message
const RESTART_TIMEOUT = 60_000; // 1 minute

/**
 * DAB client wrapper for basic DAB commands for DAB 2.0
 * mqtt client need to be initialized before passing into DabClient constructor.
 * most of the mqtt logic should be inside mqtt_client.
 */
export class DabClient {
  messagesSub: Subscriber;
  deviceTelemetrySub: Subscriber;
  appTelemetrySub: Subscriber;
  constructor(
    readonly client: MqttClient,
    private readonly deviceId: string,
  ) {
    this.messagesSub = {topic: '', alive: false, end: async () => {}};
    this.deviceTelemetrySub = {topic: '', alive: false, end: async () => {}};
    this.appTelemetrySub = {topic: '', alive: false, end: async () => {}};
  }

  /**
   * Passes MQTT system messages into callback.
   * This is very useful for debugging purposes
   */
  async showMessages(callback: (message: string) => void) {
    if (!this.messagesSub.alive) {
      this.messagesSub = await this.client.subscribe(
        util.dabDeviceTopic(this.deviceId, DabTopics.DAB_MESSAGES),
        async (message) => {
          callback(JSON.stringify(message));
        },
      );
    }
  }

  static async discovery(client: MqttClient) {
    return (await client.requestWithMultipleResponses(
      util.dabTopic(DabTopics.DISCOVERY),
    )) as dab.DiscoverDevicesResponse[];
  }

  async hideMessages() {
    if (this.messagesSub && this.messagesSub.alive) {
      await this.messagesSub.end();
    }
  }

  /**
   * Gets DAB versions.
   */
  async version() {
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.DAB_VERSION),
    )) as dab.GetDabVersionResponse;
  }

  /**
   * Gets basic device info
   */
  async deviceInfo() {
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.DEVICE_INFO),
    )) as dab.GetDeviceInformationResponse;
  }

  /**
   * Capture image of the device screen.
   */
  async captureScreenshot() {
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.OUTPUT_IMAGE),
    )) as dab.CaptureScreenshotResponse;
  }

  /**
   * Restarts device
   */
  async restart() {
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.SYSTEM_RESTART),
      {},
      {qos: 2, timeoutMs: RESTART_TIMEOUT},
    )) as dab.DabResponse;
  }

  /**
   * This can be useful to check if the device is still online or not.
   * Also helpful to check if there is any ongoing errors with the device.
   */
  async healthCheck(args: {timeoutMs?: number} = {}) {
    const timeoutMs = args.timeoutMs ?? 60_000;
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.HEALTH_CHECK),
      {},
      {qos: 2, timeoutMs},
    )) as dab.CheckDeviceHealthResponse;
  }

  /**
   * Lists all available apps on device.
   */
  async listApps() {
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.APPLICATIONS_LIST),
    )) as dab.ListApplicationsResponse;
  }

  /**
   * Exit a running app.
   * @param appId The app id to exit.
   * @param background Force exit the app even if it is already running.
   */
  async exitApp(appId: string, background = false) {
    const request: dab.ExitApplicationRequest = {appId, background};
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.APPLICATIONS_EXIT),
      request,
    )) as dab.ExitApplicationResponse;
  }

  /**
   * Launch app with parameters.
   * @param appId If using adb bridge, this is the adb app id.
   * @param parameters List of url params to send or deeplink into YouTube.
   */
  async launchApp(appId: string, parameters: string[]) {
    const request: dab.LaunchApplicationRequest = {
      appId,
      parameters: parameters.map(encodeURIComponent),
    };

    // RDK doesn't support encoded parameters, so we introduce this env var
    // to work around the issue for now. When YTS_ENCODE_DAB = false, yts
    // doesn't encode DAB launch parameters.
    //TODO(dneu): fix workaround for parameter encoding after RDK bug is fixed
    const encodeDabEnvVar = 'YTS_ENCODE_DAB';
    const encodeDab =
      (process.env[encodeDabEnvVar] ?? '').toLowerCase() !== 'false';
    if (!encodeDab) {
      console.warn(
        `WARNING: ${encodeDabEnvVar} set to ${encodeDab}. No longer encoding DAB launch parameters.`,
      );
      request.parameters = parameters;
    }

    try {
      return (await this.client.request(
        util.dabDeviceTopic(this.deviceId, DabTopics.APPLICATIONS_LAUNCH),
        request,
      )) as dab.DabResponse;
    } catch (e: unknown) {
      console.error(`Error launching ${appId}`);
      throw e;
    }
  }

  /**
   * Get state of an app.
   * @param appId The app id to get state of.
   */
  async getState(appId: string) {
    const request: dab.GetApplicationStateRequest = {appId};
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.APPLICATIONS_GET_STATE),
      request,
    )) as dab.GetApplicationStateResponse;
  }

  /**
   * Get list of system settings
   */
  async getSettings() {
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.SYSTEM_SETTINGS_GET),
    )) as dab.GetCurrentSystemSettingsResponse;
  }

  /**
   * Lists all settings on the device.
   */
  async listSupportedSettings() {
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.SYSTEM_SETTINGS_LIST),
    )) as dab.ListSupportedSystemSettingsResponse;
  }

  /**
   * single action key press.
   * If user want to hold key for a long duration of time, please use
   * pressKeyLong function
   */
  async pressKey(keyCode: string) {
    const request: dab.SendKeyPressRequest = {keyCode};
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.INPUT_KEY_PRESS),
      request,
    )) as dab.DabResponse;
  }

  /**
   * Hold the key for a duration of time.
   */
  async pressKeyLong(keyCode: string, durationMs: number) {
    const request: dab.SendLongKeyPressRequest = {keyCode, durationMs};
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.INPUT_LONG_KEY_PRESS),
      request,
    )) as dab.DabResponse;
  }

  /**
   * Lists all available apps on device.
   */
  async listSupportedKeys() {
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.INPUT_KEY_LIST),
    )) as dab.ListSupportedKeysResponse;
  }

  /**
   * Sends voice intent to DAB device.
   */
  async sendVoiceText(requestText: string, voiceSystem: string) {
    const request: dab.SendVoiceAsTextRequest = {requestText, voiceSystem};
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.VOICE_SEND_TEXT),
      request,
    )) as dab.DabResponse;
  }

  /**
   * Lists all supported voice systems on the device.
   */
  async listSupportedVoiceSystems(): Promise<dab.ListSupportedVoiceSystemsResponse> {
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.VOICE_LIST),
    )) as dab.ListSupportedVoiceSystemsResponse;
  }

  /**
   * Set text-to-speech setting on the device
   */
  async setTextToSpeech(textToSpeech: boolean) {
    const request: dab.SystemSettings = {textToSpeech};
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.SYSTEM_SETTINGS_SET),
      request,
    )) as dab.DabResponse;
  }

  /**
   * Set language on device
   */
  async setLanguage(language: string) {
    const request: dab.SystemSettings = {language};
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.SYSTEM_SETTINGS_SET),
      request,
    )) as dab.DabResponse;
  }

  async setPersonalizedAds(personalizedAds: boolean) {
    const request: dab.SystemSettings = {personalizedAds};
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.SYSTEM_SETTINGS_SET),
      request,
    )) as dab.DabResponse;
  }

  /**
   * Set video input source on the device
   */
  async setVideoInputSource(videoInputSource: dab.VideoInputSource) {
    const request: dab.SystemSettings = {videoInputSource};
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.SYSTEM_SETTINGS_SET),
      request,
    )) as dab.DabResponse;
  }

  /**
   * Starts device system level metrics collection process.
   */
  async startDeviceTelemetry(duration: number) {
    const request: dab.StartDeviceTelemetryRequest = {duration};
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.DEVICE_TELEMETRY_START),
      request,
    )) as dab.StartDeviceTelemetryResponse;
  }

  async stopDeviceTelemetry() {
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.DEVICE_TELEMETRY_STOP),
    )) as dab.DabResponse;
  }

  /**
   * Display metrics gathered, this won't show anything if you didn't start
   * the service first.
   */
  async showDeviceTelemetry() {
    if (!this.deviceTelemetrySub.alive) {
      this.deviceTelemetrySub = await this.client.subscribe(
        util.dabDeviceTopic(this.deviceId, DabTopics.DEVICE_TELEMETRY_METRICS),
        async (message) => {
          console.log(
            `Device telemetry: ${JSON.stringify(message, null, 2)}\n`,
          );
        },
      );
    }
  }

  async hideDeviceTelemetry() {
    if (this.deviceTelemetrySub && this.deviceTelemetrySub.alive) {
      await this.deviceTelemetrySub.end();
    }
  }

  /**
   * Starts device app level metrics collection process.
   */
  async startAppTelemetry(appId: string, duration: number) {
    const request: dab.StartApplicationTelemetryRequest = {
      appId,
      duration,
    };
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.APP_TELEMETRY_START),
      request,
    )) as dab.StartApplicationTelemetryResponse;
  }

  async stopAppTelemetry(appId: string) {
    const request: dab.StopApplicationTelemetryRequest = {appId};
    return (await this.client.request(
      util.dabDeviceTopic(this.deviceId, DabTopics.APP_TELEMETRY_STOP),
      request,
    )) as dab.DabResponse;
  }

  /**
   * Display metrics gathered, this won't show anything if you didn't start
   * the service first.
   */
  async showAppTelemetry() {
    if (!this.appTelemetrySub.alive) {
      this.appTelemetrySub = await this.client.subscribe(
        util.dabDeviceTopic(this.deviceId, DabTopics.APP_TELEMETRY_METRICS),
        async (message) => {
          console.log(`App telemetry: ${JSON.stringify(message, null, 2)}\n`);
        },
      );
    }
  }

  async hideAppTelemetry() {
    if (this.appTelemetrySub) {
      await this.appTelemetrySub.end();
    }
  }
}
