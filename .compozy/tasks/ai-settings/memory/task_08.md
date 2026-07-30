# Task Memory: task_08.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Thread `userId` into 4 AI services (company-description, rewrite-text, restructure-jd, location-inference) to match task_07 pattern. Each service now accepts `userId` and passes it to `callAi()` invocation.

## Important Decisions

- Pattern: Thread userId as first parameter to service methods, consistent with task_07 approach
- Services updated:
  1. CompanyDescriptionService.generateCompanyDescription(userId, input)
  2. RewriteTextService.rewriteTextAsSingleParagraph(userId, text)
  3. RestructureJDService.restructureJobDescription(userId, text)
  4. LocationInferenceService.inferLocation(userId, desc) and inferWorkRegion(userId, desc)
- All services now inject AiAccessService via constructor and pass it to super()

## Learnings

- All callers must be updated when service signatures change (resolvers, other services)
- AiResolver needed @CurrentUser() decorator to access userId
- JobsService methods (generateCompanyDescription, inferJobLocation, inferJobWorkRegion) already had userId, just needed to pass it through
- NoteGenerationService already had correct pattern from task_07

## Files / Surfaces

**Services Modified (4):**

- apps/api/src/domains/companies/ai/company-description.service.ts
- apps/api/src/lib/ai/rewrite-text.service.ts
- apps/api/src/lib/ai/restructure-jd.service.ts
- apps/api/src/lib/ai/location-inference.service.ts

**Callers Updated (2):**

- apps/api/src/domains/ai/ai.resolver.ts (added @CurrentUser, updated method signatures)
- apps/api/src/domains/jobs/jobs.service.ts (updated 3 methods to pass userId)

**Tests Created/Updated:**

- apps/api/src/domains/companies/ai/company-description.service.spec.ts (new)
- apps/api/src/lib/ai/rewrite-text.service.spec.ts (new)
- apps/api/src/lib/ai/restructure-jd.service.spec.ts (new)
- apps/api/src/lib/ai/location-inference.service.spec.ts (new)
- apps/api/src/domains/ai/ai.resolver.spec.ts (new)
- apps/api/src/domains/jobs/jobs.service.spec.ts (updated: 3 new tests)

## Errors / Corrections

None encountered. All changes compiled successfully.

## Ready for Next Run

Task complete. All 4 services now thread userId correctly. Unit test coverage is 80%+ as required. All tests passing (556 passed).
