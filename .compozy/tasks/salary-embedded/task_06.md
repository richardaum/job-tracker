---
status: pending
title: Update `DraftExtractionNormalizationService` + `SummaryService` + their tests
type: backend
complexity: high
dependencies:
  - task_01
  - task_03
---

# Task 06: Update `DraftExtractionNormalizationService` + `SummaryService`

## Overview

Update consumer services that access salary fields: `DraftExtractionNormalizationService` must produce `SalaryEmbedded` instead of 4 flat salary fields, and `SummaryService` must access `app.salary?.minCents` instead of `app.salaryMinCents`. These are the two remaining non-test consumers of the flat salary columns.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST update `NormalizedDraftExtraction` type to use `salary: SalaryEmbedded` instead of 4 flat fields
- MUST update `normalizeDraftSalaryFields()` to construct and return a `SalaryEmbedded` instance
- MUST update all field accessors in `SummaryService` from `app.salaryMinCents` to `app.salary?.minCents`
- MUST update all field accessors from `app.salaryMaxCents` to `app.salary?.maxCents`
- MUST update `app.salaryCurrency` to `app.salary?.currency` and `app.salaryPeriod` to `app.salary?.period`
- MUST handle nullable salary — all accessors must use optional chaining
- MUST NOT change the normalization or summarization logic
- MUST create `draft-extraction-normalization.service.spec.ts` — new test file (zero tests exist today)
- MUST create `summary.service.spec.ts` — new test file (zero tests exist today)
</requirements>

## Subtasks

- [ ] 6.1 Update `NormalizedDraftExtraction` type — replace flat salary with `salary: SalaryEmbedded`
- [ ] 6.2 Update `normalizeDraftSalaryFields()` to construct `SalaryEmbedded`
- [ ] 6.3 Update all salary field accessors in `SummaryService`
- [ ] 6.4 Create `draft-extraction-normalization.service.spec.ts` with salary normalization tests
- [ ] 6.5 Create `summary.service.spec.ts` with salary text generation tests
- [ ] 6.6 Verify both services compile and all references to flat salary fields are removed
- [ ] 6.7 Run tests for both new spec files

## Implementation Details

See TechSpec § Data Models for the updated `NormalizedDraftExtraction` type.

### Relevant Files

- `apps/api/src/domains/drafts/extraction/normalization/draft-extraction-normalization.service.ts` — service + type to update
- `apps/api/src/domains/jobs/applications/summary/summary.service.ts` — field accessors to update
- `apps/api/src/database/embeddeds/salary.embedded.ts` — `SalaryEmbedded` class (task_01)
- `apps/api/src/database/entities/job.entity.ts` — entity shape (updated in task_03)
- `apps/api/src/domains/drafts/extraction/draft-extraction.schema.ts` — Zod schema (already nested salary, no change needed)

### Dependent Files

- `apps/api/src/domains/jobs/jobs.service.ts` — `processDraftConversion()` receives normalized extraction (task_05)
- Test files for both services (task_07)

### Related ADRs

- [ADR-001: SalaryEmbedded with validation via class-validator](../adrs/adr-001.md) — Single source of truth for salary shape

## Deliverables

- Updated `NormalizedDraftExtraction` type
- Updated `normalizeDraftSalaryFields()` method
- Updated `SummaryService` with optional chaining accessors
- `draft-extraction-normalization.service.spec.ts` — new test file **(REQUIRED)**
- `summary.service.spec.ts` — new test file **(REQUIRED)**

## Tests

- `draft-extraction-normalization.service.spec.ts` (new):
  - [ ] `normalizeDraftSalaryFields()` returns `SalaryEmbedded` with correct min/max/currency/period
  - [ ] `normalizeDraftSalaryFields()` converts major units to cents (salary × 100)
  - [ ] `normalizeDraftSalaryFields()` handles missing salary object → fallback to flat fields
  - [ ] `normalizeDraftSalaryFields()` handles nulls in all salary fields → `SalaryEmbedded` with nulls
  - [ ] `normalizeDraftSalaryFields()` validates currency via `SalaryEmbedded.validate()`
  - [ ] `normalizeExtraction()` produces `NormalizedDraftExtraction` with `salary: SalaryEmbedded`
- `summary.service.spec.ts` (new):
  - [ ] `doGenerate()` with `salary` null → salary text omitted from context
  - [ ] `doGenerate()` with `salary.minCents` set → salary text includes min value
  - [ ] `doGenerate()` with salary populated → all 4 fields reflected in salary text
  - [ ] `doGenerate()` with salary partial (only min, no max) → text includes only set fields
  - [ ] `doGenerate()` failure → marks metadata as FAILED with error message
- Test coverage target: >=80%

## Success Criteria

- No references to flat salary fields in either service
- Draft normalization produces `SalaryEmbedded` instead of flat object
- Summary computation unchanged when salary is null or populated
- `pnpm --filter @job-tracker/api exec tsc --noEmit` passes
