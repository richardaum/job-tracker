import { EventEmitter } from "node:events";

import { Subject } from "rxjs";

export abstract class DomainEvent {
  static readonly eventName: string;
  abstract readonly userId: string;

  get name(): string {
    const n = (this.constructor as typeof DomainEvent).eventName;
    if (!n) throw new Error(`${this.constructor.name} is missing eventName`);
    return n;
  }
}

export interface ScopedEventBus<Extra = object> {
  eventsOf<T extends DomainEvent & Extra>(EventClass: {
    new (...args: never[]): T;
    readonly eventName: string;
  }): AsyncIterable<T>;
}

export abstract class EventBus<Extra = object> {
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

  eventsOf<T extends DomainEvent & Extra>(
    EventClass: { new (...args: never[]): T; readonly eventName: string },
    userId?: string,
  ): AsyncIterable<T> {
    return this.createIterable((event): event is T => {
      if (!(event instanceof EventClass)) return false;
      return userId === undefined || event.userId === userId;
    });
  }

  forUser(userId: string): ScopedEventBus<Extra> {
    const eventsOf = this.eventsOf.bind(this);
    return {
      eventsOf: <T extends DomainEvent & Extra>(EventClass: {
        new (...args: never[]): T;
        readonly eventName: string;
      }): AsyncIterable<T> => eventsOf(EventClass, userId),
    };
  }

  private createIterable<T extends DomainEvent>(accept: (event: DomainEvent) => event is T): AsyncIterable<T> {
    const queue: T[] = [];
    let pendingNext: ((value: IteratorResult<T>) => void) | null = null;
    let closed = false;

    const sub = this.subject$.subscribe((event) => {
      if (closed) return;
      if (!accept(event)) return;
      if (pendingNext) {
        const resolve = pendingNext;
        pendingNext = null;
        resolve({ value: event, done: false });
        return;
      }
      queue.push(event);
    });

    return {
      [Symbol.asyncIterator]: (): AsyncIterator<T> => ({
        next: async (): Promise<IteratorResult<T>> => {
          if (queue.length > 0) return { value: queue.shift()!, done: false };
          if (closed) return { value: undefined, done: true } as IteratorResult<T>;
          return new Promise<IteratorResult<T>>((resolve) => {
            pendingNext = resolve;
          });
        },
        return: async (): Promise<IteratorResult<T>> => {
          closed = true;
          sub.unsubscribe();
          if (pendingNext) {
            pendingNext({ value: undefined, done: true } as IteratorResult<T>);
            pendingNext = null;
          }
          return { value: undefined, done: true } as IteratorResult<T>;
        },
      }),
    };
  }
}
