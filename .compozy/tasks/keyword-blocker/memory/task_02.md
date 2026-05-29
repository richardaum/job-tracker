# Task Memory: task_02.md

## Objective Snapshot

Create `KeywordBlockerService` with `evaluate()` method, types, module registration, and tests.

## Important Decisions

- Re-exported `KeywordScope`, `MatchMode`, `BlockedKeyword` from settings domain's types file (avoided duplicating enum/type definitions)
- Used existing `tipTapToPlainText` from `@job-tracker/tiptap` for description extraction instead of inline implementation
- Used direct constructor injection pattern (matching existing test patterns like `JobSummaryService` tests) rather than `Test.createTestingModule`

## Learnings

- `tipTapToPlainText` from `@job-tracker/tiptap` handles both TipTap JSON strings and plain text — already imported in `jobs.service.ts`
- `SettingsService` is already exported from `SettingsModule` which is already imported in `JobsModule`

## Files / Surfaces

- `apps/api/src/domains/jobs/keyword-blocker.types.ts` — new: `BlockVerdict` type, re-exports
- `apps/api/src/domains/jobs/keyword-blocker.service.ts` — new: `KeywordBlockerService` with `evaluate()` method
- `apps/api/src/domains/jobs/keyword-blocker.service.spec.ts` — new: 16 unit tests
- `apps/api/src/domains/jobs/jobs.module.ts` — modified: added `KeywordBlockerService` import + provider registration

## Errors / Corrections

- First test run failed on "EXACT match on DESCRIPTION" — test used keyword `"looking for a senior engineer"` but TipTap parsed text was `"We are looking for a senior engineer"`. Fixed test to match actual plain text output.

## Ready for Next Run

Yes. All 16 tests pass. Pre-existing failures unrelated.
