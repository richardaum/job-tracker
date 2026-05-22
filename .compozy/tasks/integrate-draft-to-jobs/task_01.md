---
status: completed
title: Create Baseline Tests for Affected Areas
type: test
complexity: high
dependencies: []
---

# Task 01: Create Baseline Tests for Affected Areas

> **Verification (2026-05-22):** `pnpm --filter api lint` and `pnpm --filter api test` — PASS (254 tests after B1 remediation). Coverage (Vitest `--coverage.provider=v8`, filtered): `draft-extraction-normalization.service.ts` lines **85.71%**, `summary.service.ts` **86.53%**, `jobs.repository.ts` **98.09%**, `match-analysis.service.ts` **80.7%** — all ≥80% for targeted sources.
>
> **Phase B1 (review remediation):** `findLatestStageSummariesByJobIds` fixture order aligned with DESC `COALESCE(schedule_at, created_at)`; Logger spy restored; redundant `jobs.service.spec` mocks removed; Implementation Details wording updated for Vitest.

## Overview

Before any implementation changes, create (or expand) unit tests for services and repositories that will be modified, moved, or removed by the Draft→Jobs integration. This establishes a regression safety net. The focus is on currently untested code paths — particularly `DraftExtractionNormalizationService` (0 tests), `SummaryService` (0 tests), `JobsRepository` (no unit spec, only integration), and gaps in `MatchAnalysisService` and `JobsService` tests.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create unit tests for `DraftExtractionNormalizationService` covering all normalization paths (valid extraction, missing fields, malformed salary, null htmlContent)
- MUST create unit tests for `SummaryService` covering generate, summaryMetadata status transitions, and edge cases (job without description, job with htmlContent, AI failure)
- MUST create unit tests for `JobsRepository` covering findOne, findAllByUserId with filters, create with embedded salary, and atomic update operations
- MUST expand `match-analysis.service.spec.ts` to cover `generateForDraft` with htmlContent source and `processMatchAnalysis` with draftJobId dispatch
- MUST verify `jobs.service.spec.ts` covers current `createJobWithAI` and `processDraftConversion` paths; add tests for any uncovered branches
- SHOULD run `pnpm --filter api test` after each new test file to confirm tests pass
- SHOULD target >=80% coverage for each new test file
</requirements>

## Subtasks

- [x] 1.1 Create `draft-extraction-normalization.service.spec.ts` — test normalization of AI extraction output (title, company, description, salary, tags, location, workRegion)
- [x] 1.2 Create `summary.service.spec.ts` — test async summary generation with mocked AI, verify summaryMetadata transitions (PROCESSING → COMPLETED/FAILED)
- [x] 1.3 Create `jobs.repository.spec.ts` — test CRUD operations, filtering, atomic updates, embedded salary persistence
- [x] 1.4 Expand `match-analysis.service.spec.ts` — add tests for `generateForDraft` (htmlContent input) and `processMatchAnalysis` (draftJobId source dispatch)
- [x] 1.5 Review and expand `jobs.service.spec.ts` — verify coverage of `createJobWithAI` (emits events, sets PROCESSING status) and `processDraftConversion` (extraction success, extraction failure, match transfer)

## Implementation Details

Spec files follow this repo’s **Vitest** setup: mocked TypeORM repos / query builders (`vi.fn()`), service construction with explicit deps where needed (`new Service(...)` rather than full `Test.createTestingModule`), and optional `vi.spyOn` for cross-cutting concerns — mirroring patterns in existing `jobs.service.spec.ts`-style tests.

### Relevant Files

- `apps/api/src/domains/draft-jobs/ai/draft-extraction-normalization.service.ts` — 0 tests, will be moved to `jobs/ai/` in task_06; must normalize AI output (title, company, description, salary, tags, location, workRegion)
- `apps/api/src/domains/jobs/summary/summary.service.ts` — 0 tests, accesses `job.description`, `job.htmlContent`, `job.summaryMetadata`; will need null-guards post nullable title
- `apps/api/src/domains/jobs/jobs.repository.ts` — 492 lines, no unit spec (only integration test); methods include `create`, `update`, `patchSummaryMetadata`, `findAllByUserId`
- `apps/api/src/domains/match-analysis/match-analysis.service.spec.ts` — existing tests for `generate()` but needs coverage for `generateForDraft()` and `processMatchAnalysis()` draft dispatch
- `apps/api/src/domains/jobs/jobs.service.spec.ts` — existing tests for CRUD + stage events; verify `createJobWithAI` and `processDraftConversion` coverage
- `apps/api/src/database/entities/job.entity.ts` — source of truth for JobEntity fields referenced in tests
- `apps/api/src/database/entities/draft-job.entity.ts` — source of truth for DraftJobEntity fields referenced in tests
- `apps/api/src/database/embeddeds/async-metadata.embedded.ts` — AsyncMetadataEmbedded used by summaryMetadata and fillMetadata
- `apps/api/src/domains/jobs/salary/salary.service.spec.ts` — reference pattern for mocking SalaryEmbedded in tests

