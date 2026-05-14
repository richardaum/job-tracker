import {
  SourceRunDomainEvent,
  SourcesEventsPublisher,
} from "@api/domains/sources/sources-events.publisher";
import { Injectable } from "@nestjs/common";

type PendingNext = (value: IteratorResult<SourceRunDomainEvent>) => void;

@Injectable()
export class InMemorySourcesEventsPublisher implements SourcesEventsPublisher {
  private readonly listeners = new Set<(event: SourceRunDomainEvent) => void>();

  async publish(event: SourceRunDomainEvent): Promise<void> {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  subscribe(): AsyncIterable<SourceRunDomainEvent> {
    const queue: SourceRunDomainEvent[] = [];
    let pendingNext: PendingNext | null = null;
    let closed = false;

    const onEvent = (event: SourceRunDomainEvent): void => {
      if (closed) {
        return;
      }
      if (pendingNext) {
        const resolve = pendingNext;
        pendingNext = null;
        resolve({ value: event, done: false });
        return;
      }
      queue.push(event);
    };

    this.listeners.add(onEvent);

    return {
      [Symbol.asyncIterator]: (): AsyncIterator<SourceRunDomainEvent> => ({
        next: async (): Promise<IteratorResult<SourceRunDomainEvent>> => {
          if (queue.length > 0) {
            const value = queue.shift();
            return {
              value,
              done: false,
            } as IteratorResult<SourceRunDomainEvent>;
          }
          if (closed) {
            return { value: undefined, done: true };
          }
          return new Promise<IteratorResult<SourceRunDomainEvent>>(
            (resolve) => {
              pendingNext = resolve;
            },
          );
        },
        return: async (): Promise<IteratorResult<SourceRunDomainEvent>> => {
          closed = true;
          this.listeners.delete(onEvent);
          if (pendingNext) {
            pendingNext({ value: undefined, done: true });
            pendingNext = null;
          }
          return { value: undefined, done: true };
        },
      }),
    };
  }
}
