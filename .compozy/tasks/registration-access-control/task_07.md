---
status: completed
title: Build admin "Registrations" tab
type: web
complexity: high
dependencies: [task_05]
---

# Build admin "Registrations" tab

## Overview

Add a new "Registrations" tab to the existing Admin area, mirroring the current "Users" tab's conventions, so an admin can search, filter by status, and approve or reject pending registrations.

<critical>
- Read `.compozy/tasks/registration-access-control/_prd.md` and `_techspec.md` before starting.
- Follow the TechSpec "Web Implementation" section and mirror `apps/web/src/modules/admin/users/` conventions exactly.
- Focus on WHAT the admin needs to see and do, not on introducing new UI patterns beyond what `admin/users` already established.
- Minimize code: reuse `EmptyState`, `SearchInput`, `Skeleton` from `@job-tracker/ui` as the existing Users tab does.
- Tests are required: cover loading, empty, error, and populated-list states, plus the two mutation actions.
</critical>

<requirements>
1. A new GraphQL query operation MUST be authored (`admin-registrations.graphql`) requesting `id, email, name, avatarUrl, status, createdAt` for all users, mirroring `admin-users.graphql`'s shape. **Deviation discovered during implementation**: `UserType` did not expose `createdAt` (only task_05's `status` field existed) — added `createdAt: Date` to `UserType` (`apps/api/src/domains/users/user.type.ts`) since the query cannot request a field the schema doesn't have. Minimal, additive, backward-compatible change; `schema.gql` regenerated and API test suite re-verified.
2. A `useRegistrationsListViewModel` hook MUST wrap the generated query hook, exposing filtered results, a `statusFilter` (pending/approved/rejected/all), search, `loading`, `error`, and `showInitialLoading`, mirroring `useUsersListViewModel`.
3. A `RegistrationsPage` component MUST render: `Skeleton` while `showInitialLoading`, an error state on `error`, `EmptyState` when the filtered list is empty, otherwise a list of registration cards.
4. Each registration card MUST show email, name, avatar, request date (`createdAt`), current status, and — only when `status = "pending"` — Approve and Reject actions wired to the `approveRegistration`/`rejectRegistration` mutations from task_05.
5. A new route MUST exist at `apps/web/src/app/(authenticated)/admin/registrations/page.tsx`, and the tab MUST be registered in `AdminShell.tsx`'s `deriveTab()`, `TAB_ROUTES`, and tab trigger list, alongside `extension`/`overview`/`users`.
6. Approving or rejecting MUST refetch or update the list so the acted-on entry reflects its new status without a manual page reload.
</requirements>

## Subtasks

- [x] Author `admin-registrations.graphql` query operation and run codegen.
- [x] Build `useRegistrationsListViewModel` hook with status filter and search.
- [x] Build `RegistrationsPage` with loading/error/empty/list states.
- [x] Build a registration card component with Approve/Reject actions (pending only). **Note**: avatar is accepted in the data shape but not rendered as an `<img>`, matching the existing `UserCard`'s precedent (it accepts `avatarUrl` without rendering it either) and avoiding the `nextjs/no-img-element` lint warning (this repo's web lint runs with `--max-warnings 0`).
- [x] Register the new route and tab in `AdminShell.tsx`; regenerated Next.js route types (`next typegen`) so the new `/admin/registrations` route satisfies the typed-routes `Route` type.
- [x] Add tests for the view model and page covering all states and both mutation actions; also added an `AdminShell.test.tsx` (none existed before) for the tab-registration integration test.
- [x] **Post-review UI change**: moved the status filter Tabs out of the page body and into a new `AdminSubtabsSlot` (`admin-header.slots.ts`), a `PortalSlot` rendered inside `AdminTabBar` next to the primary tab row — the same visual position as the Extension sub-tabs, but generalized as a slot any admin page can fill instead of a hardcoded per-tab conditional. `RegistrationsPage` now fills it via `<AdminSubtabsSlot>...</AdminSubtabsSlot>`; tests wrap the page in `SlotsProvider` + `<AdminSubtabsSlot.Slot />` to render it.

## Implementation Details

Mirror `apps/web/src/modules/admin/users/` file-for-file: `hooks/useUsersListViewModel.ts` → `hooks/useRegistrationsListViewModel.ts`, `page/UsersPage.tsx` → `page/RegistrationsPage.tsx`, `components/UserCard.tsx` → `components/RegistrationCard.tsx`. Run `pnpm --filter @job-tracker/web run codegen` after authoring the `.graphql` file to generate the query hook and mutation hooks. See TechSpec "Web Implementation" for the exact module layout.

### Relevant Files

- `apps/web/src/graphql/admin-users.graphql` — query shape to mirror for `admin-registrations.graphql`.
- `apps/web/src/modules/admin/users/hooks/useUsersListViewModel.ts` — view model pattern to mirror.
- `apps/web/src/modules/admin/users/page/UsersPage.tsx` — page pattern to mirror (Skeleton/EmptyState/error handling).
- `apps/web/src/modules/admin/users/components/UserCard.tsx` — presentational card pattern to mirror.
- `apps/web/src/modules/admin/layout/page/AdminShell.tsx` (`deriveTab()`, `TAB_ROUTES`, `TabsTrigger` list) — tab registration points.
- `apps/web/src/app/(authenticated)/admin/users/page.tsx` — route file pattern to mirror for the new `registrations` route.

### Dependent Files

- `apps/web/codegen.ts` — confirms the codegen config picks up the new `.graphql` file automatically (glob-based, no manual registration expected — verify during implementation).
- `apps/web/src/gql/hooks` / `apps/web/src/gql/graphql.ts` — generated output, regenerated by running codegen, not hand-edited.

### Related ADRs

- No new ADR — this task consumes the API contract defined by [ADR-001](adrs/adr-001.md) and task_05's resolver.

## Deliverables

- New "Registrations" tab visible in the Admin area, functionally equivalent in structure to the existing "Users" tab.
- Admin can search, filter by status, and approve/reject pending entries from this tab.
- Test coverage >=80% on the new hook and page component.

## Tests

**Unit tests:**

- [x] `useRegistrationsListViewModel` filters by each status value (`Pending`, `Active`, `Rejected`) and by search text, and combines both.
- [x] `RegistrationsPage` renders no data rows / actions while `showInitialLoading` is true.
- [x] `RegistrationsPage` renders an error state when `error` is set.
- [x] `RegistrationsPage` renders `EmptyState` when the filtered list is empty.
- [x] `RegistrationCard`/`RegistrationsPage` shows Approve/Reject actions only when `status = Pending`.
- [x] Clicking Approve calls `approveRegistration` with the correct `userId` and refetches.
- [x] Clicking Reject calls `rejectRegistration` with the correct `userId` and refetches.

**Integration tests:**

- [x] Navigating to `/admin/registrations` as an admin renders the "Registrations" tab as active with its content (`AdminShell.test.tsx`).

## Success Criteria

- All tests passing.
- Test coverage >=80%.
- Manual verification in a browser: admin can approve and reject a real pending test account end to end, and the list reflects the new status immediately.
