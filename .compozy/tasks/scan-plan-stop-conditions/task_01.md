---
status: completed
title: "Server: migration — add `config` JSONB to source_templates"
type: api
complexity: low
dependencies: []
---

# Task 01: Server: migration — add `config` JSONB to source_templates

## Overview

Create a TypeORM migration that adds a `config` JSONB column to the `source_templates` table. This column will hold template-level stop condition configuration (`stopWhen`, `catchUpThreshold`, `maxPages`, `olderThanDays`).

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create a new migration in `apps/api/src/database/migrations/`
- MUST add a nullable JSONB column named `config` to the `source_templates` table
- MUST register the migration in `apps/api/src/database/migrations/index.ts`
- MUST NOT change existing columns or data
- MUST have both `up` and `down` methods

## Subtasks

- [x] 01.1 Create migration file with `ALTER TABLE source_templates ADD COLUMN config jsonb`
- [x] 01.2 Register in migrations index
- [x] 01.3 Update `SourceTemplateEntity` with new column decorator

## Implementation Details

Follow existing migration patterns in `apps/api/src/database/migrations/`. See `MIGRATIONS.md` for conventions.

### Relevant Files

- `apps/api/src/database/migrations/` — new migration file
- `apps/api/src/database/migrations/index.ts` — register import + array entry
- `apps/api/src/database/entities/source-template.entity.ts` — add `@Column({ type: "jsonb", nullable: true }) config`

### Dependent Files

- `apps/api/src/domains/sources/sources.service.ts` — will validate config on create/update

## Deliverables

- Migration file with up/down methods
- Entity column decorator
- Migration registered

## Tests

- [ ] Migration applies and rolls back cleanly
- [ ] Existing rows have `null` config after migration
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Migration applies without errors on empty and populated databases
