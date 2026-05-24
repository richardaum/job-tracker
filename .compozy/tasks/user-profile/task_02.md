---
status: completed
title: "Wire duplicate window to SettingsService"
type: backend
complexity: low
dependencies: [task_01]
---

# Task 02: Wire duplicate window to SettingsService

## Overview

Replace the hardcoded `APPLICATION_DUPLICATE_PAIRING_WINDOW_MS` constant (30 days in ms) with a dynamic read from `SettingsService.getSettings().duplicateWindowDays`. This ensures the duplicate detection window respects the user's configured preference instead of a fixed 30-day value.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST inject `SettingsService` into `JobsService`
- MUST replace all reads of `APPLICATION_DUPLICATE_PAIRING_WINDOW_MS` with `settingsService.getSettings(userId)` → convert `duplicateWindowDays` to milliseconds
- MUST handle the case where user has no settings (lazy init in SettingsService handles this)
- MUST remove the `APPLICATION_DUPLICATE_PAIRING_WINDOW_MS` export from `job-duplicate.constants.ts` (delete file if it only contains this constant; otherwise remove only the constant)
- MUST NOT change the duplicate detection logic — only the window duration source
</requirements>

## Subtasks

- [ ] 2.1 Read `apps/api/src/domains/jobs/job-duplicate.constants.ts` and `apps/api/src/domains/jobs/jobs.service.ts` to find all usages of the constant
- [ ] 2.2 Inject `SettingsService` into `JobsService`
- [ ] 2.3 Replace constant reads with `settingsService.getSettings(userId).duplicateWindowDays * 24 * 60 * 60 * 1000`
- [ ] 2.4 Remove constant from `job-duplicate.constants.ts` (delete file if now empty)
- [ ] 2.5 Update `JobsModule` to import `SettingsModule` (or add `SettingsService` to providers)
- [ ] 2.6 Verify: `pnpm --filter api typecheck` passes

## Implementation Details

See TechSpec § Backward Compatibility for the replacement approach.

The constant lives at `apps/api/src/domains/jobs/job-duplicate.constants.ts`. Find all imports of `APPLICATION_DUPLICATE_PAIRING_WINDOW_MS` across the codebase and replace them.

If `JobsModule` doesn't import `SettingsModule`, it must — otherwise DI will fail. Alternatively, export `SettingsService` from `SettingsModule` and add it to `JobsModule` imports.

### Relevant Files

- `apps/api/src/domains/jobs/job-duplicate.constants.ts` — hardcoded constant to remove
- `apps/api/src/domains/jobs/jobs.service.ts` — consumer of the constant
- `apps/api/src/domains/jobs/jobs.module.ts` — may need to import SettingsModule

### Dependent Files

- `apps/api/src/domains/jobs/jobs.service.spec.ts` — tests must mock `SettingsService` (task_11)

### Related ADRs

- [ADR-003: User Settings as Typed Entity](../adrs/adr-003.md) — Replace hardcoded constant with settings service call

## Deliverables

- Updated `apps/api/src/domains/jobs/jobs.service.ts` (or whichever service uses the constant)
- Updated `apps/api/src/domains/jobs/job-duplicate.constants.ts` (constant removed or file deleted)
- Updated `apps/api/src/domains/jobs/jobs.module.ts` (if SettingsModule import needed)

## Tests

Tests written in task_11. Requirements:

- Unit tests (update existing `jobs.service.spec.ts`):
  - [ ] Mock `SettingsService.getSettings()` returns `{ duplicateWindowDays: 30 }` → duplicate window set to 30 days in ms
  - [ ] Mock `SettingsService.getSettings()` returns `{ duplicateWindowDays: 7 }` → duplicate window set to 7 days in ms
  - [ ] Mock `SettingsService.getSettings()` returns `{ duplicateWindowDays: 1 }` → duplicate window set to 1 day in ms
- Test coverage target: >=80%

## Success Criteria

- `pnpm --filter api typecheck` passes
- `APPLICATION_DUPLICATE_PAIRING_WINDOW_MS` no longer exists in codebase
- Duplicate detection uses user's configured window days
- Existing tests updated to mock `SettingsService`
