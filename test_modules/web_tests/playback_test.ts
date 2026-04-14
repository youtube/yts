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

import * as util from 'google3/third_party/javascript/yts/test_utils/playback_util';
import {OPUS_STREAMS} from 'google3/third_party/javascript/yts/test_utils/streams/opus';
import 'jasmine';

describe('MSE Codec Tests', () => {
  describe('MSE (Opus)', () => {
    it(
      'plays opus ultra high',
      (done) => {
        const primaryVideoContainer = document.createElement('div');
        primaryVideoContainer.id = 'primary-container';
        document.body.appendChild(primaryVideoContainer);
        const video = document.createElement('video');
        util.listenForErrors(video, 'opusVideo', true);

        const timeUpdateHandler = () => {
          if (video.currentTime > 15) {
            video.removeEventListener('timeupdate', timeUpdateHandler);
            done();
          }
        };

        video.addEventListener('timeupdate', timeUpdateHandler);

        const streamData = OPUS_STREAMS.streams['opusUltraHigh'];
        // The first element of streamData is the file name.
        const mediaUrl =
          'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/' +
          streamData[0];
        primaryVideoContainer.appendChild(video);
        video.src = util.createMediaSourceUrl([
          {
            mimetype: OPUS_STREAMS.mimetype,
            src: mediaUrl,
          },
        ]);
        video.play();
      },
      20 * 1000,
    );
  });
});
