# Task Memory: task_03.md

## Objective Snapshot

Implement streaming AI responses: `AiChatEventBus`, domain events (`AiMessageTokenReceived`, `AiMessageCompleted`), `AiChatGenerationService` (extends `AiBaseService`, OpenAI streaming), `AiMessageStreamEventType` GraphQL type, `askAiQuestion` mutation + `aiMessageStreamed` subscription.

## Important Decisions

- `AiChatGenerationService` extends `AiBaseService` but uses `OpenAIClient.getClient()` directly for streaming since `AiBaseService.callAi()` only supports blocking responses
- Used `Promise.race` between token and completion event iterators in the subscription resolver (instead of a single combined iterator) to deliver tokens and completion as separate stream events
- Background stream runs as fire-and-forget promise via `.then()` — no blocking on the mutation response
- On AI failure, emits `AiMessageCompleted` with empty IDs and no tokens persisted — no orphan rows

## Files / Surfaces

- **New:** `apps/api/src/domains/ai-chat/ai-chat-event.bus.ts`
- **New:** `apps/api/src/domains/ai-chat/ai-chat.events.ts`
- **New:** `apps/api/src/domains/ai-chat/ai-chat-event.types.ts`
- **New:** `apps/api/src/domains/ai-chat/ai-chat-generation.service.ts`
- **New:** `apps/api/src/domains/ai-chat/ask-question-payload.type.ts`
- **Modified:** `apps/api/src/domains/ai-chat/ai-chat.service.ts` — added `askQuestion`, `startBackgroundStream`
- **Modified:** `apps/api/src/domains/ai-chat/ai-chat.resolver.ts` — added `askAiQuestion`, `aiMessageStreamed`
- **Modified:** `apps/api/src/domains/ai-chat/ai-chat.module.ts` — wired new providers + NotesModule, MatchAnalysisModule, LibAiModule
- **Modified:** `apps/api/src/domains/jobs/jobs.module.ts` — exported `JobStageEventsRepository`
- **Modified:** `apps/api/src/domains/notes/notes.module.ts` — exported `NoteRepository`
- **Modified:** `apps/api/src/domains/ai-chat/ai-chat.service.spec.ts` — added mocks + askQuestion tests
- **Modified:** `apps/api/src/domains/ai-chat/ai-chat.resolver.spec.ts` — added askAiQuestion test + eventBus mock

## Deliverables Status

- [x] `apps/api/src/domains/ai-chat/ai-chat-event.bus.ts`
- [x] `apps/api/src/domains/ai-chat/ai-chat.events.ts`
- [x] `apps/api/src/domains/ai-chat/ai-chat-event.types.ts`
- [x] `apps/api/src/domains/ai-chat/ai-chat-generation.service.ts`
- [x] Modified `ai-chat.service.ts` (askQuestion + background stream)
- [x] Modified `ai-chat.resolver.ts` (askAiQuestion + aiMessageStreamed)
- [x] Modified `ai-chat.module.ts` (wire event bus + generation service)
- [x] Test coverage — 16 tests passed (2 files)

