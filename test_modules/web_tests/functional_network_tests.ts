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

import {asUnsafeAny, expandUrl, getMediaPath} from 'google3/third_party/javascript/yts/test_utils/legacy_yts_utils';

describe('Functional Tests', () => {
  describe('URL Length', () => {
    it('ImageSrcURLLength', (done) => {
      const imgElement = document.createElement('img');
      const url = expandUrl(getMediaPath('qual-e/pass.jpg') + '?q=', 'a');
      imgElement.onload = () => {
        document.body.removeChild(imgElement);
        done();
      };
      imgElement.onerror = () => {
        document.body.removeChild(imgElement);
        fail('Failed to load image with long URL');
        done();
      };
      imgElement.src = url;
      document.body.appendChild(imgElement);
    });

    it('VideoSrcURLLength - mp4', (done) => {
      const video = document.createElement('video');
      const randChar =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
              .charAt(Math.floor(Math.random() * 62));
      const src = getMediaPath('qual-e/sslTestVideo360p.mp4');
      const longUrl = expandUrl(src + '?q=', randChar);

      video.onplaying = () => {
        video.onplaying = null;
        video.pause();
        document.body.removeChild(video);
        done();
      };
      video.onerror = (e) => {
        document.body.removeChild(video);
        fail('Failed to play video with long URL: ' + e);
        done();
      };
      video.src = longUrl;
      document.body.appendChild(video);
      video.play();
    });

    it('XHRURLLength', (done) => {
      const xmlHttp = new XMLHttpRequest();
      const url = expandUrl(getMediaPath('qual-e/pass.png') + '?q=', 'a');
      xmlHttp.open('GET', url, true);
      xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState === 4) {
          if (xmlHttp.status === 200) {
            done();
          } else {
            fail('XHR request status is not 200 OK: ' + xmlHttp.status);
            done();
          }
        }
      };
      xmlHttp.send(null);
    });
  });

  describe('Security', () => {
    it('CORS', () => {
      expect(
          'XMLHttpRequest' in window &&
          'withCredentials' in new XMLHttpRequest())
          .withContext(
              'CORS should be supported via XMLHttpRequest withCredentials')
          .toBeTrue();
    });
  });

  describe('HTTP', () => {
    it('HTTPS', (done) => {
      const sslImg = document.createElement('img');
      sslImg.onload = () => {
        document.body.removeChild(sslImg);
        done();
      };
      sslImg.onerror = () => {
        document.body.removeChild(sslImg);
        fail('Failed to load image over HTTPS');
        done();
      };
      sslImg.src = 'https://www.google.com/images/srpr/logo3w.png';
      document.body.appendChild(sslImg);
    });

    it('XMLHTTPRequest', () => {
      expect(new XMLHttpRequest())
          .withContext('XMLHttpRequest should be instantiable')
          .toBeDefined();
    });

    it('XMLHTTPRequest Level 2', () => {
      expect(window.XMLHttpRequest && ('upload' in new XMLHttpRequest()))
          .withContext(
              'XMLHttpRequest Level 2 (upload property) should be supported')
          .toBeTrue();
    });
  });

  describe('Fetch API', () => {
    it('Fetch API - fetch()', () => {
      expect(window.fetch)
          .withContext('window.fetch should be defined')
          .toBeDefined();
    });

    it('Fetch API - Headers', () => {
      const httpHeaders = {
        'Content-Type': 'image/jpeg',
        'Accept-Charset': 'utf-8'
      };
      const testHeaders = new Headers(httpHeaders);
      expect(testHeaders.get('Content-Type'))
          .withContext('Headers should be correctly set and retrieved')
          .toBe('image/jpeg');
    });

    it('Fetch API - Request', () => {
      const fetchRequest = new Request(
          'https://qual-e.appspot.com/test',
          {method: 'POST', body: '{"result":"pass"}'});
      try {
        asUnsafeAny(fetchRequest).method = 'GET';
      } catch (e) {
        // Expected to throw because it is read-only
      }
      expect(fetchRequest.method)
          .withContext('Request method should be read-only and remain POST')
          .toBe('POST');
      expect(fetchRequest.url).toBe('https://qual-e.appspot.com/test');
      expect(fetchRequest.credentials).not.toBe('include');
    });

    it('Fetch API - Response', () => {
      const init = {'status': 200, 'statusText': 'YouTube'};
      const myResponse = new Response('test_body', init);
      try {
        asUnsafeAny(myResponse).statusText =
            'Should not work since it is read-only';
      } catch (e) {
        // Expected to throw
      }
      expect(myResponse.statusText)
          .withContext(
              'Response statusText should be read-only and remain YouTube')
          .toBe('YouTube');
      expect(myResponse.ok)
          .withContext('Response should be ok (status 200)')
          .toBeTrue();
    });

    it('Fetch API - stream', async () => {
      const FETCH_TIME_OUT = 3000;
      const timeoutPromise = new Promise(
          (_, reject) => setTimeout(
              () => reject(new Error('Fetch took too long')), FETCH_TIME_OUT));

      const fetchPromise = (async () => {
        const response =
            await fetch('/test_modules/web_tests/assets/fetch-sample.txt');
        const reader = response.body!.getReader();
        let partialCell = '';
        let returnNextCell = false;
        const returnCellAfter = 'YouTube';

        async function search(): Promise<string> {
          const result = await reader.read();
          const chunk = result.value;
          if (chunk) {
            for (let i = 3; i < chunk.byteLength; i++) {
              partialCell += String.fromCharCode(chunk[i]);
            }
          }
          const cellBoundary = /(?:,|\r\n)/;
          let completeCells = partialCell.split(cellBoundary);
          if (!result.done) {
            partialCell = completeCells[completeCells.length - 1];
            completeCells = completeCells.slice(0, -1);
          }
          for (let cell of completeCells) {
            cell = cell.trim();
            if (returnNextCell) {
              void reader.cancel('No more reading needed.');
              return cell;
            }
            if (cell === returnCellAfter) {
              returnNextCell = true;
            }
          }
          if (result.done) {
            throw new Error('Could not find value after ' + returnCellAfter);
          }
          return search();
        }
        return search();
      })();

      await Promise.race([fetchPromise, timeoutPromise]);
    });
  });

  describe('SSL', () => {
    it('Self-Signed', (done) => {
      const img = new Image();
      img.onload = () => {
        fail(
            'Request to website with self-signed SSL certificate succeeded but should have failed.');
        done();
      };
      img.onerror = () => {
        done();
      };
      img.src = 'https://self-signed.badssl.com/test/dashboard/small-image.png';
    });

    it('expired', (done) => {
      const img = new Image();
      img.onload = () => {
        fail(
            'Request to website with expired SSL certificate succeeded but should have failed.');
        done();
      };
      img.onerror = () => {
        done();
      };
      img.src = 'https://expired.badssl.com/test/dashboard/small-image.png';
    });

    it('sha256', (done) => {
      const img = new Image();
      img.onload = () => {
        done();
      };
      img.onerror = () => {
        fail('Request to website with valid SHA-256 SSL certificate failed.');
        done();
      };
      img.src = 'https://sha256.badssl.com/test/dashboard/small-image.png';
    });

    it('TLS', (done) => {
      const img = new Image();
      img.onload = () => {
        done();
      };
      img.onerror = () => {
        fail('Request to website with TLS v1.2 certificate failed.');
        done();
      };
      img.src =
          'https://tls-v1-2.badssl.com:1012/test/dashboard/small-image.png';
    });

    it('GlobalSign RootCA R2', (done) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://cert-test.sandbox.google.com/', true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status !== 200) {
            fail('XHR request status is not 200 OK: ' + xhr.status);
            done();
          } else if (!xhr.responseText.includes('Client test successful.')) {
            fail('XHR Response not as expected: ' + xhr.responseText);
            done();
          } else {
            done();
          }
        }
      };
      xhr.send();
    });

    it('GlobalSign RootCA R3', (done) => {
      const url =
          'https://www.globalsign.com/application/files/5815/8462/7621/iot-banner.jpg';
      const img = new Image();
      img.onload = () => {
        done();
      };
      img.onerror = () => {
        fail(
            'Request to website with GlobalSign RootCA R3 certificate failed.');
        done();
      };
      img.src = url;
    });
  });

  describe('IPv6', () => {
    it('IPv6 Support', (done) => {
      const img = document.createElement('img');
      img.onload = () => {
        document.body.removeChild(img);
        done();
      };
      img.onerror = () => {
        document.body.removeChild(img);
        fail('Failed to load image over IPv6. Device/Network may lack IPv6 support.');
        done();
      };
      img.src = 'https://ipv6.google.com/images/srpr/logo3w.png';
      document.body.appendChild(img);
    });
  });

  describe('Assorted', () => {
    it('Streams API - ReadableByteStream', () => {
      const init = {'status': 200, 'statusText': 'YouTube'};
      const myResponse = new Response('test_body', init);
      expect(!!window.ReadableStream && myResponse.ok)
          .withContext(
              'ReadableStream should be supported and response should be ok')
          .toBeTrue();
    });

    it('Same-origin Policy', () => {
      const value = window.localStorage.getItem('yt.leanback::schema-version');
      expect(value)
          .withContext(
              'localStorage.getItem("yt.leanback::schema-version") should be null (Same-origin Policy)')
          .toBeNull();
    });
  });
});
