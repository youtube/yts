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

import 'yts';

import {
  Device,
  isDabDevice,
  LaunchOptions,
  Script,
} from 'google3/third_party/javascript/yts/devices/interfaces';
import {deviceUnderTest} from 'google3/third_party/javascript/yts/test_context';
import {CecClient, sleep} from 'google3/third_party/javascript/yts/test_utils/cec/cec_client';
import {Commands} from 'google3/third_party/javascript/yts/test_utils/cec/constants';
import {eventSequenceMatcher} from 'google3/third_party/javascript/yts/test_utils/event_sequence_matcher';
import {UtilScripts} from 'google3/third_party/javascript/yts/test_utils/scripts/constants';
import {CobaltUserAgent} from 'google3/third_party/javascript/yts/yts_common';

// Jasmine test timeout
const TEST_TIMEOUT = 5 * 60 * 1000; //5 mins

// How long we wait to receive the hidden event
const HIDDEN_TIMEOUT = 30 * 1000; //30 sec

// How long to wait for device to turn off
const TV_OFF_WAIT_TIME = 7_000;

// How long to wait for device to turn on
const TV_ON_WAIT_TIME = 15_000;

const launchOptions: LaunchOptions = {
  scriptModule: 'test_modules/cec/scripts/scripts.js',
  reconnectTimeoutOverride: TEST_TIMEOUT,
};

let script!: Script;
let device!: Device;
let listenPromise: Promise<string[]> | undefined;
const client = new CecClient();

