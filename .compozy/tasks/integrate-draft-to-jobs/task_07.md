---
status: completed
title: Unify Match Analysis — Single Mutation
type: backend
complexity: high
dependencies:
  - task_04
  - task_05
---

# Task 07: Unify Match Analysis — Single Mutation

## Overview

Consolidate the two match analysis paths (`generate` for jobs, `generateForDraft` for drafts) into a single `generateJobMatch` mutation with internal source selection. Remove `generateDraftJobMatch` mutation, `generateForDraft` service method, `DraftJobMatchResolver`, and all draft-specific match analysis logic. The unified `generate()` method selects the text source internally: uses `job.htmlContent` (converted via `htmlToPlainText`) when available, falls back to `job.description` (converted via `tipTapToPlainText`), and throws if neither is present.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST remove `generateForDraft` method from `MatchAnalysisService`
- MUST remove `findForDraftJob` method from `MatchAnalysisService`
- MUST add internal source selection logic to `generate()` method: `htmlContent` (via htmlToPlainText) preferred, fallback to `description` (via tipTapToPlainText), throw `BadRequestException` if neither present
- MUST update `processMatchAnalysis` to remove draft dispatch path — only `jobId` source remains
- MUST remove `generateDraftJobMatch` mutation from match-analysis resolver
- MUST remove `draftJobMatch` query from match-analysis resolver
- MUST remove `DraftJobMatchResolver` class
- MUST remove `GenerateDraftMatchInput` input type
- MUST update `MatchAnalysisRepository` — remove `findForDraftJob` and any `draftJobId` query filters
- MUST update `MatchAnalysisEventBus` and events to remove draft-specific event types (if any exist)
- MUST update `MatchAnalysisEventListener` — remove draft-specific event handlers
- SHOULD update `MatchAnalysisModule` to remove `DraftJobMatchResolver` from providers

</requirements>

## Subtasks

- [x] 7.1 Add unified source selection to `MatchAnalysisService.generate()`
- [x] 7.2 Remove `generateForDraft` and `findForDraftJob` from `MatchAnalysisService`
- [x] 7.3 Remove draft dispatch path from `processMatchAnalysis()`
- [x] 7.4 Remove `generateDraftJobMatch` mutation and `draftJobMatch` query from resolver
- [x] 7.5 Delete `DraftJobMatchResolver` class
- [x] 7.6 Remove `GenerateDraftMatchInput` input type
- [x] 7.7 Clean up repository methods that reference `draftJobId`

## Implementation Details

The core change in `MatchAnalysisService.generate()`:

```
1. Fetch job with relations
2. If job.htmlContent → source = htmlToPlainText(job.htmlContent)
3. Else if job.description → source = tipTapToPlainText(job.description)
4. Else → throw BadRequestException("Job has no description or htmlContent")
5. Proceed with existing AI pipeline using selected source
```

JD plain-text resolution is shared via `job-posting-plain-text.util.ts` (`resolveJobPostingPlainText`) — used by `generate()`, `processMatchAnalysis()`, and auto-match listener.

The `processMatchAnalysis` method previously dispatched based on `source.jobId` vs `source.draftJobId`. After unification, only `jobId` source exists — the `draftJobId` branch is removed.

### Relevant Files

- `apps/api/src/domains/match-analysis/match-analysis.service.ts` — primary target: unify `generate()`, remove `generateForDraft()`, update `processMatchAnalysis()`
- `apps/api/src/domains/match-analysis/job-posting-plain-text.util.ts` — shared JD text resolution
- `apps/api/src/domains/match-analysis/match-analysis.resolver.ts` — remove `generateDraftJobMatch`, `draftJobMatch`, `DraftJobMatchResolver`
- `apps/api/src/domains/match-analysis/match-analysis.repository.ts` — remove `findForDraftJob`, clean `draftJobId` references
- `apps/api/src/domains/match-analysis/generate-draft-match.input.ts` — delete file
- `apps/api/src/domains/match-analysis/match-analysis.module.ts` — remove `DraftJobMatchResolver` from providers
- `apps/api/src/domains/match-analysis/match-analysis-event.listener.ts` — remove draft-specific event handlers
- `apps/api/src/domains/match-analysis/match-analysis.events.ts` — verify no draft-specific event classes remain
- `apps/api/src/domains/match-analysis/match-analysis.service.spec.ts` — update tests to cover unified source selection (expanded from task_01)

### Dependent Files

- `apps/web/src/graphql/match.graphql` — `GenerateDraftJobMatch` and `DraftJobMatch` operations removed; handled in task_10 (codegen)
- `apps/api/src/domains/jobs/job.type.ts` — `match` @ResolveField still works with unified `findForJob`
- `apps/api/src/schema.gql` — regenerates without draft match operations

### Related ADRs

- [ADR-003: Match Analysis Unification](../adrs/adr-003.md) — Single mutation with internal source selection; `htmlContent` preferred for match analysis

## Deliverables

- Updated `MatchAnalysisService` with unified `generate()` and removed draft methods
- Updated `MatchAnalysisResolver` without draft match operations
- Updated `MatchAnalysisRepository` without `draftJobId` references
- Deleted `GenerateDraftMatchInput` and `DraftJobMatchResolver`
- Unit tests with 80%+ coverage **(REQUIRED)**

## Tests

- Unit tests:
  - [x] `generate()` with job that has `htmlContent` — uses `htmlToPlainText(htmlContent)` as AI input
  - [x] `generate()` with job that has `description` but no `htmlContent` — uses `tipTapToPlainText(description)` as AI input
  - [x] `generate()` with job that has both `htmlContent` and `description` — prefers `htmlContent`
  - [x] `generate()` with job that has neither `htmlContent` nor `description` — throws `BadRequestException` with descriptive message
  - [x] `generate()` still creates match analysis with correct jobId
  - [x] `processMatchAnalysis()` with `jobId` source — dispatches to `generate()`
  - [x] `processMatchAnalysis()` with `draftJobId` source — no longer supported, throws or ignores
  - [x] `generateForDraft` method no longer exists on service
  - [x] `generateDraftJobMatch` mutation not present in GraphQL schema
- Integration tests:
  - [ ] Full match analysis flow for job with htmlContent — match created, emits SSE event
  - [ ] Full match analysis flow for job with description only — match created
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Single `generateJobMatch` mutation in schema, no `generateDraftJobMatch`
- Match analysis works for jobs with `htmlContent` (DRAFT-origin) and jobs with only `description`
- `MatchAnalysisEntity` only references `jobId`, never `draftJobId`
- No draft imports in match-analysis domain
