---
status: completed
title: Wire `UserEntity.status` through all existing `active` consumers
type: api
complexity: high
dependencies: [task_01]
---

# Wire `UserEntity.status` through all existing `active` consumers

## Overview

Replace `UserEntity.active: boolean` with the new `status` enum in application code, and update every existing reader/writer of `active` so login gating and account deactivation keep working exactly as before, just on the new field.

<critical>
- Read `.compozy/tasks/registration-access-control/_prd.md` and `_techspec.md` before starting.
- Follow the TechSpec "Core Interfaces" section for the `UserStatus` enum and `UserEntity.status` shape.
- Focus on WHAT must be migrated (every `active` read/write), not on adding new behavior — status transitions for registration (pending/rejected) are handled in later tasks.
- Minimize code: this is a like-for-like field swap, not a redesign of the auth flow.
- Tests are required: existing tests covering `active` behavior must be updated and continue to pass.
</critical>

<requirements>
1. `UserEntity` MUST expose `status: UserStatusEnum` (`Pending | Active | Rejected | Deactivated` — PascalCase, per oxlint's `enum-pascalcase` rule, matching `RoleEnum`'s convention) instead of `active: boolean`.
2. `UsersRepository.setActive(id, active)` MUST become `setStatus(id, status)`, updating the `status` column.
3. `UsersService.validateActiveUser` MUST reject (401, matching current behavior) when `status !== "active"`, replacing the `!user.active` check.
4. `UsersService.deactivateUser` MUST set `status = "deactivated"` instead of `active = false`.
5. ~~`google.strategy.ts`'s `validate()` MUST reject login when `status !== "active"`, replacing `!user.active`.~~ **Superseded during task_04**: rejecting on any non-active status here blocks `Pending`/`Rejected` users before they ever reach the OAuth callback, which conflicts with task_04/ADR-002's requirement that the *callback* — not the strategy — decides how to respond to `Pending`/`Rejected`. Corrected to: `validate()` rejects only when `status === Deactivated`; `Pending`, `Rejected`, and `Active` all pass through to the controller.
6. `auth.controller.ts`'s `refresh()` handler MUST check `status === "active"` at both call sites (currently `!freshUser?.active` and `!rotatedUser?.active`), replacing the boolean check.
7. No behavioral change for already-active or already-deactivated accounts: an `active` account before this change MUST remain `status: "active"` after migration (task_01 backfill), and login/refresh/deactivation behavior MUST be unchanged for these two states.
8. `RolesGuard` MUST NOT be modified — confirmed it does not check `active` today (role-only), so it is out of scope for this task.
</requirements>

## Subtasks

- [x] Add `UserStatusEnum` enum (`apps/api/src/domains/users/user-status.enum.ts`) and change `UserEntity.status` column definition (drop `active`).
- [x] Update `UsersRepository.setActive` → `setStatus`.
- [x] Update `UsersService.validateActiveUser` and `deactivateUser` to use `status`.
- [x] Update `google.strategy.ts` `validate()` to check `status` (later refined in task_04 to only block `Deactivated` — see superseded requirement 5 above).
- [x] Update `auth.controller.ts` `refresh()` handler's two `active` checks to check `status`.
- [x] Update all fixtures referencing `active` (`users.service.spec.ts`, `active-user-cache.service.spec.ts`, `auth.resolver.spec.ts`, `auth.service.spec.ts`, `auth.controller.spec.ts`, `auth-user-access.service.spec.ts`) to `status: UserStatusEnum.Active`; added `google.strategy.spec.ts` (did not previously exist).

## Implementation Details

This is a mechanical rename-and-retype across the files listed below — same control flow, new field. See TechSpec "Core Interfaces" for the `UserStatus` enum definition to add to `user.entity.ts`.

### Relevant Files

- `apps/api/src/database/entities/user.entity.ts:26-27` — `active` column definition to replace with `status`.
- `apps/api/src/domains/auth/google.strategy.ts:26-28` — `validate()` throws `UnauthorizedException` on `!user.active`.
- `apps/api/src/domains/users/users.service.ts:98-122` — `validateActiveUser` checks `!user.active` at line 109.
- `apps/api/src/domains/users/users.service.ts:92-96` — `deactivateUser` calls `userRepository.setActive(id, false)`.
- `apps/api/src/domains/users/users.repository.ts:81-83` — `setActive(id, active)` to rename to `setStatus`.
- `apps/api/src/domains/auth/auth.controller.ts:103,121` — `refresh()` handler's two `!user?.active` checks.
- `apps/api/src/domains/users/users.service.spec.ts:19` — `mockUser` fixture with `active: true`.

### Dependent Files

- `apps/api/src/domains/auth/auth-user-access.service.ts` — delegates to `validateActiveUser`; no direct change expected but covered by the same test suite.
- Any test file constructing a `UserEntity`/`User` fixture with `active` (search for `active:` in `apps/api/src/domains/**/*.spec.ts`).

### Related ADRs

- [ADR-001](adrs/adr-001.md) — the decision this task implements: a single `status` enum replaces `active` everywhere.

## Deliverables

- `UserEntity`, `UsersRepository`, `UsersService`, `google.strategy.ts`, and `auth.controller.ts` all reference `status` instead of `active`.
- No remaining reference to `UserEntity.active` in `apps/api/src` (verify via search).
- All existing tests updated and passing.
- Test coverage >=80% maintained on modified files.

## Tests

**Unit tests:**

- [x] `validateActiveUser` rejects with 401 when `status = Pending`.
- [x] `validateActiveUser` rejects with 401 when `status = Rejected`.
- [x] `validateActiveUser` rejects with 401 when `status = Deactivated`.
- [x] `validateActiveUser` succeeds when `status = Active` and token version matches.
- [x] `deactivateUser` sets `status` to `Deactivated` and increments token version.
- [x] `google.strategy.ts` `validate()` throws `UnauthorizedException` when `status = Deactivated` (new `google.strategy.spec.ts`; refined in task_04 — see above).

**Integration tests:**

- [x] `refresh()` endpoint returns 401 when the current user's `status !== Active`, for both checked call sites (`auth.controller.spec.ts`).

## Success Criteria

- No remaining code reference to `UserEntity.active`.
- All tests passing.
- Test coverage >=80%.
- Manual verification: an account backfilled to `status: "active"` by task_01's migration logs in and refreshes tokens exactly as before this change.
