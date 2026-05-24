---
status: completed
title: Refactor JobDetailsLayout to PortalSlotsProvider
type: frontend
complexity: medium
dependencies:
  - task_02
---

# Task 03: Refactor JobDetailsLayout to PortalSlotsProvider

## Overview

Refactor `JobDetailsLayout` to declare portal slot targets in the header instead of managing Match-specific state and a DOM ref. The layout becomes slot-agnostic: it provides `PortalSlotsProvider`, renders slot containers, and removes Match-only context wiring.

<critical>
- ALWAYS READ the PRD before starting
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — update or verify `JobDetailsLayout.test.tsx` if it breaks
</critical>

<requirements>
- MUST replace `JobDetailsHeaderProvider` with `PortalSlotsProvider` from `react-portalslots`
- MUST replace `ref={setMatchHeaderPortalElement}` container with `<JobHeaderActions.Slot />` (preserve `empty:hidden` / flex wrapper styling)
- MUST replace `<JobDetailsHeaderMatchMenuItems />` inside Actions dropdown with `<JobActionsMenuItems.Slot />`
- MUST remove state: `matchHeaderPortalElement`, `matchPrefsOpen`
- MUST remove handlers/derived values used only for Match header: `handleViewMatchPreferences`, `isMatchTabActive`, `matchResumeId` (if only consumed by removed header plumbing)
- MUST remove `PreferencesDialog` JSX and import from layout
- MUST remove imports of `JobDetailsHeaderProvider`, `JobDetailsHeaderMatchMenuItems`
- SHOULD keep Actions dropdown structure unchanged for non-Match items (Fill, Update status, Remove)
- MUST import slots from `@/modules/jobs/details/job-details-header.slots`
</requirements>

## Subtasks

- [x] 3.1 Wrap layout tree in `PortalSlotsProvider`
- [x] 3.2 Swap portal ref div for `<JobHeaderActions.Slot />` in header actions row
- [x] 3.3 Swap match menu component for `<JobActionsMenuItems.Slot />` at top of Actions dropdown
- [x] 3.4 Remove Match-specific state, handlers, and `PreferencesDialog` from layout
- [x] 3.5 Clean up unused imports and verify layout tests still pass

## Implementation Details

Current header actions row (approx. lines 236–246 in `JobDetailsLayout.tsx`):

- Actions `DropdownMenu` includes `<JobDetailsHeaderMatchMenuItems />` before generic items
- Adjacent div uses `ref={setMatchHeaderPortalElement}` for Generate button portal

After refactor, layout only mounts empty slot targets; Match tab content fills them when active.

`PortalSlotsProvider` should wrap the same subtree that includes both the header slot targets and `{children}` (tab routes), so portaled content from `MatchTabContent` can reach the slots.

### Relevant Files

- `apps/web/src/modules/jobs/details/page/JobDetailsLayout.tsx` — primary refactor target
- `apps/web/src/modules/jobs/details/job-details-header.slots.ts` — slot imports

### Dependent Files

- `apps/web/src/modules/jobs/details/page/JobDetailsLayout.test.tsx` — may need mock adjustments if provider/slots affect render
- `apps/web/src/modules/jobs/details/components/MatchTabContent.tsx` — fills slots in task 04

## Deliverables

- `JobDetailsLayout` uses `PortalSlotsProvider` + slot targets only
- No Match-specific context or preferences dialog in layout
- Layout tests passing **(REQUIRED if file exists and was affected)**

## Tests

### Unit Tests

- [x] `JobDetailsLayout.test.tsx`: existing tab routing / layout smoke tests still pass after provider swap
- [x] Layout does not render `PreferencesDialog` (removed from layout ownership)

### Integration Tests

- [x] `pnpm --filter @job-tracker/web test JobDetailsLayout` passes (if tests exist)

## Success Criteria

- Layout file has zero references to `JobDetailsHeaderProvider`, `matchHeaderPortalElement`, `matchPrefsOpen`
- Slot targets visible in header DOM when Match tab mounts content (verified in task 06)
- All tests passing

## Completion notes

Actions dropdown uses `<JobActionsMenuItemsOutlet />` from `job-details-actions-menu.tsx` (not a portal slot) after Radix Menu context mitigation in task 06.
