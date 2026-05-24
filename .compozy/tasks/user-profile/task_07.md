---
status: completed
title: "Extract WorkPreferencesEditor + Preferences tab"
type: frontend
complexity: medium
dependencies: [task_04]
---

# Task 07: Extract WorkPreferencesEditor + Preferences tab

## Overview

Extract the form logic (state, CRUD, mutation) from `PreferencesDialog` into a standalone `WorkPreferencesEditor` component with dual `mode` ("inline" | "dialog"). The existing `PreferencesDialog` becomes a thin wrapper. Create `PreferencesTabPage` using `WorkPreferencesEditor mode="inline"` for the `/profile/preferences` tab.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `WorkPreferencesEditor` at `apps/web/src/modules/work-preferences/components/WorkPreferencesEditor.tsx`
- MUST support `mode: "inline" | "dialog"` prop — inline renders form directly, dialog renders inside a Dialog shell
- MUST support `readOnly?: boolean` prop (disables add/edit/delete)
- MUST support `onClose?: () => void` prop (only relevant in dialog mode)
- MUST extract all form state management from `PreferencesDialog`: `useWorkPreferencesQuery`, `useUpdateWorkPreferencesMutation`, `localItems`, `focusedId`, `saving`, CRUD operations
- MUST handle loading, empty, and error states
- MUST update `PreferencesDialog.tsx` to become a thin wrapper: `<Dialog><WorkPreferencesEditor mode="dialog" readOnly={readOnly} onClose={...} /></Dialog>`
- MUST NOT change the existing 3 modal call sites (ResumesPage, MatchAnalysisPage × 2)
- MUST create `PreferencesTabPage` at `apps/web/src/modules/profile/preferences/page/PreferencesTabPage.tsx` using `WorkPreferencesEditor mode="inline"`
- MUST update `/profile/preferences/page.tsx`

## Subtasks

- [ ] 7.1 Read `PreferencesDialog.tsx` thoroughly — understand state, mutations, CRUD, rendering
- [ ] 7.2 Create `WorkPreferencesEditor.tsx` with extracted form logic
- [ ] 7.3 Implement "inline" mode: embedded header ("Work Preferences" + description), form body, footer (Add + Save/Cancel)
- [ ] 7.4 Implement "dialog" mode: render content only (Dialog shell handled by wrapper)
- [ ] 7.5 Implement `readOnly` mode (disable inputs, hide add/delete buttons)
- [ ] 7.6 Update `PreferencesDialog.tsx` to thin wrapper
- [ ] 7.7 Create `PreferencesTabPage.tsx` with inline mode
- [ ] 7.8 Update `/profile/preferences/page.tsx`

## Implementation Details

See TechSpec § Frontend — Work Preferences Tab and ADR-005 for component interface and mode behavior.

The extraction moves ~300 lines from `PreferencesDialog` into `WorkPreferencesEditor`. The Dialog wrapper keeps only: `<Dialog open={open} onOpenChange={onOpenChange} title="Work Preferences" description="..."><WorkPreferencesEditor mode="dialog" readOnly={readOnly} onClose={() => onOpenChange(false)} /></Dialog>`.

Inline mode: renders its own header row ("Work Preferences" as heading + description text), the preference item list, and footer with "Add preference" button + "Save changes" / "Cancel" buttons.

### Relevant Files

- `apps/web/src/modules/work-preferences/components/PreferencesDialog.tsx` — source component to extract from (~349 lines)
- `apps/web/src/modules/resumes/list/page/ResumesPage.tsx` — uses `<PreferencesDialog>` (call site 1)
- `apps/web/src/modules/match-analysis/pages/MatchAnalysisPage.tsx` — uses `<PreferencesDialog>` (call sites 2 and 3)
- `apps/web/src/app/(authenticated)/profile/preferences/page.tsx` — route re-export

### Dependent Files

- `apps/web/src/modules/work-preferences/components/PreferencesDialog.tsx` — modified to thin wrapper

### Related ADRs

- [ADR-005: Work Preferences Dual-Mode Component](../adrs/adr-005.md) — Extraction decision, `mode: "inline" | "dialog"`, Props interface

## Deliverables

- `apps/web/src/modules/work-preferences/components/WorkPreferencesEditor.tsx`
- Updated `apps/web/src/modules/work-preferences/components/PreferencesDialog.tsx` (thin wrapper)
- `apps/web/src/modules/profile/preferences/page/PreferencesTabPage.tsx`
- Updated `apps/web/src/app/(authenticated)/profile/preferences/page.tsx`

## Tests

Tests written in task_11. Requirements:

- Component test (`WorkPreferencesEditor.test.tsx`):
  - [ ] Inline mode: renders form directly (no Dialog shell)
  - [ ] Inline mode: renders header, item list, and footer buttons
  - [ ] Dialog mode: renders inside Dialog (when wrapped by PreferencesDialog)
  - [ ] Add item: new empty row appears
  - [ ] Edit item text: input updates local state
  - [ ] Change item weight: dropdown selects High/Low
  - [ ] Remove item: row disappears
  - [ ] Save: calls `updateWorkPreferences` mutation with filtered items
  - [ ] Cancel: discards local changes
  - [ ] ReadOnly mode: no add/delete buttons, inputs disabled
  - [ ] Loading state: shows skeleton or spinner
  - [ ] Empty state: shows "No preferences yet" message
- Component test (`PreferencesTabPage.test.tsx`):
  - [ ] Renders `WorkPreferencesEditor` with `mode="inline"`
- Test coverage target: >=80%

## Success Criteria

- Existing modal consumers (ResumesPage, MatchAnalysisPage) still work unchanged
- `/profile/preferences` renders inline editor
- Add/edit/delete/save/cancel all work in inline mode
- ReadOnly mode works in both inline and dialog modes
- `pnpm --filter web typecheck` passes
- `pnpm lint` passes
