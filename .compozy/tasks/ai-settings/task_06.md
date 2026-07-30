---
status: completed
title: Wire AiAccessService and getClientFor into AiBaseService.callAi()
type: api
complexity: medium
dependencies:
  - task_04
  - task_05
---

# Task 6: Wire AiAccessService and getClientFor into AiBaseService.callAi()

## Overview

Connect the gating logic (task_04) and per-key client construction (task_05) into the single choke point every AI feature already calls through. After this task, `AiBaseService.callAi()` resolves the caller's key and enforces the toggle/quota rule before making any OpenAI request — but no individual AI feature is updated yet (that's task_07/task_08).

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add a required `userId: string` field to the `CallAiOptions` type in `apps/api/src/lib/ai/ai-base.service.ts`, without changing the existing `responseFormat`-discriminated union members otherwise.
- MUST call `AiAccessService.resolveClientKey(opts.userId)` at the start of `callAi()`, before any OpenAI request is made.
- MUST use the resolved key with `OpenAIClient.getClientFor(key)` instead of the current `OpenAIClient.getClient()` call.
- MUST leave the existing per-`responseFormat` switch logic (zod-response, json-schema, json-schema-with-web-search) unchanged apart from how the client is obtained.
- MUST let `AiAccessService`'s `GraphQLError` (from task_04) propagate unmodified — `callAi()` must not catch and rewrap it into a `BadRequestException`.
- MUST inject `AiAccessService` into `AiBaseService`'s constructor.
</requirements>

## Subtasks

- [ ] 6.1 Add `userId` to `CallAiOptions`
- [ ] 6.2 Inject `AiAccessService` into `AiBaseService`
- [ ] 6.3 Call `resolveClientKey()` and use `getClientFor()` at the top of `callAi()`
- [ ] 6.4 Verify gating errors propagate to the caller unmodified
- [ ] 6.5 Update `AiBaseService`'s existing unit tests for the new constructor dependency and call order

## Implementation Details

This is a focused change to `apps/api/src/lib/ai/ai-base.service.ts` only — do not touch the 9 subclasses yet (task_07/task_08 handle threading `userId` through their call sites). See TechSpec "Core Interfaces" for the exact `callAi()` signature change.

### Relevant Files

- `apps/api/src/lib/ai/ai-base.service.ts` — the file being modified
- `apps/api/src/lib/ai/ai-access.service.ts` — new dependency injected here (task_04)
- `apps/api/src/lib/ai/openai.client.ts` — `getClientFor()` used here (task_05)

### Dependent Files

- All 9 `AiBaseService` subclasses — will fail to compile until task_07/task_08 pass `userId` in their `callAi()` calls; this is expected and intentional (TypeScript enforces the update)

### Related ADRs

- [ADR-003: Centralized AI Gating in AiBaseService.callAi()](../adrs/adr-003.md) — this task is the concrete implementation of that decision

## Deliverables

- `CallAiOptions` and `callAi()` updated in `AiBaseService`
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for gating-before-call behavior **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] `callAi()` calls `AiAccessService.resolveClientKey()` before `OpenAIClient.getClientFor()` (verified via mock call order)
  - [ ] `callAi()` uses the key returned by `resolveClientKey()` when constructing the client
  - [ ] A `GraphQLError` thrown by `resolveClientKey()` propagates out of `callAi()` without being caught or rewrapped
- Integration tests:
  - [ ] With a mocked `AiAccessService` throwing `AI_DISABLED_BY_USER`, `callAi()` never invokes the OpenAI SDK's `chat.completions.parse`/`responses.create`
  - [ ] With a mocked `AiAccessService` returning a valid key, `callAi()`'s existing response-format branches (zod-response, json-schema) behave exactly as before this change
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- No AI request reaches OpenAI when gating denies access, verified by a mock assertion
- Existing `AiBaseService` behavior for allowed requests is unchanged (only the client construction path differs)
