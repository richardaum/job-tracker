---
status: completed
title: AiAccessService — gating and atomic trial quota resolution
type: api
complexity: high
dependencies:
  - task_02
  - task_03
---

# Task 4: AiAccessService — gating and atomic trial quota resolution

## Overview

Implement the single service that decides, for any AI call, whether it's allowed and which OpenAI key to use — the toggle check, personal-key lookup, and trial-quota consumption all live here. This is the core business logic of the feature: getting the concurrency handling right (no double-spending trial calls under concurrent requests) matters more than the amount of code involved.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST expose a single method, `resolveClientKey(userId: string): Promise<string>`, returning the OpenAI key to use for this call.
- MUST throw a `GraphQLError` with `extensions.code = "AI_DISABLED_BY_USER"` when `UserSettingEntity.aiEnabled` is `false`, before checking key/quota.
- MUST return the decrypted personal key (via the transformer from task_03) when `openaiApiKeyEncrypted` is set, without touching `trial_calls_used`.
- MUST, when no personal key is set, attempt to consume trial quota via a single atomic conditional `UPDATE ... SET trial_calls_used = trial_calls_used + 1 WHERE user_id = :userId AND trial_calls_used < :limit`, using `apiEnv.TRIAL_AI_CALL_LIMIT` (from task_01) as the limit — this MUST be one SQL statement, not a separate read-then-write, to avoid a race between concurrent requests from the same user.
- MUST throw a `GraphQLError` with `extensions.code = "AI_KEY_REQUIRED"` when the atomic update affects zero rows (quota exhausted), and return `apiEnv.OPENAI_API_KEY` (the system key) when it affects one row.
- MUST NOT decrement `trial_calls_used` if a downstream OpenAI call later fails — quota is consumed on attempt, per the accepted TechSpec decision (see "Known Risks"/"Key Decisions").
- SHOULD define the `AI_DISABLED_BY_USER` / `AI_KEY_REQUIRED` extension codes as shared constants reusable by task_10 (which adds `AI_KEY_INVALID`).
</requirements>

## Subtasks

- [ ] 4.1 Implement `AiAccessService.resolveClientKey()` with the toggle check
- [ ] 4.2 Implement personal-key path (decrypt and return, no quota mutation)
- [ ] 4.3 Implement the atomic conditional trial-quota increment and system-key fallback
- [ ] 4.4 Define shared GraphQL error extension code constants
- [ ] 4.5 Write concurrency-focused unit/integration tests proving no over-consumption under parallel calls

## Implementation Details

See TechSpec "Core Interfaces" section for the exact `resolveClientKey()` implementation using `createQueryBuilder().update()...where()`, and "Key Decisions" for why the increment happens before the OpenAI call with no refund on downstream failure. Register `AiAccessService` in the relevant NestJS module (wherever `AiBaseService`/`OpenAIClient` are currently provided).

### Relevant Files

- `apps/api/src/lib/ai/ai-base.service.ts` — the consumer this service will be wired into (task_06, not this task)
- `apps/api/src/database/entities/user-setting.entity.ts` — the entity queried and updated
- `apps/api/src/env/server.ts` — source of `TRIAL_AI_CALL_LIMIT` and `OPENAI_API_KEY`

### Dependent Files

- `apps/api/src/lib/ai/ai-base.service.ts` — task_06 calls `AiAccessService.resolveClientKey()` from here
- `apps/api/src/domains/settings/settings.resolver.ts` — task_10 reuses the encryption path this task establishes when implementing `saveOpenAiKey`

### Related ADRs

- [ADR-002: Server-Side Encrypted Storage of Per-User OpenAI Key](../adrs/adr-002.md) — key resolution/decryption behavior
- [ADR-003: Centralized AI Gating in AiBaseService.callAi()](../adrs/adr-003.md) — why this logic is a single service consumed from one choke point rather than per-resolver guards

## Deliverables

- New `AiAccessService` in `apps/api/src/lib/ai/`
- Shared error code constants
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for concurrent quota consumption **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] `aiEnabled = false` throws `AI_DISABLED_BY_USER` regardless of key/quota state
  - [ ] Personal key present returns the decrypted key and does not modify `trial_calls_used`
  - [ ] No personal key, quota remaining: increments `trial_calls_used` by 1 and returns the system key
  - [ ] No personal key, quota exhausted (`trial_calls_used >= limit`): throws `AI_KEY_REQUIRED`, does not increment further
- Integration tests:
  - [ ] 60 concurrent `resolveClientKey()` calls for the same user with `TRIAL_AI_CALL_LIMIT = 50` and no personal key result in exactly 50 successes and 10 `AI_KEY_REQUIRED` failures, with `trial_calls_used` ending at exactly 50 (no over-count)
  - [ ] A failed downstream OpenAI call (simulated) does not decrement `trial_calls_used`
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- The concurrency test demonstrates zero over-consumption of trial quota under parallel load
- No plaintext key or master key appears in any log output during tests
