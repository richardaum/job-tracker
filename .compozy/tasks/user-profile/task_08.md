---
status: completed
title: "Extract ResumesList + Resumes tab page"
type: frontend
complexity: medium
dependencies: [task_04]
---

# Task 08: Extract ResumesList + Resumes tab page

## Overview

Extract the list content body (resume cards, skeleton, empty, error states) from `ResumesPage` into a reusable `ResumesList` component. Create `ResumesTabPage` that renders the Resumes tab with its own action bar and `ResumesList`, plus dialogs for create and preferences. This becomes the content of `/profile/resumes`.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `ResumesList` at `apps/web/src/modules/resumes/list/components/ResumesList.tsx`
- MUST support props: `resumes: ResumeType[]`, `loading: boolean`, `error?: ApolloError`, `onDelete: (id: string, title: string) => Promise<void>`, `onSetAsDefault: (id: string) => Promise<void>`
- MUST render: loading → skeleton, error → error text, empty → empty state, data → `Stack` of `ResumeCard`
- MUST NOT render page chrome (no BackToLink, no action bar) — content only
- MUST create `ResumesTabPage` at `apps/web/src/modules/profile/resumes/page/ResumesTabPage.tsx`
- MUST render action bar with "Add resume" button (and optionally "Work Preferences" quick-access button)
- MUST render `<ResumesList>` with data from `useResumesQuery`
- MUST include `<AddResumeDialog>` and `<PreferencesDialog>` inline
- MUST handle delete mutation with confirmation and cache update
- MUST update `/profile/resumes/page.tsx`

## Subtasks

- [ ] 8.1 Read `ResumesPage.tsx` — identify content body vs page chrome boundary
- [ ] 8.2 Create `ResumesList.tsx` with 4 states (loading, error, empty, data)
- [ ] 8.3 Create `ResumesTabPage.tsx` with action bar + ResumesList + dialogs
- [ ] 8.4 Verify `ResumesPage` still works after extraction (extraction should not break existing page)
- [ ] 8.5 Update `/profile/resumes/page.tsx`

## Implementation Details

See TechSpec § Frontend — Resumes Tab and ADR-004 for extraction boundaries.

Extraction boundary: `ResumesPage` lines 146-180 (the content body after the action bar). The action bar (lines 111-144) stays in `ResumesPage` and a similar one goes into `ResumesTabPage`.

`ResumesList` receives data + callbacks as props — no queries/mutations inside it. This keeps it reusable and testable.

`ResumesTabPage` manages: `useResumesQuery`, `useDeleteResumeMutation`, `useUpdateResumeMutation` (set default), `useDialog` for Add/Delete.

Cache update: use `removeDeletedEntityFromListCache` from `apps/web/src/modules/applications/shared/utils/apolloDeleteCache.ts`.

### Relevant Files

- `apps/web/src/modules/resumes/list/page/ResumesPage.tsx` — source to extract from (182 lines)
- `apps/web/src/modules/resumes/list/components/ResumeCard.tsx` — card component used in list
- `apps/web/src/modules/resumes/list/components/AddResumeDialog.tsx` — create dialog
- `apps/web/src/modules/work-preferences/components/PreferencesDialog.tsx` — preferences modal (updated in task_07)
- `apps/web/src/modules/applications/shared/utils/apolloDeleteCache.ts` — `removeDeletedEntityFromListCache`
- `apps/web/src/app/(authenticated)/profile/resumes/page.tsx` — route re-export

### Dependent Files

- `apps/web/src/modules/profile/resumes/[id]/page/ResumeDetailPage.tsx` — detail page linked from card (task_09)

### Related ADRs

- [ADR-004: Resumes Extraction and Route Migration](../adrs/adr-004.md) — Extract `ResumesList`, remove old routes, recreate under `/profile/resumes/`

## Deliverables

- `apps/web/src/modules/resumes/list/components/ResumesList.tsx`
- `apps/web/src/modules/profile/resumes/page/ResumesTabPage.tsx`
- Updated `apps/web/src/app/(authenticated)/profile/resumes/page.tsx`

## Tests

Tests written in task_11. Requirements:

- Component test (`ResumesList.test.tsx`):
  - [ ] Loading state: renders skeleton
  - [ ] Empty state: renders "No resumes yet" or similar
  - [ ] Error state: renders error message
  - [ ] Data state: renders `Stack` of `ResumeCard` components
  - [ ] Calls `onDelete` when delete action triggered on a card
  - [ ] Calls `onSetAsDefault` when star action triggered
- Component test (`ResumesTabPage.test.tsx`):
  - [ ] Renders "Add resume" button
  - [ ] Clicking "Add resume" opens `AddResumeDialog`
  - [ ] Shows empty state when no resumes exist
  - [ ] Shows cards when resumes exist
- Test coverage target: >=80%

## Success Criteria

- `/profile/resumes` renders resume cards in a list
- "Add resume" button opens create dialog
- Delete removes card from list with confirmation
- Empty state displays correctly for new users
- `ResumesPage` (old `/resumes` route) still works unchanged
- `pnpm --filter web typecheck` passes
- `pnpm lint` passes
