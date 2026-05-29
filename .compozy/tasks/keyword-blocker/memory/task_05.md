# Task Memory: task_05.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Add REJECTED to ApplicationQuickFilterEnum and implement the corresponding query case in JobsListQuery.findAllByUserId().

## Important Decisions

- REJECTED filter follows DUPLICATED pattern: direct match on latestStageSub, no EXISTS clause.
- REJECTED was already excluded from ACTIVE and INCOMING filters — no changes needed there.

## Learnings

- Integration test DB must be configured via DATABASE_INTEGRATION_URL env var.

## Files / Surfaces

- apps/api/src/domains/jobs/job-quick-filter.enum.ts — added REJECTED = "REJECTED"
- apps/api/src/domains/jobs/jobs-list.query.ts — added REJECTED case in findAllByUserId()
- apps/api/src/domains/jobs/jobs.repository.spec.ts — added enum check + filter unit test
- apps/api/src/domains/jobs/jobs.repository.integration.ts — added REJECTED filter integration test

## Errors / Corrections

No new errors. Pre-existing: 7 resolver integration tests fail with @as-integrations/express5 issue.

## Ready for Next Run

Yes. All implementation, tests, and verification complete.
