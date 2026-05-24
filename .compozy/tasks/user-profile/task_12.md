---
status: completed
title: "Header actions portal + cleanup Resumes tab"
type: frontend
complexity: medium
dependencies: [task_08, task_10]
---

# Task 12: Header actions portal + cleanup Resumes tab

## Overview

Add a `headerActions` portal to `ProfileShell` (matching `JobDetailsPage` pattern: `BackToLink` left, actions right). Move the "Add resume" button from `ResumesTabPage`'s action bar into the header. Remove the "Work Preferences" quick-access button from the Resumes tab (the modal is still available elsewhere).

<requirements>
- MUST add `headerActions` slot to `ProfileShell` header (right-aligned, same row as `BackToLink`)
- MUST create a context/hook for tab pages to set header actions
- MUST move "Add resume" button from `ResumesTabPage` action bar to ProfileShell header
- MUST remove "Work Preferences" button and `PreferencesDialog` from `ResumesTabPage`
- MUST remove the old action bar div from `ResumesTabPage`
- MUST follow `JobDetailsPage` header pattern: `justify-between` row with BackToLink left + actions right
</requirements>

## Subtasks

- [ ] 12.1 Create `ProfileHeaderActionsContext` and `useSetProfileHeaderActions` hook
- [ ] 12.2 Update `ProfileShell` to render `headerActions` in justify-between row
- [ ] 12.3 Update `ResumesTabPage`: remove action bar, move "Add resume" to header, remove Work Preferences
- [ ] 12.4 Verify typecheck + lint

## Deliverables

- Updated `apps/web/src/modules/profile/layout/page/ProfileShell.tsx`
- New context/hook at `apps/web/src/modules/profile/layout/hooks/useProfileHeaderActions.ts`
- Updated `apps/web/src/modules/profile/resumes/page/ResumesTabPage.tsx`

## Success Criteria

- "Add resume" button appears in ProfileShell header (right-aligned, same row as BackToLink) when on Resumes tab
- "Work Preferences" quick-access button removed from Resumes tab
- Action bar div removed from ResumesTabPage
- Other tabs (Identity, Settings, Preferences) show no extra actions in header
- `pnpm --filter web typecheck` passes
- `pnpm lint` passes
