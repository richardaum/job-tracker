---
status: pending
title: Remove DraftJobsModule and Legacy Entities
type: backend
complexity: medium
dependencies:
  - task_05
  - task_08
---

# Task 09: Remove DraftJobsModule and Legacy Entities

## Overview

Delete all draft-specific code that is now obsolete: the entire `DraftJobsModule`, `DraftJobEntity`, `ConversionMetadataEmbedded`, `DraftJobConversionStatusEnum`, `DraftJobEventBus`, `DraftJobsSseController`, `DraftConversionEventListener`, and all remaining draft-related files. Remove `createJobWithAI` and `processDraftConversion` from `JobsService` (they operated on the old draft→job conversion pipeline). Clean up remaining `draftJobId` and `DraftJobEntity` references across the codebase.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST delete entire `apps/api/src/domains/draft-jobs/` directory
- MUST delete `DraftJobEntity` from `apps/api/src/database/entities/`
- MUST delete `ConversionMetadataEmbedded` from `apps/api/src/database/embeddeds/`
- MUST delete `DraftJobConversionStatusEnum` (likely in conversion-metadata.embedded.ts)
- MUST remove `DraftJobsModule` import from `JobsModule`
- MUST remove `DraftJobsModule` import from `MatchAnalysisModule` (if still present)
- MUST remove `DraftConversionEventListener` from `JobsModule` providers
- MUST remove `createJobWithAI` and `processDraftConversion` methods from `JobsService`
- MUST remove `findDraftJobId` method from `JobsService`
- MUST remove all draft-related imports from `JobsService`
- MUST remove `DraftJobsModule` import from `AppModule` (if it was imported directly)
- MUST delete draft-related test files that are no longer valid: `draft-jobs.service.spec.ts`, `draft-applications.resolver.spec.ts`, `draft-jobs.repository.integration.ts`
- SHOULD verify `pnpm typecheck` passes for `apps/api` with zero errors
- SHOULD verify `pnpm lint` passes with no unused import warnings

</requirements>

## Subtasks

- [ ] 9.1 Delete `DraftJobsModule` directory (`domains/draft-jobs/`)
- [ ] 9.2 Delete `DraftJobEntity` and `ConversionMetadataEmbedded`
- [ ] 9.3 Remove `createJobWithAI` and `processDraftConversion` from `JobsService`
- [ ] 9.4 Remove `DraftConversionEventListener` and draft event imports from `JobsModule`
- [ ] 9.5 Remove draft imports from `JobsModule` and `MatchAnalysisModule`
- [ ] 9.6 Delete draft test files
- [ ] 9.7 Run typecheck + lint to verify zero remaining draft references

## Implementation Details

By this point, the draft domain should be dead code. The `DraftJobsResolver` was already emptied (task_05), extraction services moved (task_06), and fill logic replaced (task_08). Only `JobsService.createJobWithAI` and `processDraftConversion` remain as consumers of draft services — both are deleted here.

Deletion checklist:

- `apps/api/src/domains/draft-jobs/` — entire directory
- `apps/api/src/database/entities/draft-job.entity.ts` — entity file
- `apps/api/src/database/embeddeds/conversion-metadata.embedded.ts` — embedded file
- `apps/api/src/domains/jobs/job-conversion-event.listener.ts` — listener for draft conversion events
- Test files: `draft-jobs.service.spec.ts`, `draft-applications.resolver.spec.ts`, `draft-jobs.repository.integration.ts`

### Relevant Files

- `apps/api/src/domains/draft-jobs/draft-jobs.module.ts` — module to delete
- `apps/api/src/domains/draft-jobs/draft-jobs.service.ts` — service to delete
- `apps/api/src/domains/draft-jobs/draft-jobs.resolver.ts` — resolver to delete (already emptied in task_05)
- `apps/api/src/domains/draft-jobs/draft-jobs.repository.ts` — repository to delete
- `apps/api/src/domains/draft-jobs/draft-job.type.ts` — types to delete
- `apps/api/src/domains/draft-jobs/create-draft-job.input.ts` — input to delete
- `apps/api/src/domains/draft-jobs/update-draft-job.input.ts` — input to delete
- `apps/api/src/domains/draft-jobs/draft-job.events.ts` — events to delete
- `apps/api/src/domains/draft-jobs/draft-job-event.bus.ts` — event bus to delete
- `apps/api/src/domains/draft-jobs/draft-jobs-sse.controller.ts` — SSE controller to delete
- `apps/api/src/domains/draft-jobs/draft-jobs.service.spec.ts` — test to delete
- `apps/api/src/domains/draft-jobs/draft-applications.resolver.spec.ts` — test to delete
- `apps/api/src/domains/draft-jobs/draft-jobs.repository.integration.ts` — test to delete
- `apps/api/src/database/entities/draft-job.entity.ts` — entity to delete
- `apps/api/src/database/embeddeds/conversion-metadata.embedded.ts` — embedded to delete
- `apps/api/src/domains/jobs/jobs.service.ts` — remove `createJobWithAI`, `processDraftConversion`, `findDraftJobId`
- `apps/api/src/domains/jobs/jobs.module.ts` — remove draft imports and `DraftConversionEventListener`
- `apps/api/src/domains/jobs/job-conversion-event.listener.ts` — delete file
- `apps/api/src/domains/match-analysis/match-analysis.module.ts` — remove DraftJobsModule import
- `apps/api/src/app.module.ts` — remove DraftJobsModule import (verify if imported)

### Dependent Files

- `apps/api/src/domains/jobs/jobs.service.spec.ts` — tests for `createJobWithAI` and `processDraftConversion` removed
- `apps/api/src/domains/jobs/jobs.resolver.spec.ts` — tests for `createJobWithAI` mutation removed

### Related ADRs

- [ADR-001: Full Merge — Draft as Job Stage](../adrs/adr-001.md) — Complete elimination of draft entity and module

## Deliverables

- Deleted `DraftJobsModule` directory and all contained files
- Deleted `DraftJobEntity` and `ConversionMetadataEmbedded`
- Deleted `DraftConversionEventListener` and draft-related events
- Updated `JobsService` (no draft methods)
- Updated `JobsModule` and `MatchAnalysisModule` (no draft imports)
- Unit tests with 80%+ coverage **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] `JobsService` does not have `createJobWithAI` method
  - [ ] `JobsService` does not have `processDraftConversion` method
  - [ ] `JobsModule` compiles without `DraftJobsModule` or `DraftConversionEventListener`
  - [ ] `MatchAnalysisModule` compiles without `DraftJobsModule`
- Integration tests:
  - [ ] API boots successfully with no draft-related DI errors
  - [ ] All existing job CRUD tests pass (no regressions)
  - [ ] All existing match analysis tests pass (no regressions)
  - [ ] `schema.gql` has zero references to DraftJob, draft, or conversion
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing (minus deleted draft tests)
- Zero files remain under `domains/draft-jobs/`
- `DraftJobEntity` file deleted
- `pnpm typecheck` and `pnpm lint` pass for `apps/api`
- API boots and serves GraphQL without draft-related errors
- Test suite no longer references deleted draft files
