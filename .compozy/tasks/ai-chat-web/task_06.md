---
status: pending
title: "Optimistic user message feedback (instant visual)"
type: web
complexity: medium
dependencies:
  - task_05b
---

# Task 06: Optimistic user message feedback — instant visual

## Overview

Show the user's message in the chat immediately on send, before the mutation completes or the AI stream finishes. Currently the user's message is invisible until `refetchMessages` runs after streaming completes (~2-30s later).

## Problem

```
Current flow:
  sendMessage("Qual o salário?")
    → askQuestionMut (RTT ~50ms)
    → setIsStreaming(true)
    → subscription tokens (2-30s)
    → completed → refetchMessages() → mensagem aparece

Usuário vê:                                   gap sem feedback ←
  [vazio] → [streaming tokens da IA] → [pergunta + resposta]
```

A pergunta do usuário fica invisível durante todo o streaming. Apenas `streamContent` aparece (resposta da IA), mas sem contexto visual de que "sua pergunta está ali".

## Solution

Usar `pendingMessages` (local `useState`) para adicionar a mensagem do usuário no instante do send, removendo-a quando o refetch confirmar os dados reais.

```
New flow:
  sendMessage("Qual o salário?")
    → setPendingMessages([{...}])  → mensagem aparece instantaneamente
    → askQuestionMut (RTT ~50ms)
    → setIsStreaming(true)
    → subscription tokens (2-30s)
    → completed → refetchMessages() → pending limpado

Usuário vê:
  [pergunta] → [pergunta + streaming tokens] → [pergunta + resposta completa]
```

## Impact analysis and mitigations

### 1. Risco de duplicação no refetch

**Problema:** `refetchMessages()` traz a mensagem real do servidor. Se `pendingMessages` ainda tiver a mensagem otimista, aparece duplicada.

**Mitigação:** limpar `pendingMessages` **antes** do refetch. Usar `refetch().then(() => setPendingMessages([]))`.

```typescript
// subscription onData, completed:
setIsStreaming(false);
setStreamContent("");
const { data } = await refetchMessages();
setPendingMessages([]);
```

**Backup:** se o refetch falhar, a pending message permanece como fallback (melhor que sumir).

### 2. ID único para mensagens otimistas

**Problema:** React warnings de `key` duplicada se a pending e a real compartilham o mesmo ID.

**Mitigação:** prefixo `pending-` + timestamp + random:

```typescript
const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
```

Quando a mensagem real chega (com ID do servidor), a pending é removida — nunca há conflito.

### 3. Rollback em falha da mutation

**Problema:** se `askQuestionMut` falha, a pending message fica órfã ("mensagem fantasma").

**Mitigação:** no erro, remover SOMENTE a pending message específica (não limpar todas — pode haver mensagens de outras operações).

```typescript
const [askErr] = await tryRun(askQuestionMut(...));
if (askErr) {
  setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
  return;
}
```

### 4. Switch conversation durante streaming

**Problema:** `switchConversation(null)` ou `switchConversation("conv-2")` durante streaming. As pending messages devem ser limpas.

**Mitigação:** `switchConversation` já limpa `setStreamContent("")`, `setIsStreaming(false)`. Adicionar `setPendingMessages([])`.

```typescript
const switchConversation = useCallback((id: string | null) => {
  setPendingMessages([]); // ← novo
  setIsStreaming(false);
  setStreamContent("");
  setIsNewConversation(false);
  setActiveConversationId(id);
}, []);
```

### 5. Concorrência — múltiplos sends rápidos

**Problema:** se `isSending` não travar rápido o suficiente, duas pending messages consecutivas antes da primeira mutation responder.

**Mitigação:** `isSending` já bloqueia o botão/composer (`disabled={isSending}`). A race é improvável, mas para segurança, usar `useRef` como guard no sendMessage:

