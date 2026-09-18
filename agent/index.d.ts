/**
 * @fileoverview Typings to be used by YTS web test modules to interact with YTS
 * framework.
 */

import {FailureCode} from '../yts_common/types';

declare global {
  namespace yts {
    /**
     * Registers a function as a YTS script that can be called remotely. Such
     * script will run in browser (Cobalt) on a Living Room device but it can be
     * called remotely from YTS CLI. This mechanism is used by YTS tests that
     * have logic on both sides (on the host and on the device).
     */
    function script(name: string, func: Function): void;

    /**
     * Gets and sets "metrics" records, which are key-value pairs which report
     * testing data.
     */
    function getMetrics(): Record<string, unknown>;
    function addMetric(key: string, value: unknown): void;
    function addFailureCode(code: FailureCode): void;
    function setMetrics(metrics: Record<string, unknown>): void;
    function clearMetrics(): void;

    /**
     * Called before the user temporarily disconnects agent to do cleanup tasks
     * before the application is exited and reloaded, like writing connection
     * information to local storage.
     */
    function prepareForReload(): void;

    /**
     * Marks current test as optional. If test fails, it will be reported as
     * OPTIONAL_FAILED instead of FAILED.
     */
    function markOptional(): void;

    /**
     * Constructs string URL from given relative URL. Used by YTS test
     * modules and scripts to dynamically load resources such as CSS files.
     */
    function resourceUrl(relativePath: string): string;


    /**
     * Configuration options for capturing a screenshot.
     */
    interface ScreenshotOptions {
      /**
       * Optional identifier included in the saved screenshot filename.
       * E.g. 'pre_voice_query' produces:
       * `screenshot_<device>_pre_voice_query_<timestamp>.png`
       */
      name?: string;

      /**
       * Optional delay in milliseconds to wait before capturing the screenshot
       * (e.g. to allow UI animations or voice overlays to render).
       */
      delayMs?: number;
    }

    /**
     * Takes a screenshot of the device screen.
     * @param options Optional configuration specifying screenshot name and/or delay.
     * @return A promise that resolves when the screenshot has been captured.
     */
    function screenshot(options?: ScreenshotOptions): Promise<void>;

    /**
     * YTS test certification metadata.
     */
    interface CertMetadata {
      id: string;
    }

    /**
     * Assigns cert metadata to the next `it` or `fit`.
     */
    function test(certMetadata: CertMetadata): void;
  }
}
