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

const BYPASS_CACHE = false;

/**
 * Represents a single XHR request managed by XhrManager.
 */
export class XhrRequest {
  xhr!: XMLHttpRequest;
  type: string;
  startTime: number;
  lastUpdate: number;
  onload: (e: Event) => void;

  /**
   * @param manager The XhrManager instance.
   * @param file The URL of the file to request.
   * @param onload The callback function to call when the request is loaded.
   * @param postLength The length of the POST request body, if any.
   * @param start The starting byte of the range request, if any.
   * @param length The number of bytes to request in the range request, if any.
   */
  constructor(
    private readonly manager: XhrManager,
    private readonly file: string,
    onload: (e: Event) => void,
    postLength: number | null | undefined,
    private readonly start?: number,
    private readonly length?: number,
  ) {
    this.onload = onload;
    this.type = postLength != null ? 'POST' : 'GET';
    this.startTime = new Date().getTime();
    this.lastUpdate = this.startTime;
    this.open();
  }

  private open(): void {
    this.xhr = new XMLHttpRequest();

    this.xhr.open(
      this.type,
      this.file + (BYPASS_CACHE ? `?${new Date().getTime()}` : ''),
    );
    this.xhr.responseType = 'arraybuffer';

    this.startTime = new Date().getTime();
    this.lastUpdate = this.startTime;

    if (this.start != null && this.length != null) {
      this.xhr.setRequestHeader(
        'Range',
        `bytes=${this.start}-${this.start + this.length - 1}`,
      );
    }

    this.xhr.addEventListener('error', () => {
      if (this.xhr.status === 404) {
        alert(
          'Failed to find "' +
            this.file +
            '" with error 404. Is it on the server?',
        );
      }
      this.manager.requestFinished(this);
      console.log('XHR error with code', this.xhr.status);
      this.open();
      this.send();
    });

    this.xhr.addEventListener('timeout', () => {
      this.manager.requestFinished(this);
      console.log('XHR timeout');
      this.open();
      this.send();
    });

    this.xhr.addEventListener('load', (e) => {
      this.manager.requestFinished(this);
      this.onload(e);
    });

    const onProgress = (e: ProgressEvent) => {
      if (e.lengthComputable && e.loaded === e.total) {
        this.xhr.removeEventListener('progress', onProgress);
      }
      this.lastUpdate = new Date().getTime();
    };

    this.xhr.addEventListener('progress', onProgress);
  }

  /**
   * Returns the raw response of the XHR request.
   */
  getRawResponse(): ArrayBuffer | string | null {
    if (this.xhr.status === 404) {
      alert(
        'Failed to find "' +
          this.file +
          '" with error 404. Is it on the server?',
      );
    }
    if (!(this.xhr.status >= 200 && this.xhr.status < 300)) {
      console.error(`XHR bad status: ${this.xhr.status}`);
    }
    return this.xhr.response;
  }

  /**
   * Returns the response data of the XHR request as a Uint8Array.
   */
  getResponseData(): Uint8Array {
    if (this.xhr.status === 404) {
      alert(
        'Failed to find "' +
          this.file +
          '" with error 404. Is it on the server?',
      );
    }
    if (!(this.xhr.status >= 200 && this.xhr.status < 300)) {
      console.error(`XHR bad status: ${this.xhr.status}`);
    }
    const result = new Uint8Array(this.xhr.response);
    if (this.length != null && result.length !== this.length) {
      console.log(
        `XHR length mismatch: expected ${this.length}, got ${result.length}`,
      );
    }
    return result;
  }

  /**
   * Sends the XHR request.
   * @param postData The data to send in the POST request body, if any.
   */
  send(postData?: XMLHttpRequestBodyInit): void {
    this.manager.addRequest(this);
    if (postData) {
      if (this.type !== 'POST') {
        console.log(
          'XHR requestType mismatch: expected POST, got ' + this.type,
        );
      }
      this.xhr.send(postData);
    } else {
      if (this.type !== 'GET') {
        console.log('XHR requestType mismatch: expected GET, got ' + this.type);
      }
      this.xhr.send();
    }
  }

  /**
   * Aborts the XHR request.
   */
  abort(): void {
    this.xhr.abort();
  }
}

/**
 * Manages XHR requests and tracks their duration.
 */
export class XhrManager {
  private requests: XhrRequest[] = [];
  /** Total duration of all finished requests in milliseconds. */
  totalRequestDuration = 0;

  /**
   * Adds a request to the manager.
   * @param request The request to add.
   */
  addRequest(request: XhrRequest): void {
    if (this.requests.indexOf(request) !== -1) {
      console.log('Request already exists in manager');
    }
    this.requests.push(request);
  }

  /**
   * Marks a request as finished and updates the total duration.
   * @param request The finished request.
   */
  requestFinished(request: XhrRequest): void {
    const currentTime = new Date().getTime();
    this.totalRequestDuration += currentTime - request.startTime;
    console.debug(`Request index ${this.requests.indexOf(request)} finished`);
    const index = this.requests.indexOf(request);
    if (index === -1) {
      console.log('Request not found in manager');
    } else {
      this.requests.splice(index, 1);
    }
  }

  /**
   * Aborts all active requests.
   */
  abortAll(): void {
    for (const request of this.requests) {
      request.abort();
    }
    this.requests = [];
  }

  /**
   * Creates a new GET request.
   * @param file The URL of the file to request.
   * @param onload The callback function to call when the request is loaded.
   * @param start The starting byte of the range request, if any.
   * @param length The number of bytes to request in the range request, if any.
   * @return The newly created XhrRequest instance.
   */
  createRequest(
    file: string,
    onload: (e: Event) => void,
    start?: number,
    length?: number,
  ): XhrRequest {
    const loggableStartAndLength =
      start != null && length != null
        ? `(start=${start}, length=${length})`
        : '';
    console.debug('Create XHR request for ' + file + loggableStartAndLength);
    return new XhrRequest(this, file, onload, null, start, length);
  }

  /**
   * Creates a new POST request.
   * @param file The URL of the file to request.
   * @param onload The callback function to call when the request is loaded.
   * @param postLength The length of the POST request body.
   * @param start The starting byte of the range request, if any.
   * @param length The number of bytes to request in the range request, if any.
   * @return The newly created XhrRequest instance.
   */
  createPostRequest(
    file: string,
    onload: (e: Event) => void,
    postLength?: number,
    start?: number,
    length?: number,
  ): XhrRequest {
    console.debug('Create POST request for ' + file);
    return new XhrRequest(this, file, onload, postLength, start, length);
  }

  /**
   * Returns true if there are any active requests.
   */
  hasActiveRequests(): boolean {
    return this.requests.length > 0;
  }

  /**
   * Returns the timestamp of the latest update among all active requests.
   */
  getLastUpdate(): number | null {
    if (this.requests.length === 0) {
      return null;
    }

    let latestUpdate = 0;
    for (const request of this.requests) {
      latestUpdate = Math.max(request.lastUpdate, latestUpdate);
    }
    return latestUpdate;
  }
}