### Dependent Files

- `apps/api/src/domains/jobs/jobs.service.ts` — `createJobWithAI`, `processDraftConversion` will be modified in task_08/task_09; tests created here protect against regressions
- `apps/api/src/domains/match-analysis/match-analysis.service.ts` — `generateForDraft`, `processMatchAnalysis` will be unified in task_07; tests created here protect current behavior
- `apps/api/src/domains/jobs/jobs.repository.ts` — will gain `updateFillMetadata` in task_08; baseline tests ensure existing methods are covered first

### Related ADRs

- [ADR-001: Full Merge — Draft as Job Stage](../adrs/adr-001.md) — Context for why these tests matter: entire draft codebase will be deleted
- [ADR-002: Two-Phase Fill](../adrs/adr-002.md) — Tests must cover the current single-phase conversion before it becomes two-phase
- [ADR-004: Async Fill Tracking](../adrs/adr-004.md) — Tests for summaryMetadata pattern will inform fillMetadata tests in task_08

## Deliverables

- `apps/api/src/domains/draft-jobs/ai/draft-extraction-normalization.service.spec.ts` (new)
- `apps/api/src/domains/jobs/summary/summary.service.spec.ts` (new)
- `apps/api/src/domains/jobs/jobs.repository.spec.ts` (new)
- Updated `apps/api/src/domains/match-analysis/match-analysis.service.spec.ts` (expanded)
- Updated `apps/api/src/domains/jobs/jobs.service.spec.ts` (expanded if gaps found)
- Unit tests with 80%+ coverage **(REQUIRED)**

## Tests

- Unit tests for DraftExtractionNormalizationService:
  - [x] Normalize valid extraction output — all fields populated (title, company, description, salary with min/max/currency/period, tags, location, workRegion)
  - [x] Normalize extraction with missing optional fields (no company, no salary, no tags) — returns partial NormalizedDraftExtraction
  - [x] Normalize extraction with malformed salary (negative values, missing currency) — handles gracefully
  - [ ] Normalize extraction with null/empty htmlContent input — _N/A at this layer (normalizer receives extraction record; empty `description` / non-string handled)_
  - [x] Normalize extraction with unicode / HTML-ish plain text descriptions
- Unit tests for SummaryService:
  - [x] Generate summary for job with description — mock AI returns text, verify summaryMetadata set to COMPLETED
  - [ ] Generate summary for job with htmlContent but no description — _deferred until `Job.htmlContent` lands (schema task); baseline documented in spec_
  - [x] Generate summary when AI call fails — verify summaryMetadata set to FAILED with error
  - [x] PROCESSING duplicate guard — silent no-op (locked in tests)
  - [x] Job with empty description — prompt omits Description block; completes when AI succeeds
- Unit tests for JobsRepository:
  - [x] findOneById loads `company` relation
  - [ ] findAll quick filter trio INCOMING / ACTIVE / DRAFT — _INCOMING+ACTIVE(+NEW, APPLIED, DUPLICATED); \*\*`DRAFT` absent from `ApplicationQuickFilterEnum` until migration task asserts this_
  - [x] create persists salary\_\* scalars (`sourceRunId` stripped from persisted `draftJobId`)
  - [x] update merges partial dto
  - [x] `updateSummaryMetadata` optimistic paths (expected PROCESSING vs `NULL`)
- Unit tests for MatchAnalysisService (expanded):
  - [x] `generateForDraft` happy path emits `draftJobId` source
  - [x] `generateForDraft` empty html throws
  - [x] `processMatchAnalysis` draft path uses plain text from html
  - [x] `processMatchAnalysis` job path uses TipTap description JSON substring
  - Additional: missing job/draft, empty source early exit, stale `resumeId`
- Unit tests for JobsService (expanded):
  - [x] `createJobWithAI` PROCESSING metadata + emits `DraftConversionStatusChanged` + `DraftConversionRequested`
  - [x] `processDraftConversion` extraction failure ⇒ FAILED conversion status + event
  - [x] Success path ⇒ `matchAnalysisRepo.update`; `JobCreated` when `affected === 0`
- Test coverage target: >=80% for listed service/repository sources (see verification note above).
- All tests must pass ✅

## Success Criteria

- All tests passing (`pnpm --filter api test`)
- Test coverage >=80% for each new file
- No test failures introduced in existing test files
- DraftExtractionNormalizationService, SummaryService, and JobsRepository each have >=80% unit test coverage
