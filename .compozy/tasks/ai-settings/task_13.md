---
status: completed
title: Apollo aiBlockedLink and AiBlockedDialog
type: web
complexity: medium
dependencies:
  - task_04
  - task_10
  - task_11
---

# Task 13: Apollo aiBlockedLink and AiBlockedDialog

## Overview

Implement the frontend mirror of the backend's centralized gating (task_04/task_06): a single Apollo error link that catches `AI_DISABLED_BY_USER`/`AI_KEY_REQUIRED` anywhere in the app and opens one shared dialog, so none of the 9 AI-triggering components need their own error handling for this case.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST implement an Apollo `onError`-based link (`aiBlockedLink`) that inspects `graphQLErrors[].extensions.code` for `AI_DISABLED_BY_USER` or `AI_KEY_REQUIRED` (from task_04) and opens `AiBlockedDialog` with copy matching PRD "User Experience" for each case.
- MUST add this link to the existing Apollo client's link chain without altering the behavior of errors that are not one of these two codes (they must pass through unchanged to existing per-component error handling).
- MUST build `AiBlockedDialog` on the existing `packages/ui` `Dialog` component (no new dialog primitive).
- MUST include a button/link in the dialog navigating to `/profile/settings`.
- MUST distinguish the two messages: "AI is turned off for your account" for `AI_DISABLED_BY_USER`, and "Your AI trial is over — add your own OpenAI key to keep using AI features" for `AI_KEY_REQUIRED`, per PRD "User Experience".
- MUST expose a way to open the dialog from outside the React tree (the error link is not a component), e.g. a small shared UI-state store/context, per TechSpec ADR-004 "Negative Consequences" note.
- MUST NOT add per-component try/catch handling for these two error codes in any of the 9 AI-triggering components — this task is the only place this logic lives.
</requirements>

## Subtasks

- [ ] 13.1 Implement `aiBlockedLink` Apollo error link matching on the two error codes
- [ ] 13.2 Implement the shared open/close state mechanism reachable from outside React components
- [ ] 13.3 Build `AiBlockedDialog` on `packages/ui` `Dialog` with the two distinct message variants and a link to Settings
- [ ] 13.4 Wire `aiBlockedLink` into the existing Apollo client link chain
- [ ] 13.5 Write tests confirming non-AI errors pass through untouched

## Implementation Details

See TechSpec "System Architecture" ("Frontend aiBlockedLink (new Apollo Link)") and ADR-004 for the rationale and the shared-state requirement. Reference `packages/ui/src/components/Dialog/Dialog.tsx` and an existing consumer (e.g. `MatchWizardDialog.tsx`) as the structural template for `AiBlockedDialog`.

### Relevant Files

- `packages/ui/src/components/Dialog/Dialog.tsx` — base component reused
- Apollo client setup file in `apps/web` (wherever the link chain is currently assembled)
- `apps/web/src/gql/hooks.ts` — source of the `extensions.code` values surfaced by mutations from tasks 04/10

### Dependent Files

- None of the 9 AI-triggering components require any change for this task — that is the point of centralizing the handling here

### Related ADRs

- [ADR-004: Centralized Frontend AI-Blocked Handling via Apollo Error Link](../adrs/adr-004.md) — this task is the concrete implementation of that decision

## Deliverables

- `aiBlockedLink` Apollo error link
- `AiBlockedDialog` component
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for at least one real AI-triggering flow **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] A GraphQL error with `extensions.code = "AI_DISABLED_BY_USER"` opens the dialog with the toggle-off message
  - [ ] A GraphQL error with `extensions.code = "AI_KEY_REQUIRED"` opens the dialog with the trial-exhausted message
  - [ ] A GraphQL error with any other code (e.g. `NOT_FOUND`) does not open the dialog and passes through to normal error handling
  - [ ] The dialog's Settings link navigates to `/profile/settings`
- Integration tests:
  - [ ] Triggering an AI chat message while mocked as `AI_DISABLED_BY_USER` opens the dialog, with no chat-specific error UI shown instead
  - [ ] Triggering a second, unrelated AI action (e.g. summary generation) while blocked also opens the same shared dialog, proving the centralized link covers multiple entry points without per-component code
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- None of the 9 AI-triggering components contain AI-blocked-specific error handling code
- The dialog correctly differentiates the two blocked reasons in manual browser verification
