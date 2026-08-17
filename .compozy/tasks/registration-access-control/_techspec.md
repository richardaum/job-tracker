# TechSpec: Registration Access Control

## Executive Summary

Replace `UserEntity.active: boolean` with a `status` enum (`pending | active | rejected | deactivated`) that unifies the existing manual-deactivation mechanism with a new registration gate. On first Google login, a `UsersService`-level check against the PostHog flag `auto-accept-register-enabled` (queried with a fixed system-wide distinct ID, not per-user) decides whether the new account starts `active` or `pending`. The OAuth callback redirects non-`active` outcomes to the frontend via a query parameter rather than issuing a session, so unauthenticated `pending`/`rejected` screens can render without a token. Admins manage pending accounts through a new "Registrations" admin tab backed by two explicit mutations (`approveRegistration`, `rejectRegistration`), reusing `UserEntity` directly — no new table.

**Primary trade-off:** unifying `active` into `status` touches every existing read/write of `active` across the API (login gate, admin user tooling, any deactivation code path) instead of being purely additive. This was chosen over a narrower, additive change because it avoids two parallel sources of truth for account admission (see [ADR-001](adrs/adr-001.md)).

## System Architecture

No new services or modules beyond the existing `domains/users` and `domains/admin`-facing resolvers. Three touch points:

1. **`domains/users`** — `UserEntity.status` enum column; `UsersService.upsertFromProvider` gains the PostHog check and decides the initial `status` for a newly created row; two new resolver mutations for admin approve/reject.
2. **`domains/auth`** — `google.strategy.ts` / the OAuth callback controller branch on `status` instead of `active`, redirecting non-`active` outcomes.
3. **`apps/web`** — an unauthenticated `pending-approval` / `rejected` route reading the callback's `status` query param; a new `apps/web/src/modules/admin/registrations/` module mirroring `apps/web/src/modules/admin/users/`.

```
Google OAuth callback
        │
        ▼
UsersService.upsertFromProvider ── first login? ── PostHogService.isFeatureEnabled(
        │                                             "auto-accept-register-enabled", "system")
        │ existing user                                       │
        ▼                                              true ───┴─── false
  return user                                     status=active    email pre-approved(status=active
                                                                     from prior admin action)?
                                                                          │
                                                                    yes ──┴── no
                                                                 status=active  status=pending
        │
        ▼
Callback checks user.status
  active      → issue session, redirect to app
  pending     → redirect /login?status=pending  (no session)
  rejected    → redirect /login?status=rejected (no session)
  deactivated → existing behavior (unchanged, out of scope)
```

## Data Models

### `UserEntity` change

Add `status` (enum), drop `active` (boolean). Migration follows the repo's raw-SQL `MigrationInterface` convention (see `1786543235000-create-user-tour-progress.ts` for the enum-type-then-column shape):

```sql
CREATE TYPE "user_status" AS ENUM ('pending', 'active', 'rejected', 'deactivated');

ALTER TABLE "users" ADD COLUMN "status" "user_status" NOT NULL DEFAULT 'pending';

UPDATE "users" SET "status" = CASE WHEN "active" = true THEN 'active'::user_status
                                    ELSE 'deactivated'::user_status END;

ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" DROP COLUMN "active";
```

`down()` reverses: re-add `active boolean`, backfill from `status = 'active'`, drop `status` column and type. Register in `apps/api/src/database/migrations/index.ts`.

No new table. `email`, `name`, `avatarUrl`, `createdAt` already on `UserEntity` cover everything the admin screen needs (identity + request date).

## Core Interfaces

```ts
// apps/api/src/database/entities/user.entity.ts
export enum UserStatus {
  Pending = "pending",
  Active = "active",
  Rejected = "rejected",
  Deactivated = "deactivated",
}

@Entity({ name: "users" })
export class UserEntity {
  // ...existing columns unchanged (id, email, name, avatarUrl, role, tokenVersion, refreshJti, createdAt, updatedAt)

  @Column({ type: "enum", enum: UserStatus, enumName: "user_status", default: UserStatus.Pending })
  status: UserStatus;
}
```

```ts
// apps/api/src/domains/users/users.service.ts (new/changed methods)
export interface UsersService {
  // existing methods unchanged in signature; upsertFromProvider's internal logic
  // now resolves initial `status` via PostHogService before insert.
  approveRegistration(userId: string): Promise<UserEntity>; // status: pending -> active
  rejectRegistration(userId: string): Promise<UserEntity>; // status: pending -> rejected
}
```

## API Design

