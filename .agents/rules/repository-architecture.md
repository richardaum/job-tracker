# Repository Architecture

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

## Async task JSONB metadata

Fields named `{action}Metadata` (e.g. `summaryMetadata`, `conversionMetadata`, `generationMetadata`) are JSONB columns carrying `AsyncMetadata` (`{ status, error?, generatedAt? }`).

| Rule | Detail |
|---|---|
| `null` semantics | `metadata IS NULL` = task never requested. Sibling data column must also be `NULL`. |
| `NOT NULL` pairing | If data column is populated, metadata must NOT be `NULL` (status = `COMPLETED`, `generatedAt` set). |
| Backfill coverage | Migrations for legacy data must handle both: (a) metadata exists with `generatedAt IS NULL`, and (b) data populated but metadata still `NULL`. |
| Atomic updates | Background workers use `QueryBuilder` with JSONB `\|\|` operator and optimistic concurrency (`WHERE metadata->>'status' = expectedStatus`). |
| Stale recovery | Services implement `OnModuleInit` to reset lingering `PROCESSING` records to `FAILED` on startup. |

Canonical spec: `specs/034-technical-async-task-pattern/PATTERN.md`.

## Database migrations

When changes affect data models (entities, columns, types, indices, enums), create a TypeORM migration, not a raw SQL script. Forbidden to use TypeORM `synchronize` against shared or production-like databases.

Operational:
- Migration files at `apps/api/src/database/migrations/`
- Register in `apps/api/src/database/migrations/index.ts` (two places: import + `migrations` array)
- `pnpm --filter api migration:generate <name>` to generate from entity changes
- `pnpm --filter api migration:run` to apply pending

Detailed reference: `apps/api/src/database/migrations/MIGRATIONS.md`.
