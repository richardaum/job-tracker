---
id: T-02
status: completed
title: Create MatchTabContent component
type: frontend
complexity: high
depends_on: [T-01]
---

# Task 02: Create MatchTabContent component

## Overview

Create a new `MatchTabContent` component that renders the full match analysis UI as a tab within the job detail page. It uses its own `useJobMatchQuery` for independent data fetching, manages its own SSE subscription for `match_status_changed` events, provides match-specific toolbar actions (Generate/Regenerate, View resume, Delete), renders verdict filters and a masonry grid of `MatchItemCard`s, and handles all states: loading, empty (no match), processing, failed, and completed.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST use `useJobMatchQuery({ variables: { jobId }, fetchPolicy: "cache-and-network" })` from `@/gql/hooks` for independent data fetching
- MUST subscribe to SSE `${apiBaseUrl}/matches/${matchId}/stream` with event `"match_status_changed"` — call `refetch()` on `COMPLETED` or `FAILED`
- MUST derive `matchId` from query result (not from props) — SSE subscription starts only when match data exists
- MUST render empty state when no match exists: clear heading + "Generate match" CTA button opening `MatchWizardDialog`
- MUST render processing state when `generationMetadata.status === "PROCESSING"`: spinner/progress with "Analyzing your match…" message
- MUST render failed state when `generationMetadata.status === "FAILED"`: error message with option to retry (opens `MatchWizardDialog`)
- MUST render completed match content: `MatchStatusBadge`, `MatchClassification` (variant="detailed"), verdict filter tabs (All/Fits/Gaps/Unclear), masonry grid of `MatchItemCard`
- MUST provide toolbar with: "Generate"/"Regenerate" button, Actions dropdown (View resume, View preferences, Delete)
- MUST handle delete flow: `ConfirmDialog` → `deleteMatchAnalysis` mutation → refetch parent `Job` query + clear local state
- MUST handle empty filter result: show message when filtered items array is empty (e.g., "No gaps found")
- MUST reuse existing shared components: `MatchWizardDialog`, `MatchItemCard`, `MatchStatusBadge`, `MatchClassification`, `VerdictBadge`, `SourceBadge`, `RelevanceIcon`
- MUST NOT use `MatchAnalysisPage` or `MatchAnalysesPage` — build from scratch referencing existing logic but as a tab component
- SHOULD extract a `useMatchTabViewModel` hook if the component grows beyond ~150 lines of logic
- SHOULD use `Tabs` (Radix UI) for verdict filters, matching the existing pattern in `MatchAnalysisPage`
</requirements>

## Subtasks

- [ ] 2.1 Create `apps/web/src/modules/jobs/details/components/MatchTabContent.tsx` with `{ jobId: string }` props
- [ ] 2.2 Implement `useJobMatchQuery` with `fetchPolicy: "cache-and-network"` and derive all states (loading, empty, processing, failed, completed)
- [ ] 2.3 Implement SSE `useEventSource` for `match_status_changed` — subscribe only when `matchId` exists, refetch on COMPLETED/FAILED
- [ ] 2.4 Implement verdict filter tabs (All/Fits/Gaps/Unclear) with `filteredItems` derivation
- [ ] 2.5 Implement toolbar: Generate/Regenerate button (opens `MatchWizardDialog`), Actions dropdown (View resume, View preferences, Delete)
- [ ] 2.6 Implement delete flow with `ConfirmDialog` and `deleteMatchAnalysis` mutation
- [ ] 2.7 Implement masonry grid layout (`columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5`) rendering `MatchItemCard` for each filtered item
- [ ] 2.8 (Optional) Extract `useMatchTabViewModel` if component exceeds ~150 lines

## Implementation Details

The `MatchTabContent` replaces the full `MatchAnalysisPage` functionality but as a tab component — no page chrome (BackToLink, Heading, page-level error). The parent `JobDetailsPage` provides: page header, BackToLink, side column. `MatchTabContent` only renders: toolbar, status badge, classification, filters, and match items.

**Props contract:** `{ jobId: string }` — no other props. All data comes from `useJobMatchQuery` and local state.

**Key existing files to reference for logic (do NOT import from — replicate the logic):**

- `MatchAnalysisPage` layout pattern (Tabs for verdict filter, masonry grid, `MatchClassification` variant="detailed")
- `MatchDialog` pattern for `useJobMatchQuery` usage with `skip: !open` → adapt to tab: no skip (always fetch when tab mounts)

