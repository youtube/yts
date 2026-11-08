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

      /**
       * Optional interval in milliseconds for periodic polling. When > 0, an
       * initial screenshot is captured immediately and polling continues every
       * intervalMs until stopped, yts.analyzeScreenshots() runs, or the test
       * finishes. When <= 0, stops active polling without capturing an
       * additional screenshot.
       */
      intervalMs?: number;
    }

    /**
     * Takes a screenshot of the device screen.
     * @param options Optional configuration specifying screenshot name and/or
     *     delay.
     * @return A promise that resolves when the screenshot has been captured.
     */
    function screenshot(options?: ScreenshotOptions): Promise<void>;

    /**
     * Diagnosis returned by yts.analyzeScreenshots().
     */
    interface ScreenshotAnalysisResult {
      /** Standardized code classifying the root cause of the failure. */
      failureCode: FailureCode;
      /** Human-readable explanation of what happened on the device. */
      reason: string;
      /** Confidence score between 0 and 100. */
      certainty: number;
      /**
       * 0-based index of the key screenshot demonstrating the failure, or -1
       * if not applicable.
       */
      keyFailureIndex: number;
    }

    /**
     * Runs Gemini visual analysis over the screenshots captured so far in the
     * current test, so the test can report the diagnosed failure mode (e.g.
     * via yts.addFailureCode()) before deciding to fail.
     * @param prompt Optional goal/hint guiding the analysis.
     * @return A promise resolving to the diagnosis, or null if analysis is
     *     unavailable (unsupported CLI, timeout, or no screenshots).
     */
    function analyzeScreenshots(
      prompt?: string,
    ): Promise<ScreenshotAnalysisResult | null>;

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

    /**
     * Gets a runtime flag passed from the test runner via RunTests/RunScript.
     */
    function getFlag(key: string): string | undefined;
  }
}
