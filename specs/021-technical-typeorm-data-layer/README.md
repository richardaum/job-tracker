---
status: planned
created: "2026-05-02"
priority: medium
tags:
  - migrated
---

# Technical Scope: typeorm-data-layer

Scope id: `typeorm-data-layer` (technical-only spec; product traceability via [P-94]–[P-100] below).

## Objective & acceptance (traceability)

**Objective**

- [P-94] The API must keep the same observable persistence behavior for users, jobs, stage events, and notes while replacing the Drizzle stack with TypeORM integrated into NestJS.

**In scope**

- [P-95] All existing authenticated flows that read or write jobs, stage history, and notes must continue to work without users changing how they use the product.
- [P-96] Local and CI database setup must remain a single documented path (`db:migrate` before `dev` or image run) with deterministic schema application on a fresh database.
- [P-97] Operators who already applied Drizzle migrations must have a documented one-time cutover so the new migration journal does not re-apply destructive DDL.

**Out of scope**

- [P-98] Changing GraphQL shapes, business rules for salary, or stage and note semantics beyond what is required to preserve parity with the previous implementation.

**Acceptance criteria**

- [P-99] After migration, API lint, typecheck, and automated tests pass with the same coverage expectations as before the ORM swap.
- [P-100] A fresh PostgreSQL database reaches the same table and enum definitions as the previous squashed Drizzle baseline after running the new migration command once.

## Architecture Impact

- [T-122] Remove `drizzle-orm`, `drizzle-kit`, and Drizzle schema modules from `apps/api`; add `@nestjs/typeorm`, `typeorm`, and a small CLI runner (`tsx`) to apply TypeORM migrations before Nest boot in `dev` and `db:migrate`.
- [T-123] Introduce TypeORM entity classes for `users`, `jobs`, `job_stage_events`, and `job_notes` with explicit PostgreSQL column names matching the existing squashed baseline DDL.
- [T-124] Replace `DatabaseService` Drizzle wiring with `TypeOrmModule.forRoot` configuration, `TypeOrmModule.forFeature` in domain modules, and repository implementations based on `Repository<Entity>` (or query builder where ordering requires `COALESCE`).
- [T-125] Re-hook `DatabasePoolInterceptor` against the underlying `pg` `Pool` exposed by the TypeORM Postgres driver after `DataSource` initialization so slow-query and per-request query counting behavior is preserved.

## Design Decisions

- [T-126] Keep `synchronize: false` and version schema only through checked-in TypeORM `MigrationInterface` classes that replay the current baseline SQL, instead of auto-sync in any environment. -> Avoids silent drift and matches the prior migration-first posture.
- [T-127] Use a dedicated `typeorm_migrations` table name to reduce collision risk with unrelated `migrations` tables and to make cutover from Drizzle explicit. -> Clear operational boundary between old and new journals.
- [T-128] Retain domain-level TypeScript types (`User`, `Job`, etc.) as aliases of entity classes (or thin interfaces) so services and GraphQL layers change imports minimally. -> Lowers regression risk in resolver and service code.

## Risks and Mitigations

- [T-129] Existing databases that already ran Drizzle `__drizzle_migrations` will fail if baseline DDL runs twice. -> Prefer `pnpm run db:migrate:mark-applied` from `apps/api` (TypeORM `runMigrations({ fake: true })`, which creates `typeorm_migrations` if needed and inserts pending rows without running `up()`). Alternatively, after verifying schema parity, insert manually (for example `INSERT INTO "typeorm_migrations"("timestamp", "name") VALUES (1746009600000, 'Baseline1746009600000');` matching the migration class timestamp and `name`), then optionally `DROP SCHEMA drizzle CASCADE`; never execute the baseline `up()` SQL twice on the same database.
- [T-130] Enum and array column mapping mismatches between the prior Drizzle model and TypeORM entities could cause subtle read/write bugs. -> Mirror column types and names exactly from the baseline migration under `apps/api/src/database/migrations/` and rely on integration repository tests against a real PostgreSQL URL.

## Validation

- [T-131] `pnpm --filter @job-tracker/api run lint`, `typecheck`, and `test` pass; integration specs that require `DATABASE_URL` still reset `public`, run TypeORM migrations, and exercise repositories end-to-end.
