# TechSpec: Integrate Draft into Jobs

## Executive Summary

Eliminate `DraftJobEntity` and absorb its fields into `JobEntity`. Draft becomes a stage (`DRAFT`) in the existing `ApplicationStageEnum`. A single migration merges all `draft_jobs` rows into `jobs`, adds `htmlContent` and `fillMetadata` columns, makes `title` nullable, and drops the `draft_jobs` table and all dual FKs. "Fill automatically" splits into two mutations: `fillJobAutomatically` (async AI extraction, in-place) and the existing `createJobStageEvent` (DRAFT → NEW transition). Match analysis unifies into a single `generateJobMatch` mutation with internal source selection (`htmlContent` vs `description`). All draft-specific code — entity, module, resolver, service, SSE controller, frontend pages — is removed.

**Primary trade-off**: Single migration with direct data movement reduces rollout time and eliminates dual-codebase complexity, but concentrates risk in one migration step. The rollback plan (snapshot before migration, transaction wrapping) mitigates this.

## System Architecture

### Component Overview

**Before**: `DraftJobEntity` (table `draft_jobs`) + `JobEntity` (table `jobs`) with `draftJob` ManyToOne FK. Separate service, resolver, module, SSE controller. Dual match analysis (`generateJobMatch` / `generateDraftJobMatch`).

**After**: Single `JobEntity` (table `jobs`) with absorbed draft fields. `DraftJobsModule` removed. `JobsModule` no longer imports `DraftJobsModule`. Single `generateJobMatch` mutation. Fill tracking via `fillMetadata` (AsyncMetadataEmbedded) on the existing Job SSE stream.

```
┌──────────────┐     ┌──────────────────┐
│  JobsModule  │────▶│  JobsService     │
│              │     │  - create()      │
│  - Resolver  │     │  - fillAutomatically()  │
│  - SSE Ctl   │     │  - processFill()        │
│  - Listener  │     │  - createStageEvent()   │
└──────┬───────┘     └────────┬─────────┘
       │                      │
       │ imports              │ uses
       ▼                      ▼
┌──────────────┐     ┌──────────────────┐
│  DraftJobs   │     │  MatchAnalysis   │
│  Module      │ ✗   │  Module          │
│  REMOVED     │     │  - generate()    │
└──────────────┘     └──────────────────┘
```

### Data Flow

1. **Import**: Browser extension → `createJob(input)` with `htmlContent` → `JobEntity` saved with `stage = DRAFT`, `fillMetadata = null`
2. **Fill**: User clicks "Fill automatically" → `fillJobAutomatically(jobId)` → service sets `fillMetadata.status = PROCESSING`, returns immediately → event emitted → background `processFillJob` calls AI extraction → updates Job in-place → sets `fillMetadata.status = COMPLETED` → SSE emits completion → frontend optionally calls `createJobStageEvent(DRAFT → NEW)`
3. **Match**: `generateJobMatch(jobId, resumeId)` → service checks `job.htmlContent` (preferred) or `job.description` → single AI pipeline

## Implementation Design

### Core Interfaces

```typescript
// jobs.service.ts — new methods

async fillJobAutomatically(
  userId: string,
  jobId: string,
): Promise<JobType> {
  const job = await this.findOne(jobId, userId);
  if (job.fillMetadata?.status === AsyncMetadataStatusEnum.PROCESSING) {
    throw new BadRequestException("Fill already in progress");
  }
  await this.repo.updateFillMetadata(jobId, userId, {
    status: AsyncMetadataStatusEnum.PROCESSING,
  });
  this.eventBus.emit(new FillJobRequested(jobId, userId));
  return this.findOne(jobId, userId);
}
```

```typescript
// match-analysis.service.ts — unified source selection

private getJobDescriptionSource(job: JobEntity): string {
  if (job.htmlContent) {
    return htmlToPlainText(job.htmlContent);
  }
  if (!job.description) {
    throw new BadRequestException(
      "Job has no description or htmlContent for match analysis",
    );
  }
  return tipTapToPlainText(job.description);
}
```

### Data Models

**JobEntity changes:**

