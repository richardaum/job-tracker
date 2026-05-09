function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === "string" ? error : "Unknown error");
}

function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as PromiseLike<T>).then === "function"
  );
}

type Tuple<T> = [error: null, data: T] | [error: Error, data: null];

/**
 * Runs a promise or a callback and returns `[null, data]` on success, or
 * `[error, null]` on failure (errors are normalized via {@link normalizeError}).
 *
 * - **`Promise`**: returns a **`Promise`** of the tuple (use `await tryRun(p)`).
 * - **`() => value`**: if the callback returns a non-thenable, returns the tuple **synchronously**.
 * - **`() => Promise`**: returns a **`Promise`** of the tuple (`await tryRun(fn)`).
 */
export function tryRun<T>(source: Promise<T>): Promise<Tuple<T>>;
export function tryRun<T>(fn: () => T): Tuple<T>;
export function tryRun<T>(fn: () => Promise<T>): Promise<Tuple<T>>;
export function tryRun<T>(
  source: Promise<T> | (() => T | Promise<T>),
): Tuple<T> | Promise<Tuple<T>> {
  if (typeof source === "function") {
    try {
      const result = (source as () => T | Promise<T>)();
      if (isPromiseLike<T>(result)) {
        return Promise.resolve(result).then(
          (data) => [null, data],
          (error) => [normalizeError(error), null],
        );
      }
      return [null, result as T];
    } catch (error) {
      return [normalizeError(error), null];
    }
  }

  return source.then(
    (data) => [null, data],
    (error) => [normalizeError(error), null],
  );
}
