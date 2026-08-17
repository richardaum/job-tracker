---
status: completed
title: Handle `status=pending`/`rejected` on the login page
type: web
complexity: medium
dependencies: [task_04]
---

# Handle `status=pending`/`rejected` on the login page

## Overview

Extend the existing `/login` page to read the `status` search param set by the OAuth callback (task_04) and render a "pending approval" or "access rejected" message instead of the normal login call-to-action.

<critical>
- Read `.compozy/tasks/registration-access-control/_prd.md` and `_techspec.md` before starting.
- Follow ADR-002's contract: `status=pending` and `status=rejected` are the only two values to branch on; anything else (including absent) is the normal login state.
- Focus on WHAT the two states communicate to the user, not on redesigning the login page.
- Minimize code: extend the existing page component, do not create a new route.
- Tests are required: cover both status values and the default (no param) case.
</critical>

<requirements>
1. The login page MUST read a `status` search param using the existing `next/navigation` pattern already used in this codebase (see `useAuthReturnTo.ts`).
2. When `status=pending`, the page MUST render a message stating access was requested and is pending admin approval, and MUST NOT render the normal Google login button/CTA.
3. When `status=rejected`, the page MUST render a message stating access was not granted, distinct in wording from the pending message, and MUST NOT render the normal Google login button/CTA.
4. When `status` is absent or any other value, the page MUST render exactly as it does today (no regression).
</requirements>

## Subtasks

- [x] Read the `status` search param on the login page using `useSearchParams()`.
- [x] Add a `pending` message state, replacing the default CTA (new `LoginStatusPanel` component, mirroring `LoginSocialPanel`'s card styling).
- [x] Add a `rejected` message state, replacing the default CTA.
- [x] Verify default (no `status`) rendering is unchanged — also verified an unrecognized `status` value falls back to default.
- [x] Add/update tests for all three cases (plus the unrecognized-value case).

## Implementation Details

`apps/web/src/app/login/page.tsx` is already wrapped in `<Suspense>` via `apps/web/src/app/login/layout.tsx`, which is required for `useSearchParams()` — no layout change needed. See TechSpec "Web Implementation" section.

### Relevant Files

- `apps/web/src/app/login/page.tsx` — login page component to extend.
- `apps/web/src/app/login/layout.tsx` — confirms `Suspense` wrapping already exists for search-param reads.
- `apps/web/src/hooks/useAuthReturnTo.ts:19-31` — existing `useSearchParams()`/`usePathname()` pattern to mirror.

### Dependent Files

- `apps/web/src/app/login/page.test.tsx` (or equivalent, create if absent) — add test cases for the new states.

### Related ADRs

- [ADR-002](adrs/adr-002.md) — defines the `status=pending|rejected` contract this page consumes.

## Deliverables

- Login page renders distinct pending/rejected messaging based on the `status` search param.
- Default login behavior unchanged when `status` is absent.
- Test coverage >=80% on the modified component.
- **Post-review addition**: the pending/rejected `LoginStatusPanel` includes a "Log out" button (reusing the same `POST /auth/logout` + `apolloClient.clearStore()` + redirect-to-`/login` flow as the authenticated `Sidebar`), so a person stuck on this screen — e.g. after signing in with the wrong Google account — can clear any stale session and retry instead of being stranded with no way out.

## Tests

**Unit tests:**

- [x] `status=pending` renders the pending message and hides the login CTA.
- [x] `status=rejected` renders the rejected message and hides the login CTA.
- [x] No `status` param renders the default login CTA unchanged.
- [x] An unrecognized `status` value falls back to default rendering.
- [x] Clicking "Log out" on the pending screen calls `POST /auth/logout` and redirects to `/login`.

## Success Criteria

- All tests passing.
- Test coverage >=80%.
- Manual verification: navigating to `/login?status=pending` and `/login?status=rejected` shows the correct distinct message in a browser.
