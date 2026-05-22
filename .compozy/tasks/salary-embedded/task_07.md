---
status: pending
title: Update all test/spec files
type: backend
complexity: medium
dependencies:
  - task_01
  - task_02
  - task_03
  - task_04
  - task_05
  - task_06
---

# Task 07: Update all test/spec files

## Overview

Update all existing test files to use the new `SalaryEmbedded` shape, create the new `salary.embedded.spec.ts` for embedded validation tests, and update mock factories to use `salary: null` / `salary: SalaryEmbedded` instead of 4 flat null fields. Ensures full test coverage of the refactored salary domain.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `salary.embedded.spec.ts` with comprehensive tests for `validate()` and `normalize()`
- MUST update `salary.service.spec.ts` — mock factories and assertions to use `SalaryEmbedded`
- MUST update `jobs.service.spec.ts` — mock factories, DTO construction, salary field assertions
- MUST update `jobs.resolver.spec.ts` — mock entities, input shapes, AND add GraphQL salary field queries
- MUST add resolver tests that query `salary { minCents maxCents currency period }` to verify nullable contract
- MUST add resolver tests for `createJob`/`updateJob` with nested `salary` input
- MUST verify all existing test assertions pass with updated mock shapes
- MUST achieve >=80% coverage on all modified files
- MUST NOT change test logic — only update data shapes to match new contracts, plus add salary-specific assertions
</requirements>

## Subtasks

- [ ] 7.1 Create `salary.embedded.spec.ts` with validate/normalize tests (test cases from task_01)
- [ ] 7.2 Update `salary.service.spec.ts` — return types, assertions, mock inputs
- [ ] 7.3 Update `jobs.service.spec.ts` — mock factories, `CreateDto`/`UpdateDto` shapes
- [ ] 7.4 Update `jobs.resolver.spec.ts` — mock entities, input shapes, add salary query tests
- [ ] 7.5 Add salary field query/mutation assertions to resolver spec (nullable output, nested input)
- [ ] 7.6 Run `pnpm --filter @job-tracker/api test` and fix all failures
- [ ] 7.7 Verify coverage >=80% on salary embedded, salary service, jobs service

## Implementation Details

See TechSpec § Testing Approach for test case specifications. Mock factories like `makeJob()` and `mockJob` currently spread 4 flat salary nulls — update to `salary: null`.

### Relevant Files

- `apps/api/src/domains/jobs/salary/salary.service.spec.ts` — existing tests to update
- `apps/api/src/domains/jobs/jobs.service.spec.ts` — existing tests to update
- `apps/api/src/domains/jobs/jobs.resolver.spec.ts` — existing tests to update
- `apps/api/src/database/embeddeds/salary.embedded.ts` — class under test (new spec) (task_01)
- `apps/api/src/domains/jobs/salary/salary.service.ts` — refactored in task_04
- `apps/api/src/domains/jobs/jobs.service.ts` — refactored in task_05

### Dependent Files

- None — this is the final backend task before codegen

### Related ADRs

- [ADR-001: SalaryEmbedded with validation via class-validator](../adrs/adr-001.md) — Test cases for embedded validation

## Deliverables

- `salary.embedded.spec.ts` — new test file with 11+ test cases
- Updated `salary.service.spec.ts` — assertions aligned with `SalaryEmbedded`
- Updated `jobs.service.spec.ts` — mock factories updated
- Updated `jobs.resolver.spec.ts` — mock entities updated
- All tests passing with >=80% coverage

## Tests

- `salary.embedded.spec.ts`:
  - [ ] `validate()` — all null → passes
  - [ ] `validate()` — amount no currency → throws
  - [ ] `validate()` — amount no period → throws
  - [ ] `validate()` — invalid currency format → throws
  - [ ] `validate()` — negative cents → throws
  - [ ] `validate()` — min > max → throws
  - [ ] `validate()` — valid complete salary → passes
  - [ ] `normalize()` — lowercase currency → uppercase
  - [ ] `normalize()` — whitespace → trimmed
  - [ ] `normalize()` — null currency → null
  - [ ] `normalize()` — all null → no-op
- Updated existing specs:
  - [ ] `salary.service.spec.ts` — all tests pass with `SalaryEmbedded` return types
  - [ ] `jobs.service.spec.ts` — all tests pass with nested salary
  - [ ] `jobs.resolver.spec.ts` — all tests pass with nested salary input/output
  - [ ] `jobs resolver spec` — query `salary { minCents maxCents currency period }` returns null for unset salary
  - [ ] `jobs resolver spec` — query `salary { ... }` returns populated nested object when salary is set
  - [ ] `jobs resolver spec` — `createJob` mutation with nested `salary: { minCents: 100000, ... }` input
  - [ ] `jobs resolver spec` — `updateJob` mutation with nested `salary` input updates correctly
- Test coverage target: >=80%

## Success Criteria

- All 4 spec files run and pass
- Coverage >=80% on `salary.embedded.ts`, `salary.service.ts`, `jobs.service.ts`
- Zero type errors in test files
- No flat salary field references in any test file
