---
status: pending
title: Update MatchAnalysisEntity — Remove Draft FK
type: backend
complexity: medium
dependencies:
  - task_02
---

# Task 04: Update MatchAnalysisEntity — Remove Draft FK

## Overview

Remove the `draftJobId` column and `draftJob` ManyToOne relation from `MatchAnalysisEntity`. Make the existing `jobId` column non-nullable. This reflects the post-migration schema where every match analysis is associated with a single Job (previously both `jobId` and `draftJobId` were nullable, with exactly one being set). Remove the corresponding `@ResolveField` that exposed `draftJob` on the match type.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST remove `@ManyToOne(() => DraftJobEntity, ...)` `draftJob` relation from `MatchAnalysisEntity`
- MUST remove `@Column({ type: "uuid", nullable: true })` `draftJobId` from `MatchAnalysisEntity`
- MUST change `jobId` column from `@Column({ type: "uuid", nullable: true })` to `@Column({ type: "uuid" })` (NOT NULL)
- MUST remove `DraftJobEntity` import from match-analysis entity file
- MUST remove `draftJob` field from `MatchAnalysisType` GraphQL object type
- MUST remove any `@ResolveField` that resolves `draftJob` on `MatchAnalysisType`
- SHOULD verify no other entity references `DraftJobEntity` after this task
</requirements>

## Subtasks

- [ ] 4.1 Remove `draftJob` ManyToOne relation and `draftJobId` column from `MatchAnalysisEntity`
- [ ] 4.2 Make `jobId` NOT NULL on `MatchAnalysisEntity`
- [ ] 4.3 Remove `draftJob` field from `MatchAnalysisType` GraphQL type
- [ ] 4.4 Remove any `@ResolveField("draftJob")` from match-analysis resolver
- [ ] 4.5 Fix compilation errors from removed fields across match-analysis services and tests

## Implementation Details

The `MatchAnalysisEntity` currently has dual nullable FKs:

```typescript
@Column({ type: "uuid", nullable: true })
jobId: string | null;

@Column({ type: "uuid", nullable: true })
draftJobId: string | null;
```

After this task: only `jobId` remains, and it becomes NOT NULL. The `draftJob` relation and its `@JoinColumn` are removed entirely.

### Relevant Files

- `apps/api/src/database/entities/match-analysis.entity.ts` — remove draftJobId column and draftJob relation, make jobId NOT NULL
- `apps/api/src/domains/match-analysis/match-analysis.type.ts` — remove `draftJob` field from GraphQL ObjectType
- `apps/api/src/domains/match-analysis/match-analysis.resolver.ts` — remove DraftJobMatchResolver and any @ResolveField("draftJob")

### Dependent Files

- `apps/api/src/domains/match-analysis/match-analysis.service.ts` — `findForDraftJob`, `generateForDraft` reference `draftJobId`; handled in task_07
- `apps/api/src/domains/match-analysis/match-analysis.service.spec.ts` — tests reference `draftJobId`; will need updates (task_07)
- `apps/api/src/domains/match-analysis/match-analysis.repository.ts` — may reference `draftJobId` in queries; handled in task_07
- `apps/api/src/domains/match-analysis/match-analysis.schema.ts` — may reference `draftJobId` in types; handled in task_07
- `apps/api/src/domains/match-analysis/match-analysis-event.listener.ts` — may reference `draftJobId`; handled in task_07

### Related ADRs

- [ADR-003: Match Analysis Unification](../adrs/adr-003.md) — Defines single FK (`jobId`) and removal of `draftJobId`

## Deliverables

- Updated `MatchAnalysisEntity` (no draftJobId, no draftJob relation, jobId NOT NULL)
- Updated `MatchAnalysisType` (no draftJob field)
- Updated match-analysis resolver (no draft job field resolver)
- Unit tests with 80%+ coverage **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] MatchAnalysisEntity can be instantiated without draftJobId — only jobId required
  - [ ] MatchAnalysisEntity validation rejects null jobId
  - [ ] MatchAnalysisType GraphQL schema does NOT include draftJob field
  - [ ] MatchAnalysisType GraphQL schema includes jobId as non-nullable
- Integration tests:
  - [ ] Create match analysis via GraphQL — associated with jobId, no draftJobId path exists
  - [ ] Query match via GraphQL — no draftJob field in response
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- `MatchAnalysisEntity` compiles without DraftJobEntity import
- `jobId` is `string` (not `string | null`) in the type system
- No `draftJobId` or `draftJob` references remain in `MatchAnalysisEntity` or `MatchAnalysisType`
