# Workflow Memory

Keep only durable, cross-task context here. Do not duplicate facts that are obvious from the repository, PRD documents, or git history.

## Current State

All 4 tasks complete.

## Shared Decisions

- `countByQuickFilter()` uses raw SQL via `this.jobsRepo.manager.query()` with positional `$N` params, not QueryBuilder — cleaner for COUNT + FILTER syntax.

## Shared Learnings

## Open Risks

- Pre-existing test failure in `apps/api/src/domains/jobs/jobs.repository.spec.ts > update merges dto into existing entity and saves` — `createQueryBuilder` chain not mocked properly. Unrelated to this feature.

## Handoffs
