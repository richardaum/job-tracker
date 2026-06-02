# Backend Architecture

## App boundaries

- `apps/web` — UI only. Do not add API routes or server actions in web.
- `apps/api` — backend API. NestJS + GraphQL + TypeORM.
- OpenAI: use an internal API facade, not direct frontend calls.

## Imports

- Cross-package imports: workspace aliases (`@api/*`, `@ui/*`, `@/*`)
- Within `src/`, prefer absolute imports via the app's root alias (`@/module/file`) over `../` parent chains
- Same-directory `./` imports fine for co-located files

## Environment

Typed env modules only — no raw `process.env` in application code. In config/codegen only: `CI`, `E2E_PORT`, `API_GRAPHQL_URL`, `NODE_ENV`.

## NestJS modules and guards

Any NestJS module with resolvers decorated with `@UseGuards(JwtAuthGuard, RolesGuard)` must import `AuthModule`. Guards depend on `Reflector` and `UserService` from `AuthModule`. Omitting causes `UnknownDependenciesException`.

## Real-time events (SSE → GraphQL Subscription)

Real-time events from backend to frontend use **GraphQL Subscription** over the existing Apollo + `graphql-sse` middleware. Do not add raw `@Sse()` controllers, `EventSource`, or `useEventSource` hooks.

| Mechanism | Use |
|---|---|
| GraphQL Subscription (`@Subscription()`) | All real-time events — always |
| NestJS `@Sse()` / raw `EventSource` | **Forbidden** — not used |

**Backend pattern:**

1. Define `DomainEvent` subclass in `*.events.ts`
2. Emit via `EventBus` in the service: `this.eventBus.emit(new XxxCompleted(id, userId, payload))`
3. Create resolver with `@Subscription()` returning `AsyncIterable`
4. Filter events via `for await (const event of this.eventBus.events())` + `instanceof`

**Frontend pattern:**

- Define subscription operation in `.graphql` file
- Run codegen: `pnpm --filter @job-tracker/web run codegen`
- Use generated hook: `useXxxSubscription({ variables, onData })`

**Canonical references:** `JobsEventsResolver` (`jobs-events.resolver.ts`), `ExtensionActivityEventsResolver`.

## Database

See `database.md` — entities, embeds, migrations.
