# Google OAuth — Tasks

**Spec:** `.specs/features/google-oauth/spec.md`
**Status:** Planned

---

## Execution Plan

### Phase 1: Data Layer (Sequential)

```
T01 ──→ T02 ──→ T03
```

### Phase 2: Auth Services (Parallel)

```
T03 ──┬── T04 [P]
      └── T05 [P]
```

### Phase 3: Token & Guards (Parallel)

```
T04 ──┬── T06 [P]
      └── T07 [P]
T05 ──┘
```

### Phase 4: API Layer (Sequential)

```
T06, T07 ──→ T08 ──→ T09 ──→ T10
```

### Phase 5: Frontend (Parallel)

```
T10 ──┬── T11 [P]
      ├── T12 [P]
      └── T13 [P]
```

### Phase 6: Frontend Integration (Sequential)

```
T11, T12, T13 ──→ T14 ──→ T15
```

---

## Task Breakdown

### T01: User Drizzle schema

**What:** Define the `users` table schema using Drizzle ORM
**Where:** `apps/api/src/users/users.schema.ts`
**Depends on:** project-setup T09 (Drizzle connection)
**Requirement:** GO-01, GO-03

**Done when:**

- [ ] Schema defines: `id`, `googleId`, `email`, `name`, `avatarUrl`, `role`, `createdAt`, `updatedAt`
- [ ] `role` typed as `pgEnum('role', ['user'])` — extensible for future roles
- [ ] No TypeScript errors

**Tests:** none
**Gate:** build — `pnpm --filter @job-tracker/api build`

---

### T02: Users migration

**What:** Generate and apply Drizzle migration for the `users` table
**Where:** `apps/api/src/database/migrations/`
**Depends on:** T01
**Requirement:** GO-01

**Done when:**

- [ ] `drizzle-kit generate` produces migration file for `users` table
- [ ] `drizzle-kit migrate` applies it against local PostgreSQL without errors
- [ ] Migration is idempotent (re-running does not fail)

**Tests:** none
**Gate:** build — `drizzle-kit migrate`

---

### T03: UserRepository

**What:** Create `UserRepository` with `findByGoogleId` and `upsert` methods
**Where:** `apps/api/src/users/users.repository.ts`, `apps/api/src/users/users.repository.spec.ts`
**Depends on:** T02
**Requirement:** GO-01

**Done when:**

- [ ] `findByGoogleId(googleId: string)` returns user or `null`
- [ ] `upsert(profile)` creates or updates user by `googleId`
- [ ] Integration test covers both methods against real DB
- [ ] Gate: `pnpm --filter @job-tracker/api vitest run` — repository tests pass

**Tests:** integration
**Gate:** full — `pnpm --filter @job-tracker/api vitest run`

---

### T04: UserService [P]

**What:** Create `UserService` with `findOrCreateFromGoogle(profile)` method
**Where:** `apps/api/src/users/users.service.ts`, `apps/api/src/users/users.service.spec.ts`
**Depends on:** T03
**Requirement:** GO-01

**Done when:**

- [ ] `findOrCreateFromGoogle` calls `UserRepository.upsert` and returns the user
- [ ] Unit test mocks `UserRepository` and asserts correct delegation
- [ ] Gate: `pnpm --filter @job-tracker/api vitest run` — 1+ unit tests pass

**Tests:** unit
**Gate:** quick — `pnpm --filter @job-tracker/api vitest run`

---

### T05: AuthService — token generation [P]

**What:** Create `AuthService` with `generateAccessToken` and `generateRefreshToken` methods
**Where:** `apps/api/src/auth/auth.service.ts`, `apps/api/src/auth/auth.service.spec.ts`
**Depends on:** T03
**Requirement:** GO-03

**Done when:**

- [ ] `generateAccessToken(user)` returns a signed JWT (15 min expiry)
- [ ] `generateRefreshToken(user)` returns a signed JWT (7 days expiry)
- [ ] Both tokens include `userId` and `role` in payload
- [ ] Unit tests assert token structure and expiry using `jsonwebtoken` decode
- [ ] Gate: `pnpm --filter @job-tracker/api vitest run` — 2+ unit tests pass

