---
status: completed
title: Thread userId into 5 AI services (chat, notes, match, draft-extraction, summary)
type: api
complexity: medium
dependencies:
  - task_06
---

# Task 7: Thread userId into 5 AI services (chat, notes, match, draft-extraction, summary)

## Overview

`AiBaseService.callAi()` now requires `userId` (task_06), which means every subclass's calls to `this.callAi(...)` no longer compile until updated. This task updates the first 5 of the 9 AI-consuming services to pass the authenticated user's ID through from their existing resolver/caller context — no new logic, just threading an already-available value.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST update each of the 5 services below so every `this.callAi(...)` call includes `userId`, sourced from the authenticated user already available to the resolver/service call chain (the same user context used elsewhere in each flow, e.g. ownership checks).
- MUST NOT introduce a new way of obtaining the user ID (e.g. reading from a global/singleton) — thread it as a parameter from the existing call chain, consistent with how these services already receive user-scoped data (e.g. job ID, resume ID).
- MUST NOT change any other behavior of these 5 services (prompts, response schemas, business logic) beyond the `userId` threading.
- Services in scope:
  1. `apps/api/src/domains/ai-chat/ai-chat-generation.service.ts`
  2. `apps/api/src/domains/notes/ai/note-generation.service.ts`
  3. `apps/api/src/domains/match-analysis/match-analysis-ai.service.ts`
  4. `apps/api/src/domains/jobs/ai/draft-extraction.service.ts`
  5. `apps/api/src/domains/jobs/summary/summary-ai.service.ts`
</requirements>

## Subtasks

- [x] 7.1 Thread `userId` through `ai-chat-generation.service.ts` and its resolver (`ai-chat.resolver.ts`)
- [x] 7.2 Thread `userId` through `note-generation.service.ts` and its resolver (`notes.resolver.ts`)
- [x] 7.3 Thread `userId` through `match-analysis-ai.service.ts` and its resolver (`match-analysis.resolver.ts`)
- [x] 7.4 Thread `userId` through `draft-extraction.service.ts`, including its auto-fill caller path
- [x] 7.5 Thread `userId` through `summary-ai.service.ts`, including the `autoSummaryEnabled` auto-trigger listener path
- [x] 7.6 Update each service's existing unit tests for the new `callAi()` call signature

## Implementation Details

This task is mechanical threading, not new logic — see TechSpec "Impact Analysis" table row for the 9 AI services. For each service, locate the resolver method that already has the authenticated user (via the existing `@CurrentUser()`-style pattern used by `settings.resolver.ts`) and pass `user.id` down to the service's `callAi()` invocation. For `summary-ai.service.ts`, also check the auto-trigger path (`summary-event.listener.ts`, which checks `autoSummaryEnabled`) to confirm it has access to the owning user's ID.

### Relevant Files

- `apps/api/src/domains/ai-chat/ai-chat-generation.service.ts`, `apps/api/src/domains/ai-chat/ai-chat.resolver.ts`
- `apps/api/src/domains/notes/ai/note-generation.service.ts`, `apps/api/src/domains/notes/notes.resolver.ts`
- `apps/api/src/domains/match-analysis/match-analysis-ai.service.ts`, `apps/api/src/domains/match-analysis/match-analysis.resolver.ts`
- `apps/api/src/domains/jobs/ai/draft-extraction.service.ts`, `apps/api/src/domains/jobs/jobs.resolver.ts` (`fillJobAutomatically`)
- `apps/api/src/domains/jobs/summary/summary-ai.service.ts`

### Dependent Files

- `apps/api/src/lib/ai/ai-base.service.ts` — the `callAi()` signature these services now satisfy (task_06)

## Deliverables

- All 5 services pass `userId` into `callAi()`
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for at least one full resolver-to-service flow **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] Each of the 5 services' `callAi()` invocation includes the correct `userId` sourced from its caller (verified via mock assertion per service)
- Integration tests:
  - [ ] `askQuestion` (AI chat resolver) end-to-end with an authenticated user reaches `callAi()` with that user's ID
  - [ ] `generateSummary`/equivalent summary flow (both manual trigger and `autoSummaryEnabled`-triggered) reaches `callAi()` with the job owner's user ID
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- The API compiles with no remaining `callAi()` calls missing `userId` for these 5 services
- No behavior change for these features beyond the new gating check now running (verified by task_04/task_06 tests, not re-verified here)
