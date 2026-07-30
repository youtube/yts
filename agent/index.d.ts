/**
 * @fileoverview Typings to be used by YTS web test modules to interact with YTS
 * framework.
 */

import {TrustedResourceUrl} from 'safevalues';
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
     * Constructs TrustedResourceUrl from given relative URL. Used by YTS test
     * modules and scripts to dynamically load resources such as CSS files.
     */
    function resourceUrl(relativePath: string): TrustedResourceUrl;

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
