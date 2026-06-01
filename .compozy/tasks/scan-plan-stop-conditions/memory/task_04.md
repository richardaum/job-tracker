# Task Memory: task_04.md

## Objective Snapshot

Extension: Plan schema (mandatory boardType) + fixtures. Add `boardType` as a mandatory Zod enum field to PlanSchema, remove stopWhen fields (moved to SourceTemplate). Update PlanExecuteOptions with all scan config fields. Update fixture JSONs. Write schema validation tests.

## Important Decisions

- `boardType` must be mandatory (no `.optional()`) per TechSpec and ADR-001
- `PlanExecuteOptions.boardType` is also mandatory — the execution context must always know the board type
- `stopWhen`, `catchUpThreshold`, `maxPages`, `olderThanDays`, `publishedAtField` are optional on PlanExecuteOptions (they come from template config, not plan)
- `onJobCollected` return type changed from `Promise<void>` to `Promise<{ duplicate: boolean } | void>` per ADR-002

## Learnings

- Types auto-update via `z.infer<typeof PlanSchema>` — no manual changes to `types.ts`
- The `plan.example.json` fixture also needed boardType added (it's used by other tests)

## Files / Surfaces

- `apps/extension/src/domains/plan/model/schema.ts` — added `boardType: z.enum(["Sequential", "NonSequential"])`
- `apps/extension/src/domains/plan/plan-execute-options.ts` — added all scan config fields
- `apps/extension/src/domains/plan/model/schema.test.ts` — new file with 6 validation tests
- `apps/extension/src/domains/plan/fixtures/remoteyeah.plan.json` — added `"boardType": "Sequential"`
- `apps/extension/src/domains/plan/fixtures/telegram-jsgurujobs.plan.json` — added `"boardType": "NonSequential"`
- `apps/extension/src/domains/plan/fixtures/plan.example.json` — added `"boardType": "Sequential"`
- `apps/extension/src/domains/plan/services/collect-jobs.service.test.ts` — added `boardType: "Sequential"` to two test calls
- `apps/extension/src/domains/sources/source-run-events.service.ts` — added `boardType: plan.boardType` to execute call

## Errors / Corrections

None.

## Ready for Next Run

Yes.
