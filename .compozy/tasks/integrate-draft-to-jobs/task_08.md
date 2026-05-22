---
status: pending
title: Implement fillJobAutomatically with SSE Tracking
type: backend
complexity: high
dependencies:
  - task_05
  - task_06
---

# Task 08: Implement fillJobAutomatically with SSE Tracking

## Overview

Implement the async "Fill automatically" pipeline. `fillJobAutomatically` sets `fillMetadata.status = PROCESSING`, emits a domain event, and returns immediately. A background listener calls AI extraction (moved in task_06), normalizes results, and writes extracted fields to the same Job in-place. On completion, `fillMetadata.status = COMPLETED` and an SSE event is emitted on the existing Job SSE stream. On failure, `fillMetadata.status = FAILED` with error details. Reuse the `AsyncMetadataEmbedded` pattern already established for `summaryMetadata`.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST implement `fillJobAutomatically(userId, jobId)` in `JobsService`: fetch job, validate not already PROCESSING, set fillMetadata.status=PROCESSING atomically, emit `FillJobRequested` event, return job
- MUST implement `processFillJob(userId, jobId)` in `JobsService`: background worker that calls AI extraction, normalizes, updates job fields in-place (title, company, description, salary, tags, location, workRegion), sets fillMetadata.status=COMPLETED, emits `FillJobCompleted` event
- MUST implement `updateFillMetadata(jobId, userId, metadata)` in `JobsRepository`: atomic JSONB update with optimistic concurrency (`WHERE fill_status = expectedStatus`)
- MUST create `FillJobEventListener` that listens for `FillJobRequested` and delegates to `processFillJob`
- MUST create domain events: `FillJobRequested`, `FillJobCompleted`, `FillJobFailed`
- MUST emit SSE `fill_status_changed` events on the existing `JobsSseController` (job SSE stream)
- MUST handle extraction failure: catch errors, set fillMetadata.status=FAILED with error message, emit `FillJobFailed` event
- MUST implement stale recovery in `OnModuleInit`: reset any `fillMetadata.status = PROCESSING` to `FAILED` on startup
- MUST reject concurrent fill requests: if `fillMetadata.status` is already `PROCESSING`, throw `BadRequestException("Fill already in progress")`
- SHOULD update `JobsModule` to register `FillJobEventListener` and `FillJobRequested`/`FillJobCompleted`/`FillJobFailed` events

</requirements>

## Subtasks

- [ ] 8.1 Create domain events: `FillJobRequested`, `FillJobCompleted`, `FillJobFailed`
- [ ] 8.2 Implement `updateFillMetadata` in `JobsRepository` (atomic JSONB, optimistic concurrency)
- [ ] 8.3 Implement `fillJobAutomatically` in `JobsService` (validate, set PROCESSING, emit event)
- [ ] 8.4 Implement `processFillJob` in `JobsService` (extract, normalize, update in-place, set COMPLETED/FAILED)
- [ ] 8.5 Create `FillJobEventListener` (subscribes to `FillJobRequested`, calls `processFillJob`)
- [ ] 8.6 Emit SSE `fill_status_changed` events in `JobsSseController`
- [ ] 8.7 Implement stale recovery in `OnModuleInit` (reset PROCESSING → FAILED)

## Implementation Details

Service contract follows the existing `summaryMetadata` pattern:

```typescript
async fillJobAutomatically(userId: string, jobId: string): Promise<JobType> {
  const job = await this.findOne(jobId, userId);
  if (job.fillMetadata?.status === AsyncMetadataStatusEnum.PROCESSING) {
    throw new BadRequestException("Fill already in progress");
  }
  await this.repository.updateFillMetadata(jobId, userId, {
    status: AsyncMetadataStatusEnum.PROCESSING,
  });
  this.eventBus.emit(new FillJobRequested(jobId, userId));
  return this.findOne(jobId, userId);
}
```

The `processFillJob` background method:

1. Fetch job with current data
2. Determine AI input source: `job.htmlContent` (primary) or `job.urls` (fallback for URL-based extraction)
3. Call relocated `DraftExtractionService.extract(source)`
4. Normalize via `DraftExtractionNormalizationService.normalize(extraction)`
5. Update job fields: title, company, description, salary (as SalaryEmbedded), tags, location, workRegion
6. Set `fillMetadata.status = COMPLETED` with timestamp
7. Emit `FillJobCompleted` event (which triggers SSE)

SSE integration: in `JobsSseController`, listen for `FillJobCompleted` / `FillJobFailed` events and push `fill_status_changed` messages to the job's SSE stream.

