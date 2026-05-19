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

import * as eme_utils from './eme_utils';

describe('eme_utils', () => {
  it('should convert array to string', () => {
    const arr = new Uint8Array([72, 101, 108, 108, 111]);  // "Hello"
    expect(eme_utils.arrayToString(arr)).toBe('Hello');
  });

  it('should convert string to array', () => {
    const str = 'Hello';
    const expected = new Uint8Array([72, 101, 108, 108, 111]);
    expect(eme_utils.stringToArray(str)).toEqual(expected);
  });

  it('should send individualization request and handle success', () => {
    const openSpy = spyOn(XMLHttpRequest.prototype, 'open');
    const setHeaderSpy = spyOn(XMLHttpRequest.prototype, 'setRequestHeader');
    let readystatechangeHandler: (evt: Event) => void = () => {};
    spyOn(XMLHttpRequest.prototype, 'addEventListener')
        .and.callFake(
            (type: string, listener: EventListenerOrEventListenerObject) => {
              if (type === 'readystatechange') {
                readystatechangeHandler = listener as (evt: Event) => void;
              }
            },
        );
    const sendSpy =
        spyOn(XMLHttpRequest.prototype, 'send')
            .and.callFake(
                function(this: XMLHttpRequest, data: string|Document|null) {
                  // Simulate successful response
                  Object.defineProperty(this, 'readyState', {get: () => 4});
                  Object.defineProperty(this, 'status', {get: () => 200});
                  Object.defineProperty(
                      this, 'responseText', {get: () => 'response'});
                  readystatechangeHandler({} as Event);
                },
            );

    const message = new ArrayBuffer(5);
    const cb = jasmine.createSpy('callback');
    const onError = jasmine.createSpy('onError');

    eme_utils.requestIndividualization(message, cb, onError);

    expect(openSpy.calls.mostRecent().args[0]).toBe('POST');
    expect(openSpy.calls.mostRecent().args[1])
        .toBe(
            'https://content.googleapis.com/certificateprovisioning/v1/devicecertificates/create?key=REDACTED_API_KEY&yts=eme');
    expect(setHeaderSpy)
        .toHaveBeenCalledWith('Content-type', 'application/json');
    expect(sendSpy).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(eme_utils.stringToArray('response'));
    expect(onError).not.toHaveBeenCalled();
  });

  it('should send individualization request and handle failure', () => {
    spyOn(XMLHttpRequest.prototype, 'open');
    spyOn(XMLHttpRequest.prototype, 'setRequestHeader');
    let readystatechangeHandler: (evt: Event) => void = () => {};
    spyOn(XMLHttpRequest.prototype, 'addEventListener')
        .and.callFake(
            (type: string, listener: EventListenerOrEventListenerObject) => {
              if (type === 'readystatechange') {
                readystatechangeHandler = listener as (evt: Event) => void;
              }
            },
        );
    spyOn(XMLHttpRequest.prototype, 'send')
        .and.callFake(
            function(this: XMLHttpRequest, data: string|Document|null) {
              // Simulate failed response
              Object.defineProperty(this, 'readyState', {get: () => 4});
              Object.defineProperty(this, 'status', {get: () => 500});
              readystatechangeHandler({} as Event);
            },
        );

    const message = new ArrayBuffer(5);
    const cb = jasmine.createSpy('callback');
    const onError = jasmine.createSpy('onError');

    eme_utils.requestIndividualization(message, cb, onError);

    expect(onError).toHaveBeenCalledWith(500);
    expect(cb).not.toHaveBeenCalled();
  });
});
