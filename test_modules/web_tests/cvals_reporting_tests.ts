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

import {h5vcc} from 'google3/third_party/javascript/yts/yts_common/h5vcc';
import 'jasmine';

describe('Functional Tests', () => {
  yts.test({id: '9E44F707-076A-47D2-8E7B-E8E7C72A7D14'});
  it('CPU Utilization Reporting', async () => {
    if (!h5vcc?.cVal) {
      fail('Unable to fetch CPU utilization - h5vcc.cVal is not defined');
      return;
    }

    const cpuIntervals = [1, 2, 5];
    for (const interval of cpuIntervals) {
      const cpuTotalUsage = h5vcc.cVal.getValue(
        `CPU.Total.Usage.IntervalSeconds.${interval}`,
      );
      expect(cpuTotalUsage)
        .not.withContext(
          `Value for CPU.Total.Usage.IntervalSeconds.${interval} should not be null`,
        )
        .toBeNull();
      console.log(
        `CPU.Total.Usage.IntervalSeconds.${interval}: ${cpuTotalUsage}`,
      );
      const cpuPerThreadUsage = h5vcc.cVal.getValue(
        `CPU.PerThread.Usage.IntervalSeconds.${interval}`,
      );
      console.log(
        `CPU.PerThread.Usage.IntervalSeconds.${interval}: ${JSON.stringify(cpuPerThreadUsage)}`,
      );
      expect(cpuPerThreadUsage)
        .not.withContext(
          `Value for CPU.PerThread.Usage.IntervalSeconds.${interval} should not be null`,
        )
        .toBeNull();
    }
  });

  yts.test({id: '778E3B2E-A27C-4E2F-970E-7D5892755F45'});
  it('Memory Utilization Reporting', async () => {
    if (!h5vcc?.cVal) {
      fail('Unable to fetch CPU utilization - h5vcc.cVal is not defined');
      return;
    }

    const memoryProperties = [
      'Memory.CPU.Free',
      'Memory.CPU.Used',
      'Memory.GPU.Free',
      'Memory.GPU.Used',
      'Memory.JS',
      'Memory.Font.LocalTypefaceCache.Capacity',
      'Memory.Font.LocalTypefaceCache.Size',
      'Memory.MainWebModule.DOM.HtmlScriptElement.Execute',
    ];

    for (const property of memoryProperties) {
      const value = h5vcc.cVal.getValue(property);
      expect(value)
        .not.withContext(`Value for ${property} should not be null`)
        .toBeNull();
      console.log(`${property}: ${value}`);
    }

    const resourceCacheTypes = [
      'RemoteTypefaceCache',
      'ImageCache',
      'MeshCache',
    ];
    for (const cacheType of resourceCacheTypes) {
      const capacityProperty = `Memory.MainWebModule.${cacheType}.Capacity`;
      const capacity = h5vcc.cVal.getValue(capacityProperty);
      console.log(`${capacityProperty}: ${capacity}`);
      expect(capacity)
        .not.withContext(`Value for ${capacityProperty} should not be null`)
        .toBeNull();

      const resourceLoadedProperty = `Memory.MainWebModule.${cacheType}.Resource.Loaded`;
      const resourceLoaded = h5vcc.cVal.getValue(resourceLoadedProperty);
      console.log(`${resourceLoadedProperty}: ${resourceLoaded}`);
      expect(resourceLoaded)
        .not.withContext(
          `Value for ${resourceLoadedProperty} should not be null`,
        )
        .toBeNull();

      const sizeProperty = `Memory.MainWebModule.${cacheType}.Size`;
      const size = h5vcc.cVal.getValue(sizeProperty);
      console.log(`${sizeProperty}: ${size}`);
      expect(size)
        .not.withContext(`Value for ${sizeProperty} should not be null`)
        .toBeNull();
    }
  });
});
