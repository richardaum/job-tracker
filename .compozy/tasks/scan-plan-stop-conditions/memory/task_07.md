# Task Memory: task_07.md

## Objective Snapshot

Add mandatory Board Type dropdown (Sequential / NonSequential) to the Plan create form (ImportPlanDialog) and edit form (PlanDocumentTabContent). Value is written into the plan's `document` JSONB as `boardType`.

## Important Decisions

- Board type values are exact strings "Sequential" and "NonSequential" matching the extension's PlanSchema enum
- In create form: boardType is injected into document on submit via spread `{ ...parsed.value, boardType }`
- In edit form: boardType tracked via separate state, merged into documentRef on save via spread
- Create form uses controlled Select with validation (disabled button when not selected)
- Edit form reads existing boardType from `plan.document.boardType` on load via useEffect

## Learnings

- jsdom tests need `hasPointerCapture` stub for Radix Select
- `React.use(params)` with Promise in jsdom tests requires synchronously-resolved thenable (syncParamsResolved) to avoid Suspense
- PlanDocumentTabContent uses PortalSlots (PlanHeaderActions, PlanTabDescription) which need SlotsProvider + slot targets in test wrappers
- Board type validation in create form is enforced at the disabled button level, not via error message

## Files / Surfaces

- `apps/web/src/modules/sources/page/ImportPlanDialog.tsx` — added boardType state, Select UI, injection into document on save
- `apps/web/src/modules/sources/page/PlanDocumentTabContent.tsx` — added boardType state + Select, merge into document on save, read from existing document on load
- `apps/web/src/modules/sources/page/ImportPlanDialog.test.tsx` — 4 tests
- `apps/web/src/modules/sources/page/PlanDocumentTabContent.test.tsx` — 3 tests

## Errors / Corrections

## Ready for Next Run
