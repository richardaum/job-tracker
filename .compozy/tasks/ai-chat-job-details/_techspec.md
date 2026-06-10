# TechSpec: AI Chat Tab in Job Details Side Panel

## Executive Summary

Add an "AI Chat" tab to the job details side panel (alongside Notes and History). Users create multiple persistent conversations per job (each conversation is isolated — aware only of its own messages), ask questions grounded in full job context, and receive streaming AI responses via GraphQL Subscription.

Two new backend entities (`AiConversation`, `AiMessage`), an `AiChatModule` domain module (resolver, service, repository, event bus, GraphQL types), and a frontend `ChatPanel` component. Streaming follows the existing EventBus + Subscription pattern. AI integration reuses `AiBaseService` with a new `AiChatGenerationService`.

**Primary trade-off:** Streaming tokens before persisting (ADR-004) means message IDs are only available on stream completion and partial responses are lost on client disconnect. Simpler data model with no orphaned rows.

## System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (web)                        │
│                                                         │
│  ActivitySidePanel (modified)                           │
│    ├── Tabs: Notes | History | AI Chat (new)            │
│    └── ChatPanel (new)                                  │
│          ├── ConversationList (sidebar)                 │
│          ├── MessageList (scrollable, auto-scroll)      │
│          └── ChatComposer (input at bottom)             │
│                                                         │
│  Hooks: useChatPanelViewModel (new)                     │
│  GQL: AiConversations, AiMessages, AskAiQuestion,       │
│        CreateAiConversation, DeleteAiConversation,       │
│        AiMessageStreamed (subscription)                 │
└──────────────────────┬──────────────────────────────────┘
                       │ GraphQL
┌──────────────────────▼──────────────────────────────────┐
│                    Backend (api)                         │
│                                                         │
│  AiChatModule (new)                                       │
│    ├── AiChatResolver (queries + mutations + subscription)│
│    ├── AiChatService (orchestrates AI calls)              │
│    ├── AiChatRepository (thin CRUD)                       │
│    ├── AiChatEventBus (extends EventBus)                  │
│    └── AiChatGenerationService (extends AiBaseService)            │
│                                                         │
│  Events: AiMessageTokenReceived, AiMessageCompleted     │
│  Entities: AiConversationEntity, AiMessageEntity        │
└──────────────────────┬──────────────────────────────────┘
                       │ TypeORM
┌──────────────────────▼──────────────────────────────────┐
│                    Database                              │
│                                                         │
│  ai_conversations                                       │
│  ai_messages                                            │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. User types question in ChatComposer → `askAiQuestion(conversationId, content)` mutation
2. AiChatService validates access, starts background AI stream, returns `{ success: true }`
3. Client subscribes to `aiMessageStreamed(conversationId)` — receives tokens
4. AiChatGenerationService calls OpenAI with full job context via `AiBaseService.callAi()` with streaming
5. As tokens arrive, AiChatService emits `AiMessageTokenReceived` events via AiChatEventBus
6. Subscription delivers tokens to the client → MessageList appends tokens optimistically
7. On stream complete, AiChatService inserts user message + AI message rows atomically
8. AiChatService emits `AiMessageCompleted` with both message IDs → client finalizes the message UI

## Implementation Design

### Core Interfaces

```typescript
// apps/api/src/domains/ai-chat/ai-chat.service.ts
@Injectable()
export class AiChatService {
  constructor(
    private readonly repo: AiChatRepository,
    private readonly generationService: AiChatGenerationService,
    private readonly eventBus: AiChatEventBus,
    private readonly jobsRepo: JobsRepository,
  ) {}

  async createConversation(jobId: string, userId: string): Promise<AiConversationType>;
  async listConversations(jobId: string, userId: string): Promise<AiConversationType[]>;
  async deleteConversation(id: string, userId: string): Promise<DeleteMutationPayloadType>;

  async askQuestion(conversationId: string, userId: string, content: string): Promise<AskQuestionPayloadType> {
    // 1. Validate job access
    // 2. Start background AI stream (non-blocking)
    // 3. Return success immediately
  }
}
```

```typescript
// apps/api/src/domains/ai-chat/ai-chat-event.bus.ts
@Injectable()
export class AiChatEventBus extends EventBus<{ readonly conversationId: string }> {
  forConversation(userId: string, conversationId: string) {
    const bus = this.forUser(userId);
    return {
      eventsOf: <T extends DomainEvent & { readonly conversationId: string }>(
        EventClass: new (...args: any[]) => T,
      ) => ({
        [Symbol.asyncIterator]: async function* () {
          for await (const event of bus.eventsOf(EventClass)) {
            if (event.conversationId === conversationId) yield event;
          }
        },
      }),
    };
  }
}
```

