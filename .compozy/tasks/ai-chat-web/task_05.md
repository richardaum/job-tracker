---
status: pending
title: "Create conversation on first message + state cleanup guards"
type: web
complexity: medium
dependencies:
  - task_02
---

# Task 05: Create conversation on first message + state cleanup guards

## Overview

Change the conversation creation flow: instead of creating a conversation with a separate button action, conversations are only created when the user sends the first message. This eliminates a redundant API call and simplifies the UX.

**Critical:** the implementation must handle stream state cleanup when switching conversations. Previous analysis identified edge cases where `isStreaming` and `streamContent` remain dirty after conversation switches.

## Background

Currently, clicking "New conversation" calls `createConversation` mutation, which creates a conversation in the DB and sets `activeConversationId`. The user then types a message and clicks send, which calls `askQuestion`.

**New flow:**

1. User clicks "New conversation" — **no API call**, enters pre-chat UI state (`isNewConversation: true`)
2. Chat view renders with composer enabled, empty messages, "New conversation" header
3. User types and sends message → `sendMessage(content)` creates the conversation **atomically with** the first question
4. On success, `isStreaming = true` and the existing subscription takes over

### Full-width split layout (desktop `?w=full`)

In full-width mode the AI Chat has enough horizontal space for a side-by-side layout. The conversation list and the active chat should render as two columns instead of stacked navigation:

```
┌─────────────┬──────────────────────────────────────┐
│             │                                      │
│  Conversation │   Messages + Composer                │
│  List        │                                      │
│             │                                      │
│  [New Chat] │   (chat view or empty state)          │
│  ─────────  │                                      │
│  Chat 1     │                                      │
│  Chat 2     │                                      │
│  Chat 3     │                                      │
│             │                                      │
└─────────────┴──────────────────────────────────────┘
```

**Rules:**

- Only applies when `fullWidth=true` (desktop `?w=full` or mobile)
- Side panel mode (`?s=chat`, 360px) keeps stack navigation
- Left column: ~280px, scrollable conversation list
- Right column: flex-1, chat view (messages + composer) or empty state when nothing is active
- When `isNewConversation`: left shows list, right shows composer ready
- "New Chat" button stays in the header slot (already done)
- Selecting a conversation updates the right column — left list stays visible
- `back` behavior: if `fullWidth`, back voltapara a lista na coluna direita (nao precisa de back button)

## Requirements

### 1. View-model hook changes (`useChatPanelViewModel.ts`)

**Interface changes:**

```typescript
interface ChatPanelViewModel {
  conversations: Array<{ id: string; title: string; createdAt: string }>;
  activeConversationId: string | null;
  isNewConversation: boolean; // NEW
  messages: Array<{ id: string; role: AiMessageRole; content: string; createdAt: string }>;
  loading: boolean;
  isCreating: boolean; // STAYS — mutation loading state
  isStreaming: boolean;
  isSending: boolean; // NEW — isCreating || isStreaming
  streamContent: string;
  sendMessage: (content: string) => Promise<void>; // REPLACES createConversation + askQuestion
  deleteConversation: (id: string) => Promise<void>; // SAME
  switchConversation: (id: string | null) => void; // REPLACES: sets id; resets isNewConversation=false
  startNewConversation: () => void; // NEW: sets isNewConversation=true, no API call
}
```

**Removed from public interface:**

- `createConversation` — becomes internal helper
- `askQuestion` — merged into `sendMessage`
- `isCreating` stays as internal state (exposed via `isSending`)

### 2. Stream cleanup on conversation switch

`switchConversation` MUST reset all stream-related state before changing `activeConversationId`:

```typescript
function switchConversation(id: string | null): void {
  setIsStreaming(false);
  setStreamContent("");
  setIsNewConversation(false);
  setActiveConversationId(id);
}
```

**Edge cases covered:**

- Switching to another conversation while streaming
- Going back to list while streaming
- Starting a new conversation while streaming

### 3. `startNewConversation` guard

Must be a no-op if already in pre-chat mode or currently streaming:

```typescript
function startNewConversation(): void {
  if (isStreaming || isNewConversation) return;
  setIsNewConversation(true);
  setActiveConversationId(null);
}
```

### 4. `sendMessage` logic

```typescript
async function sendMessage(content: string): Promise<void> {
  if (!content.trim()) return;
  setIsSending(true);

  if (isNewConversation) {
    // Create conversation first, then ask question
    const [createErr, createResult] = await tryRun(createConversationMut({ variables: { jobId } }));

    if (createErr || !createResult?.data?.createAiConversation) {
      setIsSending(false);
      return;
    }

    const newId = createResult.data.createAiConversation.id;
    setIsNewConversation(false);
    setActiveConversationId(newId);
  }

  // askQuestion — relies on activeConversationId being set
  const convId = activeConversationId!;
  const [askErr] = await tryRun(askQuestionMut({ variables: { conversationId: convId, content } }));

  if (askErr) {
    setIsSending(false);
    return;
  }

  setIsStreaming(true);
  setIsSending(false);
}
```

### 5. Full-width split layout

**AiChatContent** must accept `fullWidth?: boolean` prop. When `fullWidth=true`, render a two-column grid:

```tsx
type AiChatContentProps = { jobId: string; fullWidth?: boolean; className?: string };
```

