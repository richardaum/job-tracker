---
status: completed
title: DB Migration — Merge draft_jobs into jobs
type: backend
complexity: critical
dependencies:
  - task_01
---

# Task 02: DB Migration — Merge draft_jobs into jobs

## Overview

Create a single TypeORM migration that transforms the database schema to eliminate the `draft_jobs` table and absorb its data into `jobs`. This is the most critical step — data loss here is irreversible. The migration adds `DRAFT` to the `application_stage` PostgreSQL enum, adds `htmlContent` and `fillMetadata` JSONB columns to `jobs`, makes `title` nullable, migrates all `draft_jobs` rows into `jobs` with `stage = 'DRAFT'`, repoints `match_analysis.draft_job_id` to `match_analysis.job_id`, drops the `draft_jobs` table, and removes the dual FK from `jobs`.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create a single migration file following the naming convention `17678NNNNNNN-integrate-draft-into-jobs.ts`
- MUST add `DRAFT` to PostgreSQL `application_stage` enum via `ALTER TYPE ... ADD VALUE`
- MUST add `html_content` column (text, nullable) to `jobs` table
- MUST add `fill_status`, `fill_error`, `fill_timestamp` TEXT / timestamptz columns to `jobs` with the `fill_` prefix (`AsyncMetadataEmbedded` pattern in this codebase)
- MUST make `title` column nullable on `jobs`
- MUST merge all `draft_jobs` rows into `jobs` with stage=`DRAFT`, `html_content = draft.html_content`, merged URLs, and preserved timestamps
- MUST merge draft URLs into `jobs.urls` array — if the draft has a `url`, append it to the existing `urls` array (or create array if null)
- MUST repoint `match_analysis` records: `UPDATE match_analysis SET job_id = jobs.id FROM jobs WHERE match_analysis.draft_job_id = jobs.draft_job_id` before dropping the column
- MUST make `match_analysis.job_id` NOT NULL after migration
- MUST drop `draft_job_id` FK column from `jobs` table
- MUST drop `draft_job_id` column from `match_analysis` table
- MUST drop `draft_jobs` table
- Postgres: **`ALTER TYPE ... ADD VALUE` + using the new label in casts** conflicts with a transactional migration wrapper; migration sets `transaction=false` on the class (`MigrationInterface`).
- MUST register the migration in `apps/api/src/database/migrations/index.ts` (two places: import + migrations array)
- SHOULD use `queryRunner.query()` for raw SQL where TypeORM migration API is insufficient (enum alteration, data migration, column drops)
</requirements>

## Subtasks

- [x] 2.1 Add `DRAFT` to PostgreSQL `application_stage` enum
- [x] 2.2 Add `html_content` column (text, nullable) to `jobs` table
- [x] 2.3 Add `fill_status`, `fill_error`, `fill_timestamp` columns to `jobs` table
- [x] 2.4 Make `title` column nullable on `jobs`
- [x] 2.5 Migrate all `draft_jobs` rows into `jobs` (stage=DRAFT, htmlContent, merged URLs)
- [x] 2.6 Repoint `match_analysis.draft_job_id` → `job_id`, then drop `draft_job_id` column
- [x] 2.7 Drop `draft_job_id` FK from `jobs` table, drop `draft_jobs` table
- [x] 2.8 Register migration in `migrations/index.ts`

## Implementation Details

Migration file goes in `apps/api/src/database/migrations/`. Use the next available timestamp following the existing pattern (e.g., `1767800000000-integrate-draft-into-jobs.ts`). The migration operates on raw SQL for most steps because TypeORM's migration API has limited support for enum alteration, column nullability changes requiring table recreation, and complex data migration with subqueries.

### Relevant Files

- `apps/api/src/database/migrations/` — migration directory; follow naming and registration pattern from existing files
- `apps/api/src/database/migrations/index.ts` — two insertion points: `import { IntegrateDraftIntoJobs1767800000000 }` and `migrations` array
- `apps/api/src/database/entities/job.entity.ts` — target schema: columns to add (`htmlContent`, `fillMetadata`), columns to modify (`title` nullable), columns/relations to remove (`draftJob`)
- `apps/api/src/database/entities/draft-job.entity.ts` — source schema: columns to migrate (`url`, `htmlContent`, `title`, `userId`, `createdAt`)
- `apps/api/src/database/entities/match-analysis.entity.ts` — target: `draftJobId` column and `draftJob` relation to remove
- `apps/api/src/database/migrations/1767740000000-rename-embedded-columns-to-snake-case.ts` — reference for JSONB embedded column naming pattern (e.g., `fill_status`)
- `apps/api/src/database/migrations/1767500000000-add-conversion-metadata-jsonb.ts` — reference for JSONB column addition pattern

### Dependent Files

- `apps/api/src/database/entities/job.entity.ts` — must be updated in task_03 to match migration schema
- `apps/api/src/database/entities/match-analysis.entity.ts` — must be updated in task_04 to match migration schema
- `apps/api/src/database/entities/draft-job.entity.ts` — deleted in task_09 after migration proves table is empty

### Related ADRs

- [ADR-001: Full Merge — Draft as Job Stage](../adrs/adr-001.md) — Defines the data migration scope: all draft fields absorbed into Job
- [ADR-003: Match Analysis Unification](../adrs/adr-003.md) — Defines the match_analysis repoint logic: `UPDATE ... WHERE draft_job_id IS NOT NULL`

## Deliverables

- `apps/api/src/database/migrations/1767800000000-integrate-draft-into-jobs.ts` (new)
- Updated `apps/api/src/database/migrations/index.ts` (2 insertions)
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for migration correctness **(REQUIRED)**

## Tests

- Integration tests:
  - [x] Linked `jobs.draft_job_id` + `draft_jobs` — migrated fields merged, URL merged without duplicates
  - [x] Orphan `draft_jobs` + `match_analysis` — new DRAFT job PKs, analyses repointed, orphan columns/constraints dropped
  - [x] Zero `draft_jobs` rows — `up` succeeds
  - [x] `down` restores schema for placeholder-backed orphaned drafts (scenario covered)
  - [ ] Simulate mid-`up` failure atomicity — not exercised when `transaction=false`
- Unit tests:
  - [x] Migration class exports `up`/`down`; timestamp sequential; **`transaction=false`**
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Migration runs successfully against a DB with sample draft data
- Zero data loss: row count in `jobs WHERE stage = 'DRAFT'` equals pre-migration `draft_jobs` row count
- `draft_jobs` table no longer exists after `up`
- Migration registered in `index.ts` and appears in `migration:run` output
