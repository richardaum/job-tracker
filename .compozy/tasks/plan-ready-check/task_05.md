---
status: completed
title: UI — ReadyCheckDialog + StepCard badge
type: web
complexity: medium
dependencies:
  - task_01
---

# Task 05: UI — ReadyCheckDialog + StepCard badge

## Overview

Add a `ReadyCheckDialog` component to the plan editor (`apps/web/src/modules/sources/page/plan-editor/`) following the same pattern as `PaginationDialog` and `SkipDialog`. Wire it into `PlanDocumentEditorPage` with state management and add a badge in `StepCard` to toggle the dialog.

<critical>
- Read the TechSpec before starting: `_techspec.md` in this directory
- Follow the exact same pattern as `PaginationDialog.tsx` and `SkipDialog.tsx`
- Reference `PaginationDialog` for the toggle enable/disable pattern
- The types in `types.ts` must mirror the zod schema from task_01
</critical>

<requirements>
- MUST create `ReadyCheckDialog.tsx` with props: `step: Step`, `open: boolean`, `onOpenChange: () => void`, `onSave: (step: Step) => void`
- MUST follow the same dialog pattern: toggle enable/disable checkbox, conditional fields when enabled, `Dialog.BottomActions` with Cancel + Save
- MUST add `ReadyCheck` type to `types.ts` mirroring the plan-schemas `ReadyCheckConfig` shape
- MUST add `readyCheck?: ReadyCheck` to the `CollectJobsInput` type in `types.ts`
- MUST add a badge "ready check on/off" in `StepCard.tsx` (intent `"warning"` when active, `"default"` when inactive)
- MUST wire `editingReadyCheck` state in `PlanDocumentEditorPage.tsx` with handler + dialog rendering (same pattern as `editingPagination`/`editingSkip`)
- MUST set `readyCheck: undefined` when toggle is disabled (same pattern as `pagination: undefined`)
- MUST use "Ready Check" as the human-readable label
</requirements>

## Subtasks

- [x] Add `ReadyCheck` type to `types.ts` and wire into `CollectJobsInput`
- [x] Create `ReadyCheckDialog.tsx` with all form fields (selector, mode, value, timeouts)
- [x] Add badge "ready check on/off" to `StepCard.tsx` for `collect.jobs` steps
- [x] Wire `editingReadyCheck` state + dialog rendering in `PlanDocumentEditorPage.tsx`
- [x] Run typecheck + lint on web package

## Implementation Details

**Files to create:**

- `apps/web/src/modules/sources/page/plan-editor/ReadyCheckDialog.tsx`

**Files to modify:**

- `apps/web/src/modules/sources/page/plan-editor/types.ts` — Add `ReadyCheck` type and add to `CollectJobsInput`
- `apps/web/src/modules/sources/page/plan-editor/StepCard.tsx` — Add badge
- `apps/web/src/modules/sources/page/PlanDocumentEditorPage.tsx` — Add state + handler + dialog render

**ReadyCheck type** (in types.ts):

```typescript
export type ReadyCheck = {
  selector: string;
  mode?: "text";
  value?: string;
  resolveTimeoutMs?: number;
  watchTimeoutMs?: number;
  pollIntervalMs?: number;
};
```

**ReadyCheckDialog** pattern (follow PaginationDialog exactly):

- `enabled` state derived from `step.action.input.readyCheck`
- Form fields shown only when enabled
- `mergeIntoStep` clones step with `readyCheck: enabled ? draft : undefined`
- Text fields for selector, value; number fields for timeouts

**StepCard badge** (follow pagination/skip pattern):

```tsx
<Tooltip content="Ready Check (wait for page to stabilize)">
  <button type="button" onClick={() => onEditReadyCheck?.(step)}>
    <Badge intent={i.readyCheck ? "warning" : "default"} className={cn("text-xs cursor-pointer ...")}>
      {i.readyCheck ? "ready check on" : "ready check off"}
    </Badge>
  </button>
</Tooltip>
```

### Relevant Files

- `apps/web/src/modules/sources/page/plan-editor/PaginationDialog.tsx` — Pattern to follow
- `apps/web/src/modules/sources/page/plan-editor/SkipDialog.tsx` — Pattern to follow
- `apps/web/src/modules/sources/page/plan-editor/StepCard.tsx` — Add badge
- `apps/web/src/modules/sources/page/plan-editor/types.ts` — Add types
- `apps/web/src/modules/sources/page/PlanDocumentEditorPage.tsx` — Wire dialog

### Dependent Files

- None (UI-only change, no backend or extension changes)

## Deliverables

- New `ReadyCheckDialog.tsx` component
- Updated `types.ts` with `ReadyCheck` type
- Updated `StepCard.tsx` with badge
- Updated `PlanDocumentEditorPage.tsx` with state + handler + dialog

## Tests

No tests for this task — plan-editor has no existing test setup for legacy dialogs.

### Unit Tests

- N/A (no existing dialog tests in plan-editor)

## Success Criteria

- `pnpm --filter @job-tracker/web run typecheck` passes
- `pnpm --filter @job-tracker/web run lint` passes
- Badge appears in StepCard for collect.jobs steps
- Dialog opens, fields work, save correctly sets/unsets readyCheck
