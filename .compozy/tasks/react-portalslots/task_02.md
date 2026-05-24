---
status: completed
title: Define job details header portal slots
type: frontend
complexity: low
dependencies:
  - task_01
---

# Task 02: Define job details header portal slots

## Overview

Create a co-located slots module that exports two named portal slot pairs for the job details header: one for the primary header action (Generate/Regenerate) and one for Match-specific Actions dropdown items. This replaces the bespoke `JobDetailsHeaderContext` contract with a reusable, typed slot API.

<critical>
- ALWAYS READ the PRD before starting
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — slot module is thin; verification via consuming tasks' tests
</critical>

<requirements>
- MUST create `apps/web/src/modules/jobs/details/job-details-header.slots.ts`
- MUST export `JobHeaderActions` via `PortalSlot('job-header-actions')` (or equivalent semantic name)
- MUST export `JobActionsMenuItems` via `PortalSlot('job-actions-menu-items')`
- MUST import `PortalSlot` from `react-portalslots`
- SHOULD keep slot names stable and semantic — they are the contract between layout and tab content
- MUST NOT wire slots into layout or tab content in this task (tasks 03–04)
</requirements>

## Subtasks

- [x] 2.1 Create `job-details-header.slots.ts` next to job details module
- [x] 2.2 Define `JobHeaderActions` slot pair (`.Slot` + portal component)
- [x] 2.3 Define `JobActionsMenuItems` slot pair
- [x] 2.4 Export both from the slots file (no barrel reexport unless project convention requires)

## Implementation Details

Use the `react-portalslots` factory pattern:

```tsx
import { PortalSlot } from "react-portalslots";

export const JobHeaderActions = PortalSlot("job-header-actions");
export const JobActionsMenuItems = PortalSlot("job-actions-menu-items");
```

Layout will render `<JobHeaderActions.Slot />` and `<JobActionsMenuItems.Slot />`. Tab content will wrap contributions in `<JobHeaderActions>...</JobHeaderActions>` and `<JobActionsMenuItems>...</JobActionsMenuItems>`.

See PRD requirements 2–3 and library docs: `PortalSlotsProvider` + `PortalSlot(name)`.

### Relevant Files

- `apps/web/src/modules/jobs/details/job-details-header.slots.ts` — **create**

### Dependent Files

- `apps/web/src/modules/jobs/details/page/JobDetailsLayout.tsx` — will import slots in task 03
- `apps/web/src/modules/jobs/details/components/MatchTabContent.tsx` — will import slots in task 04

### Related ADRs

- None specific to portal slots; aligns with match-as-tab layout in `match-details-as-tab` ADRs (header actions owned by Match tab, not global job header logic)

## Deliverables

- New `job-details-header.slots.ts` with two exported slot pairs
- `pnpm --filter @job-tracker/web typecheck` passes **(REQUIRED)**

## Tests

### Unit Tests

- [x] No dedicated unit test file required for the factory-only module

### Integration Tests

- [x] Typecheck confirms `PortalSlot` exports are valid React components

## Success Criteria

- Both slot pairs exported from a single co-located file
- Slot names documented in file or PRD-aligned naming
- All tests passing

## Completion notes

`JobActionsMenuItems` was later moved out of portal slots to `job-details-actions-menu.tsx` (task 06 mitigation) because Radix `DropdownMenuItem` cannot be portaled without losing Menu context.