```typescript
const sendingRef = useRef(false);

const sendMessage = useCallback(async (content: string) => {
  if (sendingRef.current) return;
  sendingRef.current = true;
  try {
    // ... existing logic ...
  } finally {
    sendingRef.current = false;
  }
}, [...]);
```

### 6. Ordem das mensagens no merge

**Problema:** pending messages podem aparecer na ordem errada em relação às mensagens do servidor (ex: mensagens mais antigas chegando via cache).

**Mitigação:** pending sempre no final (mais recente). Mensagens do servidor ordenadas por `createdAt ASC`, pending concatenadas no fim.

```typescript
const messages = useMemo(() => {
  const serverMessages = (messagesData?.aiMessages ?? [])
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((m) => ({ id: m.id, role: m.role as AiMessageRole, content: m.content, createdAt: m.createdAt }));

  if (pendingMessages.length === 0) return serverMessages;
  return [...serverMessages, ...pendingMessages];
}, [messagesData, pendingMessages]);
```

### 7. Mensagens otimistas sem `messagesData`

**Problema:** se `activeConversationId` acabou de ser setado, `messagesData` pode ser `undefined` (query em loading). Pending messages devem funcionar mesmo sem dados do servidor.

**Mitigação:** o `useMemo` acima já trata — `messagesData?.aiMessages ?? []` retorna array vazio, e pending aparece sozinha.

### 8. Delete mutation com pending

**Problema:** se houver pending messages e o usuário deletar a conversa, as pending podem vazar.

**Mitigação:** `deleteConversation` já limpa `activeConversationId`. Adicionar `setPendingMessages([])`.

### 9. Start new conversation com pending

**Problema:** `startNewConversation()` deve limpar pending messages da conversa anterior.

**Mitigação:** adicionar `setPendingMessages([])` em `startNewConversation`.

### 10. Testes

**Problema:** sem testes, regressões passam despercebidas.

**Mitigação:** testar:

| Cenário                                               | Teste                                                                         |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| `sendMessage` adiciona pending message                | Verificar `messages` inclui pending imediatamente                             |
| `completed` limpa pending e mostra server messages    | Mock completed event, verificar pending removida                              |
| Falha na mutation remove apenas a pending específica  | Mock erro, verificar pending específica removida                              |
| `switchConversation` limpa todas pending              | Verificar `messages` vazio após switch                                        |
| Rollback não remove mensagens de operações anteriores | Simular pending de operação anterior, falhar nova, verificar anterior intacta |
| Guard `sendingRef` prevê dupla chamada                | Chamar `sendMessage` duas vezes rápido, verificar apenas uma pending          |

## Requirements

### 1. `useChatPanelViewModel.ts` — `pendingMessages` state

New state:

```typescript
const [pendingMessages, setPendingMessages] = useState<
  Array<{ id: string; role: "User"; content: string; createdAt: string }>
>([]);
```

**Interface change:** `messages` now returns `Array<...>` — no type change, but behavior changes (messages may include pending).

No new public API. Everything internal.

### 2. `sendMessage` — add pending + rollback

```typescript
const sendMessage = useCallback(
  async (content: string): Promise<void> => {
    if (!content.trim()) return;

    const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Instant feedback
    setPendingMessages((prev) => [
      ...prev,
      { id: tempId, role: "User" as const, content, createdAt: new Date().toISOString() },
    ]);

    if (isNewConversation) {
      const [createErr, createResult] = await tryRun(createConversationMut({ variables: { jobId } }));
      if (createErr || !createResult?.data?.createAiConversation) {
        setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
        return;
      }
      const newId = createResult.data.createAiConversation.id;
      setIsNewConversation(false);
      setActiveConversationId(newId);

      const [askErr] = await tryRun(askQuestionMut({ variables: { conversationId: newId, content } }));
      if (askErr) {
        setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
        return;
      }
      setIsStreaming(true);
      return;
    }

    const convId = activeConversationId;
    if (!convId) {
      setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
      return;
    }

    const [askErr] = await tryRun(askQuestionMut({ variables: { conversationId: convId, content } }));
    if (askErr) {
      setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
      return;
    }

    setIsStreaming(true);
  },
  [isNewConversation, createConversationMut, askQuestionMut, jobId, activeConversationId],
);
```

