---
status: completed
title: Schema — Add readyCheck types to plan-schemas
type: api
complexity: low
dependencies: []
---

# Task 01: Schema — Add readyCheck types to plan-schemas

## Overview

Add `ReadyCheckConfigSchema` and `ReadyCheckModeSchema` to `packages/plan-schemas/src/schema.ts`, wire `readyCheck` as an optional field in `PlanStepCollectJobsInputSchema`, and export the new types from `src/index.ts`.

<critical>
- Read the TechSpec before starting: `_techspec.md` in this directory
- Reference the TechSpec "Core Interfaces" section for the exact schema shape
- Focus on WHAT needs to change, not HOW
- Minimize code — the schema additions are small and well-defined
- Tests are in task_04, not here — just make sure types compile
</critical>

<requirements>
- MUST add `ReadyCheckModeSchema` as `z.enum(["text"])` in schema.ts
- MUST add `ReadyCheckConfigSchema` with fields: `selector` (required), `mode` (default "text"), `value` (optional, default "updating"), `resolveTimeoutMs` (optional, default 10_000), `watchTimeoutMs` (optional, default 3_000), `pollIntervalMs` (optional, default 200)
- MUST add `readyCheck: ReadyCheckConfigSchema.optional()` to `PlanStepCollectJobsInputSchema`
- MUST use `LIMITS.selector` for the selector field max length, `LIMITS.regexPattern` for value max length
- MUST export `ReadyCheckConfigSchema`, `ReadyCheckModeSchema` from `packages/plan-schemas/src/index.ts`
- SHOULD place `readyCheck` after `pagination` and before `surfaceFields` in the schema (alongside other optional config controls)
- MUST NOT change any existing types or break existing consumers
</requirements>

## Subtasks

- [x] Add `ReadyCheckModeSchema` using `z.enum(["text"])`
- [x] Add `ReadyCheckConfigSchema` with all fields and strict()
- [x] Wire `readyCheck?: ReadyCheckConfigSchema` into `PlanStepCollectJobsInputSchema`
- [x] Export new schemas from `src/index.ts`
- [x] Run typecheck to confirm no compilation errors

## Implementation Details

**File to modify:** `packages/plan-schemas/src/schema.ts`

Insert `ReadyCheckModeSchema` and `ReadyCheckConfigSchema` near the top of the file (after `FieldValidationRegexSchema`, before `PlanStepCollectJobsSurfaceFieldSchema`). Wire `readyCheck` into `PlanStepCollectJobsInputSchema` after the `pagination` field block.

**File to modify:** `packages/plan-schemas/src/index.ts`

Add named exports for `ReadyCheckConfigSchema` and `ReadyCheckModeSchema`.

Refer to TechSpec §Core Interfaces for the exact zod schema.

### Relevant Files

- `packages/plan-schemas/src/schema.ts` — Add new zod schemas and wire into input schema
- `packages/plan-schemas/src/index.ts` — Export new schemas
- `packages/plan-schemas/src/constants.ts` — Use exiting LIMITS values
- `packages/plan-schemas/src/types.ts` — No change needed (inferred from zod)

### Dependent Files

- `apps/extension/src/domains/jobs-list/jobs-list.service.ts` — Will consume ReadyCheckConfig type (task_02)
- `apps/web/src/modules/sources/page/plan-editor/types.ts` — Will mirror ReadyCheckConfig in UI types (task_05)

## Deliverables

- Updated `packages/plan-schemas/src/schema.ts` with ReadyCheckModeSchema + ReadyCheckConfigSchema + wired into input schema
- Updated `packages/plan-schemas/src/index.ts` with new exports
- Typecheck passes on `packages/plan-schemas`

## Tests

No tests for this task — plan-schemas has no test setup. Covered by typecheck.

### Unit Tests

- N/A (no test setup in plan-schemas)

### Integration Tests

- N/A (covered by downstream typecheck)

## Success Criteria

- `pnpm --filter @job-tracker/plan-schemas run typecheck` passes
- Existing downstream typecheck and lint still pass
