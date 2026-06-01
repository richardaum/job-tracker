---
status: completed
title: "Component: ExportJobMdMenuItem"
type: web
complexity: low
dependencies:
  - task_01
---

# Task 02: Component: ExportJobMdMenuItem

## Overview

Create a `ExportJobMdMenuItem` component that renders as a `<DropdownMenuItem>` inside the Actions dropdown. On click, it fetches notes and stage events on demand via Apollo's `useLazyQuery`, generates the Markdown using the utilities from task_01, and triggers the download. Shows a loading state while fetching.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST render a `<DropdownMenuItem>` with label "Export as Markdown"
- MUST accept `jobId: string` and `job: JobQuery["job"]` props
- MUST use `useLazyQuery` (not `useQuery`) for both `JobNotes` and `JobStageEvents`
- MUST show loading state on the menu item while fetching
- MUST call `formatJobAsMarkdown()` and `downloadMarkdown()` from task_01 utilities
- MUST use an appropriate Phosphor icon (e.g. `FileArrowDownIcon`)
- MUST follow the same icon size/weight conventions as other menu items (size=14, weight="regular")
</requirements>

## Subtasks

- [x] 02.1 Create `ExportJobMdMenuItem.tsx` with props, lazy queries, and click handler
- [x] 02.2 Wire the loading state into the menu item's disabled/visual state
- [x] 02.3 Write unit tests for the component

## Implementation Details

Create file `apps/web/src/modules/jobs/details/components/ExportJobMdMenuItem.tsx`.

- Import `FileArrowDownIcon` from `@phosphor-icons/react`
- Import generated hooks from `@/gql/hooks` for lazy queries
- Import utilities from `../utils/export-job-md`
- On click: set loading, fire both lazy queries in parallel via `Promise.all`, generate MD, download, reset loading

### Relevant Files

- `apps/web/src/modules/jobs/details/components/ExportJobMdMenuItem.tsx` — file to create
- `apps/web/src/modules/jobs/details/utils/export-job-md.ts` — utility from task_01
- `apps/web/src/graphql/jobs.graphql` — GraphQL operations for JobNotes and JobStageEvents
- `apps/web/src/modules/jobs/details/components/MatchTabContent.tsx` — reference for DropdownMenuItem icon pattern
- `apps/web/src/modules/jobs/details/page/JobDetailsLayout.tsx` — where this component will be mounted (task_03)

### Dependent Files

- `apps/web/src/modules/jobs/details/page/JobDetailsLayout.tsx` — will import and mount this component

### Related ADRs

- [ADR-002: On-Demand Fetch with Export Component](../adrs/adr-002.md) — Lazy-fetch notes and stage events on export click

## Deliverables

- `apps/web/src/modules/jobs/details/components/ExportJobMdMenuItem.tsx`
- Unit tests with 80%+ coverage **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] Component renders a DropdownMenuItem with "Export as Markdown" label
  - [ ] Click triggers lazy queries and shows loading state
  - [ ] On query success, calls downloadMarkdown with correct content and filename
  - [ ] On error, shows error toast and resets loading state
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Component renders correctly in the Actions dropdown context
