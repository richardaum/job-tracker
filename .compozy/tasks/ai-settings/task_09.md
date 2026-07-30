---
status: completed
title: "GraphQL — extend UserSetting type and UpdateSettingsInput"
type: api
complexity: medium
dependencies:
  - task_02
---

# Task 9: GraphQL — extend UserSetting type and UpdateSettingsInput

## Overview

Expose the new columns (task_02) over GraphQL so the frontend can read AI settings state and toggle the `aiEnabled` flag through the existing `settings`/`updateSettings` operations, following the same pattern already used for `autoFillEnabled`/`autoSummaryEnabled`/`autoMatchEnabled`.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add `aiEnabled: Boolean!` to the `UserSetting` GraphQL type (`apps/api/src/domains/settings/user-setting.type.ts`), mirroring the entity field.
- MUST add `hasOpenAiKey: Boolean!` to `UserSetting` as a computed field derived from `openaiApiKeyEncrypted !== null` — the raw/decrypted key MUST NEVER be exposed as a GraphQL field.
- MUST add `trialCallsUsed: Int!` and `trialCallsLimit: Int!` to `UserSetting` (`trialCallsLimit` reads from `apiEnv.TRIAL_AI_CALL_LIMIT`, not a database column).
- MUST add an optional `aiEnabled: Boolean` field to `UpdateSettingsInput` (`apps/api/src/domains/settings/update-settings.input.ts`), following the existing `@Field()` decorator style used for the other optional booleans.
- MUST update `SettingsService.updateSettings()` so `aiEnabled` is persisted when present in the input, using the same `Object.assign(settings, input); repo.save(settings)` pattern already in use.
- MUST NOT add `openaiApiKeyEncrypted` or any raw key field to the GraphQL type — key management is exposed only through the dedicated mutations in task_10.
- MUST NOT change `NestJS`'s `autoSchemaFile` code-first generation approach — `schema.gql` regenerates automatically from these decorators at dev-server start.
</requirements>

## Subtasks

- [x] 9.1 Add `aiEnabled`, `hasOpenAiKey`, `trialCallsUsed`, `trialCallsLimit` fields to the `UserSetting` GraphQL type
- [x] 9.2 Add `aiEnabled` to `UpdateSettingsInput`
- [x] 9.3 Update `SettingsService.updateSettings()` to persist `aiEnabled`
- [x] 9.4 Update `SettingsService.getSettings()` (or equivalent resolver-level mapping) to compute `hasOpenAiKey` and populate `trialCallsLimit` from env
- [x] 9.5 Update existing `settings.resolver.spec.ts`/`settings.service.spec.ts` for the new fields

## Implementation Details

See TechSpec "Data Models" (GraphQL `UserSetting` type additions) and "API Endpoints" sections. Follow the exact patterns in `apps/api/src/domains/settings/settings.resolver.ts` (`Query settings`, `Mutation updateSettings`) and `update-settings.input.ts` (nullable `@Field()` booleans/ints) already confirmed in this codebase.

### Relevant Files

- `apps/api/src/domains/settings/user-setting.type.ts` — GraphQL type to extend
- `apps/api/src/domains/settings/update-settings.input.ts` — input DTO to extend
- `apps/api/src/domains/settings/settings.service.ts` — `getSettings`/`updateSettings` logic
- `apps/api/src/domains/settings/settings.resolver.ts` — resolver, likely unchanged beyond type/input flowing through
- `apps/api/src/domains/settings/settings.service.spec.ts`, `apps/api/src/domains/settings/settings.resolver.spec.ts` — existing test files to extend

### Dependent Files

- `apps/api/src/schema.gql` — auto-regenerated at dev-server start from these decorators; no manual edit needed
- `apps/web/src/graphql/settings.graphql` — task_11 adds the new fields to the frontend query

## Deliverables

- `UserSetting` type extended with 4 new fields
- `UpdateSettingsInput` extended with `aiEnabled`
- `SettingsService` updated to persist and compute the new fields
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for the `settings` query and `updateSettings` mutation **(REQUIRED)**

## Tests

- Unit tests:
  - [x] `getSettings()` returns `hasOpenAiKey: false` when `openaiApiKeyEncrypted` is `null`, `true` when set
  - [x] `getSettings()` returns `trialCallsLimit` equal to `apiEnv.TRIAL_AI_CALL_LIMIT`
  - [x] `updateSettings({ aiEnabled: false })` persists the value and the next `getSettings()` reflects it
- Integration tests:
  - [x] GraphQL `settings` query returns `aiEnabled`, `hasOpenAiKey`, `trialCallsUsed`, `trialCallsLimit` with correct values for a seeded user
  - [x] GraphQL `updateSettings` mutation with `{ aiEnabled: false }` updates only that field, leaving other settings (`autoFillEnabled` etc.) untouched
  - [x] No response from the `settings` query or `updateSettings` mutation ever includes the raw or encrypted key value
- [x] Test coverage target: >=80% (achieved 84%)
- [x] All tests must pass (35/35 passing)

## Success Criteria

- All tests passing
- Test coverage >=80%
- `schema.gql` regenerates with the new fields with no manual intervention
- Existing settings tests for `autoFillEnabled`/`autoSummaryEnabled`/`autoMatchEnabled`/`duplicateWindowDays` still pass unmodified
