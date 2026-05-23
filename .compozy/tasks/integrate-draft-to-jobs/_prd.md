# PRD: Integrate Draft into Jobs

## Overview

Today the job tracker has two separate entities: **Draft** (imported raw content from the browser extension or manual URL paste) and **Job** (parsed, structured job listing). The user must explicitly "Convert to job" to bridge them. This creates two list pages, two detail pages, two sets of GraphQL operations, and a rigid workflow that forces a one-way conversion.

This PRD describes collapsing Draft into Job as a stage. A job starts as **DRAFT** — raw imported content — and becomes a fully parsed job through a "Fill automatically" action that can be triggered at any time, not just once. The separation between "imported content" and "working job" disappears: everything is a Job, just at different stages of enrichment.

## Goals

- **Unified data model**: One entity (Job) replaces two (DraftJob + Job). Users manage one list, one detail page.
- **Flexible enrichment**: "Fill automatically" is available at any stage, not just DRAFT. Users can re-trigger AI parsing on any job.
- **Discoverable drafts**: Draft-stage jobs are visible in the main job list via a "Draft" quick filter.
- **Seamless match analysis**: A single match analysis flow works for all jobs, regardless of stage.
- **Clean migration**: All existing drafts are migrated to Jobs with stage=DRAFT. No data loss.

## User Stories

- As a job seeker, I want imported jobs to appear directly in my main job list so I don't have to navigate to a separate "drafts" page.
- As a job seeker, I want to see the original captured web page (Source content) alongside the parsed job details, when available.
- As a job seeker, I want to trigger AI parsing ("Fill automatically") at any time, even on already-parsed jobs, to refresh or improve the extracted data.
- As a job seeker, I want to filter my job list by "Draft" to quickly find unparsed imports.
- As a job seeker, I want match analysis to work consistently whether my job is in DRAFT stage or has been parsed.

## Core Features

### 1. Draft as a Job Stage

Draft is added to the existing application stage pipeline. A new stage `DRAFT` joins `NEW`, `APPLIED`, `RECRUITER_SCREEN`, `TECHNICAL`, `CULTURAL_FIT`, `OFFER`, `REJECTED`, and `DUPLICATED`.

### 2. Merged Data Fields

Draft-specific fields are absorbed into Job:

- **`url`** (single URL from draft) → merged into **`urls[]`** (existing array field on Job).
- **`htmlContent`** (raw captured HTML) → new field **`htmlContent`** on Job. Nullable; only present for jobs that originated from an import.
- **`title`** on Job becomes **nullable**. DRAFT-stage jobs may have no parsed title yet; the raw page title is stored in `urls` context.

### 3. Quick Filter: Draft

The job list quick filters gain a **"Draft"** option. Selecting it filters the list to jobs with `stage = DRAFT`. The existing filters (Incoming, Active, Applied, New, Duplicated) remain unchanged.

### 4. "Fill automatically" Action

Replaces the current "Convert to job" action. Key behaviors:

- **Always available**: Appears in the job detail actions menu for any job.
- **DRAFT → NEW transition**: If the job's current stage is DRAFT, successful fill transitions it to NEW. A stage event `DRAFT → NEW` is recorded.
- **Other stages**: If the job is already at NEW or beyond, fill re-enriches the job's fields (description, salary, tags, location, etc.) without changing the stage. Existing data is overwritten with the new extraction.
- **Conflict handling**: Removed. Since fill operates on the same Job (not creating a new one), there is no "duplicate vs replace" conflict. The old conflict dialog is eliminated.

### 5. Source Content Tab

The job detail page gains a conditional **"Source content"** tab:

- **Visible when**: The job has `htmlContent` (originated from a browser import).
- **Not visible when**: The job was created manually or entered already parsed (no `htmlContent`).
- **Content**: Renders the raw captured HTML in an iframe, identical to today's "Captured" tab on the draft detail page.
- **Coexistence**: When both `htmlContent` and `description` exist, both "Source content" and "Description" tabs are shown.

### 6. Unified Match Analysis

Match analysis no longer distinguishes between "draft match" and "job match":

- A single `generateJobMatch` mutation handles all jobs.
- For DRAFT-stage jobs (no `description`), the AI uses `htmlContent` as the job description source.
- For parsed jobs (with `description`), the AI uses the structured `description` field.
- After "Fill automatically" populates `description`, existing match data is preserved (not auto-regenerated). Users can manually regenerate if desired.

### 7. Route Consolidation

- **`/draft-jobs`** route is removed.
- **`/draft-jobs/[id]`** route is removed.
- Drafts are accessed exclusively through `/jobs` (list) and `/jobs/[id]` (detail), filtered by stage.

## User Experience

### Primary Flow: Importing and Parsing a Job