Resolver mutations follow the existing `@UseGuards(JwtAuthGuard, RolesGuard) @Roles(RoleEnum.Admin)` pattern (see `AuthResolver.users`) — no `FeatureFlagGuard` needed here, since the flag only governs the anonymous first-login path, not admin actions:

```ts
@Resolver(() => UserType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.Admin)
export class RegistrationsResolver {
  @Query(() => [UserType])
  registrations(@Args("status", { nullable: true }) status?: UserStatus) {}

  @Mutation(() => UserType)
  approveRegistration(@Args("userId") userId: string) {}

  @Mutation(() => UserType)
  rejectRegistration(@Args("userId") userId: string) {}
}
```

Both mutations validate the current status is `pending` before transitioning (throw `BadRequestException` otherwise) — prevents re-approving/re-rejecting or acting on a `deactivated` account through this path.

The PostHog check in `UsersService.upsertFromProvider` calls `PostHogService.isFeatureEnabled("auto-accept-register-enabled", "system")` — a fixed distinct ID, since this flag is a system-wide on/off switch, not per-user targeting (per product decision).

The OAuth callback (`auth.controller.ts`) branches on the resolved `status` after `upsertFromProvider`/`findOrCreateFromGoogle` returns: `active` proceeds with the existing token-issuing redirect; `pending`/`rejected` redirect to `/login?status=pending` or `/login?status=rejected` with no token issued (see [ADR-002](adrs/adr-002.md)).

## Web Implementation

- **`/login` page** reads a `status` search param; when `pending` or `rejected`, renders the corresponding message instead of the normal login CTA. No new route needed — extends the existing unauthenticated login page.
- **Admin "Registrations" tab** — new module `apps/web/src/modules/admin/registrations/`, mirroring `apps/web/src/modules/admin/users/` exactly:
  - `hooks/useRegistrationsListViewModel.ts` — wraps a generated `useRegistrationsQuery` (via a new `.graphql` operation in `apps/web/src/graphql/`), exposes `{ registrations, filteredRegistrations, statusFilter, setStatusFilter, loading, error, showInitialLoading }`.
  - `page/RegistrationsPage.tsx` — `"use client"`, `Skeleton` while loading, `EmptyState` when filtered-empty, otherwise a list of `RegistrationCard` (email, name, avatar, `createdAt`, status badge, Approve/Reject buttons wired to the two mutations with optimistic refetch).
  - New tab registered alongside `extension`/`overview`/`users` in the admin route group.
- Regenerate GraphQL types/hooks via `pnpm --filter @job-tracker/web run codegen` after adding operations.

## Testing Strategy

- **API:** `users.service.spec.ts` — cases for `upsertFromProvider` under flag on/off × pre-approved/not-approved email × existing user (status untouched); `registrations.resolver.spec.ts` — approve/reject success and invalid-transition-from-non-pending rejection, following the direct-construction-with-mocked-service pattern used in `sources.resolver.spec.ts`.
- **API:** migration correctness verified by running it against a seeded test DB (existing migration test conventions, if any) or manual verification of the backfill mapping.
- **Web:** `login` page test extends the existing layout/page test pattern (`vi.mock` for `next/navigation` search params) to cover `status=pending` and `status=rejected` rendering. `RegistrationsPage.test.tsx` mirrors `UsersPage`'s existing test, covering loading/error/empty/list states and the two mutation actions.
- No new performance requirements — traffic volume for registration and admin approval is low by nature of this being a manual, admin-gated flow.

## Development Sequencing

**Build Order:**

1. Migration: `user_status` enum + `status` column + backfill + drop `active` (no dependencies).
2. `UserEntity.status` field + update every existing `active` reader/writer to `status` (depends on 1).
3. `UsersService.upsertFromProvider` PostHog check + initial-status logic (depends on 2).
4. OAuth callback branch on `status`, redirect for non-`active` (depends on 2, 3).
5. `RegistrationsResolver` (query + two mutations) (depends on 2).
6. Web `/login` page `status` param handling (depends on 4).
7. Web admin "Registrations" tab, GraphQL operations + codegen (depends on 5).
8. Tests for each layer above, written alongside its step.

## Architecture Decision Records

- [ADR-001: Registration Gate Creates a User Row on First Login, Governed by a Unified Status Enum](adrs/adr-001.md) — `UserEntity.active` becomes `UserEntity.status` (`pending`/`active`/`rejected`/`deactivated`), covering both the new registration gate and the pre-existing deactivation mechanism, with no separate request table.
- [ADR-002: Non-Active Login Outcomes Communicated via OAuth Callback Redirect](adrs/adr-002.md) — the OAuth callback redirects `pending`/`rejected` outcomes to the frontend via a query parameter instead of issuing a token, keeping "has a session" equivalent to "has access."
