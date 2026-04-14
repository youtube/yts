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

import {CobaltVideoElement} from 'google3/third_party/javascript/yts/test_utils/cobalt_video_element';

import {requestIndividualization} from '../eme_util';
import * as util from '../playback_util';
import {createMediaSourceUrl} from '../playback_util';

const PAUSE_THRESHOLD = 3;
const START_CONFIRMATION_THRESHOLD = 1;
const START_CONFIRMATION_TIMEOUT_MS = 60_000;
const LICENSE_DELAY = 10; // In milliseconds.

const SECONDARY_VIDEO_CONTENT_INFO = {
  mimetype: 'video/mp4; codecs="avc1.640028, mp4a.40.2"',
  src: 'https://storage.googleapis.com/ytlr-cert.appspot.com/test-materials/media/manual/dual_video/secondary-video-fragmented.mp4',
};

function initializeStyle() {
  const style = document.createElement('style');
  style.textContent = `
    #remaining-time {
      position: absolute;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, .5);
      color: white;
      padding: 8px;
      z-index: 1000;
    }
    #primary-container {
      width: 100%;
      height: 100%;
    }
    #secondary-container {
      position: absolute;
      top: 15%;
      height: 85%;
      width: 100%;
      background-color: rgba(33, 33, 33, .75);
      padding: 24px;
    }
    #hdr-container {
      width: 100%;
      height: 100%;
    }
    video {
      width: 100%;
      height: 100%;
    }
    .item {
      width: 427px;
      height: 240px;
      display: inline-block;
      margin: 24px;
      vertical-align: middle;
    }
    `;
  document.head.appendChild(style);
}

async function addPrimaryVideo(shouldPause: boolean, resolve?: () => void) {
  const primaryVideoContainer = document.createElement('div');
  primaryVideoContainer.id = 'primary-container';
  document.body.appendChild(primaryVideoContainer);
  const primaryVideo = document.createElement('video');
  primaryVideoContainer.appendChild(primaryVideo);
  primaryVideo.id = 'primary-video';
  util.listenForErrors(primaryVideo, 'primaryVideo', true);

  const videoContentType = 'video/mp4; codecs="avc1.640028"';
  const audioContentType = 'audio/mp4; codecs="mp4a.40.2"';
  const contentInfo = [
    {
      mimetype: videoContentType,
      src: 'https://yt-dash-mse-test.commondatastorage.googleapis.com/media/oops_cenc-20121114-142.mp4',
    },
    {
      mimetype: audioContentType,
      src: 'https://yt-dash-mse-test.commondatastorage.googleapis.com/media/oops_cenc-20121114-148.mp4',
    },
  ];
  const mediaKeySystemAccess = await navigator.requestMediaKeySystemAccess(
    'com.widevine.alpha',
    [
      {
        'initDataTypes': ['cenc'],
        'videoCapabilities': [{'contentType': videoContentType}],
        'audioCapabilities': [{'contentType': audioContentType}],
      },
    ],
  );

  const mediaKeys = await mediaKeySystemAccess.createMediaKeys();
  await primaryVideo.setMediaKeys(mediaKeys);

  const mediaKeySession = mediaKeys.createSession();
  mediaKeySession.addEventListener('message', (messageEvent) => {
    const message = messageEvent.message;
    const messageType = messageEvent.messageType;
    const keySession: MediaKeySession = messageEvent.target as MediaKeySession;

    const updateSession = (response: ArrayBuffer) => {
      setTimeout(() => {
        keySession.update(response).catch(() => {
          console.log('keySession.update failed');
        });
      }, LICENSE_DELAY);
    };

    if (messageType === 'individualization-request') {
      requestIndividualization(message, updateSession);
    } else if (messageType === 'license-request') {
      const licenseServerUrl =
        'https://dash-mse-test.appspot.com/api/drm/widevine?drm_system=widevine&source=YOUTUBE&ip=0.0.0.0&ipbits=0&expire=19000000000&key=test_key1&sparams=ip,ipbits,expire,drm_system,source,video_id&video_id=03681262dc412c06&signature=9C4BE99E6F517B51FED1F0B3B31966D3C5DAB9D6.6A1F30BB35F3A39A4CA814B731450D4CBD198FFD';
      util.fetchArrayBuffer(
        'POST',
        licenseServerUrl,
        messageEvent.message,
        (licenseArrayBuffer) => {
          mediaKeySession.update(
            util.extractLicenseCallback(licenseArrayBuffer),
          );
        },
      );
    } else {
      console.debug('unknown MediaKeyMessageEvent type');
    }
  });

  primaryVideo.addEventListener('encrypted', (encryptedEvent) => {
    mediaKeySession.generateRequest(
      encryptedEvent.initDataType,
      encryptedEvent.initData as ArrayBuffer,
    );
  });

  primaryVideo.addEventListener('timeupdate', (e) => {
    if (!!resolve && primaryVideo.currentTime > START_CONFIRMATION_THRESHOLD) {
      console.log('Primary video started');
      resolve();
      resolve = undefined;
    }

    if (shouldPause && primaryVideo.currentTime > PAUSE_THRESHOLD) {
      primaryVideo.pause();
      console.log('Primary video paused');
    }
  });

  primaryVideo.src = createMediaSourceUrl(contentInfo);
  primaryVideo.autoplay = true;
  await primaryVideo.play();
}