describe('CEC', () => {
  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = TEST_TIMEOUT;
    try {
      console.log(
        'NOTE: run yts with the --verbose flag to see all CEC messages',
      );
      device = await deviceUnderTest();
    } catch (e: unknown) {
      console.log('Cannot launch tests');
      console.log(e);
      throw e;
    }
  }, TEST_TIMEOUT);

  beforeEach(async () => {
    await client.init(fail);

    if (client.state !== 'ready') {
      const errMsg = 'Could not start the CEC client';
      console.error(errMsg);
      throw new Error(errMsg);
    }

    await sleep(1000);
    await relaunchScript();

    // Clear old events and event listeners
    await script.invoke('abortAwaitVisibilityChangeCec');
    try {
      await script.invoke(UtilScripts.LISTEN_VISIBILITY_EVENTS, 'STOP');
    } catch (e) {
      // Ignore
    }
    if (listenPromise) {
      listenPromise = undefined;
    }

    // Create new events/listeners
    await script.invoke('awaitVisibilityChangeCec', 'visible');
    listenPromise = (
      script.invokeIgnoringDisconnect(
        UtilScripts.LISTEN_VISIBILITY_EVENTS,
      ) as Promise<string[]>
    ).catch(() => []);

    console.log(`Using OTT logical address: ${client.logicalAddress}`);

    client.resetMessageExpectations();

    if (client.state !== 'ready') {
      throw new Error('Could not start the CEC client');
    }
  }, TEST_TIMEOUT);

  afterAll(async () => {
    client.kill();
    await device.stop();
  }, TEST_TIMEOUT);

  describe('Source', () => {
    /** CEC - Source - System Standby
     *
     * Tested requirements:
     *
     * 3.2.1 The device **MUST** dispatch a 'Freeze' Starboard event to switch
     * the YouTube application to the Frozen state if it receives one of the
     * following commands: i) HDMI CEC _System Standby_ message, ii) HDMI
     * CEC _Active Source_ message with a port address that belongs to another
     * device, iii) HDMI Hot Plug Detect (HPD) message indicating the device is
     * no longer active.
     */
    yts.test({id: 'F4E06562-73BB-4DD3-95E8-5D2DDDB5459D'});
    it(
      'System Standby',
      async () => {
        if (client.state !== 'ready') {
          return;
        }

        await getCobaltLtsVersion();
        const hidden = getHiddenPromise();
        await sleep(500);

        console.log('Sending system standby command');

        // We broadcast the system standby message here because we can't
        // turn off the TV without switching the active source to the
        // Pulse-Eight device, which triggers a "hidden" event by itself.
        // The OTT device should respond to straight up impersonated messages.
        await client.sendCommand(Commands.TV_BROADCAST_STANDBY);
        await sleep(TV_OFF_WAIT_TIME);

        if (!(await hidden)) {
          return;
        }

        await client.sendCommand(Commands.TV_ON);
        await sleep(TV_ON_WAIT_TIME);

        await relaunchScript();
        await verifyVisibilityEvents();
      },
      TEST_TIMEOUT,
    );

    /** CEC - Source - Active Source
     *
     * Tested requirements:
     *
     * 3.2.1 The device **MUST** dispatch a 'Freeze' Starboard event to switch
     * the YouTube application to the Frozen state if it receives one of the
     * following commands: i) HDMI CEC _System Standby_ message, ii) HDMI
     * CEC _Active Source_ message with a port address that belongs to another
     * device, iii) HDMI Hot Plug Detect (HPD) message indicating the device is
     * no longer active.
     */
    yts.test({id: 'DE630439-B267-40E8-B6F2-C1BDCCD40872'});
    it(
      'Active Source',
      async () => {
        if (client.state !== 'ready') {
          return;
        }

        await getCobaltLtsVersion();
        const hidden = getHiddenPromise();
        await sleep(500);

        await client.sendCommand(Commands.PULSE8_ACTIVE_SOURCE);
        if (!(await hidden)) {
          console.log('Setting Pulse-Eight as inactive source...');
          await client.sendCommand(Commands.PULSE8_INACTIVE_SOURCE);
          return;
        }

        console.log('Setting Pulse-Eight as inactive source...');
        await client.sendCommand(Commands.PULSE8_INACTIVE_SOURCE);

        await relaunchScript();
        await verifyVisibilityEvents();
      },
      TEST_TIMEOUT,
    );

    /** CEC - Source - Restart
     *
     * Tested requirements:
     *
     * 3.2.2 The device **MUST** broadcast the HDMI CEC _Active Source_
     * message with its port address when it becomes active, and **MUST** also
     * dispatch the appropriate Starboard event as defined in section 3.1.
     */
    yts.test({id: '49D4D36B-F778-4F91-81F7-EEC8F9AA1271'});
    it(
      'Restart',
      async () => {
        if (client.state !== 'ready') {
          return;
        }

        await sleep(500);

        // Switch to Pulse-Eight before shutting down as some devices will only
        // let it restart the TV if it's the active source.
        await client.sendCommand(Commands.PULSE8_ACTIVE_SOURCE);
        await client.sendCommand(Commands.TV_OFF);

        await sleep(TV_OFF_WAIT_TIME);

        client.expectMessage({
          substring: `${client.logicalAddress}f:82:`,
          received: false,
          description: `OTT device (logical address ${client.logicalAddress}) broadcasts Active Source message`,
        });

        await client.sendCommand(Commands.TV_ON);
        await sleep(TV_ON_WAIT_TIME);

        await relaunchScript();

        // Give some time for the messages to arrive
        await sleep(2_000);
        client.checkExpectedMessages(fail);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Sink', () => {
    /** CEC - Sink - Restart
     *
     * Tested requirements:
     *
     * 3.3.1 The device **SHOULD** broadcast the _System Standby_ message when
     * the TV is turned off.
     */
    yts.test({id: '3C58F3F0-8ECF-4CB7-8C0C-B7E79EB2E6D8'});
    it(
      'Restart',
      async () => {
        // Return early (notably before marking the test as optional) if the CEC
        // client hasn't been initialized. We want the test to fail outright if
        // it never truly ran.
        if (client.state !== 'ready') {
          return;
        }

        if (!isDabDevice(device)) {
          fail('Must run this test using DAB');
          return;
        }

        // This test is based on SHOULD requirements, so we mark it optional
        yts.markOptional();

        client.expectMessage({
          substring: '0f:36',
          received: false,
          description: 'System Standby message',
        });

        client.expectMessage({
          substring: '0f:82:',
          received: false,
          description: 'TV broadcasts Active Source message',
        });

        await dabRestart();

        client.checkExpectedMessages(fail);
        await verifyVisibilityEvents();
      },
      TEST_TIMEOUT,
    );

    /** CEC - Sink - Input Change
     *
     * Tested requirements:
     *
     * 3.3.3 The device **SHOULD** broadcast _Set Stream Path_, and **SHOULD**
     * broadcast _Routing Change_ with the prior and new active HDMI port
     * address, when the user selects an external active source (e.g. when the
     * user selects HDMI 1).
     */
    yts.test({id: '46903632-0E32-43CD-8579-A1C74A8A509A'});
    it(
      'Input Change',
      async () => {
        // Return early (notably before marking the test as optional) if the CEC
        // client hasn't been initialized. We want the test to fail outright if
        // it never truly ran.
        if (client.state !== 'ready') {
          return;
        }

        if (!isDabDevice(device)) {
          fail('Must run this test using DAB');
          return;
        }

        // This test is based on SHOULD requirements, so we mark it optional
        yts.markOptional();

        client.expectMessage({
          substring: '0f:86:',
          received: false,
          description: 'TV broadcasts Set Stream Path',
        });

        client.expectMessage({
          substring: '0f:80:',
          received: false,
          description: 'TV broadcasts Routing Change',
        });

        await dabInputChange();

        client.checkExpectedMessages(fail);
      },
      TEST_TIMEOUT,
    );
  });
});

let cachedCobaltLts: number | undefined;

/**
 * Returns the Cobalt LTS version of the device under test.
 */
