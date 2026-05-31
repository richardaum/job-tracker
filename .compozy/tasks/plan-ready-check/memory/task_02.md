# Task Memory: task_02.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

## Important Decisions

- `ReadyCheckConfig` type was not exported from `@job-tracker/plan-schemas` — added export to `types.ts` and `index.ts` as part of this task

## Learnings

## Files / Surfaces

- `packages/plan-schemas/src/types.ts` — added `ReadyCheckConfig` type export
- `packages/plan-schemas/src/index.ts` — added `ReadyCheckConfig` to type exports
- `apps/extension/src/domains/jobs-list/jobs-list.service.ts` — generalized `waitForTelegramUpdateOrDelay` → `waitForReadyCheck(config?)`, removed after-scroll call

## Errors / Corrections

## Ready for Next Run
