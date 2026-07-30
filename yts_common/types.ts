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

/**
 * Port range.
 */
export interface Ports {
  minPort: number;
  maxPort: number;
}

/**
 * Failure codes representing a global, standardized way of reporting error
 * types across YTS.
 *
 * This feature is currently opt-in and does not apply to all tests yet, but it
 * is designed to be general enough to apply to all tests in the future.
 * Multiple failure codes can apply to a single test failure. Feel free to add
 * additional failure codes here if none of the existing ones fit your use case;
 * try to keep the codes general so they can be reused across different tests.
 */
export type FailureCode =
    // go/keep-sorted start block=yes sticky_prefixes=/*,*
    /** An API errored out (e.g. the Gemini API) */
    |'infra.api_failure'
    /** There was an issue communicating with the device */
    |'infra.launch_failure'
    /**
     * The test logs indicate the test did not actually run for undetermined
     * reasons
     */
    |'infra.unknown'
    /**
     * The assistant heavily redacted the query, fundamentally changing the
     * intention of the query
     */
    |'voice.heavily_modified_vq'
    /**
     * The query was issued with YouTube in the foreground, but the device did
     * not include inApp=true as part the requirements.
     */
    |'voice.invalid_other_params'
    /**
     * The device assistant tried to parse the voice action that user sought,
     * but did not do it correctly
     */
    |'voice.invalid_va'
    /**
     * The assistant removed some words from the query, but it did not
     * fundamentally change the meaning of the query. Note that the total number
     * of words can be helpful here; if the query removes one preposition from a
     * long sentence, it probably doesn't change the meaning that much, but if
     * it removes one word from a two word query (e.g. "bear" vs. "the bear") it
     * might drastically change the output.
     */
    |'voice.lightly_modified_vq'
    /**
     * "Which video are you talking about?" "Which Person are you talking
     * about?". Note this probably requires human vision to confirm
     */
    |'voice.no_deeplink.assistant_clarification'
    /**
     * Assistant says something along the lines of "hmmm, I can't do that", "I
     * can't find an answer right now" etc. Note this probably requires human
     * vision to confirm
     */
    |'voice.no_deeplink.assistant_failure'
    /**
     * assistant says "here you go" but the results don't match. Note this
     * probably requires human vision to confirm
     */
    |'voice.no_deeplink.bad_response'
    /**
     * The device assistant had an overlay on the voice query that tried to
     * intercept the query and route it to device content search, when it was
     * not allowed to do so, per the YouTube Certification Requirements. Note
     * this probably requires human vision to confirm
     */
    |'voice.no_deeplink.disambig'
    /**
     * Device assistant with new LLM-enabled capabilities answers the question,
     * and answers it correctly. Note this probably requires human vision to
     * confirm
     */
    |'voice.no_deeplink.llm_answer'
    /**
     * The assistant passed the query to the device assistant, with no potential
     * for the query to come to YouTube. Note this probably requires human
     * vision to confirm
     */
    |'voice.no_deeplink.no_launch'
    /**
     * Device transcribes query, but shows no visual signal of a response. Note
     * this requires image / human verification to classify
     */
    |'voice.no_deeplink.no_response'
    /**
     * Go here to adjust your wifi settings. Go here to adjust your ads
     * settings. Note this probably requires human vision to confirm
     */
    |'voice.no_deeplink.settings_overlay'
    /**
     * The logs show an error code, but it is unclear what happened. When the
     * logs come in, this is the parking lot for where a failure should be
     * classified. And then a human reviewer will look at the video / images of
     * the test to determine which of the more specific failure reasons in 3.x
     * are suitable.
     */
    |'voice.no_deeplink.unknown_error'
    /**
     * Device assistant does not understand the query, triggers Voice EDU plate
     * instead. Note this probably requires human vision to confirm
     */
    |'voice.no_deeplink.voice_edu_overlay';
// go/keep-sorted end
