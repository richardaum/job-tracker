# PRD: Quick Filter Count Badges

## Overview

The jobs list page has a row of quick filter chips (All, Draft, Incoming, Active, Applied, New, Duplicated) that filter the job list by pipeline stage. Currently, no chip shows how many jobs match each filter. Users must click through filters to gauge category sizes. This feature adds a count badge to every quick filter chip so users can see at a glance how many jobs are in each stage.

## Goals

- Users can assess pipeline distribution without clicking through filters
- Reduce friction: one glance tells the user where to focus
- Maintain the existing filter bar layout — counts augment without rearranging

## User Stories

- As a user, I want to see how many jobs are in each pipeline stage so I can prioritize which stage to review first
- As a user, I want counts to stay current so I don't act on stale numbers after moving jobs between stages

## Core Features

### F1: Count badge on every quick filter chip

- Each `FilterChip` renders a small numeric badge inline with its label
- Format: `"Label (N)"` where N is the number of jobs matching that filter
- Badge hides completely when count = 0

### F2: Count refresh on load and after mutations

- Counts fetch on page load via the existing jobs query or a dedicated field
- Counts refresh after any mutation that could change job counts: create job, delete job, change stage
- No real-time subscription

### F3: Existing filter behavior unchanged

- Clicking a chip still toggles the `?q=` URL parameter and filters the list
- Active chip styling remains the same
- Filter order stays fixed

## User Experience

The chip currently reads `"New"`. After the feature, it reads `"New (12)"`. When count is 0, it reads `"New"` (no badge). The badge uses the same text size as the label with reduced visual weight (secondary text color). The filter bar layout, spacing, and chip dimensions adjust minimally to accommodate the badge.

**Refresh behavior:** When the user creates a job, deletes a job, or changes a job's stage, counts refetch alongside the list data. The badge briefly shows the previous count (or a loading skeleton) until the new count arrives.

## High-Level Technical Constraints

- Must integrate with the existing Apollo Client cache — avoid full list refetch when only counts changed
- Must support the existing `ApplicationQuickFilter` enum values without schema changes
- Count query must be performant: a single aggregate query (COUNT with GROUP BY by stage), not N queries

## Non-Goals (Out of Scope)

- Auto-sorting filters by count — filters keep fixed order
- Total job count header in the filter bar
- Real-time subscriptions for count updates
- Animated badge transitions
- Differentiating badge styles by count magnitude

## Phased Rollout Plan

### MVP (Phase 1)

- Count badge rendered on all seven quick filter chips
- Badge hides when count = 0
- Counts refresh on page load and after mutations
- $filter, company, and runId filters all respected when computing counts

### Phase 2 (if needed)

- Total job count header
- Visual differentiation for high-count badges
- Loading skeleton state for badges during refetch

## Success Metrics

- **Usage:** Users reference filter chips more frequently (tracked via click rates on count-bearing chips vs non-count-bearing period)
- **Satisfaction:** No user complaints about stale or missing counts

## Risks and Mitigations

- **Count performance:** A COUNT query with GROUP BY per quick filter key could be slow on large datasets. Mitigation: ensure a single aggregate query covers all seven keys in one round-trip, with proper indexing on the stage event table.
- **Cache inconsistency:** After a mutation, counts might briefly mismatch the visible list if the list query and count query resolve at different times. Mitigation: refetch counts and list in the same query or same Promise.all batch.

## Architecture Decision Records

- [ADR-001: Static Count Badges for Quick Filters](adrs/adr-001.md) — Static count badges on all chips, hide at 0, refresh on load + mutations, fixed filter order.

## Open Questions

- Should the Rejected filter (currently hidden behind codegen) also show a count?
- Should counts consider the `company` and `runId` query params when computing the aggregate?
