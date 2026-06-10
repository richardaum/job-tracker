---
status: pending
title: "AiChatContent component (shared side panel + full width)"
type: web
complexity: high
dependencies:
  - task_01
---

# Task 02: `AiChatContent` component

## Overview

Replace the placeholder `AiChatContent` with the full chat UI. Shared between side panel (`AiChatTabPanel`) and full width (`chat/page.tsx`). Consumes `useChatPanelViewModel`.

**Stack navigation:** `activeConversationId === null` → conversation list, `!== null` → chat view with back button. Works in both 360px and full-width layouts.

<critical>
- Reference `NotesPanel.tsx` for scroll, composer, auto-scroll patterns
- **DIP**: each sub-component defines its own minimal local interfaces — no GraphQL types in presentational components
- **States**: every view handles loading, empty, and data states. Chat view also handles streaming.
- Sub-component contracts are the interface boundary — keep them stable
- Tests required for each sub-component
</critical>

## Requirements

1. File: `apps/web/src/modules/jobs/details/components/AiChatContent.tsx`
2. Accept `jobId: string` + optional `className`
3. Uses `useChatPanelViewModel(jobId)` for all data
4. Maps view-model types to local interfaces at the orchestration boundary (useMemo for stability)
5. Renders one of two views:
   - `activeConversationId === null` → `AiChatConversationListView`
   - `activeConversationId !== null` → `AiChatChatView`
6. Sub-components in separate files (see Subtasks)
7. `cn()` for className, no `forwardRef`

## Sub-component contracts

### AiChatConversationListView

```
Props:
  conversations: ConversationItem[]      // local type: { id, title, createdAt }
  loading: boolean                       // shows skeleton when true + empty
  onCreateConversation: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  isCreating: boolean                    // loading state on create button

States:
  loading && empty → skeleton/spinner
  !loading && empty → AiChatEmptyState variant="no-conversations"
  has data → header + scrollable list + delete per item
```

### AiChatChatView

```
Props:
  messages: MessageItem[]                // local type: { id, role, content, createdAt }
  loading: boolean                       // skeleton when true + empty
  conversationTitle: string
  onBack: () => void
  streamContent?: string
  isStreaming: boolean
  onSend: (content: string) => void
  disabled: boolean                      // input empty or streaming
  messagesEndRef: RefObject<HTMLDivElement | null>

States:
  loading && empty → skeleton/spinner
  !loading && empty && !streaming → AiChatEmptyState variant="no-messages"
  has data or streaming → AiChatMessageList + AiChatComposer
```

### AiChatMessageList

```
Props:
  messages: MessageItem[]
  streamContent?: string
  isStreaming: boolean

Renders each message as AiMessageBubble.
Appends a stream bubble (AiMessageBubble with isStreaming) at the end when streaming.
Auto-scrolls to bottom on messages/streamContent change.
```

### AiMessageBubble

```
Props:
  content: string
  role: AiMessageRole                    // from @/gql/hooks
  isStreaming?: boolean
  hasError?: boolean
  onRetry?: () => void

Variants:
  User  → right-aligned, bg-bg-brand-subtle, rounded-2xl rounded-br-sm
  AI    → left-aligned, bg-bg-surface-hover, rounded-2xl rounded-bl-sm, ChatDotsIcon badge
  Stream → AI variant + animated pulse cursor at end of text
  Error → AI variant + "Failed to generate" message + Retry button
```

### AiChatComposer

```
Props:
  onSend: (content: string) => void
  disabled: boolean                      // input empty
  isStreaming: boolean                   // button state="loading"

Text input + Send button.
Button disabled when input empty or streaming.
Button state="loading" when streaming (follows web-ui.md button pattern).
Enter to send.
```

### AiChatEmptyState

```
Props:
  variant: "no-conversations" | "no-messages"

Renders icon + message matching the variant.
```

## Subtasks

