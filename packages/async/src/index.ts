function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === "string" ? error : "Unknown error");
}

/**
 * Awaits {@link promise} and returns a typed tuple: `[null, data]` on success,
 * or `[error, null]` on failure. Thrown values that are not `Error` instances
 * are normalized via {@link normalizeError}.
 *
 * Prefer this over `try`/`catch` around awaited code: errors become values you
 * branch on, and callers should use `to()` whenever this pattern fits.
 *
 * @typeParam T Resolved value type of the promise.
 * @param promise The promise to await.
 * @returns A discriminated tuple: either `[null, T]` or `[Error, null]`.
 */
export async function to<T>(
  promise: Promise<T>,
): Promise<[error: Error, data: null] | [error: null, data: T]> {
  try {
    return [null, await promise];
  } catch (error) {
    return [normalizeError(error), null];
  }
}

/**
 * Runs {@link fn} and returns the same tuple shape as {@link to}:
 * `[null, result]` on success, or `[Error, null]` if `fn` throws.
 */
export function captureSync<T>(
  fn: () => T,
): [error: null, data: T] | [error: Error, data: null] {
  try {
    return [null, fn()];
  } catch (error) {
    return [normalizeError(error), null];
  }
}