| Field          | Change        | Details                                                         |
| -------------- | ------------- | --------------------------------------------------------------- |
| `title`        | Made nullable | `@Column({ type: "text", nullable: true })`                     |
| `htmlContent`  | **New**       | `@Column({ type: "text", nullable: true })` — raw captured HTML |
| `fillMetadata` | **New**       | `@Column(() => AsyncMetadataEmbedded, { prefix: "fill" })`      |
| `draftJob`     | **Removed**   | ManyToOne relation + `draft_job_id` FK removed                  |
| `stage`        | **Extended**  | `ApplicationStageEnum` gains `DRAFT`                            |

**DraftJobEntity**: Entire file removed. `ConversionMetadataEmbedded` removed. `DraftJobConversionStatusEnum` removed.

**MatchAnalysisEntity changes:**

| Field        | Change            | Details                                   |
| ------------ | ----------------- | ----------------------------------------- |
| `draftJobId` | **Removed**       | Column + ManyToOne relation removed       |
| `draftJob`   | **Removed**       | ManyToOne relation removed                |
| `jobId`      | **Made NOT NULL** | Can drop nullable — every match has a job |

**New/Modified Enums:**

```typescript
// ApplicationStageEnum gains DRAFT
export enum ApplicationStageEnum {
  DRAFT = "DRAFT", // NEW
  NEW = "NEW",
  APPLIED = "APPLIED",
  // ... rest unchanged
}

// ApplicationQuickFilterEnum gains DRAFT
export enum ApplicationQuickFilterEnum {
  DRAFT = "DRAFT", // NEW
  INCOMING = "INCOMING",
  // ... rest unchanged
}
```

### API Endpoints

**New mutations:**

| Mutation               | Input        | Returns    | Notes                                             |
| ---------------------- | ------------ | ---------- | ------------------------------------------------- |
| `fillJobAutomatically` | `jobId: ID!` | `JobType!` | Sets fillMetadata=PROCESSING, returns immediately |

**Modified inputs:**

| Input            | Change                                                                                |
| ---------------- | ------------------------------------------------------------------------------------- |
| `CreateJobInput` | Add `htmlContent?: String` (nullable). `title` becomes nullable. Remove `draftJobId`. |
| `UpdateJobInput` | Add `htmlContent?: String`. `title` stays nullable.                                   |

**Removed mutations and queries:**

- `createDraftJob`, `updateDraftJob`, `deleteDraftJob`, `deleteJobsForDraft`
- `generateDraftJobMatch`, `draftJobMatch`
- `draftJobs`, `draftJob`
- `createJobWithAI` (replaced by `fillJobAutomatically`)
- `DraftJobType`, `ConversionMetadataType`, `DraftJobConversionStatus`, `CreateDraftJobInput`, `UpdateDraftJobInput`, `GenerateDraftMatchInput`

**Unchanged mutations:**

- `createJobStageEvent` — already exists, extended enum accepts DRAFT as `toStage`
- `generateJobMatch` — unchanged signature, unified internally
- `createJob`, `updateJob` — signatures modified (see above), behavior unchanged
- `deleteJob` — unchanged

## Integration Points

| System                    | Impact                                         | Action                                                               |
| ------------------------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| Browser extension         | Calls `createDraftJob` → must call `createJob` | Extension update coordinated with API deploy                         |
| SSE (`JobsSseController`) | Gains fill status events                       | Emit `fill_status_changed` events on existing job SSE stream         |
| OpenAI (AI extraction)    | No change to prompts or models                 | Reuses existing `DraftExtractionService` logic, moved to jobs domain |

## Impact Analysis

### Backend (`apps/api/`)

