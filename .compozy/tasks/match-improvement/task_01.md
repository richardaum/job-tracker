---
id: T-01
status: completed
title: Remove old match entry points and update link
type: frontend
complexity: medium
depends_on: []
---

# Task 01: Remove old match entry points and update link

## Overview

Remove the "Match analysis" action from the job detail page header dropdown and the "Matches" entry from the sidebar navigation. Update `MatchAnalysisField` in the Overview tab to link to the Match tab (`/jobs/[id]/match`) instead of the standalone `/matches/[id]` page. These are the 3 entry points that currently route users to the old standalone match routes.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST remove `DropdownMenuItem` "Match analysis" from the job detail page header Actions dropdown (`JobDetailsPage.tsx` lines 221-232)
- MUST remove the `handleGenerateMatch` logic that navigates to `/matches/${job.match.id}` or opens `MatchWizardDialog`
- MUST remove the `MatchWizardDialog` import and JSX rendering from `JobDetailsPage` (if it's solely used for the header action — verify `MatchTabContent` will own its own copy)
- MUST update `MatchAnalysisField` link target: change from `router.push(\`/matches/${match.id}\`)` to link to `/jobs/${jobId}/match`
- MUST remove `{ href: "/matches", label: "Matches", icon: SparkleIcon }` from the `navItems` array in `Sidebar.tsx`
- MUST ensure the `SparkleIcon` import is removed if no longer used in Sidebar
- SHOULD verify no other files import or depend on the removed header match action
</requirements>

## Subtasks

- [ ] 1.1 Remove "Match analysis" `DropdownMenuItem` from `JobDetailsPage` header Actions dropdown
- [ ] 1.2 Remove `handleGenerateMatch` navigation logic and any associated state (`matchWizardOpen`, etc.) if no longer needed
- [ ] 1.3 Update `MatchAnalysisField` — change link destination from `/matches/${match.id}` to `/jobs/${jobId}/match`
- [ ] 1.4 Remove `{ href: "/matches", label: "Matches", icon: SparkleIcon }` from `navItems` in `Sidebar.tsx`
- [ ] 1.5 Clean up unused imports (SparkleIcon in Sidebar, MatchWizardDialog in JobDetailsPage if applicable)

## Implementation Details

### Relevant Files

- `apps/web/src/modules/jobs/details/page/JobDetailsPage.tsx:221-232` — "Match analysis" dropdown item and `handleGenerateMatch` handler
- `apps/web/src/modules/jobs/details/components/MatchAnalysisField.tsx` — `router.push(\`/matches/${match.id}\`)` to be updated
- `apps/web/src/modules/navigation/components/Sidebar.tsx:32` — `{ href: "/matches", label: "Matches", icon: SparkleIcon }` to be removed

### Dependent Files

- `apps/web/src/modules/jobs/details/page/JobDetailsPage.tsx` — the `MatchWizardDialog` is currently rendered here for the header action; verify whether `MatchTabContent` (task_02) will own its own instance before removing
- `apps/web/src/modules/navigation/__tests__/` or similar — sidebar tests may assert on `navItems` content

### Related ADRs

- [ADR-001: Match as Dedicated Main-Column Tab](../match-details-as-tab/adrs/adr-001.md) — Match actions move to tab toolbar, not job header
- [ADR-004: Full Removal of Standalone Match Routes](../match-details-as-tab/adrs/adr-004.md) — Sidebar link and standalone routes removed

## Deliverables

- Modified `apps/web/src/modules/jobs/details/page/JobDetailsPage.tsx` (header actions removed)
- Modified `apps/web/src/modules/jobs/details/components/MatchAnalysisField.tsx` (link target updated)
- Modified `apps/web/src/modules/navigation/components/Sidebar.tsx` (Matches entry removed)
- All tests passing **(REQUIRED)**

## Tests

### Unit Tests

- [ ] `Sidebar` test: verify `navItems` array no longer includes `/matches` entry
- [ ] `Sidebar` test: verify active state detection still works for remaining items
- [ ] `MatchAnalysisField` test: verify link href changed to `/jobs/${jobId}/match`
- [ ] `JobDetailsPage` test: verify header Actions dropdown no longer contains "Match analysis" item

## Success Criteria

- "Match analysis" no longer appears in job detail page header dropdown
- MatchAnalysisField link points to `/jobs/[id]/match` instead of `/matches/[id]`
- "Matches" no longer appears in sidebar navigation
- `pnpm typecheck` — zero errors
- `pnpm lint` — zero warnings
- `pnpm test` — all passing
