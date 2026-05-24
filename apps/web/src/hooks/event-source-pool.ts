import { tryRun } from "@job-tracker/try-run";

type EventHandler = (data: unknown) => void;

interface EventChannel {
  handlers: Set<EventHandler>;
  domListener: (event: MessageEvent) => void;
}

/** Defer close so React Strict Mode remount can reuse the same connection. */
const CLOSE_DEFER_MS = 0;

interface PoolEntry {
  es: EventSource;
  channels: Map<string, EventChannel>;
  subscriptionCount: number;
  /** Pending close scheduled when the last subscriber unsubscribes. */
  closeTimer: ReturnType<typeof setTimeout> | null;
}

const pools = new Map<string, PoolEntry>();

export function subscribeEventSource(
  url: string,
  eventName: string,
  handler: EventHandler,
): () => void {
  let entry = pools.get(url);
  // Strict Mode: remount runs before the deferred close fires — keep the socket open.
  if (entry?.closeTimer) {
    clearTimeout(entry.closeTimer);
    entry.closeTimer = null;
  }

  if (!entry) {
    const es = new EventSource(url, { withCredentials: true });
    es.onerror = () => {};
    entry = { es, channels: new Map(), subscriptionCount: 0, closeTimer: null };
    pools.set(url, entry);
  }

  entry.subscriptionCount += 1;

  let channel = entry.channels.get(eventName);
  if (!channel) {
    const handlers = new Set<EventHandler>();
    const domListener = (event: MessageEvent) => {
      const [err, parsed] = tryRun(() => JSON.parse(event.data) as unknown);
      if (err) return;
      for (const listener of handlers) {
        listener(parsed);
      }
    };
    // One DOM listener per event name; fan-out to all hook handlers.
    entry.es.addEventListener(eventName, domListener);
    channel = { handlers, domListener };
    entry.channels.set(eventName, channel);
  }

  channel.handlers.add(handler);

  return () => {
    unsubscribeEventSource(url, eventName, handler);
  };
}

function unsubscribeEventSource(
  url: string,
  eventName: string,
  handler: EventHandler,
): void {
  const entry = pools.get(url);
  if (!entry) return;

  const channel = entry.channels.get(eventName);
  if (channel) {
    channel.handlers.delete(handler);
    if (channel.handlers.size === 0) {
      entry.es.removeEventListener(eventName, channel.domListener);
      entry.channels.delete(eventName);
    }
  }

  entry.subscriptionCount -= 1;
  if (entry.subscriptionCount <= 0) {
    // Defer so dev Strict Mode (unmount → remount in the same tick) reuses this entry.
    entry.closeTimer = setTimeout(() => {
      entry.closeTimer = null;
      // A resubscribe may have happened while the timer was pending.
      if (entry.subscriptionCount > 0) return;
      entry.es.onerror = null;
      entry.es.close();
      pools.delete(url);
    }, CLOSE_DEFER_MS);
  }
}

/** Test helper — clears pooled connections without going through React. */
export function resetEventSourcePoolForTests(): void {
  for (const entry of pools.values()) {
    if (entry.closeTimer) clearTimeout(entry.closeTimer);
    entry.es.onerror = null;
    entry.es.close();
  }
  pools.clear();
}

/** Test helper — number of open EventSource instances in the pool. */
export function getEventSourcePoolSizeForTests(): number {
  return pools.size;
}
