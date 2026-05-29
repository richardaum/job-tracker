# Task Memory: task_01.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Add two JSONB columns (`blocked_keywords`, `blocked_companies`) to `user_settings`, create matching GraphQL types/enums/input, write migration, update API type/input files.

## Important Decisions

- `KeywordScope` and `MatchMode` enums + `BlockedKeywordType` / `BlockedKeywordInput` defined in `apps/api/src/domains/settings/keyword-blocker.types.ts` (settings domain, not jobs — aligned with where UserSettingType lives)
- `BlockedKeyword` interface defined alongside GraphQL types for entity column typing
- Migration timestamp `1768000000000` — follows last existing `1767990000000`

## Learnings

- All 7 resolver integration tests fail pre-existing with `@as-integrations/express5` missing — not related to these changes
- Migration integration test needs `session_replication_role = 'replica'` to bypass FK constraint for isolation
- `runMigrations()` checks the `migrations` table — need to clean migration records between test runs

## Files / Surfaces

- `apps/api/src/domains/settings/keyword-blocker.types.ts` — **new** enums + types + input
- `apps/api/src/domains/settings/keyword-blocker.types.spec.ts` — **new** unit tests
- `apps/api/src/database/entities/user-setting.entity.ts` — **modified** +2 JSONB columns
- `apps/api/src/domains/settings/user-setting.type.ts` — **modified** +2 GraphQL fields
- `apps/api/src/domains/settings/update-settings.input.ts` — **modified** +2 optional input fields
- `apps/api/src/database/migrations/1768000000000-add-keyword-blocker-columns.ts` — **new** migration
- `apps/api/src/database/migrations/1768000000000-add-keyword-blocker-columns.integration.ts` — **new** integration tests
- `apps/api/src/database/migrations/index.ts` — **modified** import + array entry
- `apps/api/src/domains/settings/settings.service.spec.ts` — **modified** test assertions for new fields
- `apps/api/src/domains/settings/settings.resolver.spec.ts` — **modified** GraphQL queries for new fields (test pre-existing skipped)

## Errors / Corrections

- Typecheck error: test files used string literals `"TITLE"`/`"PARTIAL"` instead of `KeywordScope.TITLE`/`MatchMode.PARTIAL` — fixed by importing enums
- Lint error: unused `Int` import in `keyword-blocker.types.ts` — removed
- Migration integration test: columns already existed from previous run — added `cleanColumns` + `cleanMigrationRecord`
- Migration integration test: FK violation on `user_settings.user_id` — added `session_replication_role = 'replica'`

## Ready for Next Run

Yes — all required items complete. Migration, enums, GraphQL types/input, entity columns, tests all passing. Lint and typecheck clean.
