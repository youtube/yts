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
import * as av1Codec from 'google3/third_party/javascript/yts/test_utils/codecs/av1_codec';
import * as vp9Codec from 'google3/third_party/javascript/yts/test_utils/codecs/vp9_codec';
import {h5vcc} from 'google3/third_party/javascript/yts/yts_common/h5vcc';
import {objectUrlFromSafeSource, unwrapUrl} from 'safevalues';

const PIXEL_COUNT_FHD = 2073600;
const PIXEL_COUNT_4K = 8294400;
const PIXEL_COUNT_8K = 33177600;
/** Milliseconds in a second */
export const SECOND = 1000;

/**
 * Creates SafeUrl given content info.
 *
 * @param contentInfo Array of content info.
 */
export function createMediaSourceUrl(
  contentInfo: Array<{mimetype: string; src: string}>,
) {
  const mediaSource = new MediaSource();
  mediaSource.addEventListener('sourceopen', () => {
    for (const conteInfo of contentInfo) {
      appendContentToBuffer(
        mediaSource.addSourceBuffer(conteInfo.mimetype),
        conteInfo.src,
      );
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

/**
 * Appends media segment data from an xhr response ArrayBuffer to
 * the SourceBuffer.
 *
 * @param contentBuffer Http method used to send request.
 * @param contentUrl URL of the media content.
 */
export async function appendContentToBuffer(
  contentBuffer: SourceBuffer,
  contentUrl: string,
) {
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'arraybuffer';
  xhr.addEventListener('load', () => {
    console.log(
      `XHR load for ${contentUrl}. Status: ${xhr.status}. Response type: ${typeof xhr.response}, Byte length: ${xhr.response?.byteLength}`,
    );
    if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
      if (contentBuffer.updating) {
        console.warn(
          `SourceBuffer is updating for ${contentUrl}. Cannot append buffer at this time.`,
        );
        // Optionally, queue the append operation or wait for 'updateend'
        // For now, we'll add a listener for updateend to try appending again.
        const appendLater = () => {
          if (!contentBuffer.updating) {
            console.log(
              `Retrying appendBuffer for ${contentUrl} after updateend.`,
            );
            try {
              contentBuffer.appendBuffer(xhr.response);
              console.log(
                `Successfully appended buffer for ${contentUrl} after updateend.`,
              );
            } catch (e) {
              console.error(
                `Error appending buffer for ${contentUrl} after updateend:`,
                e,
              );
            }
          }
          contentBuffer.removeEventListener('updateend', appendLater);
          return;
        };
        contentBuffer.addEventListener('updateend', appendLater);
        return;
      }
      try {
        console.log(`Attempting to append buffer for ${contentUrl}.`);
        contentBuffer.appendBuffer(xhr.response);
        console.log(`Successfully appended buffer for ${contentUrl}.`);
      } catch (e) {
        console.error(`Error appending buffer for ${contentUrl}:`, e);
      }
    } else {
      console.error(
        `XHR failed or no response for ${contentUrl}. Status: ${xhr.status}, Response: ${xhr.response}`,
      );
      // Removed: Attempt to end MediaSource stream from here
    }
  });
  xhr.addEventListener('error', () => {
    console.error(`XHR network error for ${contentUrl}`);
    // Removed: Attempt to end MediaSource stream from here
  });
  xhr.addEventListener('abort', () => {
    console.warn(`XHR request aborted for ${contentUrl}`);
    // Removed: Attempt to end MediaSource stream from here
  });
  xhr.open('GET', contentUrl);
  xhr.send();
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
 * Removes a cobalt video running in dom.
 *
 * @param video The cobalt video to remove.
 */
export function removeCobaltVideo(video: CobaltVideoElement) {
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
 * @return A tuple `[width, height]` for the maximum supported resolution.
 */
export function getMaxVp9SupportedWindow() {
  let maxResolution = [99999, 99999];
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
