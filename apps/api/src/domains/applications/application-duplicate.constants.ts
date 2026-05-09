/**
 * Duplicate detection: pairing window from "now". Another application counts as a
 * duplicate candidate only if it was created at or after `referenceTime - windowMs`.
 * Replace with configurable policy (user settings / env) when needed.
 */
export const APPLICATION_DUPLICATE_PAIRING_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
