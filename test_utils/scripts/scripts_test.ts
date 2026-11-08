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
 * @fileoverview Unit tests for guided utility scripts.
 */

// 'any' is allowed in test code
/* tslint:disable:no-any */

import 'jasmine';
import 'yts';

import * as stickyLoader from 'google3/third_party/javascript/yts/test_utils/sticky_loader';
import {Args, UtilScripts} from './constants';
import {useUtilScripts} from './scripts';

describe('guided util scripts', () => {
  let registeredScripts: Map<string, (...args: any[]) => any>;
  let prepareForReloadSpy: jasmine.Spy;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    registeredScripts = new Map();
    prepareForReloadSpy = jasmine.createSpy('prepareForReload');
    mockStorage = {};

    (globalThis as any).yts = {
      script: (name: string, fn: (...args: any[]) => any) => {
        registeredScripts.set(name, fn);
      },
      prepareForReload: prepareForReloadSpy,
    };

    const fakeEventTarget = {
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    };

    (globalThis as any).window = {
      ...fakeEventTarget,
      location: {
        href: 'https://yts.devicecertification.youtube/agent/agent.html',
        hostname: 'yts.devicecertification.youtube',
      },
      localStorage: {
        getItem: (key: string) => mockStorage[key] ?? null,
        setItem: (key: string, val: string) => {
          mockStorage[key] = val;
        },
        removeItem: (key: string) => {
          delete mockStorage[key];
        },
      },
    };
    (globalThis as any).document = {
      ...fakeEventTarget,
      visibilityState: 'visible',
    };

    useUtilScripts();
  });

  afterEach(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).document;
  });

  describe('APPLY_STICKY_LOADER', () => {
    it('delegates to applyStickyLoader without redundant prepareForReload', async () => {
      spyOn(stickyLoader, 'applyStickyLoader').and.resolveTo();
      const applyFn = registeredScripts.get(UtilScripts.APPLY_STICKY_LOADER)!;

      await applyFn(true);

      expect(stickyLoader.applyStickyLoader).toHaveBeenCalledWith(true);
      expect(prepareForReloadSpy).not.toHaveBeenCalled();
    });
  });

  describe('AWAIT_DEEP_LINK', () => {
    it('does not call prepareForReload when cancelled', () => {
      const awaitDlFn = registeredScripts.get(UtilScripts.AWAIT_DEEP_LINK)!;

      const result = awaitDlFn(Args.CANCEL);

      expect(result).toBeUndefined();
      expect(prepareForReloadSpy).not.toHaveBeenCalled();
    });

    it('calls prepareForReload when starting to await a deep link', async () => {
      const awaitDlFn = registeredScripts.get(UtilScripts.AWAIT_DEEP_LINK)!;

      const dlPromise = awaitDlFn();
      expect(prepareForReloadSpy).toHaveBeenCalledTimes(1);

      // Cancel the pending deep link listener so the promise settles cleanly.
      awaitDlFn(Args.CANCEL);
      expect(await dlPromise).toBe('');
      expect(prepareForReloadSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('AWAIT_VISIBILITY_CHANGE', () => {
    it('does not call prepareForReload when cancelled', () => {
      const awaitVisFn = registeredScripts.get(
        UtilScripts.AWAIT_VISIBILITY_CHANGE,
      )!;

      const result = awaitVisFn(Args.CANCEL);

      expect(result).toBeUndefined();
      expect(prepareForReloadSpy).not.toHaveBeenCalled();
    });

    it('does not call prepareForReload on missing or invalid event type', () => {
      const awaitVisFn = registeredScripts.get(
        UtilScripts.AWAIT_VISIBILITY_CHANGE,
      )!;

      expect(() => awaitVisFn()).toThrowError(
        'No visibility event type specified',
      );
      expect(() => awaitVisFn('invalid_event')).toThrowError(
        'Unexpected visibility event type: invalid_event',
      );
      expect(prepareForReloadSpy).not.toHaveBeenCalled();
    });

    it('calls prepareForReload when awaiting a valid visibility event', async () => {
      const awaitVisFn = registeredScripts.get(
        UtilScripts.AWAIT_VISIBILITY_CHANGE,
      )!;

      const visPromise = awaitVisFn('blur');
      expect(prepareForReloadSpy).toHaveBeenCalledTimes(1);

      awaitVisFn(Args.CANCEL);
      expect(await visPromise).toEqual([]);
      expect(prepareForReloadSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('LISTEN_VISIBILITY_EVENTS', () => {
    it('calls prepareForReload on start but not on STOP', async () => {
      const listenFn = registeredScripts.get(
        UtilScripts.LISTEN_VISIBILITY_EVENTS,
      )!;

      const startPromise = listenFn();
      expect(prepareForReloadSpy).toHaveBeenCalledTimes(1);

      prepareForReloadSpy.calls.reset();
      mockStorage['yts.util.visibility_events'] = JSON.stringify([
        'window.onblur',
      ]);

      const stoppedEvents = listenFn('STOP');
      expect(prepareForReloadSpy).not.toHaveBeenCalled();
      expect(stoppedEvents).toEqual(['window.onblur']);
      expect(await startPromise).toEqual(['window.onblur']);
    });

    it('filters out events newer than ignoreNewerThanMs on STOP', () => {
      jasmine.clock().install();
      try {
        jasmine.clock().mockDate(new Date(10_000));
        const listenFn = registeredScripts.get(
          UtilScripts.LISTEN_VISIBILITY_EVENTS,
        )!;

        mockStorage['yts.util.visibility_events'] = JSON.stringify([
          {name: 'window.onblur', ts: 5_000},
          {name: 'document.onvisibilitychange: hidden', ts: 6_000},
          // Relaunch started at t=8_000 (2_000 ms ago).
          {name: 'document.onvisibilitychange: visible', ts: 8_000},
          {name: 'window.onfocus', ts: 9_500},
        ]);

        const stoppedEvents = listenFn('STOP', 2_000);
        expect(stoppedEvents).toEqual([
          'window.onblur',
          'document.onvisibilitychange: hidden',
        ]);
      } finally {
        jasmine.clock().uninstall();
      }
    });

    it('keeps all events when ignoreNewerThanMs is null', () => {
      const listenFn = registeredScripts.get(
        UtilScripts.LISTEN_VISIBILITY_EVENTS,
      )!;
      mockStorage['yts.util.visibility_events'] = JSON.stringify([
        {name: 'window.onblur', ts: Date.now()},
      ]);

      expect(listenFn('STOP', null)).toEqual(['window.onblur']);
    });
  });
});
