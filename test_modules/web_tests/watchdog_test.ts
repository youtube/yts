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

import * as util from 'google3/third_party/javascript/yts/test_utils/playback_util';

describe('Functional Tests', () => {
  describe('Watchdog', () => {
    async function watchdogTest() {
      const channelName = 'test';
      await util.registerEmptyWatchdogChannel(channelName);
      await util.pingWatchdogChannel(channelName, 'test-ping');
      await util.sleep(1000 * 3);
      const channelViolations = await util.getWatchdogViolations();
      expect(channelViolations).toContain('test-ping');
    }

    yts.test({id: 'C86E9AC6-1CFB-4D19-A34D-C63EC5C3BCF4'});
    it('Reports event when empty channel is set', async () => {
      await watchdogTest();
    });

    yts.test({id: 'FAD6A337-62BB-44AC-86C3-4AF7DFA17F3D'});
    it('Reports event when empty channel is set - EG Lite', async () => {
      await watchdogTest();
    });

    yts.test({id: '68534776-C0BF-4F03-9E56-4CC7606DBC90'});
    it('Reports event when empty channel is set - EG Full', async () => {
      await watchdogTest();
    });
  });
});
