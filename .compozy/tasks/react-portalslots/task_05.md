---
status: completed
title: Remove obsolete header provider files
type: refactor
complexity: low
dependencies:
  - task_03
  - task_04
---

# Task 05: Remove obsolete header provider files

## Overview

Delete the custom job details header context/provider stack once layout and Match tab use portal slots. Ensure no remaining imports reference the removed modules.

<critical>
- ALWAYS READ the PRD before starting
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — grep + typecheck confirm no dangling imports
</critical>

<requirements>
- MUST delete `apps/web/src/modules/jobs/details/components/JobDetailsHeaderProvider.tsx`
- MUST delete `apps/web/src/modules/jobs/details/components/JobDetailsHeaderMatchMenuItems.tsx`
- MUST delete `apps/web/src/modules/jobs/details/hooks/job-details-header.context.ts`
- MUST delete `apps/web/src/modules/jobs/details/hooks/useJobDetailsHeader.ts`
- MUST verify zero remaining imports of deleted symbols across `apps/web`
- SHOULD run `pnpm --filter @job-tracker/web lint` to catch unused imports elsewhere
</requirements>

## Subtasks

- [x] 5.1 Delete the four obsolete files
- [x] 5.2 Grep for `JobDetailsHeader`, `useJobDetailsHeader`, `useJobMatchHeaderPortalTarget`, `useOpenMatchPreferences`
- [x] 5.3 Fix any stray references found outside deleted files
- [x] 5.4 Run typecheck and targeted tests

## Implementation Details

Files removed by this task were the entire custom portal/context solution:

| File                                 | Role                                      |
| ------------------------------------ | ----------------------------------------- |
| `JobDetailsHeaderProvider.tsx`       | Context provider wrapping layout          |
| `JobDetailsHeaderMatchMenuItems.tsx` | Match dropdown items via context          |
| `job-details-header.context.ts`      | Context type + createContext              |
| `useJobDetailsHeader.ts`             | Hook + portal target + preferences opener |

Replacement: `job-details-header.slots.ts` + `react-portalslots`.

### Relevant Files

- `apps/web/src/modules/jobs/details/components/JobDetailsHeaderProvider.tsx` — **delete**
- `apps/web/src/modules/jobs/details/components/JobDetailsHeaderMatchMenuItems.tsx` — **delete**
- `apps/web/src/modules/jobs/details/hooks/job-details-header.context.ts` — **delete**
- `apps/web/src/modules/jobs/details/hooks/useJobDetailsHeader.ts` — **delete**

### Dependent Files

- Any file still importing deleted modules — must be fixed before task completes

## Deliverables

- Four files deleted
- No references to deleted symbols in codebase
- Typecheck and lint clean **(REQUIRED)**

## Tests

### Unit Tests

- [x] `pnpm --filter @job-tracker/web test MatchTabContent` still passes
- [x] `pnpm --filter @job-tracker/web test JobDetailsLayout` still passes (if applicable)

### Integration Tests

- [x] Repo grep returns no hits for `JobDetailsHeaderProvider` or `useJobDetailsHeader`

## Success Criteria

- Dead code removed with no broken imports
- All tests passing
