import { EventEmitter } from "node:events";

export abstract class DomainEvent {
  static readonly eventName: string;

  get name(): string {
    const n = (this.constructor as typeof DomainEvent).eventName;
    if (!n) throw new Error(`${this.constructor.name} is missing eventName`);
    return n;
  }
}

export abstract class EventBus {
  private readonly emitter = new EventEmitter();

  emit(event: DomainEvent): void {
    this.emitter.emit(event.name, event);
  }

  on<T extends DomainEvent>(
    EventClass: { new (...args: never[]): T; readonly eventName: string },
    handler: (event: T) => void,
  ): () => void {
    this.emitter.on(EventClass.eventName, handler);
    return () => this.emitter.off(EventClass.eventName, handler);
  }
}
