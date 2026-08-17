---
status: completed
title: Redirect non-active OAuth outcomes via callback query param
type: api
complexity: medium
dependencies: [task_02, task_03]
---

# Redirect non-active OAuth outcomes via callback query param

## Overview

Change the `/auth/google/callback` flow so that a `pending` or `rejected` account is redirected to `/login?status=pending` or `/login?status=rejected` without issuing a session, instead of failing with an unhandled exception.

<critical>
- Read `.compozy/tasks/registration-access-control/_prd.md` and `_techspec.md` before starting.
- Follow ADR-002 for the exact redirect contract (`/login?status=pending|rejected`, no token issued).
- Focus on WHAT the callback returns for each status, not on frontend rendering — that is task_06.
- Minimize code: branch on `status` inside the existing `finishLogin`/callback flow, do not restructure it.
- Tests are required: cover all four `status` values reaching the callback.
</critical>

<requirements>
0. **(Discovered during implementation)** `google.strategy.ts`'s `validate()`, as implemented in task_02, rejected login for *any* non-active status — including `Pending`/`Rejected` — before the request ever reached the controller. This conflicted directly with requirements 3–4 below. Corrected: `validate()` now only rejects `status = Deactivated`; `Pending`/`Rejected`/`Active` all reach the callback. See the amended task_02.md requirement 5.
1. The callback flow MUST branch on `user.status` after `upsertFromProvider`/`findOrCreateFromGoogle` resolves, before any cookie/token is set.
2. `status = "active"` MUST proceed exactly as today: set `access_token`/`refresh_token` cookies and redirect to the existing `runtimeWebUrl`-derived `/login` (or `returnTo`) URL.
3. `status = "pending"` MUST redirect to `/login?status=pending` on the same `runtimeWebUrl` base used today, with NO cookies set.
4. `status = "rejected"` MUST redirect to `/login?status=rejected` on the same base, with NO cookies set.
5. `status = "deactivated"` is out of scope for this task's redirect branching — it is not a first-login outcome and existing behavior for deactivated accounts (via `validateActiveUser`) MUST remain unaffected.
6. Any existing `returnTo` query param handling MUST be preserved for the `active` case only; it MUST NOT be appended to `pending`/`rejected` redirects.
</requirements>

## Subtasks

- [x] Fix `google.strategy.ts` to only block `Deactivated` (see requirement 0).
- [x] Widen `req.user`/`finishLogin` types to include `status` (`AuthController`, `GoogleAuthGuard` dev-bypass path).
- [x] Add a `status` branch immediately after user resolution in `finishLogin`, before cookie-setting.
- [x] Implement the `active` branch as a pass-through to existing behavior (no regression).
- [x] Implement `pending` and `rejected` branches: redirect to `/login?status=<value>` with no cookies set.
- [x] Confirm `runtimeWebUrl` resolution logic (`Origin`/`X-Forwarded-Host`/fallback) is reused unchanged for the new branches (extracted into `resolveRuntimeWebUrl`).
- [x] Add/update tests for all four status outcomes.

## Implementation Details

Modify `finishLogin()` (or the point immediately before it is called) in `auth.controller.ts` to check `req.user.status` and skip cookie-setting for non-`active` outcomes, building the redirect URL the same way (`new URL("/login", runtimeWebUrl)`) but appending `status` instead of `returnTo`. See TechSpec "System Architecture" and ADR-002 for the full contract.

### Relevant Files

- `apps/api/src/domains/auth/auth.controller.ts:55-60` — `googleCallback()` entry point, calls `finishLogin`.
- `apps/api/src/domains/auth/auth.controller.ts:144-180` — `finishLogin()`: cookie-setting and redirect URL construction to branch around.

### Dependent Files

- `apps/api/src/domains/auth/auth.controller.spec.ts` (or equivalent, if it exists — verify during implementation) — needs new test cases for `pending`/`rejected`/`active` redirect branches.

### Related ADRs

- [ADR-002](adrs/adr-002.md) — defines this exact redirect-based contract and why a limited-scope token was rejected.

## Deliverables

- Callback handler branches on `status`, redirecting appropriately for all four values.
- No cookies set for `pending`/`rejected` outcomes.
- Test coverage >=80% on the modified handler logic.

## Tests

**Unit tests:**

- [x] `status = Active`: cookies set, redirect to `/login` (or `returnTo` URL) — unchanged from current behavior (existing `auth.controller.spec.ts` callback tests).
- [x] `status = Pending`: no cookies set, redirect to `/login?status=pending`.
- [x] `status = Rejected`: no cookies set, redirect to `/login?status=rejected`.
- [x] `returnTo` param is not appended to `pending`/`rejected` redirects.

**Integration tests:**

- [x] Full callback request with a `pending`-status user results in a 302 to `/login?status=pending` with no `Set-Cookie` header (`auth.controller.spec.ts`, supertest-based).

## Success Criteria

- All four status branches behave exactly as specified.
- All tests passing.
- Test coverage >=80%.
- Manual verification: hitting the callback with a pending test account redirects without a session cookie.
