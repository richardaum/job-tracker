# Task Memory: task_04.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Implemented count badges in QuickFilters using `useQuickFilterCountsQuery` and added `QuickFilterCountsDocument` to `refetchQueries` in 3 mutation components. All tests pass.

## Important Decisions

- FILTER_COUNT_KEY_MAP maps API PascalCase enum keys to lowercase chip keys. Rejected is intentionally not mapped — not in QUICK_FILTERS array. All-count sum includes all entries (including unmapped ones like Rejected) for accuracy.
- Badge rendered as `{count > 0 && <span> ({count})</span>}` inline in FilterChip children — no prop changes to FilterChip.

## Learnings

- Existing test files that mock `@/gql/hooks` must also export `QuickFilterCountsDocument` and `useQuickFilterCountsQuery` — 2 files needed updates.
- Lint and typecheck both clean with zero errors.

## Files / Surfaces

- Modified: QuickFilters.tsx, DeleteJobDialog.tsx, JobQuickEditDialog.tsx, PasteListenerProvider.tsx, QuickFilters.test.tsx
- Fixed test mocks: PasteListenerProvider.test.tsx, JobsPage.test.tsx

## Errors / Corrections

- Initial "All" count was 18 instead of 22 because Rejected entries were excluded from allCount (bug: allCount was gated behind `if (chipKey)`). Fixed by moving allCount outside the if.
- PasteListenerProvider.test.tsx and JobsPage.test.tsx both failed because their @/gql/hooks mocks didn't export QuickFilterCountsDocument / useQuickFilterCountsQuery. Fixed by adding both exports.

## Ready for Next Run
