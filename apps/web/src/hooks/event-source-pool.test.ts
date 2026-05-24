import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getEventSourcePoolSizeForTests,
  resetEventSourcePoolForTests,
  subscribeEventSource,
} from "./event-source-pool";

const STREAM_URL = "https://api.test/jobs/job-1/stream";

describe("event-source-pool", () => {
  const instances: Array<{
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    onerror: (() => void) | null;
  }> = [];

  beforeEach(() => {
    instances.length = 0;
    vi.stubGlobal(
      "EventSource",
      vi.fn(function MockEventSource(this: unknown) {
        const es = {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          close: vi.fn(),
          onerror: null as (() => void) | null,
        };
        instances.push(es);
        return es;
      }),
    );
  });

  afterEach(() => {
    resetEventSourcePoolForTests();
    vi.unstubAllGlobals();
  });

  it("opens one EventSource for multiple subscriptions on the same URL", async () => {
    vi.useFakeTimers();
    const summary = vi.fn();
    const fill = vi.fn();
    const match = vi.fn();

    const offSummary = subscribeEventSource(
      STREAM_URL,
      "summary_status_changed",
      summary,
    );
    const offFill = subscribeEventSource(
      STREAM_URL,
      "fill_status_changed",
      fill,
    );
    const offMatch = subscribeEventSource(
      STREAM_URL,
      "match_status_changed",
      match,
    );

    expect(EventSource).toHaveBeenCalledTimes(1);
    expect(getEventSourcePoolSizeForTests()).toBe(1);
    expect(instances[0]?.addEventListener).toHaveBeenCalledTimes(3);

    offSummary();
    offFill();
    offMatch();

    expect(instances[0]?.close).not.toHaveBeenCalled();
    await vi.runAllTimersAsync();
    expect(instances[0]?.close).toHaveBeenCalledTimes(1);
    expect(getEventSourcePoolSizeForTests()).toBe(0);
    vi.useRealTimers();
  });

  it("reuses the same EventSource when resubscribing before deferred close", async () => {
    vi.useFakeTimers();
    const offSummary = subscribeEventSource(
      STREAM_URL,
      "summary_status_changed",
      vi.fn(),
    );
    const offFill = subscribeEventSource(
      STREAM_URL,
      "fill_status_changed",
      vi.fn(),
    );
    const offMatch = subscribeEventSource(
      STREAM_URL,
      "match_status_changed",
      vi.fn(),
    );

    offSummary();
    offFill();
    offMatch();

    subscribeEventSource(STREAM_URL, "summary_status_changed", vi.fn());

    expect(EventSource).toHaveBeenCalledTimes(1);
    expect(instances[0]?.close).not.toHaveBeenCalled();
    expect(getEventSourcePoolSizeForTests()).toBe(1);

    vi.useRealTimers();
  });

  it("dispatches parsed payload to all handlers for an event", () => {
    const first = vi.fn();
    const second = vi.fn();

    subscribeEventSource(STREAM_URL, "match_status_changed", first);
    subscribeEventSource(STREAM_URL, "match_status_changed", second);

    const domListener = instances[0]?.addEventListener.mock.calls.find(
      ([name]) => name === "match_status_changed",
    )?.[1] as (event: MessageEvent) => void;

    domListener({
      data: JSON.stringify({ status: "COMPLETED" }),
    } as MessageEvent);

    expect(first).toHaveBeenCalledWith({ status: "COMPLETED" });
    expect(second).toHaveBeenCalledWith({ status: "COMPLETED" });
  });

  it("uses separate EventSource instances for different URLs", () => {
    subscribeEventSource(STREAM_URL, "summary_status_changed", vi.fn());
    subscribeEventSource(
      "https://api.test/jobs/job-2/stream",
      "summary_status_changed",
      vi.fn(),
    );

    expect(EventSource).toHaveBeenCalledTimes(2);
    expect(getEventSourcePoolSizeForTests()).toBe(2);
  });
});
