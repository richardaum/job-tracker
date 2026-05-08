import {
  ImportRunDomainEvent,
  ImportsEventsPublisher,
} from "@api/domains/imports/imports-events.publisher";
import { Injectable } from "@nestjs/common";

type PendingNext = (value: IteratorResult<ImportRunDomainEvent>) => void;

@Injectable()
export class InMemoryImportsEventsPublisher implements ImportsEventsPublisher {
  private readonly listeners = new Set<(event: ImportRunDomainEvent) => void>();

  async publish(event: ImportRunDomainEvent): Promise<void> {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  subscribe(): AsyncIterable<ImportRunDomainEvent> {
    const queue: ImportRunDomainEvent[] = [];
    let pendingNext: PendingNext | null = null;
    let closed = false;

    const onEvent = (event: ImportRunDomainEvent): void => {
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
      [Symbol.asyncIterator]: (): AsyncIterator<ImportRunDomainEvent> => ({
        next: async (): Promise<IteratorResult<ImportRunDomainEvent>> => {
          if (queue.length > 0) {
            const value = queue.shift();
            return {
              value,
              done: false,
            } as IteratorResult<ImportRunDomainEvent>;
          }
          if (closed) {
            return { value: undefined, done: true };
          }
          return new Promise<IteratorResult<ImportRunDomainEvent>>(
            (resolve) => {
              pendingNext = resolve;
            },
          );
        },
        return: async (): Promise<IteratorResult<ImportRunDomainEvent>> => {
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