### Relevant Files

- `apps/web/src/gql/hooks.ts` — `useJobMatchQuery`, `useDeleteMatchAnalysisMutation`, `useGenerateJobMatchMutation` already generated
- `apps/web/src/modules/match-analyses/details/page/MatchAnalysisPage.tsx` — reference for: filter logic, masonry layout, `MatchClassification` usage, SSE setup, delete flow
- `apps/web/src/modules/jobs/details/components/MatchDialog.tsx` — reference for `useJobMatchQuery` usage pattern (`fetchPolicy: "cache-and-network"`)
- `apps/web/src/modules/match-analyses/details/components/MatchWizardDialog.tsx` — shared, import directly: `{ open, onOpenChange, onGenerate, generating, hasExistingMatch }`
- `apps/web/src/modules/match-analyses/details/components/MatchItemCard.tsx` — shared, import directly: `{ item, resumeId?, onPreferenceClick? }`
- `apps/web/src/modules/match-analyses/details/components/MatchStatusBadge.tsx` — shared, import directly
- `apps/web/src/modules/jobs/shared/components/MatchClassification.tsx` — shared, import directly: `variant="detailed"`
- `apps/web/src/modules/match-analyses/details/components/VerdictBadge.tsx` — shared, import directly
- `apps/web/src/modules/match-analyses/details/components/SourceBadge.tsx` — shared, import directly
- `apps/web/src/modules/match-analyses/details/components/RelevanceIcon.tsx` — shared, import directly
- `apps/web/src/hooks/useEventSource.ts` — SSE hook used by `MatchAnalysisPage`; reuse same pattern
- `apps/web/src/modules/jobs/shared/hooks/useToastQueue.ts` — toast queue for error/success feedback

### Dependent Files

- `apps/web/src/modules/jobs/details/page/JobDetailsPage.tsx` — will import `MatchTabContent` in task_03
- `apps/web/src/app/(authenticated)/jobs/[id]/match/page.tsx` — will be created in task_03, renders `JobDetailsPage` with `defaultValue="match"`

### Related ADRs

- [ADR-002: Independent Data Fetching for MatchTabContent](../match-details-as-tab/adrs/adr-002.md) — `useJobMatchQuery` over reusing parent `job.match`
- [ADR-003: SSE Ownership in MatchTabContent](../match-details-as-tab/adrs/adr-003.md) — SSE listener lives inside tab, not page view-model
- [ADR-004: Full Removal of Standalone Match Routes](../match-details-as-tab/adrs/adr-004.md) — build from scratch, not gradual extraction

## Deliverables

- `apps/web/src/modules/jobs/details/components/MatchTabContent.tsx` (new)
- Unit tests for `MatchTabContent` **(REQUIRED)**
- Test coverage >=80% **(REQUIRED)**

## Tests

### Unit Tests

- [ ] Empty state: renders "Generate match" CTA when `useJobMatchQuery` returns no data
- [ ] Processing state: renders spinner/progress when `generationMetadata.status === "PROCESSING"`
- [ ] Failed state: renders error message when `generationMetadata.status === "FAILED"`
- [ ] Completed state: renders toolbar (Generate/Regenerate, Actions dropdown)
- [ ] Completed state: renders `MatchClassification` with `variant="detailed"`
- [ ] Verdict filter: defaults to "All" (shows all items)
- [ ] Verdict filter: "Fits" shows only `verdict === "fit"` items
- [ ] Verdict filter: "Gaps" shows only `verdict === "gap"` items
- [ ] Verdict filter: "Unclear" shows only `verdict === "unclear"` items
- [ ] Empty filter result: shows message when filtered array is empty
- [ ] Generate action: opens `MatchWizardDialog` with correct `hasExistingMatch` prop
- [ ] Delete action: opens `ConfirmDialog`, calls `deleteMatchAnalysis` on confirm
- [ ] SSE: subscribes only when `matchId` exists from query result
- [ ] SSE: on COMPLETED status, calls `refetch()`
- [ ] SSE: on FAILED status, calls `refetch()`

## Success Criteria

- `MatchTabContent` renders all 5 states correctly (loading, empty, processing, failed, completed)
- Verdict filtering works for all 4 tabs
- SSE refetch triggers on match status change
- Generate and Delete flows work end-to-end
- `pnpm typecheck` — zero errors
- `pnpm lint` — zero warnings
- All tests passing
- Test coverage >=80%
