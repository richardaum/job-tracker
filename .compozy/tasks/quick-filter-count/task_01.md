---
status: completed
title: "API — types + aggregate query"
type: api
complexity: low
dependencies: []
---

# Task 01: API — types + aggregate query

## Overview

Create the `FilterCountType` GraphQL object type and add `countByQuickFilter()` to `JobsListQuery` — a single SQL aggregate query that computes all 7 filter counts in one round-trip.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC "Core Interfaces" and "Data Models" sections
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `FilterCountType` with `key: ApplicationQuickFilterEnum!` and `count: Int!` fields
- MUST add `countByQuickFilter(userId, company?, runId?)` method to `JobsListQuery`
- MUST compute all 7 filter counts in a single SQL query (COUNT + FILTER / CASE)
- MUST respect the same company and runId scoping as `findAllByUserId`
- MUST NOT modify the existing `findAllByUserId` method
- MUST follow entity conventions (`@ObjectType()`, `@Field()` decorators)
</requirements>

## Subtasks

- [x] 1.1 Create `filter-count.type.ts` with `FilterCountType`
- [x] 1.2 Add `countByQuickFilter()` method to `JobsListQuery`
- [x] 1.3 Write unit tests for the new method

## Implementation Details

New file:

- `apps/api/src/domains/jobs/filter-count.type.ts` — `@ObjectType()` for `FilterCount { key, count }`

Modified file:

- `apps/api/src/domains/jobs/jobs-list.query.ts` — add `countByQuickFilter()` method

The SQL aggregate query should use the same base filter logic as `findAllByUserId` but use `COUNT(*) FILTER (WHERE ...)` expressions for each filter key. See TechSpec § "Core Interfaces" for approach.

### Relevant Files

- `apps/api/src/domains/jobs/job-quick-filter.enum.ts` — Existing enum
- `apps/api/src/domains/jobs/jobs-list.query.ts` — Target for new method
- `apps/api/src/domains/jobs/jobs.resolver.ts` — Will call this method in task 02

### Dependent Files

- `apps/api/src/domains/jobs/jobs.resolver.ts` — Consumer in task 02
- `apps/api/src/schema.gql` — Will include `FilterCount` type after task 02

### Related ADRs

- [ADR-003: Single Aggregate Query for Filter Counts](../adrs/adr-003.md)

## Deliverables

- `apps/api/src/domains/jobs/filter-count.type.ts` — New file
- `apps/api/src/domains/jobs/jobs-list.query.ts` — Modified
- Unit tests with 80%+ coverage

## Tests

- Unit tests:
  - [x] Returns 0 for all keys when user has no jobs
  - [x] Returns correct counts per filter key with known data
  - [x] Respects `company` filter scope
  - [x] Respects `runId` filter scope
  - [x] Correct `Incoming` count (jobs with future schedule)
  - [x] Correct `Active` count (not New/Applied/Rejected/Duplicated/Draft)
  - [x] Draft jobs excluded from non-Draft categories
- Test coverage target: >=80%

## Success Criteria

- `FilterCountType` compiles and is correctly decorated
- `countByQuickFilter()` returns correct counts matching manual SQL verification
- All tests passing
