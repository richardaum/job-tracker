---
status: completed
title: Frontend — Add Source Content Tab + Fill Button to Job Detail
type: frontend
complexity: high
dependencies:
  - task_10
completed: 2026-05-22
---

# Task 11: Frontend — Add Source Content Tab + Fill Button to Job Detail

## Overview

Update the job detail page (`/jobs/[id]`) to show a conditional "Source content" tab when the job has `htmlContent` (DRAFT-origin or pre-fill jobs), and add a "Fill automatically" button in the actions area. The Source content tab renders the raw captured HTML in a sandboxed iframe, mirroring the previous draft "Captured" tab. The Fill button calls `fillJobAutomatically`, shows processing state via SSE on the job stream, and **does not** chain `createJobStageEvent` from the client — **task 08** promotes DRAFT → NEW inside transactional fill finalize; the frontend only refetches the job and timeline to reconcile cache.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add conditional "Source content" tab to `JobDetailsPage` — visible only when `job.htmlContent` is non-null
- MUST render `htmlContent` in a sandboxed iframe (same approach as prior draft "Captured" tab on `DraftJobDetailsPage`)
- MUST add "Fill automatically" button in the job detail header actions (available for ALL jobs, not just DRAFT)
- MUST implement fill button state: idle/default → loading while fill is in progress (`fillMetadata.status === PROCESSING` or mutation in flight)
- MUST call `useFillJobAutomaticallyMutation` on button click
- MUST listen for SSE `fill_status_changed` on `GET /jobs/:id/stream` (shared stream with summary events) and refetch when status is `COMPLETED` or `FAILED` so UI reflects backend updates
- MUST NOT call `createJobStageEvent` (DRAFT → NEW) after fill from the frontend — backend already performs promotion; avoid duplicate transitions
- MUST handle nullable title display — show placeholder **`Untitled Draft`** when title is null or blank (except in edit dialogs, which show the raw/nullable value)
- MUST ensure Source content tab coexists with Description tab when both `htmlContent` and `description` are present
- SHOULD follow existing tab pattern (`OverviewTabContent`, `DescriptionTabContent`) for the new tab
</requirements>

## Subtasks

- [x] 11.1 Create `SourceContentTabContent` — iframe rendering of `job.htmlContent`
- [x] 11.2 Add "Source content" tab to `JobDetailsPage` tab configuration (conditional on htmlContent)
- [x] 11.3 Add "Fill automatically" button to job detail header actions (next to Actions menu)
- [x] 11.4 Implement fill flow: mutation call → SSE listening → refetch on COMPLETED/FAILED (no client stage promotion)
- [x] 11.5 Handle nullable title — fallback in header, overview display, delete dialog summary
- [x] 11.6 Update `useJobDetailsViewModel` — fill button state, SSE, `triggerFillAutomatically`

## Deliverables

- New `SourceContentTabContent` component (sandboxed iframe)
- Updated `JobDetailsPage` with conditional Source content tab + Fill button
- `useJobDetailsSse` consolidates `summary_status_changed` + `fill_status_changed` on one EventSource (replaces duplicate stream in `OverviewTabContent`)
- Updated `useJobDetailsViewModel`
- Unit tests: title placeholder, `deriveJobFillButtonState`, `SourceContentTabContent` iframe/sandbox
- E2E fill flow: deferred (not in this delivery; page uses `React.use(params)` — RTL smoke would need Suspense/async harness)

## Verification

- `pnpm --filter @job-tracker/web typecheck lint test`

## GraphQL

- `apps/web/src/graphql/jobs.graphql`: `Job` query includes `htmlContent` + `fillMetadata` (task 10 baseline).

## Relevant files

- `apps/web/src/modules/jobs/details/page/JobDetailsPage.tsx`
- `apps/web/src/modules/jobs/details/components/SourceContentTabContent.tsx`
- `apps/web/src/modules/jobs/details/hooks/useJobDetailsViewModel.ts`
- `apps/web/src/modules/jobs/details/hooks/useJobDetailsSse.ts`
- `apps/web/src/modules/jobs/details/utils/job-detail-title.ts`
- `apps/web/src/modules/jobs/details/hooks/deriveJobFillButtonState.ts`
- `apps/web/src/modules/jobs/details/components/OverviewTabContent.tsx`
- `apps/api/src/domains/jobs/jobs-sse.controller.ts` — `fill_status_changed` event type