### 3. `messages` — merge server + pending

```typescript
const messages = useMemo(() => {
  const serverMessages = (messagesData?.aiMessages ?? [])
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((m) => ({ id: m.id, role: m.role as AiMessageRole, content: m.content, createdAt: m.createdAt }));

  if (pendingMessages.length === 0) return serverMessages;
  return [...serverMessages, ...pendingMessages];
}, [messagesData, pendingMessages]);
```

### 4. Subscription `onData` — completed limpa pending

```typescript
useAiMessageStreamedSubscription({
  variables: { conversationId: activeConversationId! },
  skip: !isStreaming || !activeConversationId,
  onData: async ({ data }) => {
    const event = data.data?.aiMessageStreamed;
    if (!event) return;

    if (event.completed) {
      setIsStreaming(false);
      setStreamContent("");
      try {
        await refetchMessages();
      } finally {
        setPendingMessages([]);
      }
    } else if (event.token) {
      setStreamContent((prev) => prev + event.token);
    }
  },
});
```

Note: `onData` callback now `async`. The subscription hook must handle async callbacks — verify with the generated hook signature. If it doesn't support async, wrap in `void (async () => { ... })()`:

```typescript
onData: ({ data }) => {
  const event = data.data?.aiMessageStreamed;
  if (!event) return;

  if (event.completed) {
    setIsStreaming(false);
    setStreamContent("");
    void refetchMessages().finally(() => setPendingMessages([]));
  } else if (event.token) {
    setStreamContent((prev) => prev + event.token);
  }
},
```

### 5. `switchConversation` — limpa pending

Add `setPendingMessages([])` at the top of `switchConversation`.

### 6. `startNewConversation` — limpa pending

Add `setPendingMessages([])` at the top of `startNewConversation`.

### 7. `deleteConversation` — limpa pending

Add `setPendingMessages([])` after or before the mutation.

## Deduplication safety net

Even with pending cleanup, there's a theoretical risk of duplicate if `refetchMessages` resolves before `setPendingMessages([])` executes. Mitigation:

```typescript
// In messages useMemo:
const pendingIds = new Set(pendingMessages.map((m) => m.id));

const serverMessages = (messagesData?.aiMessages ?? [])
  .filter((m) => !pendingIds.has(m.id))  // ← dedup guard
  .sort(...)
  .map(...);
```

This ensures that if a pending message's temp ID somehow matches a real ID (extremely unlikely with `pending-` prefix), the server version takes precedence.

## Files to modify

| File                             | Change                                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| `hooks/useChatPanelViewModel.ts` | `pendingMessages` state, merge in `messages`, rollback logic, cleanup in switch/startNew |

## Files NOT modified

- `AiChatContent.tsx` — no changes: consumes `vm.messages` which now includes pending
- `AiChatChatView.tsx` — no changes: renders what it receives
- `AiChatConversationListView.tsx` — no changes
- `AiChatComposer.tsx` — no changes
- `AiChatEmptyState.tsx` — no changes
- `ai-chat.graphql` — no changes
- `make-apollo-client.ts` — no changes
- Backend — no changes

## Deliverables

- Modified `useChatPanelViewModel.ts`
- Updated tests (`useChatPanelViewModel.test.ts`)
- `pnpm typecheck` + `pnpm lint` pass

## Success criteria

- User message appears in chat instantly on send
- No duplicate messages after streaming completes
- Mutation failure removes the specific pending message (rollback)
- Switch conversation clears pending messages
- Start new conversation clears pending messages
- Delete conversation clears pending messages
- Pending messages don't interfere with server messages
- All 29 existing tests still pass + new tests for pending behavior
- Typecheck and lint pass
