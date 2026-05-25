import { EventEmitter } from "node:events";

import { Subject, type Subscription } from "rxjs";

export abstract class DomainEvent {
  static readonly eventName: string;

  get name(): string {
    const n = (this.constructor as typeof DomainEvent).eventName;
    if (!n) throw new Error(`${this.constructor.name} is missing eventName`);
    return n;
  }
}

type PendingNext = (value: IteratorResult<DomainEvent>) => void;

export abstract class EventBus {
  private readonly emitter = new EventEmitter();
  private readonly subject$ = new Subject<DomainEvent>();

  emit(event: DomainEvent): void {
    this.emitter.emit(event.name, event);
    this.subject$.next(event);
  }

  on<T extends DomainEvent>(
    EventClass: { new (...args: never[]): T; readonly eventName: string },
    handler: (event: T) => void,
  ): () => void {
    this.emitter.on(EventClass.eventName, handler);
    return () => this.emitter.off(EventClass.eventName, handler);
  }

  events(): AsyncIterable<DomainEvent> {
    const queue: DomainEvent[] = [];
    let pendingNext: PendingNext | null = null;
    let closed = false;

    const sub: Subscription = this.subject$.subscribe((event) => {
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
    });

    return {
      [Symbol.asyncIterator]: (): AsyncIterator<DomainEvent> => ({
        next: async (): Promise<IteratorResult<DomainEvent>> => {
          if (queue.length > 0) {
            return { value: queue.shift()!, done: false };
          }
          if (closed) {
            return { value: undefined, done: true };
          }
          return new Promise<IteratorResult<DomainEvent>>((resolve) => {
            pendingNext = resolve;
          });
        },
        return: async (): Promise<IteratorResult<DomainEvent>> => {
          closed = true;
          sub.unsubscribe();
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
