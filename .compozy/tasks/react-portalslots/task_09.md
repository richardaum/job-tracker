---
status: pending
title: Migrate Profile shell to portal slots
type: frontend
complexity: medium
dependencies:
  - task_07
---

# Task 09: Migrate Profile shell to portal slots

## Overview

Apply the same portal slot pattern to Profile in the **profile worktree** (not `match-improvement`). Replace `ProfileHeaderActionsContext` and `useSetProfileHeaderActions` with a co-located `profile-header.slots.ts` and `PortalSlotsProvider` in `ProfileShell`.

<critical>
- ALWAYS READ the PRD before starting
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — mirror job details pattern from Fase 1
- TESTS REQUIRED — update ResumesTabPage, PreferencesTabPage, and Profile shell tests
- DEFER until Fase 1 merges to main OR run in parallel only if profile worktree is independent
</critical>

<requirements>
- MUST run in profile worktree after Fase 1 convention is on main (or rebase profile on match-improvement)
- MUST create `profile-header.slots.ts` (or equivalent) with `ProfileHeaderActions = PortalSlot('profile-header-actions')`
- MUST wrap `ProfileShell` in `PortalSlotsProvider` and render `<ProfileHeaderActions.Slot />` in header
- MUST update `ResumesTabPage` and `PreferencesTabPage` to fill `<ProfileHeaderActions>` instead of context setter
- MUST delete `ProfileHeaderActionsContext`, `useSetProfileHeaderActions`, and related provider code
- MUST update Profile tab page tests to use slot wrapper pattern (same as `MatchTabContent.test.tsx`)
- SHOULD follow naming and file placement documented in task 07 `web-ui.md` section
</requirements>

## Subtasks

- [ ] 9.1 Create `profile-header.slots.ts` co-located with Profile module
- [ ] 9.2 Refactor `ProfileShell` to slot targets + `PortalSlotsProvider`
- [ ] 9.3 Migrate `ResumesTabPage` header actions to `<ProfileHeaderActions>`
- [ ] 9.4 Migrate `PreferencesTabPage` header actions to `<ProfileHeaderActions>`
- [ ] 9.5 Remove Profile header context/hooks; update tests
- [ ] 9.6 Verify Profile smoke: tab switches clear/replace header actions correctly

## Implementation Details

**Not present in `match-improvement` worktree** — explore Profile module in profile worktree:

- `ProfileShell` — layout with header action area
- `ProfileHeaderActionsContext` / `useSetProfileHeaderActions` — to remove
- `ResumesTabPage`, `PreferencesTabPage` — currently set header via context effect

Mirror job details migration:

| Job details (done)            | Profile (this task)       |
| ----------------------------- | ------------------------- |
| `job-details-header.slots.ts` | `profile-header.slots.ts` |
| `JobDetailsLayout` + slots    | `ProfileShell` + slots    |
| `MatchTabContent` fills slots | Tab pages fill slots      |

See PRD Fase 3 and task 07 convention doc.

### Relevant Files

- Profile worktree: `ProfileShell` (exact path TBD in profile worktree)
- Profile worktree: `ResumesTabPage`, `PreferencesTabPage`
- Profile worktree: context/hook files to delete

### Dependent Files

- `.agents/rules/frontend/web-ui.md` — convention reference (task 07)

## Deliverables

- Profile uses portal slots; no custom header actions context
- Profile tab tests updated and passing
- Separate PR from Fase 1 job details work

## Tests

### Unit Tests

- [ ] Resumes tab: header action button renders in Profile header slot area
- [ ] Preferences tab: header action renders when tab active
- [ ] Switching tabs: previous tab's portaled actions unmount (no stale buttons)

### Integration Tests

- [ ] `pnpm --filter @job-tracker/web test` for Profile-related test files passes
- [ ] Manual Profile smoke across tabs

## Success Criteria

- Zero references to `ProfileHeaderActionsContext` / `useSetProfileHeaderActions`
- Profile and Job details share documented slot convention
- All tests passing
- Optional: can ship as follow-up PR after Fase 1 merge
