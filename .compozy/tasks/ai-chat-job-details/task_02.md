---
status: completed
title: AiChat CRUD — backend module
type: api
complexity: medium
dependencies:
  - task_01
---

# Task 02: AiChat CRUD — backend module

## Overview

Create the `AiChatModule` domain module with thin repository, service, and resolver for conversation and message CRUD operations. This covers listing conversations, creating conversations, deleting conversations, and listing messages — but NOT the AI streaming (task 03).

<critical>

- Read `_prd.md` and `_techspec.md` before starting
- Reference TechSpec "Data Models" and "API Endpoints" sections for type definitions
- Reference TechSpec "Core Interfaces" section for service/repository contracts
- Tests required — all CRUD paths must be covered
- Module MUST import AuthModule (JwtAuthGuard + RolesGuard requirement)

</critical>

<requirements>

1. MUST create `AiChatModule` in `apps/api/src/domains/ai-chat/` importing `AuthModule` and `TypeOrmModule.forFeature([AiConversationEntity, AiMessageEntity])`
2. MUST create `AiChatRepository` with thin CRUD: `findConversationsByJobId`, `findConversationById`, `createConversation`, `deleteConversation`, `findMessagesByConversationId`, `createMessagesBatch`
3. MUST create `AiChatService` with methods: `createConversation`, `listConversations`, `deleteConversation`, `listMessages`
4. MUST create `AiChatResolver` with `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(RoleEnum.User)`
5. MUST expose GraphQL queries: `aiConversations(jobId: ID!): [AiConversation!]!`, `aiMessages(conversationId: ID!): [AiMessage!]!`
6. MUST expose GraphQL mutations: `createAiConversation(jobId: ID!): AiConversation!`, `deleteAiConversation(id: ID!): DeleteMutationPayload!`
7. MUST follow thin repository pattern — no business logic in repo, only read/write translations
8. Delete conversation MUST cascade-delete all its messages

</requirements>

## Subtasks

- [x] Create GraphQL types: `AiConversationType`, `AiMessageType`, `AiConversationInput`
- [x] Create `AiChatRepository` with thin CRUD methods
- [x] Create `AiChatService` with conversation + message orchestration
- [x] Create `AiChatResolver` with queries and mutations
- [x] Create `AiChatModule` wiring everything together
- [x] Register module in the appropriate parent module
- [x] Verify with `pnpm typecheck` + `pnpm test`

## Implementation Details

Follow the `NotesModule` pattern: `notes.module.ts` imports `TypeOrmModule.forFeature`, `AuthModule`, and registers providers. The resolver follows `notes.resolver.ts` pattern.

Delete mutation must use `DeleteMutationPayloadType` from `apps/api/src/domains/shared/delete-mutation-payload.type.ts`.

AiChatRepository `deleteConversation` must also delete associated messages (either via CASCADE in migration or explicit repository delete). Prefer explicit delete in the same transaction.

### Relevant Files

- `apps/api/src/domains/notes/notes.module.ts` — Reference: module structure for domain module
- `apps/api/src/domains/notes/notes.resolver.ts` — Reference: resolver pattern with guards
- `apps/api/src/domains/notes/notes.service.ts` — Reference: service pattern
- `apps/api/src/domains/notes/notes.repository.ts` — Reference: thin repository pattern
- `apps/api/src/domains/notes/note.type.ts` — Reference: GraphQL type pattern
- `apps/api/src/domains/notes/create-note.input.ts` — Reference: input type pattern
- `apps/api/src/domains/shared/delete-mutation-payload.type.ts` — Shared delete payload type

### Dependent Files

- `apps/api/src/domains/ai-chat/ai-chat.resolver.ts` — Created here
- `apps/api/src/domains/ai-chat/ai-chat.service.ts` — Created here
- `apps/api/src/domains/ai-chat/ai-chat.repository.ts` — Created here
- `apps/api/src/domains/ai-chat/ai-chat.module.ts` — Created here
- GraphQL types in `apps/api/src/domains/ai-chat/` — Created here

### Related ADRs

- [ADR-002: Dedicated AI Chat Tab in Side Panel](../adrs/adr-002.md) — Product approach
- [ADR-003: Normalized Data Model for AI Conversations](../adrs/adr-003.md) — Data model decision

## Deliverables

- `apps/api/src/domains/ai-chat/ai-chat.module.ts`
- `apps/api/src/domains/ai-chat/ai-chat.resolver.ts`
- `apps/api/src/domains/ai-chat/ai-chat.service.ts`
- `apps/api/src/domains/ai-chat/ai-chat.repository.ts`
- `apps/api/src/domains/ai-chat/ai-conversation.type.ts`
- `apps/api/src/domains/ai-chat/ai-message.type.ts`
- Test coverage >= 80%

## Tests

### Unit Tests

- [x] AiChatRepository: createConversation inserts row and returns entity
- [x] AiChatRepository: findConversationsByJobId returns conversations for job
- [x] AiChatRepository: deleteConversation deletes conversation + messages
- [x] AiChatRepository: findMessagesByConversationId returns ordered messages
- [x] AiChatService: createConversation validates job access, calls repo
- [x] AiChatService: deleteConversation throws NotFoundException if not found
- [x] AiChatService: listConversations returns conversations ordered by recent

### Integration Tests

- [x] `createAiConversation` mutation creates conversation and returns it
- [x] `aiConversations` query returns conversations for a job
- [x] `aiMessages` query returns messages in a conversation
- [x] `deleteAiConversation` mutation deletes conversation + messages
- [x] Unauthenticated requests return 401

## Success Criteria

- [x] All CRUD operations work end-to-end via GraphQL
- [x] Auth guards block unauthenticated access
- [x] All tests passing
- [x] Test coverage >= 80%
