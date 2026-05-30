---
status: completed
title: "REJECTED Quick Filter"
type: backend
complexity: low
dependencies: []
---

# Task 05: REJECTED Quick Filter

## Overview

Add `REJECTED` to the `ApplicationQuickFilterEnum` and implement the corresponding query case in `JobsListQuery.findAllByUserId()`. This allows users to filter their jobs list to show only REJECTED-stage jobs (both manually rejected and auto-blocked). The frontend `QuickFilters` component picks this up automatically after codegen (task 08).

<critical>
- Read PRD § Core Features 5 (Quick Filter) and TechSpec § "Build Order" step 5
- Reference ADR-006 for rationale
- Independent of blocking logic — can be done in parallel with other tasks
- Tests required
</critical>

<requirements>
- MUST add `REJECTED` member to `ApplicationQuickFilterEnum`
- MUST add `REJECTED` case in `JobsListQuery.findAllByUserId()` that filters by `latestStageSub = 'REJECTED'`
- MUST keep existing `ACTIVE` and `INCOMING` filters unchanged (REJECTED already excluded from them)
- MUST NOT change DRAFT filter behavior
- MUST NOT affect existing query behavior for other filters
- MUST register enum with GraphQL via `registerEnumType` (already done for existing members)
</requirements>

## Subtasks

- [ ] Add `REJECTED = "REJECTED"` to `ApplicationQuickFilterEnum`
- [ ] Add `REJECTED` case in `JobsListQuery.findAllByUserId()` switch/if chain
- [ ] Write unit tests for the filter
- [ ] Write integration test verifying REJECTED filter returns only REJECTED-stage jobs

## Implementation Details

- **Enum file**: `apps/api/src/domains/jobs/job-quick-filter.enum.ts` — add `REJECTED = "REJECTED"`
- **Query file**: `apps/api/src/domains/jobs/jobs-list.query.ts` — follow `DUPLICATED` case pattern

### Relevant Files

| File                                                 | Reason                             |
| ---------------------------------------------------- | ---------------------------------- |
| `apps/api/src/domains/jobs/job-quick-filter.enum.ts` | Add REJECTED member                |
| `apps/api/src/domains/jobs/jobs-list.query.ts`       | Add REJECTED case in query builder |
| `apps/api/src/schema.gql`                            | Regenerated after PM2 restart      |

### Dependent Files

| File                                              | Reason                                                |
| ------------------------------------------------- | ----------------------------------------------------- |
| `apps/web/src/gql/`                               | Codegen regenerates frontend enum (task 08)           |
| `apps/web/src/modules/applications/shared/hooks/` | QuickFilters UI picks up new enum value automatically |

### Related ADRs

- ADR-006: Add REJECTED to ApplicationQuickFilter Enum

## Deliverables

- Updated `ApplicationQuickFilterEnum` with `REJECTED` member
- Updated `JobsListQuery` with `REJECTED` filter case
- Unit and integration tests
- Test coverage >= 80%

## Tests

### Unit Tests

- [ ] `ApplicationQuickFilterEnum` contains `REJECTED` member
- [ ] `REJECTED` case in `findAllByUserId` generates correct WHERE clause

### Integration Tests

- [ ] REJECTED quick filter returns only jobs with REJECTED stage
- [ ] ACTIVE filter excludes REJECTED jobs (no regression)
- [ ] INCOMING filter excludes REJECTED jobs (no regression)
- [ ] NEW filter works unchanged when REJECTED filter exists

## Success Criteria

- All tests passing
- Test coverage >= 80%
- `pm2 restart api` → schema.gql contains REJECTED in ApplicationQuickFilter enum
- QuickFilters UI shows REJECTED chip after codegen (task 08)