async function getCobaltLtsVersion(): Promise<number> {
  if (cachedCobaltLts !== undefined) {
    return cachedCobaltLts;
  }
  try {
    const userAgent = (await script.invoke(
      UtilScripts.GET_USER_AGENT,
    )) as string;
    const parsedUA = new CobaltUserAgent(userAgent);
    const lts = parsedUA.cobaltVersion.lts || 0;
    console.log(`Detected Cobalt version: ${lts}`);
    cachedCobaltLts = lts;
    return cachedCobaltLts;
  } catch (e) {
    console.warn(`Failed to detect Cobalt version: ${e}`);
    return 0;
  }
}

/**
 * Verify that the expected visibility events were received.
 */
async function verifyVisibilityEvents() {
  const receivedEvents = (await script.invoke(
    UtilScripts.LISTEN_VISIBILITY_EVENTS,
    'STOP',
  )) as string[];

  if (listenPromise) {
    listenPromise = undefined;
  }

  const cobaltLts = await getCobaltLtsVersion();
  const deepestState = cobaltLts >= 26 ? 'visibilitychange' : 'freeze';
  eventSequenceMatcher.verify(
    receivedEvents,
    deepestState,
    fail,
    /* checkPartialSequence= */ true,
  );
}

/**
 * Returns a promise that resolves when the hidden event is received.
 * If the event is not received within the timeout, the promise is rejected.
 */
async function getHiddenPromise(): Promise<boolean> {
  if (!script) {
    throw new Error('Test did not initialize script successfully');
  }
  let success = false;
  const hiddenPromise = script
    .invoke('awaitVisibilityChangeCec', 'hidden')
    // Give 5 seconds for frozen events to possibly arrive
    .then(async () => sleep(3_000))
    .then(() => {
      success = true;
    });

  // Promise that "wakes up" every so often to see if it's still needed
  const refreshInterval = 300;
  const timeoutPromise = new Promise<void>(async (resolve) => {
    for (let k = 0; k < HIDDEN_TIMEOUT; k += refreshInterval) {
      await sleep(refreshInterval);
      if (success) {
        resolve();
        return;
      }
    }
    fail('Device never went into hidden state');
    resolve();
  });

  await Promise.race([hiddenPromise, timeoutPromise]);
  return success;
}

/** Waits for the DIAL server to come back online and THEN calls device.launchScript(). */
async function relaunchScript() {
  let serverWentDown = false;
  const numRetries = 10;
  for (let k = 0; k < numRetries; k++) {
    console.debug('Attempting health check of device...');
    const healthy = (await device.healthCheck()).healthy;
    if (healthy) {
      break;
    }
    serverWentDown = true;
    console.log('DIAL/DAB server not responding. Waiting then retrying...');
    if (k < numRetries - 1) {
      await sleep(30_000);
    } else {
      throw new Error(
        'DIAL/DAB server still not responding. Device may never have turned back on.',
      );
    }
  }

  // Relaunch YouTube if the script object is null or not connected.
  // We include the check to see if the server went down because sometimes
  // it still reports that YouTube is still up and connected.
  if (!script?.isConnected() || serverWentDown) {
    console.log('Launching YouTube');
    script = await device.launchScript(launchOptions);
    await sleep(5_000);
    return;
  }

  // Try to resume if the device still isn't visible
  console.log('Resuming YouTube');
  await device.resume();
  await sleep(5_000);
}

async function dabRestart() {
  if (!isDabDevice(device)) {
    throw new Error('Must run this test using DAB');
  }

  // Wait for any prior setup steps to finish
  await sleep(1_000);

  console.log('Restarting device with DAB...');
  console.log(
    'NOTE: if this step regularly fails, you may need to improve DAB restart and reconnect reliability.',
  );

  // Sometimes throws an error when the device is restarting, causing the
  // connection with the MQTT broker to go down.
  await device.restart().catch((e) => {
    console.error('Warning: error thrown when restarting DAB client');
  });

  // Some TVs don't wait for the device to restart before returning, and then
  // report that they're still online. Add a delay to make sure the device is
  // actually back up.
  await sleep(5_000);

  await relaunchScript();
}

async function dabInputChange() {
  if (!isDabDevice(device)) {
    throw new Error('Must run this test using DAB');
  }

  // Wait for the input source to change
  // If we do not wait, the device does not register the input change
  const delay = 2_000;

  let inputSource = await device.getVideoInputSource();
  console.log(`Current input source: ${inputSource}`);

  await device.setVideoInputSource('HDMI2');
  console.log('Input changed to HDMI2');
  await sleep(delay);

  inputSource = await device.getVideoInputSource();
  console.log(`Input source: ${inputSource}`);
  await sleep(delay);

  await device.setVideoInputSource('Home').catch((e) => {
    fail('DAB protocol error: cannot set input source to Home');
  });
  console.log('Input changed to Home');
  await sleep(delay);

  inputSource = await device.getVideoInputSource();
  console.log(`Input source: ${inputSource}`);
  await sleep(delay);

  await relaunchScript();

  // Give some time for the messages to arrive
  await sleep(delay);
}
