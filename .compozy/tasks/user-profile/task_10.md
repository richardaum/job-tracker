---
status: completed
title: "Sidebar changes"
type: frontend
complexity: medium
dependencies: [task_04]
---

# Task 10: Sidebar changes

## Overview

Make the sidebar user card clickable (navigates to `/profile` with a chevron icon and hover effect), remove the "Resumes" nav item, and update the "Settings" bottom item from placeholder `#` to `/profile/settings`. Also remove unused `FilesIcon` import if it was only used for the Resumes nav item.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST wrap the user card div in `<Link href="/profile">` with `hover:bg-bg-surface-hover` and `cursor-pointer`
- MUST add a chevron icon (`CaretRightIcon` from `@phosphor-icons/react`) at the end of the user card row
- MUST call `onClose?.()` on the Link click to close mobile sidebar after navigation
- MUST remove `{ href: "/resumes", label: "Resumes", icon: FilesIcon }` from `navItems` array
- MUST update "Settings" `bottomItem` from `href: "#"` to `href: "/profile/settings"`
- MUST remove `FilesIcon` import if it's no longer used anywhere in the file
- MUST NOT change the user card layout structure beyond the additions described
- MUST NOT break mobile sidebar behavior (overlay, close on click)

## Subtasks

- [ ] 10.1 Read `Sidebar.tsx` — understand current user card structure and nav items
- [ ] 10.2 Wrap user card in `<Link href="/profile">` with hover + cursor styles
- [ ] 10.3 Add `CaretRightIcon` at end of user card row
- [ ] 10.4 Add `onClick={() => onClose?.()}` for mobile sidebar close
- [ ] 10.5 Remove "Resumes" item from `navItems`
- [ ] 10.6 Update "Settings" href to `/profile/settings`
- [ ] 10.7 Check and remove unused `FilesIcon` import
- [ ] 10.8 Verify mobile sidebar still works (open/close, overlay)

## Implementation Details

See TechSpec § Frontend — Sidebar Changes for exact modifications.

The user card is currently a plain `<div>` (lines 162-195 in `Sidebar.tsx`). It must become a `<Link>` from `next/link` with styling adjustments.

Follow existing `navItems` link pattern for the user card link styling. The `CaretRightIcon` should be imported from `@phosphor-icons/react`.

`bottomItems` changes: `{ href: "#", label: "Settings", icon: GearIcon }` → `{ href: "/profile/settings", label: "Settings", icon: GearIcon }`.

### Relevant Files

- `apps/web/src/modules/navigation/components/Sidebar.tsx` — sidebar component to modify (274 lines)

### Dependent Files

None — standalone navigation change.

### Related ADRs

- [ADR-001: Unified Profile Hub](../adrs/adr-001.md) — User card clickable, "Resumes" removed, "Settings" → `/profile/settings`

## Deliverables

- Updated `apps/web/src/modules/navigation/components/Sidebar.tsx`

## Tests

Tests written in task_11. Requirements:

- Component test (`Sidebar.test.tsx`):
  - [ ] User card is a `<Link>` with `href="/profile"`
  - [ ] User card shows chevron icon (`CaretRightIcon`)
  - [ ] User card click closes mobile sidebar via `onClose`
  - [ ] "Resumes" is not in the nav items
  - [ ] "Settings" link has `href="/profile/settings"`
  - [ ] `FilesIcon` is not imported (or still imported if used elsewhere)
- Test coverage target: >=80%

## Success Criteria

- User card in sidebar is clickable and navigates to `/profile`
- Hover effect visible on user card row
- Chevron icon visible at end of user card
- Mobile sidebar closes when user card is clicked
- "Resumes" nav item is gone from sidebar
- "Settings" bottom link navigates to `/profile/settings`
- `pnpm --filter web typecheck` passes
- `pnpm lint` passes
