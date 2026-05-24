---
status: completed
title: "Identity tab"
type: frontend
complexity: low
dependencies: [task_04]
---

# Task 05: Identity tab

## Overview

Create the `IdentityTabPage` component that displays the user's read-only OAuth identity (avatar, name, email) on the `/profile` route. Wire it as the default export of `/profile/page.tsx`.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `IdentityTabPage` at `apps/web/src/modules/profile/identity/page/IdentityTabPage.tsx`
- MUST use `useMeQuery()` to fetch OAuth identity (name, email, avatarUrl)
- MUST render avatar as `<Image>` when `avatarUrl` exists, otherwise show initials in a colored circle
- MUST display name as `<Heading as="h2" size="lg">` and email as muted text
- MUST show "Managed by Google — not editable here." as small muted text below
- MUST handle loading state (skeleton or "Loading..." text)
- MUST handle null user (return null or fallback)
- MUST update `/profile/page.tsx` to re-export `IdentityTabPage` instead of stub
- MUST follow TechSpec § Frontend — Identity Tab component shape exactly
</requirements>

## Subtasks

- [ ] 5.1 Read `useMeQuery` type and `useCurrentUser` hook for pattern
- [ ] 5.2 Create `IdentityTabPage.tsx` with avatar, name, email display
- [ ] 5.3 Implement initials fallback (first 2 characters of first+last name)
- [ ] 5.4 Handle loading state
- [ ] 5.5 Update `/profile/page.tsx` to re-export `IdentityTabPage`

## Implementation Details

See TechSpec § Frontend — Identity Tab for the exact component structure.

Follow `useCurrentUser` hook pattern for `useMeQuery`. The component is a `"use client"` component.

Initials: `name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)`.

Avatar fallback circle: use `bg-bg-brand-subtle` + `text-text-brand` colors.

### Relevant Files

- `apps/web/src/hooks/useCurrentUser.ts` — `useMeQuery` pattern, `CurrentUser` type
- `apps/web/src/graphql/me.graphql` — Me query (id, email, name, role, avatarUrl)
- `apps/web/src/gql/hooks.ts` — generated `useMeQuery` hook
- `apps/web/src/app/(authenticated)/profile/page.tsx` — route re-export (update stub → IdentityTabPage)

### Dependent Files

None — this is a leaf component consumed by the route.

### Related ADRs

- [ADR-001: Unified Profile Hub](../adrs/adr-001.md) — Identity as the default tab

## Deliverables

- `apps/web/src/modules/profile/identity/page/IdentityTabPage.tsx`
- Updated `apps/web/src/app/(authenticated)/profile/page.tsx`

## Tests

Tests written in task_11. Requirements:

- Component test (`IdentityTabPage.test.tsx`):
  - [ ] Shows avatar `<Image>` when `avatarUrl` is present
  - [ ] Shows initials in colored circle when `avatarUrl` is null
  - [ ] Shows user's name and email
  - [ ] Shows "Managed by Google — not editable here." text
  - [ ] Shows loading indicator when query is loading
  - [ ] Returns null (or fallback) when user is null
- Test coverage target: >=80%

## Success Criteria

- `/profile` renders user's avatar, name, and email
- No edit controls visible (read-only)
- Initials fallback works when no avatar URL
- Loading state displays correctly
- `pnpm --filter web typecheck` passes
