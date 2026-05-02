import { Injectable } from "@nestjs/common";

import type { ExtensionChannelEventType } from "./extension-channel-event.type";

const HEARTBEAT_MS = 25_000;

/** Per-connection enqueue; {@link ExtensionChannelStreamService.pushEvent} fans out to every sink for `userId`. */
type ExtensionChannelSink = (event: ExtensionChannelEventType) => void;

@Injectable()
export class ExtensionChannelStreamService {
  private readonly sinksByUser = new Map<string, Set<ExtensionChannelSink>>();

  private registerSink(userId: string, sink: ExtensionChannelSink): () => void {
    let set = this.sinksByUser.get(userId);
    if (set === undefined) {
      set = new Set();
      this.sinksByUser.set(userId, set);
    }
    set.add(sink);
    return (): void => {
      set!.delete(sink);
      if (set!.size === 0) {
        this.sinksByUser.delete(userId);
      }
    };
  }

  /** Delivers `event` to every active SSE stream for `userId`. */
  pushEvent(userId: string, event: ExtensionChannelEventType): void {
    const sinks = this.sinksByUser.get(userId);
    if (sinks === undefined || sinks.size === 0) {
      return;
    }
    for (const sink of sinks) {
      sink(event);
    }
  }

  /**
   * Long-lived async iterable for the extension SSE subscription.
   * Heartbeats plus orchestration events ({@link pushEvent}) for import runs etc.
   */
  async *eventsForUser(
    userId: string,
  ): AsyncGenerator<ExtensionChannelEventType> {
    const queue: ExtensionChannelEventType[] = [];
    let unblock: (() => void) | undefined;

    const enqueue: ExtensionChannelSink = (ev): void => {
      queue.push(ev);
      unblock?.();
    };

    const unregisterSink = this.registerSink(userId, enqueue);
    const heartbeatTimer = setInterval((): void => {
      enqueue({ kind: "HEARTBEAT", payloadJson: null });
    }, HEARTBEAT_MS);

    try {
      enqueue({ kind: "CONNECTED", payloadJson: JSON.stringify({ userId }) });

      for (;;) {
        while (queue.length > 0) {
          const next = queue.shift();
          if (next !== undefined) {
            yield next;
          }
        }
        await new Promise<void>((resolve): void => {
          unblock = resolve;
        });
        unblock = undefined;
      }
    } finally {
      clearInterval(heartbeatTimer);
      unregisterSink();
    }
  }
}
