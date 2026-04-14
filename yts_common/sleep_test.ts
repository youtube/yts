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

import {sleep} from './sleep';

describe('sleep', () => {
  it('basics', async () => {
    const p = sleep(1000);
    await new Promise((r) => void setTimeout(r, 500));
    await expectAsync(p).toBePending();
    await new Promise((r) => void setTimeout(r, 600));
    await expectAsync(p).toBeResolved();
  });

  it('Infinity', async () => {
    const p = sleep(Infinity);
    await new Promise((r) => void setTimeout(r, 1000));
    await expectAsync(p).toBePending();
  });

  it('abort', async () => {
    const a = new AbortController();
    spyOn(a.signal, 'addEventListener').and.callThrough();
    spyOn(a.signal, 'removeEventListener').and.callThrough();
    const p = sleep(1000, a.signal);
    await new Promise((r) => void setTimeout(r, 500));
    await expectAsync(p).toBePending();
    a.abort(new Error('aborted'));
    await expectAsync(p).toBeRejectedWith(new Error('aborted'));
    expect(a.signal.addEventListener).toHaveBeenCalledTimes(1);
    expect(a.signal.removeEventListener).toHaveBeenCalledTimes(1);
  });
});
