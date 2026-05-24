---
id: T-04
status: completed
title: Add redirect + delete standalone match routes
type: frontend
complexity: medium
depends_on: [T-03]
---

# Task 04: Add redirect + delete standalone match routes

## Overview

Add a permanent redirect (308) from `/matches/:id` to `/jobs/:id/match` in the legacy route redirects config. Delete all standalone match route files and page components: the Next.js route files under `app/(authenticated)/matches/`, the `MatchAnalysisPage` component, and the `MatchAnalysesPage` component. Update the redirect test to account for the new entry. Verify no broken imports remain.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add `{ source: "/matches/:id", destination: "/jobs/:id/match", permanent: true }` to `legacyRouteRedirects` in `apps/web/config/legacy-route-redirects.ts`
- MUST delete `apps/web/src/app/(authenticated)/matches/page.tsx` (thin re-export of `MatchAnalysesPage`)
- MUST delete `apps/web/src/app/(authenticated)/matches/[id]/page.tsx` (thin re-export of `MatchAnalysisPage` + metadata)
- MUST delete `apps/web/src/modules/match-analyses/details/page/MatchAnalysisPage.tsx`
- MUST delete `apps/web/src/modules/match-analyses/list/page/MatchAnalysesPage.tsx`
- MUST delete `apps/web/src/modules/match-analyses/list/components/MatchAnalysisListCard.tsx` (only used by MatchAnalysesPage)
- MUST delete `apps/web/src/modules/match-analyses/list/components/MatchScoreBadge.tsx` (only used by MatchAnalysesPage)
- MUST update `legacy-route-redirects.test.ts` to account for the new redirect entry
- MUST keep all shared components: `MatchWizardDialog`, `MatchItemCard`, `MatchStatusBadge`, `VerdictBadge`, `SourceBadge`, `RelevanceIcon`
- MUST run `pnpm knip` to detect dead code after deletions
- SHOULD verify the `match-analyses/details/components/` directory still has all needed shared components
- SHOULD verify the `match-analyses/list/` directory is empty or removed after deleting its components
</requirements>

## Subtasks

- [ ] 4.1 Add redirect entry `{ source: "/matches/:id", destination: "/jobs/:id/match", permanent: true }` to `legacy-route-redirects.ts`
- [ ] 4.2 Delete `apps/web/src/app/(authenticated)/matches/page.tsx`
- [ ] 4.3 Delete `apps/web/src/app/(authenticated)/matches/[id]/page.tsx`
- [ ] 4.4 Delete `apps/web/src/modules/match-analyses/details/page/MatchAnalysisPage.tsx`
- [ ] 4.5 Delete `apps/web/src/modules/match-analyses/list/page/MatchAnalysesPage.tsx`
- [ ] 4.6 Delete `MatchAnalysisListCard.tsx` and `MatchScoreBadge.tsx` (list components, only used by MatchAnalysesPage)
- [ ] 4.7 Update `legacy-route-redirects.test.ts` for new redirect entry
- [ ] 4.8 Run `pnpm knip` and clean up any detected dead code

## Implementation Details

The redirect uses Next.js `permanent: true` (HTTP 308). The `:id` param from `/matches/:id` maps directly to the job ID in `/jobs/:id/match` — the redirect is structural, not server-side lookup. This is intentional: the match analysis `id` and the job `id` are separate, but the redirect is a catch-all that moves users to the job page (the match tab will handle its own data fetching).

**Files to delete (4 route/page files + 2 list-only components):**

- `apps/web/src/app/(authenticated)/matches/page.tsx` — imports `MatchAnalysesPage`
- `apps/web/src/app/(authenticated)/matches/[id]/page.tsx` — imports `MatchAnalysisPage`
- `apps/web/src/modules/match-analyses/details/page/MatchAnalysisPage.tsx` — 358 lines
- `apps/web/src/modules/match-analyses/list/page/MatchAnalysesPage.tsx`
- `apps/web/src/modules/match-analyses/list/components/MatchAnalysisListCard.tsx`
- `apps/web/src/modules/match-analyses/list/components/MatchScoreBadge.tsx`

**Files to KEEP (shared, used by MatchTabContent):**

- `apps/web/src/modules/match-analyses/details/components/MatchWizardDialog.tsx`
- `apps/web/src/modules/match-analyses/details/components/MatchItemCard.tsx`
- `apps/web/src/modules/match-analyses/details/components/MatchStatusBadge.tsx`
- `apps/web/src/modules/match-analyses/details/components/VerdictBadge.tsx`
- `apps/web/src/modules/match-analyses/details/components/SourceBadge.tsx`
- `apps/web/src/modules/match-analyses/details/components/RelevanceIcon.tsx`

### Relevant Files

- `apps/web/config/legacy-route-redirects.ts` — add new redirect entry
- `apps/web/config/legacy-route-redirects.test.ts` — update test to expect 3 redirects
- `apps/web/src/app/(authenticated)/matches/page.tsx` — DELETE
- `apps/web/src/app/(authenticated)/matches/[id]/page.tsx` — DELETE
- `apps/web/src/modules/match-analyses/details/page/MatchAnalysisPage.tsx` — DELETE
- `apps/web/src/modules/match-analyses/list/page/MatchAnalysesPage.tsx` — DELETE
- `apps/web/src/modules/match-analyses/list/components/MatchAnalysisListCard.tsx` — DELETE
- `apps/web/src/modules/match-analyses/list/components/MatchScoreBadge.tsx` — DELETE

### Dependent Files

- `apps/web/src/modules/jobs/details/page/JobDetailsPage.tsx` — already cleaned up in task_01 (removed header match action)
- `apps/web/src/modules/jobs/details/components/MatchDialog.tsx` — imports `MatchItemCard` (shared, kept)

### Related ADRs

- [ADR-004: Full Removal of Standalone Match Routes and Pages](../match-details-as-tab/adrs/adr-004.md) — Delete all `/matches` route files, build tab from scratch

## Deliverables

- Modified `apps/web/config/legacy-route-redirects.ts` (new redirect entry)
- Modified `apps/web/config/legacy-route-redirects.test.ts` (updated test)
- Deleted: 6 files (4 route/page + 2 list components)
- `pnpm knip` — zero dead code related to this task **(REQUIRED)**

## Tests

### Unit Tests

- [ ] `legacy-route-redirects.test.ts`: verify 3 redirects (2 existing + 1 new)
- [ ] `legacy-route-redirects.test.ts`: verify `/matches/:id` redirect has `permanent: true` and correct destination

### Integration Tests

- [ ] Navigate to `/matches/any-id` → 308 redirect → land on `/jobs/any-id/match`
- [ ] Verify no 404 errors on any remaining routes after deletions

## Success Criteria

- `/matches/:id` returns 308 redirect to `/jobs/:id/match`
- All standalone match route files and page components deleted
- Shared components (`MatchWizardDialog`, `MatchItemCard`, etc.) preserved and functional
- Zero broken imports after deletions
- `pnpm typecheck` — zero errors
- `pnpm lint` — zero warnings
- `pnpm test` — all passing (redirect test updated)
- `pnpm knip` — no new dead code