### Relevant Files

- `apps/api/src/domains/jobs/jobs.service.ts` — add `fillJobAutomatically` and `processFillJob` methods
- `apps/api/src/domains/jobs/jobs.repository.ts` — add `updateFillMetadata` method
- `apps/api/src/domains/jobs/job.events.ts` — add `FillJobRequested`, `FillJobCompleted`, `FillJobFailed` event classes
- `apps/api/src/domains/jobs/job-event.bus.ts` — register new events (or they auto-resolve via NestJS EventBus)
- `apps/api/src/domains/jobs/jobs-sse.controller.ts` — add SSE handling for fill status events
- `apps/api/src/domains/jobs/jobs.module.ts` — register new listener, events, providers
- `apps/api/src/domains/jobs/ai/draft-extraction.service.ts` — (relocated in task_06) called by `processFillJob`
- `apps/api/src/domains/jobs/ai/draft-extraction-normalization.service.ts` — (relocated in task_06) normalizes AI output
- `apps/api/src/database/embeddeds/async-metadata.embedded.ts` — AsyncMetadataEmbedded pattern (used by fillMetadata)
- `apps/api/src/domains/shared/async-metadata.type.ts` — AsyncMetadataStatusEnum (PENDING, PROCESSING, COMPLETED, FAILED)
- `apps/api/src/domains/jobs/jobs.service.spec.ts` — add tests for `fillJobAutomatically` and `processFillJob`
- `apps/api/src/domains/jobs/jobs.repository.spec.ts` — add tests for `updateFillMetadata` (created in task_01)

### Dependent Files

- `apps/api/src/domains/jobs/jobs.resolver.ts` — `fillJobAutomatically` mutation (defined in task_05) delegates to `jobsService.fillJobAutomatically`
- `apps/api/src/schema.gql` — regenerated after mutations and types finalized

### Related ADRs

- [ADR-002: Two-Phase Fill](../adrs/adr-002.md) — Defines two-mutation fill: extraction (this task) + stage transition (existing `createJobStageEvent`)
- [ADR-004: Async Fill Tracking](../adrs/adr-004.md) — Defines fillMetadata via AsyncMetadataEmbedded, SSE integration, stale recovery

## Deliverables

- `fillJobAutomatically` and `processFillJob` in `JobsService`
- `updateFillMetadata` in `JobsRepository`
- `FillJobRequested`, `FillJobCompleted`, `FillJobFailed` event classes
- `FillJobEventListener` background worker
- SSE `fill_status_changed` events on job stream
- Stale recovery on `OnModuleInit`
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for fill flow **(REQUIRED)**

## Tests

- Unit tests for `fillJobAutomatically`:
  - [ ] Sets fillMetadata.status to PROCESSING and returns job immediately (does not block)
  - [ ] Emits `FillJobRequested` event with correct jobId and userId
  - [ ] Rejects with `BadRequestException` when fillMetadata.status is already PROCESSING
  - [ ] Rejects when job not found (standard 404)
- Unit tests for `processFillJob`:
  - [ ] Calls extraction service with job.htmlContent as source
  - [ ] Normalizes extraction output and updates job fields in-place (title, company, description, salary, tags, location, workRegion)
  - [ ] Updates salary fields via SalaryEmbedded.normalize()
  - [ ] Sets fillMetadata.status = COMPLETED with timestamp on success
  - [ ] Sets fillMetadata.status = FAILED with error message on extraction failure
  - [ ] Emits `FillJobCompleted` event on success
  - [ ] Emits `FillJobFailed` event on failure
- Unit tests for `updateFillMetadata`:
  - [ ] Atomic update with optimistic concurrency — succeeds when status matches expected
  - [ ] Atomic update fails silently when status changed by another process
- Unit tests for stale recovery:
  - [ ] `OnModuleInit` resets PROCESSING records to FAILED
  - [ ] Does not affect COMPLETED or FAILED records
- Integration tests:
  - [ ] End-to-end fill flow: create job with htmlContent → call fillJobAutomatically → wait for COMPLETED → verify job fields populated
  - [ ] SSE stream emits `fill_status_changed` events during fill
  - [ ] Concurrent fill request rejected while PROCESSING
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- `fillJobAutomatically` returns immediately (non-blocking), fillMetadata.status = PROCESSING
- Background worker completes fill and sets status to COMPLETED
- Extracted fields (title, company, description, salary, tags, location, workRegion) are written to the same Job
- SSE stream emits fill status changes
- Stale PROCESSING records reset to FAILED on API restart
- Concurrent fill requests rejected cleanly