**Tests:** unit
**Gate:** quick — `pnpm --filter @job-tracker/api vitest run`

---

### T06: JwtStrategy + JwtAuthGuard [P]

**What:** Create Passport JWT strategy and NestJS guard for protecting resolvers/routes
**Where:** `apps/api/src/auth/jwt.strategy.ts`, `apps/api/src/auth/jwt-auth.guard.ts`, `apps/api/src/auth/jwt-auth.guard.spec.ts`
**Depends on:** T04, T05
**Requirement:** GO-03, GO-05

**Done when:**

- [ ] `JwtStrategy` validates access token and returns user from DB
- [ ] `JwtAuthGuard` extends `AuthGuard('jwt')` and is applicable as `@UseGuards(JwtAuthGuard)`
- [ ] Unit test asserts guard throws `UnauthorizedException` for invalid token
- [ ] Gate: `pnpm --filter @job-tracker/api vitest run` — 1+ unit tests pass

**Tests:** unit
**Gate:** quick — `pnpm --filter @job-tracker/api vitest run`

---

### T07: RolesGuard + @Roles() decorator [P]

**What:** Create extensible RBAC guard and decorator
**Where:** `apps/api/src/auth/roles.guard.ts`, `apps/api/src/auth/roles.decorator.ts`, `apps/api/src/auth/roles.guard.spec.ts`
**Depends on:** T04, T05
**Requirement:** GO-06

**Done when:**

- [ ] `@Roles('user')` decorator sets metadata on the resolver/route
- [ ] `RolesGuard` reads metadata and compares against JWT payload `role`
- [ ] Unit test asserts guard allows matching role and blocks mismatched role
- [ ] Gate: `pnpm --filter @job-tracker/api vitest run` — 2+ unit tests pass

**Tests:** unit
**Gate:** quick — `pnpm --filter @job-tracker/api vitest run`

---

### T08: GoogleStrategy + AuthController

**What:** Create Passport Google strategy and REST controller for OAuth redirect flow
**Where:** `apps/api/src/auth/google.strategy.ts`, `apps/api/src/auth/auth.controller.ts`, `apps/api/src/auth/auth.controller.spec.ts`
**Depends on:** T06, T07
**Requirement:** GO-01, GO-02, GO-03

**Done when:**

- [ ] `GoogleStrategy` validates Google profile and calls `UserService.findOrCreateFromGoogle`
- [ ] `GET /auth/google` initiates OAuth redirect
- [ ] `GET /auth/google/callback` sets access token in response + refresh token as httpOnly cookie
- [ ] `POST /auth/logout` clears the refresh token cookie
- [ ] Integration test mocks Google response and asserts cookies are set correctly
- [ ] Gate: `pnpm --filter @job-tracker/api vitest run` — integration tests pass

**Tests:** integration
**Gate:** full — `pnpm --filter @job-tracker/api vitest run`

---

### T09: AuthResolver — me query

**What:** Create GraphQL resolver exposing the `me` query for the authenticated user
**Where:** `apps/api/src/auth/auth.resolver.ts`, `apps/api/src/auth/auth.resolver.spec.ts`
**Depends on:** T08
**Requirement:** GO-04

**Done when:**

- [ ] `Query.me` is protected by `@UseGuards(JwtAuthGuard)` and `@Roles('user')`
- [ ] Returns the current user from JWT context
- [ ] Integration test calls `me` with a valid JWT and asserts user fields returned
- [ ] Integration test calls `me` without JWT and asserts `401 Unauthorized`
- [ ] Gate: `pnpm --filter @job-tracker/api vitest run` — integration tests pass

**Tests:** integration
**Gate:** full — `pnpm --filter @job-tracker/api vitest run`

---

### T10: AuthModule

**What:** Wire all auth providers and exports into `AuthModule`
**Where:** `apps/api/src/auth/auth.module.ts`
**Depends on:** T09
**Requirement:** GO-01

**Done when:**

- [ ] `AuthModule` registers: `GoogleStrategy`, `JwtStrategy`, `JwtAuthGuard`, `RolesGuard`, `AuthService`, `AuthController`, `AuthResolver`
- [ ] `UsersModule` imported and `UserRepository` available
- [ ] `pnpm --filter @job-tracker/api build` passes with no errors

