# Task Memory: task_02.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

- Add `checkDuplicate(company, title, userId)` to `JobDuplicateService` (resolves companyId via `CompanyRepository.findOneByNameInsensitiveTrimmed`, no side effects)
- Add `isJobDuplicate(company: String!, title: String!): Boolean!` query to `JobsResolver`
- Unit tests for both service method and resolver

## Important Decisions

- Injected `CompanyRepository` into `JobDuplicateService` (read-only lookup) instead of `CompanyService.findOrCreateByName` to avoid side effects
- Pass empty string as `excludeJobId` to `hasRecentDuplicateSameRoleAndCompany` — effectively checks existence with no exclusion

## Learnings

- `CompanyRepository` is exported from `CompaniesModule` which `JobsModule` already imports
- `CompanyRepository.findOneByNameInsensitiveTrimmed` exists and does case-insensitive name lookup without side effects

## Files / Surfaces

- `apps/api/src/domains/jobs/job-duplicate.service.ts` — added `checkDuplicate`, added `CompanyRepository` dependency
- `apps/api/src/domains/jobs/jobs.resolver.ts` — added `isJobDuplicate` query, added `JobDuplicateService` dependency
- `apps/api/src/domains/jobs/job-duplicate.service.spec.ts` — added mock + 5 test cases for `checkDuplicate`
- `apps/api/src/domains/jobs/jobs.resolver.spec.ts` — added mock + 2 test cases for `isJobDuplicate`

## Errors / Corrections

- Used `String!` in @Args type which is invalid JS; fixed to `String`

## Ready for Next Run
