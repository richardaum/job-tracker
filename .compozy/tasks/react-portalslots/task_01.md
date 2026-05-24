---
status: completed
title: Add react-portalslots dependency
type: chore
complexity: low
dependencies: []
---

# Task 01: Add react-portalslots dependency

## Overview

Install `react-portalslots` in the `@job-tracker/web` package so job details can use named portal slots instead of a custom context provider and manual `createPortal`. This is the only dependency change for Fase 1.

<critical>
- ALWAYS READ the PRD before starting
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — verify install does not break existing tests (no new test files needed)
</critical>

<requirements>
- MUST run `pnpm add react-portalslots --filter @job-tracker/web`
- MUST update `apps/web/package.json` and root lockfile (`pnpm-lock.yaml`)
- MUST NOT add the dependency to other packages unless required by this feature
- SHOULD confirm the package resolves and type definitions are available (library ships TypeScript)
</requirements>

## Subtasks

- [x] 1.1 Add `react-portalslots` to `@job-tracker/web` via pnpm filter
- [x] 1.2 Confirm lockfile updated and package appears under `apps/web/package.json` dependencies
- [x] 1.3 Run a quick typecheck on web to ensure no install regressions

## Implementation Details

Single-package dependency addition. No application code changes in this task.

See PRD "Fase 1 — Job details" requirement 1.

### Relevant Files

- `apps/web/package.json` — add `react-portalslots` to `dependencies`
- `pnpm-lock.yaml` — lockfile entry for the new package

### Dependent Files

- `apps/web/src/modules/jobs/details/job-details-header.slots.ts` — created in task 02; imports from `react-portalslots`

## Deliverables

- `react-portalslots` listed in `apps/web/package.json`
- Updated `pnpm-lock.yaml`
- `pnpm --filter @job-tracker/web typecheck` passes **(REQUIRED)**

## Tests

### Unit Tests

- [x] No new unit tests required — install-only task

### Integration Tests

- [x] `pnpm --filter @job-tracker/web typecheck` exits 0 after install

## Success Criteria

- `react-portalslots` is importable from `@job-tracker/web`
- Lockfile committed-ready (no manual edits)
- All tests passing (baseline — no regressions from install)
