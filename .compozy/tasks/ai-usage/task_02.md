---
status: completed
title: Instrument all OpenAI request paths
type: api
complexity: high
dependencies:
  - task_01
---

# Instrument all OpenAI request paths

## Overview

Record exact provider usage for every successful AI request initiated by Job Tracker, preserving the access source that funded the request. This extends the common AI service and the direct AI chat paths without changing existing user-visible generation behavior.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON WHAT — preserve existing AI access and trial behavior
- MINIMIZE CODE — instrument shared boundaries first
- TESTS REQUIRED — every deliverable needs coverage
</critical>

<requirements>
1. MUST distinguish PersonalKey from Trial at access resolution time.
2. MUST record exact input, output, and total tokens only after successful provider calls.
3. MUST cover Chat Completions, Responses, chat title generation, and streamed chat answers.
4. MUST preserve the atomic trial-call counter and existing GraphQL errors.
5. MUST not fail an otherwise successful AI operation solely because usage accounting cannot persist.
</requirements>

## Subtasks

- [x] Extend access resolution with an internal source-aware contract.
- [x] Record non-streaming Chat Completions and Responses usage.
- [x] Record title-generation usage.
- [x] Capture final streamed-chat usage.
- [x] Cover successful, missing-usage, source, and persistence-failure behavior.

## Implementation Details

See TechSpec “Integration Points.” Use the usage service from task 01; keep provider response parsing at the existing call boundaries.

### Relevant Files

- `apps/api/src/lib/ai/ai-access.service.ts` — source and key resolution.
- `apps/api/src/lib/ai/ai-base.service.ts` — shared non-chat AI calls.
- `apps/api/src/domains/ai-chat/ai-chat-generation.service.ts` — direct title and stream calls.

### Dependent Files

- `apps/api/src/domains/ai-usage/ai-usage.service.ts` — persistence introduced in task 01.

### Related ADRs

- [ADR-002: Record Job Tracker token usage at the AI boundary](adrs/adr-002.md)

## Deliverables

- Source-aware access contract and all requested call-path instrumentation.
- Unit and integration tests for each provider response shape.

## Tests

- Unit tests: a personal key writes a `PersonalKey` usage record.
- Unit tests: a trial call writes a `Trial` record while retaining quota behavior.
- Unit tests: successful Chat Completions and Responses persist exact usage.
- Unit tests: final stream usage persists one record and missing usage creates none.
- Integration tests: existing AI access tests remain green.
- Test coverage target: >=80%.

## Success Criteria

- Every supported successful Job Tracker OpenAI request records one source-specific usage record.
- Existing AI access behavior and tests remain intact.
