---
status: completed
title: "Resume detail under profile + path updates + remove old routes"
type: frontend
complexity: high
dependencies: [task_08]
---

# Task 09: Resume detail under profile + path updates + remove old routes

## Overview

Create `ResumeDetailPage` under the profile route at `/profile/resumes/[id]`, update `ResumeCard` and `AddResumeDialog` to point to the new paths, and delete the old `/resumes` route files. This completes the migration of resume management into the profile.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `ResumeDetailPage` at `apps/web/src/modules/profile/resumes/[id]/page/ResumeDetailPage.tsx` — nearly identical to `ResumeDetailsPage` with updated back links and redirect paths
- MUST change `BackToLink` href from `/resumes` to `/profile/resumes`
- MUST change `EntityNotFound` `backHref` to `/profile/resumes`
- MUST change delete success redirect from `/resumes` to `/profile/resumes`
- MUST update `/profile/resumes/[id]/page.tsx` to re-export `ResumeDetailPage`
- MUST update `ResumeCard` link href from `/resumes/${resume.id}` to `/profile/resumes/${resume.id}`
- MUST update `AddResumeDialog` navigation from `router.push(/resumes/${data.createResume.id})` to `/profile/resumes/${id}`
- MUST delete old route files: `apps/web/src/app/(authenticated)/resumes/page.tsx` and `apps/web/src/app/(authenticated)/resumes/[id]/page.tsx`
- MUST NOT change the existing `ResumeDetailsPage` — it remains reusable by both old and new routes (if still referenced, or becomes unused)
</requirements>

## Subtasks

- [ ] 9.1 Read `ResumeDetailsPage.tsx` — understand all navigation points (BackToLink, EntityNotFound, delete redirect)
- [ ] 9.2 Create `ResumeDetailPage.tsx` with updated navigation paths
- [ ] 9.3 Update `/profile/resumes/[id]/page.tsx` re-export
- [ ] 9.4 Update `ResumeCard.tsx` link href
- [ ] 9.5 Update `AddResumeDialog.tsx` navigation path
- [ ] 9.6 Delete old route files: `/(authenticated)/resumes/page.tsx` and `/(authenticated)/resumes/[id]/page.tsx`
- [ ] 9.7 Update `ResumeDetailsPage.tsx` backHref and redirect paths (if it still exists as separate component)

## Implementation Details

See TechSpec § Frontend — Resumes Tab, ADR-004 for route migration details.

The new `ResumeDetailPage` follows the same pattern as `ResumeDetailsPage`: `useResumeDetailsViewModel(id, onSaved)`, TipTap editor, dialog hooks for delete and title edit. Only navigation URLs change.

`ResumeCard` link is at the card level — update the `href` prop on the wrapping `NextLink` or `href` attribute.

`AddResumeDialog` navigation: find `router.push(`/resumes/${...}`)` and change to `/profile/resumes/${...}`.

Old route deletion: remove the 2 `.tsx` files entirely. Verify no other imports reference these files before deleting.

### Relevant Files

- `apps/web/src/modules/resumes/details/page/ResumeDetailsPage.tsx` — pattern to follow for new detail page
- `apps/web/src/modules/resumes/list/components/ResumeCard.tsx` — hardcoded `/resumes/` link
- `apps/web/src/modules/resumes/list/components/AddResumeDialog.tsx` — hardcoded navigation
- `apps/web/src/app/(authenticated)/resumes/page.tsx` — old list route (DELETE)
- `apps/web/src/app/(authenticated)/resumes/[id]/page.tsx` — old detail route (DELETE)
- `apps/web/src/app/(authenticated)/profile/resumes/[id]/page.tsx` — new route re-export

### Dependent Files

None — this is the final step in the resume migration chain.

### Related ADRs

- [ADR-004: Resumes Extraction and Route Migration](../adrs/adr-004.md) — Remove old routes, recreate under `/profile/resumes/`

## Deliverables

- `apps/web/src/modules/profile/resumes/[id]/page/ResumeDetailPage.tsx`
- Updated `apps/web/src/app/(authenticated)/profile/resumes/[id]/page.tsx`
- Updated `apps/web/src/modules/resumes/list/components/ResumeCard.tsx`
- Updated `apps/web/src/modules/resumes/list/components/AddResumeDialog.tsx`
- Updated `apps/web/src/modules/resumes/details/page/ResumeDetailsPage.tsx` (backHref + redirect)
- Deleted `apps/web/src/app/(authenticated)/resumes/page.tsx`
- Deleted `apps/web/src/app/(authenticated)/resumes/[id]/page.tsx`

## Tests

Tests written in task_11. Requirements:

- No component-level tests for ResumeDetailPage (functionally identical to ResumeDetailsPage which already has tests)
- Verify via E2E: navigating to old `/resumes` returns 404
- Verify via E2E: creating a resume navigates to `/profile/resumes/[id]`
- Verify via E2E: clicking a resume card navigates to `/profile/resumes/[id]`
- Verify via E2E: deleting a resume redirects to `/profile/resumes`

## Success Criteria

- `/profile/resumes/[id]` renders the resume editor with correct back link
- `BackToLink` on detail page points to `/profile/resumes`
- Delete redirects to `/profile/resumes`
- `ResumeCard` links to `/profile/resumes/[id]`
- `AddResumeDialog` navigates to `/profile/resumes/[id]` after creation
- Old `/resumes` routes return 404
- `pnpm --filter web typecheck` passes
- `pnpm lint` passes
- `pnpm knip` reports no dead code
