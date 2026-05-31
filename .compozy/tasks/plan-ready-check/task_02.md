---
status: completed
title: Content script — Generalize waitForReadyCheck in jobs-list.service.ts
type: extension
complexity: low
dependencies:
  - task_01
---

# Task 02: Content script — Generalize waitForReadyCheck in jobs-list.service.ts

## Overview

Replace the hardcoded `waitForTelegramUpdateOrDelay` method with a generic `waitForReadyCheck(config?)` that accepts a `ReadyCheckConfig` parameter. Remove the after-scroll call (line 171), keeping only the initial call before the collection loop. When no config is provided, the method is a no-op.

<critical>
- Read the TechSpec before starting: `_techspec.md` in this directory
- Reference TechSpec §Core Interfaces for the exact method signature
- The types come from `@job-tracker/plan-schemas` — ensure correct import
- Do NOT change collection logic — only the ready check behavior
</critical>

<requirements>
- MUST rename `waitForTelegramUpdateOrDelay` to `waitForReadyCheck` with parameter signature `(config?: ReadyCheckConfig): Promise<void>`
- MUST import `ReadyCheckConfig` type from `@job-tracker/plan-schemas` (or inline if not exported — check task_01 exports)
- MUST return immediately (no-op) when `config` is `undefined` or `null`
- MUST return immediately when `document.querySelector(config.selector)` is null
- MUST return immediately when the element's textContent is empty
- MUST keep the same polling logic: wait for trigger text to appear and disappear, with resolve/watch timeout split
- MUST use `config.selector` instead of hardcoded `.input-search-placeholder`
- MUST use `config.value` (default "updating") instead of hardcoded "updating"
- MUST use `config.resolveTimeoutMs` (default 10_000) for the resolve timeout
- MUST use `config.watchTimeoutMs` (default 3_000) for the watch timeout
- MUST use `config.pollIntervalMs` (default 200) for the poll interval
- MUST remove the after-scroll `waitForTelegramUpdateOrDelay()` call (current line 171 in `execute()`)
- MUST keep the initial call before the loop (current line 93), updated to `await this.waitForReadyCheck(message.action.input.readyCheck)`
</requirements>

## Subtasks

- [ ] Rename method and add type import for `ReadyCheckConfig`
- [ ] Replace hardcoded selector/text/timeouts with config parameters
- [ ] Remove after-scroll call in `execute()` loop
- [ ] Update initial call to pass `message.action.input.readyCheck`
- [ ] Run typecheck + lint on extension package

## Implementation Details

**File to modify:** `apps/extension/src/domains/jobs-list/jobs-list.service.ts`

Key changes:

1. Add import: `import type { ReadyCheckConfig } from "@job-tracker/plan-schemas";` (verify exported type name)
2. Rename method and add `config?: ReadyCheckConfig` parameter
3. Replace hardcoded `.input-search-placeholder` → `config.selector`
4. Replace hardcoded `"updating"` → `config.value`
5. Replace hardcoded timeouts → config fields with defaults
6. Line 171: remove `await this.waitForTelegramUpdateOrDelay();`
7. Line 93: change to `await this.waitForReadyCheck(message.action.input.readyCheck);`

Refer to TechSpec §Core Interfaces for the reference implementation.

### Relevant Files

- `apps/extension/src/domains/jobs-list/jobs-list.service.ts` — Main file to modify
- `packages/plan-schemas/src/schema.ts` — Source of ReadyCheckConfig type (task_01)

### Dependent Files

- `apps/extension/src/domains/jobs-list/jobs-list.service.test.ts` — Will need test updates (task_04)

## Deliverables

- Updated `apps/extension/src/domains/jobs-list/jobs-list.service.ts` with `waitForReadyCheck(config?)`
- Removed after-scroll call
- All existing tests still pass

## Tests

### Unit Tests

- N/A — existing tests should still pass without changes (the new method is no-op when no config is passed, which matches current behavior for non-Telegram tests)

### Integration Tests

- N/A

## Success Criteria

- `pnpm --filter @job-tracker/extension run typecheck` passes
- All existing extension tests pass
