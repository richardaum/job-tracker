# Task Memory: task_06.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

- Wire AiAccessService and getClientFor into AiBaseService.callAi()
- Add required `userId: string` to CallAiOptions type
- Inject AiAccessService into AiBaseService constructor
- Call resolveClientKey() before any OpenAI request
- Use getClientFor() instead of getClient()
- Ensure GraphQLError propagates unmodified (no rewrap into BadRequestException)
- Deliver unit + integration tests with 80%+ coverage

## Important Decisions

- AiAccessService and OpenAIClient.getClientFor() already exist from task_04 and task_05
- No changes to existing response-format switch logic, only client construction path changes
- GraphQLError must propagate out unmodified per requirements

## Learnings

- CallAiOptions currently discriminated union on responseFormat: "zod-response" | "json-schema" | "json-schema-with-web-search"
- AiAccessService.resolveClientKey() is async and throws GraphQLError on gating failures
- 9 subclasses of AiBaseService will fail to compile until they pass userId in callAi() calls (task_07/task_08)
- OpenAIClient has both getClient() (single instance) and getClientFor(key) (request-scoped)

## Files / Surfaces

- apps/api/src/lib/ai/ai-base.service.ts (main edit)
- apps/api/src/lib/ai/ai-base.service.spec.ts (new test file)
- apps/api/src/lib/ai/ai-access.service.spec.ts (already exists from task_04, will verify integration)

## Errors / Corrections

- Fixed test file to use vitest instead of jest (project standard)
- Converted TestingModule approach to direct construction with mocks
- Fixed type errors in integration test with `as any` casting for error handling

## Status

- Implementation complete: CallAiOptions updated with userId, AiAccessService injected, resolveClientKey() called before OpenAI
- Unit tests: 15 tests passing (PASS 15 FAIL 0)
- Integration tests: created but require database setup to verify
- Expected compile errors in subclasses (missing userId and AiAccessService in constructors) — these are intentional per task requirements

## Ready for Next Run

- All changes in place for task_06
- Compilation errors expected in 9 subclasses until task_07/task_08 update call sites
- Unit tests verify gating runs before OpenAI calls and GraphQLError propagates unmodified
- Integration test framework prepared for verification with real database