**Tests:** none
**Gate:** build — `pnpm --filter @job-tracker/api build`

---

### T11: Apollo Client setup (apps/web) [P]

**What:** Configure Apollo Client in `apps/web` with `credentials: 'include'` for cookie-based auth
**Where:** `apps/web/src/lib/apollo-client.ts`, `apps/web/src/app/providers.tsx`
**Depends on:** T10
**Requirement:** GO-03

**Done when:**

- [ ] `ApolloClient` configured with `HttpLink` pointing to API GraphQL endpoint
- [ ] `credentials: 'include'` set so httpOnly cookies are sent on every request
- [ ] `ApolloProvider` wraps the app in `providers.tsx`
- [ ] Unit test asserts `ApolloClient` is instantiated with correct config
- [ ] Gate: `pnpm --filter @job-tracker/web vitest run` — 1+ unit tests pass

**Tests:** unit
**Gate:** quick — `pnpm --filter @job-tracker/web vitest run`

---

### T12: GoogleLoginButton component (packages/ui) [P]

**What:** Create `GoogleLoginButton` component with unit test and Storybook story
**Where:** `packages/ui/src/components/GoogleLoginButton/`
**Depends on:** T10
**Requirement:** GO-01

**Done when:**

- [ ] Component renders a button that triggers `onClick` prop
- [ ] `GoogleLoginButton.test.tsx` — renders correctly and fires click handler
- [ ] `GoogleLoginButton.stories.tsx` — `Default` story renders without errors
- [ ] Gate (unit): `pnpm --filter @job-tracker/ui vitest run` — 1+ tests pass
- [ ] Gate (visual): `pnpm --filter @job-tracker/ui test-storybook` — story passes

**Tests:** unit + visual
**Gate:** quick + storybook

---

### T13: useCurrentUser hook [P]

**What:** Create `useCurrentUser` hook wrapping the GraphQL `me` query
**Where:** `apps/web/src/hooks/useCurrentUser.ts`, `apps/web/src/hooks/useCurrentUser.test.ts`
**Depends on:** T10
**Requirement:** GO-04

**Done when:**

- [ ] Hook calls `me` query via Apollo and returns `{ user, loading, error }`
- [ ] Unit test mocks Apollo and asserts hook returns user data correctly
- [ ] Gate: `pnpm --filter @job-tracker/web vitest run` — 1+ unit tests pass

**Tests:** unit
**Gate:** quick — `pnpm --filter @job-tracker/web vitest run`

---

### T14: LoginPage

**What:** Create the `/login` page rendering `GoogleLoginButton` and redirecting to `/auth/google`
**Where:** `apps/web/src/app/login/page.tsx`, `apps/web/src/app/login/page.test.tsx`
**Depends on:** T11, T12, T13
**Requirement:** GO-01, GO-05

**Done when:**

- [ ] Page renders `GoogleLoginButton` linked to `GET /auth/google`
- [ ] Authenticated users are redirected away from `/login`
- [ ] Unit test asserts page renders the button
- [ ] Gate: `pnpm --filter @job-tracker/web vitest run` — 1+ unit tests pass

**Tests:** unit
**Gate:** quick — `pnpm --filter @job-tracker/web vitest run`

---

### T15: ProtectedLayout

**What:** Create authenticated layout that redirects unauthenticated users to `/login`
**Where:** `apps/web/src/app/(authenticated)/layout.tsx`, `apps/web/src/app/(authenticated)/layout.test.tsx`
**Depends on:** T14
**Requirement:** GO-05

**Done when:**

- [ ] Layout calls `useCurrentUser` — redirects to `/login` if no user
- [ ] Renders children when authenticated
- [ ] Unit test asserts redirect behavior for unauthenticated state
- [ ] Gate: `pnpm --filter @job-tracker/web vitest run` — 1+ unit tests pass

**Tests:** unit
**Gate:** quick — `pnpm --filter @job-tracker/web vitest run`

---

## Parallel Execution Map

