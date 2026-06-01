# Task Memory: task_06.md

## Objective Snapshot

Implement SourceRun stop config reading in source-run-events.service.ts, integrate isJobDuplicate in onJobCollected, and implement all 3 stop strategies (CatchUp, FirstRunMaxPages, OlderThan) in CollectJobsService.

## Important Decisions

- Schema.gql was stale (no StopWhen enum, no stop config fields on SourceRunType) — manually added them so extension codegen could regenerate
- Stop config from SourceRun API passed through SourceRunStartMessage type (not fetched separately inside executeSourceRun)

## Learnings

- LogService has debug/warn/error but not info — used debug for stop-condition-met log
- Codegen reads schema.gql from filesystem (not from running API), so manual schema.gql update + codegen works even with broken API

## Files / Surfaces

- `apps/api/src/schema.gql` — added StopWhen enum + stopWhen/catchUpThreshold/maxPages/olderThanDays to SourceRunType
- `apps/extension/src/graphql/source-runs.graphql` — added stop config field requests
- `apps/extension/src/gql/graphql.ts` — regenerated via codegen
- `apps/extension/src/domains/plan/services/collect-jobs.service.ts` — stop logic + shouldStopAfterPage
- `apps/extension/src/domains/plan/services/collect-jobs.service.test.ts` — stop strategy tests
- `apps/extension/src/domains/sources/source-run-events.service.ts` — read stop config, isJobDuplicate in onJobCollected, publishedAtField extraction
- `apps/extension/src/domains/sources/source-run-events.service.test.ts` — existing tests pass (no changes needed)

## Errors / Corrections

- `info` method doesn't exist on LogService — changed to `debug`
- Dedup key collision in tests across pages — used unique job titles per page

## Ready for Next Run
