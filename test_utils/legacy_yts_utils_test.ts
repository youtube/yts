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

import {
  hasDomProperty,
  makeCapitalName,
  makeFieldName,
} from './legacy_yts_utils';

describe('legacy_yts_utils', () => {
  describe('hasDomProperty', () => {
    it('should return true for existing properties', () => {
      const mockDomObject = {
        existingProperty: 'value',
        webkitPrefixedProperty: 'value2',
      };
      expect(hasDomProperty(mockDomObject, 'existingProperty')).toBe(true);
    });

    it('should return true for webkit-prefixed properties', () => {
      const mockDomObject = {
        webkitPrefixedProperty: 'value',
      };
      // Test with the non-prefixed version, function should handle prefix.
      expect(hasDomProperty(mockDomObject, 'prefixedProperty')).toBe(true);
    });

    it('should return false for non-existing properties', () => {
      const mockDomObject = {
        someProperty: 'value',
      };
      expect(hasDomProperty(mockDomObject, 'nonExistingProperty')).toBe(false);
    });

    it('should handle empty objects', () => {
      expect(hasDomProperty({}, 'anyProperty')).toBe(false);
    });
  });

  describe('makeCapitalName', () => {
    it('should capitalize the first letter of each word', () => {
      expect(makeCapitalName('hello world')).toBe('Hello World');
    });

    it('should handle single words', () => {
      expect(makeCapitalName('test')).toBe('Test');
    });

    it('should handle already capitalized words', () => {
      expect(makeCapitalName('Already Capitalized')).toBe(
        'Already Capitalized',
      );
    });

    it('should handle empty strings', () => {
      expect(makeCapitalName('')).toBe('');
    });
  });

  describe('makeFieldName', () => {
    it('should convert snake-case to camelCase', () => {
      expect(makeFieldName('snake-case-example')).toBe('snakeCaseExample');
    });

    it('should handle single segment names', () => {
      expect(makeFieldName('segment')).toBe('segment');
    });

    it('should handle names with numbers', () => {
      expect(makeFieldName('property-name-123')).toBe('propertyName123');
    });

    it('should handle names that are already camelCase (if no hyphens)', () => {
      expect(makeFieldName('alreadyCamelCase')).toBe('alreadyCamelCase');
    });

    it('should handle empty strings', () => {
      expect(makeFieldName('')).toBe('');
    });
  });
});
