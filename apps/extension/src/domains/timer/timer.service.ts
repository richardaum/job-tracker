/** Poll until `predicate` succeeds or total wait exceeds `maxWaitMs`. */
export type WaitForPollOptions = {
  /** Pause between attempts (ms). */
  intervalMs: number;
  /** Upper bound on total wait (ms). */
  maxWaitMs: number;
};

/** Delays and polling for DOM automation; inject a fake in tests. */
export interface TimerService {
  /** Short fixed pause (e.g. before scroll/click). */
  smallDelay(): Promise<void>;
  /** Longer random pause (e.g. human-like jitter before a row). */
  longDelay(): Promise<void>;
  /**
   * Runs `predicate` in a loop: wait `intervalMs` between tries until it returns
   * a truthy value or `maxWaitMs` has elapsed since the first check.
   */
  waitFor<T>(
    predicate: () => T | null | undefined | false,
    options: WaitForPollOptions,
  ): Promise<NonNullable<T>>;
}

const SMALL_DELAY_MS = 75;
const LONG_DELAY_MAX_MS = 2000;

export class DefaultTimerService implements TimerService {
  async smallDelay(): Promise<void> {
    await sleep(SMALL_DELAY_MS);
  }

  async longDelay(): Promise<void> {
    await sleep(Math.random() * LONG_DELAY_MAX_MS);
  }

  async waitFor<T>(
    predicate: () => T | null | undefined | false,
    options: WaitForPollOptions,
  ): Promise<NonNullable<T>> {
    const { intervalMs, maxWaitMs } = options;
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const result = predicate();
      if (result) return result as NonNullable<T>;
      const elapsed = Date.now() - start;
      const remaining = maxWaitMs - elapsed;
      if (remaining <= 0) break;
      await sleep(Math.min(intervalMs, remaining));
    }
    throw new Error(`waitFor: timeout after ${maxWaitMs}ms`);
  }
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
