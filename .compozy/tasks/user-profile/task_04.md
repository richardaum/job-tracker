---
status: completed
title: "Profile shell with tab routing"
type: frontend
complexity: medium
dependencies: []
---

# Task 04: Profile shell with tab routing

## Overview

Create the `/profile` route structure with a shared layout (`layout.tsx`) and 5 thin route re-exports (`page.tsx` stubs for each tab subpage). The layout renders the persistent shell: `BackToLink` → `/jobs`, `Heading` "Profile", and a `TabsList` with 4 tabs synced to the current URL via `usePathname()`.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create 6 route files under `apps/web/src/app/(authenticated)/profile/`:
  - `layout.tsx` — shared shell (BackToLink, Heading, TabsList)
  - `page.tsx` — thin re-export to IdentityTabPage (stub)
  - `settings/page.tsx` — thin re-export to SettingsTabPage (stub)
  - `resumes/page.tsx` — thin re-export to ResumesTabPage (stub)
  - `resumes/[id]/page.tsx` — thin re-export to ResumeDetailPage (stub)
  - `preferences/page.tsx` — thin re-export to PreferencesTabPage (stub)
- MUST create the shell component at `apps/web/src/modules/profile/layout/page/ProfileShell.tsx`
- MUST sync `Tabs` `value` prop with current URL pathname using `usePathname()` (no `<TabsContent>` — content is the child page)
- MUST implement tab value mapping: `/profile` → `identity`, `/profile/settings` → `settings`, `/profile/resumes` or `/profile/resumes/[id]` → `resumes`, `/profile/preferences` → `preferences`
- MUST implement `onValueChange` → `router.push()` to the corresponding subpage
- MUST follow existing route pattern: metadata + default re-export (see `/resumes/page.tsx`)
- MUST follow existing detail-page layout: `flex h-full min-h-0 flex-col`, header `border-b`, content `flex-1 min-h-0`
</requirements>

## Subtasks

- [ ] 4.1 Create `apps/web/src/modules/profile/layout/page/ProfileShell.tsx` with layout + tab sync logic
- [ ] 4.2 Create `layout.tsx` at `/profile/layout.tsx` wrapping children with `ProfileShell`
- [ ] 4.3 Create stub `page.tsx` files for all 5 tab subpages (thin re-exports to placeholder components)
- [ ] 4.4 Implement `usePathname()` → tab value derivation
- [ ] 4.5 Implement `onValueChange` → `router.push()` to correct subpage
- [ ] 4.6 Verify: navigate between tabs via URL and via tab clicks

## Implementation Details

See TechSpec § Frontend — Profile Shell and ADR-002 for layout structure and tab value mapping.

`ProfileShell.tsx` is a `"use client"` component. Uses `usePathname()` from `next/navigation` and `useRouter()` for navigation.

Tab trigger values: `identity`, `settings`, `resumes`, `preferences`.

The layout renders `<ProfileShell>{children}</ProfileShell>` — children is the current tab page.

Follow `CompanyDetailsPage` pattern for `BackToLink`, `Heading`, and `TabsList` layout. Do NOT use `<TabsContent>` — tab content is the children slot.

### Relevant Files

- `apps/web/src/app/(authenticated)/resumes/page.tsx` — route re-export pattern
- `apps/web/src/modules/companies/details/page/CompanyDetailsPage.tsx` — tab layout pattern (header, TabsList, BackToLink)
- `apps/web/src/components/back-to-link/BackToLink.tsx` — BackToLink component usage
- `apps/web/src/app/(authenticated)/layout.tsx` — authenticated segment wrapper

### Dependent Files

- `apps/web/src/modules/profile/identity/page/IdentityTabPage.tsx` — wired to `/profile/page.tsx` (task_05)
- `apps/web/src/modules/profile/settings/page/SettingsTabPage.tsx` — wired to `/profile/settings/page.tsx` (task_06)
- `apps/web/src/modules/profile/preferences/page/PreferencesTabPage.tsx` — wired to `/profile/preferences/page.tsx` (task_07)
- `apps/web/src/modules/profile/resumes/page/ResumesTabPage.tsx` — wired to `/profile/resumes/page.tsx` (task_08)
- `apps/web/src/modules/profile/resumes/[id]/page/ResumeDetailPage.tsx` — wired to `/profile/resumes/[id]/page.tsx` (task_09)

### Related ADRs

- [ADR-001: Unified Profile Hub](../adrs/adr-001.md) — Single `/profile` with 4 tabs
- [ADR-002: Tab Subpages with Shared Layout](../adrs/adr-002.md) — `layout.tsx` + individual `page.tsx` per tab, `usePathname()` sync

## Deliverables

- `apps/web/src/modules/profile/layout/page/ProfileShell.tsx`
- `apps/web/src/app/(authenticated)/profile/layout.tsx`
- `apps/web/src/app/(authenticated)/profile/page.tsx` (stub re-export)
- `apps/web/src/app/(authenticated)/profile/settings/page.tsx` (stub re-export)
- `apps/web/src/app/(authenticated)/profile/resumes/page.tsx` (stub re-export)
- `apps/web/src/app/(authenticated)/profile/resumes/[id]/page.tsx` (stub re-export)
- `apps/web/src/app/(authenticated)/profile/preferences/page.tsx` (stub re-export)

## Tests

Tests written in task_11. Requirements:

- Component test (`ProfileShell.test.tsx`):
  - [ ] Renders 4 tab triggers: Identity, Settings, Resumes, Work Preferences
  - [ ] Active tab matches current pathname (e.g., `/profile/settings` → Settings tab highlighted)
  - [ ] Clicking a tab trigger calls `router.push()` to the correct subpage
  - [ ] `/profile/resumes/[id]` pathname highlights Resumes tab
- Test coverage target: >=80%

## Success Criteria

- Navigating to `/profile` renders shell with 4 tabs
- Each tab click navigates to the correct subpage URL
- `usePathname()` correctly derives active tab value for all 4 tabs + nested `/profile/resumes/[id]`
- Browser back/forward between tabs works
- `pnpm --filter web typecheck` passes
