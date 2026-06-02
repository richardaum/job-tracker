---
status: completed
title: Streaming AI responses
type: api
complexity: medium
dependencies:
    - task_02
---

# Task 03: Streaming AI responses

## Overview

Implement the `askAiQuestion` mutation that streams AI responses via GraphQL Subscription. This includes `AiChatEventBus`, `AiChatGenerationService` (extends `AiBaseService`), the streaming subscription resolver, and domain events for token delivery and completion.

<critical>

- Read `_prd.md` and `_techspec.md` before starting
- Reference TechSpec "Core Interfaces" section for AiChatEventBus and streaming pattern
- Reference TechSpec "API Endpoints" for `askAiQuestion` + `aiMessageStreamed` contract
- Reference ADR-004 for streaming-first-then-persist approach
- Tests required — verify streaming tokens arrive and messages persist on completion

</critical>

<requirements>

1. MUST create `AiChatEventBus extends EventBus<{ readonly conversationId: string }>` with `forConversation(userId, conversationId)` scoping method
2. MUST create domain events: `AiMessageTokenReceived` (conversationId, messageId?, token), `AiMessageCompleted` (conversationId, userMessageId, aiMessageId)
3. MUST create `AiChatGenerationService extends AiBaseService` with method to call OpenAI with streaming and full job context
4. MUST implement `askAiQuestion` mutation: validates access, starts AI stream in background, returns `{ success: true }` immediately
5. MUST implement `aiMessageStreamed` subscription returning `AiMessageStreamEvent` type with fields: `conversationId`, `token` (nullable), `completed`, `userMessageId` (nullable), `aiMessageId` (nullable)
6. On stream completion, MUST batch-insert user message + AI message atomically via `AiChatRepository.createMessagesBatch`
7. Grounding enforcement: system prompt MUST instruct AI to cite source sections and only answer from provided context
8. If AI call fails, MUST emit completion event with `completed: true` and no token — no messages are persisted

</requirements>

## Subtasks

- [ ] Create `AiChatEventBus` with `forConversation` scoping
- [ ] Create domain events: `AiMessageTokenReceived`, `AiMessageCompleted`
- [ ] Create `AiChatGenerationService` extending `AiBaseService`
- [ ] Create `AiMessageStreamEventType` GraphQL type
- [ ] Implement `askAiQuestion` mutation in resolver
- [ ] Implement `aiMessageStreamed` subscription in resolver
- [ ] Add system prompt with job context assembly and grounding enforcement
- [ ] Wire `AiChatEventBus` into `AiChatModule`
- [ ] Verify with `pnpm typecheck` + `pnpm test`

## Implementation Details

Follow the exact EventBus pattern from `jobs-events.resolver.ts` and `extension-activity.resolver.ts`. The subscription resolver uses `async *` generator function with `for await...of` loop.

Job context assembly: in `AiChatGenerationService`, fetch job details, company, match analysis, notes, and stage events via existing repositories, then format into the system prompt.

System prompt structure:
```
You are an AI assistant helping with job applications. You have access to the following context about this job:
- Job title and description
- Company information
- Match analysis (if available)
- Notes from the user
- Application stage history

Rules:
1. Only answer from the provided context above.
2. For each claim, cite which source section it comes from.
3. If the answer is not in the context, say so explicitly.
4. Do not invent information not present in the context.
```

### Relevant Files

- `apps/api/src/domains/jobs/jobs-events.resolver.ts` — Reference: subscription resolver with `async *` generator
- `apps/api/src/domains/jobs/job-event.bus.ts` — Reference: JobEventBus with `forJob` scoping
- `apps/api/src/domains/jobs/job.events.ts` — Reference: domain event definitions
- `apps/api/src/domains/jobs/job-event.types.ts` — Reference: subscription event GraphQL types
- `apps/api/src/domains/extension-activity/extension-activity-event.bus.ts` — Reference: simpler EventBus (no job scoping)
- `apps/api/src/lib/domain-event.ts` — Base EventBus implementation
- `apps/api/src/lib/ai/ai-base.service.ts` — Base AI service with streaming support

### Dependent Files

- `apps/api/src/domains/ai-chat/ai-chat-event.bus.ts` — Created here
- `apps/api/src/domains/ai-chat/ai-chat.events.ts` — Created here
- `apps/api/src/domains/ai-chat/ai-chat-generation.service.ts` — Created here
- `apps/api/src/domains/ai-chat/ai-chat-event.types.ts` — Created here
- `apps/api/src/domains/ai-chat/ai-chat.resolver.ts` — Modified (add mutation + subscription)
- `apps/api/src/domains/ai-chat/ai-chat.module.ts` — Modified (register new providers)

### Related ADRs

- [ADR-004: Stream First, Persist AI Message on Completion](../adrs/adr-004.md) — Streaming approach

## Deliverables

- `apps/api/src/domains/ai-chat/ai-chat-event.bus.ts`
- `apps/api/src/domains/ai-chat/ai-chat.events.ts`
- `apps/api/src/domains/ai-chat/ai-chat-event.types.ts`
- `apps/api/src/domains/ai-chat/ai-chat-generation.service.ts`
- Modified `ai-chat.resolver.ts` (add `askAiQuestion` + `aiMessageStreamed`)
- Modified `ai-chat.module.ts` (wire event bus + generation service)
- Test coverage >= 80%

## Tests

### Unit Tests

- [ ] AiChatEventBus: eventsOf filters by conversationId
- [ ] AiChatGenerationService: calls `AiBaseService.callAi()` with correct context
- [ ] AiChatService.askQuestion: starts streaming and returns immediately
- [ ] System prompt includes all context fields (job, company, match, notes, events)
- [ ] Error handling: AI failure emits completion event without persisting messages

### Integration Tests

- [ ] `askAiQuestion` mutation returns `{ success: true }`
- [ ] `aiMessageStreamed` subscription delivers tokens and completion event
- [ ] After stream completes, `aiMessages` query returns both user + AI messages
- [ ] Unauthenticated requests for subscription return 401

## Success Criteria

- [ ] End-to-end streaming works: ask → subscribe → receive tokens → messages persisted
- [ ] System prompt enforces grounding with source citations
- [ ] All tests passing
- [ ] Test coverage >= 80%
