/** Warn when a single request handler exceeds this wall-clock duration (ms). */
export const REQUEST_WARN_THRESHOLD_MS = 500;

/** Warn when a request triggers this many or more round-trips to PostgreSQL. */
export const QUERY_WARN_THRESHOLD = 20;

/** Warn on individual `pool.query` calls slower than this (per round-trip to PostgreSQL). */
export const DATABASE_POOL_SLOW_QUERY_WARN_MS = 200;
