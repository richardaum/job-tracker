---
status: completed
title: "Server: `isJobDuplicate` GraphQL query"
type: api
complexity: medium
dependencies: []
---

# Task 02: Server: `isJobDuplicate` GraphQL query

## Overview

Add a lightweight GraphQL query that checks whether a job with the same company and title already exists in the authenticated user's database. Enables the extension to detect duplicates without side effects. See TechSpec "API Endpoints" for the exact query shape.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST add `checkDuplicate(company, title, userId)` method to `JobDuplicateService` that resolves company name to companyId
- MUST register new GraphQL query `isJobDuplicate(company: String!, title: String!): Boolean!`
- MUST use `@UseGuards(JwtAuthGuard)` — authenticated user only
- MUST reuse `SettingsService.duplicateWindowDays` for the lookback window
- MUST return `false` when company name cannot be resolved or title is empty
- MUST NOT create any side effects

## Subtasks

- [ ] 02.1 Add `checkDuplicate` to `JobDuplicateService` (resolves companyId from name internally)
- [ ] 02.2 Add `isJobDuplicate` resolver in `JobsResolver`
- [ ] 02.3 Add enum registration or return type
- [ ] 02.4 Write unit + integration tests

## Implementation Details

See TechSpec "Implementation Design: API Endpoints" for the exact query. Reuse `CompanyService` to resolve company name → ID.

### Relevant Files

- `apps/api/src/domains/jobs/job-duplicate.service.ts` — add method
- `apps/api/src/domains/jobs/jobs.resolver.ts` — add resolver
- `apps/api/src/domains/companies/company.service.ts` — resolve company name to ID

### Dependent Files

- `apps/extension/src/graphql/` — will add operation file (task 05)

## Deliverables

- `isJobDuplicate` GraphQL query
- Unit + integration tests
- Test coverage >=80%

## Tests

- [ ] Matching company+title within window → true
- [ ] Matching but outside window → false
- [ ] Empty title → false
- [ ] Unresolvable company → false
- [ ] Integration test with real DB
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Query returns correct results matching existing duplicate detection logic
