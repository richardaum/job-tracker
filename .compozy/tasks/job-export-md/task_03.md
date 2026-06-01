---
status: completed
title: "Layout wiring: mount in Actions dropdown"
type: web
complexity: low
dependencies:
  - task_02
---

# Task 03: Layout wiring: mount in Actions dropdown

## Overview

Mount the `ExportJobMdMenuItem` component in the Job Details Actions dropdown, placed before the separator (before "Remove"). This is the final integration step — import the component and add it to the `actionsMenu` JSX in `JobDetailsLayout.tsx`.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST import and mount `ExportJobMdMenuItem` in `JobDetailsLayout.tsx`
- MUST pass `jobId` and `job` props to the component
- MUST place it in the Actions dropdown before `<DropdownMenuSeparator />`
- MUST NOT break existing menu items or slot behavior
- MUST pass lint and typecheck without errors
</requirements>

## Subtasks

- [x] 03.1 Import `ExportJobMdMenuItem` in `JobDetailsLayout.tsx`
- [x] 03.2 Add the component instance inside the Actions dropdown JSX
- [x] 03.3 Pass job data from the view-model hook
- [x] 03.4 Run lint and typecheck to confirm no regressions

## Implementation Details

Modify `apps/web/src/modules/jobs/details/page/JobDetailsLayout.tsx`:

1. Add import for `ExportJobMdMenuItem`
2. Inside the `actionsMenu` JSX block (the `<DropdownMenu>`), add `<ExportJobMdMenuItem jobId={id} job={job} />` before the separator (line 297: `<DropdownMenuSeparator />`)

### Relevant Files

- `apps/web/src/modules/jobs/details/page/JobDetailsLayout.tsx` — file to modify
- `apps/web/src/modules/jobs/details/components/ExportJobMdMenuItem.tsx` — component to import

### Dependent Files

- None. This is the final integration point.

## Deliverables

- Modified `apps/web/src/modules/jobs/details/page/JobDetailsLayout.tsx`
- Lint and typecheck passing

## Tests

No new tests needed for this task — the integration is a thin wiring change. Existing tests for `JobDetailsLayout` and `ExportJobMdMenuItem` cover the behavior.

## Success Criteria

- Build passes (`pnpm lint && pnpm typecheck`)
- "Export as Markdown" appears in the Actions dropdown on the Job Details page
- Clicking the item fetches notes + stage events and downloads the `.md` file
