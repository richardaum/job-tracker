---
status: completed
title: "GraphQL — saveOpenAiKey and removeOpenAiKey mutations"
type: api
complexity: medium
dependencies:
  - task_03
  - task_04
---

# Task 10: GraphQL — saveOpenAiKey and removeOpenAiKey mutations

## Overview

Add the two mutations that let a user manage their own OpenAI key: `saveOpenAiKey` validates the key against OpenAI before persisting it encrypted, and `removeOpenAiKey` clears it. Per the PRD and ADR-002, removing a key never changes `aiEnabled` — the toggle and key are independent states.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add `saveOpenAiKey(key: String!): UserSetting` as a new GraphQL mutation on `SettingsResolver`, guarded the same way as `updateSettings` (`JwtAuthGuard`, `RolesGuard`).
- MUST validate the provided key by calling `GET /v1/models` against the OpenAI API with that key before persisting anything.
- MUST throw a `GraphQLError` with `extensions.code = "AI_KEY_INVALID"` (reusing the shared constants pattern from task_04) when validation fails, and MUST NOT persist the key in that case.
- MUST encrypt the key via the `UserSettingEntity.openaiApiKeyEncrypted` transformer (task_03) on successful validation and save it.
- MUST add `removeOpenAiKey: UserSetting` as a new mutation that sets `openaiApiKeyEncrypted` to `null`.
- MUST NOT modify `aiEnabled` or `trialCallsUsed` in either mutation — key state and toggle state remain fully independent per ADR-002/PRD.
- MUST NOT return the raw or encrypted key value in either mutation's response — return the updated `UserSetting` (which exposes only `hasOpenAiKey`, per task_09).
</requirements>

## Subtasks

- [x] 10.1 Implement `saveOpenAiKey` mutation with `GET /v1/models` validation
- [x] 10.2 Implement `removeOpenAiKey` mutation
- [x] 10.3 Wire both through `SettingsService` methods that encrypt-on-save and null-on-remove
- [x] 10.4 Confirm neither mutation touches `aiEnabled` or `trialCallsUsed`
- [x] 10.5 Write tests confirming the raw key never appears in any mutation response

## Implementation Details

See TechSpec "API Endpoints" and "Integration Points" sections for the exact validation call (`GET /v1/models`, no token cost) and error code. Add the two new resolver methods to `apps/api/src/domains/settings/settings.resolver.ts` and corresponding service methods to `apps/api/src/domains/settings/settings.service.ts`, following the existing `updateSettings` guard/DI pattern.

### Relevant Files

- `apps/api/src/domains/settings/settings.resolver.ts` — add the two new mutations
- `apps/api/src/domains/settings/settings.service.ts` — add `saveOpenAiKey`/`removeOpenAiKey` methods
- `apps/api/src/lib/ai/ai-access.service.ts` (task_04) — source of the shared GraphQL error-code constants, extended here with `AI_KEY_INVALID`
- `apps/api/src/database/entities/user-setting.entity.ts` — the field being written (transformer from task_03 handles encryption automatically on save)

### Dependent Files

- `apps/web/src/graphql/settings.graphql` — task_11 adds operation definitions for these two mutations

### Related ADRs

- [ADR-002: Server-Side Encrypted Storage of Per-User OpenAI Key](../adrs/adr-002.md) — key and toggle independence, encryption on save

## Deliverables

- `saveOpenAiKey` and `removeOpenAiKey` mutations implemented
- `AI_KEY_INVALID` error code added to the shared constants
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for both mutations **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] `saveOpenAiKey` with a key that fails `GET /v1/models` throws `AI_KEY_INVALID` and does not call the repository save
  - [ ] `saveOpenAiKey` with a valid key persists the encrypted value and returns `hasOpenAiKey: true`
  - [ ] `removeOpenAiKey` clears the stored key and returns `hasOpenAiKey: false`
  - [ ] Neither mutation modifies `aiEnabled` or `trialCallsUsed` for the acting user
- Integration tests:
  - [ ] GraphQL `saveOpenAiKey` mutation end-to-end with a mocked OpenAI validation success updates `hasOpenAiKey` in a subsequent `settings` query
  - [ ] GraphQL `saveOpenAiKey` mutation end-to-end with a mocked OpenAI validation failure returns the `AI_KEY_INVALID` error and leaves `hasOpenAiKey` unchanged
  - [ ] GraphQL `removeOpenAiKey` mutation end-to-end sets `hasOpenAiKey: false`
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- No test or code path ever logs or returns the raw OpenAI key
- `saveOpenAiKey` never persists an unvalidated key
