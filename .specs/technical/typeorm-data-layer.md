# Technical Scope: typeorm-data-layer

## Architecture Impact

- [T-122] Remove `drizzle-orm`, `drizzle-kit`, and Drizzle schema modules from `apps/api`; add `@nestjs/typeorm`, `typeorm`, and a small CLI runner (`tsx`) to apply TypeORM migrations before Nest boot in `dev` and `db:migrate`.
- [T-123] Introduce TypeORM entity classes for `users`, `applications`, `application_stage_events`, and `application_notes` with explicit PostgreSQL column names matching the existing squashed baseline DDL.
- [T-124] Replace `DatabaseService` Drizzle wiring with `TypeOrmModule.forRoot` configuration, `TypeOrmModule.forFeature` in domain modules, and repository implementations based on `Repository<Entity>` (or query builder where ordering requires `COALESCE`).
- [T-125] Re-hook `DatabasePoolInterceptor` against the underlying `pg` `Pool` exposed by the TypeORM Postgres driver after `DataSource` initialization so slow-query and per-request query counting behavior is preserved.

## Design Decisions

- [T-126] Keep `synchronize: false` and version schema only through checked-in TypeORM `MigrationInterface` classes that replay the current baseline SQL, instead of auto-sync in any environment. -> Avoids silent drift and matches the prior migration-first posture.
- [T-127] Use a dedicated `typeorm_migrations` table name to reduce collision risk with unrelated `migrations` tables and to make cutover from Drizzle explicit. -> Clear operational boundary between old and new journals.
- [T-128] Retain domain-level TypeScript types (`User`, `Application`, etc.) as aliases of entity classes (or thin interfaces) so services and GraphQL layers change imports minimally. -> Lowers regression risk in resolver and service code.

## Risks and Mitigations

- [T-129] Existing databases that already ran Drizzle `__drizzle_migrations` will fail if baseline DDL runs twice. -> Prefer `pnpm run db:migrate:mark-applied` from `apps/api` (TypeORM `runMigrations({ fake: true })`, which creates `typeorm_migrations` if needed and inserts pending rows without running `up()`). Alternatively, after verifying schema parity, insert manually (for example `INSERT INTO "typeorm_migrations"("timestamp", "name") VALUES (1746009600000, 'Baseline1746009600000');` matching the migration class timestamp and `name`), then optionally `DROP SCHEMA drizzle CASCADE`; never execute the baseline `up()` SQL twice on the same database.
- [T-130] Enum and array column mapping mismatches between the prior Drizzle model and TypeORM entities could cause subtle read/write bugs. -> Mirror column types and names exactly from the baseline migration under `apps/api/src/database/migrations/` and rely on integration repository tests against a real PostgreSQL URL.

## Validation

- [T-131] `pnpm --filter @job-tracker/api run lint`, `typecheck`, and `test` pass; integration specs that require `DATABASE_URL` still reset `public`, run TypeORM migrations, and exercise repositories end-to-end.
