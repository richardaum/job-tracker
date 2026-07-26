---
status: completed
title: "Web — QuickFilters + mutation refetch"
type: web
complexity: medium
dependencies:
  - task_03
---

# Task 04: Web — QuickFilters + mutation refetch

## Overview

Update `QuickFilters` to use `useQuickFilterCountsQuery`, render count badges inline, and add `QuickFilterCountsDocument` to `refetchQueries` on list-page mutations so counts update immediately after creating, deleting, or changing the stage of a job.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC "Impact Analysis" and "Development Sequencing" sections
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST use `useQuickFilterCountsQuery` in the `QuickFilters` component with `fetchPolicy: "cache-and-network"`
- MUST render count badge as `" ({count})"` inside `FilterChip` children when count > 0
- MUST hide badge entirely when count is 0
- MUST NOT change `FilterChip` component props
- MUST add `QuickFilterCountsDocument` to `refetchQueries` in DeleteJobDialog
- MUST add `QuickFilterCountsDocument` to `refetchQueries` in JobQuickEditDialog
- MUST add `QuickFilterCountsDocument` to `refetchQueries` in PasteListenerProvider
- MUST build a key map to match API enum keys (e.g., "Applied") to chip keys (e.g., "applied")
</requirements>

## Subtasks

- [ ] 4.1 Build `FILTER_COUNT_KEY_MAP` for API key → chip key lookup
- [ ] 4.2 Add `useQuickFilterCountsQuery` to QuickFilters component
- [ ] 4.3 Render count badge inside `FilterChip` children, hide when 0
- [ ] 4.4 Add `QuickFilterCountsDocument` to `refetchQueries` in DeleteJobDialog
- [ ] 4.5 Add `QuickFilterCountsDocument` to `refetchQueries` in JobQuickEditDialog
- [ ] 4.6 Add `QuickFilterCountsDocument` to `refetchQueries` in PasteListenerProvider
- [ ] 4.7 Write/update tests

## Implementation Details

**QuickFilters** (`apps/web/src/modules/jobs/list/components/QuickFilters.tsx`):

- Import `useQuickFilterCountsQuery`
- Call the hook alongside existing logic
- Build a lookup: `{ "draft": 5, "incoming": 12, ... }` from the API response
- Render `{label}{count > 0 && <span> ({count})</span>}` inside `FilterChip`

Key mapping: API returns `key` as PascalCase enum values (`"Applied"`, `"New"`). Chip keys are lowercase (`"applied"`, `"new"`). Use a simple map or `key.toLowerCase()`.

**Mutation files** (3 components):

- `apps/web/src/modules/jobs/list/components/DeleteJobDialog.tsx`
- `apps/web/src/modules/jobs/list/components/JobQuickEditDialog.tsx`
- `apps/web/src/modules/core/providers/PasteListenerProvider.tsx`

Import `QuickFilterCountsDocument` and add to `refetchQueries` array alongside `JobsDocument`.

### Relevant Files

- `apps/web/src/modules/jobs/list/components/QuickFilters.tsx` — Primary change
- `apps/web/src/modules/jobs/list/components/DeleteJobDialog.tsx` — Add refetchQueries
- `apps/web/src/modules/jobs/list/components/JobQuickEditDialog.tsx` — Add refetchQueries
- `apps/web/src/modules/core/providers/PasteListenerProvider.tsx` — Add refetchQueries
- `apps/web/src/modules/jobs/list/hooks/useQuickFilter.ts` — Has `PARAM_TO_FILTER` for reference
- `apps/web/src/modules/jobs/list/components/QuickFilters.test.tsx` — Test update

### Dependent Files

- None — terminal task

### Related ADRs

- [ADR-001: Static Count Badges for Quick Filters](../adrs/adr-001.md)
- [ADR-002: Separate GraphQL Query for Filter Counts](../adrs/adr-002.md)

## Deliverables

- `apps/web/src/modules/jobs/list/components/QuickFilters.tsx` — Modified
- `apps/web/src/modules/jobs/list/components/DeleteJobDialog.tsx` — Modified
- `apps/web/src/modules/jobs/list/components/JobQuickEditDialog.tsx` — Modified
- `apps/web/src/modules/core/providers/PasteListenerProvider.tsx` — Modified
- `apps/web/src/modules/jobs/list/components/QuickFilters.test.tsx` — Modified (or new tests)
- Unit tests with 80%+ coverage

## Tests

- Unit tests:
  - [ ] `QuickFilters` renders `"New (5)"` when count is 5
  - [ ] `QuickFilters` renders `"New"` without badge when count is 0
  - [ ] `QuickFilters` chip click still toggles the `?q=` filter parameter
  - [ ] `QuickFilters` active chip styling unchanged
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All quick filter chips show count badges (label + count)
- Zero-count chips show no badge
- After create/delete/stage-change on list page, counts update immediately
- Chip toggle behavior is unchanged
- All tests passing
