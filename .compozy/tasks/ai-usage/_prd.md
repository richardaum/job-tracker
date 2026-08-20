# PRD: AI Usage

**Status**: approved · **Priority**: high · **Created**: 2026-08-20

## Overview

AI Usage gives a user one Profile subtab for monitoring AI consumption inside Job Tracker. It has two clearly separate areas: Personal OpenAI Key Usage and AI Trial Usage. Each area reports Job Tracker usage over the last 30 days without mixing the two sources.

## Goals

- Make current personal-key usage discoverable from Profile.
- Show total, input, and output tokens plus calls for the last 30 days.
- Automatically load usage when the tab opens and provide a manual Refresh control.
- Keep the AI Trial area separate and accurate.
- Never imply that unavailable or delayed provider data is complete.

## User Stories

- As a user with a saved OpenAI key, I want to see the total, input, and output tokens plus calls consumed by Job Tracker over the last 30 days so that I can monitor my recent usage.
- As a user, I want to refresh this information on demand so that I can check for newer data.
- As a user without a saved key or without accessible provider data, I want a clear explanation so that I know why usage is not shown.
- As a trial user, I want to see the tokens and calls Job Tracker consumed during my trial in a separate area, as well as the existing trial allowance and remaining calls, so that I understand my trial status.

## Core Features

1. **Profile AI Usage subtab** — A top-level Profile tab named "AI Usage," alongside the current Profile sections.
2. **Personal OpenAI Key Usage area** — Shows the saved key's Job Tracker usage for the last 30 days: total, input, and output tokens; calls; freshness information; automatic loading; and a manual Refresh control.
3. **Honest availability states** — When no key is saved, the area directs users to add one and preserves the separate AI Trial area. Usage begins being tracked when the feature ships; no historical estimate is presented.
4. **AI Trial area** — Separately displays Job Tracker trial total, input, and output tokens; calls; the existing trial call allowance; trial calls remaining; and a clear exhausted state when no calls remain.

## User Experience

A user opens Profile → AI Usage. The personal-key area appears first and loads recent usage automatically. A Refresh control lets them request newer data. Total tokens and calls are readable at a glance, with input and output shown as separate supporting values.

The AI Trial area remains visibly separate below it, showing trial tokens, calls, and the existing trial allowance. Users without a personal key still see this trial information. Users with a key can see both areas without mistaking trial usage for personal-key usage.

## High-Level Technical Constraints

- The personal key remains private and is never exposed to the browser or displayed in full.
- Each user can see only their own usage and trial information.
- Usage counts only successful OpenAI calls initiated by Job Tracker after this feature launches.
- The existing AI Trial behavior remains unchanged.

## Non-Goals (Out of Scope)

- Cost, spending-limit, invoice management, or use outside Job Tracker.
- Historical periods beyond the last 30 days.
- Charts, forecasts, budgets, alerts, or per-model breakdowns.
- Usage for non-OpenAI providers.
- Combining trial calls and personal-key tokens into one total.
- Changing the existing trial allowance or AI-access behavior.

## Phased Rollout Plan

### MVP (Phase 1)

- Add the AI Usage Profile subtab.
- Show last-30-days personal-key and AI Trial total, input, and output tokens plus calls.
- Add automatic and manual refresh.
- Add clear unavailable, missing-key, and stale-data states.
- Add the separate AI Trial area.

### Phase 2

- Add optional periods, charts, costs, and per-model breakdowns if users need deeper analysis.

### Phase 3

- Add user-controlled budgets or usage alerts if monitoring demand warrants it.

## Success Metrics

- Every user can find AI Usage from Profile in one navigation step.
- The panel accurately separates personal-key and AI Trial tokens and calls.
- Refresh reliably updates the displayed data or communicates why it cannot.
- No key material is exposed in UI, logs, or error messages.
- Existing trial usage remains correct after release.

## Risks and Mitigations

| Risk                                            | Mitigation                                                              |
| ----------------------------------------------- | ----------------------------------------------------------------------- |
| Historical usage before launch is unavailable   | Show a truthful zero-state rather than estimating it.                   |
| Users may confuse token counts with trial calls | Keep two labelled, separate areas with the same token and call metrics. |
| Users may expect costs                          | State that this first release reports tokens only.                      |

## Architecture Decision Records

- [ADR-001: Provide an in-app OpenAI usage panel](adrs/adr-001.md) — Delivers separate last-30-days personal-key and AI Trial areas.

## Open Questions

None.