```typescript
// apps/api/src/domains/ai-chat/ai-chat.repository.ts
@Injectable()
export class AiChatRepository {
  constructor(
    @InjectRepository(AiConversationEntity)
    private readonly convRepo: Repository<AiConversationEntity>,
    @InjectRepository(AiMessageEntity)
    private readonly msgRepo: Repository<AiMessageEntity>,
  ) {}

  async findConversationsByJobId(jobId: string, userId: string): Promise<AiConversationEntity[]>;
  async findConversationById(id: string, userId: string): Promise<AiConversationEntity | null>;
  async createConversation(data: Partial<AiConversationEntity>): Promise<AiConversationEntity>;
  async deleteConversation(id: string, userId: string): Promise<void>;
  async findMessagesByConversationId(conversationId: string): Promise<AiMessageEntity[]>;
  async createMessagesBatch(messages: Partial<AiMessageEntity>[]): Promise<AiMessageEntity[]>;
}
```

### Data Models

```typescript
// apps/api/src/database/entities/ai-conversation.entity.ts
@Entity({ name: "ai_conversations" })
export class AiConversationEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "job_id", type: "text" })
  jobId!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ type: "text", default: "New conversation" })
  title!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
```

```typescript
// apps/api/src/database/entities/ai-message.entity.ts
@Entity({ name: "ai_messages" })
export class AiMessageEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "conversation_id", type: "text" })
  conversationId!: string;

  @Column({ type: "text" })
  role!: string; // "user" | "assistant"

  @Column({ type: "text" })
  content!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
```

**GraphQL types:**

```graphql
type AiConversation {
  id: ID!
  jobId: ID!
  title: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type AiMessage {
  id: ID!
  conversationId: ID!
  role: String!
  content: String!
  createdAt: DateTime!
}

type AiMessageStreamEvent {
  conversationId: ID!
  token: String # null on completion
  completed: Boolean!
  userMessageId: ID # null during streaming, set on completion
  aiMessageId: ID # null during streaming, set on completion
}
```

### API Endpoints

**Queries:**

| Operation                                         | Description                     |
| ------------------------------------------------- | ------------------------------- |
| `aiConversations(jobId: ID!): [AiConversation!]!` | List conversations for a job    |
| `aiMessages(conversationId: ID!): [AiMessage!]!`  | List messages in a conversation |

**Mutations:**

| Operation                                                                   | Description                                                               |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `createAiConversation(jobId: ID!): AiConversation!`                         | Create new conversation                                                   |
| `deleteAiConversation(id: ID!): DeleteMutationPayload!`                     | Delete conversation + its messages                                        |
| `askAiQuestion(conversationId: ID!, content: String!): AskQuestionPayload!` | Start streaming AI response, returns immediately with `{ success: true }` |

**Subscriptions:**

| Operation                                                       | Description                                        |
| --------------------------------------------------------------- | -------------------------------------------------- |
| `aiMessageStreamed(conversationId: ID!): AiMessageStreamEvent!` | Receive streaming tokens for the active AI message |

**Flow detail:**

1. Client calls `askAiQuestion(conversationId, content)` → validates, starts background stream, returns immediately
2. Client subscribes to `aiMessageStreamed(conversationId)` → receives tokens with `{ token, completed: false }`
3. Client appends tokens to a local message object (no DB ID yet)
4. On completion, server persists both messages and sends `{ token: null, completed: true, userMessageId, aiMessageId }`
5. Client replaces local message IDs with stable DB IDs

## Integration Points

### OpenAI

- **Purpose:** Generate AI responses to user questions about the job
- **Integration:** `AiChatGenerationService` extends `AiBaseService`, uses `callAi()` with streaming enabled
- **Context injection:** System prompt includes full job context (title, description, company, match analysis, notes, stage events) fetched by the service before calling AI
- **Grounding enforcement:** System prompt instructs AI to only answer from provided context, cite source sections for each claim, and explicitly state when information is not found in the context
- **Error handling:** If AI call fails, emit error event with `{ completed: true, error: message }`; no messages persisted

### Job Event Bus

- **Purpose:** Reuse existing `JobEventBus` for job-related events (optional — conversation events are separate)
- **No direct integration needed:** Chat has its own `AiChatEventBus`

## Impact Analysis

| Component                       | Impact Type | Description                                                | Required Action                               |
| ------------------------------- | ----------- | ---------------------------------------------------------- | --------------------------------------------- |
| `ActivitySidePanel.tsx`         | Modified    | Add "AI Chat" tab trigger + `ChatPanelTabsContent`         | Add tab to TabsList                           |
| `job-details-routes.ts`         | Modified    | Add `"chat"` to `JobSidePanel` type + `parseJobSidePanel`  | Extend union type and parser                  |
| `JobDetailsLayout.tsx`          | Unchanged   | Side panel already generic — `?s=chat` flows automatically | None                                          |
| `AiChatRoutePage.tsx`           | New         | Chat route page for mobile full-width mode                 | Create file + app router page                 |
| `ChatPanel.tsx`                 | New         | Main chat UI component                                     | Create in components/                         |
| `NotesPanel.tsx`                | Unchanged   | No changes needed                                          | None                                          |
| `apps/api/src/domains/ai-chat/` | New         | Full domain module (`AiChatModule`)                        | Create module, resolver, service, repo, types |
| `Database migrations`           | New         | Two new tables                                             | Create migration, register in index           |

## Testing Approach

