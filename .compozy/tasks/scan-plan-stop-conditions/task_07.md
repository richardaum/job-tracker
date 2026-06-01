---
status: completed
title: "Web: Admin Plan UI for boardType"
type: web
complexity: low
dependencies:
  - task_04
---

# Task 07: Web: Admin Plan UI for boardType

## Overview

Add a mandatory Board Type dropdown (Sequential / NonSequential) to the Plan creation and editing admin UI. The value is written into the Plan's `document` JSONB when saving.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add a Board Type dropdown to the Plan create/edit form
- MUST make it mandatory (can't submit without selection)
- MUST save into plan's `document` JSONB as `boardType`
- MUST show current value when editing an existing plan
- MUST migrate existing plans: show as unset (admin must pick)

## Subtasks

- [x] 07.1 Add BoardType dropdown to Plan create form
- [x] 07.2 Add BoardType dropdown to Plan edit form
- [x] 07.3 Wire to document JSONB on save
- [x] 07.4 Handle existing plans without boardType (show empty state)
- [x] 07.5 Write component tests

## Implementation Details

The Plan create/edit forms are in `apps/web/src/modules/sources/page/`. The `document` field is JSONB — add `boardType` to the object before serializing.

### Relevant Files

- `apps/web/src/modules/sources/page/` — look for Plan create/edit forms
- `apps/web/src/modules/sources/hooks/` — view-models
- `apps/web/src/graphql/sources.graphql` — plan mutations

### Dependent Files

- `apps/api/src/domains/sources/create-plan.input.ts` — document is JSON, no change needed

## Deliverables

- BoardType dropdown on Plan forms
- Component tests
- Test coverage >=80%

## Tests

- [x] Dropdown renders two options: Sequential, NonSequential
- [x] Form submission includes boardType in document JSONB
- [x] Edit form pre-selects existing boardType
- [x] Existing plan without boardType shows empty/unset state
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Admin can set boardType on all plans
- All existing plans eventually get boardType assigned
