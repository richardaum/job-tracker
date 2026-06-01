# Task Memory: task_05.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Create ReadyCheckDialog.tsx + StepCard badge + wire into PlanDocumentEditorPage.

## Important Decisions

- Followed PaginationDialog pattern (checkbox enable/disable, conditional fields, mergeIntoStep with undefined when disabled).
- ReadyCheck type mirrors plan-schemas ReadyCheckConfig exactly.
- Badge uses same "warning"/"default" intent pattern as skip badge.

## Learnings

- PlanDocumentEditorPage uses `replaceStep` helper shared by all dialog handlers.

## Files / Surfaces

- Created: `apps/web/src/modules/sources/page/plan-editor/ReadyCheckDialog.tsx`
- Modified: `apps/web/src/modules/sources/page/plan-editor/types.ts` (ReadyCheck type)
- Modified: `apps/web/src/modules/sources/page/plan-editor/StepCard.tsx` (onEditReadyCheck prop + badge)
- Modified: `apps/web/src/modules/sources/page/PlanDocumentEditorPage.tsx` (state + handler + dialog render)

## Errors / Corrections

None.

## Ready for Next Run

Yes — typecheck and lint both pass.
