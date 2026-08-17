---
status: completed
title: Add `RegistrationsResolver` with approve/reject mutations
type: api
complexity: medium
dependencies: [task_02]
---

# Add `RegistrationsResolver` with approve/reject mutations

## Overview

Give admins a GraphQL API to list users by registration status and to approve or reject a pending registration, enforcing that only `pending` accounts can transition.

<critical>
- Read `.compozy/tasks/registration-access-control/_prd.md` and `_techspec.md` before starting.
- Follow the TechSpec "API Design" section for the resolver/guard shape.
- Focus on WHAT the resolver exposes, not on the admin UI consuming it — that is task_07.
- Minimize code: reuse `UserEntity`/`UserType` directly, no new table or DTO beyond what's listed.
- Tests are required: cover valid transitions, invalid transitions, and guard enforcement.
</critical>

<requirements>
1. `UserType` (GraphQL) MUST expose a `status` field.
2. A `registrations(status: UserStatus)` query MUST return users, optionally filtered by `status`; when `status` is omitted, MUST return all users regardless of status.
3. `approveRegistration(userId: ID!)` mutation MUST set `status` from `pending` to `active` and return the updated user.
4. `rejectRegistration(userId: ID!)` mutation MUST set `status` from `pending` to `rejected` and return the updated user.
5. Both mutations MUST throw `BadRequestException` (not silently no-op) if the target user's current `status` is not `pending`.
6. Both the query and both mutations MUST be guarded with `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(RoleEnum.Admin)`, matching the existing `AuthResolver.users` pattern — `FeatureFlagGuard` MUST NOT be applied here, since the flag only governs the anonymous first-login path.
</requirements>

## Subtasks

- [x] Add `status: UserStatusEnum` field to `UserType` (registered `UserStatusEnum` as a GraphQL enum named `UserStatus`).
- [x] Add `listRegistrations(status?)`, `approveRegistration(userId)` and `rejectRegistration(userId)` methods to `UsersService`, the latter two validating `status === Pending` before transitioning (via a shared private `transitionRegistration` helper).
- [x] Create `RegistrationsResolver` with the `registrations` query and the two mutations, guarded per requirement 6.
- [x] Register the resolver — **deviation**: registered in `auth.module.ts`'s providers instead of `users.module.ts`, because `AuthModule` already imports `UsersModule` to get `JwtAuthGuard`/`RolesGuard`; importing `AuthModule` back into `UsersModule` (as `users.module.ts` would require) creates a circular module dependency. This matches AGENTS.md's own rule ("Resolvers with `@UseGuards(JwtAuthGuard, RolesGuard)` must import AuthModule") and mirrors exactly how `AuthResolver` (same guard requirement) is already wired. The resolver's source file still lives in `apps/api/src/domains/users/` per the task's file-placement guidance.
- [x] Regenerate `schema.gql` via `pnpm --filter @job-tracker/api run schema:generate` — confirmed it picks up `status`, the `UserStatus` enum, `registrations` query, and both mutations.
- [x] Add unit tests for the service methods and resolver.

## Implementation Details

Follow the existing `AuthResolver.users` admin-guard pattern (`@UseGuards(JwtAuthGuard, RolesGuard) @Roles(RoleEnum.Admin)`) for both the query and mutations. Place the new resolver in `apps/api/src/domains/users/` alongside `users.service.ts`, since it operates entirely on `UserEntity` with no new domain concept. See TechSpec "Core Interfaces" and "API Design" for signatures.

### Relevant Files

- `apps/api/src/domains/users/user.type.ts:6-25` — `UserType` ObjectType, needs a `status` field added.
- `apps/api/src/domains/auth/auth.resolver.ts:16-21` — `AuthResolver.users` query, the guard/role pattern to mirror.
- `apps/api/src/domains/users/users.service.ts` — add `approveRegistration`/`rejectRegistration` methods here (same file touched by task_02/task_03, distinct methods).
- `apps/api/src/domains/users/users.module.ts` — register the new resolver as a provider.
- `apps/api/src/app.module.ts:55` — confirms `schema.gql` auto-generation on module load; no manual edit needed.

### Dependent Files

- `apps/api/src/schema.gql` — auto-regenerated, do not hand-edit; verify it reflects the new query/mutations/field after running the app.
- `apps/api/src/domains/users/users.service.spec.ts` — add test cases for the two new service methods.

### Related ADRs

- [ADR-001](adrs/adr-001.md) — confirms no separate `registration_request` table; this resolver reads/writes `UserEntity.status` directly.

## Deliverables

- `RegistrationsResolver` with `registrations` query and `approveRegistration`/`rejectRegistration` mutations, admin-guarded.
- `UserType.status` field exposed.
- `schema.gql` reflects the new query/mutations after regeneration.
- Test coverage >=80% on new resolver and service methods.

## Tests

**Unit tests:**

- [x] `approveRegistration` on a `Pending` user sets `status = Active` and returns the user.
- [x] `approveRegistration` on a non-`Pending` user (or missing user) throws `BadRequestException`.
- [x] `rejectRegistration` on a `Pending` user sets `status = Rejected` and returns the user.
- [x] `rejectRegistration` on a non-`Pending` user throws `BadRequestException`.
- [x] `listRegistrations(Pending)` returns only pending users; `listRegistrations()` with no argument returns all users.

**Integration tests:**

- [x] A non-admin caller receives a forbidden/error response from `approveRegistration` and `registrations` (`registrations.resolver.spec.ts`, GraphQL e2e via supertest with real `RolesGuard`/`RoleService`).

## Success Criteria

- All tests passing.
- Test coverage >=80%.
- Non-admin requests to all three operations are rejected by the guard.
- Invalid status transitions are rejected with a clear error, not a silent no-op.
