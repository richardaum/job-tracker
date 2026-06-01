---
status: completed
title: "Extension: SourceRun config + CollectJobsService stop logic"
type: extension
complexity: high
dependencies:
  - task_03
  - task_04
  - task_05
---

# Task 06: Extension: SourceRun config + CollectJobsService stop logic

## Overview

Wire the stop config from the SourceRun API response through the execution pipeline and implement the three stop strategies (CatchUp, FirstRunMaxPages, OlderThan) in `CollectJobsService`. This is the core behavioral change.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST read stop config fields from SourceRun API response in `SourceRunEventsService`
- MUST call `isJobDuplicate` before `createJob` in `onJobCollected`; skip creation when duplicate
- MUST pass all scan config fields to `PlanExecuteOptions` in `source-run-events.service.ts`
- MUST implement `CatchUp` stop logic: track consecutive duplicates, break when consecutive >= threshold
- MUST implement `FirstRunMaxPages` stop logic: break when page count >= maxPages
- MUST implement `OlderThan` stop logic: parse `publishedAt` from job fields, break when job is older than `olderThanDays`
- MUST log stop reason with all relevant counters when a stop condition triggers
- MUST fall back to scanning all pages (current behavior) when no stop config is provided

## Subtasks

- [x] 06.1 Update `source-run-events.service.ts` to read stop config from SourceRun response
- [x] 06.2 Update `onJobCollected` to call `isJobDuplicate` and return `{ duplicate: boolean }`
- [x] 06.3 Update `source-run-plan.ts` or execution context to pass boardType + stop config through
- [x] 06.4 Implement CatchUp counter and break logic in `CollectJobsService`
- [x] 06.5 Implement FirstRunMaxPages break logic
- [x] 06.6 Implement OlderThan per-job date check
- [x] 06.7 Wire `getPublishedAtFieldName()` helper to extract field key from plan
- [x] 06.8 Write unit + integration tests

## Implementation Details

See TechSpec "Core Interfaces: CollectJobsService stop logic" and "Core Interfaces: Extension execution context" for the full pattern.

### Relevant Files

- `apps/extension/src/domains/sources/source-run-events.service.ts` — read config, modify callback
- `apps/extension/src/domains/sources/source-run-plan.ts` — pass plan's boardType to executor
- `apps/extension/src/domains/plan/services/collect-jobs.service.ts` — stop logic
- `apps/extension/src/domains/plan/plan-execute-options.ts` — already updated (task 04)
- `apps/extension/src/domains/plan/services/plan.service.ts` — may need to pass through options

### Dependent Files

- `apps/extension/src/domains/api/api.service.ts` — isJobDuplicate method (task 05)
- `apps/extension/src/domains/plan/model/schema.ts` — PlanSchema with boardType (task 04)

## Deliverables

- Full stop logic for all three strategies
- isJobDuplicate integration in onJobCollected
- Log event on stop
- Unit tests for each strategy
- Integration test with mocked API
- Test coverage >=80%

## Tests

- CatchUp:
  - [x] Consecutive duplicates stop at threshold
  - [x] Non-duplicate resets counter
  - [x] Threshold not reached → continues scanning
- FirstRunMaxPages:
  - [x] Stops exactly at maxPages
  - [x] maxPages=1 stops after first page
- OlderThan:
  - [x] Stops when publishedAt exceeds olderThanDays
  - [x] Continues when job is recent enough
- [x] No stop config → scans all pages (backward compat)
- [ ] Stop source run marks as Completed (not Failed) — covered by existing test in source-run-events.service.test.ts
- Test coverage target: >=80% ✓ (56 pass, 0 fail)
- All tests must pass ✓

## Success Criteria

- All tests passing
- Test coverage >=80%
- Each stop strategy works correctly in isolation
- Extension maintains backward compatibility with existing runs
