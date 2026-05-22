---
status: completed
title: Frontend — Remove Draft Routes and Components
type: frontend
complexity: medium
dependencies:
  - task_11
  - task_12
---

# Task 13: Frontend — Remove Draft Routes and Components

## Overview

Delete all draft-specific frontend code: routes (`/draft-jobs` and `/draft-jobs/[id]`), pages, components, dialogs, view-models, hooks, and GraphQL operations. Add a redirect from `/draft-jobs` to `/jobs?q=draft` so bookmarked URLs don't 404. After this task, the only code paths for interacting with imported content are through the unified Job pages.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST delete `apps/web/src/app/(authenticated)/draft-jobs/page.tsx` route
- MUST delete `apps/web/src/app/(authenticated)/draft-jobs/[id]/page.tsx` route
- MUST add redirect from `/draft-jobs` to `/jobs?q=draft` (Next.js redirect in next.config or a simple redirect page)
- MUST delete `DraftJobsPage` component
- MUST delete `DraftJobDetailsPage` component
- MUST delete `DraftJobCard` component
- MUST delete all draft dialog components (5 files): `ConvertDraftConfirmationDialog`, `ConvertDraftConflictDialog`, `DraftCurrentJobField`, `DraftTitleEditDialog`, `DraftJobSidePanel`, `DeleteDraftJobDialog`
- MUST delete `ConversionStatusBadge` component
- MUST delete all draft view-model hooks: `useDraftJobsListViewModel`, `useDraftJobDetailsViewModel`, `useDraftAutoConversion`
- MUST delete `apps/web/src/graphql/draft-jobs.graphql` (if not already done in task_10)
- MUST remove any draft-related imports from shared modules or barrel files
- SHOULD verify no remaining imports to `@/modules/draft-jobs` anywhere in `apps/web`
- SHOULD verify `pnpm typecheck` passes for `apps/web`

</requirements>

## Subtasks

- [x] 13.1 Delete `/draft-jobs` and `/draft-jobs/[id]` Next.js routes
- [x] 13.2 Add redirect from `/draft-jobs` to `/jobs?q=draft`
- [x] 13.3 Delete `DraftJobsPage`, `DraftJobDetailsPage`, `DraftJobCard`
- [x] 13.4 Delete all draft dialog components (6 files)
- [x] 13.5 Delete `ConversionStatusBadge`
- [x] 13.6 Delete draft view-model hooks (3 files)
- [x] 13.7 Verify zero draft imports remain in `apps/web`

## Implementation Details

Deletion scope — all files under:

- `apps/web/src/modules/draft-jobs/` — entire directory (list + details subdirectories)
- `apps/web/src/app/(authenticated)/draft-jobs/` — route directory

Redirect approach: simplest is a `redirect()` in the old route file, or add `redirects` in `next.config.ts`. The redirect should preserve the query intent: `/draft-jobs` → `/jobs?q=draft`.

Verify after deletion:

- `pnpm typecheck` for web passes
- No imports to `@/modules/draft-jobs` remain (search with grep)
- No references to deleted components in tests or stories

### Relevant Files

- `apps/web/src/app/(authenticated)/draft-jobs/page.tsx` — delete (route)
- `apps/web/src/app/(authenticated)/draft-jobs/[id]/page.tsx` — delete (route)
- `apps/web/src/modules/draft-jobs/list/page/DraftJobsPage.tsx` — delete
- `apps/web/src/modules/draft-jobs/list/components/DraftJobCard.tsx` — delete
- `apps/web/src/modules/draft-jobs/list/components/DeleteDraftJobDialog.tsx` — delete
- `apps/web/src/modules/draft-jobs/list/hooks/useDraftJobsListViewModel.ts` — delete
- `apps/web/src/modules/draft-jobs/details/page/DraftJobDetailsPage.tsx` — delete (560 lines)
- `apps/web/src/modules/draft-jobs/details/components/DraftJobSidePanel.tsx` — delete
- `apps/web/src/modules/draft-jobs/details/components/ConvertDraftConfirmationDialog.tsx` — delete
- `apps/web/src/modules/draft-jobs/details/components/ConvertDraftConflictDialog.tsx` — delete
- `apps/web/src/modules/draft-jobs/details/components/DraftCurrentJobField.tsx` — delete
- `apps/web/src/modules/draft-jobs/details/components/DraftTitleEditDialog.tsx` — delete
- `apps/web/src/modules/draft-jobs/details/hooks/useDraftJobDetailsViewModel.ts` — delete
- `apps/web/src/modules/draft-jobs/details/hooks/useDraftAutoConversion.ts` — delete
- `apps/web/src/graphql/draft-jobs.graphql` — delete (if not done in task_10)

### Dependent Files

- `apps/web/src/modules/jobs/list/page/JobsPage.tsx` — may import from draft jobs module for conversion logic; remove
- `apps/web/src/modules/jobs/list/components/JobCard.tsx` — verify no draft imports
- `apps/web/src/app/(authenticated)/layout.tsx` or navigation — verify no draft-jobs nav links

### Related ADRs

- [ADR-001: Full Merge — Draft as Job Stage](../adrs/adr-001.md) — Route consolidation: draft routes removed, unified under /jobs

## Deliverables

- Deleted draft routes, pages, components, dialogs, view-models
- Redirect from `/draft-jobs` to `/jobs?q=draft`
- Zero draft imports remaining in `apps/web`
- Unit tests with 80%+ coverage **(REQUIRED)**

## Tests

- Unit tests:
  - [x] `/draft-jobs` route returns redirect (301 or 302) to `/jobs?q=draft`
  - [x] `/draft-jobs/[id]` route returns redirect or 404 (no crash)
  - [x] No component or hook imports from `@/modules/draft-jobs` in any file
  - [x] Web typecheck passes with no draft-related errors
- E2E tests:
  - [x] Jobs list respects `q=draft` entry (bookmark-style returnTo)
  - [x] Paste → job detail fires automatic fill toast (replacing `/draft-jobs/[id]` flow)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- `/draft-jobs` and `/draft-jobs/[id]` routes no longer exist
- `/draft-jobs` redirects to `/jobs?q=draft` (not 404)
- `pnpm typecheck` and `pnpm lint` pass for `apps/web`
- Zero files remain under `apps/web/src/modules/draft-jobs/`
- No broken imports or dead code references in `apps/web`
