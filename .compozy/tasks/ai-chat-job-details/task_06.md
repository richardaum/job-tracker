---
status: completed
title: ViewModel + GraphQL operations
type: web
complexity: medium
dependencies:
  - task_02
  - task_03
  - task_05
---

# Task 06: ViewModel + GraphQL operations

## Overview

Wire the ChatPanel component to real backend data. Define GraphQL operations (queries, mutations, subscription), run codegen, and create the `useChatPanelViewModel` hook that connects the component to Apollo Client.

<critical>

- Read `_prd.md` and `_techspec.md` before starting
- Reference TechSpec "API Endpoints" section for all GraphQL operations
- Reference TechSpec "Core Interfaces" for streaming event contract
- Tests required — verify all data flows work end-to-end

</critical>

<requirements>

1. MUST define `.graphql` operations file for AI Chat (or add to `jobs.graphql`)
2. MUST define query: `query AiConversations($jobId: ID!) { aiConversations(jobId: $jobId) { ... } }`
3. MUST define query: `query AiMessages($conversationId: ID!) { aiMessages(conversationId: $conversationId) { ... } }`
4. MUST define mutation: `mutation CreateAiConversation($jobId: ID!) { createAiConversation(jobId: $jobId) { ... } }`
5. MUST define mutation: `mutation DeleteAiConversation($id: ID!) { deleteAiConversation(id: $id) { success deletedId } }`
6. MUST define mutation: `mutation AskAiQuestion($conversationId: ID!, $content: String!) { askAiQuestion(conversationId: $conversationId, content: $content) { ... } }`
7. MUST define subscription: `subscription AiMessageStreamed($conversationId: ID!) { aiMessageStreamed(conversationId: $conversationId) { ... } }`
8. MUST run codegen: `pnpm --filter @job-tracker/web run codegen`
9. MUST create `useChatPanelViewModel` hook in `apps/web/src/modules/jobs/details/hooks/`
10. ViewModel hook MUST return: `{ conversations, activeConversationId, messages, isStreaming, error, createConversation, deleteConversation, askQuestion, switchConversation }`
11. ViewModel MUST use generated hooks from `@/gql/hooks` — no direct Apollo calls
12. ViewModel MUST use `useSubscription` generated hook with `onData` callback for streaming tokens
13. MUST NOT use `@Sse()` or `EventSource` — streaming goes through GraphQL Subscription

</requirements>

## Subtasks

- [x] Create `.graphql` operations file (or add to existing)
- [x] Run codegen: `pnpm --filter @job-tracker/web run codegen`
- [x] Create `useChatPanelViewModel.ts` with conversation CRUD hooks
- [x] Wire streaming subscription in ViewModel (accumulate tokens on `onData`)
- [x] Connect ViewModel to ChatPanel component in `ChatPanelTabsContent`
- [x] Handle loading, empty, and error states in ViewModel
- [x] Verify with `pnpm typecheck` + `pnpm lint`

## Implementation Details

The ViewModel manages local state for the streaming message (tokens accumulated during streaming) and uses Apollo cache reads for conversation/message data.

Streaming flow in ViewModel:
1. `askQuestion` calls the mutation → starts streaming on server
2. Subscribe to `AiMessageStreamed` with the active conversationId
3. In `onData`, accumulate tokens in local state
4. On `completed: true`, refetch messages query to get persisted messages with stable IDs
5. Clear local streaming state

For conversation list cache consistency, use `removeDeletedEntityFromListCache` for `deleteAiConversation` mutations.

### Relevant Files

- `apps/web/src/graphql/jobs.graphql` — Reference: existing GraphQL operations pattern
- `apps/web/src/modules/jobs/details/hooks/useJobDetailsViewModel.ts` — Reference: ViewModel pattern with subscriptions
- `apps/web/src/modules/jobs/details/hooks/useJobMatchStatus.ts` — Reference: subscription + refetch pattern
- `apps/web/src/modules/applications/shared/utils/apolloDeleteCache.ts` — Reference: cache update on delete
- `apps/web/src/gql/hooks.ts` — Generated hooks from codegen

### Dependent Files

- GraphQL operations file — Created here
- `apps/web/src/gql/hooks.ts` — Regenerated here
- `apps/web/src/modules/jobs/details/hooks/useChatPanelViewModel.ts` — Created here
- `apps/web/src/modules/jobs/details/components/ChatPanelTabsContent.tsx` — Modified (wire ViewModel + ChatPanel)

### Related ADRs

- [ADR-004: Stream First, Persist AI Message on Completion](../adrs/adr-004.md) — Streaming contract

## Deliverables

- GraphQL operations (`.graphql` file with queries, mutations, subscription)
- Run codegen (regenerated `apps/web/src/gql/hooks.ts`)
- `apps/web/src/modules/jobs/details/hooks/useChatPanelViewModel.ts`
- Modified `ChatPanelTabsContent.tsx` (wire ViewModel + ChatPanel)
- Test coverage >= 80%

## Tests

### Unit Tests

- [x] ViewModel returns conversations list from query
- [x] ViewModel.askQuestion calls mutation and starts subscription
- [x] ViewModel accumulates tokens during streaming
- [x] ViewModel clears streaming state on completion
- [x] ViewModel handles error state from subscription

### Integration Tests

- [ ] Create conversation → shows in list (backend not wired yet)
- [ ] Ask question → streaming appears → messages persisted after completion (backend not wired yet)
- [ ] Delete conversation → removed from list (backend not wired yet)
- [ ] Switch conversation → loads that conversation's messages (backend not wired yet)

## Success Criteria

- [ ] End-to-end flow works: create conversation → ask question → streaming → messages persisted
- [ ] Cache consistency on delete (list updates without refetch)
- [ ] All tests passing
- [ ] Test coverage >= 80%