| Component                             | Impact Type | Description                                                                       | Required Action                    |
| ------------------------------------- | ----------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| `JobEntity`                           | Modified    | +htmlContent, +fillMetadata, nullable title, -draftJob relation                   | Update entity + migration          |
| `DraftJobEntity`                      | Deprecated  | Entire entity removed                                                             | Delete file                        |
| `ConversionMetadataEmbedded`          | Deprecated  | No longer needed                                                                  | Delete file                        |
| `MatchAnalysisEntity`                 | Modified    | -draftJobId, -draftJob relation, jobId→NOT NULL                                   | Update entity + migration          |
| `ApplicationStageEnum`                | Modified    | +DRAFT value                                                                      | Add enum member                    |
| `ApplicationQuickFilterEnum`          | Modified    | +DRAFT value                                                                      | Add enum member                    |
| `JobsService`                         | Modified    | +fillJobAutomatically, +processFillJob, -createJobWithAI, -processDraftConversion | Refactor ~180 lines of draft logic |
| `JobsResolver`                        | Modified    | +fillJobAutomatically mutation, -createJobWithAI, -draftJobId resolve field       | Update resolver                    |
| `JobsRepository`                      | Modified    | +updateFillMetadata, -draftJobId references                                       | Update repository                  |
| `JobsModule`                          | Modified    | Remove DraftJobsModule import                                                     | Update module                      |
| `DraftJobsModule`                     | Deprecated  | Entire module removed                                                             | Delete directory                   |
| `DraftJobsService`                    | Deprecated  | All draft CRUD removed                                                            | Delete file                        |
| `DraftJobsResolver`                   | Deprecated  | All draft queries/mutations removed                                               | Delete file                        |
| `DraftJobsRepository`                 | Deprecated  | All draft DB access removed                                                       | Delete file                        |
| `DraftJobsSseController`              | Deprecated  | Draft SSE endpoint removed                                                        | Delete file                        |
| `DraftJobEventBus`                    | Deprecated  | Draft event bus removed                                                           | Delete file                        |
| `DraftJobEvents`                      | Deprecated  | `DraftConversionRequested`, `DraftConversionStatusChanged` removed                | Delete file                        |
| `DraftConversionEventListener`        | Deprecated  | Listener for draft events                                                         | Delete file                        |
| `MatchAnalysisService`                | Modified    | -generateForDraft, unify source selection                                         | Merge into generate()              |
| `MatchAnalysisResolver`               | Modified    | -generateDraftJobMatch, -DraftJobMatchResolver                                    | Remove draft resolvers             |
| `MatchAnalysisModule`                 | Modified    | Remove DraftJobsModule import                                                     | Update module                      |
| `DraftExtractionService`              | Relocated   | Move to `jobs/ai/`                                                                | Move file, update imports          |
| `DraftExtractionNormalizationService` | Relocated   | Move to `jobs/ai/`                                                                | Move file, update imports          |
| `DraftExtractionSchema`               | Relocated   | Move to `jobs/ai/`                                                                | Move file, update imports          |
| `CreateJobInput`                      | Modified    | +htmlContent, nullable title, -draftJobId                                         | Update input class                 |
| `UpdateJobInput`                      | Modified    | +htmlContent                                                                      | Update input class                 |
| Migration                             | New         | Single migration merging draft_jobs → jobs                                        | Create migration file              |
| Tests                                 | Modified    | Update all draft-referencing tests                                                | Update ~10 test files              |

### Frontend (`apps/web/`)

| Component                         | Impact Type | Description                                                    | Required Action                       |
| --------------------------------- | ----------- | -------------------------------------------------------------- | ------------------------------------- |
| `/draft-jobs` route               | Deprecated  | Page removed                                                   | Delete page.tsx + DraftJobsPage       |
| `/draft-jobs/[id]` route          | Deprecated  | Page removed                                                   | Delete page.tsx + DraftJobDetailsPage |
| `DraftJobCard`                    | Deprecated  | No longer needed                                               | Delete                                |
| `DraftJobDetailsPage` (560 lines) | Deprecated  | Source content absorbed into Job detail                        | Delete, features move to Job detail   |
| Draft dialogs (5 files)           | Deprecated  | Convert, conflict, delete, title edit, side panel              | Delete                                |
| `ConversionStatusBadge`           | Deprecated  | Replaced by fillMetadata status display                        | Delete                                |
| `useDraft*` view-models           | Deprecated  | All draft list/detail hooks                                    | Delete                                |
| `useDraftAutoConversion`          | Deprecated  | ?autoConvert param handler                                     | Delete                                |
| Job detail page                   | Modified    | +Source content tab (conditional on htmlContent), +Fill button | Add tab + button                      |
| Job list page                     | Modified    | +Draft quick filter option                                     | Add filter                            |
| Job list cards                    | Modified    | Show draft indicator for stage=DRAFT jobs                      | Add badge                             |
| View models                       | Modified    | Handle nullable title (fallback display)                       | Update view models                    |
| GQL hooks                         | Modified    | Regenerate from updated schema                                 | Run codegen                           |

