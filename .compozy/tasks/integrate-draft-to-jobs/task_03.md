---
status: completed
title: Update JobEntity, Enums, and Inputs
type: backend
complexity: high
dependencies:
  - task_02
---

# Task 03: Update JobEntity, Enums, and Inputs

## Overview

Update the data model and GraphQL inputs to reflect the merged schema. `JobEntity` gains `htmlContent` (nullable, raw captured HTML) and `fillMetadata` (AsyncMetadataEmbedded) columns, loses the `draftJob` ManyToOne relation and `draftJobId` FK, and makes `title` nullable. `ApplicationStageEnum` and `ApplicationQuickFilterEnum` each gain a `DRAFT` value. `CreateJobInput` and `UpdateJobInput` gain `htmlContent` and lose `draftJobId`. Register enum changes with GraphQL.
**Note:** `DraftJobEntity` is absent from TypeORM entities (see `draft-job.orm.md`). Task 02 aligned parts of JobEntity / enums ahead of formal GraphQL input cleanup here.

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

- [x] 3.1 Update `JobEntity` — add htmlContent and fillMetadata columns, make title nullable, remove draftJob relation and draftJobId
- [x] 3.2 Add `DRAFT` to `ApplicationStageEnum` and `ApplicationQuickFilterEnum`
- [x] 3.3 Update `JobType` GraphQL object type — nullable title, add htmlContent, add fillMetadata, remove draftJobId
- [x] 3.4 Update `CreateJobInput` and `UpdateJobInput` — add htmlContent, remove draftJobId
- [x] 3.5 Remove `draftJobId` @ResolveField from `JobsResolver`
- [x] 3.6 Fix compilation errors across all files that reference removed fields (draftJobId, draftJob relation)

## Implementation Details

Entity changes in `JobEntity`: remove `import { DraftJobEntity }` and the `@ManyToOne` + `@JoinColumn` decoration block. Remove `draftJobId` column entirely (the FK column no longer exists). Add the new columns following the existing column style.

For nullable `title`, update both the `@Column` decorator and the class property type: `title: string | null`. This cascades to any service code that destructures or asserts `title` as always-present.

Enum additions: add `DRAFT = "DRAFT"` in alphabetical or logical position. `registerEnumType` uses GraphQL enum names **`ApplicationStage`** and **`ApplicationQuickFilter`** (alias renames away from legacy `JobStage` / `JobQuickFilter`; web codegen tracked in task 10).

Input changes: **`CreateJobInput` has no `draftJobId`** (GraphQL rejects unknown fields anyway). **`htmlContent`** added on inputs; **`title`** nullable on `CreateJobInput` with **`class-validator`** `MaxLength(JOB_TITLE_MAX_LENGTH)` parity with `JobEntity`.

### Relevant Files

- `apps/api/src/database/entities/job.entity.ts` — primary target: columns to add/remove/modify
- `apps/api/src/domains/jobs/job-stage.enum.ts` — add DRAFT to ApplicationStageEnum
- `apps/api/src/domains/jobs/job-quick-filter.enum.ts` — add DRAFT to ApplicationQuickFilterEnum
- `apps/api/src/domains/jobs/job.type.ts` — JobType GraphQL object type with updated fields
- `apps/api/src/domains/jobs/create-job.input.ts` — add htmlContent, remove draftJobId
- `apps/api/src/domains/jobs/update-job.input.ts` — add htmlContent
- `apps/api/src/domains/jobs/job-title.constraints.ts` — shared `JOB_TITLE_MAX_LENGTH`
- `apps/api/src/domains/jobs/jobs.resolver.ts` — **`draftJobId` @ResolveField removed** (requirement 3.5)

### Dependent Files

- `apps/api/src/domains/jobs/jobs.service.ts` — **`draftJobId` kept only on internal `CreateDto` / repository create** for legacy `processDraftConversion` PK stability until task 08
- `apps/api/src/domains/jobs/jobs.repository.ts` — internal `draftJobId` on `CreateJobRepoDto` stripped before `save()`
- `apps/api/src/schema.gql` — checked in repo; reflects nullable `JobType.title`, **`ApplicationStage`** / **`ApplicationQuickFilter`** including **DRAFT**, `fillMetadata`, `htmlContent`, no **`JobType.draftJobId`**

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
  - [x] JobEntity can be instantiated with htmlContent, fillMetadata, and null title
  - [x] JobEntity fails validation if title exceeds max length (but not if null)
  - [x] CreateJobInput validation: htmlContent optional, draftJobId is rejected
  - [x] ApplicationStageEnum.DRAFT registered correctly in GraphQL enum
  - [x] ApplicationQuickFilterEnum.DRAFT registered correctly in GraphQL enum
  - [x] JobType GraphQL schema includes htmlContent and fillMetadata fields (nullable)
  - [x] JobType GraphQL schema has nullable title
  - [x] JobType GraphQL schema does NOT have draftJobId field
- Integration tests:
  - [x] Create job via GraphQL with htmlContent — persisted correctly in DB
  - [x] Query job via GraphQL — title returned as null for DRAFT job
  - [x] Quick filter DRAFT — returns only jobs with stage=DRAFT
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- `JobEntity` compiles without DraftJobEntity import
- `title` is `String | null` in the type system
- `ApplicationStageEnum.DRAFT` and `ApplicationQuickFilterEnum.DRAFT` available in both TypeScript and GraphQL
- No `draftJobId` references remain in `JobsResolver`, `JobType`, `CreateJobInput`, or `UpdateJobInput`