### Unit Tests

- **AiChatService:** validate question submission, conversation CRUD, context assembly, error handling
- **AiChatRepository:** mock TypeORM repository, test find/create/delete/update queries
- **AiChatGenerationService:** mock `AiBaseService.callAi()`, verify prompt construction with job context

### Integration Tests

- **GraphQL operations:** test `createAiConversation`, `askAiQuestion`, `aiConversations` query against a test database
- **Subscription:** test `aiMessageStreamed` delivers tokens and completion event
- **Auth guards:** verify `@UseGuards(JwtAuthGuard, RolesGuard)` rejects unauthenticated requests

### Frontend Tests

- **ChatPanel:** render empty state, conversation list, messages, streaming indicator
- **ViewModel:** verify hooks correctly wire queries, mutations, and subscriptions
- **Component behavior:** auto-scroll, message input submit, conversation switching

## Development Sequencing

### Build Order

1. **Database migration + entities** — Create `ai_conversations` and `ai_messages` tables. Register migration in `migrations/index.ts`.
2. **Backend: AiChat domain module** (depends on 1) — Create `AiChatModule` with `AiChatRepository`, `AiChatService`, `AiChatResolver`, `AiChatEventBus`, `AiChatGenerationService`. Wire GraphQL types and inputs.
3. **Backend: Streaming** (depends on 2) — Implement `askAiQuestion` mutation with streaming via `AiChatEventBus` + `AiMessageTokenReceived`/`AiMessageCompleted` events. Batch insert on completion. Create `aiMessageStreamed` subscription.
4. **Frontend: Side panel integration** (depends on 1) — Add `"chat"` to `JobSidePanel` type, add tab to `ActivitySidePanel`, create `ChatPanelTabsContent`.
5. **Frontend: ChatPanel component** (depends on 4) — Build conversation list, message list with auto-scroll, chat composer, streaming UI.
6. **Frontend: ViewModel + GraphQL operations** (depends on 2, 3, 5) — Define `.graphql` operations (queries, mutations, subscription), run codegen, create `useChatPanelViewModel`.

### Technical Dependencies

- OpenAI API key must be configured (already present)
- GraphQL codegen must be run after backend changes (`pnpm --filter @job-tracker/web run codegen`)
- PM2 restart required after backend changes to regenerate `schema.gql`

## Monitoring and Observability

### Key Metrics

| Metric                                    | Source                      | Threshold           |
| ----------------------------------------- | --------------------------- | ------------------- |
| AI response latency (time to first token) | Client-side measurement     | p95 < 3s            |
| AI response errors                        | AiChatService error log     | < 5% of invocations |
| Messages created per conversation         | DB query                    | Monitor growth      |
| Subscription delivery lag                 | Server-side event timestamp | < 500ms             |

### Log Events

```
[AiChatGenerationService] Asking AI question: conversationId={id}, jobId={id}
[AiChatGenerationService] AI stream completed: conversationId={id}, tokens={count}
[AiChatGenerationService] AI stream failed: conversationId={id}, error={message}
[AiChatService] Conversation created: conversationId={id}, jobId={id}, userId={id}
[AiChatService] Conversation deleted: conversationId={id}
```

## Technical Considerations

### Key Decisions

| Decision       | Choice                                        | Rationale                                                             | Trade-off                                           |
| -------------- | --------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------- |
| Data model     | Normalized tables (ADR-003)                   | Queryable rows, consistent with existing entities                     | Additional table vs JSONB simplicity                |
| Streaming      | Stream first, persist on completion (ADR-004) | Single batch write, no orphaned rows                                  | Message IDs only at end; partial lost on disconnect |
| Side panel tab | Always visible                                | Consistent UX, same as Notes/History                                  | Always visible even if unused                       |
| AI service     | New `AiChatGenerationService`                 | Follows existing domain-specific AI pattern (`NoteGenerationService`) | New file vs. generic AI service                     |

### Known Risks

| Risk                                                | Likelihood | Mitigation                                                                                                                                                                                                                                                                               |
| --------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client disconnect mid-stream loses partial response | Low        | User can re-ask; server stops stream on socket close                                                                                                                                                                                                                                     |
| Conversation list grows large for power users       | Medium     | Soft delete + archive after 50 conversations per job                                                                                                                                                                                                                                     |
| AI hallucinates job data                            | Medium     | System prompt enforces grounding: AI must only answer from provided context, cite source sections (job description, notes, match analysis) for each claim, and state when information is not found in the context. Responses that cannot be grounded must be prefixed with a disclaimer. |
| OpenAI API latency spikes                           | Low        | Timeout per request (30s); retry once on transient error                                                                                                                                                                                                                                 |

## Architecture Decision Records

- [ADR-002: Dedicated AI Chat Tab in Side Panel](adrs/adr-002.md) — Selected product approach
- [ADR-003: Normalized Data Model for AI Conversations](adrs/adr-003.md) — Separate tables for conversations and messages
- [ADR-004: Stream First, Persist AI Message on Completion](adrs/adr-004.md) — Tokens streamed before persistence, batch insert on completion
