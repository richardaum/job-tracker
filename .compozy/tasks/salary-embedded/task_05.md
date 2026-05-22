---
status: pending
title: Update `JobsRepository` + `JobsService`
type: backend
complexity: high
dependencies:
  - task_01
  - task_02
  - task_03
  - task_04
---

# Task 05: Update `JobsRepository` + `JobsService`

## Overview

Update repository DTOs (`CreateJobRepoDto`, `UpdateJobRepoDto`) to use `SalaryEmbedded` instead of flat salary keys, and refactor `JobsService` to consume the nested `salary` input shape and pass `SalaryEmbedded` to the repository. This is the central integration point where the embedded flows from input through service to persistence.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST update `CreateJobRepoDto` to drop 4 flat salary keys from `Pick<>` and add `salary?: SalaryEmbedded`
- MUST update `UpdateJobRepoDto` with the same change
- MUST update `CreateDto` (service-level) to use `salary?: JobSalaryInput` instead of 4 flat fields
- MUST update `UpdateDto` similarly
- MUST update `create()` method to spread `salary?: SalaryEmbedded` instead of 4 separate salary fields
- MUST update `processDraftConversion()` to handle `SalaryEmbedded` instead of flat salary normalization
- MUST update any internal mappings that read/write flat salary fields on entities
- MUST NOT change the behavior of create, update, or draft conversion flows
</requirements>

## Subtasks

- [ ] 5.1 Update `CreateJobRepoDto` type — remove 4 flat salary keys, add `salary?: SalaryEmbedded`
- [ ] 5.2 Update `UpdateJobRepoDto` type — same change
- [ ] 5.3 Update `CreateDto` and `UpdateDto` in `JobsService` to use `salary?: JobSalaryInput`
- [ ] 5.4 Refactor `create()` to call `SalaryService.getCreateSalary()` and pass `salary` embedded
- [ ] 5.5 Refactor `update()` to call `SalaryService.getUpdateSalary()` and pass `salary` embedded
- [ ] 5.6 Update `processDraftConversion()` to handle `SalaryEmbedded` from normalized extraction

## Implementation Details

See TechSpec § Data Models for the `CreateJobRepoDto` before/after and `CreateDto` structure.

Key integration points:

- `JobsService.create()` currently spreads `...salaryColumns` from `SalaryService.getCreateSalary()`. After refactor, it spreads `salary: embedded`.
- `JobsService.update()` calls `SalaryService.getUpdateSalary()` → now receives `SalaryEmbedded | null`.
- `processDraftConversion()` receives `NormalizedDraftExtraction` which will contain `salary: SalaryEmbedded` (from task_06).

### Relevant Files

- `apps/api/src/database/repositories/jobs.repository.ts` — repo DTOs + repository methods
- `apps/api/src/domains/jobs/jobs.service.ts` — main service to refactor
- `apps/api/src/domains/jobs/salary/salary.service.ts` — dependency (refactored in task_04)
- `apps/api/src/database/embeddeds/salary.embedded.ts` — `SalaryEmbedded` class (task_01)
- `apps/api/src/domains/jobs/salary/salary.type.ts` — `JobSalaryType` for type references
- `apps/api/src/domains/jobs/applications/inputs/create-job.input.ts` — input shape (updated in task_02)
- `apps/api/src/domains/jobs/applications/inputs/update-job.input.ts` — input shape (updated in task_02)

### Dependent Files

- `apps/api/src/domains/jobs/jobs.resolver.ts` — resolver calls `JobsService` with updated DTOs
- `apps/api/src/domains/jobs/jobs.service.spec.ts` — tests update mock factories (task_07)
- `apps/api/src/domains/jobs/jobs.resolver.spec.ts` — tests update mock factories (task_07)
- `apps/api/src/domains/drafts/extraction/normalization/draft-extraction-normalization.service.ts` — provides normalized salary (task_06)

### Related ADRs

- [ADR-002: API Surface Changes for Salary Embedded](../adrs/adr-002.md) — Embedded in repo DTOs decision

## Deliverables

- Updated `CreateJobRepoDto` and `UpdateJobRepoDto`
- Updated `CreateDto` and `UpdateDto` in `JobsService`
- Refactored `create()`, `update()`, and `processDraftConversion()` methods
- Updated repository calls to pass `SalaryEmbedded`
- Unit tests for all changed methods **(REQUIRED)**

## Tests

- Unit tests (updated in task_07):
  - [ ] `create()` with salary input → `SalaryService.getCreateSalary()` called, `SalaryEmbedded` persisted
  - [ ] `create()` without salary → `salary: null` persisted
  - [ ] `update()` with partial salary → merge logic preserves unspecified fields
  - [ ] `update()` with null salary field → no salary update applied
  - [ ] `processDraftConversion()` receives `NormalizedDraftExtraction` with `salary: SalaryEmbedded`
  - [ ] Repository `createJob()` called with `salary` embedded, not flat fields
- Test coverage target: >=80%

## Success Criteria

- No references to `salaryMinCents`, `salaryMaxCents`, `salaryCurrency`, `salaryPeriod` in `JobsService`
- No references to flat salary keys in `JobsRepository`
- All existing service and repository tests pass with updated mocks
- `pnpm --filter @job-tracker/api exec tsc --noEmit` passes