```
Phase 1:  T01 ──→ T02 ──→ T03

Phase 2:  T03 ──┬── T04 [P]
                └── T05 [P]

Phase 3:  T04 ──┬── T06 [P]
          T05 ──┘
                └── T07 [P]

Phase 4:  T06, T07 ──→ T08 ──→ T09 ──→ T10

Phase 5:  T10 ──┬── T11 [P]
                ├── T12 [P]
                └── T13 [P]

Phase 6:  T11, T12, T13 ──→ T14 ──→ T15
```

---

## Granularity Check

| Task                                 | Scope                                       | Status |
| ------------------------------------ | ------------------------------------------- | ------ |
| T01: User schema                     | 1 schema file                               | ✅     |
| T02: Users migration                 | 1 migration                                 | ✅     |
| T03: UserRepository                  | 1 class + 1 test                            | ✅     |
| T04: UserService                     | 1 service + 1 test                          | ✅     |
| T05: AuthService tokens              | 1 service + 1 test                          | ✅     |
| T06: JwtStrategy + JwtAuthGuard      | 2 files, cohesive (strategy + guard)        | ✅     |
| T07: RolesGuard + @Roles()           | 2 files, cohesive (guard + decorator)       | ✅     |
| T08: GoogleStrategy + AuthController | 2 files, cohesive (OAuth flow entry points) | ✅     |
| T09: AuthResolver me query           | 1 resolver + 1 test                         | ✅     |
| T10: AuthModule                      | 1 module file                               | ✅     |
| T11: Apollo Client setup             | 2 files (client + provider)                 | ✅     |
| T12: GoogleLoginButton               | 3 files (component + test + story)          | ✅     |
| T13: useCurrentUser hook             | 1 hook + 1 test                             | ✅     |
| T14: LoginPage                       | 1 page + 1 test                             | ✅     |
| T15: ProtectedLayout                 | 1 layout + 1 test                           | ✅     |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows     | Status |
| ---- | ----------------- | ----------------- | ------ |
| T01  | project-setup T09 | start             | ✅     |
| T02  | T01               | T01 → T02         | ✅     |
| T03  | T02               | T02 → T03         | ✅     |
| T04  | T03               | T03 → T04         | ✅     |
| T05  | T03               | T03 → T05         | ✅     |
| T06  | T04, T05          | T04,T05 → T06     | ✅     |
| T07  | T04, T05          | T04,T05 → T07     | ✅     |
| T08  | T06, T07          | T06,T07 → T08     | ✅     |
| T09  | T08               | T08 → T09         | ✅     |
| T10  | T09               | T09 → T10         | ✅     |
| T11  | T10               | T10 → T11         | ✅     |
| T12  | T10               | T10 → T12         | ✅     |
| T13  | T10               | T10 → T13         | ✅     |
| T14  | T11, T12, T13     | T11,T12,T13 → T14 | ✅     |
| T15  | T14               | T14 → T15         | ✅     |

---

## Test Co-location Validation

| Task | Layer Created                 | Matrix Requires | Task Says     | Status |
| ---- | ----------------------------- | --------------- | ------------- | ------ |
| T01  | schema (config)               | none            | none          | ✅     |
| T02  | migration (config)            | none            | none          | ✅     |
| T03  | Repository + real DB          | integration     | integration   | ✅     |
| T04  | Service (api)                 | unit            | unit          | ✅     |
| T05  | Service (api)                 | unit            | unit          | ✅     |
| T06  | Guard / interceptor (api)     | unit            | unit          | ✅     |
| T07  | Guard / interceptor (api)     | unit            | unit          | ✅     |
| T08  | Controller + GraphQL resolver | integration     | integration   | ✅     |
| T09  | GraphQL resolver              | integration     | integration   | ✅     |
| T10  | Module wiring                 | none            | none          | ✅     |
| T11  | Hook / util (web)             | unit            | unit          | ✅     |
| T12  | React component (ui) + story  | unit + visual   | unit + visual | ✅     |
| T13  | Hook / util (web)             | unit            | unit          | ✅     |
| T14  | Hook / util (web)             | unit            | unit          | ✅     |
| T15  | Hook / util (web)             | unit            | unit          | ✅     |
