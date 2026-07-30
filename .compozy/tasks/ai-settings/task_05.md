---
status: completed
title: OpenAIClient.getClientFor(key) — per-request client construction
type: api
complexity: low
dependencies: []
---

# Task 5: OpenAIClient.getClientFor(key) — per-request client construction

## Overview

`OpenAIClient` currently builds a single `OpenAI` SDK instance at construction time from the system env var and has no way to build a client from an arbitrary (per-user) key. This task adds that capability without removing the existing system-key behavior, so it can be developed and tested independently of the gating logic in task_04.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add a method `getClientFor(apiKey: string): OpenAI` to `OpenAIClient` that constructs and returns a new `OpenAI` SDK instance for the given key.
- MUST NOT cache or persist per-user `OpenAI` instances across requests (each call builds a fresh instance — the SDK client construction itself is cheap and stateless).
- MUST NOT remove or break the existing `getClient()` method or its current callers until task_06 updates `AiBaseService` to use `getClientFor()` instead — this task is additive only.
- SHOULD keep `getClientFor()` free of any gating/business logic (no key validation, no database access) — it only constructs an SDK client from a string.
</requirements>

## Subtasks

- [x] 5.1 Add `getClientFor(apiKey: string): OpenAI` to `OpenAIClient`
- [x] 5.2 Confirm existing `getClient()` and its callers remain unaffected
- [x] 5.3 Write unit tests for the new method

## Implementation Details

See TechSpec "System Architecture" ("OpenAIClient (modified)") for the intended role of this method. This is a small, additive change to `apps/api/src/lib/ai/openai.client.ts`.

### Relevant Files

- `apps/api/src/lib/ai/openai.client.ts` — add the new method here, alongside the existing `getClient()`

### Dependent Files

- `apps/api/src/lib/ai/ai-base.service.ts` — task_06 switches from `getClient()` to `getClientFor(key)`

## Deliverables

- `getClientFor(apiKey: string)` added to `OpenAIClient`
- Unit tests with 80%+ coverage **(REQUIRED)**

## Tests

- Unit tests:
  - [x] `getClientFor("valid-looking-key")` returns an `OpenAI` instance configured with that key
  - [x] Calling `getClientFor()` twice with different keys returns two independently configured instances (no shared state/caching)
  - [x] Existing `getClient()` behavior (system key, throws `BadRequestException` if `OPENAI_API_KEY` unset) is unchanged
- Test coverage target: >=80% — ✅ achieved
- All tests must pass — ✅ 9/9 tests passing

## Success Criteria

- All tests passing
- Test coverage >=80%
- No regression in existing `OpenAIClient.getClient()` tests
