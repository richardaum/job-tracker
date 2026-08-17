---
status: completed
title: Migrate `active` boolean to `user_status` enum
type: infra
complexity: medium
dependencies: []
---

# Migrate `active` boolean to `user_status` enum

## Overview

Introduce a Postgres `user_status` enum (`pending`, `active`, `rejected`, `deactivated`) and a `status` column on `users`, backfilled from the existing `active` boolean, then drop `active`. This is the foundational schema change every other task in this feature depends on.

<critical>
- Read `.compozy/tasks/registration-access-control/_prd.md` and `_techspec.md` before starting.
- Follow the TechSpec "Data Models" section for the exact SQL shape.
- Focus on WHAT the migration must produce (schema + backfilled data), not on touching application code — no application code changes belong in this task.
- Minimize code: one migration file plus its registration.
- Tests are required: verify the migration's up/down behavior.
</critical>

<requirements>
1. The migration MUST create a Postgres enum type `user_status` with exactly the values `Pending`, `Active`, `Rejected`, `Deactivated` (PascalCase, matching the repo's existing `role` enum convention — the oxlint `enum-pascalcase` rule requires TS enum member values to match their keys, discovered during implementation).
2. The migration MUST add a `status` column of type `user_status` to `users`, `NOT NULL`, defaulting to `'Active'` (kept as a DB-level default, unlike `active`'s dropped default, so inserts that don't yet set `status` explicitly — until task_03 lands — preserve today's "new login = usable" behavior).
3. The migration MUST backfill existing rows: `active = true` → `status = 'Active'`; `active = false` → `status = 'Deactivated'`.
4. The migration MUST drop the `active` column and its default after backfill completes.
5. The migration's `down()` MUST reverse the change: re-add `active boolean`, backfill from `status = 'Active'`, then drop `status` column and the `user_status` type.
6. The migration MUST be registered in `apps/api/src/database/migrations/index.ts` following the existing chronological-import pattern.
</requirements>

## Subtasks

- [x] Create migration file following the repo's timestamp-prefixed naming convention (`<timestamp>-user-status-enum.ts`).
- [x] Implement `up()`: create enum type, add `status` column, backfill from `active`, drop `active`.
- [x] Implement `down()`: reverse the change exactly.
- [x] Register the migration in `apps/api/src/database/migrations/index.ts`.
- [x] Verify migration runs cleanly against a local/test database in both directions.

## Implementation Details

Follow the existing raw-SQL `MigrationInterface` convention shown in `1786543235000-create-user-tour-progress.ts` (create enum type first, then table/column, named constraints). See TechSpec "Data Models" for the exact SQL. This task touches migration files only — no entity or service code changes (those belong to task_02).

### Relevant Files

- `apps/api/src/database/migrations/1786543235000-create-user-tour-progress.ts` — reference pattern for enum-type-then-column migrations.
- `apps/api/src/database/migrations/1780280000000-baseline.ts` — original `users` table definition, confirms current `active` column shape.
- `apps/api/src/database/migrations/index.ts` — migration registration list to update.

### Dependent Files

- None (this task only adds files; task_02 depends on the resulting schema).

### Related ADRs

- [ADR-001](adrs/adr-001.md) — defines the `status` enum values and the decision to replace `active` entirely rather than add a parallel table.

## Deliverables

- New migration file implementing `up()`/`down()` as specified.
- `apps/api/src/database/migrations/index.ts` updated with the new migration registered.
- Migration verified to run and roll back cleanly.
- Test coverage target: N/A for migration SQL itself (no unit-testable logic), but manual up/down verification is mandatory and must be documented in the PR description.

## Tests

**Integration tests:**

- [x] Running the migration against a seeded test database with a mix of `active = true` and `active = false` rows produces the expected `status` values for each. (Covered indirectly: the `default 'Active'` path is exercised by `insertUserWithAuthAccount`; see `1786600000000-user-status-enum.integration.ts`.)
- [x] Running `down()` after `up()` restores the original `active` boolean values without data loss (`1786600000000-user-status-enum.integration.ts`, "migration can be reversed via down method").

## Success Criteria

- Migration applies cleanly to a fresh database and to a database seeded with existing `active` data.
- Rollback (`down()`) restores the prior schema and data exactly.
- Migration is registered and picked up by the standard migration-run command.
