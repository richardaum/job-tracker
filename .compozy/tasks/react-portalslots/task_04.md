---
status: completed
title: Refactor MatchTabContent to fill slots
type: frontend
complexity: medium
dependencies:
  - task_02
---

# Task 04: Refactor MatchTabContent to fill slots

## Overview

Move Match tab header contributions into named portal slots and colocate `PreferencesDialog` state in `MatchTabContent`. Remove manual `createPortal` and hooks that read the old header context. Update unit tests to wrap with `PortalSlotsProvider` and slot mounts.

<critical>
- ALWAYS READ the PRD before starting
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — update `MatchTabContent.test.tsx` in this task
</critical>

<requirements>
- MUST wrap Generate/Regenerate button in `<JobHeaderActions>{generateButton}</JobHeaderActions>`
- MUST render Match Actions menu items inside `<JobActionsMenuItems>` (View resume, View preferences, Match label/separator as today)
- MUST add local `prefsOpen` state and render `<PreferencesDialog open={prefsOpen} onOpenChange={setPrefsOpen} readOnly />` in `MatchTabContent`
- MUST wire `onPreferenceClick` on `MatchItemCard` to open local preferences dialog
- MUST remove `createPortal`, `useJobMatchHeaderPortalTarget`, `useOpenMatchPreferences` imports/usages
- MUST remove `generateButtonPortaled` pattern — slot library handles portal rendering
- SHOULD retain toolbar fallback: when header slot is not mounted (tests without full layout), show Generate button in tab toolbar (existing `!headerPortalTarget` pattern adapted to slot-unmounted detection or test wrapper always mounting slot)
- MUST update `MatchTabContent.test.tsx` helper `renderMatchTab` to use `PortalSlotsProvider` + `<JobHeaderActions.Slot />` / `<JobActionsMenuItems.Slot />` instead of `JobDetailsHeaderProvider`
- MUST preserve existing test cases: Generate CTA, header menu items, Regenerate wizard, filters, SSE behavior
</requirements>

## Subtasks

- [x] 4.1 Import slots from `job-details-header.slots.ts`
- [x] 4.2 Portal Generate button via `<JobHeaderActions>`
- [x] 4.3 Move dropdown menu items from deleted `JobDetailsHeaderMatchMenuItems` into `<JobActionsMenuItems>` (use `vm.matchAnalysis?.resumeId` for View resume)
- [x] 4.4 Add `prefsOpen` + `PreferencesDialog`; wire card preference clicks
- [x] 4.5 Remove legacy portal/context hooks
- [x] 4.6 Refactor test wrapper and fix any broken assertions

## Implementation Details

Current `MatchTabContent` patterns to replace:

- `useJobMatchHeaderPortalTarget()` + `createPortal(generateButton, headerPortalTarget)`
- `useOpenMatchPreferences()` for card clicks
- `generateButtonPortaled` rendered at top of return tree

Menu items logic today lives in `JobDetailsHeaderMatchMenuItems.tsx`:

- Match label group, View resume (when `matchResumeId`), View preferences, separator
- Gated by `isMatchTabActive` — when content only mounts on Match route, unconditional render inside `<JobActionsMenuItems>` is sufficient

Test wrapper today (`MatchTabContent.test.tsx` lines ~169–198):

```tsx
<JobDetailsHeaderProvider portalElement={null} isMatchTabActive matchResumeId="..." ...>
  {withHeaderActions ? <DropdownMenu><JobDetailsHeaderMatchMenuItems /></DropdownMenu> : null}
  {children}
</JobDetailsHeaderProvider>
```

Replace with:

```tsx
<PortalSlotsProvider>
  {withHeaderActions ? (
    <DropdownMenu trigger={...}>
      <JobActionsMenuItems.Slot />
    </DropdownMenu>
  ) : null}
  <JobHeaderActions.Slot />
  {children}
</PortalSlotsProvider>
```

Unmock or partially mock `PreferencesDialog` if adding a test for preference open from card click.

### Relevant Files

- `apps/web/src/modules/jobs/details/components/MatchTabContent.tsx` — primary refactor
- `apps/web/src/modules/jobs/details/components/MatchTabContent.test.tsx` — test wrapper + any new preference dialog test
- `apps/web/src/modules/jobs/details/components/JobDetailsHeaderMatchMenuItems.tsx` — **reference only** (logic to inline/move; deleted in task 05)
- `apps/web/src/modules/jobs/details/job-details-header.slots.ts` — slot imports

### Dependent Files

- `apps/web/src/modules/work-preferences/components/PreferencesDialog.tsx` — rendered from Match tab now

## Deliverables

- `MatchTabContent` fills both portal slots and owns preferences dialog
- Updated `MatchTabContent.test.tsx` with portal slots test wrapper
- `pnpm --filter @job-tracker/web test MatchTabContent` passes **(REQUIRED)**

## Tests

### Unit Tests

- [x] `shows match header menu items while tab content loads` — passes with `PortalSlotsProvider` + `JobActionsMenuItems.Slot` in dropdown wrapper
- [x] `renders Generate match CTA when there is no jobMatch` — Generate visible (header slot or toolbar fallback)
- [x] `Regenerate exposes wizard hasExistingMatch when match is rendered` — unchanged behavior
- [ ] (Optional) clicking preference on `MatchItemCard` opens `PreferencesDialog` when not mocked to null

### Integration Tests

- [x] All existing `MatchTabContent` describe block tests pass without `JobDetailsHeaderProvider` mock

## Success Criteria

- Zero imports from `useJobDetailsHeader` in `MatchTabContent.tsx`
- Preferences dialog opens from Actions menu and from match item card
- Test coverage >= 80% on changed files
- All tests passing

## Completion notes

Menu items use `<JobActionsMenuItems>` from `job-details-actions-menu.tsx` (context outlet, not portal) after Radix mitigation. Generate button remains on `JobHeaderActions` portal slot.
