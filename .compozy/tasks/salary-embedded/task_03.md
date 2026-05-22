---
status: pending
title: Update `JobEntity` + remove `SalaryResolver` + cleanup schema
type: backend
complexity: medium
dependencies:
  - task_01
---

# Task 03: Update `JobEntity` + remove `SalaryResolver` + cleanup schema

## Overview

Replace the 4 flat `@Column()` declarations on `JobEntity` with a single `SalaryEmbedded` column, add `@Field` decorator for direct GraphQL exposure, delete the now-unnecessary `SalaryResolver`, and clean up the `SalaryColumns`/`SalaryInput` types from `salary.schema.ts`. Removes the flat→nested mapping layer per ADR-002.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST replace 4 flat `@Column()` declarations with `@Column(() => SalaryEmbedded, { prefix: "salary" })` on `JobEntity`
- MUST add `@Field(() => JobSalaryType, { nullable: true })` decorator on the `salary` property for GraphQL exposure
- MUST preserve column naming: prefix `salary` + field names → `salary_min_cents`, `salary_max_cents`, `salary_currency`, `salary_period`
- MUST NOT require a DB migration — TypeORM prefix produces identical column names
- MUST delete `SalaryResolver` (`salary/salary.resolver.ts`)
- MUST remove resolver registration from `SalaryModule`
- MUST remove `SalaryColumns` and `SalaryInput` types from `salary.schema.ts`
- MUST keep `SalaryPeriodEnum` and its GraphQL registration in `salary.schema.ts`
</requirements>

## Subtasks

- [ ] 3.1 Replace 4 flat `@Column` declarations on `JobEntity` with embedded
- [ ] 3.2 Add `@Field(() => JobSalaryType, { nullable: true })` on the `salary` property
- [ ] 3.3 Delete `salary/salary.resolver.ts` file
- [ ] 3.4 Remove `SalaryResolver` from `SalaryModule` providers/exports
- [ ] 3.5 Remove `SalaryColumns` and `SalaryInput` type definitions from `salary.schema.ts`
- [ ] 3.6 Verify `SalaryPeriodEnum` registration remains intact

## Implementation Details

See TechSpec § Data Models for the before/after of `JobEntity` and § Deleted Components for the list of removals.

### Relevant Files

- `apps/api/src/database/entities/job.entity.ts` — entity to modify
- `apps/api/src/database/embeddeds/salary.embedded.ts` — embedded class created in task_01
- `apps/api/src/domains/jobs/salary/salary.resolver.ts` — resolver to delete
- `apps/api/src/domains/jobs/salary/salary.module.ts` — module to update
- `apps/api/src/domains/jobs/salary/salary.schema.ts` — schema to clean up
- `apps/api/src/domains/jobs/salary/salary.type.ts` — `JobSalaryType` referenced in `@Field`

### Dependent Files

- `apps/api/src/domains/jobs/salary/salary.service.ts` — service must not import deleted resolver (task_04)
- `apps/api/src/domains/jobs/jobs.service.ts` — imports `SalaryColumns` via DTO, must adjust (task_05)
- `apps/api/src/domains/jobs/applications/summary/summary.service.ts` — accesses flat salary fields on entity (task_06)
- All spec files — mock factories use flat salary fields (task_07)

### Related ADRs

- [ADR-002: API Surface Changes for Salary Embedded](../adrs/adr-002.md) — Resolver removal + nullable salary decision

## Deliverables

- Updated `JobEntity` with embedded salary
- Deleted `SalaryResolver`
- Updated `SalaryModule`
- Cleaned up `salary.schema.ts`
- Unit tests verifying the column mapping **(REQUIRED)**

## Tests

- Integration tests (in existing entity tests, updated in task_07):
  - [ ] TypeORM generates correct column names (`salary_min_cents`, `salary_max_cents`, etc.)
  - [ ] `salary` field returns `null` when no salary data exists
  - [ ] `@Field` decorator correctly exposes `JobSalaryType` as nullable in schema
- Test coverage target: >=80%

## Success Criteria

- `JobEntity` has one `salary` embedded instead of 4 flat columns
- `SalaryResolver` file deleted
- No references to `SalaryColumns` or `SalaryInput` remain in the codebase
- `pnpm --filter @job-tracker/api exec tsc --noEmit` passes
- GraphQL schema shows `salary: JobSalary` (nullable) on `JobType`
