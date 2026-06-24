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

import {HttpRequest, TEST_ONLY} from './http';

const {getRequestAsCurlCommand} = TEST_ONLY;

describe('getRequestAsCurlCommand', () => {
  it('handles simple GET request', () => {
    const request: HttpRequest = {
      url: 'http://localhost/foo',
    };
    expect(getRequestAsCurlCommand(request)).toEqual(
      `curl http://localhost/foo`,
    );
  });

  it('handles POST request with headers and body', () => {
    const request: HttpRequest = {
      url: 'http://localhost/foo',
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: '{"foo": "bar"}',
    };
    expect(getRequestAsCurlCommand(request)).toEqual(
      `curl -X POST -H 'Content-Type: application/json' -d '{"foo": "bar"}' http://localhost/foo`,
    );
  });
});
