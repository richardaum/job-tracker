---
id: T-03
status: completed
title: Wire Match tab into JobDetailsPage + create route
type: frontend
complexity: medium
depends_on: [T-02]
---

# Task 03: Wire Match tab into JobDetailsPage + create route

## Overview

Integrate the new `MatchTabContent` component into `JobDetailsPage` by adding a "Match" tab trigger and content panel in both desktop (main column TabsList) and mobile (unified TabsList) layouts. Create the Next.js App Router route at `/jobs/[id]/match` that renders `JobDetailsPage` with the Match tab pre-selected via `defaultValue="match"`.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add `TabsTrigger value="match"` with label "Match" in `JobDetailsPage` desktop layout (main column `TabsList`)
- MUST add `TabsContent value="match"` rendering `<MatchTabContent jobId={jobId} />` in desktop layout
- MUST add `TabsTrigger value="match"` with label "Match" in `JobDetailsPage` mobile layout (unified `TabsList`)
- MUST add `TabsContent value="match"` rendering `<MatchTabContent jobId={jobId} />` in mobile layout
- MUST create route file at `apps/web/src/app/(authenticated)/jobs/[id]/match/page.tsx` following the `/jobs/[id]/notes` pattern
- MUST pass `defaultValue="match"` to `JobDetailsPage` Tabs when rendering from `/jobs/[id]/match` route
- MUST ensure the new tab triggers do not break existing tab layout (use existing `Tabs` structure, follow existing trigger pattern)
- SHOULD verify tab ordering: Overview, Description, Source content, Match
</requirements>

## Subtasks

- [ ] 3.1 Create `apps/web/src/app/(authenticated)/jobs/[id]/match/page.tsx` — render `JobDetailsPage` with `defaultValue="match"`
- [ ] 3.2 Add `TabsTrigger value="match"` and `TabsContent` in desktop layout (main column)
- [ ] 3.3 Add `TabsTrigger value="match"` and `TabsContent` in mobile layout (unified TabsList)
- [ ] 3.4 Import `MatchTabContent` from `@/modules/jobs/details/components/MatchTabContent`
- [ ] 3.5 Verify tab ordering and ensure no layout regressions on narrow viewports

## Implementation Details

The route page follows the existing `/jobs/[id]/notes` pattern:

```
apps/web/src/app/(authenticated)/jobs/[id]/notes/page.tsx
  → export { default } from "@/modules/jobs/details/page/JobNotesPage"
```

However, unlike `JobNotesPage` (which is a separate page with its own layout), the Match route must render `JobDetailsPage` with a specific tab selected. This requires `JobDetailsPage` to accept a `defaultValue` prop (or derive it from the pathname). Check whether `JobDetailsPage` already supports this via the existing `/jobs/[id]/notes` pattern — if `JobNotesPage` is separate, then the Match route needs a `JobMatchPage` wrapper that renders `JobDetailsPage` with `defaultValue="match"`.

Tab ordering in `JobDetailsPage` TabsList: Overview → Description → Source content (conditional) → Match.

### Relevant Files

- `apps/web/src/modules/jobs/details/page/JobDetailsPage.tsx` — add Match tab trigger + content
- `apps/web/src/modules/jobs/details/page/JobNotesPage.tsx` — reference for sub-route page pattern
- `apps/web/src/app/(authenticated)/jobs/[id]/notes/page.tsx` — reference for route file structure
- `apps/web/src/modules/jobs/details/components/MatchTabContent.tsx` — created in task_02, imported here

### Dependent Files

- `apps/web/config/legacy-route-redirects.ts` — redirect to this route added in task_04
- `apps/web/src/app/(authenticated)/matches/` — standalone routes deleted in task_04 (replaced by this tab)

### Related ADRs

- [ADR-001: Match as Dedicated Main-Column Tab](../match-details-as-tab/adrs/adr-001.md) — Match tab in main column TabsList

## Deliverables

- `apps/web/src/app/(authenticated)/jobs/[id]/match/page.tsx` (new)
- Modified `apps/web/src/modules/jobs/details/page/JobDetailsPage.tsx` (tab added)
- Unit tests for route and tab integration **(REQUIRED)**

## Tests

### Unit Tests

- [ ] Route test: `/jobs/[id]/match` renders without error
- [ ] Route test: `defaultValue="match"` is passed to JobDetailsPage Tabs
- [ ] Tab rendering: "Match" tab trigger appears in desktop `TabsList`
- [ ] Tab rendering: "Match" tab trigger appears in mobile `TabsList`
- [ ] Tab content: `MatchTabContent` renders with correct `jobId` prop

### Integration Tests

- [ ] Navigate to `/jobs/[id]/match` → Match tab is active and shows content
- [ ] Click "Match" tab trigger → tab switches to match content
- [ ] Mobile viewport: Match tab appears in unified TabsList, content accessible
- [ ] Switching between tabs (Overview → Match → Description) does not break layout

## Success Criteria

- `/jobs/[id]/match` renders JobDetailsPage with Match tab pre-selected
- "Match" tab appears in both desktop and mobile TabsList
- Clicking Match tab renders MatchTabContent
- No layout regressions on desktop (grid) or mobile (unified tabs)
- `pnpm typecheck` — zero errors
- `pnpm lint` — zero warnings
- All tests passing
