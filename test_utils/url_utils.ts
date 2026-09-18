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

import 'yts';

import {Uri} from 'google3/third_party/javascript/closure/uri/uri';
import * as globalUtils from 'google3/third_party/javascript/yts/yts_common/global';
import {appendParams, appendPathSegment, replaceFragment, SafeUrl, trustedResourceUrl, TrustedResourceUrl, trySanitizeUrl, unwrapResourceUrl} from 'safevalues';
import {setLinkHrefAndRel, setLocationHref} from 'safevalues/dom';

/** Messages for iframe-based top frame navigation */
export enum SplashIframeMessageType {
  TOP_FRAME_NAVIGATION = 'top-frame-navigation',
}

const AGENT_URL_PARAMS = [
  'yts_server',
  'yts_agent_id',
  'redirect',
  'test_module',
  'test_filter',
  'yts_reconnect',
  'stick',
  'rloader',
  'launch',
  'yts_debug',
  'yts_resources_root',
  'yts_test_timeout',
  'clear_cookies',
  'clear_local_storage',
];

/**
 * URL parameters that are preserved when redirecting between agents or to
 * Kabuki.
 */
const KEEP_URL_PARAMS = [
  'additionalDataUrl',
  'cert_scope',
  'sig',
  'start_time',
];

/** URL parameters to preserve ONLY when redirecting between agent versions */
const INTRA_AGENT_KEEP_URL_PARAMS = [
  'va',
  'vs',
  'vq',
  'vaa',
  'v',
  'launch_tag',
  'q',
  'inApp',
  'utm_campaign',
  'utm_content',
  'utm_medium',
  'utm_source',
  't',
  'c',
  'list',
  'mode',
  'topic',
];

/**
 * List of trusted base URLs.
 */
const TRUSTED_RESOURCE_URLS: readonly TrustedResourceUrl[] = [
  trustedResourceUrl`https://storage.googleapis.com/staging.ytlr-cert.appspot.com/`,
];

/**
 * Checks whether a URL string is an absolute URL.
 */
function isAbsoluteUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
      lower.startsWith('https://') || lower.startsWith('http://') ||
      lower.startsWith('//'));
}

/**
 * Converts a string URL or TrustedResourceUrl to a TrustedResourceUrl.
 *
 * If the input is a TrustedResourceUrl, it is converted to string and validated
 * against trusted URL prefixes. If the URL is an absolute URL, it must match
 * one of the trusted URL prefixes; otherwise, an Error is thrown. If the URL is
 * a relative URL, it is converted to a relative TrustedResourceUrl.
 *
 * @param url The string URL or TrustedResourceUrl to convert.
 * @return The TrustedResourceUrl.
 * @throws Error if the URL is an absolute URL and is not trusted.
 */
export function toTrustedResourceUrl(
    url: string|TrustedResourceUrl,
    ): TrustedResourceUrl {
  const urlStr = typeof url === 'string' ? url : String(url);

  if (isAbsoluteUrl(urlStr)) {
    for (const trustedUrl of TRUSTED_RESOURCE_URLS) {
      const trustedUrlStr = unwrapResourceUrl(trustedUrl).toString();
      const trustedOrigin = trustedUrlStr.endsWith('/') ?
          trustedUrlStr.slice(0, -1) :
          trustedUrlStr;

      if (urlStr === trustedUrlStr || urlStr === trustedOrigin) {
        return trustedUrl;
      }

      if (urlStr.startsWith(trustedUrlStr)) {
        const relativePath = urlStr.slice(trustedUrlStr.length);
        return buildTrustedUrl(trustedUrl, relativePath);
      }
    }

    throw new Error(`URL "${urlStr}" is an absolute URL but is not trusted.`);
  }

  // Handle relative URLs
  const relativePath = urlStr.startsWith('/') ? urlStr.slice(1) : urlStr;
  return buildTrustedUrl(trustedResourceUrl`/`, relativePath);
}

/**
 * Helper function to append relative path, query params, and fragment to a base
 * TrustedResourceUrl.
 */
function buildTrustedUrl(
    baseUrl: TrustedResourceUrl,
    relativePath: string,
    ): TrustedResourceUrl {
  let result = baseUrl;

  let hash = '';
  let pathAndQuery = relativePath;
  const hashIndex = pathAndQuery.indexOf('#');
  if (hashIndex !== -1) {
    hash = pathAndQuery.slice(hashIndex + 1);
    pathAndQuery = pathAndQuery.slice(0, hashIndex);
  }

  let query = '';
  let pathOnly = pathAndQuery;
  const queryIndex = pathAndQuery.indexOf('?');
  if (queryIndex !== -1) {
    query = pathAndQuery.slice(queryIndex + 1);
    pathOnly = pathAndQuery.slice(0, queryIndex);
  }

  const segments = pathOnly.split('/');
  for (const segment of segments) {
    if (!segment) continue;
    result = appendPathSegment(result, decodeURIComponent(segment));
  }

  if (query) {
    const searchParams = new URLSearchParams(query);
    result = appendParams(result, searchParams);
  }

  if (hash) {
    result = replaceFragment(result, hash);
  }

  return result;
}