## Testing Approach

### Unit Tests

- **`jobs.service.spec.ts`**: Add tests for `fillJobAutomatically` (rejects if already PROCESSING, sets PROCESSING status, emits event) and `processFillJob` (extraction success, extraction failure, DRAFT → NEW transition not triggered by fill)
- **`match-analysis.service.spec.ts`**: Unify draft and job match tests. Test source selection (`htmlContent` preferred, falls back to `description`, throws when neither present)
- **`jobs.repository.spec.ts`**: Test `updateFillMetadata` with optimistic concurrency
- **`salary.service.spec.ts`**: No changes needed (salary logic unchanged)

### Integration Tests

- **Migration integration test**: Run migration against a DB with sample `draft_jobs` rows (with and without linked jobs, with and without match analysis). Verify all rows are migrated, stage=DRAFT, urls merged, htmlContent preserved, match analysis repointed.
- **`jobs.repository.integration.ts`**: Verify DRAFT jobs appear in list queries. Verify quick filter DRAFT works.

### E2E Tests

- Import URL → verify Job created with stage=DRAFT in list
- Fill automatically on DRAFT job → verify fields populated, stage unchanged (no auto-transition)
- Advance to NEW via createJobStageEvent → verify stage event recorded
- Match analysis on job with only htmlContent → verify uses htmlContent as source
- Match analysis on job with description → verify uses description as source

## Development Sequencing

### Build Order

1. **Migration** — no dependencies. Creates `DRAFT` in PG enum, adds `htmlContent` + `fillMetadata` columns, makes `title` nullable, merges `draft_jobs` rows into `jobs`, re-points `match_analysis.draft_job_id` → `job_id`, drops `draft_jobs` table, drops dual FKs. Registers in `migrations/index.ts`.
2. **JobEntity + enums** — depends on step 1. Updates entity (nullable title, new columns, remove draftJob relation). Adds `DRAFT` to `ApplicationStageEnum` and `ApplicationQuickFilterEnum`. Registers enum in GraphQL.
3. **MatchAnalysisEntity** — depends on step 1. Removes `draftJobId` column and `draftJob` relation from entity. Makes `jobId` NOT NULL.
4. **GraphQL schema: remove draft types** — depends on step 2. Removes `DraftJobType`, `ConversionMetadataType`, `DraftJobConversionStatus`, draft inputs. Removes draft queries/mutations from resolvers.
5. **GraphQL schema: add fill** — depends on step 2, 4. Adds `fillJobAutomatically` mutation, `fillMetadata` field on `JobType`. Runs `pm2 restart api` → regenerates `schema.gql`.
6. **Relocate AI extraction to jobs domain** — depends on step 5. Moves `draft-extraction.service.ts`, `draft-extraction-normalization.service.ts`, `draft-extraction.schema.ts` from `draft-jobs/ai/` to `jobs/ai/`. Updates all imports.
7. **Unify match analysis** — depends on step 3, 5. Removes `generateForDraft` from `MatchAnalysisService`. Internal source selection in `generate()`. Removes `DraftJobMatchResolver`. Removes `generateDraftJobMatch` mutation.
8. **Implement fillJobAutomatically** — depends on step 5, 6. Service: `fillJobAutomatically` + `processFillJob`. Background listener (`FillJobEventListener`). SSE events on job stream. `updateFillMetadata` in repository.
9. **Remove DraftJobsModule** — depends on step 5, 8. Deletes entire `domains/draft-jobs/` directory. Removes `DraftJobsModule` import from `JobsModule`. Removes `DraftConversionEventListener`. Removes `createJobWithAI` and `processDraftConversion` from `JobsService`.
10. **Remove DraftJobEntity + ConversionMetadataEmbedded** — depends on step 9. Deletes entity and embedded files.
11. **Codegen** — depends on step 5. Runs `pnpm --filter @job-tracker/web run codegen` to regenerate frontend hooks.
12. **Frontend: update Job detail page** — depends on step 11. Adds conditional "Source content" tab (when `htmlContent` present). Adds "Fill automatically" button in actions menu. Handles nullable title with fallback display.
13. **Frontend: update Job list page** — depends on step 11. Adds "Draft" quick filter option. Adds stage=DRAFT indicator on cards.
14. **Frontend: remove draft routes** — depends on step 12, 13. Deletes `/draft-jobs` and `/draft-jobs/[id]` routes. Deletes all draft-specific components, dialogs, view-models. Adds redirect from `/draft-jobs` to `/jobs?q=draft`.
15. **Extension update** — depends on step 9. Changes `createDraftJob` call to `createJob` with `htmlContent` field.

