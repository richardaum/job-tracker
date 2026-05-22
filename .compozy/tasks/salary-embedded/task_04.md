---
status: pending
title: Refactor `SalaryService`
type: backend
complexity: medium
dependencies:
  - task_01
  - task_02
---

# Task 04: Refactor `SalaryService`

## Overview

Refactor `SalaryService` to return `SalaryEmbedded` instances instead of flat salary objects, and delegate all validation logic to `SalaryEmbedded.validate()` and `SalaryEmbedded.normalize()`. The service becomes a thin orchestration layer that constructs the embedded from input.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST change `getCreateSalary()` return type from flat object to `SalaryEmbedded`
- MUST change `getUpdateSalary()` return type to `SalaryEmbedded | null`
- MUST accept `JobSalaryInput` as input parameter type (from task_02)
- MUST delegate cross-field validation to `embedded.validate()` instead of `assertValidSalaryState()`
- MUST delegate normalization to `embedded.normalize()` instead of `rowAfterValidation()`
- MUST remove `assertValidSalaryState()` private method
- MUST remove `rowAfterValidation()` private method
- MUST NOT change the merge behavior for update (partial salary updates)
</requirements>

## Subtasks

- [ ] 4.1 Update `getCreateSalary` signature to accept `JobSalaryInput`, return `SalaryEmbedded`
- [ ] 4.2 Update `getUpdateSalary` signature to accept current `Job` (or flat fields) + `JobSalaryInput`, return `SalaryEmbedded | null`
- [ ] 4.3 Delegate validation to `embedded.validate()` — remove `assertValidSalaryState()`
- [ ] 4.4 Delegate normalization to `embedded.normalize()` — remove `rowAfterValidation()`
- [ ] 4.5 Update all internal consumers within `JobsService` that call `SalaryService` (done in task_05)

## Implementation Details

See TechSpec § Core Interfaces for the refactored `SalaryService` signatures. The key change: methods accept `JobSalaryInput`, construct a `SalaryEmbedded`, call `.normalize()`, call `.validate()`, and return the embedded.

### Relevant Files

- `apps/api/src/domains/jobs/salary/salary.service.ts` — main file to refactor
- `apps/api/src/database/embeddeds/salary.embedded.ts` — `SalaryEmbedded` class (task_01)
- `apps/api/src/domains/jobs/salary/salary.schema.ts` — may still contain types referenced by service (cleaned in task_03)
- `apps/api/src/domains/jobs/salary/salary.service.spec.ts` — tests to update (task_07)

### Dependent Files

- `apps/api/src/domains/jobs/jobs.service.ts` — calls `SalaryService.getCreateSalary()` and `getUpdateSalary()` (task_05)

### Related ADRs

- [ADR-001: SalaryEmbedded with validation via class-validator](../adrs/adr-001.md) — Delegated validation decision

## Deliverables

- Refactored `SalaryService` with `SalaryEmbedded` return types
- Removed `assertValidSalaryState()` and `rowAfterValidation()` methods
- Unit tests updated to reflect new return types **(REQUIRED)**

## Tests

- Unit tests (updated in task_07):
  - [ ] `getCreateSalary` returns `SalaryEmbedded` instance with correct field values
  - [ ] `getCreateSalary` with empty input returns `SalaryEmbedded` with all-null fields
  - [ ] `getCreateSalary` with invalid currency throws from `validate()`
  - [ ] `getUpdateSalary` partial merge updates only provided fields, preserves others
  - [ ] `getUpdateSalary` with null input returns null
  - [ ] `getUpdateSalary` normalizes currency via embedded `normalize()`
  - [ ] Validation error messages unchanged from current behavior
- Test coverage target: >=80%

## Success Criteria

- `SalaryService` line count reduced (validation moved to embedded)
- All existing `SalaryService` test assertions still pass
- `pnpm --filter @job-tracker/api exec tsc --noEmit` passes
- `SalaryService` no longer contains inline validation logic
