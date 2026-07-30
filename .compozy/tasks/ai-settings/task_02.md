---
status: completed
title: "Migration — ai_enabled, openai_api_key_encrypted, trial_calls_used columns"
type: api
complexity: low
dependencies: []
---

# Task 2: Migration — ai_enabled, openai_api_key_encrypted, trial_calls_used columns

## Overview

Extend the existing `user_settings` table with the three columns this feature needs: the independent AI toggle, the encrypted personal key, and the trial usage counter. Column defaults (`ai_enabled = true`, `trial_calls_used = 0`) automatically grant every existing user a fresh 50-call trial at launch, satisfying the PRD's "existing users get the same trial from zero" requirement with no separate backfill step.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add `ai_enabled` (boolean, default `true`, not null) to `user_settings`.
- MUST add `openai_api_key_encrypted` (text, nullable) to `user_settings` — stores ciphertext only; no plaintext key ever lands in this column.
- MUST add `trial_calls_used` (int, default `0`, not null) to `user_settings`.
- MUST follow the existing raw-SQL migration pattern in `apps/api/src/database/migrations/` (`MigrationInterface`, `up`/`down` via `queryRunner.query`), matching the naming convention `{unix-ms-timestamp}-{kebab-description}.ts`.
- MUST register the new migration in `apps/api/src/database/migrations/index.ts` in chronological order, per `MIGRATIONS.md`.
- MUST update `UserSettingEntity` (`apps/api/src/database/entities/user-setting.entity.ts`) with the three new `@Column` declarations matching the migration exactly (names, types, defaults).
- MUST NOT add the `EncryptedColumnTransformer` to the entity in this task — that is task_03's scope; this task only creates the raw column and a plain-string entity field.
</requirements>

## Subtasks

- [ ] 2.1 Write the migration file adding the three columns with correct defaults and nullability
- [ ] 2.2 Write the corresponding `down` migration reverting the column additions
- [ ] 2.3 Register the migration in `migrations/index.ts`
- [ ] 2.4 Add the three new fields to `UserSettingEntity`
- [ ] 2.5 Verify existing rows get the correct defaults after migration runs against seeded/test data

## Implementation Details

See TechSpec "Data Models" section for exact column names, types, and defaults. Follow the existing migration example referenced there (`1785025427000-add-stage-events-fk-cascade.ts`) for style and structure.

### Relevant Files

- `apps/api/src/database/entities/user-setting.entity.ts` — add `aiEnabled`, `openaiApiKeyEncrypted`, `trialCallsUsed` fields, matching the existing style of `autoFillEnabled`/`duplicateWindowDays`
- `apps/api/src/database/migrations/` — directory for the new migration file
- `apps/api/src/database/migrations/index.ts` — migration registry that must include the new file
- `apps/api/src/database/migrations/MIGRATIONS.md` — documents the registration requirement

### Dependent Files

- `apps/api/src/domains/settings/settings.service.ts` — reads/writes `UserSettingEntity`; will need the new fields in later tasks (not this one)

### Related ADRs

- [ADR-001: Single-Phase Delivery](../adrs/adr-001.md) — column defaults are how existing users get the trial quota without a separate migration task

## Deliverables

- New migration file with `up`/`down`
- `migrations/index.ts` updated
- `UserSettingEntity` updated with three new plain fields (no transformer yet)
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for the migration **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] `UserSettingEntity` instances default to `aiEnabled: true`, `trialCallsUsed: 0`, `openaiApiKeyEncrypted: null` when not explicitly set
- Integration tests:
  - [ ] Running the migration against a test database adds all three columns with the correct type, nullability, and default
  - [ ] Running `down` after `up` cleanly removes the three columns
  - [ ] An existing `user_settings` row (created before the migration) reads `ai_enabled = true` and `trial_calls_used = 0` after migration, with no explicit backfill query
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Migration runs cleanly up and down against the test database
- `UserSettingEntity` compiles with the three new fields and existing settings tests still pass unmodified
