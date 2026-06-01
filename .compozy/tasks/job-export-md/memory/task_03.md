# Task Memory: task_03.md

## Objective Snapshot

Mount ExportJobMdMenuItem in JobDetailsLayout Actions dropdown before separator.

## Important Decisions

- Placed before DropdownMenuSeparator (before "Remove") per task spec
- Passes `job` directly from `useJobDetailsViewModel` result — already available in layout scope

## Learnings

## Files / Surfaces

- `apps/web/src/modules/jobs/details/page/JobDetailsLayout.tsx` — import + mount

## Errors / Corrections

## Ready for Next Run