async function addSecondaryVideo(resolve?: () => void) {
  const secondaryVideoContainer = document.createElement('div');
  secondaryVideoContainer.id = 'secondary-container';
  document.body.appendChild(secondaryVideoContainer);
  const backGroundColors = [
    '#DB4437',
    '#9E9E9E',
    '#4285F4',
    '#0F9D58',
    '#F4B400',
  ];
  for (const [index, color] of backGroundColors.entries()) {
    const item = document.createElement('div');
    secondaryVideoContainer.appendChild(item);
    item.classList.add('item');
    item.style.backgroundColor = color;
    if (index === 1) {
      const secondaryVideo = document.createElement(
        'video',
      ) as CobaltVideoElement;
      item.appendChild(secondaryVideo);
      secondaryVideo.id = 'secondary-video';
      util.listenForErrors(secondaryVideo, 'secondaryVideo', true);
      // Max video capabilities must be set before src.
      if (
        secondaryVideo.setMaxVideoCapabilities &&
        typeof secondaryVideo.setMaxVideoCapabilities === 'function'
      ) {
        secondaryVideo.setMaxVideoCapabilities(
          'width=432; height=240; framerate=15;',
        );
      }
      secondaryVideo.addEventListener('timeupdate', (e) => {
        if (
          !!resolve &&
          secondaryVideo.currentTime > START_CONFIRMATION_THRESHOLD
        ) {
          console.log('Secondary video started');
          resolve();
          resolve = undefined;
        }
      });

      secondaryVideo.loop = true;
      secondaryVideo.autoplay = true;
      secondaryVideo.muted = true;
      secondaryVideo.src = util.createMediaSourceUrl([
        SECONDARY_VIDEO_CONTENT_INFO,
      ]);
    }
  }
}

function cleanUpVideoAndContainer(videoId: string, containerId: string) {
  const video = document.getElementById(videoId);
  if (video) {
    util.removeCobaltVideo(video as HTMLVideoElement);
  }

  const container = document.getElementById(containerId);
  if (container) {
    document.body.removeChild(container);
  }
}

/**
 * Sets up a dual video test.
 *
 * @param shouldPausePrimaryVideo Whether to pause the primary video after a
 *     few seconds.
 */
export async function setupDualVideoTest(shouldPausePrimaryVideo: boolean) {
  initializeStyle();

  console.log('Setting up the videos.');
  const primaryVideoPromise = new Promise<void>((resolve, reject) => {
    addPrimaryVideo(shouldPausePrimaryVideo, resolve);
    setTimeout(() => {
      reject(
        new Error(
          `Primary video did not start playback after ${START_CONFIRMATION_TIMEOUT_MS}ms`,
        ),
      );
    }, START_CONFIRMATION_TIMEOUT_MS);
  });
  const secondaryVideoPromise = new Promise<void>((resolve, reject) => {
    addSecondaryVideo(resolve);
    setTimeout(() => {
      reject(
        new Error(
          `Secondary video did not start playback after ${START_CONFIRMATION_TIMEOUT_MS}ms`,
        ),
      );
    }, START_CONFIRMATION_TIMEOUT_MS);
  });
  await Promise.all([primaryVideoPromise, secondaryVideoPromise]);
}

/**
 * Tears down the dual video test and releases resources.
 */
export async function tearDownDualVideoTest() {
  cleanUpVideoAndContainer('primary-video', 'primary-container');
  cleanUpVideoAndContainer('secondary-video', 'secondary-container');
}
