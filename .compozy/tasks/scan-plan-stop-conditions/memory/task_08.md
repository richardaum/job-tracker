# Task Memory: task_08.md

## Objective Snapshot

Add Stop Condition configuration section to SourceTemplate create and edit UI.

## Important Decisions

- Used `SourceStopConfigDialog` pattern (edit dialog, like `SourceScheduleDialog`) + inline section in `NewSourceTemplateDialog`
- `config` field was missing from `SourceTemplateType` GraphQL type and `schema.gql` — added it
- `config` already existed in create/update inputs (TS + schema.gql), entity, service, and repository from task_03
- Used exact placeholder text matches in tests (`"e.g. 5"` instead of regex `/e\.g\. 5/i`) to avoid matching partial text (e.g. "e.g. 3" matching "e.g. 30")

## Learnings

- schema.gql is manually patched (API cannot start due to pre-existing migration failure)
- Radix UI Select in jsdom tests: fireEvent.click + getByText works for opening dropdown, but CatchUp appears both in trigger and portal (since it's the default value)
- The `-t` flag for vitest may not work reliably to filter specific tests when multiple test files are discovered

## Files / Surfaces

- `apps/api/src/domains/sources/source-template.type.ts` — added `config` field
- `apps/api/src/schema.gql` — added `config: JSON` to `SourceTemplateType`
- `apps/web/src/graphql/sources.graphql` — added `config` to all queries/mutations
- `apps/web/src/gql/` — regenerated via codegen
- `apps/web/src/modules/sources/page/SourceStopConfigDialog.tsx` — NEW: stop config edit dialog
- `apps/web/src/modules/sources/page/SourceStopConfigDialog.test.tsx` — NEW: 7 tests (all pass)
- `apps/web/src/modules/sources/page/NewSourceTemplateDialog.tsx` — ADDED: stop config section
- `apps/web/src/modules/sources/page/NewSourceTemplateDialog.test.tsx` — NEW: 5 tests (all pass)
- `apps/web/src/modules/sources/page/PlanTemplatesList.tsx` — ADDED: stop config icon button + dialog

## Errors / Corrections

- Fix: placeholder text regex matching "e.g. 30" when searching for "e.g. 3" — switched to exact string matching
- Fix: syntax error in test file due to misplaced closing brackets from copy-paste
- Fix: removed `userEvent` import accidentally when cleaning up unused imports

## Ready for Next Run

Task 08 complete. All tests pass for new files (7 SourceStopConfigDialog + 5 NewSourceTemplateDialog). Pre-existing failures in SettingsTabPage, PasteDestinationDialog, extension-events.display remain unchanged.
