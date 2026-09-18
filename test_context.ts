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
 * @fileoverview Helper functions for YTS host-driven tests.
 */

import {Device} from 'google3/third_party/javascript/yts/devices/interfaces';
import {testContext} from 'google3/third_party/javascript/yts/test_utils/host/test_context_internal';

/**
 * When called from within a test module, returns object representing current
 * device under test.
 */
export async function deviceUnderTest(): Promise<Device> {
  if (!testContext.deviceResolver) {
    throw new Error(
        'Device under test has not been initialized in the context.',
    );
  }
  return testContext.deviceResolver();
}

/**
 * Returns the value of a test-specific flag.
 */
export function getFlag(key: string): string|undefined {
  return testContext.flags?.get(key);
}

/**
 * Returns the default agent URL configured for the current test run as a URL object.
 * Defaults to the production YTS agent URL if no explicit override was set.
 */
export function getDefaultAgentUrl(): URL {
  const agentUrl = testContext.agentUrl ??
      'https://yts.devicecertification.youtube/agent/agent.html';
  return new URL(agentUrl);
}

/**
 * Returns the default target application configured for the current test run.
 * Defaults to 'YouTube' if no explicit application was configured via --app.
 */
export function getDefaultApp(): string {
  return testContext.defaultApp ?? 'YouTube';
}
