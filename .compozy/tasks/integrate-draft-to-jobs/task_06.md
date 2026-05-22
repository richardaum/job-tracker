---
status: pending
title: Relocate AI Extraction to Jobs Domain
type: backend
complexity: medium
dependencies:
  - task_05
---

# Task 06: Relocate AI Extraction to Jobs Domain

## Overview

Move the AI extraction services and schemas from `domains/draft-jobs/ai/` to `domains/jobs/ai/`. These services power the "Fill automatically" feature — they call OpenAI to extract structured job data (title, company, description, salary, tags, location, workRegion) from raw HTML content. The services themselves are not rewritten, only relocated. Update all import paths across the codebase that reference the old location.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST move `draft-extraction.service.ts` from `draft-jobs/ai/` to `jobs/ai/`
- MUST move `draft-extraction-normalization.service.ts` from `draft-jobs/ai/` to `jobs/ai/`
- MUST move `draft-extraction.schema.ts` from `draft-jobs/ai/` to `jobs/ai/`
- MUST move `draft-extraction.types.ts` from `draft-jobs/ai/` to `jobs/ai/` (if exists)
- MUST move `draft-extraction.model.ts` from `draft-jobs/ai/` to `jobs/ai/` (if exists)
- MUST move `draft-extraction.templates.ts` from `draft-jobs/ai/` to `jobs/ai/` (if exists)
- MUST update all import paths referencing these files across the entire codebase
- MUST update `JobsModule` to register the relocated services as providers
- MUST remove the old `draft-jobs/ai/` directory
- SHOULD rename service class names from `DraftExtraction*` to `JobExtraction*` where appropriate, OR keep names and update only imports (TechSpec says relocated, not rewritten — defer rename to follow-up)
- SHOULD verify no remaining imports to `draft-jobs/ai/` after relocation
</requirements>

## Subtasks

- [ ] 6.1 Create `apps/api/src/domains/jobs/ai/` directory
- [ ] 6.2 Move all extraction files from `draft-jobs/ai/` to `jobs/ai/`
- [ ] 6.3 Update all import paths referencing the old location
- [ ] 6.4 Register extraction services in `JobsModule` providers
- [ ] 6.5 Delete empty `draft-jobs/ai/` directory
- [ ] 6.6 Run typecheck to verify no broken imports

## Implementation Details

All files under `apps/api/src/domains/draft-jobs/ai/` are moved to `apps/api/src/domains/jobs/ai/`. The files are:

- `draft-extraction.service.ts` — calls OpenAI for structured extraction
- `draft-extraction-normalization.service.ts` — normalizes AI output
- `draft-extraction.schema.ts` — Zod schemas
- `draft-extraction.types.ts` — type definitions
- `draft-extraction.model.ts` — field specs and prompt formatting
- `draft-extraction.templates.ts` — prompt templates

After moving, run `fix:imports` to sort imports. Update `JobsModule` to register `DraftExtractionService` and `DraftExtractionNormalizationService` as providers (they will be needed by `JobsService` in task_08). Remove the old registration from `DraftJobsModule`.

### Relevant Files

- `apps/api/src/domains/draft-jobs/ai/draft-extraction.service.ts` — primary service to move
- `apps/api/src/domains/draft-jobs/ai/draft-extraction-normalization.service.ts` — normalization logic to move
- `apps/api/src/domains/draft-jobs/ai/draft-extraction.schema.ts` — Zod schemas to move
- `apps/api/src/domains/draft-jobs/ai/draft-extraction.types.ts` — types to move
- `apps/api/src/domains/draft-jobs/ai/draft-extraction.model.ts` — field specs to move
- `apps/api/src/domains/draft-jobs/ai/draft-extraction.templates.ts` — prompt templates to move
- `apps/api/src/domains/jobs/ai/` — target directory (create if doesn't exist)
- `apps/api/src/domains/jobs/jobs.module.ts` — register relocated services as providers
- `apps/api/src/domains/draft-jobs/draft-jobs.module.ts` — remove extraction service providers

### Dependent Files

- `apps/api/src/domains/jobs/jobs.service.ts` — `processDraftConversion` imports from `draft-jobs/ai/`; update imports
- `apps/api/src/domains/draft-jobs/draft-jobs.service.ts` — may import extraction services; remove if only draft CRUD uses them
- `apps/api/src/domains/draft-jobs/ai/draft-extraction-normalization.service.spec.ts` — move alongside service (created in task_01)

### Related ADRs

- [ADR-001: Full Merge — Draft as Job Stage](../adrs/adr-001.md) — Extraction services belong in jobs domain
- [ADR-002: Two-Phase Fill](../adrs/adr-002.md) — Extraction powers the fill phase

## Deliverables

- Relocated extraction services in `apps/api/src/domains/jobs/ai/`
- Updated `JobsModule` providers
- Updated `DraftJobsModule` providers (extraction services removed)
- Updated all import paths across codebase
- Deleted `draft-jobs/ai/` directory
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for extraction flow **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] Relocated services export same public API as before (same class names, same method signatures)
  - [ ] Moved test file (`draft-extraction-normalization.service.spec.ts`) passes from new location
- Integration tests:
  - [ ] JobsModule boots with relocated services as providers (no DI errors)
  - [ ] Extraction service callable from JobsService context
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Zero imports to `draft-jobs/ai/` remain in codebase
- `JobsModule` registers extraction services without errors
- Old `draft-jobs/ai/` directory is empty or deleted
- `pnpm typecheck` passes for `apps/api`
