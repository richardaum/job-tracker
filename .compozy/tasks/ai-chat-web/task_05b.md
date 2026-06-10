---
status: pending
title: "Full-width split layout + isNewConversation visual"
type: web
complexity: low
dependencies:
  - task_05a
---

# Task 05b: Full-width split layout + `isNewConversation` visual

## Overview

Two changes to the AI Chat components:

**1. Full-width split layout:** In full-width mode (`?w=full` or mobile), show conversation list and chat view side by side instead of stacked navigation.

**2. `isNewConversation` visual:** When `isNewConversation` is true, the chat view shows a "New conversation" state with composer ready and no messages.

## Background

Currently `AiChatContent` does a binary toggle: `activeConversationId === null` → list, `!== null` → chat. This is fine for the side panel (360px), but wasteful in full-width mode where there's room for both.

## Requirements

### 1. `AiChatContent` — accept `fullWidth` prop

```typescript
type AiChatContentProps = { jobId: string; fullWidth?: boolean; className?: string };
```

**Contract from 05a:**

- `activeConversationId: string | null`
- `isNewConversation: boolean`
- `sendMessage(content): Promise<void>`
- `startNewConversation(): void`
- `switchConversation(id | null): void`
- `deleteConversation(id): Promise<void>`
- All query-derived fields (conversations, messages, loading, streamContent, isStreaming, isSending, isCreating)

### 2. Layout logic

```
fullWidth=false →                            fullWidth=true →
┌─────────────────────┐                     ┌──────────────┬──────────────────────┐
│ Stack navigation     │                     │ List (280px)  │ Chat (flex-1)        │
│                     │                     │ scrollable    │                      │
│ List ↔ Chat         │                     │              │ Messages + Composer   │
│ (same as current)   │                     │ always       │ or empty state        │
└─────────────────────┘                     │ visible      │                      │
                                            └──────────────┴──────────────────────┘
```

When `fullWidth=true`:

- Both `AiChatConversationListView` (left) and the active view (right) render simultaneously
- Left: 280px, scrollable. The "New Chat" button stays in the header slot (already done in quick fix)
- Right: `flex-1`, shows `AiChatChatView` when `activeConversationId !== null || isNewConversation`
- Right (empty): show `AiChatEmptyState variant="select-conversation"` when nothing active
- Selecting a conversation from left list updates the right panel
- No "Back" button in `AiChatChatView` — left column replaces the need for navigation

When `fullWidth=false`:

- Current toggle behavior (stack navigation): list XOR chat
- "Back" button in `AiChatChatView` returns to list

### 3. `AiChatChatView` — `isNewConversation` variant

```typescript
type AiChatChatViewProps = {
  messages: MessageItem[];
  loading: boolean;
  conversationTitle: string;
  onBack?: () => void; // optional — hidden in fullWidth
  streamContent?: string;
  isStreaming: boolean;
  isNewConversation?: boolean; // NEW
  onSend: (content: string) => void;
  disabled: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
};
```

When `isNewConversation=true`:

- Header title = "New conversation"
- Message area shows `AiChatEmptyState variant="new-conversation"` (prompt to type first message)
- Composer is focused and enabled
- No skeleton, no "no messages yet" empty state

When `fullWidth=true`:

- `onBack` is not rendered (no back button needed)

### 4. New `AiChatEmptyState` variants

Add two new variants:

```
variant="select-conversation":
  icon: ChatDotsIcon
  text: "Select or start a conversation"

variant="new-conversation":
  icon: ChatDotsIcon
  text: "Type your first message to begin"
```

### 5. Wiring in route entry points

Propagate `fullWidth`:

| Entry point           | File                   | Change                                     |
| --------------------- | ---------------------- | ------------------------------------------ |
| Side panel            | `AiChatTabPanel.tsx`   | Pass `fullWidth` from tab props or `false` |
| Full-width route page | `JobAiChatTabPage.tsx` | Pass `fullWidth` from layout context       |

The `useJobDetailsRouteState` hook already determines `fullWidth`. `JobDetailsLayout` already passes `fullWidth` to tab components — `AiChatTab` receives it. Propagate it through the chain to `AiChatContent`.

## Files to modify

| File                                   | Change                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| `components/AiChatContent.tsx`         | Accept `fullWidth`, split layout when true, wire `sendMessage`/`startNewConversation` |
| `components/AiChatChatView.tsx`        | Accept `isNewConversation`, optional `onBack`                                         |
| `components/AiChatEmptyState.tsx`      | Add `select-conversation` and `new-conversation` variants                             |
| `components/AiChatContent.test.tsx`    | Tests for split layout, pre-chat, fullWidth modes                                     |
| `components/AiChatChatView.test.tsx`   | Tests for `isNewConversation` variant                                                 |
| `components/AiChatEmptyState.test.tsx` | Tests for new variants                                                                |
| `components/AiChatTabPanel.tsx`        | Propagate `fullWidth` → `AiChatContent`                                               |
| `page/JobAiChatTabPage.tsx`            | Propagate `fullWidth` from layout → `AiChatContent`                                   |

## Deliverables

- Modified `AiChatContent.tsx` — split layout when fullWidth
- Modified `AiChatChatView.tsx` — isNewConversation, optional back
- Modified `AiChatEmptyState.tsx` — new variants
- Updated tests for all three
- Propagated `fullWidth` through entry points
- `pnpm typecheck` + `pnpm lint`

## Success criteria

- `fullWidth=true`: list on left, chat or empty state on right
- `fullWidth=false`: toggle behavior preserved (side panel)
- `isNewConversation=true`: "New conversation" title + composer ready
- Selecting conversation from left updates right panel
- All component states covered by tests
- Typecheck + lint pass
