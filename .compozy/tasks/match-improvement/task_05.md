---
id: T-05
status: completed
title: Final cleanup and verification
type: frontend
complexity: low
depends_on: [T-04]
---

# Task 05: Final cleanup and verification

## Overview

Run the full validation pipeline to ensure all changes are correct, no regressions introduced, and no dead code remains. This is the final quality gate before marking the feature complete.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST run `pnpm fix:imports` — sort imports
- MUST run `pnpm lint` — zero warnings
- MUST run `pnpm format` — Prettier
- MUST run `pnpm typecheck` — zero errors
- MUST run `pnpm test` — all tests passing
- MUST run `pnpm knip` — no new dead code
- MUST verify the `match-analyses/list/` directory is empty or safe to remove
- SHOULD manually verify the redirect works: navigate to `/matches/any-id` → `/jobs/any-id/match`
- SHOULD manually verify sidebar no longer has Matches link
</requirements>

## Subtasks

- [ ] 5.1 Run `pnpm fix:imports`
- [ ] 5.2 Run `pnpm lint` and fix any warnings
- [ ] 5.3 Run `pnpm format`
- [ ] 5.4 Run `pnpm typecheck` and fix any errors
- [ ] 5.5 Run `pnpm test` and fix any failures
- [ ] 5.6 Run `pnpm knip` and address any dead code
- [ ] 5.7 Remove empty `match-analyses/list/` directory if all contents deleted in task_04

## Implementation Details

All prior tasks (01-04) should have already run these checks. This task is the final gate — any failures here indicate an issue in a prior task that must be addressed.

### Relevant Files

- All files modified in tasks 01-04
- `apps/web/src/modules/match-analyses/list/` — directory may be empty after task_04 deletions

### Related ADRs

All ADRs apply — this task ensures the full implementation matches the documented decisions.

## Deliverables

- All validation commands pass with zero errors **(REQUIRED)**

## Tests

### Verification (no new tests — validate existing)

- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm lint` — zero warnings
- [ ] `pnpm test` — all passing
- [ ] `pnpm knip` — no new dead code

## Success Criteria

- Zero typecheck errors
- Zero lint warnings
- All tests passing
- No dead code detected
- `match-analyses/list/` directory cleaned up if empty
