---
status: pending
title: Create `JobSalaryInput` + update GraphQL inputs
type: backend
complexity: medium
dependencies: []
---

# Task 02: Create `JobSalaryInput` + update GraphQL inputs

## Overview

Create the `JobSalaryInput` GraphQL `@InputType` and replace the 4 flat `@Field` decorators on `CreateJobInput` and `UpdateJobInput` with a single nested `salary?: JobSalaryInput` field. This aligns GraphQL input shape with the embedded entity structure per ADR-002.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `JobSalaryInput` as a `@InputType("JobSalary")` class with 4 nullable fields: `minCents`, `maxCents`, `currency`, `period`
- MUST mirror the `JobSalaryType` output shape for input/output symmetry
- MUST replace 4 flat `salaryMinCents`, `salaryMaxCents`, `salaryCurrency`, `salaryPeriod` `@Field` decorators on `CreateJobInput` with `salary?: JobSalaryInput`
- MUST apply the same replacement on `UpdateJobInput`
- MUST NOT change validation logic — only field grouping
- MUST NOT break existing GraphQL usage of input types in resolvers
</requirements>

## Subtasks

- [ ] 2.1 Create `JobSalaryInput` InputType class in the salary domain
- [ ] 2.2 Update `CreateJobInput` — replace 4 flat salary fields with nested `salary`
- [ ] 2.3 Update `UpdateJobInput` — replace 4 flat salary fields with nested `salary`
- [ ] 2.4 Verify no other GraphQL types reference the flat salary input fields directly

## Implementation Details

Create `JobSalaryInput` in `apps/api/src/domains/jobs/salary/`. Apply `@InputType("JobSalary")` with the 4 fields. See TechSpec § Core Interfaces for the exact shape.

Update `CreateJobInput` and `UpdateJobInput` types. See TechSpec § Data Models for before/after.

### Relevant Files

- `apps/api/src/domains/jobs/salary/salary.type.ts` — `JobSalaryType` output type to mirror in input
- `apps/api/src/domains/jobs/salary/salary-period.enum.ts` — `SalaryPeriodEnum` for period field type
- `apps/api/src/domains/jobs/applications/inputs/create-job.input.ts` — `CreateJobInput` to modify
- `apps/api/src/domains/jobs/applications/inputs/update-job.input.ts` — `UpdateJobInput` to modify

### Dependent Files

- `apps/api/src/domains/jobs/salary/salary.service.ts` — will use `JobSalaryInput` in method signatures (task_04)
- `apps/api/src/domains/jobs/jobs.service.ts` — `CreateDto`/`UpdateDto` will use `JobSalaryInput` (task_05)
- `apps/api/src/domains/jobs/jobs.resolver.ts` — resolver passes input to service (indirectly affected)
- `apps/web/src/gql/` — codegen output will reflect new input shape (task_08)

### Related ADRs

- [ADR-002: API Surface Changes for Salary Embedded](../adrs/adr-002.md) — Nested GraphQL inputs decision

## Deliverables

- `JobSalaryInput` InputType class
- Updated `CreateJobInput` with nested `salary`
- Updated `UpdateJobInput` with nested `salary`
- Unit tests verifying nested input validation **(REQUIRED)**

## Tests

- Integration tests (in existing resolver tests, updated in task_07):
  - [ ] `createJob` mutation accepts nested `salary` input
  - [ ] `updateJob` mutation accepts nested `salary` input
  - [ ] `createJob` with no salary remains valid (nullable)
  - [ ] `updateJob` partial salary merge works correctly
- Test coverage target: >=80%

## Success Criteria

- `CreateJobInput` and `UpdateJobInput` have a single `salary` field instead of 4 flat fields
- `pnpm --filter @job-tracker/api exec tsc --noEmit` passes
- GraphQL schema shows nested `JobSalary` input type
- Existing resolver tests still pass (updated in task_07)
