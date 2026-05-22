---
status: pending
title: Frontend — Add Source Content Tab + Fill Button to Job Detail
type: frontend
complexity: high
dependencies:
  - task_10
---

# Task 11: Frontend — Add Source Content Tab + Fill Button to Job Detail

## Overview

Update the job detail page (`/jobs/[id]`) to show a conditional "Source content" tab when the job has `htmlContent` (DRAFT-origin or pre-fill jobs), and add a "Fill automatically" button in the actions menu. The Source content tab renders the raw captured HTML in an iframe, mirroring the current "Captured" tab from the draft detail page. The Fill button calls `fillJobAutomatically` mutation, shows processing state via SSE, then optionally triggers `createJobStageEvent` (DRAFT → NEW) when fill completes.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add conditional "Source content" tab to `JobDetailsPage` — visible only when `job.htmlContent` is non-null
- MUST render `htmlContent` in a sandboxed iframe (same approach as current draft "Captured" tab)
- MUST add "Fill automatically" button in the job detail actions menu (available for ALL jobs, not just DRAFT)
- MUST implement fill button state: idle → loading (fill in progress via SSE) → completed → error
- MUST call `useFillJobAutomaticallyMutation` on button click
- MUST listen for SSE `fill_status_changed` events to update fill progress in real-time
- MUST optionally auto-call `createJobStageEvent` (DRAFT → NEW) when fill completes and job is DRAFT (ADR-002 chaining)
- MUST handle nullable title display — show placeholder text (e.g., "Untitled Draft") when title is null
- MUST ensure Source content tab coexists with Description tab when both `htmlContent` and `description` are present
- SHOULD follow existing tab pattern (see `OverviewTabContent`, `DescriptionTabContent`) for the new tab
- SHOULD use `useControllableState` pattern for fill button loading state

</requirements>

## Subtasks

- [ ] 11.1 Create `SourceContentTab` component — iframe rendering of `job.htmlContent`
- [ ] 11.2 Add "Source content" tab to `JobDetailsPage` tab configuration (conditional on htmlContent)
- [ ] 11.3 Add "Fill automatically" button to job detail actions menu (DropdownMenu or standalone button)
- [ ] 11.4 Implement fill flow: mutation call → SSE listening → completion → optional advance to NEW
- [ ] 11.5 Handle nullable title — fallback display in header, tabs, and overview
- [ ] 11.6 Update `useJobDetailsViewModel` to provide fill-related state and handlers

## Implementation Details

Tab architecture follows existing pattern in `JobDetailsPage.tsx`:

```
Overview | Description | [Source content] | Match
```

Source content tab appears only when `htmlContent` is non-null. When screen width is small and tabs merge (side column content becomes extra tabs), Source content tab is added to the main tab list.

The Fill button placement: in the detail page header's actions control, alongside existing buttons (Update Status, etc.). Button uses the `state` prop pattern (`"default" | "loading"`) per web-ui.md conventions.

SSE integration: use the existing `EventSource` or polling hook for the job SSE stream (`jobs/:id/stream`). Listen for `fill_status_changed` events. When status becomes `COMPLETED`, optionally call `createJobStageEvent` with `DRAFT → NEW` if the job's current stage is DRAFT.

Nullable title fallback: use `job.title ?? "Untitled Draft"` or equivalent. Apply to: page header, card title in list, stage timeline, activity panel. Do NOT apply fallback in edit dialogs (user should see the actual value).

### Relevant Files

- `apps/web/src/modules/jobs/details/page/JobDetailsPage.tsx` — add Source content tab + Fill button
- `apps/web/src/modules/jobs/details/components/OverviewTabContent.tsx` — handle nullable title display
- `apps/web/src/modules/jobs/details/components/DescriptionTabContent.tsx` — verify coexistence with Source content tab
- `apps/web/src/modules/jobs/details/hooks/useJobDetailsViewModel.ts` — add fill-related state (fillStatus, triggerFill, etc.)
- `apps/web/src/modules/jobs/shared/components/StatusBadge.tsx` — add DRAFT stage display
- `apps/web/src/graphql/jobs.graphql` — FillJobAutomatically mutation (added in task_10)
- `apps/web/src/gql/hooks/` — generated hooks from task_10

### Dependent Files

- `apps/web/src/modules/draft-jobs/details/page/DraftJobDetailsPage.tsx` — source of iframe rendering pattern for Source content tab; will be deleted in task_13
- `apps/web/src/modules/jobs/list/components/JobCard.tsx` — may need nullable title handling (task_12)
- `apps/web/src/modules/jobs/details/components/StageTimeline.tsx` — may need DRAFT stage display

### Related ADRs

- [ADR-001: Full Merge — Draft as Job Stage](../adrs/adr-001.md) — Source content tab on Job detail
- [ADR-002: Two-Phase Fill](../adrs/adr-002.md) — Fill button calls `fillJobAutomatically`, chains `createJobStageEvent`

## Deliverables

- New `SourceContentTab` component (or inline) with sandboxed iframe
- Updated `JobDetailsPage` with conditional Source content tab
- "Fill automatically" button in job detail actions
- Fill flow with SSE progress tracking
- Nullable title fallback across detail page
- Updated `useJobDetailsViewModel`
- Unit tests with 80%+ coverage **(REQUIRED)**
- E2E tests for fill flow **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] Source content tab visible when `job.htmlContent` is non-null
  - [ ] Source content tab NOT visible when `job.htmlContent` is null
  - [ ] Source content tab renders iframe with sandbox attributes
  - [ ] Fill button calls `useFillJobAutomaticallyMutation` on click
  - [ ] Fill button shows loading state when `fillMetadata.status === PROCESSING`
  - [ ] Fill button shows error state when `fillMetadata.status === FAILED`
  - [ ] Title displays "Untitled Draft" (or equivalent placeholder) when `title` is null
  - [ ] Title displays actual value when `title` is non-null
  - [ ] Source content and Description tabs coexist when both `htmlContent` and `description` present
- E2E tests:
  - [ ] Navigate to DRAFT job → Source content tab visible, Fill button visible
  - [ ] Click Fill → loading state shown → fields populate → stage still DRAFT
  - [ ] Advance to NEW via createJobStageEvent after fill
  - [ ] Navigate to non-DRAFT job → Source content tab NOT visible (no htmlContent)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- DRAFT jobs show Source content tab with captured HTML rendered in iframe
- Fill button works for DRAFT jobs (populates fields, leaves stage as DRAFT)
- Fill button works for non-DRAFT jobs (re-enriches fields, stage unchanged)
- Null title edge cases handled gracefully (no crashes, no empty headers)
- Desktop and mobile tab layouts include Source content tab when applicable
