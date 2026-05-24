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

## Thin repositories

A thin repository only translates read/write operations to the database: `find`, `save`, `insert`, `update`, optimized queries (joins instead of N+1), and methods that accept an optional `EntityManager` for transactional composition. It does not own business flow — no find-or-create, branching upserts, domain defaults (role, UUID), provider/use-case wrappers (`findByGoogleId`), or business invariants/exceptions. The service orchestrates “already exists? update : create”, opens transactions, and turns `null` into domain errors. Quick rule: if the method describes *what to do* with data, it belongs in the service; if it describes *how to read/write a table*, it belongs in the repository.

Reference: `apps/api/src/domains/users/users.repository.ts` + `users.service.ts`, `apps/api/src/domains/jobs/jobs.repository.ts` (`EntityManager?` on write helpers).

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
