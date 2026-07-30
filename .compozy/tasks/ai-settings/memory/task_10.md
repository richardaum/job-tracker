# Task Memory: task_10.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Implemented two new GraphQL mutations for OpenAI key management: `saveOpenAiKey` and `removeOpenAiKey`. Both mutations guard access with JwtAuthGuard/RolesGuard, operate on UserSettingEntity, and preserve key/toggle independence per ADR-002.

## Important Decisions

- **Key validation approach**: Uses OpenAI's `models.list()` (GET /v1/models) for validation, not a real completion call. Fast, no token cost, sufficient proof that the key works.
- **Encryption**: Leverages existing EncryptedColumnTransformer via TypeORM field-level encryption. No explicit encrypt/decrypt calls needed in the service.
- **Error handling**: Throws GraphQLError with extensions.code: AI_KEY_INVALID for failed validation. Reuses shared AI_ERROR_CODES constant.
- **Field independence**: removeOpenAiKey only touches openaiApiKeyEncrypted; aiEnabled and trialCallsUsed remain untouched, enforced in tests and code.

## Learnings

- Service methods are lightweight: saveOpenAiKey validates then delegates encryption to the entity transformer; removeOpenAiKey just sets the field to null.
- Test setup required explicit mocking of both new methods in resolver spec beforeAll block.
- GraphQLError mocking in resolver tests requires proper error type (not plain Error).

## Files / Surfaces

**Modified:**

- `apps/api/src/domains/settings/settings.resolver.ts` — added saveOpenAiKey and removeOpenAiKey mutations
- `apps/api/src/domains/settings/settings.service.ts` — added saveOpenAiKey and removeOpenAiKey methods
- `apps/api/src/domains/settings/settings.service.spec.ts` — added 4 unit tests
- `apps/api/src/domains/settings/settings.resolver.spec.ts` — added 4 integration tests and updated mock setup

**Used (no changes):**

- UserSettingEntity (already has openaiApiKeyEncrypted field + EncryptedColumnTransformer)
- AI_ERROR_CODES constants (AI_KEY_INVALID already defined in task_04)
- UserSettingType GraphQL fields (aiEnabled, hasOpenAiKey, trialCallsUsed already added in task_09)

## Errors / Corrections

None. Tests pass clean: 38 settings module tests all pass, 567 API tests all pass.

## Ready for Next Run

Task is complete. All deliverables and tests are in place. The two mutations are ready for frontend integration in task_11 (GraphQL operations codegen).
