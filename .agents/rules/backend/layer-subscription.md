# Subscription Layer

## Responsibility

GraphQL Subscriptions for real-time events. Uses `@Subscription()` with async generators — never raw `@Sse()` or `EventSource`.

## Pattern

```ts
@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class XxxEventsResolver {
  constructor(
    private readonly eventBus: XxxEventBus,
    private readonly repo: XxxRepository,
  ) {}

  @Subscription(() => XxxEventType)
  async *xxxEvent(
    @Args("entityId", { type: () => ID }) entityId: string,
    @CurrentUser() user: { userId: string },
  ): AsyncIterable<XxxEventType> {
    const bus = this.eventBus.forScope(user.userId, entityId);
    for await (const event of bus.eventsOf(XxxDomainEvent)) {
      yield { entityId: event.entityId, status: event.status };
    }
  }
}
```

| Aspect | Convention |
|---|---|
| File | Separate `*-events.resolver.ts` file, not mixed with query/mutation resolvers. |
| Signature | `async *method(...): AsyncIterable<Type>` — async generator. |
| Scoping | `eventBus.forXxx(userId, entityId)` scopes to user + entity. |
| Consumption | `for await (const event of bus.eventsOf(EventClass))`. |
| Yield | Maps domain event to GraphQL return type. Enrich with repo data if needed. |
| Guards | Same `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(RoleEnum.User)` as queries. |
| Multi-event | `Promise.race` multiple event iterators to stream tokens until completion. |

## SOLID

See `solid.md` for the full reference.

- **SRP** — delivers real-time events to the frontend; does not contain business logic or trigger side effects
- **OCP** — new real-time data means a new subscription method in a dedicated resolver, not modifying existing ones
- **ISP** — yields only the fields the frontend needs for that specific event stream
- **DIP** — depends on `EventBus` abstraction; never calls services directly (enrichment via repo after event)

## Canonical references

- `apps/api/src/domains/jobs/jobs-events.resolver.ts` — single-event subscription + enrichment
- `apps/api/src/domains/ai-chat/ai-chat.resolver.ts` — multi-event race for streaming
- `apps/api/src/domains/extension-activity/extension-activity.resolver.ts` — user-wide subscription
