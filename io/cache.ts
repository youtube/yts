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
 * @fileoverview Global yts_server value store. DO NOT add upstream
 * dependencies, as this cache needs to be cleared by the jasmine_global_setup
 * rule.
 */

class Cache {
  private readonly items = new Map<string, unknown>();

  /**
   * Attempts to retrieve item from in-memory cache, and adds it using the
   * factory method if it doesn't exist
   */
  get<T>(key: string, factory: (key: string) => T): T {
    let item = this.items.get(key);
    if (!item) {
      item = factory(key);
      this.items.set(key, item);
    }
    return item as T;
  }

  /**
   * Removes item from in-memory cache and returns it.
   */
  delete(key: string): unknown {
    const item = this.items.get(key);
    this.items.delete(key);
    return item;
  }

  /** Clears in-memory cache */
  clear() {
    this.items.clear();
  }

  /** Returns everything in the cache */
  getAll<T>(): T[] {
    return Array.from(this.items.values()) as T[];
  }
}

/** Global yts_server value store */
export const cache = new Cache();

/** Allow reference to individual class for testing purposes */
export const TEST_ONLY = {Cache};
