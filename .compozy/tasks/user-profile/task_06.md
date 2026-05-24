---
status: completed
title: "Settings tab with GraphQL operations"
type: frontend
complexity: medium
dependencies: [task_03, task_04]
---

# Task 06: Settings tab with GraphQL operations

## Overview

Create the GraphQL operations file (`settings.graphql`) for the settings query and mutation, then build the `SettingsTabPage` component with 3 setting cards (auto-fill toggle, auto-summary toggle, duplicate window number input). All changes auto-save — toggles on change, number input on debounced blur.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `apps/web/src/graphql/settings.graphql` with `Settings` query (returns `userId`, `autoFillEnabled`, `autoSummaryEnabled`, `duplicateWindowDays`) and `UpdateSettings` mutation (accepts `input: UpdateSettingsInput!`, returns same fields)
- MUST run codegen after creating `.graphql` file: `pnpm --filter @job-tracker/web run codegen`
- MUST create `SettingsTabPage` at `apps/web/src/modules/profile/settings/page/SettingsTabPage.tsx`
- MUST render 3 setting cards with label + description (left) and control (right)
- MUST use `useSettingsQuery` and `useUpdateSettingsMutation` from generated hooks
- MUST auto-save toggles immediately on change (no explicit save button)
- MUST debounce number input changes by 500ms before calling mutation
- MUST validate duplicate window: min=1, max=365
- MUST follow existing card/list item patterns for setting cards
- MUST update `/profile/settings/page.tsx` to re-export `SettingsTabPage`

## Subtasks

- [ ] 6.1 Create `apps/web/src/graphql/settings.graphql` with query + mutation
- [ ] 6.2 Run `pnpm --filter @job-tracker/web run codegen` to generate hooks
- [ ] 6.3 Read `ListItemCard` and `Toggle` component patterns
- [ ] 6.4 Create `SettingsTabPage.tsx` with 3 setting cards
- [ ] 6.5 Implement toggle auto-save (onChange → mutation)
- [ ] 6.6 Implement debounced number input (500ms)
- [ ] 6.7 Handle loading state (skeleton or placeholder)
- [ ] 6.8 Update `/profile/settings/page.tsx`

## Implementation Details

See TechSpec § Frontend — Settings Tab and § GraphQL Schema Changes Summary.

GraphQL file pattern: follow `work-preferences.graphql` (query + mutation in same file).

Setting cards: consider using `ListItemCard` from `@job-tracker/ui` or a simple bordered `div` with flex layout. Each card: label + description (flex-1, left) | control (Toggle or Input, right).

### Relevant Files

- `apps/web/src/graphql/work-preferences.graphql` — GraphQL file pattern (query + mutation)
- `apps/web/src/gql/hooks.ts` — will contain `useSettingsQuery` and `useUpdateSettingsMutation` after codegen
- `apps/web/src/modules/resumes/list/components/ResumeCard.tsx` — `ListItemCard` pattern
- `apps/web/src/app/(authenticated)/profile/settings/page.tsx` — route re-export

### Dependent Files

None — leaf component consumed by route.

### Related ADRs

- [ADR-003: User Settings as Typed Entity](../adrs/adr-003.md) — Settings GraphQL operations and UI controls

## Deliverables

- `apps/web/src/graphql/settings.graphql`
- `apps/web/src/modules/profile/settings/page/SettingsTabPage.tsx`
- Updated `apps/web/src/app/(authenticated)/profile/settings/page.tsx`

## Tests

Tests written in task_11. Requirements:

- Component test (`SettingsTabPage.test.tsx`):
  - [ ] Renders 3 setting cards: Auto-fill, Auto-summary, Duplicate window
  - [ ] Toggle onChange calls `updateSettings` mutation with new value
  - [ ] Number input onChange debounced 500ms before mutation call
  - [ ] Number input respects min=1, max=365
  - [ ] Loading state shows skeleton/placeholder
  - [ ] Mutation error shows error state
- Test coverage target: >=80%

## Success Criteria

- `/profile/settings` renders 3 setting cards
- Toggle flip persists on page reload (auto-saved to backend)
- Duplicate window input auto-saves after 500ms of no typing
- Negative or >365 values are rejected
- `pnpm --filter web typecheck` passes
- `pnpm lint` passes
