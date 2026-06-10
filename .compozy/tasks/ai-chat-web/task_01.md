---
status: pending
title: "View-model hook: useChatPanelViewModel"
type: web
complexity: high
dependencies: []
---

# Task 01: View-model hook: `useChatPanelViewModel`

## Overview

Create the `useChatPanelViewModel` hook that encapsulates all GraphQL operations (queries, mutations, subscription) and state management for the AI Chat. Shared between side panel and full-width views.

Stack navigation: `activeConversationId === null` → conversation list, `activeConversationId !== null` → chat view. `switchConversation(null)` goes back.

<critical>
- Read TechSpec from `.compozy/tasks/ai-chat-job-details/_techspec.md` for streaming contract
- GraphQL operations exist at `apps/web/src/graphql/ai-chat.graphql`, hooks generated at `@/gql/hooks`
- use `tryRun` from `@job-tracker/try-run` for all mutation calls
- Follow existing view-model patterns (e.g. `useJobDetailsViewModel`)
- Tests required
</critical>

## Requirements

1. File: `apps/web/src/modules/jobs/details/hooks/useChatPanelViewModel.ts`
2. Must use generated hooks from `@/gql/hooks` — no direct Apollo calls
3. Return shape: `{ conversations, activeConversationId, messages, loading, isCreating, isStreaming, streamContent, createConversation, deleteConversation, askQuestion, switchConversation }`
4. `conversations` — `useAiConversationsQuery(jobId)`, sorted by `createdAt` desc
5. `messages` — `useAiMessagesQuery(activeConversationId)`, `fetchPolicy: "cache-and-network"`, sorted by `createdAt` asc. Skipped when `activeConversationId` is null.
6. `activeConversationId` — `string | null`
7. `createConversation(): Promise<string | null>` — async, calls mutation via `tryRun`, returns the new conversation id or null on error
8. `deleteConversation(id: string)` — calls mutation via `tryRun`, sets `activeConversationId` to null if the deleted was active. Use `removeDeletedEntityFromListCache` for cache consistency.
9. `askQuestion(conversationId, content)` — calls mutation via `tryRun`, on success sets `isStreaming = true`
10. `switchConversation(id | null)` — sets `activeConversationId`; null returns to list; non-null triggers messages fetch
11. Streaming: subscribe to `useAiMessageStreamedSubscription` with `onData` callback. Accumulate tokens in `streamContent`. On `completed: true` → stop streaming, refetch messages, clear `streamContent`.
12. `loading` — true when conversations query is loading, OR when messages query is loading (with active conversation)
13. `isCreating` — `createConversationMut.loading`
14. Error handling follows NotesPanel pattern: mutations wrapped with `tryRun`, errors handled by the component

## Subtasks

- [ ] 1.1 Set up queries + activeConversationId state
- [ ] 1.2 Implement `switchConversation` — null/string toggle
- [ ] 1.3 Implement `createConversation` — async, tryRun, return id
- [ ] 1.4 Implement `deleteConversation` — tryRun + cache consistency
- [ ] 1.5 Implement `askQuestion` + streaming subscription with token accumulation
- [ ] 1.6 Handle `completed` event — refetch, clear state
- [ ] 1.7 Wire `loading` to reflect both queries
- [ ] 1.8 Write unit tests

## Contract

```typescript
interface ChatPanelViewModel {
  conversations: Array<{ id: string; title: string; createdAt: string }>;
  activeConversationId: string | null;
  messages: Array<{ id: string; role: AiMessageRole; content: string; createdAt: string }>;
  loading: boolean;
  isCreating: boolean;
  isStreaming: boolean;
  streamContent: string;
  createConversation: () => Promise<string | null>;
  deleteConversation: (id: string) => Promise<void>;
  askQuestion: (conversationId: string, content: string) => Promise<void>;
  switchConversation: (id: string | null) => void;
}
```

## Implementation Notes (high-level)

- `useAiConversationsQuery` fetches all conversations for the job. Cache read on re-render.
- `useAiMessagesQuery` uses `skip` when no conversation is active, `cache-and-network` for freshness.
- `switchConversation` sets `activeConversationId`. For non-null, refetch or rely on Apollo's cache-and-network to avoid stale data on re-selection.
- `createConversation`: call mutation, unwrap result for `id`, set `activeConversationId`.
- `deleteConversation`: call mutation, update Apollo cache to remove from list. If deleted id matches active, clear it.
- `askQuestion`: call mutation, on success toggle `isStreaming`. The subscription hook is conditionally mounted (skip when not streaming).
- Subscription `onData`: check for `token` (append to `streamContent`) or `completed` (finalize).
- On `completed`: refetch `useAiMessagesQuery`, clear `streamContent`, set `isStreaming = false`.
- `loading` is derived from both query loading states. When `activeConversationId` is null, only conversations loading matters.
- `tryRun` wraps every mutation call. On error, the component handles feedback (toast, inline message).

### Relevant Files

| File                                                                  | Reason               |
| --------------------------------------------------------------------- | -------------------- |
| `apps/web/src/graphql/ai-chat.graphql`                                | GraphQL operations   |
| `apps/web/src/gql/hooks.ts`                                           | Generated hooks      |
| `apps/web/src/modules/jobs/details/hooks/useJobDetailsViewModel.ts`   | Reference pattern    |
| `apps/web/src/modules/applications/shared/utils/apolloDeleteCache.ts` | Delete cache utility |

### Dependent Files

| File                                                               | Reason                  |
| ------------------------------------------------------------------ | ----------------------- |
| `apps/web/src/modules/jobs/details/hooks/useChatPanelViewModel.ts` | Created here            |
| `apps/web/src/modules/jobs/details/components/AiChatContent.tsx`   | Consumes hook (task 02) |

## Deliverables

- `useChatPanelViewModel.ts`
- Unit tests
- `pnpm typecheck` + `pnpm lint`

## Tests

- Conversations query returns data, sorted desc
- `activeConversationId` starts null
- `createConversation` returns id on success, null on error
- `switchConversation(id)` sets active conversation
- `switchConversation(null)` returns to list
- `deleteConversation` clears active if deleted was active
- `askQuestion` triggers subscription, sets isStreaming
- Tokens accumulate via subscription `onData`
- `completed` refetches messages, clears stream state
- `loading` reflects query states
- Edge: empty conversations, empty messages

## Success Criteria

- All tests passing, coverage >= 80%
- Stack navigation works (null = list, non-null = chat)
- `createConversation` is async, returns id, component handles null gracefully
- Delete cache consistency + resets to list when active is deleted
- Typecheck + lint pass
