---
status: completed
title: "Extension: `isJobDuplicate` GraphQL op + ApiService"
type: extension
complexity: low
dependencies:
  - task_02
---

# Task 05: Extension: `isJobDuplicate` GraphQL op + ApiService

## Overview

Add a new GraphQL operation file for the `isJobDuplicate` query and wire it through the extension's `ApiService` so the extension can call the server-side duplicate check.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `apps/extension/src/graphql/is-job-duplicate.graphql` with the `IsJobDuplicate` query
- MUST run codegen to generate types
- MUST add `isJobDuplicate(company, title): Promise<...>` to `ApiService`
- MUST handle errors gracefully (return false on failure)

## Subtasks

- [ ] 05.1 Create `.graphql` operation file
- [ ] 05.2 Run codegen
- [ ] 05.3 Add `isJobDuplicate()` to `ApiService`
- [ ] 05.4 Write unit test for ApiService method

## Implementation Details

See TechSpec "API Endpoints" for the exact query shape. Follow existing patterns from `create-job.graphql` and `ApiService.createJob()`.

### Relevant Files

- `apps/extension/src/graphql/is-job-duplicate.graphql` — new
- `apps/extension/src/gql/graphql.ts` — codegen output
- `apps/extension/src/domains/api/api.service.ts` — add method

### Dependent Files

- `apps/extension/src/domains/sources/source-run-events.service.ts` — will call it (task 06)

## Deliverables

- New `isJobDuplicate` GraphQL operation file
- Codegen types
- ApiService method with error handling
- Unit tests
- Test coverage >=80%

## Tests

- [ ] `isJobDuplicate` returns `true` when server responds with `true`
- [ ] Returns `false` when server responds with `false`
- [ ] Returns `false` on network error
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- ApiService.isJobDuplicate works end-to-end
