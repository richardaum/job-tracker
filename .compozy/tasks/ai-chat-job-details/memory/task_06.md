# Task Memory: task_06.md

## Objective Snapshot

Wire ChatPanel to real backend data: GraphQL operations, codegen, useChatPanelViewModel hook, connect to ChatPanelTabsContent.

## Important Decisions

- User message added optimistically (local state) when `askQuestion` is called, cleared on stream completion + refetch
- Subscription always active for active conversationId (not conditional on isStreaming), guarded by `isStreamingRef` to ignore stale events
- `messages` = persisted query data + optimistic local messages; when persist is established (after completion refetch), optimistic state clears
- Streaming content passed separately via `streamingContent` prop (component renders it as separate AI message bubble)
- `removeDeletedEntityFromListCache` used for delete mutation cache consistency
- Test pattern: mock `@/gql/hooks` directly, use `act()` wrappers for state-changing operations

## Learnings

- `act()` required when calling ViewModel functions that trigger React state updates (`switchConversation`, `createConversation`, etc.)
- Async mutation calls need `await act(async () => { await fn(); })` pattern
- Using a ref (`isStreamingRef`) prevents stale event processing in subscription callback
- Codegen succeeded without PM2 restart — schema.gql was already up to date from prior tasks

## Files / Surfaces

- Created: `apps/web/src/graphql/ai-chat.graphql`
- Created: `apps/web/src/modules/jobs/details/hooks/useChatPanelViewModel.ts`
- Created: `apps/web/src/modules/jobs/details/hooks/useChatPanelViewModel.test.ts`
- Modified: `apps/web/src/modules/jobs/details/components/ChatPanelTabsContent.tsx`
- Modified: `apps/web/src/modules/jobs/details/components/ChatPanelTabsContent.test.tsx`
- Regenerated: `apps/web/src/gql/hooks.ts`, `apps/web/src/gql/sdk.ts`, `apps/web/src/gql/gql/`

## Errors / Corrections

- Initial lint errors: `../` imports not allowed (use `@/` alias), unused `apolloClient` variable, unused `result` variable
- Test failures due to missing `act()` wrappers around state-changing operations

## Ready for Next Run

- All GraphQL operations defined, codegen run, ViewModel created and wired
- ViewModel handles streaming (accumulate tokens), completion (refetch + clear), error states
- ChatPanelTabsContent uses ViewModel instead of local mock state
- 12 ViewModel tests + 5 ChatPanelTabsContent tests all pass
- `pnpm typecheck` + `pnpm lint` clean
