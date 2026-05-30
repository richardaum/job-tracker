# PRD: Keyword Blocker

**Status:** planned · **Priority:** high · **Created:** 2026-05-27

## Overview

Users need to automatically reject jobs whose title, description, or company matches a configurable list of blocked keywords. This prevents unwanted job types (e.g., QA, data engineering, mobile, freelance, specific companies) from cluttering the pipeline and saves manual triage time.

The feature is seeded with an existing keyword list migrated from a legacy LinkedIn scraper database, then managed through user settings.

## Goals

1. Allow users to define a list of blocked keywords with scope (title / description / company) and match mode (partial / exact).
2. On job creation, short-circuit to `REJECTED` stage when a keyword matches.
3. Provide a quick filter (`REJECTED`) so blocked jobs remain inspectable.
4. Seed the initial keyword list from the legacy SQLite data via a datafix script.
5. No retroactive re-evaluation — adding/removing keywords only affects future jobs.

## User Stories

- As a user, I want jobs that match my blocked keywords to be automatically marked as REJECTED so I don't waste time triaging them.
- As a user, I want to manage my blocked keywords in Settings so I can adjust which jobs get blocked over time.
- As a user, I want to be able to see all REJECTED jobs (including auto-blocked ones) so I can review or un-reject them if needed.
- As a user, I want the initial keyword list to match what I had in my legacy tool so I don't lose existing blocking rules.

## Core Features

### 1. Keyword Storage (User Settings)

Blocked keywords live in `UserSetting` as a JSONB column (`blockedKeywords`). Each entry has:

- `keyword: string` — the term to match
- `scope: "TITLE" | "DESCRIPTION" | "COMPANY"` — which field to scan
- `matchMode: "PARTIAL" | "EXACT"` — substring vs exact match (default: PARTIAL)

A separate `blockedCompanies: [String!]` field on the same settings object for convenience (company name blocking is a frequent standalone need).

### 2. Blocking on Creation (Stage Short-Circuit)

When a job is created (via any path: manual, import, extension), the service checks:

1. If company name matches any `blockedCompanies` entry (case-insensitive) → REJECTED.
2. If title matches any keyword with scope `TITLE` → REJECTED.
3. If description matches any keyword with scope `DESCRIPTION` or `COMPANY` (company name in description) → REJECTED.

Matching logic:

- `PARTIAL`: check if the keyword is a substring of the target (case-insensitive).
- `EXACT`: check if the keyword equals the full target (case-insensitive).

On first match, the job is assigned stage `REJECTED`, and an auto-generated Note is created on the job documenting the reason:

```
Auto-rejected by keyword blocker: keyword "<term>" matched in <scope>
```

This gives users traceability into why a job was rejected without requiring UI changes to the job list or card. The Note content is a plain-text sentence; `scope` is `TITLE`, `DESCRIPTION`, or `COMPANY`.

Creation proceeds after stage assignment and Note write. If Note creation fails (e.g., transient error), the job is still created as REJECTED — the Note is best-effort.

### 3. Seed Datafix

A datafix script (`scripts/fix-seed-blocked-keywords.ts`) upserts the legacy blocked keywords into the user settings. Run once per user.

| Legacy type | Mapped scope                                     |
| ----------- | ------------------------------------------------ |
| `title`     | `TITLE`                                          |
| `partial`   | `DESCRIPTION`                                    |
| `company`   | `COMPANY`                                        |
| `job`       | `DESCRIPTION` (treat as broad description match) |

All matchMode default to `PARTIAL` to match legacy behavior.

### 4. Settings UI (Profile → Settings)

A new section "Blocked Keywords" in the Settings page:

- **Keywords list**: each row shows keyword, scope badge, match mode badge, delete button.
- **Add keyword form**: text input + scope selector (`TITLE` / `DESCRIPTION` / `COMPANY`) + match mode toggle (`PARTIAL` / `EXACT`).
- **Blocked Companies**: separate textarea or tag input for company names.
- Each change triggers `updateSettings` mutation.

### 5. Quick Filter for REJECTED

The existing `ApplicationQuickFilter` enum already has `REJECTED`. The QuickFilters UI on the Jobs page already includes it — no change needed for the filter itself. Blocked jobs appear in the list when `REJECTED` filter is active.

## User Experience

### Jobs list

- New auto-blocked jobs appear when the user selects the `REJECTED` quick filter.
- No visual distinction between manually rejected and auto-blocked jobs in the list (they share the same stage).
- To see why a job was auto-blocked, the user opens the job and views its Notes tab — an auto-generated Note explains the match.
- No badge, counter, or "X jobs hidden" indicator in v1 — the REJECTED filter + Notes traceability suffice.

### Settings

- Section is collapsed by default; user expands it when needed.
- Keyword rows show at-a-glance: the term, its scope (Title / Description / Company), and match mode (Partial / Exact).
- Deleting a keyword does not retroactively un-reject existing jobs.

### Datafix

- Runs as a one-time script per user; no UI.
- Output shows how many keywords were inserted per user.

## Non-Goals

- No retroactive re-evaluation when keywords change.
- No "blocked by keyword" badge or distinct UI treatment in the job card.
- No allowlist / override per job.
- No per-source or per-import blocking rules.
- No machine learning or auto-suggestion.

## Phased Rollout Plan

1. **Seed & backend** — datafix script, keyword storage in settings, blocking logic in job creation.
2. **Settings UI** — keyword management section, updateSettings mutation.
3. **Activation** — enable blocking for all users; PM2 restart + codegen.

## Success Metrics

- Number of jobs auto-blocked per user per week.
- User engagement with keyword management (keywords added/removed per month).
- Reduction in manual stage changes from non-relevant to rejected.

## Risks and Mitigations

| Risk                                             | Mitigation                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| False positives block wanted jobs                | REJECTED filter lets user review; un-reject if needed                           |
| Large keyword list slows creation                | PARTIAL match on short strings is fast; JSONB index if needed                   |
| User regrets migrating legacy list               | Datafix is upsert + additive; user can delete after migration                   |
| Missing partial match for company in description | PARTIAL mode is default; description scope also covers company mentions in text |

## Architecture Decision Records

- **ADR-001** (`adrs/adr-001.md`): Structured keyword blocking with per-keyword scope (TITLE / DESCRIPTION / COMPANY) and matchMode (PARTIAL / EXACT) stored as JSONB in user settings.
- **ADR-002** (`adrs/adr-002.md`): Block on creation only — short-circuit stage assignment to REJECTED, no retroactive re-evaluation.
- **ADR-003** (`adrs/adr-003.md`): Auto-generated Note on block documenting the matched keyword and scope, giving users traceability without UI changes to the job list.

## Open Questions

None at this stage.
