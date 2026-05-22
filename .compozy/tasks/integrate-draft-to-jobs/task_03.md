---
status: pending
title: Update JobEntity, Enums, and Inputs
type: backend
complexity: high
dependencies:
  - task_02
---

# Task 03: Update JobEntity, Enums, and Inputs

## Overview

Update the data model and GraphQL inputs to reflect the merged schema. `JobEntity` gains `htmlContent` (nullable, raw captured HTML) and `fillMetadata` (AsyncMetadataEmbedded) columns, loses the `draftJob` ManyToOne relation and `draftJobId` FK, and makes `title` nullable. `ApplicationStageEnum` and `ApplicationQuickFilterEnum` each gain a `DRAFT` value. `CreateJobInput` and `UpdateJobInput` gain `htmlContent` and lose `draftJobId`. Register enum changes with GraphQL. Update `JobType` object type to reflect nullable title and new fields.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add `@Column({ type: "text", nullable: true }) htmlContent` to `JobEntity`
- MUST add `@Column(() => AsyncMetadataEmbedded, { prefix: "fill" }) fillMetadata` to `JobEntity`
- MUST change `title` column from `@Column({ type: "text" })` to `@Column({ type: "text", nullable: true })` on `JobEntity`
- MUST remove `@ManyToOne(() => DraftJobEntity, ...)` `draftJob` relation from `JobEntity`
- MUST remove `@Column({ type: "uuid", nullable: true })` `draftJobId` from `JobEntity`
- MUST add `DRAFT = "DRAFT"` to `ApplicationStageEnum`
- MUST add `DRAFT = "DRAFT"` to `ApplicationQuickFilterEnum`
- MUST update `registerEnumType` for `ApplicationStageEnum` (name stays `"ApplicationStage"`)
- MUST update `registerEnumType` for `ApplicationQuickFilterEnum` (name stays `"ApplicationQuickFilter"`)
- MUST add `htmlContent` field (nullable String) and remove `draftJobId` field from `CreateJobInput`
- MUST add `htmlContent` field (nullable String) to `UpdateJobInput`
- MUST make `title` field nullable in `JobType` (`@Field(() => String, { nullable: true })`)
- MUST add `fillMetadata` field (nullable `AsyncMetadataType`) to `JobType`
- MUST add `htmlContent` field (nullable String) to `JobType`
- MUST remove `draftJobId` field from `JobType`
- MUST remove the `@ResolveField("draftJobId")` method from `JobsResolver`
- MUST update any entity-level validation that assumes `title` is non-null (check `@IsNotEmpty`, `@IsString` decorators)
</requirements>

## Subtasks

- [ ] 3.1 Update `JobEntity` — add htmlContent and fillMetadata columns, make title nullable, remove draftJob relation and draftJobId
- [ ] 3.2 Add `DRAFT` to `ApplicationStageEnum` and `ApplicationQuickFilterEnum`
- [ ] 3.3 Update `JobType` GraphQL object type — nullable title, add htmlContent, add fillMetadata, remove draftJobId
- [ ] 3.4 Update `CreateJobInput` and `UpdateJobInput` — add htmlContent, remove draftJobId
- [ ] 3.5 Remove `draftJobId` @ResolveField from `JobsResolver`
- [ ] 3.6 Fix compilation errors across all files that reference removed fields (draftJobId, draftJob relation)

## Implementation Details

Entity changes in `JobEntity`: remove `import { DraftJobEntity }` and the `@ManyToOne` + `@JoinColumn` decoration block. Remove `draftJobId` column entirely (the FK column no longer exists). Add the new columns following the existing column style.

For nullable `title`, update both the `@Column` decorator and the class property type: `title: string | null`. This cascades to any service code that destructures or asserts `title` as always-present.

Enum additions: add `DRAFT = "DRAFT"` in alphabetical or logical position. The `registerEnumType` call does not need to change since it uses the enum object reference.

Input changes: `CreateJobInput` currently has `draftJobId` field — remove it entirely. Add `htmlContent` following the existing field pattern. In `UpdateJobInput`, add `htmlContent`.

### Relevant Files

- `apps/api/src/database/entities/job.entity.ts` — primary target: columns to add/remove/modify
- `apps/api/src/domains/jobs/job-stage.enum.ts` — add DRAFT to ApplicationStageEnum
- `apps/api/src/domains/jobs/job-quick-filter.enum.ts` — add DRAFT to ApplicationQuickFilterEnum
- `apps/api/src/domains/jobs/job.type.ts` — JobType GraphQL object type with updated fields
- `apps/api/src/domains/jobs/create-job.input.ts` — add htmlContent, remove draftJobId
- `apps/api/src/domains/jobs/update-job.input.ts` — add htmlContent
- `apps/api/src/domains/jobs/jobs.resolver.ts` — remove `@ResolveField("draftJobId")` method

### Dependent Files

- `apps/api/src/domains/jobs/jobs.service.ts` — references `draftJobId` in `create()`, `update()`, `processDraftConversion()`; will need updates (done in task_08)
- `apps/api/src/domains/jobs/jobs.repository.ts` — references `draft_job_id` in queries; will need updates (done in task_08)
- `apps/api/src/domains/jobs/jobs.service.spec.ts` and `jobs.resolver.spec.ts` — tests reference `draftJobId`; may need assertion updates
- `apps/api/src/domains/jobs/jobs.resolver.spec.ts` — tests for `draftJobId` @ResolveField removed

### Related ADRs

- [ADR-001: Full Merge — Draft as Job Stage](../adrs/adr-001.md) — Defines DRAFT as a stage, not an entity; title becomes nullable
- [ADR-004: Async Fill Tracking](../adrs/adr-004.md) — Defines fillMetadata via AsyncMetadataEmbedded

## Deliverables

- Updated `JobEntity` with new columns, nullable title, removed draftJob relation
- Updated `ApplicationStageEnum` and `ApplicationQuickFilterEnum` with DRAFT values
- Updated `JobType` with nullable title, htmlContent, fillMetadata
- Updated `CreateJobInput` and `UpdateJobInput`
- Updated `JobsResolver` (removed draftJobId ResolveField)
- Unit tests with 80%+ coverage **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] JobEntity can be instantiated with htmlContent, fillMetadata, and null title
  - [ ] JobEntity fails validation if title exceeds max length (but not if null)
  - [ ] CreateJobInput validation: htmlContent is optional, draftJobId is rejected
  - [ ] ApplicationStageEnum.DRAFT registered correctly in GraphQL enum
  - [ ] ApplicationQuickFilterEnum.DRAFT registered correctly in GraphQL enum
  - [ ] JobType GraphQL schema includes htmlContent and fillMetadata fields (nullable)
  - [ ] JobType GraphQL schema has nullable title
  - [ ] JobType GraphQL schema does NOT have draftJobId field
- Integration tests:
  - [ ] Create job via GraphQL with htmlContent — persisted correctly in DB
  - [ ] Query job via GraphQL — title returned as null for DRAFT job
  - [ ] Quick filter DRAFT — returns only jobs with stage=DRAFT
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- `JobEntity` compiles without DraftJobEntity import
- `title` is `String | null` in the type system
- `ApplicationStageEnum.DRAFT` and `ApplicationQuickFilterEnum.DRAFT` available in both TypeScript and GraphQL
- No `draftJobId` references remain in `JobsResolver`, `JobType`, `CreateJobInput`, or `UpdateJobInput`
