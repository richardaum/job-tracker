---
status: completed
title: "SettingsTabPage — OpenAI key field and AI-enabled toggle"
type: web
complexity: medium
dependencies:
  - task_11
---

# Task 12: SettingsTabPage — OpenAI key field and AI-enabled toggle

## Overview

Add the two new Profile Settings controls the PRD requires: the OpenAI key field (save/replace/remove, with a lock icon and tooltip once a key is stored) and the independent AI-enabled toggle, both following the existing `SettingCard` patterns already used for `autoFillEnabled`/`duplicateWindowDays`.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add an AI-enabled `Switch` control using the same optimistic-update pattern as the existing `autoFillEnabled`/`autoSummaryEnabled`/`autoMatchEnabled` toggles in `SettingsTabPage.tsx` (`pendingField` state, `useUpdateSettingsMutation`, `buildOptimisticSettings`).
- MUST add an OpenAI key input field using the existing numeric-field pattern (local draft state, dirty check, explicit Save button) as its structural basis, adapted for a masked/password-style text input.
- MUST call `useSaveOpenAiKeyMutation` on save and surface the `AI_KEY_INVALID` error inline near the field (not via the global blocked-action modal from task_13 — this is a form validation error, not an AI-blocked-action error).
- MUST show a "Remove" action when `hasOpenAiKey` is `true`, calling `useRemoveOpenAiKeyMutation`.
- MUST never render the raw key value — the field shows a masked placeholder (e.g., "••••••••") when `hasOpenAiKey` is `true`, never the actual stored value.
- MUST render a lock icon with a tooltip ("stored encrypted, used only for your own requests" — see PRD "Core Features" #1) next to the field whenever `hasOpenAiKey` is `true`.
- SHOULD reuse the existing `SettingCard`/`SettingCardLabel` components (`apps/web/src/modules/profile/settings/components/SettingCard.tsx`) for both new controls.
</requirements>

## Subtasks

- [ ] 12.1 Add the AI-enabled `Switch` control with optimistic update
- [ ] 12.2 Add the OpenAI key field (masked display, save, inline validation error)
- [ ] 12.3 Add the "Remove key" action
- [ ] 12.4 Add the lock icon + tooltip shown when `hasOpenAiKey` is true
- [ ] 12.5 Extend `SettingsTabPage.test.tsx` for the two new controls

## Implementation Details

See TechSpec "System Architecture" ("Frontend SettingsTabPage (modified)") and PRD "User Experience"/"Core Features" #1 and #6 for the exact copy and behavior. Reuse `apps/web/src/modules/profile/settings/page/SettingsTabPage.tsx`'s existing `Switch` optimistic pattern and numeric-field save pattern as direct templates — do not invent a new state-management approach for this page.

### Relevant Files

- `apps/web/src/modules/profile/settings/page/SettingsTabPage.tsx` — main file modified
- `apps/web/src/modules/profile/settings/components/SettingCard.tsx` — reused component
- `apps/web/src/modules/profile/settings/page/SettingsTabPage.test.tsx` — existing test file to extend
- `apps/web/src/gql/hooks.ts` — generated hooks consumed here (from task_11)

### Dependent Files

- None outside this module — this task does not affect other pages

## Deliverables

- OpenAI key field with save/replace/remove and lock icon/tooltip
- AI-enabled toggle
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for the save/remove/toggle flows **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] Toggling AI-enabled calls `useUpdateSettingsMutation` with `{ aiEnabled: <new value> }` and reflects the change optimistically
  - [ ] Saving a valid key calls `useSaveOpenAiKeyMutation` and, on success, the field switches to masked display with the lock icon and tooltip visible
  - [ ] Saving an invalid key shows the inline validation error and the field does NOT switch to masked/saved state
  - [ ] Clicking "Remove" calls `useRemoveOpenAiKeyMutation` and the field returns to its empty/unset state, lock icon disappears
- Integration tests:
  - [ ] Full save → masked display → remove → empty state cycle for the key field, using React Testing Library and mocked Apollo responses
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- The raw key value is never rendered to the DOM at any point after save, verified by test assertions
- Manual verification in the browser: key field, toggle, and lock icon/tooltip behave as described in PRD "User Experience"
