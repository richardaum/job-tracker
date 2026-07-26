# Task Memory: task_02.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Add `quickFilterCounts(company, runId)` resolver to `JobsResolver`, regenerate `schema.gql`, write unit tests.

## Important Decisions

- Followed existing pattern: class-level guards already applied, injected `JobsListQuery` directly (already registered in module), no new service layer needed.

## Learnings

## Files / Surfaces

- `apps/api/src/domains/jobs/jobs.resolver.ts` — added `quickFilterCounts()` method + `JobsListQuery` import/injection
- `apps/api/src/domains/jobs/jobs.resolver.spec.ts` — added 4 test cases for `quickFilterCounts`
- `apps/api/src/schema.gql` — regenerated with `FilterCountType` and `quickFilterCounts` query

## Errors / Corrections

## Ready for Next Run
