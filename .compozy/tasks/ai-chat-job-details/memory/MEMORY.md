# Workflow Memory

## Current State

- Task 05 (ChatPanel component) — completed
- Next pending: Task 06 (ViewModel + GraphQL operations)

## Shared Decisions

- AI streaming uses `OpenAIClient.getClient().chat.completions.create({stream: true})` directly, not `AiBaseService.callAi()` (which is blocking-only)
- Background stream is fire-and-forget; mutation returns `{success: true}` immediately
- On AI failure: emit completion with empty IDs, no messages persisted
- ChatPanel component API (task 05): accepts prop-based `Conversation[]`, `ChatMessage[]`, `activeConversationId`, `isStreaming`, `streamingContent`, and callbacks (`onSendMessage`, `onCreateConversation`, `onDeleteConversation`, `onRetry`). Task 06 wires real data via ViewModel.
- Chat composer uses plain textarea (not TipTap) — simpler for single-line/Enter-to-send chat input

## Shared Learnings

- `JobStageEventsRepository` and `NoteRepository` need to be added to their respective module `exports[]` for cross-module injection
- Integration tests (9 files) are failing pre-existing due to test DB migration issue — unrelated to new code
- `scrollIntoView` is not implemented in jsdom — vitest setup needs mock for `Element.prototype.scrollIntoView`
- `ChatPanelTabsContent` tests must wrap in `<Tabs>` because `TabsContent` requires a `Tabs` ancestor

## Open Risks

- Integration tests continue to fail pre-existing (DB migration `AddPlanUserId1768120000000` requires seeded users table)
- Mobile tab bar in `JobDetailsLayout.tsx` does not yet have an AI Chat tab trigger — users cannot navigate to `/jobs/{id}/chat` from mobile tabs (can only reach via URL directly). Task explicitly forbade modifying `JobDetailsLayout.tsx`; address in follow-up.
- Web unit test `JobsPage.test.tsx > renders current stage from job when list includes currentStage` is failing pre-existing (cannot find "Technical" text) — unrelated to new code

## Handoffs

- Task 05 (ChatPanel component) — complete. All 6 sub-components created, ChatPanelTabsContent updated, 6 test files passing.
- Task 06 (ViewModel + GraphQL operations) — complete. GraphQL operations at `apps/web/src/graphql/ai-chat.graphql`. ViewModel at `apps/web/src/modules/jobs/details/hooks/useChatPanelViewModel.ts`. ViewModel returns `{ conversations, conversationsLoading, activeConversationId, messages, isStreaming, streamingContent, error, createConversation, deleteConversation, askQuestion, switchConversation }`. ChatPanelTabsContent wired to ViewModel.
