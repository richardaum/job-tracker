---
status: completed
title: Sidebar trial quota trackbar
type: web
complexity: low
dependencies:
  - task_11
---

# Task 14: Sidebar trial quota trackbar

## Overview

Show remaining AI trial quota in the sidebar while a user hasn't configured a personal key, per PRD "Core Features" #6. The trackbar disappears entirely once `hasOpenAiKey` is true, since trial quota no longer applies at that point.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST render a trackbar in `Sidebar.tsx` reflecting `trialCallsUsed` / `trialCallsLimit` from the `settings` query (task_09/task_11), only when `hasOpenAiKey` is `false`.
- MUST hide the trackbar entirely (not just visually disable it) when `hasOpenAiKey` is `true`.
- MUST update the displayed value when `trialCallsUsed` changes (e.g., after navigating back from an AI action), consistent with the existing sidebar's data-fetching pattern.
- SHOULD position the trackbar near the existing user info/bottom section of the sidebar, consistent with where account-related indicators already live.
</requirements>

## Subtasks

- [x] 14.1 Add a query/hook usage in `Sidebar.tsx` (or a wrapping component) to read `trialCallsUsed`, `trialCallsLimit`, `hasOpenAiKey`
- [x] 14.2 Render the trackbar conditionally on `hasOpenAiKey === false`
- [x] 14.3 Style the trackbar consistent with existing sidebar visual language
- [x] 14.4 Write tests for the visible/hidden states

## Implementation Details

See TechSpec "System Architecture" ("Frontend Sidebar (modified)") and PRD "Core Features" #6 / "User Experience" for exact behavior. `apps/web/src/modules/navigation/components/Sidebar.tsx` currently renders `navItems`/`bottomItems` arrays — the trackbar is a new block, not a nav item.

### Relevant Files

- `apps/web/src/modules/navigation/components/Sidebar.tsx` — main file modified
- `apps/web/src/gql/hooks.ts` — generated `useSettingsQuery` (or equivalent) providing the needed fields (from task_11)

### Dependent Files

- None — this is a self-contained, additive UI change

## Deliverables

- Sidebar trackbar component, conditionally rendered
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for the visible/hidden transition **(REQUIRED)**

## Tests

- Unit tests:
  - [x] Trackbar renders with correct used/limit values when `hasOpenAiKey` is `false`
  - [x] Trackbar does not render at all when `hasOpenAiKey` is `true`
  - [x] Trackbar reflects an updated `trialCallsUsed` value after a settings refetch
- Integration tests:
  - [x] Sidebar renders the trackbar for a user without a key, then the trackbar disappears immediately after a `saveOpenAiKey` mutation succeeds (mocked) and `hasOpenAiKey` flips to `true`
- Test coverage target: >=80%
- [x] All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Manual verification in the browser: trackbar appears during trial, disappears immediately after a key is configured, matching PRD "Success Metrics" ("zero cases of it persisting after a key is set")
