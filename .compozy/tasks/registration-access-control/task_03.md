---
status: completed
title: Gate first-login status via PostHog `auto-accept-register-enabled`
type: api
complexity: medium
dependencies: [task_02]
---

# Gate first-login status via PostHog `auto-accept-register-enabled`

## Overview

When a brand-new Google login occurs, decide whether the new `UserEntity` starts as `active` or `pending` based on the system-wide PostHog flag `auto-accept-register-enabled` and whether the email was already approved in a prior request.

<critical>
- Read `.compozy/tasks/registration-access-control/_prd.md` and `_techspec.md` before starting.
- Follow the TechSpec "API Design" section for the exact PostHog call shape (`isFeatureEnabled("auto-accept-register-enabled", "system")`).
- Focus on WHAT determines the initial status, not on the OAuth redirect behavior — that is task_04.
- Minimize code: this is a small addition to existing user-creation logic, not a new service.
- Tests are required: cover both flag states and both prior-approval states.
</critical>

<requirements>
1. `UsersService.upsertFromProvider` MUST only apply this gating logic when creating a brand-new user (existing users' `status` MUST NOT be touched by this logic).
2. The flag check MUST call `PostHogService.isFeatureEnabled("auto-accept-register-enabled", "system")` — a fixed, non-per-user distinct ID, since the flag is a global switch, not per-user targeting.
3. When the flag evaluates `true`, a new user MUST be created with `status = "active"`.
4. When the flag evaluates `false`, a new user MUST be created with `status = "active"` if a `UserEntity` with that email already exists with `status = "active"` from a prior approval cycle (re-registration after being previously approved is out of scope for this task's primary case but must not regress `status = "active"` accounts); otherwise MUST be created with `status = "pending"`.
5. `PostHogService` MUST be injected into `UsersService` following the existing `@Global()` `FeatureFlagsModule` provider pattern — no new module wiring required beyond constructor injection.
</requirements>

## Subtasks

- [x] Inject `PostHogService` into `UsersService`.
- [x] In `upsertFromProvider`'s new-user branch, call `isFeatureEnabled("auto-accept-register-enabled", "system")` (extracted into a private `resolveNewUserStatus` helper).
- [x] Set `status: Active` when the flag is `true`; `status: Pending` when `false` (for genuinely new emails).
- [x] Confirm existing-user lookups by email remain untouched by this logic (only the create branch changes) — verified by a dedicated test asserting `isFeatureEnabled` is not called on the existing-link path.
- [x] Update/add unit tests covering flag on/off, plus the prior-approval-by-email case.

## Implementation Details

Locate the new-user creation branch inside `UsersService.upsertFromProvider` (see task_02's touched file `users.service.ts`) and set `status` there based on the flag result, instead of the current implicit default. See TechSpec "System Architecture" diagram for the decision flow.

### Relevant Files

- `apps/api/src/domains/users/users.service.ts` — `upsertFromProvider`, new-user creation branch to modify (same file as task_02, but a distinct method/subtask).
- `apps/api/src/domains/feature-flags/posthog.service.ts:20` — `isFeatureEnabled(flagKey, distinctId)` method to call.
- `apps/api/src/domains/feature-flags/feature-flags.module.ts:6-8` — confirms `PostHogService` is globally provided, no explicit module import needed in `users.module.ts`.

### Dependent Files

- `apps/api/src/domains/users/users.service.spec.ts` — needs new test cases and a `PostHogService` mock added to the constructor setup.

### Related ADRs

- [ADR-001](adrs/adr-001.md) — establishes that gating happens at user-creation time via `status`, not via a separate request record.

## Deliverables

- `UsersService.upsertFromProvider` sets `status` on new users based on the PostHog flag.
- `PostHogService` injected and mocked appropriately in tests.
- Test coverage >=80% on the modified method.

## Tests

**Unit tests:**

- [x] New user created when flag is `true` → `status = Active`.
- [x] New user created when flag is `false` and email has no prior `Active` record → `status = Pending`.
- [x] New user created when flag is `false` but the email already has an `Active` record → `status = Active`.
- [x] Existing user (already in DB) logging in again does not have its `status` overwritten, regardless of flag value (and `isFeatureEnabled` is not even called on that path).
- [x] `isFeatureEnabled` is called with exactly `("auto-accept-register-enabled", "system")`.

## Success Criteria

- All tests passing.
- Test coverage >=80%.
- New-user status correctly reflects flag state in both directions, verified by unit tests.