```
fullWidth=false (side panel) →        fullWidth=true (desktop full / mobile) →
┌────────────────────┐                ┌────────────┬─────────────────────┐
│ Stack navigation   │                │ List (280px)│ Chat (flex-1)        │
│                    │                │            │                      │
│  List ↔ Chat      │                │  List      │  Messages + Composer │
│                    │                │  always    │                      │
└────────────────────┘                │  visible   │                      │
                                      └────────────┴─────────────────────┘
```

In full-width mode:

- `AiChatConversationListView` renders on the left (280px, scrollable, no back button)
- `AiChatChatView` renders on the right (flex-1) when `activeConversationId !== null || isNewConversation`
- When nothing active on the right, show an empty state ("Select or start a conversation")
- Selecting a conversation from the left list updates the right panel
- No "Back" button in `AiChatChatView` — the left column is always visible
- "New Chat" button in the header slot (already done) — closes the right panel if a conversation is active, shows composer ready

### 6. Component changes

**AiChatContent.tsx:**

```tsx
const showChat = vm.activeConversationId !== null || vm.isNewConversation;

return (
  <div>
    {showChat ? (
      <AiChatChatView
        isNewConversation={vm.isNewConversation}
        messages={messageItems}
        loading={vm.loading}
        conversationTitle={vm.isNewConversation ? "New conversation" : conversationTitle}
        onBack={() => vm.switchConversation(null)}
        streamContent={vm.streamContent}
        isStreaming={vm.isStreaming}
        onSend={(content) => void vm.sendMessage(content)}
        disabled={vm.isSending}
        messagesEndRef={messagesEndRef}
      />
    ) : (
      <AiChatConversationListView
        conversations={conversationItems}
        loading={vm.loading}
        onCreateConversation={() => vm.startNewConversation()}
        onSelectConversation={(id) => vm.switchConversation(id)}
        onDeleteConversation={(id) => void vm.deleteConversation(id)}
        isCreating={vm.isCreating}
      />
    )}
  </div>
);
```

**AiChatConversationListView.tsx** — no contract changes. `onCreateConversation` now triggers `startNewConversation` instead of API creation. The `isCreating` prop still shows loading state on the button while the send/create-create mutation runs.

**AiChatChatView.tsx:**

- Accept `isNewConversation?: boolean` prop
- When `isNewConversation`: header title = "New conversation", no empty state shown (composer is the primary action)
- `disabled` prop comes from `isSending` — covers both create + stream loading

**AiChatComposer.tsx** — no changes. `disabled` prop already handles all states.

## Stream/cache concerns

| Concern                                                      | Mitigation                                                                                                                                                      |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subscription `skip: !isStreaming \|\| !activeConversationId` | `sendMessage` first creates (sets id), then asks (sets isStreaming). Between the two, subscription stays skipped. Safe.                                         |
| Nova conversa não aparece na lista ao voltar                 | Apollo cache pode não adicionar automaticamente. Ao `completed` do stream, fazer refetch da lista de conversas ou usar cache update no `createConversationMut`. |
| Duas chamadas rápidas de send                                | `isSending` bloqueia o input durante toda a operação (create + ask). Frontend não permite segundo send.                                                         |

## Edge cases

| State transition                                         | Expected behavior                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `isNewConversation=true` + selecionar conversa existente | `switchConversation("conv-1")` → limpa `isNewConversation`, carrega mensagens        |
| `isNewConversation=true` + "Back"                        | `switchConversation(null)` → volta pra lista                                         |
| `isNewConversation=true` + "New conversation" de novo    | `startNewConversation()` é no-op                                                     |
| Streamando + "New conversation"                          | `startNewConversation()` verifica `isStreaming` e retorna sem ação                   |
| Streamando + trocar conversa                             | `switchConversation` limpa stream state, subscription morre, nova subscription nasce |
| Streamando + "Back"                                      | `switchConversation(null)` limpa tudo, subscription morre                            |

## Files to modify

| File                                  | Change                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `hooks/useChatPanelViewModel.ts`      | New interface, `sendMessage`, `startNewConversation`, stream cleanup in `switchConversation`       |
| `components/AiChatContent.tsx`        | Condição de toggle, wires para `sendMessage`/`startNewConversation`                                |
| `components/AiChatChatView.tsx`       | Aceitar `isNewConversation`, adaptar header                                                        |
| `hooks/useChatPanelViewModel.test.ts` | Substituir testes de `createConversation`/`askQuestion` por `sendMessage` + `startNewConversation` |
| `components/AiChatContent.test.tsx`   | Mocks para `sendMessage`, testar pre-chat state                                                    |
| `components/AiChatChatView.test.tsx`  | Testar `isNewConversation` variant                                                                 |

## Deliverables

- Modified `useChatPanelViewModel.ts`
- Modified `AiChatContent.tsx`
- Modified `AiChatChatView.tsx`
- Updated tests for all three files
- `pnpm typecheck` + `pnpm lint` pass

## Success criteria

- "New conversation" button não faz chamada à API
- Conversa só é criada no envio da primeira mensagem
- Trocar de conversa limpa todo estado de stream
- `isSending` bloqueia input durante create + ask
- `startNewConversation` é segura em qualquer estado
- Typecheck e lint passam
