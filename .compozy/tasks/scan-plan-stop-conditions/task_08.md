---
status: completed
title: "Web: User Template UI for stop config"
type: web
complexity: medium
dependencies:
  - task_03
---

# Task 08: Web: User Template UI for stop config

## Overview

Add a Stop Condition configuration section to the SourceTemplate create and edit UI. The user picks a strategy (CatchUp, FirstRunMaxPages, OlderThan) and fills the required parameters. Fields are saved to the template's `config` JSONB.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add a Stop Condition section to the SourceTemplate create/edit dialog
- MUST include a dropdown for stopWhen: CatchUp, FirstRunMaxPages, OlderThan
- MUST show CatchUp threshold input only when CatchUp is selected
- MUST show maxPages input only when FirstRunMaxPages is selected
- MUST show olderThanDays input only when OlderThan is selected
- MUST save fields to `config` JSONB when submitting
- MUST load and pre-fill config when editing an existing template
- MUST show current values or defaults for existing templates without config

## Subtasks

- [ ] 08.1 Add stop condition dropdown to template form
- [ ] 08.2 Add conditional parameter fields (catchUpThreshold, maxPages, olderThanDays)
- [ ] 08.3 Wire form submission to config JSONB
- [ ] 08.4 Load existing config on edit
- [ ] 08.5 Write component tests

## Implementation Details

The template create/edit dialog is likely `NewSourceTemplateDialog.tsx` and the edit view. Add the stop config section after the existing fields (surfaceUrl, schedule). Use the same pattern for JSONB submission as the Plan document.

### Relevant Files

- `apps/web/src/modules/sources/page/NewSourceTemplateDialog.tsx` — create dialog
- `apps/web/src/modules/sources/page/EditSourceTemplateDialog.tsx` — edit dialog (if exists)
- `apps/web/src/modules/sources/hooks/` — view-models for mutations
- `apps/web/src/graphql/sources.graphql` — mutations
- `apps/api/src/domains/sources/create-source-template.input.ts` — accept config field
- `apps/api/src/domains/sources/update-source-template.input.ts` — accept config field

## Deliverables

- Stop condition UI in template create/edit
- Conditional parameter fields
- Component tests
- Test coverage >=80%

## Tests

- [ ] Stop condition dropdown renders all three options
- [ ] Selecting CatchUp shows threshold input (hides other fields)
- [ ] Selecting FirstRunMaxPages shows maxPages input (hides other fields)
- [ ] Selecting OlderThan shows days input (hides other fields)
- [ ] Form saves correct config JSONB
- [ ] Edit mode pre-fills existing config
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- User can configure stop condition on every template
- Config persists correctly in JSONB
- Conditional fields show/hide correctly based on selection