1. User imports a job via browser extension or manual URL paste.
2. A Job is created with stage=DRAFT. The captured HTML is stored in `htmlContent`, the URL in `urls[]`.
3. The job appears in the main `/jobs` list (visible under "All" or "Draft" quick filter).
4. User opens the job detail. They see:
   - **Overview tab**: URL, creation date, empty fields (title, company, salary — all blank or showing placeholder).
   - **Source content tab**: The captured web page rendered in an iframe.
5. User clicks **"Fill automatically"**. The system extracts structured data via AI.
6. The job is updated in-place: title, company, description, salary, tags, location, workRegion are populated.
7. Stage transitions from DRAFT to NEW. A stage event is recorded.
8. The detail page now shows filled Overview fields, Description tab, and (still) Source content tab.

### Secondary Flow: Re-enriching an Existing Job

1. User opens any job (stage NEW or beyond).
2. User clicks **"Fill automatically"**. AI re-extracts data.
3. Job fields are overwritten with fresh extraction. Stage does not change.
4. Existing match analysis is preserved.

### Draft Discovery

- The job list page quick filters include "Draft" alongside existing options.
- A user scanning their job pipeline can instantly see how many imported jobs are still unparsed.

## Non-Goals (Out of Scope)

- **Bulk fill**: Filling multiple DRAFT jobs at once is not included. Each job is filled individually.
- **Extension changes**: The browser extension's UI and capture logic are out of scope. Only the API endpoint it calls changes (from `createDraftJob` to `createJob`).
- **AI extraction quality improvements**: The extraction AI and normalization logic are unchanged. This PRD only changes where and when they are invoked.
- **Draft-specific notifications or reminders**: No new notification types for unparsed drafts.
- **Draft expiration or auto-cleanup**: DRAFT jobs are permanent until manually deleted or filled.

## Phased Rollout Plan

### MVP (Phase 1)

- Add `DRAFT` to `ApplicationStageEnum`.
- Merge Draft fields into Job (`urls[]`, `htmlContent`, nullable `title`).
- Migrate all existing `draft_jobs` rows to `jobs`.
- Add "Draft" quick filter on `/jobs`.
- Add conditional "Source content" tab on job detail.
- Implement "Fill automatically" (DRAFT→NEW transition, in-place fill for other stages).
- Unify match analysis (single `generateJobMatch`).
- Remove `/draft-jobs` routes.
- Remove `DraftJobEntity`, `draft_jobs` table, and all Draft-specific code.
- **Success criteria**: All existing drafts accessible as Jobs with stage=DRAFT. Fill automatically works. Match analysis works for DRAFT and parsed jobs.

### Phase 2 (Future)

- Bulk fill: select multiple DRAFT jobs and fill them in one action.
- Draft badge/count in the main navigation (e.g., "3 drafts" indicator).
- Auto-fill on import: option to trigger fill automatically when a job is imported.

## Success Metrics

- **Zero data loss**: All existing drafts are migrated to Jobs. No content is dropped.
- **Route reduction**: Two routes (`/draft-jobs`, `/draft-jobs/[id]`) are eliminated.
- **Code reduction**: Draft-specific resolver, service, repository, SSE controller, and frontend pages are removed.
- **User task completion**: A user can import a job, find it in the main list, fill it, and view both source content and parsed description — without leaving `/jobs`.
- **Match analysis parity**: Match quality for DRAFT-stage jobs matches pre-migration quality for drafts.

## Risks and Mitigations

| Risk                                                         | Mitigation                                                                                                            |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Data migration corrupts or loses draft data                  | Dry-run migration on a copy of production data. Run in a transaction with rollback capability.                        |
| Users rely on `/draft-jobs` route (bookmarks, muscle memory) | Add redirect from `/draft-jobs` to `/jobs?q=draft`. Communicate the change in release notes.                          |
| Browser extension calls removed `createDraftJob` mutation    | Coordinate API deploy with extension update. Keep the mutation as a deprecated alias during transition if needed.     |
| `title` becoming nullable breaks frontend assumptions        | Systematic audit of all `title` usages before release. Add null guards where missing.                                 |
| Users accustomed to separate draft page feel disoriented     | The "Draft" quick filter provides equivalent discoverability. Source content tab preserves the key draft detail view. |

## Architecture Decision Records

- [ADR-001: Full Merge — Draft as Job Stage](adrs/adr-001.md) — Draft is eliminated as a separate entity; all draft data and behavior moves into Job.

## Open Questions

- **Extension release coordination**: What is the deployment sequence (API first, then extension update, or simultaneous)? What grace period for old extension versions?
- **`createDraftJob` mutation deprecation**: Should the old mutation be kept as a deprecated alias during a transition window, or removed immediately?
- **Draft quick filter default**: Should "Draft" be the default filter for new users, or should "Incoming" remain the default?
