---
status: completed
title: "API — resolver + schema"
type: api
complexity: low
dependencies:
  - task_01
---

# Task 02: API — resolver + schema

## Overview

Add the `quickFilterCounts(company, runId)` resolver method to `JobsResolver` and restart the API to regenerate `schema.gql` with the new `FilterCount` type and `quickFilterCounts` query.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC "Core Interfaces" and "API Endpoints" sections
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add `@Query(() => [FilterCountType]) quickFilterCounts(company, runId)` to `JobsResolver`
- MUST apply the same auth guards (`@UseGuards`, `@Roles`) as the existing `jobs()` resolver
- MUST delegate to `countByQuickFilter()` from `JobsListQuery`
- MUST restart API (`pm2 restart api`) to regenerate `schema.gql`
- MUST NOT modify any existing resolver methods
</requirements>

## Subtasks

- [x] 2.1 Add `quickFilterCounts()` resolver method to `JobsResolver`
- [x] 2.2 Run `pm2 restart api` to regenerate `schema.gql`
- [x] 2.3 Verify `schema.gql` contains `FilterCount` type and `quickFilterCounts` query
- [x] 2.4 Write unit tests for the new resolver method

## Implementation Details

Modify `apps/api/src/domains/jobs/jobs.resolver.ts`:

- Inject `JobsListQuery` (or delegate via service)
- Add `@Query(() => [FilterCountType])` method with `@CurrentUser`, optional `company` and `runId` args
- Apply existing guards (same as `jobs()` resolver)
- Call `this.jobsListQuery.countByQuickFilter(user.userId, company, runId)`

### Relevant Files

- `apps/api/src/domains/jobs/jobs.resolver.ts` — Target for new method
- `apps/api/src/domains/jobs/jobs-list.query.ts` — Provides `countByQuickFilter`
- `apps/api/src/domains/jobs/filter-count.type.ts` — New type from task 01
- `apps/api/src/schema.gql` — Regenerated artifact

### Dependent Files

- `apps/web/src/graphql/quick-filter-counts.graphql` — Consumes this query in task 03

### Related ADRs

- [ADR-002: Separate GraphQL Query for Filter Counts](../adrs/adr-002.md)

## Deliverables

- `apps/api/src/domains/jobs/jobs.resolver.ts` — Modified
- `apps/api/src/schema.gql` — Regenerated (verify `FilterCount` + `quickFilterCounts`)
- Unit tests for the new resolver method

## Tests

- Unit tests:
  - [x] Resolver delegates to `countByQuickFilter` with correct userId
  - [x] Resolver passes `company` and `runId` through correctly
  - [x] Resolver returns correct `FilterCountType[]` shape
- Integration:
  - [x] `quickFilterCounts(company, runId) { key count }` returns expected response
- Test coverage target: >=80%

## Success Criteria

- API boots without errors
- `schema.gql` contains `quickFilterCounts(company, runId): [FilterCount!]!`
- GraphQL query returns correct counts
- All tests passing
