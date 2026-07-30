---
status: completed
title: Add SETTINGS_ENCRYPTION_KEY and TRIAL_AI_CALL_LIMIT env vars
type: api
complexity: low
dependencies: []
---

# Task 1: Add SETTINGS_ENCRYPTION_KEY and TRIAL_AI_CALL_LIMIT env vars

## Overview

Introduce the two new server-side configuration values this feature depends on: the AES-256-GCM master key used to encrypt/decrypt stored OpenAI keys, and the trial call limit before a personal key is required. Every other backend task in this feature reads one or both of these.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add `SETTINGS_ENCRYPTION_KEY` to the zod schema in `apps/api/src/env/server.ts` as a required string, following the same validation style as existing required secrets.
- MUST add `TRIAL_AI_CALL_LIMIT` to the same schema as a number with a default of `50`, following the `z.coerce.number()` pattern used for other numeric env vars in this file.
- MUST fail fast at application boot (existing zod `.parse()`/`.safeParse()` behavior in this file) if `SETTINGS_ENCRYPTION_KEY` is missing, not at first key-save attempt.
- MUST document both variables in `apps/api/.env.example` (or equivalent example env file) with a short comment on purpose and expected format (32-byte key for `SETTINGS_ENCRYPTION_KEY`).
- MUST add both variables to the CI "Write API .env for CI" step so CI does not fail once dependent tasks read them.
</requirements>

## Subtasks

- [ ] 1.1 Add `SETTINGS_ENCRYPTION_KEY` (required string) to the `apiEnv` zod schema
- [ ] 1.2 Add `TRIAL_AI_CALL_LIMIT` (number, default 50) to the `apiEnv` zod schema
- [ ] 1.3 Update `.env.example` with both variables and a short usage comment
- [ ] 1.4 Update the CI "Write API .env for CI" step in `.github/workflows/ci.yml` (both the main job and the e2e job) with dummy/test values for both variables
- [ ] 1.5 Add/extend a unit test asserting `apiEnv` parsing fails when `SETTINGS_ENCRYPTION_KEY` is absent and succeeds with a valid value

## Implementation Details

Follow the existing pattern in `apps/api/src/env/server.ts` (e.g. how `AUTH_BYPASS_ENABLED` and `OPENAI_API_KEY`/`OPENAI_MODEL` are declared) for consistency — no new validation library or config mechanism. See TechSpec "Data Models" section for the exact variable names and defaults.

### Relevant Files

- `apps/api/src/env/server.ts` — zod schema for all server env vars; both new variables are added here
- `.github/workflows/ci.yml` — has a "Write API .env for CI" step (main job ~line 68-80, e2e job ~line 125-138) that must include the new vars or the API fails to boot in CI

### Dependent Files

- `apps/api/.env.example` — must document the new variables for local setup

### Related ADRs

- [ADR-002: Server-Side Encrypted Storage of Per-User OpenAI Key](../adrs/adr-002.md) — defines `SETTINGS_ENCRYPTION_KEY` as the application-level master key approach

## Deliverables

- `SETTINGS_ENCRYPTION_KEY` and `TRIAL_AI_CALL_LIMIT` added to `apiEnv` schema
- `.env.example` updated
- CI workflow updated with both new vars in both jobs that write `.env`
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for env parsing failure/success **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] `apiEnv` parsing throws/fails when `SETTINGS_ENCRYPTION_KEY` is unset
  - [ ] `apiEnv` parsing succeeds and exposes `SETTINGS_ENCRYPTION_KEY` as a string when set
  - [ ] `apiEnv.TRIAL_AI_CALL_LIMIT` defaults to `50` when unset
  - [ ] `apiEnv.TRIAL_AI_CALL_LIMIT` reflects an overridden value when set
- Integration tests:
  - [ ] Application boot fails with a clear error when `SETTINGS_ENCRYPTION_KEY` is missing (matches existing boot-time validation behavior for other required env vars)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- CI pipeline still passes with the new required env var present
- No other task is blocked by a missing env var declaration