- [ ] 2.1 `AiChatConversationListView.tsx` — loading/empty/data states, create/select/delete callbacks
- [ ] 2.2 `AiChatChatView.tsx` — loading/empty/data/streaming states, chrome (back header + composer)
- [ ] 2.3 `AiChatMessageList.tsx` — render messages + stream bubble + auto-scroll
- [ ] 2.4 `AiChatComposer.tsx` — text input + send button + Enter to send
- [ ] 2.5 `AiMessageBubble.tsx` — user/AI/streaming/error variants
- [ ] 2.6 `AiChatEmptyState.tsx` — two variants
- [ ] 2.7 `AiChatContent.tsx` — orchestrator: consume view-model, map types, compose sub-components
- [ ] 2.8 Unit tests for each file

## Implementation Notes (high-level)

**Mapping view-model to local types (in AiChatContent):**

- Derive `conversationItems` from view-model conversations (pick id, title, createdAt)
- Derive `messageItems` from view-model messages (pick id, role, content, createdAt)
- Derive `conversationTitle` by finding active conversation in conversations list
- Use `useMemo` so sub-components don't re-render on unrelated changes

**Auto-scroll (follows NotesPanel):**

- A `div ref` at the end of the message list
- `useEffect` scrolls it into view when messages or streamContent change
- Track scroll position — only auto-scroll if near the bottom

**Composer wiring:**

- Local state: `[draft, setDraft]`
- `canSend` = `draft.trim().length > 0`
- `onSend` = `(content) => askQuestion(activeConversationId, content)`
- On send, clear draft

**Desktop redirect flash:** The full-width route renders briefly before redirect to `?s=chat` on desktop. Initial render is identical (no active conversation = show list) — no special handling needed beyond not erroring on first render.

### Relevant Files

| File                                                                  | Reason                              |
| --------------------------------------------------------------------- | ----------------------------------- |
| `apps/web/src/modules/jobs/details/components/NotesPanel.tsx`         | Reference: layout, scroll, composer |
| `apps/web/src/modules/jobs/details/hooks/useChatPanelViewModel.ts`    | View-model (task 01)                |
| `apps/web/src/modules/jobs/details/hooks/useNotesComposerBehavior.ts` | Reference: auto-scroll              |

### Dependent Files

| File                                                           | Reason               |
| -------------------------------------------------------------- | -------------------- |
| `AiChatContent.tsx`                                            | Modified             |
| `AiChatConversationListView.tsx` + `AiChatChatView.tsx` + etc. | Created              |
| `AiChatTabPanel.tsx`                                           | Pass jobId (task 04) |
| `chat/page.tsx`                                                | Pass jobId (task 03) |

## Deliverables

- `AiChatContent.tsx` — orchestrator
- `AiChatConversationListView.tsx`
- `AiChatChatView.tsx`
- `AiChatMessageList.tsx`
- `AiChatComposer.tsx`
- `AiMessageBubble.tsx`
- `AiChatEmptyState.tsx`
- Unit tests for each
- `pnpm typecheck` + `pnpm lint`

## Tests

- Each sub-component renders all its states (loading, empty, data, streaming where applicable)
- `AiChatConversationListView`: skeleton on loading, empty state, list on data, callbacks fire
- `AiChatChatView`: skeleton on loading, empty state, messages on data, stream bubble, back callback
- `AiChatMessageList`: renders messages + stream bubble, auto-scrolls
- `AiChatComposer`: calls onSend, disabled when empty, state="loading" when streaming
- `AiMessageBubble`: user right/AI left, streaming cursor, error retry
- `AiChatEmptyState`: correct message per variant
- `AiChatContent`: switches between list/chat views based on activeConversationId

## Success Criteria

- Stack navigation: list → select → chat → back → list
- All states: loading, empty, data, streaming (chat), error (per-message)
- DIP: sub-components use local interfaces, not GraphQL types
- Works in both side panel and full-width
- All tests passing, coverage >= 80%
