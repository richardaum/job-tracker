---
status: pending
title: Create `SalaryEmbedded` class
type: backend
complexity: low
dependencies: []
---

# Task 01: Create `SalaryEmbedded` class

## Overview

Create the `SalaryEmbedded` TypeORM embedded class that consolidates 4 salary fields (`minCents`, `maxCents`, `currency`, `period`) with co-located `class-validator` decorators and cross-field validation. This becomes the single source of truth for salary data shape throughout the API.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST define 4 `@Column()` fields: `minCents` (integer, nullable), `maxCents` (integer, nullable), `currency` (text, nullable), `period` (enum, nullable)
- MUST apply `class-validator` decorators (`@IsOptional`, `@IsInt`, `@Min(0)`, `@Matches` for ISO 4217 currency)
- MUST implement `validate()` method for cross-field rules: if any amount set → requires currency + period; min ≤ max
- MUST implement `normalize()` method: trim whitespace, uppercase currency
- MUST follow existing embedded patterns (`AsyncMetadataEmbedded`, `ConversionMetadataEmbedded`)
- File MUST live at `apps/api/src/database/embeddeds/salary.embedded.ts`
</requirements>

## Subtasks

- [ ] 1.1 Review existing embeddeds (`AsyncMetadataEmbedded`, `ConversionMetadataEmbedded`) for conventions
- [ ] 1.2 Create `SalaryEmbedded` class with 4 `@Column()` decorators matching DB column names
- [ ] 1.3 Apply `class-validator` decorators on each field
- [ ] 1.4 Implement `validate()` with cross-field rules
- [ ] 1.5 Implement `normalize()` for trimming/uppercasing

## Implementation Details

Create `apps/api/src/database/embeddeds/salary.embedded.ts`. See TechSpec § Core Interfaces for field signatures.

### Relevant Files

- `apps/api/src/database/embeddeds/async-metadata.embedded.ts` — existing embedded pattern to follow
- `apps/api/src/database/embeddeds/conversion-metadata.embedded.ts` — another embedded example
- `apps/api/src/domains/jobs/salary/salary-period.enum.ts` — `SalaryPeriodEnum` used for the `period` field
- `apps/api/src/database/entities/job.entity.ts` — current flat salary columns to understand existing structure

### Dependent Files

- `apps/api/src/database/entities/job.entity.ts` — will import and use `SalaryEmbedded` (task_03)
- `apps/api/src/domains/jobs/salary/salary.service.ts` — will import and return `SalaryEmbedded` (task_04)
- `apps/api/src/database/repositories/jobs.repository.ts` — DTOs will use `SalaryEmbedded` (task_05)
- `apps/api/src/domains/jobs/jobs.service.ts` — will consume `SalaryEmbedded` (task_05)
- `apps/api/src/domains/drafts/extraction/normalization/draft-extraction-normalization.service.ts` — will use `SalaryEmbedded` (task_06)
- `apps/api/src/domains/jobs/applications/summary/summary.service.ts` — will access `SalaryEmbedded` fields (task_06)

### Related ADRs

- [ADR-001: SalaryEmbedded with validation via class-validator](../adrs/adr-001.md) — Single source of truth for salary shape and validation

## Deliverables

- `apps/api/src/database/embeddeds/salary.embedded.ts` with `SalaryEmbedded` class
- Unit tests for `SalaryEmbedded.validate()` and `normalize()` **(REQUIRED)**
- Unit tests embedded in task_07 (dedicated test task)

## Tests

- Unit tests (in `salary.embedded.spec.ts`, created in task_07):
  - [ ] `validate()` — all fields null → passes (empty salary is valid)
  - [ ] `validate()` — amount set without currency → throws
  - [ ] `validate()` — amount set without period → throws
  - [ ] `validate()` — currency not valid ISO 4217 → throws
  - [ ] `validate()` — negative cents → throws
  - [ ] `validate()` — minCents > maxCents → throws
  - [ ] `validate()` — valid salary with all fields → passes
  - [ ] `normalize()` — lowercase currency → uppercase
  - [ ] `normalize()` — currency with whitespace → trimmed
  - [ ] `normalize()` — null currency → stays null
  - [ ] `normalize()` — all fields null → no-op
- Test coverage target: >=80%

## Success Criteria

- `SalaryEmbedded` compiles without errors
- `pnpm --filter @job-tracker/api exec tsc --noEmit` passes on the new file
- All tests passing
- Test coverage >=80%
