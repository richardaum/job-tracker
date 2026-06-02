# Task Memory: task_02.md

## Objective Snapshot

Create AiChatModule with thin repository, service, resolver, and GraphQL types for conversation + message CRUD. No AI streaming (task 03).

## Important Decisions

- AiChatService uses JobsRepository directly for job access validation (instead of a `hasJob` helper in AiChatRepository), keeping AiChatRepository focused only on ai-chat tables.
- deleteConversation in AiChatRepository explicitly deletes messages first, then the conversation row — consistent with the thin repository pattern (service handles "find then delete" orchestration).

## Learnings

- The existing NoteRepository pattern uses a `hasJob` method that crosses entity boundaries (JobEntity), but for this module, injecting JobsRepository into the service is cleaner since the repository should be thin to its own tables.
- Test pattern follows notes resolver spec: GraphQLModule.forRoot with autoSchemaFile, overrideGuard for JwtAuthGuard + RolesGuard.

## Files / Surfaces

- apps/api/src/domains/ai-chat/ai-conversation.type.ts (new)
- apps/api/src/domains/ai-chat/ai-message.type.ts (new)
- apps/api/src/domains/ai-chat/ai-chat.repository.ts (new)
- apps/api/src/domains/ai-chat/ai-chat.service.ts (new)
- apps/api/src/domains/ai-chat/ai-chat.resolver.ts (new)
- apps/api/src/domains/ai-chat/ai-chat.module.ts (new)
- apps/api/src/domains/ai-chat/ai-chat.service.spec.ts (new)
- apps/api/src/domains/ai-chat/ai-chat.resolver.spec.ts (new)
- apps/api/src/app.module.ts (modified — added AiChatModule import)

## Errors / Corrections

None.

## Ready for Next Run

Task 02 complete. Ready for task 03 (streaming AI responses).
