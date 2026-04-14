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

import {FpsCounter} from './fps_counter';

describe('PerformanceUtil', () => {
  const requestAnimationFrameStore = window.requestAnimationFrame;
  afterEach(() => {
    window.requestAnimationFrame = requestAnimationFrameStore;
  });

  it('initializes FPS counter and tests stop function', () => {
    const fpsCounter = new FpsCounter();
    const stopFpsMeasurement = fpsCounter.start();
    const stopSpy = spyOn(fpsCounter, 'stop').and.callThrough();

    expect(stopFpsMeasurement).toBeDefined();
    stopFpsMeasurement();
    expect(stopSpy).toHaveBeenCalled();
  });

  it('calculates fps measurement data with sufficient timestamp data',
     async () => {
       // These are fake timestamps we'll use instead of the passed in timestamp
       // requestAnimationFrame normally has.
       const fakeTimestamps = [5064.3, 5080, 5096.9, 5112.9, 5128.5, 5144.4];

       let resolveRafCallbackPromise = () => {};
       const rafCallbackPromise = new Promise<void>((resolve) => {
         resolveRafCallbackPromise = resolve;
       });
       // We'll use this count to determine how many times the rAf callback
       // function is called.
       let count = 0;
       const requestAnimationFrame = jasmine.createSpy('requestAnimationFrame')
                                         .and.callFake((callback) => {
                                           // We increment and track this count
                                           // to prevent the callback loop from
                                           // running indefinitely, which is how
                                           // the FPS counter will behave
                                           // regularly, but for the sake of
                                           // testing we're limiting it to 6
                                           // iterations.
                                           if (count < 6) {
                                             callback(fakeTimestamps[count++]);
                                           } else {
                                             resolveRafCallbackPromise();
                                           }
                                         });

       // Set mock requestAnimationFrame.
       window.requestAnimationFrame = requestAnimationFrame;

       const fpsCounter = new FpsCounter();
       fpsCounter.start();

       await rafCallbackPromise;
       const fpsStats = fpsCounter.getFpsStats();

       // The FPS counter should have already been stopped since we're not
       // calling the rAf callback loop indefinitely, but just in case manually
       // stop it here as well.
       fpsCounter.stop();

       expect(fpsStats).toBeDefined();
       expect(fpsStats!.avgFps).toBeCloseTo(62.42);
       expect(fpsStats!.minFps).toBeCloseTo(59.17);
       expect(fpsStats!.maxFps).toBeCloseTo(64.1);
       expect(fpsStats!.pct05).toBeCloseTo(59.81);
       expect(fpsStats!.pct25).toBeCloseTo(62.5);
       expect(fpsStats!.pct50).toBeCloseTo(62.89);
       expect(fpsStats!.pct75).toBeCloseTo(63.69);
     });

  it('returns undefined FPS stats when there is insufficient timestamp data',
     () => {
       const fakeTimestamps = [5064.3];

       let count = 0;
       const requestAnimationFrame = jasmine.createSpy('requestAnimationFrame')
                                         .and.callFake((callback) => {
                                           if (count < 1) {
                                             callback(fakeTimestamps[count++]);
                                           }
                                         });

       // Set mock requestAnimationFrame.
       window.requestAnimationFrame = requestAnimationFrame;

       const fpsCounter = new FpsCounter();
       fpsCounter.start();

       const fpsStats = fpsCounter.getFpsStats();
       fpsCounter.stop();

       expect(fpsStats).toBeUndefined();
     });
});
