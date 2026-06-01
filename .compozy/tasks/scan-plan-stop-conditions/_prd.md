# PRD: Scan Plan Stop Conditions

## Overview

Job boards differ in how they list jobs. Some are **sequential** (newest job first, paginated in order) — after scanning page 1, page 2, etc., the scanner eventually reaches jobs it has already seen, meaning it has "caught up" with all new listings. Others are **non-sequential** — jobs appear in no clear order; a new job can appear anywhere.

Currently, the scanner has no concept of board type or stop condition. It relies on a fixed page limit (50 pages) and never stops early based on content. This wastes time re-scanning pages of already-known jobs on sequential boards and provides no mechanism to stop based on job age.

This feature introduces **board type** on the Plan and **stop conditions** on the SourceTemplate so the scanner can stop intelligently.

## Goals

- Reduce redundant scanning on sequential boards by stopping when caught up or when jobs exceed a configured age
- Require every template to have an explicit stop strategy — no "never stop" default
- Cover the first-run gap: templates with no execution history need a separate strategy until the database has enough data for duplicate-based detection
- Give plan authors a way to declare a board's ordering behavior (mandatory)

## User Stories

- As an **admin creating a Plan**, I must declare whether a board is sequential or non-sequential so the scanner knows the board's ordering.
- As a **user creating a SourceTemplate**, I must choose a stop strategy for my scans so the scanner knows when to stop.
- As a **user on a sequential board**, I want to set CatchUp threshold so the scanner stops when it has collected all new jobs.
- As a **user running my first scan**, I want FirstRunMaxPages so the scanner stops after a few pages even though no jobs exist in the database yet.
- As a **user who only wants recent jobs**, I want the scanner to stop when jobs are older than N days.

## Core Features

### F1: Board type on Plan (mandatory)

Every Plan has a `boardType`:

- `Sequential` — jobs appear in predictable order (newest first). Paginated boards.
- `NonSequential` — jobs appear in no clear order; a new job can appear anywhere.

Stored in the Plan's `document` JSONB. **Mandatory** — every plan must specify this.

### F2: Stop conditions on SourceTemplate (mandatory)

Every SourceTemplate has a `stopWhen` with one of the following values:

| Value              | Meaning                                                     | Requires                                                    | Works on        |
| ------------------ | ----------------------------------------------------------- | ----------------------------------------------------------- | --------------- |
| `CatchUp`          | Stop after N consecutive jobs already in the database       | `catchUpThreshold`                                          | Sequential only |
| `FirstRunMaxPages` | Stop after N pages (for templates with no or few past runs) | `maxPages`                                                  | Any board       |
| `OlderThan`        | Stop when a job is older than N days                        | `olderThanDays` + `publishedAt` in the Plan's surfaceFields | Any board       |

The user configures stop conditions when creating or editing a SourceTemplate.

### F3: Extension applies stop logic

The extension reads `boardType` from the plan and `stopWhen` (plus its parameters) from the source run data. During scanning, it checks each collected job against the configured stop condition and stops navigating to further pages when the condition is met.

### F4: Admin UI for Plan editing

Plan creation/editing UI includes a mandatory Board Type dropdown (Sequential / NonSequential).

### F5: User UI for Template editing

SourceTemplate creation/editing UI includes:

- Stop condition dropdown (CatchUp / FirstRunMaxPages / OlderThan)
- Parameter fields depending on the selected condition

## Non-Goals (Out of Scope)

- Scheduler integration. The `scheduleCron` / `scheduleEnabled` fields remain untouched.
- Server-side re-scanning. The extension is the sole executor.
- Per-scan override of stop conditions. Config is fixed per template.

## Phased Rollout Plan

### Phase 1 (MVP)

- Add mandatory `boardType` to Plan schema
- Add `stopWhen` + parameter fields to SourceTemplate schema (server + extension)
- Backend migration for new SourceTemplate columns
- Extension logic for CatchUp and FirstRunMaxPages
- Admin UI for Plan boardType
- User UI for Template stopWhen

### Phase 2

- Extension logic for OlderThan
- Requires `publishedAt` field in the board's Plan surfaceFields

## Success Metrics

- Reduction in average scan duration for sequential boards by at least 40%
- Zero false stops (scanner never stops before reaching genuinely new jobs within configured bounds)
- All existing plans migrated to mandatory boardType

## Risks and Mitigations

- **Ambiguous board type**: admin may misclassify a board. Mitigation: Sequential boards that never trigger CatchUp (wrong classification) behave as before — scans run to max page limit. The user can adjust.
- **First-run detection**: differentiating "first run" from subsequent runs. Mitigation: track `totalRuns` on the SourceTemplate; FirstRunMaxPages applies until that threshold; a separate field `firstRunMaxPagesCount` controls how many early runs use this strategy.

## Architecture Decision Records

- [ADR-001: Store board type in Plan document JSONB; stop conditions in SourceTemplate](adrs/adr-001.md)
- [ADR-002: Extension-driven duplicate check via dedicated GraphQL query](adrs/adr-002.md)
