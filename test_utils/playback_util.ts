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

import {isAndroidTv} from 'google3/third_party/javascript/yts/test_utils/cobalt';
import {CobaltVideoElement} from 'google3/third_party/javascript/yts/test_utils/cobalt_video_element';
import * as av1Codec from 'google3/third_party/javascript/yts/test_utils/codecs/av1_codec';
import * as vp9Codec from 'google3/third_party/javascript/yts/test_utils/codecs/vp9_codec';
import {appendContentToBuffer} from 'google3/third_party/javascript/yts/test_utils/streaming/stream_utils';
import {h5vcc} from 'google3/third_party/javascript/yts/yts_common/h5vcc';
import {objectUrlFromSafeSource, unwrapUrl} from 'safevalues';


const PIXEL_COUNT_FHD = 2073600;
const PIXEL_COUNT_4K = 8294400;
const PIXEL_COUNT_8K = 33177600;
/** Milliseconds in a second */
export const SECOND = 1000;

/**
 * Logs the current playback progress cleanly roughly once per second to prevent
 * console flooding during timeupdate event polling loops.
 */
export function logPlaybackProgress(video: HTMLVideoElement, counter: number) {
  if (counter % 4 === 0) {
    console.log(`currentTime: ${video.currentTime.toFixed(2)}s`);
  }
}

/**
 * ID of the video element used for standard test framework playback
 * verification.
 */
const TEST_VIDEO_ELEMENT_ID = 'playback-test-video-element';

/**
 * Safely initializes a standard HTMLVideoElement wrapped in an
 * absolute-positioned DOM container. If an existing test video element is
 * detected, it will be automatically garbage collected prior to initialization.
 */
export function initializeVideoElement(): void {
  if (getVideoElement()) {
    console.warn(
        'Detected dangling test video element before creating a new one! Executing emergency cleanup.');
    cleanupVideoElement();
  }

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  document.body.appendChild(container);

  const video = document.createElement('video');
  video.id = TEST_VIDEO_ELEMENT_ID;
  video.style.width = '100%';
  video.style.height = '100%';
  container.appendChild(video);
}

/**
 * Retrieves the currently active test HTMLVideoElement from the DOM.
 * @return The initialized HTMLVideoElement, or null if uninitialized.
 */
export function getVideoElement(): HTMLVideoElement|null {
  return document.getElementById(TEST_VIDEO_ELEMENT_ID) as HTMLVideoElement |
      null;
}

/**
 * Safely destroys the active test HTMLVideoElement and removes its
 * absolute-positioned container from the document body.
 */
