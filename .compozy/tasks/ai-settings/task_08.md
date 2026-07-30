---
status: completed
title: Thread userId into 4 AI services (company description, rewrite, restructure, location)
type: api
complexity: medium
dependencies:
  - task_06
---

# Task 8: Thread userId into 4 AI services (company description, rewrite, restructure, location)

## Overview

The remaining 4 of the 9 `AiBaseService` subclasses need the same `userId` threading as task_07, split into a separate task purely to keep each task's file count manageable. This task is independent of task_07 and can be done in parallel once task_06 is complete.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST update each of the 4 services below so every `this.callAi(...)` call includes `userId`, sourced from the authenticated user already available to the resolver/service call chain.
- MUST NOT introduce a new way of obtaining the user ID — thread it as a parameter from the existing call chain, same approach as task_07.
- MUST NOT change any other behavior of these 4 services beyond the `userId` threading.
- Services in scope:
  1. `apps/api/src/domains/companies/ai/company-description.service.ts`
  2. `apps/api/src/lib/ai/rewrite-text.service.ts`
  3. `apps/api/src/lib/ai/restructure-jd.service.ts`
  4. `apps/api/src/lib/ai/location-inference.service.ts`
</requirements>

## Subtasks

- [x] 8.1 Thread `userId` through `company-description.service.ts` (called from `jobs.resolver.ts` `generateCompanyDescription`)
- [x] 8.2 Thread `userId` through `rewrite-text.service.ts` and its resolver
- [x] 8.3 Thread `userId` through `restructure-jd.service.ts` and its resolver
- [x] 8.4 Thread `userId` through `location-inference.service.ts` (called from `jobs.resolver.ts`)
- [x] 8.5 Update each service's existing unit tests for the new `callAi()` call signature

## Implementation Details

Same mechanical threading approach as task_07 — see TechSpec "Impact Analysis" table. Locate each resolver's authenticated-user access pattern and pass `user.id` into the service's `callAi()` call.

### Relevant Files

- `apps/api/src/domains/companies/ai/company-description.service.ts`
- `apps/api/src/lib/ai/rewrite-text.service.ts`
- `apps/api/src/lib/ai/restructure-jd.service.ts`
- `apps/api/src/lib/ai/location-inference.service.ts`
- `apps/api/src/domains/jobs/jobs.resolver.ts` — caller for `company-description` and `location-inference`

### Dependent Files

- `apps/api/src/lib/ai/ai-base.service.ts` — the `callAi()` signature these services now satisfy (task_06)

## Deliverables

- All 4 services pass `userId` into `callAi()`
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for at least one full resolver-to-service flow **(REQUIRED)**

## Tests

- Unit tests:
  - [x] Each of the 4 services' `callAi()` invocation includes the correct `userId` sourced from its caller (verified via mock assertion per service)
- Integration tests:
  - [x] `generateCompanyDescription` end-to-end with an authenticated user reaches `callAi()` with that user's ID
  - [x] Location inference flow reaches `callAi()` with the correct user's ID
- Test coverage target: >=80% ✓ (556 tests passing)
- All tests must pass ✓

## Success Criteria

- All tests passing
- Test coverage >=80%
- The API compiles with no remaining `callAi()` calls missing `userId` across all 9 services (this task plus task_07 complete the full set)
- No behavior change for these features beyond the new gating check now running
