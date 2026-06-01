# Task Memory: task_01.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Add `ReadyCheckModeSchema`, `ReadyCheckConfigSchema` to `packages/plan-schemas/src/schema.ts`, wire `readyCheck` into `PlanStepCollectJobsInputSchema`, export new schemas from `index.ts`.

## Important Decisions

- `value` field uses `LIMITS.regexPattern` as max length (consistent with other pattern-like fields)
- Used `.optional().default("updating")` for `value` — matches techspec spec that it can be absent but defaults to "updating"

## Learnings

- `PlanStepCollectJobsInputSchema` is the input schema for `collect.jobs` step; `readyCheck` is optional and placed after `pagination`, before `surfaceFields`
- No test setup exists in plan-schemas; covered by typecheck

## Files / Surfaces

- `packages/plan-schemas/src/schema.ts` — Added ReadyCheckModeSchema (line 21), ReadyCheckConfigSchema (line 23), wired readyCheck into PlanStepCollectJobsInputSchema
- `packages/plan-schemas/src/index.ts` — Added exports for ReadyCheckConfigSchema, ReadyCheckModeSchema

## Errors / Corrections

None.

## Ready for Next Run

Yes. Typecheck passes on plan-schemas and all downstream packages.
