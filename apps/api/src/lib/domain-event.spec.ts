import { describe, expect, it, vi } from "vitest";

import { DomainEvent, EventBus } from "./domain-event";

class TestEvent extends DomainEvent {
  static readonly eventName = "test.event";
  constructor(
    readonly userId: string,
    readonly value: string,
  ) {
    super();
  }
}

class MissingNameEvent extends DomainEvent {
  constructor(readonly userId: string) {
    super();
  }
}

class OtherEvent extends DomainEvent {
  static readonly eventName = "other.event";
  constructor(readonly userId: string) {
    super();
  }
}

class TestBus extends EventBus {}

describe("EventBus", () => {
  it("emits to listeners and supports unsubscribe", () => {
    const bus = new TestBus();
    const handler = vi.fn();
    const unsubscribe = bus.on(TestEvent, handler);

    bus.emit(new TestEvent("u", "one"));
    unsubscribe();
    bus.emit(new TestEvent("u", "two"));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ value: "one" }));
  });

  it("queues events and filters an async iterable by class and user", async () => {
    const bus = new TestBus();
    const iterator = bus.eventsOf(TestEvent, "u")[Symbol.asyncIterator]();

    bus.emit(new OtherEvent("u"));
    bus.emit(new TestEvent("other", "ignored"));
    bus.emit(new TestEvent("u", "first"));
    bus.emit(new TestEvent("u", "second"));

    await expect(iterator.next()).resolves.toMatchObject({ value: { value: "first" }, done: false });
    await expect(iterator.next()).resolves.toMatchObject({ value: { value: "second" }, done: false });
    await iterator.return!();
    await expect(iterator.next()).resolves.toMatchObject({ done: true });
  });

  it("resolves pending iterators, including when they are closed", async () => {
    const bus = new TestBus();
    const iterator = bus.forUser("u").eventsOf(TestEvent)[Symbol.asyncIterator]();

    const pending = iterator.next();
    bus.emit(new TestEvent("u", "received"));

    await expect(pending).resolves.toMatchObject({ value: { value: "received" }, done: false });

    const pendingClose = iterator.next();
    await iterator.return!();
    await expect(pendingClose).resolves.toMatchObject({ done: true });

    bus.emit(new TestEvent("u", "ignored after close"));
  });

  it("requires every event class to declare an event name", () => {
    expect(() => new MissingNameEvent("u").name).toThrow("missing eventName");
  });
});
