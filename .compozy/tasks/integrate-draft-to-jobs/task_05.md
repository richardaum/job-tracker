---
status: completed
title: GraphQL — Remove Draft Types and Add fillJobAutomatically
type: backend
complexity: high
dependencies:
  - task_03
---

# Task 05: GraphQL — Remove Draft Types and Add fillJobAutomatically

## Overview

Remove all draft-specific GraphQL types, queries, mutations, and inputs from the API schema. Then add the new `fillJobAutomatically` mutation and `fillMetadata` field to `JobType`. This is the inflection point where the public API shifts from dual-entity to single-entity. After this task, the GraphQL schema will no longer expose `DraftJobType`, `createDraftJob`, `draftJobs`, or any draft-related operations. The old `createJobWithAI` mutation is also removed (replaced by `fillJobAutomatically`).

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST remove `DraftJobType` ObjectType, `ConversionMetadataType` ObjectType, `DraftJobConversionStatus` enum from draft-job.type.ts (or delete file entirely if only draft types remain)
- MUST remove `CreateDraftJobInput`, `UpdateDraftJobInput` input types
- MUST remove `createDraftJob`, `updateDraftJob`, `deleteDraftJob`, `deleteJobsForDraft` mutations from `DraftJobsResolver`
- MUST remove `draftJobs`, `draftJob` queries from `DraftJobsResolver`
- MUST remove `createJobWithAI` mutation from `JobsResolver` (replaced by `fillJobAutomatically`)
- MUST remove `generateDraftJobMatch` mutation and `draftJobMatch` query from match-analysis resolver (partially done in task_07)
- MUST add `fillJobAutomatically(jobId: ID!): JobType!` mutation to `JobsResolver`
- MUST add `fillMetadata` field (AsyncMetadataType, nullable) to `JobType` (if not done in task_03)
- MUST remove `DraftJobsModule` import from `JobsModule` (or keep if still needed by remaining services; full removal in task_09)
- MUST remove `DraftJobsModule` import from `MatchAnalysisModule`
- MUST update `DraftJobsResolver` to remove all decorated methods (or delete the resolver file entirely)
- SHOULD remove `GenerateDraftMatchInput` input class
- SHOULD verify schema.gql regenerates correctly after changes (pm2 restart api)

</requirements>

## Subtasks

- [x] 5.1 Remove all draft-specific queries and mutations from `DraftJobsResolver`
- [x] 5.2 Remove `DraftJobType`, `ConversionMetadataType`, `DraftJobConversionStatus` GraphQL types
- [x] 5.3 Remove `CreateDraftJobInput`, `UpdateDraftJobInput` input types
- [x] 5.4 Remove `createJobWithAI` mutation from `JobsResolver`
- [x] 5.5 Add `fillJobAutomatically` mutation to `JobsResolver`
- [x] 5.6 Remove `DraftJobsModule` import from `JobsModule` and `MatchAnalysisModule`
- [x] 5.7 Restart API and verify schema.gql regenerates without draft types

## Implementation Details

The `DraftJobsResolver` file does not need to be fully deleted in this task (deletion happens in task_09), but its decorated methods must be cleared to prevent schema pollution. The `DraftJobsModule` import can be removed from `JobsModule` unless `JobsService` still uses draft services directly — verify before removing.

The `fillJobAutomatically` mutation on `JobsResolver` initially returns the job with `fillMetadata.status` — no actual processing yet (that's task_08). The resolver method calls `jobsService.fillJobAutomatically()` which will be a stub initially.

### Relevant Files

- `apps/api/src/domains/draft-jobs/draft-jobs.resolver.ts` — clear all @Query/@Mutation decorations (or empty the class)
- `apps/api/src/domains/draft-jobs/draft-job.type.ts` — clear/remove @ObjectType classes
- `apps/api/src/domains/draft-jobs/create-draft-job.input.ts` — clear/remove @InputType class
- `apps/api/src/domains/draft-jobs/update-draft-job.input.ts` — clear/remove @InputType class
- `apps/api/src/domains/jobs/jobs.resolver.ts` — remove `createJobWithAI`, add `fillJobAutomatically`
- `apps/api/src/domains/jobs/job.type.ts` — verify fillMetadata and htmlContent fields present (from task_03)
- `apps/api/src/domains/jobs/jobs.module.ts` — remove DraftJobsModule import
- `apps/api/src/domains/match-analysis/match-analysis.module.ts` — remove DraftJobsModule import
- `apps/api/src/domains/match-analysis/generate-draft-match.input.ts` — clear/remove

### Dependent Files

- `apps/web/src/graphql/draft-jobs.graphql` — will fail codegen; handled in task_10 (codegen)
- `apps/web/src/graphql/match.graphql` — `GenerateDraftJobMatch` mutation removed; handled in task_10
- `apps/web/src/graphql/jobs.graphql` — `CreateJobWithAI` mutation removed; handled in task_10
- Browser extension — calls `createDraftJob`; needs update to call `createJob` (task_13)

### Related ADRs

- [ADR-001: Full Merge — Draft as Job Stage](../adrs/adr-001.md) — Draft GraphQL types eliminated
- [ADR-002: Two-Phase Fill](../adrs/adr-002.md) — `fillJobAutomatically` replaces `createJobWithAI`

## Deliverables

- Updated `DraftJobsResolver` (no schema-exposed operations)
- Updated `JobsResolver` (+fillJobAutomatically, -createJobWithAI)
- Updated `JobsModule` and `MatchAnalysisModule` (no DraftJobsModule import)
- Removed/cleared draft GraphQL types and inputs
- Unit tests with 80%+ coverage **(REQUIRED)**

## Tests

- Unit tests:
  - [x] `fillJobAutomatically` mutation exists on schema and accepts `jobId: ID!`
  - [x] `JobType` includes `fillMetadata` field (nullable AsyncMetadataType)
  - [x] `createDraftJob` mutation NOT present in schema
  - [x] `draftJobs` query NOT present in schema
  - [x] `createJobWithAI` mutation NOT present in schema
  - [x] `DraftJobType` NOT present in schema types
  - [x] `ConversionMetadataType` NOT present in schema types
- Integration tests:
  - [x] Call `fillJobAutomatically` mutation via GraphQL — returns JobType with fillMetadata.status
  - [x] Call removed `createDraftJob` mutation — GraphQL validation error (unknown field)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- `schema.gql` contains `fillJobAutomatically` mutation and `fillMetadata` field
- `schema.gql` does NOT contain `DraftJobType`, `createDraftJob`, `draftJobs`, `createJobWithAI`
- API starts without DraftJobsModule import errors