/**
 * Dynamically loads a CSS resource from the given relative path.
 */
export function loadCss(relativePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const url = yts.resourceUrl(relativePath);
    const link = document.createElement('link');
    setLinkHrefAndRel(link, toTrustedResourceUrl(url), 'stylesheet');
    link.onerror = () => {
      reject(new Error(`Failed to load CSS ${url}`));
    };
    link.onload = () => {
      resolve();
    };
    document.head.appendChild(link);
  });
}

/**
 * Parses given URL search string parameters. Using custom URL parsing logic
 * here because standard URLSearchParams because is not implemented in Cobalt.
 */
export function getUrlParameters(
    search: string,
    decode = true,
    ): {[name: string]: string[]} {
  const urlParams: {[name: string]: string[]} = {};
  const params = search.substring(1).split('&');
  for (const param of params) {
    const i = param.indexOf('=');
    if (i <= 0) continue;
    const name = param.substring(0, i);
    if (!name) continue;
    let value = param.substring(i + 1);
    if (decode) {
      value = decodeURIComponent(value);
    }
    if (!urlParams[name]) {
      urlParams[name] = [];
    }
    urlParams[name].push(value);
  }
  return urlParams;
}

/**
 * Calculates new URL preserving search parameters of the current URL. Only some
 * well known parameters are preserved (additionalDataUrl, cert_scope, etc.).,
 * as well as agent parameters.
 */
export function keepUrlParams(
    currentUrl: string,
    newUrl: string,
    keepAgentParams = false,
) {
  function getParams(url: string): {[name: string]: string[]} {
    const index = url.indexOf('?');
    if (index >= 0) {
      return getUrlParameters(url.substring(index), false);
    } else {
      return {};
    }
  }
  const keepOnly = new Set(KEEP_URL_PARAMS);

  // Add all agent parameters to the kept params list
  if (keepAgentParams) {
    for (const val of AGENT_URL_PARAMS) {
      keepOnly.add(val);
    }
    for (const val of INTRA_AGENT_KEEP_URL_PARAMS) {
      keepOnly.add(val);
    }
  }

  const currentParams = getParams(currentUrl);
  const newParams = getParams(newUrl);
  for (const name of Object.keys(currentParams)) {
    // This assumes that the new and current urls do not share any of the same
    // multi-value params. Accounting for this would require tracking which
    // params are multi-value and appending the new values to newParams.
    if (keepOnly.has(name) && !newParams[name]) {
      newParams[name] = currentParams[name];
    }
  }
  const combinedParams: string[] = [];
  for (const name of Object.keys(newParams)) {
    for (const value of newParams[name]) {
      combinedParams.push(`${name}=${value}`);
    }
  }
  const newSearch = combinedParams.join('&');
  const index = newUrl.indexOf('?');
  if (index >= 0) {
    newUrl = newUrl.substring(0, index);
  }

  if (newSearch) {
    return `${newUrl}?${newSearch}`;
  }
  return newUrl;
}

/**
 * Navigates to the given URL.
 */
export function navigateTo(url: string|SafeUrl): void {
  const safeUrl = typeof url === 'string' ? trySanitizeUrl(url) : url;
  if (!safeUrl) {
    throw new Error(`Invalid redirect URL: ${url}`);
  }
  console.debug(`Redirecting to ${safeUrl}`);
  const urlStr = safeUrl.toString();
  const targetUri = Uri.parse(urlStr);
  const isExternal = !!targetUri.getDomain() &&
      targetUri.getDomain() !== window.location.hostname;

  if (window.parent === window || TEST_ONLY.inTestEnvironment || isExternal) {
    setLocationHref(window.location, safeUrl);
  } else {
    window.parent.postMessage(
        {
          type: SplashIframeMessageType.TOP_FRAME_NAVIGATION,
          url: urlStr,
        },
        {
          targetOrigin: '*',
        },
    );
  }
}

function win() {
  return globalUtils.getGlobal();
}

/**
 * Prepares for redirect, calls the redirect and returns a never-resolving
 * promise that must be completed by a runscript message triggered when the page
 * reloads.
 */
export async function redirect(redirectUrl: string) {
  yts.prepareForReload();

  console.debug(`Redirecting to ${redirectUrl}`);
  const currentUrl = win().location.href;
  const newUrl = keepUrlParams(currentUrl, redirectUrl);
  if (TEST_ONLY.inTestEnvironment) {
    win().location.href = newUrl;
  } else {
    navigateTo(newUrl);
  }

  await waitForReload();
}

/**
 * Waits for a page reload to occur. This function never resolves under normal
 * circumstances, as the page reload will interrupt its execution.
 */
export async function waitForReload() {
  if (TEST_ONLY.skipPromises) {
    return;
  }
  // Never resolves
  await new Promise(() => {});
}

export const TEST_ONLY = {
  inTestEnvironment: false,
  skipPromises: false,
};
