# Workflow Memory

Keep only durable, cross-task context here. Do not duplicate facts that are obvious from the repository, PRD documents, or git history.

## Current State

Task_11 (codegen) complete. Task_12-14 (UI implementation) unblocked. Codegen generated hooks: useSettingsQuery, useSaveOpenAiKeyMutation, useRemoveOpenAiKeyMutation. Schema updated with all AI fields and mutations.

## Shared Decisions

- All 4 new AI fields included in every Settings query/mutation response: aiEnabled, hasOpenAiKey, trialCallsUsed, trialCallsLimit. Simplifies UI updates after key operations.

## Shared Learnings

- **Schema sync**: apps/api/src/schema.gql is auto-generated from resolver decorators, but requires an explicit `pnpm dev` or dev-mode run to sync new mutations; `pnpm build` alone does not regenerate it. Tasks adding new resolvers should verify the schema reflects their changes before downstream codegen depends on it.

## Open Risks

- Pre-existing test failures in QuickFilters.test.tsx (spacing issue, unrelated to AI settings feature); does not block task completion but may warrant separate fix.

## Handoffs

- Task_11 → Task_12 (COMPLETE): Generated hooks and extended schema unblock SettingsTabPage UI implementation. Use useSaveOpenAiKeyMutation and useRemoveOpenAiKeyMutation for key lifecycle; use useSettingsQuery for trial quota and key-presence display.
- Task_12 → Task_13: SettingsTabPage UI complete. AI-enabled toggle and OpenAI key field ready. Task_13 (AiBlockedDialog) can now integrate the error link that catches AI_KEY_DISABLED_BY_USER and AI_KEY_REQUIRED codes.
- All AI fields now in codegen'd types. No further schema/codegen work needed for tasks 12-14.

## Implementation Notes for Future Tasks

- **Optimistic updates**: The aiEnabled toggle uses the same persistSetting pattern as autoFillEnabled/autoSummaryEnabled/autoMatchEnabled. The buildOptimisticSettings function was extended to include aiEnabled.
- **Key field pattern**: OpenAI key field follows the duplicateWindowDays pattern (draft state + dirty check + Save button), but adapted for text input with password masking.
- **Lock icon**: Shown conditionally based on settings.hasOpenAiKey (a computed boolean field from the query). No additional query needed.
- **Error handling**: Inline error display catches AI_KEY_INVALID from GraphQL response, separate from the global modal that will be added in task_13.
- **Test coverage**: 25 tests covering toggle, save, remove, validation error, and UI state. All passing.
