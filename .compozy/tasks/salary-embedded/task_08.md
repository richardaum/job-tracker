---
status: pending
title: Codegen + frontend + final validation
type: frontend
complexity: medium
dependencies:
  - task_01
  - task_02
  - task_03
  - task_04
  - task_05
  - task_06
  - task_07
---

# Task 08: Codegen + frontend + final validation

## Overview

Regenerate the GraphQL schema and Apollo codegen output to reflect the nested `JobSalaryInput` and nullable `JobSalary` type, update frontend components that consume salary data to use optional chaining and nested input shapes, then run the full validation pipeline (typecheck, lint, test, knip).

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST restart API to regenerate `schema.gql` with nested input types and nullable output
- MUST run `pnpm --filter @job-tracker/web run codegen` to regenerate Apollo hooks and types
- MUST update frontend components that read `salary.minCents` to use optional chaining (`salary?.minCents`)
- MUST update mutation calls that pass 4 flat salary args to pass nested `salary: { ... }` object
- MUST update `salaryFormat.ts` utility if it reads flat salary fields directly
- MUST run `typecheck`, `lint`, `test` across all affected packages
- MUST run `knip` to detect dead code introduced by the refactor
- MUST NOT change any UI behavior or user-facing logic
</requirements>

## Subtasks

- [ ] 8.1 Restart API with PM2 to regenerate `schema.gql`
- [ ] 8.2 Run codegen: `pnpm --filter @job-tracker/web run codegen`
- [ ] 8.3 Review codegen output for breaking type changes
- [ ] 8.4 Update all frontend components that access `job.salary` (add optional chaining)
- [ ] 8.5 Update mutation calls to use nested `salary` input
- [ ] 8.6 Run `pnpm typecheck` — fix any remaining type errors
- [ ] 8.7 Run `pnpm lint` and `pnpm format`
- [ ] 8.8 Run `pnpm test` across all packages
- [ ] 8.9 Run `pnpm knip` — remove any dead code found
- [ ] 8.10 Verify PM2 logs for API errors

## Implementation Details

See TechSpec § Impact Analysis for the frontend impact and § API Endpoints for the GraphQL contract changes.

The primary frontend changes:

- Output: `job.salary` becomes nullable — all accessors need `?.` (optional chaining)
- Input: `createJob`/`updateJob` mutations use nested `{ minCents, maxCents, currency, period }` instead of 4 flat args
- Generated types in `apps/web/src/gql/` will have new `JobSalaryInput` and nullable `JobSalary`

### Relevant Files

- `apps/api/src/schema.gql` — regenerated schema (verify after PM2 restart)
- `apps/web/codegen.ts` — codegen configuration
- `apps/web/src/gql/` — generated hooks and types (will be regenerated)
- `apps/web/src/modules/jobs/` — components that use salary fields
- `apps/web/src/modules/applications/` — application detail/components using salary
- `apps/web/src/modules/jobs/salaryFormat.ts` — salary formatting utility

### Dependent Files

- None — final task

### Related ADRs

- [ADR-002: API Surface Changes for Salary Embedded](../adrs/adr-002.md) — Nullable salary + nested inputs decision

## Deliverables

- Regenerated `schema.gql` with nested input types
- Regenerated Apollo hooks and types in `apps/web/src/gql/`
- Updated frontend components with optional chaining
- Updated mutation calls with nested salary input
- All validation commands passing (typecheck, lint, test, knip)

## Tests

- Integration tests:
  - [ ] `createJob` mutation with nested `salary` input — job created with salary
  - [ ] `updateJob` mutation with nested `salary` input — salary updated
  - [ ] `jobs` query returns `null` salary when not set
  - [ ] `jobs` query returns populated `salary` object when set
  - [ ] Frontend renders salary correctly with null safe accessors
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- `schema.gql` shows `JobSalary` (nullable) and nested `JobSalary` input
- All frontend components render without salary-related errors
- `pnpm typecheck` passes with zero errors
- `pnpm lint` passes with zero warnings
- `pnpm test` passes across all packages
- `pnpm knip` reports no dead code
- PM2 API logs show no new errors
