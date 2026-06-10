---
status: pending
title: "View-model: sendMessage, startNewConversation, stream cleanup"
type: web
complexity: medium
dependencies:
  - task_02
---

# Task 05a: View-model — `sendMessage`, `startNewConversation`, stream cleanup

## Overview

Change the conversation creation flow: instead of creating a conversation with a separate button action, conversations are only created when the user sends the first message. This eliminates a redundant API call and simplifies the UX.

**Scope: view-model hook only.** Component changes are in task 05b.

## Background

Currently `useChatPanelViewModel` exposes `createConversation` and `askQuestion(conversationId, content)`. The UI calls `createConversation()` → sets `activeConversationId` → then `askQuestion(id, content)`.

**New contract:** replace both with `sendMessage(content)` that creates the conversation atomically.

## Requirements

### 1. Interface changes

```typescript
interface ChatPanelViewModel {
  conversations: Array<{ id: string; title: string; createdAt: string }>;
  activeConversationId: string | null;
  isNewConversation: boolean; // NEW
  messages: Array<{ id: string; role: AiMessageRole; content: string; createdAt: string }>;
  loading: boolean;
  isCreating: boolean; // STAYS
  isStreaming: boolean;
  isSending: boolean; // NEW — isCreating || isStreaming
  streamContent: string;
  sendMessage: (content: string) => Promise<void>; // NEW — replaces create + ask
  deleteConversation: (id: string) => Promise<void>; // SAME
  switchConversation: (id: string | null) => void; // SAME contract, NEW: resets stream + isNewConversation
  startNewConversation: () => void; // NEW
}
```

**Removed:** `createConversation`, `askQuestion`

### 2. `sendMessage` logic

```typescript
async function sendMessage(content: string): Promise<void> {
  if (!content.trim()) return;

  if (isNewConversation) {
    const [createErr, createResult] = await tryRun(createConversationMut({ variables: { jobId } }));
    if (createErr || !createResult?.data?.createAiConversation) return;

    const newId = createResult.data.createAiConversation.id;
    setIsNewConversation(false);
    setActiveConversationId(newId);
  }

  const convId = activeConversationId!;
  const [askErr] = await tryRun(askQuestionMut({ variables: { conversationId: convId, content } }));
  if (askErr) return;

  setIsStreaming(true);
}
```

### 3. Stream cleanup in `switchConversation`

MUST reset all stream-related state before changing `activeConversationId`:

```typescript
function switchConversation(id: string | null): void {
  setIsStreaming(false);
  setStreamContent("");
  setIsNewConversation(false);
  setActiveConversationId(id);
}
```

### 4. `startNewConversation` guard

```typescript
function startNewConversation(): void {
  if (isStreaming || isNewConversation) return;
  setIsNewConversation(true);
  setActiveConversationId(null);
}
```

### 5. `isSending` derivation

```typescript
const isSending = isCreating || isStreaming;
```

### 6. Subscription unchanged

```typescript
useAiMessageStreamedSubscription({
  variables: { conversationId: activeConversationId! },
  skip: !isStreaming || !activeConversationId,
  onData: ... // same as before
});
```

## Edge cases (covered by guards)

| State transition                                        | Expected behavior                                                       |
| ------------------------------------------------------- | ----------------------------------------------------------------------- |
| `isNewConversation=true` + select existing conversation | `switchConversation` clears `isNewConversation`, loads messages         |
| `isNewConversation=true` + Back                         | `switchConversation(null)` → back to list                               |
| `isNewConversation=true` + startNewConversation again   | Guard: no-op                                                            |
| Streaming + startNewConversation                        | Guard: no-op                                                            |
| Streaming + switch conversation                         | switchConversation clears stream, old subscription dies, new one starts |
| Streaming + Back                                        | switchConversation(null) clears everything                              |

## Stream/cache concerns

| Concern                                                      | Mitigation                                                      |
| ------------------------------------------------------------ | --------------------------------------------------------------- |
| Subscription `skip: !isStreaming \|\| !activeConversationId` | Safe — create sets id first, then ask sets isStreaming          |
| Nova conversa não aparece na lista                           | Após `completed` do stream, fazer refetch da lista de conversas |
| Duplo send                                                   | `isSending` bloqueia input durante toda a operação              |

## Files to modify

| File                                  | Change                                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| `hooks/useChatPanelViewModel.ts`      | New interface, `sendMessage`, `startNewConversation`, stream cleanup in `switchConversation` |
| `hooks/useChatPanelViewModel.test.ts` | Replace `createConversation`/`askQuestion` tests with `sendMessage` + `startNewConversation` |

## Deliverables

- Modified `useChatPanelViewModel.ts`
- Updated tests
- `pnpm typecheck` + `pnpm lint`

## Success criteria

- `sendMessage` with `isNewConversation` creates + asks atomically
- `sendMessage` with existing conversation just asks
- `switchConversation` clears stream + `isNewConversation`
- `startNewConversation` is guarded (no-op when streaming or already pre-chat)
- `isSending` = `isCreating || isStreaming`
- All existing tests updated, typecheck + lint pass