export function cleanupVideoElement(): void {
  const video = getVideoElement();
  if (!video) return;

  const container = video.parentElement;
  removeCobaltVideo(video);
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

/** Options for playback and stream configuration. */
export interface PlaybackOptions {
  disableTunnel?: boolean;
}

/**
 * Returns the MIME type with ';tunnelmode=true' appended if running on Android TV
 * and tunnel mode is supported by the device and not explicitly disabled.
 */
export function getMimeTypeWithTunnelMode(
    mimetype: string,
    options?: PlaybackOptions,
): string {
  if (!mimetype.startsWith('video/')) {
    return mimetype;
  }
  const disableTunnel =
      window.location.search.includes('disable_tunnel=true') ||
      Boolean(options?.disableTunnel);
  if (isAndroidTv() && !disableTunnel &&
      Boolean(MediaSource?.isTypeSupported?.(mimetype + ';tunnelmode=true'))) {
    const tunnelMimeType = mimetype + ';tunnelmode=true';
    console.log('Upgrading video stream to tunnel mode:', tunnelMimeType);
    return tunnelMimeType;
  }
  return mimetype;
}

/**
 * Creates SafeUrl given content info.
 *
 * @param contentInfo Array of content info.
 * @param options Optional playback options.
 */
export function createMediaSourceUrl(
  contentInfo: Array<{mimetype: string; src: string}>,
  options?: PlaybackOptions,
) {
  const mediaSource = new MediaSource();
  mediaSource.addEventListener('sourceopen', async () => {
    const promises = [];
    for (const conteInfo of contentInfo) {
      const mimetype = getMimeTypeWithTunnelMode(conteInfo.mimetype, options);
      promises.push(appendContentToBuffer(
          mediaSource.addSourceBuffer(mimetype),
          conteInfo.src,
          ));
    }
    try {
      await Promise.all(promises);
      if (mediaSource.readyState === 'open') {
        console.log('Calling mediaSource.endOfStream()');
        mediaSource.endOfStream();
      }
    } catch (e) {
      console.error('Error loading media for createMediaSourceUrl:', e);
      if (mediaSource.readyState === 'open') {
        mediaSource.endOfStream('network');
      }
    }
  });
  return unwrapUrl(objectUrlFromSafeSource(mediaSource));
}


/**
 * Checks if HDR is supported.
 */
export function isHdrSupported() {
  if (isEotfSupported('strobevision', vp9Codec.getPqVp9CodecString())) {
    // Invalid EOTF supported: MediaSource.isTypeSupported must be broken.
    return false;
  }
  const eotfToCodecMap: Record<string, string> = {
    'smpte2084': vp9Codec.getPqVp9CodecString(),
    'arib-std-b67': vp9Codec.getHlgVp9CodecString(),
  };
  for (const eotf in eotfToCodecMap) {
    if (!isEotfSupported(eotf, eotfToCodecMap[eotf])) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if Eotf is supported.
 */
export function isEotfSupported(eotf: string, codecString: string) {
  return MediaSource.isTypeSupported(
    createVideoFormatStr(
      'webm',
      codecString,
      1280,
      720,
      30,
      null,
      `eotf=${eotf}`,
    ),
  );
}

/**
 * Checks if HDR is supported.
 */
export function createVideoFormatStr(
  video: string,
  codec: string,
  width: number | null,
  height: number | null,
  framerate: number | null,
  spherical: string | null,
  suffix: string,
) {
  return createMimeTypeStr(
    'video/' + video,
    codec,
    width,
    height,
    framerate,
    spherical,
    suffix,
  );
}

/* tslint:disable: restrict-plus-operands*/
/**
 * Checks if HDR is supported.
 */
export function createMimeTypeStr(
  mimeType: string,
  codecs?: string | undefined,
  width?: number | null,
  height?: number | null,
  framerate?: number | null,
  spherical?: string | boolean | null,
  suffix?: string,
) {
  let mimeTypeStr = mimeType;
  if (!!codecs) mimeTypeStr += '; codecs="' + codecs + '"';
  if (!!width) mimeTypeStr += '; width=' + width;
  if (!!height) mimeTypeStr += '; height=' + height;
  if (!!framerate) mimeTypeStr += '; framerate=' + framerate;
  if (!!spherical) mimeTypeStr += '; decode-to-texture=' + spherical;
  if (!!suffix) mimeTypeStr += '; ' + suffix;
  return mimeTypeStr;
}
/* tslint:enable: restrict-plus-operands*/

/**
 * Interface for CSS animation stats captured from Cobalt cVals.
 */
export interface CssFpsStats {
  min: number;
  pct25: number;
  pct50: number;
  pct75: number;
  pct95: number;
  max: number;
}

/**
 * Interface for a snapshot of video.currentTime at a given wall time.
 */
export interface VideoTimeSnapshot {
  videoCurrentTime: number;
  wallTime: number;
  initialized?: boolean;
}

/**
 * Returns promise that resolves after the delay specified in milliseconds.
 */
export function sleep(delay: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });
}

/**
 * Returns the get limited tracking setting for IFA compliance devices
 */
export async function getLimitAdTracking(): Promise<boolean> {
  const system = h5vcc?.system;
  return system?.getLimitAdTracking
    ? await system?.getLimitAdTracking()
    : !!h5vcc?.system?.limitAdTracking;
}

/**
 * Pulls CSS Animation FPS from Cobalt cVals and returns in presentable state.
 */
export function getCssAnimationFpsStats(): CssFpsStats {
  function frameIntervalToFps(interval: number) {
    return interval === 0 || Number.isNaN(interval) ? 0 : 1000000.0 / interval;
  }

  const output: CssFpsStats = {
    min: 0,
    pct25: 0,
    pct50: 0,
    pct75: 0,
    pct95: 0,
    max: 0,
  };

  if (!h5vcc?.cVal) {
    console.error('Unable to fetch FPS stats - h5vcc.cVal not defined');
    return output;
  }

  const intervalMin = Number(
    h5vcc.cVal.getValue('Renderer.Rasterize.AnimationsInterval.Min'),
  );
  const interval25 = Number(
    h5vcc.cVal.getValue('Renderer.Rasterize.AnimationsInterval.Pct.25th'),
  );
  const interval50 = Number(
    h5vcc.cVal.getValue('Renderer.Rasterize.AnimationsInterval.Pct.50th'),
  );
  const interval75 = Number(
    h5vcc.cVal.getValue('Renderer.Rasterize.AnimationsInterval.Pct.75th'),
  );
  const interval95 = Number(
    h5vcc.cVal.getValue('Renderer.Rasterize.AnimationsInterval.Pct.95th'),
  );
  const intervalMax = Number(
    h5vcc.cVal.getValue('Renderer.Rasterize.AnimationsInterval.Max'),
  );

  // Note that min interval gives max fps and vice versa.
  output.max = frameIntervalToFps(intervalMin);
  output.pct25 = frameIntervalToFps(interval25);
  output.pct50 = frameIntervalToFps(interval50);
  output.pct75 = frameIntervalToFps(interval75);
  output.pct95 = frameIntervalToFps(interval95);
  output.min = frameIntervalToFps(intervalMax);

  return output;
}

/**
 * Takes a snapshot of video.currentTime and wall time together. This is used
 * for playback performance validation.
 *
 * @param video HTML5 video element.
 */
export function takeVideoTimeSnapshot(video: HTMLVideoElement) {
  const videoSnapshot = {
    videoCurrentTime: video.currentTime,
    wallTime: performance.now(),
    initialized: true,
  };
  return videoSnapshot;
}

/**
 * Validate that video.currentTime has advanced at the same pace as wall time
 * when compared to a baseline snapshot of the two values, within a customizable
 * error margin. Returns a new baseline snapshot for future measurements.
 *
 * Note: MUST be called from within video 'timeupdate' event handler to yield
 * accurate results!
 *
 * @param video HTML5 video element.
 * @param lastVideoSnapshot Last snapshot of video.currentTime and wall time.
 * @param errorMarginPercent Error margin as a percentage of wall time.
 *     E.g. "2" means video.currentTime is allowed to be +-2% of expected value.
 * @param videoName Custom name for the video element (for logging).
 * @return A new snapshot that can be used as baseline in a later measurement.
 */
export function validateVideoCurrentTimeAgainstSnapshot(
  video: HTMLVideoElement,
  lastVideoSnapshot: VideoTimeSnapshot,
  errorMarginPercent: number,
  videoName = 'video',
) {
  const newVideoSnapshot = takeVideoTimeSnapshot(video);

  const wallTimeElapsed =
    (newVideoSnapshot.wallTime - lastVideoSnapshot.wallTime) / 1000;
  const actualTimeElapsed =
    newVideoSnapshot.videoCurrentTime - lastVideoSnapshot.videoCurrentTime;

  const errorMargin = (wallTimeElapsed * errorMarginPercent) / 100;

  const minExpectedTime = wallTimeElapsed - errorMargin;
  const maxExpectedTime = wallTimeElapsed + errorMargin;

  console.log(
    `${videoName} video.currentTime advanced by ${actualTimeElapsed.toFixed(
      4,
    )} seconds during ${wallTimeElapsed.toFixed(4)} seconds of wall time`,
  );
  if (
    actualTimeElapsed < minExpectedTime ||
    actualTimeElapsed > maxExpectedTime
  ) {
    console.log(
      `${videoName} accepted error margin (${errorMarginPercent}%): ${minExpectedTime.toFixed(
        4,
      )} - ${maxExpectedTime.toFixed(4)}`,
    );
  }
  expect(actualTimeElapsed)
    .withContext(`${videoName} video.currentTime lags behind error margin`)
    .toBeGreaterThan(minExpectedTime);
  expect(actualTimeElapsed)
    .withContext(`${videoName} video.currentTime rushes ahead of error margin`)
    .toBeLessThan(maxExpectedTime);

  return newVideoSnapshot;
}

/**
 * Fetches array buffer using XMLHttpRequest.
 *
 * @param httpMethod Http method used to send request.
 * @param requestUrl URL to send the request.
 * @param requestBody Body of the request.
 * @param loadingCallback Callback function provided to load event.
 */
export async function fetchArrayBuffer(
  httpMethod: string,
  requestUrl: string,
  requestBody: ArrayBuffer | null,
  loadingCallback: (xhrResponse: ArrayBuffer) => void,
) {
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'arraybuffer';
  xhr.addEventListener('load', () => {
    loadingCallback(xhr.response);
  });
  xhr.open(httpMethod, requestUrl);
  xhr.send(requestBody);
}

/**
 * Extracts licence data from a license ArrayBuffer.
 *
 * @param licenseArrayBuffer ArrayBuffer object to extract license data.
 */
export function extractLicenseCallback(licenseArrayBuffer: ArrayBuffer) {
  const licenseArray = new Uint8Array(licenseArrayBuffer);
  let licenseStartIndex = licenseArray.length - 2;

  while (licenseStartIndex >= 0) {
    if (
      licenseArray[licenseStartIndex] === 13 &&
      licenseArray[licenseStartIndex + 1] === 10
    ) {
      licenseStartIndex += 2;
      break;
    }
    --licenseStartIndex;
  }
  return licenseArray.subarray(licenseStartIndex);
}

/**
 * Creates SafeUrl given mediaSource.
 *
 * @param mediaSource Array of content info.
 */
export function createMediaSourceUrlFromSource(mediaSource: MediaSource) {
  return unwrapUrl(objectUrlFromSafeSource(mediaSource));
}

/**
 * Resets a video element's source and state without removing it from the DOM.
 *
 * @param video The HTMLVideoElement to reset.
 */
export function resetVideoElement(video: HTMLVideoElement) {
  video.pause();
  video.onwaiting = null;
  video.onerror = null;
  video.ontimeupdate = null;

  const oldSrc = video.src;
  video.src = '';
  video.removeAttribute('src');
  if (oldSrc && oldSrc.startsWith('blob:')) {
    URL.revokeObjectURL(oldSrc);
  }
  video.load();
}

/**
 * Removes a cobalt video running in dom.
 *
 * @param video The cobalt video to remove.
 */
export function removeCobaltVideo(video: CobaltVideoElement) {
  resetVideoElement(video);
  if (video.parentNode) {
    video.parentNode.removeChild(video);
  }
}

/**
 * Registers an empty watchdog channel.
 *
 * @param channelName the watch dog channel.
 */
export function registerEmptyWatchdogChannel(channelName: string) {
  return h5vcc?.crashLog?.register?.(
    channelName,
    'test-description',
    'started',
    1000,
    0,
    'none',
  );
}

/**
 * Unregisters a watchdog channel.
 *
 * @param channelName the watch dog channel.
 */
export function unregisterWatchdogChannel(channelName: string) {
  return h5vcc?.crashLog?.unregister?.(channelName);
}

/**
 * Pings a watchdog channel.
 *
 * @param channelName the watch dog channel.
 */
export function pingWatchdogChannel(channelName: string, ping: string) {
  return h5vcc?.crashLog?.ping?.(channelName, ping);
}

/**
 * Gets watchdog violations.
 */
export function getWatchdogViolations() {
  return h5vcc?.crashLog?.getWatchdogViolations?.();
}

/**
 * Adds a listener to the video element that logs any video errors encountered.
 * Can be optionally configured to fail upon encountering an error.
 *
 * Note: This method assumes that video.play() is synchronous, which is not the
 * case for Chrobalt (Cocbalt 26+).
 *
 * For an alternative that can handle either synchronous or asynchronous
 * playback, use playAndHandleErrors() instead.
 */
export function listenForErrors(
  videoElement: HTMLVideoElement,
  loggableName: string,
  shouldFailOnError = false,
  onErrorCallback?: (error: MediaError) => void,
) {
  videoElement.addEventListener('error', function onError(e: unknown) {
    videoElement.removeEventListener('error', onError);
    // videoElement.error is guaranteed to be defined on error event.
    const error = videoElement.error!;
    const loggableErrorMessage = `Video ${loggableName} encountered error ${error.code}: ${error.message}`;
    console.error(loggableErrorMessage);
    if (onErrorCallback) {
      onErrorCallback(error);
    }
    if (shouldFailOnError) {
      throw new Error(loggableErrorMessage);
    }
  });
}

/**
 * Secures video.play() execution against both legacy void signatures and modern
 * Promise-based rejections to prevent swallowed errors across all versions of
 * Cobalt.
 */
export function playAndHandleErrors(
    video: HTMLVideoElement,
    failCallback: (msg: string) => void,
) {
  function onError(error: unknown) {
    let msg: string;
    if (error instanceof MediaError) {
      msg = `Code ${error.code}: ${error.message}`;
    } else if (error instanceof Error) {
      msg = error.message;
    } else {
      msg = String(error);
    }
    failCallback('Error during playback: ' + msg);
  }

  const promise = video.play();
  if (promise) {
    promise.catch(onError);
  } else {
    listenForErrors(video, 'video', false, onError);
  }
}

/**
 * Gets maximum supported window size.
 */
export function getMaxSupportedWindowSize(): [number, number] {
  const vp9 = getMaxVp9SupportedWindow();
  const sys = getMaxWindow();
  const av1 = getMaxAV1SupportedWindow();
  const h264 = getMaxH264SupportedWindow();
  return [
    Math.max(vp9[0], sys[0], av1[0], h264[0]),
    Math.max(vp9[1], sys[1], av1[1], h264[1]),
  ];
}

/**
 * Returns the width and height of the current window as [width, height].
 */
export function getMaxWindow() {
  return [
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio,
  ];
}

/**
 * Returns true if the given resolution is smaller than or equal to FHD,
 * aligning with the requirement for hardware device categories.
 */
export function isSmallerThanOrEqualToFHD() {
  const size = getMaxSupportedWindowSize();
  return size[0] * size[1] <= PIXEL_COUNT_FHD;
}

/**
 * Returns true if the given resolution is greater than FHD and smaller than or
 * equal to 4K, aligning with the requirement for hardware device categories.
 */
export function isGreaterThanFHDAndSmallerThanOrEqualTo4K() {
  const size = getMaxSupportedWindowSize();
  return (
    size[0] * size[1] <= PIXEL_COUNT_4K && size[0] * size[1] > PIXEL_COUNT_FHD
  );
}

/**
 * Returns true if the given resolution is greater than 4K, aligning
 * with the requirement for hardware device categories.
 */
export function isGreaterThan4K() {
  const size = getMaxSupportedWindowSize();
  return size[0] * size[1] > PIXEL_COUNT_4K;
}

/**
 * Returns true if the given resolution is greater than 8K.
 */
export function isGreaterThan8K() {
  const size = getMaxSupportedWindowSize();
  return size[0] * size[1] > PIXEL_COUNT_8K;
}

/**
 * Determines the maximum supported window size (width and height) for VP9
 * video playback. It checks for support of common resolutions (e.g., 4K, 1080p)
 * using `MediaSource.isTypeSupported` with VP9 codecs.
 *
 * @param maxResolution An optional maximum resolution to check for support.
 * @return A tuple `[width, height]` for the maximum supported resolution.
 */
export function getMaxVp9SupportedWindow(maxResolution = [99999, 99999]) {
  const vp9DefaultCodecString = vp9Codec.getVp9CodecString();
  if (
    MediaSource.isTypeSupported(
      `video/webm; codecs="${vp9DefaultCodecString}"; width=7680; height=4320;`,
    ) &&
    !MediaSource.isTypeSupported(
      `video/webm; codecs="${vp9DefaultCodecString}"; width=9999; height=9999;`,
    ) &&
    maxResolution[1] >= 4320
  ) {
    maxResolution = [7680, 4320];
  } else if (
    MediaSource.isTypeSupported(
      `video/webm; codecs="${vp9DefaultCodecString}"; width=3840; height=2160;`,
    ) &&
    !MediaSource.isTypeSupported(
      `video/webm; codecs="${vp9DefaultCodecString}"; width=9999; height=9999;`,
    )
  ) {
    maxResolution = [3840, 2160];
  } else {
    const maxWindow = getMaxWindow();
    if (maxWindow[0] < maxResolution[0] && maxWindow[1] < maxResolution[1]) {
      maxResolution = maxWindow;
    }
  }
  return maxResolution;
}

/**
 * Determines the maximum supported window size (width and height) for H264
 * video playback. It checks for support of common resolutions (e.g., 4K, 1080p)
 * using `MediaSource.isTypeSupported` with H264 codecs.
 *
 * @param maxResolution An optional maximum resolution to check for support.
 * @return A tuple `[width, height]` for the maximum supported resolution.
 */
export function getMaxH264SupportedWindow(maxResolution = [99999, 99999]) {
  if (
    MediaSource.isTypeSupported(
      'video/mp4; codecs="avc1.4d401e"; width=1920; height=1080;',
    ) &&
    !MediaSource.isTypeSupported(
      'video/mp4; codecs="avc1.4d401e"; width=9999; height=9999;',
    )
  ) {
    maxResolution = [1920, 1080];
  } else {
    const maxWindow = getMaxWindow();
    if (maxWindow[0] < maxResolution[0] && maxWindow[1] < maxResolution[1]) {
      maxResolution = maxWindow;
    }
  }
  return maxResolution;
}

interface Spec {
  level: string;
  width: number;
  height: number;
}

/**
 * Returns whether the device supports AV1.
 */
export function supportsAV1() {
  return MediaSource.isTypeSupported('video/mp4; codecs="av01.0.00M.08"');
}

/**
 * Determines the maximum supported window size (width and height) for AV1
 * video playback. It checks for support of common resolutions (e.g., 4K, 1080p)
 * using `MediaSource.isTypeSupported` with AV1 codecs.
 *
 * @param maxResolution An optional maximum resolution to check for support.
 * @return A tuple `[width, height]` for the maximum supported resolution.
 */
export function getMaxAV1SupportedWindow(maxResolution = [99999, 99999]) {
  const checkSupport = (spec: Spec) => {
    const type = [
      'video/mp4',
      `codecs="${av1Codec.getAv1CodecString({level: spec.level})}"`,
      `width=${spec.width}`,
      `height=${spec.height}`,
    ].join('; ');
    return MediaSource.isTypeSupported(type);
  };
  if (checkSupport({level: '2.0', width: 9999, height: 9999})) {
    // Invalid resolution, default to window size
    const maxWindow = getMaxWindow();
    if (maxWindow[0] < maxResolution[0] && maxWindow[1] < maxResolution[1]) {
      maxResolution = maxWindow;
    }
    return maxResolution;
  }

  const specs = [
    {level: '6.0', width: 7680, height: 4320},
    {level: '5.0', width: 3840, height: 2160},
    {level: '4.0', width: 1920, height: 1080},
  ];
  for (const spec of specs) {
    if (
      checkSupport(spec) &&
      spec.width <= maxResolution[0] &&
      spec.height <= maxResolution[1]
    ) {
      return [spec.width, spec.height];
    }
  }

  // No valid resolutions, default to window size
  const maxWindow = getMaxWindow();
  if (maxWindow[0] < maxResolution[0] && maxWindow[1] < maxResolution[1]) {
    maxResolution = maxWindow;
  }
  return maxResolution;
}

/**
 * Checks that the videoStream is defined. Without this check, the code
 * will throw an exception that Jasmine will just swallow.
 */
export function verifyStream(videoStream: unknown, index: number) {
  if (videoStream === undefined) {
    const msg =
        `Test definition error: videoStream at index ${index} is undefined!`;
    console.error(msg);
    throw new Error(msg);
  }
}
