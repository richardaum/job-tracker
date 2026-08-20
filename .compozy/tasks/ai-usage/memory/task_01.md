# Task Memory: task_01.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

- Add durable, user-scoped AI token usage records and an authenticated rolling 30-day GraphQL summary split by PersonalKey and Trial.

## Important Decisions

- Keep existing trial allowance behavior authoritative by reading `trialCallsUsed` and `trialCallsLimit` through `SettingsService.getSettings`.
- Keep rolling-window SQL and record insertion in a dedicated thin repository; the service supplies the inclusive cutoff and shapes zero defaults.
- Use `created_at` as the immutable successful-call completion timestamp specified by the TechSpec.

## Learnings

- The existing `AiUsageChanged` name belongs to settings subscription events only; there is no durable AI usage domain or `aiUsage` query yet.
- Database entities and migrations are manually registered in `data-source-options.ts` and `migrations/index.ts`.
- Focused Vitest commands for this package require `pnpm --filter @job-tracker/api exec vitest`; the documented shorthand looks for a missing `vitest` package script.
- Database-backed tests can use an isolated `job_tracker_test` database derived from the configured local PostgreSQL URL when `DATABASE_INTEGRATION_URL` is absent.

## Files / Surfaces

- Added the AI usage entity and migration; registered both database surfaces.
- Added the `domains/ai-usage` repository, service, resolver, GraphQL types, module, unit tests, and database integration tests.
- Registered `AiUsageModule` in AppModule and regenerated `apps/api/src/schema.gql`.

## Errors / Corrections

- Corrected the unauthenticated GraphQL assertion from missing `data` to GraphQL's actual `data: null` response.
- Ran schema-resetting migration, repository, and resolver integration files independently after an initial combined run stalled against their shared integration database.
- Repaired missing execute permission on the installed LeanSpec platform binary so repository validation could run.
- The first full validation rerun reached `format:check` after passing specs, lint, typecheck, and coverage, then identified six workflow PRD/task documents for mechanical formatting.
- After formatting those documents, `validate:ci` passed through format checking and stopped at unrelated repository-wide `knip` findings; no new AI usage file was reported.

## Ready for Next Run

- Implementation and task-specific verification are complete, including schema generation, focused 100% line coverage, migration reversibility, real aggregation isolation/window behavior, and authenticated GraphQL isolation.
- Full `validate:ci` remains non-zero only at the existing `knip` backlog, so task/master tracking intentionally remain pending under the execution workflow.
- Full monorepo build passes. PM2 `api` and Docker `job-tracker-api` are not running, so runtime logs were unavailable.