### Technical Dependencies

- **PostgreSQL**: Migration requires `ALTER TYPE application_stage ADD VALUE 'DRAFT'` (PG 9.1+)
- **AI extraction services**: `DraftExtractionService` and `DraftExtractionNormalizationService` are relocated, not rewritten. No external API changes.

## Monitoring and Observability

| Metric                      | Source                                                            | Alert                                           |
| --------------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `fill_job_processing_count` | `fillMetadata.status = PROCESSING` count                          | > 5 (backlog)                                   |
| `fill_job_failed_count`     | `fillMetadata.status = FAILED` count                              | > 0 (each failure)                              |
| `fill_job_duration_ms`      | `fillMetadata.timestamp - request start`                          | > 30000ms (stuck)                               |
| `migration_row_count`       | `SELECT count(*) FROM jobs WHERE stage = 'DRAFT'` after migration | Must equal pre-migration `draft_jobs` row count |

**Log events**: `FillJobRequested { jobId, userId }`, `FillJobCompleted { jobId, userId, duration }`, `FillJobFailed { jobId, userId, error }`

## Technical Considerations

### Key Decisions

- **Two mutations for fill** (ADR-002): Separation of extraction and stage transition avoids partial-failure ambiguity and reuses existing `createJobStageEvent`.
- **Single migration** (user choice): All schema changes in one migration for clean atomicity. Rollback via DB snapshot before running.
- **AsyncMetadataEmbedded reuse** (ADR-004): Same pattern as `summaryMetadata` — proven concurrency and staleness recovery.
- **Immediate removal of old mutations** (user choice): No deprecation window. Extension must be updated simultaneously.

### Known Risks

| Risk                             | Likelihood | Mitigation                                                                                                          |
| -------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| Migration data loss              | Low        | Transaction wrapping. Dry-run on production copy first.                                                             |
| `title` null breaks frontend     | Medium     | Systematic grep + null guard audit before merge. TypeScript compiler catches missing guards.                        |
| Extension calls removed mutation | Medium     | Coordinate deploy. Extension must be updated before API deploy.                                                     |
| Match analysis migration wrong   | Low        | UPDATE uses subquery joining `jobs` where `draft_job_id = match_analysis.draft_job_id`. Integration test validates. |
| Fill concurrency (double-click)  | Low        | Optimistic concurrency: if `fillMetadata.status` already PROCESSING, reject.                                        |

## Architecture Decision Records

- [ADR-001: Full Merge — Draft as Job Stage](adrs/adr-001.md) — Draft is eliminated as a separate entity; all draft data and behavior moves into Job
- [ADR-002: Two-Phase Fill — Separate Extraction from Stage Transition](adrs/adr-002.md) — `fillJobAutomatically` and `advanceJobStage` as separate mutations
- [ADR-003: Match Analysis Unification — Single Mutation, Single FK](adrs/adr-003.md) — Single `generateJobMatch` with internal source selection, drop `draftJobId` FK
- [ADR-004: Async Fill Tracking — Reuse AsyncMetadataEmbedded](adrs/adr-004.md) — Track fill progress via existing AsyncMetadataEmbedded on JobEntity
