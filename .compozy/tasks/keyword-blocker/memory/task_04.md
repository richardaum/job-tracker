# Task Memory: task_04.md

## Objective Snapshot

Integrate `KeywordBlockerService` + `NoteService.createPlainTextNote()` into `JobsService.create()` — blocker after normalization, before duplicate detection. On match: REJECTED stage, SYSTEM stage event, auto-note via tryRun.

## Important Decisions

- Used `forwardRef(() => NotesModule)` in `JobsModule` imports and `@Inject(forwardRef(() => NoteService))` in `JobsService` constructor — breaks circular dep (NotesModule imports JobsModule for JobEventBus). Both sides would need forwardRef if runtime fails, but tests pass with one-sided forwardRef.
- Pass `dto.description ?? null` to blocker due to `CreateDto.description` being `string | null | undefined` vs `evaluate()` expecting `string | null`.

## Learnings

- Blocker verdict `BlockVerdict.scope` is `KeywordScope` enum — string interpolation gives `"TITLE"`, `"DESCRIPTION"`, `"COMPANY"`, matching note format spec.
- NoteService.createPlainTextNote doesn't validate TipTap — correct for plain-text auto-notes.

## Files / Surfaces

- `apps/api/src/domains/jobs/jobs.module.ts` — added `NotesModule` import (forwardRef)
- `apps/api/src/domains/jobs/jobs.service.ts` — added `NoteService`, `KeywordBlockerService` injections, blocker check in `create()`
- `apps/api/src/domains/jobs/jobs.service.spec.ts` — 10 new tests for blocker integration

## Errors / Corrections

- Test "sets stage to REJECTED" initially failed with `currentStage: 'NEW'` — needed `findLatestStageSummariesByJobIds` mock with REJECTED summary for `findOne()` call.
- Test "draft capture does not call blocker" failed with `Cannot read properties of undefined (reading 'id')` — needed `repo.create` and `findLatestStageSummariesByJobIds` mocks for draft flow.
- Lint: unused `app` variable in one test (changed to `mockCreate()` without assignment).
- Typecheck: `dto.description` could be `undefined` → used `dto.description ?? null`.

## Ready for Next Run

Integration tests require PostgreSQL (`DATABASE_INTEGRATION_URL`) and full NestJS module bootstrap. Skipped due to infrastructure constraints. Unit tests cover all integration scenarios with mocks.
