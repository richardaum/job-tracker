# PRD: Match Details as Job Detail Tab

## Overview

Move match analysis from a standalone page (`/matches/[id]`) into a tab inside the job detail page (`/jobs/[id]`). Users currently see a match summary in the Overview tab but must navigate to a separate page for full details. This change consolidates match analysis under the job it belongs to, removes the standalone match routes, and simplifies the sidebar navigation.

**Problem:** Match analysis is siloed in its own page, disconnected from the job it analyzes. Users must remember a separate URL and sidebar entry point.

**Who it's for:** Job Tracker users reviewing job matches — they want full match details without leaving the job context.

**Why valuable:** Reduces navigation friction, removes a top-level sidebar item, consolidates related information into one view.

## Goals

- Match analysis is accessible as a tab within `/jobs/[id]`
- `/matches/[id]` redirects seamlessly to `/jobs/[id]/match`
- Sidebar loses the "Matches" link without breaking any user workflows
- No loss of existing match functionality — all features (masonry grid, verdict filters, Generate, Delete) remain available
- Overview tab keeps `MatchAnalysisField` summary as a discoverable entry point

## User Stories

- **As a user reviewing a job**, I want to see the full match analysis as a tab so I don't have to navigate away from the job detail page.
- **As a user with a bookmarked match URL**, I want `/matches/[id]` to take me to the right place so my links don't break.
- **As a user on the job Overview**, I want to see a match summary that links to the full Match tab for deeper inspection.
- **As a user with a job that has no match yet**, I want to generate one from the Match tab without leaving the job page.

## Core Features

### 1. Match Tab in Job Detail

A new "Match" tab in the job detail page's main column TabsList. Position: after existing tabs (Overview, Description, Source content). The tab renders the full match analysis content: masonry grid of `MatchItemCard`s, verdict filters (All, Fits, Gaps, Unclear), match status badge, and classification badge.

Match-specific actions (Generate match, Delete match) live in a toolbar within the tab, not in the job detail page header. The job header remains job-focused (match, fill, status, remove).

### 2. Empty State

When a job has no match analysis, the Match tab shows an empty state with a clear call-to-action to generate one. The Generate action opens the existing `MatchWizardDialog`.

### 3. Route: `/jobs/[id]/match`

The Match tab is reachable via the URL segment `/jobs/[id]/match`. Navigating to this URL renders the job detail page with the Match tab pre-selected. Follows the same pattern as existing `/jobs/[id]/notes`.

### 4. Legacy Redirect: `/matches/[id]` → `/jobs/[id]/match`

All `/matches/[id]` URLs permanently redirect (308) to `/jobs/[id]/match`. The redirect resolves the job ID from the match analysis record.

### 5. Sidebar Simplification

The "Matches" link is removed from the sidebar. The remaining navigation items are: Jobs, Resumes, Sources, Companies, Salary Calculator.

### 6. Match List Page Removal

The `/matches` list route is removed. There is no replacement — users browse jobs and access match analysis per job.

### 7. Overview Tab Summary (Retained)

The existing `MatchAnalysisField` in Overview remains. It shows a compact match summary (score, classification) with a link to the Match tab for full details.

## User Experience

### Primary Flow: Viewing match details

1. User navigates to a job at `/jobs/[id]`
2. User sees Overview tab with `MatchAnalysisField` summary
3. User clicks "Match" tab (or clicks the overview summary link)
4. Full match analysis loads — masonry grid with verdict filters
5. User can filter by verdict (All/Fits/Gaps/Unclear) and browse match items

### Secondary Flow: Generating a match

1. User opens Match tab on a job with no match
2. Empty state shows "Generate match" CTA
3. User clicks the button → `MatchWizardDialog` opens
4. After generation completes, the tab refreshes to show match content

### Redirect Flow

1. User navigates to `/matches/[id]` (bookmark, email, or shared link)
2. Browser receives 308 redirect to `/jobs/[id]/match`
3. Job detail page opens with Match tab active

## High-Level Technical Constraints

- Must work within the existing `Tabs` pattern used by `JobDetailsPage` (Radix UI, `TabsList` + `TabsTrigger` + `TabsContent`)
- Must preserve SSE streaming for match status updates (`match_status_changed` events)
- Must follow existing redirect infrastructure in `next.config.ts`
- Must keep existing `JobType.match` GraphQL field and `jobMatch(jobId)` query

## Non-Goals (Out of Scope)

- Redesigning the match analysis UI (masonry grid, cards, filters remain unchanged)
- Adding match analysis to other entities (companies, applications)
- Cross-job match comparison or aggregate match views
- Changing the match generation flow or AI prompt
- Adding match-related actions to the job detail header Actions dropdown

## Phased Rollout Plan

### MVP (Phase 1) — Single phase

All features delivered in one phase:

- Match tab in job detail page with full match content
- `/jobs/[id]/match` route with tab pre-selection
- Permanent redirect from `/matches/[id]` to `/jobs/[id]/match`
- Sidebar "Matches" link removed
- `/matches` list route removed
- Empty state with Generate CTA
- Overview `MatchAnalysisField` retained with link to Match tab

No additional phases — this is a consolidation, not a new feature surface.

## Success Metrics

- Zero broken links: all `/matches/[id]` URLs redirect correctly
- Match tab renders without layout regressions compared to the standalone page
- Sidebar navigation remains functional with one fewer item
- No increase in page load time for job detail (match content lazy-loaded only when tab is active)

## Risks and Mitigations

| Risk                                                        | Mitigation                                                                                           |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Users with bookmarked `/matches/[id]` URLs get broken links | Permanent redirect (308) from `/matches/[id]` to `/jobs/[id]/match`                                  |
| Users miss the standalone match list view (`/matches`)      | Overview tab's `MatchAnalysisField` serves as entry point; jobs are the natural organizing principle |
| Tab bar becomes too wide with 4–5 triggers                  | Tabs use horizontal overflow on narrow viewports (existing pattern)                                  |
| SEO impact from removed routes                              | Match pages are authenticated only — no public SEO concern                                           |

## Architecture Decision Records

- [ADR-001: Match as Dedicated Main-Column Tab](adrs/adr-001.md) — Match tab lives in the main column TabsList alongside Overview, Description, and Source content, with its own toolbar for match-specific actions.

## Open Questions

- None. All design decisions resolved during brainstorming.
