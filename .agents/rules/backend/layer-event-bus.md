# Event Bus Layer

## Responsibility

Decoupled communication between layers via domain events. Services emit, subscriptions and listeners consume.

## DomainEvent base class

```ts
export abstract class DomainEvent {
  static readonly eventName: string;
  abstract readonly userId: string;

  get name(): string {
    return (this.constructor as typeof DomainEvent).eventName;
  }
}
```

## EventBus base class

Dual emission: `EventEmitter` for sync listeners + RxJS `Subject` for async iterables.

```ts
export abstract class EventBus<Extra = object> {
  emit(event: DomainEvent): void;
  on<T>(EventClass, handler): () => void;              // Listener registration, returns unsubscribe
  eventsOf<T>(EventClass, userId?): AsyncIterable<T>;  // For @Subscription() resolvers
  forUser(userId): ScopedEventBus<Extra>;               // User-scoped events
}
```

## Domain-specific subclasses

```ts
// Simple — no entity scoping
export class MatchAnalysisEventBus extends EventBus {}

// With entity scoping
export class JobEventBus extends EventBus<{ readonly jobId: string }> {
  forJob(userId: string, jobId: string): ScopedEventBus<{ readonly jobId: string }> {
    return this.forUser(userId).withExtra({ jobId });
  }
}
```

## Event definition

One file per domain (`*.events.ts`):

```ts
// job.events.ts
export class JobCreated extends DomainEvent {
  static readonly eventName = "job.created";
  constructor(
    readonly jobId: string,
    readonly userId: string,
  ) { super(); }
}
```

## Emission in services

```ts
this.eventBus.emit(new JobCreated(job.id, userId));
this.eventBus.emit(new MatchStatusChanged(id, userId, jobId, AsyncMetadataStatusEnum.Processing));
```

## Consumption via listeners (`OnModuleInit`)

```ts
@Injectable()
export class XxxEventListener implements OnModuleInit {
  onModuleInit(): void {
    this.eventBus.on(SomeEvent, (event) => {
      void this.service.handle(event)
        .catch((err) => this.logger.error(...));
    });
  }
}
```

Cross-domain: inject another module's EventBus to listen to its events.

## SOLID

See `solid.md` for the full reference.

- **SRP** — signals that something happened; owns neither the cause nor the consequence
- **OCP** — new event types are new `DomainEvent` subclasses, not modifications to the EventBus
- **ISP** — each event carries only the data its consumers need (`userId`, `entityId`, and minimal payload)
- **DIP** — emitters and consumers both depend on the `EventBus` abstraction; a service never references a listener, and a listener never references a service directly

## Canonical references

- `apps/api/src/lib/domain-event.ts` — `DomainEvent` + `EventBus` base classes
- `apps/api/src/domains/jobs/job.events.ts` — event definitions
- `apps/api/src/domains/jobs/job-event.bus.ts` — scoped `JobEventBus`
- `apps/api/src/domains/jobs/fill-job-event.listener.ts` — listener pattern
- `apps/api/src/domains/match-analysis/match-analysis-event.listener.ts` — cross-domain listener
