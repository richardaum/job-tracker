---
status: completed
title: "Extension: Plan schema (mandatory boardType) + fixtures"
type: extension
complexity: low
dependencies: []
---

# Task 04: Extension: Plan schema (mandatory boardType) + fixtures

## Overview

Update the extension's `PlanSchema` Zod validation to require `boardType` (Sequential / NonSequential) and remove the previously planned stopWhen fields (they moved to SourceTemplate). Update plan fixture JSONs to include `boardType`. Update `PlanExecuteOptions` to accept all scan config fields.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST make `boardType` a mandatory field in `PlanSchema` (z.enum, no .optional())
- MUST NOT include stopWhen, catchUpThreshold, maxPages, olderThanDays in PlanSchema
- MUST update `PlanExecuteOptions` to include `boardType`, `stopWhen`, `catchUpThreshold`, `maxPages`, `olderThanDays` (these come from template, not plan)
- MUST update fixture JSONs (remoteyeah → Sequential, telegram → NonSequential)
- MUST ensure backward compatibility: existing behavior maintained for plans that would be parsed

## Subtasks

- [x] 04.1 Update PlanSchema: boardType mandatory, remove stop fields
- [x] 04.2 Update PlanExecuteOptions: add all scan config fields
- [x] 04.3 Update fixture JSONs with boardType
- [x] 04.4 Verify type inference in types.ts
- [x] 04.5 Write schema validation tests

## Implementation Details

See TechSpec "Core Interfaces: Plan schema" for the exact shape.

### Relevant Files

- `apps/extension/src/domains/plan/model/schema.ts` — update PlanSchema
- `apps/extension/src/domains/plan/model/types.ts` — auto-updated via z.infer
- `apps/extension/src/domains/plan/plan-execute-options.ts` — update type
- `apps/extension/src/domains/plan/fixtures/remoteyeah.plan.json` — add boardType
- `apps/extension/src/domains/plan/fixtures/telegram-jsgurujobs.plan.json` — add boardType
- `apps/api/src/domains/sources/fixtures/` — mirror if they exist

## Deliverables

- Updated PlanSchema with mandatory boardType
- Updated PlanExecuteOptions with all scan config fields
- Updated fixtures
- Schema validation tests
- Test coverage >=80%

## Tests

- [x] Plan with boardType → parses successfully
- [x] Plan without boardType → validation error
- [x] Plan with unknown boardType → validation error
- [x] PlanExecuteOptions accepts all scan config fields (type check)
- [x] Extra unknown properties rejected (strict mode)
- [x] boardType wrong type rejected
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Existing fixtures parse with mandatory boardType
