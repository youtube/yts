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
  Script,
} from 'google3/third_party/javascript/yts/devices/interfaces';
import {deviceUnderTest} from 'google3/third_party/javascript/yts/test_context';
import * as utils from 'google3/third_party/javascript/yts/test_utils/device_lifecycle_util';
import {
  exitCobalt,
  suspendCobalt,
} from 'google3/third_party/javascript/yts/test_utils/host/launch_util';
import {raceTimeout} from 'google3/third_party/javascript/yts/test_utils/race_timeout';
import {
  CobaltUserAgent,
  sleep,
} from 'google3/third_party/javascript/yts/yts_common';
import {eventSequenceMatcher} from 'google3/third_party/javascript/yts/test_utils/event_sequence_matcher';

function seconds(x: number) {
  return x * 1000;
}

function minutes(x: number) {
  return seconds(x * 60);
}

const MAX_PROCESS_TIME = seconds(3);

describe('Device Lifecycle', () => {
  let script!: Script;
  let device!: Device;

  beforeEach(async () => {
    device = await deviceUnderTest();
  });

  async function launchCobalt(): Promise<void> {
    console.log('launchCobalt');
    script = await device.launchScript(
      'test_modules/device_lifecycle/scripts/scripts.js',
    );
  }

  async function resumeCobalt(): Promise<void> {
    console.log('resumeCobalt');
    await device.resume();
  }

  async function getCobaltLtsVersion(): Promise<number> {
    const userAgent = (await script.invoke('getUserAgent')) as string;
    const parsedUA = new CobaltUserAgent(userAgent);
    console.log(`Detected Cobalt version: ${parsedUA.cobaltVersion.lts}`);
    return parsedUA.cobaltVersion.lts;
  }

  function getStateChanges(): Promise<string> {
    return script.invoke('getStateChanges') as Promise<string>;
  }

  function getEventTimestamps(): Promise<string> {
    return script.invoke('getEventTimestamps') as Promise<string>;
  }

  describe('Page Visibility', () => {
    yts.test({id: '7C36ABB6-A8C8-461F-9E18-96C68A930ECD'});
    it(
      'Triggers Exit Events',
      async () => {
        await launchCobalt();
        await script.invoke('addListeners');
        await script.invoke('clearLocalStorage');
        await sleep(seconds(5));
        await exitCobalt();
        await sleep(seconds(5));

        await launchCobalt();
        await script.invoke('addListeners');
        const stateChanges = await getStateChanges();

        const parsedStateChanges = JSON.parse(stateChanges) as string[];

        const cobaltLts = await getCobaltLtsVersion();
        const deepestState = cobaltLts >= 26 ? 'visibilitychange' : 'freeze';
        eventSequenceMatcher.verify(parsedStateChanges, deepestState, fail);
        await exitCobalt();
      },
      minutes(5),
    );

    yts.test({id: '6A51672A-1710-4228-95ED-46CD8880DE83'});
    it(
      'Triggers Suspend Resume Events',
      async () => {
        await launchCobalt();
        await script.invoke('addListeners');
        await script.invoke('clearLocalStorage');
        await sleep(seconds(5));
        const suspendTimestamp = (await script.invoke(
          'getDeviceTime',
        )) as number;
        await suspendCobalt();
        await sleep(seconds(5));
        await resumeCobalt();
        await sleep(seconds(5));
        const stateChanges = await getStateChanges();

        const parsedStateChanges = JSON.parse(stateChanges) as string[];

        const cobaltLts = await getCobaltLtsVersion();
        const deepestState = cobaltLts >= 26 ? 'visibilitychange' : 'freeze';
        eventSequenceMatcher.verify(parsedStateChanges, deepestState, fail);
        expect(parsedStateChanges).toContain('window.onfocus');

        // ensure suspend events happen at suspend and before resume fires
        const timestamps = await getEventTimestamps();
        const timestampArray = JSON.parse(timestamps) as number[];

        const resumeIndex = parsedStateChanges.findIndex(
          (ch: string) => ch.includes('onresume') || ch.includes('visible'),
        );
        const lastSuspendIndex =
          resumeIndex > 0 ? resumeIndex - 1 : timestampArray.length - 1;

        expect(MAX_PROCESS_TIME).toBeGreaterThan(
          timestampArray[lastSuspendIndex] - suspendTimestamp,
        );
        await exitCobalt();
      },
      minutes(5),
    );
  });

  describe('App State', () => {
    // NOTE: this test no longer exclusively uses window.close. It also uses
    // Chrobalt exit logic on Chrobalt.
    yts.test({id: '9442FC4B-5B69-4501-89B8-C0FDB9A0F785'});
    it(
      'Exits App on window.close',
      async () => {
        await launchCobalt();
        // Starting C26, performance object is not immediately available after
        // Cobalt is launched. We need to wait for it to be available.
        // This is not a problem for C25 and below.
        let launchTime: number | undefined;
        for (let wait = 0; wait < 10; wait++) {
          launchTime = (await script.invoke('getLaunchEpochTime')) as number;
          if (launchTime !== undefined) break;
          await sleep(seconds(1));
        }
        expect(launchTime).toBeDefined();
        // Confirms that partner didn't just pass current time to Cobalt Launch
        // time API.
        expect(launchTime)
          .withContext('different launch time for same Cobalt instance')
          .toEqual((await script.invoke('getLaunchEpochTime')) as number);
        await exitCobalt();
        await launchCobalt();
        // Starting C26, performance object is not immediately available after
        // Cobalt is launched. We need to wait for it to be available.
        // This is not a problem for C25 and below.
        let newLaunchTime: number | undefined;
        for (let wait = 0; wait < 10; wait++) {
          newLaunchTime = (await script.invoke('getLaunchEpochTime')) as number;
          if (newLaunchTime !== undefined) break;
          await sleep(seconds(1));
        }
        expect(newLaunchTime).toBeDefined();
        console.log(
          `old launchtime is: ${launchTime}, new launchtime is: ${newLaunchTime}`,
        );
        // Comparing Cobalt launch time before and after calling exitCobalt.
        // If app has been shut down by exitCobalt, it would obtain a brand new
        // Cobalt Launch time. If not, app is likely putting into background mode
        // on exitCobalt.
        expect(launchTime)
          .withContext('Cobalt did not exit')
          .not.toEqual(newLaunchTime);
      },
      minutes(5),
    );
  });

  describe('Loading Time', () => {
    yts.test({id: 'C9A2C1F1-355F-4A6F-BC9A-594CEA46EEEB'});
    it(
      'Cold Start',
      async () => {
        // We start the test off by playing Big Buck Bunny because 1) it's
        // unmonetized, 2) it populates a watch history so that Kabuki doesn't
        // load in NoHo mode, and 3) it's a fan favorite. Everyone loves to
        // watch the adventures of Big Buck Bunny, especially when it is played
        // 4-5 times a day during certification.
        //
        // However, reason #2 is arguably the most important.
        console.log(
          'Will now briefly play unmonetized video to prepare for cold start.',
        );
        const url = 'https://www.youtube.com/tv?v=aqz-KE-bpKQ';
        const payload = `loader=yts&redirect=${encodeURIComponent(url)}`;
        await device.launch(payload);
        await sleep(15_000);
        await device.stop();
        await sleep(seconds(3));

        let loadingTime = 0;
        console.log(
          `Will now launch and measure loading time ${utils.SAMPLE_SIZE} times to average the result.`,
        );

        let attemptNum = 0;
        const maxRetries = 3;

        for (let i = 0; i < utils.SAMPLE_SIZE; i++) {
          console.log('launchCobalt');
          script = await device.launchScript({agentUrl: utils.MAIN_APP_URL});

          // no typings for window.ytcsi object
          // tslint:disable-next-line:no-any
          let ytcsi: any;
          let endMs: number | undefined;

          // Poll for up to 10 seconds waiting for either 'ftl' (First Thumbnail
          // Load) or 'ftl_d' (First Thumbnail Load Disabled) tick to be logged
          for (let wait = 0; wait < 10; wait++) {
            ytcsi = await script.invoke('getYtcsi');
            if (ytcsi && ytcsi[0] && ytcsi[0].tick) {
              endMs = ytcsi[0].tick.ftl || ytcsi[0].tick.ftl_d;
              if (endMs) break;
            }
            await sleep(seconds(1));
          }

          console.debug('window.ytcsi.debug');
          console.debug(ytcsi);

          const startMs: number = ytcsi[0].tick._start;
          const cobaltStartMs: number = ytcsi[0].info.shellStartupDurationMs;
          const appStartMs = endMs
            ? Math.round(endMs - startMs + cobaltStartMs)
            : NaN;

          console.log('endMs = ', endMs);
          console.log('startMs = ', startMs);
          console.log('cobaltStartMs = ', cobaltStartMs);
          console.log(
            'appStartMs = (endMs - startMs) + cobaltStartMs =',
            appStartMs,
          );

          // If we get an invalid value, retry the measurement.
          if (isNaN(appStartMs)) {
            i--;
            if (++attemptNum === maxRetries) {
              throw new Error(
                `Failed to measure app start time after ${maxRetries} retries.`,
              );
            }
            console.log(`Failed to measure app start time. Retrying...`);
          } else {
            attemptNum = 0;
            loadingTime += appStartMs;
          }

          await exitCobalt();
        }

        utils.expectLoadingTime(9000, loadingTime, 0);
      },
      seconds(30) * utils.SAMPLE_SIZE * 2,
    );

    yts.test({id: 'A894D105-DC28-4F51-AA9C-8B4AADC054DF'});
    it(
      'Warm Start',
      async () => {
        await launchCobalt();

        let resumeTimeSum = 0;
        console.log(
          `Will now suspend and resume Cobalt ${utils.SAMPLE_SIZE} times, measuring the time between resumeCobalt() call and document.onresume event in JavaScript.`,
        );

        for (let i = 0; i < utils.SAMPLE_SIZE; i++) {
          await suspendCobalt();
          await sleep(seconds(3));

          const resumePromise = script.invoke('whenResumed');
          const before = new Date().getTime();
          await resumeCobalt();

          await raceTimeout(
            resumePromise,
            seconds(10),
            `document.onresume listener wasn't called within 10 seconds of resumeCobalt() call.`,
          );

          const after = new Date().getTime();
          const delta = after - before;
          console.log(`delay: ${delta} ms`);
          resumeTimeSum += delta;
          await sleep(seconds(3));
        }

        const resumeTime = Math.round(resumeTimeSum / utils.SAMPLE_SIZE);
        yts.addMetric('resume_time', resumeTime);
        console.log(
          `Average delay between resumeCobalt() call and document.onresume event: ${resumeTime} ms.`,
        );
        expect(resumeTime).withContext('Resume Time (ms)').toBeLessThan(5000);
      },
      minutes(1) + seconds(10 + 3 + 3) * utils.SAMPLE_SIZE, // overall 1 minute + (10 sec timeout + 3 sec sleep + 3 sec sleep) for each sample
    );
  });
});
