# Task Memory: task_04.md

Implement AiAccessService with atomic trial quota resolution and key gating.

## Objective Snapshot

- Create `AiAccessService.resolveClientKey(userId: string): Promise<string>`
- Enforce aiEnabled toggle before checking key/quota
- Return decrypted personal key (via EncryptedColumnTransformer) without touching quota
- Atomically increment trial quota via single UPDATE...WHERE statement (prevents race conditions)
- Throw GraphQLError with `extensions.code = "AI_DISABLED_BY_USER"` when aiEnabled=false
- Throw GraphQLError with `extensions.code = "AI_KEY_REQUIRED"` when quota exhausted
- Define error code constants as shared exports
- Unit tests: toggle state, personal key path, quota consumption, quota exhaustion
- Integration test: concurrent calls with limit checking (60 concurrent, 50 limit = 50 successes + 10 failures, no overcount)
- Minimum 80% test coverage

## Important Decisions

- Atomic UPDATE statement structure: `.createQueryBuilder().update().set({ trialCallsUsed: () => '"trial_calls_used" + 1' }).where("user_id = :userId AND trial_calls_used < :limit")`
- Error codes as shared constants so task_10 can reuse them
- No decrement/refund on downstream OpenAI failure (per TechSpec ADR-003 decision)
- Master key from `apiEnv.SETTINGS_ENCRYPTION_KEY`, transformer already wired to entity

## Learnings

- task_01, task_02, task_03 complete: env vars set, entity columns added, transformer wired
- EncryptedColumnTransformer ready in `/apps/api/src/lib/crypto/encrypted-column.transformer.ts`
- UserSettingEntity has all required columns: aiEnabled, openaiApiKeyEncrypted, trialCallsUsed
- AiBaseService in LibAiModule; needs AiAccessService injected (task_06 will wire it)
- Test pattern: vitest with integration tests when DATABASE_INTEGRATION_URL present

## Files / Surfaces

- Create: `/apps/api/src/lib/ai/ai-access.service.ts`
- Create: `/apps/api/src/lib/ai/ai-errors.constants.ts` (shared error codes)
- Create: `/apps/api/src/lib/ai/ai-access.service.spec.ts` (unit tests)
- Create: `/apps/api/src/lib/ai/ai-access.service.integration.ts` (concurrency test)
- Modify: `/apps/api/src/lib/ai/lib-ai.module.ts` (add AiAccessService provider)
- Modify: `/apps/api/src/lib/ai/index.ts` (export service)

## Errors / Corrections

- Fixed TypeScript error in ai-access.service.ts: transformer.from() can return null, added null check with INTERNAL_SERVER_ERROR fallback
- Fixed TypeScript error in ai-access.service.integration.ts: filtered results properly with type guard for 'code' property
- Pre-existing error in user-setting.entity.spec.ts (ColumnMetadata import issue) not fixed as outside scope

## Ready for Next Run

All implementation complete. Tests passing (9/9 unit tests). Integration tests skipped (no DATABASE_INTEGRATION_URL).
Need to verify before commit:

- All test paths exercised
- Error codes exported and importable
- Service properly wired in module
