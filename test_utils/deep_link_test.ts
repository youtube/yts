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

/** @fileoverview Unit tests for deep link helper utilities. */

import 'jasmine';

import {
  addDeepLinkListener,
  awaitDeepLink,
  clearDeepLinks,
  getDeepLinks,
  listenDeepLink,
  TEST_ONLY,
  writeLastDeepLinkToLocalStorage,
} from './deep_link';

describe('deep_link', () => {
  beforeEach(() => {
    TEST_ONLY.resetForTesting();
  });

  afterEach(() => {
    TEST_ONLY.resetForTesting();
  });

  describe('addDeepLinkListener', () => {
    it('registers Chrobalt addEventListener when ondeeplink is defined', () => {
      const addEventListenerSpy = jasmine.createSpy('addEventListener');
      const addListenerSpy = jasmine.createSpy('addListener');

      const originalH5vcc = window.h5vcc;
      try {
        window.h5vcc = {
          runtime: {
            ondeeplink: null,
            addEventListener: addEventListenerSpy,
            onDeepLink: {addListener: addListenerSpy},
          },
        } as unknown as typeof window.h5vcc;

        const listener = jasmine.createSpy('listener');
        addDeepLinkListener(listener);

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'deeplink',
          jasmine.any(Function),
        );
        expect(addListenerSpy).not.toHaveBeenCalled();

        const callback = addEventListenerSpy.calls.mostRecent().args[1] as (e: {
          url?: string;
        }) => void;
        callback({url: undefined});
        expect(listener).not.toHaveBeenCalled();

        const url = 'https://www.youtube.com/tv?v=chrobalt';
        callback({url});
        expect(listener).toHaveBeenCalledWith(url);
      } finally {
        window.h5vcc = originalH5vcc;
      }
    });

    it('registers Cobalt onDeepLink listener when ondeeplink is undefined', () => {
      const addListenerSpy = jasmine.createSpy('addListener');

      const originalH5vcc = window.h5vcc;
      try {
        window.h5vcc = {
          runtime: {
            onDeepLink: {addListener: addListenerSpy},
          },
        } as unknown as typeof window.h5vcc;

        const listener = jasmine.createSpy('listener');
        addDeepLinkListener(listener);

        expect(addListenerSpy).toHaveBeenCalledWith(jasmine.any(Function));
        const callback = addListenerSpy.calls.mostRecent().args[0] as (
          link: string,
        ) => void;
        const url = 'https://www.youtube.com/tv?v=cobalt';
        callback(url);
        expect(listener).toHaveBeenCalledWith(url);
      } finally {
        window.h5vcc = originalH5vcc;
      }
    });
  });

  describe('writeLastDeepLinkToLocalStorage', () => {
    it('writes deep link to localStorage under key yts.last_deep_link', () => {
      const link = 'https://www.youtube.com/tv?v=xyz';
      writeLastDeepLinkToLocalStorage(link);
      expect(window.localStorage?.getItem('yts.last_deep_link')).toBe(link);
    });

    it('catches and logs error when localStorage throws', () => {
      const originalSetItem = window.localStorage?.setItem;
      const errorSpy = spyOn(console, 'error');
      const logSpy = spyOn(console, 'log');
      try {
        spyOn(window.localStorage, 'setItem').and.throwError('QuotaExceeded');
        writeLastDeepLinkToLocalStorage('https://www.youtube.com/tv?v=test');
        expect(logSpy).toHaveBeenCalledWith(
          'Error recording deep link to local storage',
        );
        expect(errorSpy).toHaveBeenCalled();
      } finally {
        if (originalSetItem) {
          window.localStorage.setItem = originalSetItem;
        }
      }
    });
  });

  describe('listenDeepLink and getDeepLinks', () => {
    it('starts empty', () => {
      expect(getDeepLinks()).toEqual([]);
    });

    it('records valid deep link when listenDeepLink is active', () => {
      listenDeepLink();
      const validUrl = 'https://www.youtube.com/tv?v=dQw4w9WgXcQ';
      TEST_ONLY.handleDeepLinkForTesting(validUrl);
      expect(getDeepLinks()).toEqual([validUrl]);
    });

    it('records multiple deep links in arrival order', () => {
      listenDeepLink();
      const url1 = 'https://www.youtube.com/tv?v=abc';
      const url2 = 'https://www.youtube.com/tv?v=def';
      TEST_ONLY.handleDeepLinkForTesting(url1);
      TEST_ONLY.handleDeepLinkForTesting(url2);
      expect(getDeepLinks()).toEqual([url1, url2]);
    });

    it('resets in-memory deep links on getDeepLinks', () => {
      listenDeepLink();
      const validUrl = 'https://www.youtube.com/tv?v=dQw4w9WgXcQ';
      TEST_ONLY.handleDeepLinkForTesting(validUrl);
      expect(getDeepLinks()).toEqual([validUrl]);
      expect(getDeepLinks()).toEqual([]);
    });

    it('recovers last deep link from localStorage across reload', () => {
      const fallbackUrl =
        'https://www.youtube.com/tv?vq=what+blocks+do+I+need';
      window.localStorage?.setItem('yts.last_deep_link', fallbackUrl);
      expect(getDeepLinks()).toEqual([fallbackUrl]);
      expect(window.localStorage?.getItem('yts.last_deep_link')).toBeNull();
    });

    it('discards localStorage fallback when an in-memory link is present', () => {
      listenDeepLink();
      const liveUrl = 'https://www.youtube.com/tv?vq=live';
      TEST_ONLY.handleDeepLinkForTesting(liveUrl);
      window.localStorage?.setItem('yts.last_deep_link', liveUrl);
      expect(getDeepLinks()).toEqual([liveUrl]);
      expect(window.localStorage?.getItem('yts.last_deep_link')).toBeNull();
    });
  });

  describe('clearDeepLinks', () => {
    it('clears deep links and storage on clearDeepLinks', () => {
      const validUrl = 'https://www.youtube.com/tv?v=test';
      window.localStorage?.setItem('yts.last_deep_link', validUrl);
      TEST_ONLY.handleDeepLinkForTesting(validUrl);
      expect(getDeepLinks()).toEqual([validUrl]);

      clearDeepLinks();
      expect(getDeepLinks()).toEqual([]);
      expect(window.localStorage?.getItem('yts.last_deep_link')).toBeNull();
    });
  });

  describe('awaitDeepLink', () => {
    it('resolves when a deep link arrives', async () => {
      const promise = awaitDeepLink();
      const validUrl = 'https://www.youtube.com/tv?v=await_test';
      TEST_ONLY.handleDeepLinkForTesting(validUrl);
      const result = await promise;
      expect(result).toBe(validUrl);
    });
  });
});
