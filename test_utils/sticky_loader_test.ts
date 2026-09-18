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

import * as globalUtils from 'google3/third_party/javascript/yts/yts_common/global';

import {applyStickyLoader, removeStickyLoader, TEST_ONLY} from './sticky_loader';
import * as urlUtils from './url_utils';

const PROD_LOADER = 'yts';
const PROD_HOSTNAME = 'yts.devicecertification.youtube';
const TEST_HOSTNAME = 'ytstest.yts.devicecertification.youtube';
const TEST_LOADER = 'ytstest';
const SUBVERSION_HOSTNAME = '20260515.yts.devicecertification.youtube';

// Mock window object
const fakeWindow = {
  location: {
    hostname: PROD_HOSTNAME,
    pathname: '/agent/agent.html',
    href: `https://${PROD_HOSTNAME}/agent/agent.html`,
    search: '',
    hash: '',
  },
};

// Update mock window object with a new URL
function updateFakeWindow(url: string) {
  fakeWindow.location.href = url.toString();
  const urlObj = new URL(url.toString());
  fakeWindow.location.pathname = urlObj.pathname;
  fakeWindow.location.search = urlObj.search;
  fakeWindow.location.hash = urlObj.hash;
  fakeWindow.location.hostname = urlObj.hostname;
}

describe('sticky_loader', () => {
  // Mock all window-based functions
  beforeAll(() => {
    urlUtils.TEST_ONLY.skipPromises = true;
    urlUtils.TEST_ONLY.inTestEnvironment = true;
    spyOn(globalUtils, 'getGlobal').and.callFake(() => {
      return fakeWindow;
    });
    // tslint:disable-next-line:no-any
    (globalThis as any).yts = {
      prepareForReload: () => {},
    };
  });

  afterAll(() => {
    urlUtils.TEST_ONLY.skipPromises = false;
    urlUtils.TEST_ONLY.inTestEnvironment = false;
  });

  beforeEach(() => {
    TEST_ONLY.setStickyLoaderApplied(false);
  });

  describe('sticky loader (yts)', () => {
    it('Applies sticky loader', async () => {
      updateFakeWindow(`https://${PROD_HOSTNAME}/agent/agent.html`);
      await applyStickyLoader();
      expect(fakeWindow.location.href)
          .toBe(
              `https://www.youtube.com/tv?stick=1#?loader=${PROD_LOADER}`,
          );
    });

    it('Applies sticky loader to a sub-version', async () => {
      updateFakeWindow(`https://${SUBVERSION_HOSTNAME}/agent/agent.html`);
      await applyStickyLoader();
      expect(fakeWindow.location.href)
          .toBe(
              `https://www.youtube.com/tv?stick=1&redirect=https://${
                  SUBVERSION_HOSTNAME}/agent/agent.html#?loader=${PROD_LOADER}`,
          );
    });

    it('Removes sticky loader', async () => {
      TEST_ONLY.setStickyLoaderApplied(true);

      updateFakeWindow(`https://${PROD_HOSTNAME}/agent/agent.html`);
      await removeStickyLoader();
      expect(fakeWindow.location.href)
          .toBe(
              `https://www.youtube.com/tv?stick=0#?loader=${PROD_LOADER}`,
          );
    });

    it('Removes sticky loader from a sub-version', async () => {
      TEST_ONLY.setStickyLoaderApplied(true);

      updateFakeWindow(`https://${SUBVERSION_HOSTNAME}/agent/agent.html`);
      await removeStickyLoader();
      expect(fakeWindow.location.href)
          .toBe(
              `https://www.youtube.com/tv?stick=0&redirect=https://${
                  SUBVERSION_HOSTNAME}/agent/agent.html#?loader=${PROD_LOADER}`,
          );
    });
  });

  describe('sticky loader (ytstest)', () => {
    it('Applies sticky loader', async () => {
      updateFakeWindow(`https://${TEST_HOSTNAME}/agent/agent.html`);
      await applyStickyLoader(/* testProd = */ true);
      expect(fakeWindow.location.href)
          .toBe(
              `https://www.youtube.com/tv?stick=1#?loader=${TEST_LOADER}`,
          );
    });

    it('Applies sticky loader to a sub-version', async () => {
      updateFakeWindow(`https://${SUBVERSION_HOSTNAME}/agent/agent.html`);
      await applyStickyLoader(/* testProd = */ true);
      expect(fakeWindow.location.href)
          .toBe(
              `https://www.youtube.com/tv?stick=1&redirect=https://${
                  SUBVERSION_HOSTNAME}/agent/agent.html#?loader=${TEST_LOADER}`,
          );
    });

    it('Removes sticky loader', async () => {
      TEST_ONLY.setStickyLoaderApplied(true);

      updateFakeWindow(`https://${TEST_HOSTNAME}/agent/agent.html`);
      await removeStickyLoader(/* testProd = */ true);
      expect(fakeWindow.location.href)
          .toBe(
              `https://www.youtube.com/tv?stick=0#?loader=${TEST_LOADER}`,
          );
    });

    it('Removes sticky loader from a sub-version', async () => {
      TEST_ONLY.setStickyLoaderApplied(true);

      updateFakeWindow(`https://${SUBVERSION_HOSTNAME}/agent/agent.html`);
      await removeStickyLoader(/* testProd = */ true);
      expect(fakeWindow.location.href)
          .toBe(
              `https://www.youtube.com/tv?stick=0&redirect=https://${
                  SUBVERSION_HOSTNAME}/agent/agent.html#?loader=${TEST_LOADER}`,
          );
    });
  });
});
