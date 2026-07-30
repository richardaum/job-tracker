---
status: completed
title: "Frontend — GraphQL operations and codegen for AI settings"
type: web
complexity: low
dependencies:
  - task_09
  - task_10
---

# Task 11: Frontend — GraphQL operations and codegen for AI settings

## Overview

Add the `.graphql` operation definitions for the new fields and mutations, then run codegen to generate the typed Apollo hooks that tasks 12-14 depend on. This is a thin, mechanical task that unblocks all remaining frontend work in parallel.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add `aiEnabled`, `hasOpenAiKey`, `trialCallsUsed`, `trialCallsLimit` to the existing `Settings` query in `apps/web/src/graphql/settings.graphql`.
- MUST add `aiEnabled` as an available field on the `UpdateSettings` mutation's input usage in the same file.
- MUST add new operation definitions for `SaveOpenAiKey` and `RemoveOpenAiKey` mutations, following the existing file's structure and naming convention.
- MUST run `pnpm --filter @job-tracker/web run codegen` and commit the regenerated output in `apps/web/src/gql/` (hooks and SDK).
- MUST NOT hand-write or hand-edit generated files under `apps/web/src/gql/` — only the `.graphql` source files.
</requirements>

## Subtasks

- [ ] 11.1 Extend the `Settings` query with the 4 new fields
- [ ] 11.2 Add `SaveOpenAiKey` mutation operation
- [ ] 11.3 Add `RemoveOpenAiKey` mutation operation
- [ ] 11.4 Run codegen and verify generated hooks compile
- [ ] 11.5 Confirm the API's `schema.gql` (from task_09/task_10) is up to date before running codegen, since codegen reads from it directly

## Implementation Details

See TechSpec "Integration Points"/"Impact Analysis" for the codegen setup: `apps/web/codegen.ts` reads schema from `apps/api/src/schema.gql` and documents from `apps/web/src/graphql/**/*.graphql`, outputting to `apps/web/src/gql/hooks.ts` and `apps/web/src/gql/sdk.ts`.

### Relevant Files

- `apps/web/src/graphql/settings.graphql` — existing operations file to extend
- `apps/web/codegen.ts` — codegen config, confirms schema source and output paths
- `apps/api/src/schema.gql` — must reflect task_09/task_10 changes before codegen runs

### Dependent Files

- `apps/web/src/gql/hooks.ts`, `apps/web/src/gql/sdk.ts` — regenerated output consumed by task_12, task_13, task_14

## Deliverables

- Extended `settings.graphql` with new fields and 2 new mutations
- Regenerated `apps/web/src/gql/` output committed
- Unit tests with 80%+ coverage **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] Codegen runs without errors against the updated `schema.gql`
  - [ ] Generated hooks for `useSettingsQuery`, `useSaveOpenAiKeyMutation`, `useRemoveOpenAiKeyMutation` exist and are correctly typed (verified via a TypeScript compile check / `tsc --noEmit`)
- Test coverage target: >=80% (of any new non-generated code touched in this task; generated files are excluded from coverage accounting per existing project convention)
- All tests must pass

## Success Criteria

- All tests passing
- `pnpm --filter @job-tracker/web run codegen` runs cleanly with no manual patching of generated output
- `tsc --noEmit` passes for `apps/web` with the new generated types in place
