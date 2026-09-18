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

import {trustedResourceUrl, unwrapResourceUrl} from 'safevalues';
import * as safevaluesDom from 'safevalues/dom';

import {getUrlParameters, keepUrlParams, navigateTo, SplashIframeMessageType, TEST_ONLY, toTrustedResourceUrl} from './url_utils';

describe('url_utils', () => {
  describe('toTrustedResourceUrl', () => {
    it('converts TrustedResourceUrl input from a trusted origin', () => {
      const input =
          trustedResourceUrl`https://storage.googleapis.com/staging.ytlr-cert.appspot.com/already_trusted.js`;
      const result = toTrustedResourceUrl(input);
      expect(unwrapResourceUrl(result).toString())
          .toBe(
              'https://storage.googleapis.com/staging.ytlr-cert.appspot.com/already_trusted.js',
          );
    });

    it('converts exact trusted base URL', () => {
      const input =
          'https://storage.googleapis.com/staging.ytlr-cert.appspot.com/';
      const result = toTrustedResourceUrl(input);
      expect(unwrapResourceUrl(result).toString()).toBe(input);
    });

    it('converts exact trusted base URL without trailing slash', () => {
      const input =
          'https://storage.googleapis.com/staging.ytlr-cert.appspot.com';
      const result = toTrustedResourceUrl(input);
      expect(unwrapResourceUrl(result).toString())
          .toBe(
              'https://storage.googleapis.com/staging.ytlr-cert.appspot.com/',
          );
    });

    it('converts trusted URL with relative path segments', () => {
      const input =
          'https://storage.googleapis.com/staging.ytlr-cert.appspot.com/test_modules/module.js';
      const result = toTrustedResourceUrl(input);
      expect(unwrapResourceUrl(result).toString()).toBe(input);
    });

    it('converts trusted URL with query parameters and fragment', () => {
      const input =
          'https://storage.googleapis.com/staging.ytlr-cert.appspot.com/test_modules/module.js?v=123#section';
      const result = toTrustedResourceUrl(input);
      expect(unwrapResourceUrl(result).toString()).toBe(input);
    });

    it('converts absolute relative path starting with slash', () => {
      const input = '/test_modules/module.js?v=123#section';
      const result = toTrustedResourceUrl(input);
      expect(unwrapResourceUrl(result).toString()).toBe(input);
    });

    it('converts relative path not starting with slash', () => {
      const input = 'test_modules/module.js';
      const result = toTrustedResourceUrl(input);
      expect(unwrapResourceUrl(result).toString()).toBe('/' + input);
    });

    it('throws error for untrusted domain absolute URL', () => {
      const input = 'https://example.com/test.js';
      expect(() => toTrustedResourceUrl(input))
          .toThrowError(
              /is an absolute URL but is not trusted/,
          );
    });

    it('throws error for malicious domain matching prefix', () => {
      const input =
          'https://storage.googleapis.com/staging.ytlr-cert.appspot.com.attacker.com/test.js';
      expect(() => toTrustedResourceUrl(input))
          .toThrowError(
              /is an absolute URL but is not trusted/,
          );
    });

    it('throws error for protocol-relative untrusted URL', () => {
      const input = '//attacker.com/test.js';
      expect(() => toTrustedResourceUrl(input))
          .toThrowError(
              /is an absolute URL but is not trusted/,
          );
    });
  });

  describe('getUrlParameters', () => {
    function check(search: string, expected: {[name: string]: string[]}) {
      expect(getUrlParameters(search)).toEqual(expected);
    }

    it('handles empty string', () => {
      check('', {});
      check('?', {});
    });
    it('handles equals sign in value', () => {
      check('?a=id=123', {'a': ['id=123']});
    });
    it('decodes', () => {
      // Server will send URL components encoded using encodeURIComponent
      check('?prop=%3Fa%3D1%26b%3D2', {'prop': ['?a=1&b=2']});
    });
  });

  describe('keepUrlParams', () => {
    it('merges params', () => {
      const actual = keepUrlParams(
          'http://current?additionalDataUrl=%3F&b=2',
          'http://new?b=3&c=4',
      );
      expect(actual).toEqual('http://new?b=3&c=4&additionalDataUrl=%3F');
    });
    it('keeps original', () => {
      const actual = keepUrlParams(
          'http://current?additionalDataUrl=%3F&b=2',
          'http://new',
      );
      expect(actual).toEqual('http://new?additionalDataUrl=%3F');
    });
    it('applies new', () => {
      const actual = keepUrlParams('http://current', 'http://new?b=3&c=4');
      expect(actual).toEqual('http://new?b=3&c=4');
    });
    it('discards launch parameter by default', () => {
      const actual = keepUrlParams(
          'http://current?launch=foo',
          'http://new?b=3&c=4',
      );
      expect(actual).toEqual('http://new?b=3&c=4');
    });
    it('keeps launch parameter when preserving params', () => {
      const actual = keepUrlParams(
          'http://current?launch=foo',
          'http://new?b=3&c=4',
          /*keepAgentParams=*/ true,
      );
      expect(actual).toEqual('http://new?b=3&c=4&launch=foo');
    });
    it('discards voice parameters by default', () => {
      const actual = keepUrlParams(
          'http://current?vs=1&vq=foo%20two&va=search&vaa=foo%three',
          'http://new?b=3&c=4',
      );
      expect(actual).toEqual('http://new?b=3&c=4');
    });
    it('keeps voice parameter when preserving params', () => {
      const actual = keepUrlParams(
          'http://current?vs=1&vq=foo%20two&va=search&vaa=foo%three&v=asdf1234&launch_tag=f00',
          'http://new?b=3&c=4',
          /*keepAgentParams=*/ true,
      );
      expect(actual).toEqual(
          'http://new?b=3&c=4&vs=1&vq=foo%20two&va=search&vaa=foo%three&v=asdf1234&launch_tag=f00',
      );
    });
    it('keeps repeated params in the new URL', () => {
      const actual = keepUrlParams(
          'http://current',
          'http://new?repeated_param=3&repeated_param=4',
      );
      expect(actual).toEqual('http://new?repeated_param=3&repeated_param=4');
    });
  });

  describe('navigateTo', () => {
    let postMessageSpy: jasmine.Spy;
    let setLocationHrefSpy: jasmine.Spy;

    beforeEach(() => {
      postMessageSpy = spyOn(window.parent, 'postMessage');
      setLocationHrefSpy = spyOn(safevaluesDom, 'setLocationHref');
      TEST_ONLY.inTestEnvironment = false;
    });

    afterEach(() => {
      TEST_ONLY.inTestEnvironment = false;
    });

    it('navigates iframe for external URL', () => {
      const externalUrl = 'https://ytlr-cert.appspot.com/some/path';
      navigateTo(externalUrl);

      expect(setLocationHrefSpy)
          .toHaveBeenCalledWith(
              window.location,
              jasmine.any(Object),
          );
      expect(postMessageSpy).not.toHaveBeenCalled();
    });

    it('posts message to parent for internal URL in iframe', () => {
      const internalUrl = `http://${window.location.hostname}/some/path`;
      navigateTo(internalUrl);

      expect(setLocationHrefSpy).not.toHaveBeenCalled();
      expect(postMessageSpy)
          .toHaveBeenCalledWith(
              jasmine.objectContaining({
                type: SplashIframeMessageType.TOP_FRAME_NAVIGATION,
                url: internalUrl,
              }),
              jasmine.objectContaining({
                targetOrigin: '*',
              }),
          );
    });

    it('navigates iframe for internal URL if inTestEnvironment is true', () => {
      TEST_ONLY.inTestEnvironment = true;
      const internalUrl = `http://${window.location.hostname}/some/path`;
      navigateTo(internalUrl);

      expect(setLocationHrefSpy)
          .toHaveBeenCalledWith(
              window.location,
              jasmine.any(Object),
          );
      expect(postMessageSpy).not.toHaveBeenCalled();
    });
  });
});
