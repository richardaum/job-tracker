---
status: pending
title: Frontend — Add Draft Filter + Indicator on Cards
type: frontend
complexity: medium
dependencies:
  - task_10
---

# Task 12: Frontend — Add Draft Filter + Indicator on Cards

## Overview

Add a "Draft" option to the quick filter bar on the job list page (`/jobs`). Selecting it filters the list to jobs with `stage = DRAFT`. Also add a visual indicator (badge or icon) on `JobCard` for jobs in DRAFT stage, so users can quickly distinguish unparsed imports from parsed jobs. Update `useJobsListViewModel` and `useQuickFilter` to support the new filter.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add "Draft" option to `QuickFilters` component — positioned alongside existing filters (Incoming, Active, Applied, New, Duplicated)
- MUST use `ApplicationQuickFilterEnum.DRAFT` from generated GraphQL types
- MUST wire the Draft filter to the `jobs` query's `quickFilter` parameter
- MUST add visual indicator on `JobCard` when `job.currentStage === ApplicationStageEnum.DRAFT`
- MUST use existing `StatusBadge` component for the DRAFT indicator (or create a new badge variant)
- MUST handle nullable title on `JobCard` — show placeholder text when title is null
- SHOULD ensure Draft filter resets correctly (clicking "All" clears it, clicking another filter replaces it)
- SHOULD follow existing `QuickFilters` pattern and styling

</requirements>

## Subtasks

- [ ] 12.1 Add "Draft" option to `QuickFilters` component
- [ ] 12.2 Add DRAFT stage indicator (badge) on `JobCard`
- [ ] 12.3 Handle nullable title on `JobCard` — fallback display
- [ ] 12.4 Update `useQuickFilter` hook to include DRAFT enum value
- [ ] 12.5 Update `useJobsListViewModel` / `useJobCardViewModel` to pass draft-related data

## Implementation Details

QuickFilters component (`apps/web/src/modules/jobs/list/components/QuickFilters.tsx`): add a `DRAFT` filter option following the existing pattern. The `ApplicationQuickFilterEnum.DRAFT` value is already available from the codegen (task_03 added it to the backend enum). The filter passes the enum value to the `jobs` GraphQL query which maps it to `WHERE stage = 'DRAFT'` on the backend.

JobCard indicator: add a visual element (e.g., colored badge with "Draft" text) when `job.currentStage === 'DRAFT'`. Use the existing `StatusBadge` or a simple inline indicator. Position it near the title or metadata row — follow the card layout pattern from the existing `JobCard`.

Nullable title on card: `{job.title ?? "Untitled Draft"}` or equivalent. Apply this fallback in `useJobCardViewModel`.

### Relevant Files

- `apps/web/src/modules/jobs/list/components/QuickFilters.tsx` — add DRAFT filter option
- `apps/web/src/modules/jobs/list/components/JobCard.tsx` — add DRAFT indicator + nullable title fallback
- `apps/web/src/modules/jobs/list/hooks/useQuickFilter.ts` — update to support DRAFT enum
- `apps/web/src/modules/jobs/list/hooks/useJobCardViewModel.ts` — pass nullable title handling
- `apps/web/src/modules/jobs/list/hooks/useJobsListViewModel.ts` — verify DRAFT filter flows to query
- `apps/web/src/modules/jobs/shared/components/StatusBadge.tsx` — may add DRAFT variant
- `apps/web/src/graphql/jobs.graphql` — verify `Jobs` query supports `quickFilter: DRAFT`

### Dependent Files

- `apps/web/src/modules/jobs/list/page/JobsPage.tsx` — parent page, filters already wired
- `apps/web/src/modules/jobs/list/page/JobsPage.test.tsx` — update tests for new filter
- `apps/web/src/modules/draft-jobs/list/page/DraftJobsPage.tsx` — will be deleted in task_13

### Related ADRs

- [ADR-001: Full Merge — Draft as Job Stage](../adrs/adr-001.md) — Draft filter replaces separate draft list page

## Deliverables

- Updated `QuickFilters` with DRAFT option
- Updated `JobCard` with draft indicator and nullable title handling
- Updated view-model hooks
- Unit tests with 80%+ coverage **(REQUIRED)**

## Tests

- Unit tests for QuickFilters:
  - [ ] "Draft" filter option rendered in filter bar
  - [ ] Clicking "Draft" passes `ApplicationQuickFilterEnum.DRAFT` to parent handler
  - [ ] "Draft" filter visually indicates active state when selected
  - [ ] Clicking "All" clears DRAFT filter
- Unit tests for JobCard:
  - [ ] Card shows draft badge/indicator when `currentStage === DRAFT`
  - [ ] Card does NOT show draft badge when `currentStage !== DRAFT`
  - [ ] Card shows "Untitled Draft" placeholder when title is null
  - [ ] Card shows actual title when title is non-null
- Unit tests for useQuickFilter:
  - [ ] `DRAFT` is an accepted filter value
  - [ ] Setting filter to DRAFT updates job list query
- Integration tests:
  - [ ] Job list loads with DRAFT filter — only DRAFT-stage jobs displayed
  - [ ] DRAFT job cards have visual indicator distinct from other stage cards
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- "Draft" filter appears in quick filter bar and filters list correctly
- DRAFT jobs have a visible badge/indicator on their card
- Null title jobs display placeholder text instead of blank or crash
- Switching filters (Draft → Active → All) works without stale data
