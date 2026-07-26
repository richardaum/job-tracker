# Task Memory: task_01.md

## Objective Snapshot

Create FilterCountType + countByQuickFilter() aggregate query method in JobsListQuery.

## Important Decisions

- Raw SQL via `this.jobsRepo.manager.query()` with positional `$N` params — cleaner than QueryBuilder for COUNT + FILTER syntax
- Return type is `FilterCountType[]` (the GraphQL @ObjectType class, used as internal DTO)

## Learnings

- `Number(row.count) || 0` handles NaN safely
- Lint and typecheck clean before and after implementation

## Files / Surfaces

- apps/api/src/domains/jobs/filter-count.type.ts (new)
- apps/api/src/domains/jobs/jobs-list.query.ts (modified — added countByQuickFilter)
- apps/api/src/domains/jobs/jobs-list.query.spec.ts (new — 13 tests)

## Errors / Corrections

- Pre-existing: jobs.repository.spec.ts "update merges dto into existing entity and saves" — createQueryBuilder chain not properly mocked

## Ready for Next Run

Task implementation complete. All subtasks done. Verified: 13/13 new tests pass, lint clean, typecheck clean.
