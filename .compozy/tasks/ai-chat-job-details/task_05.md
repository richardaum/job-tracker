---
status: completed
title: ChatPanel component
type: web
complexity: high
dependencies:
  - task_04
---

# Task 05: ChatPanel component

## Overview

Build the main `ChatPanel` UI component for the AI Chat tab. This includes the conversation list sidebar, message list with auto-scroll, chat composer input, and streaming response display. The component will be wired to real data in task 06.

<critical>

- Read `_prd.md` and `_techspec.md` before starting
- Reference TechSpec "System Architecture" for ChatPanel sub-components
- Follow existing NotesPanel patterns for layout, scroll behavior, and editor integration
- Tests required — all component states must be covered

</critical>

<requirements>

1. MUST create `ChatPanel` component in `apps/web/src/modules/jobs/details/components/`
2. MUST render a conversation list sidebar with: list of conversation titles (scrollable), "New conversation" button at top, active conversation highlight, delete button per conversation
3. MUST render a message list with: user messages right-aligned, AI messages left-aligned with "AI" avatar/badge, auto-scroll to latest message on new content
4. MUST render a chat composer input at the bottom (TipTap or plain textarea) with Enter to send
5. MUST support streaming state: show "AI is thinking…" during processing, append tokens incrementally during streaming, show finalized message with "AI" badge when complete
6. MUST render empty state when no conversations exist: icon + "No conversations yet" + "Start new conversation" button
7. MUST handle error state: "Failed to generate response" + "Retry" link on failed AI messages
8. MUST use `cn()` for className construction
9. MUST use `useControllableState` if the component supports controlled/uncontrolled modes
10. MUST pass `ref` as a normal prop (`ref?: React.Ref<ChatPanelHandle>`) — no forwardRef

</requirements>

## Subtasks

- [ ] Create `ChatPanel.tsx` with layout (conversation list | message list | composer)
- [ ] Create `ConversationList` sub-component (sidebar with title, active state, delete)
- [ ] Create `MessageList` sub-component (scrollable, auto-scroll, message bubbles)
- [ ] Create `ChatComposer` sub-component (input + send button)
- [ ] Create `AiMessageBubble` sub-component (streaming state, finalized state, error state)
- [ ] Create `ChatPanelEmptyState` sub-component
- [ ] Wire placeholder data or props for messages/conversations (real data in task 06)
- [ ] Replace placeholder in `ChatPanelTabsContent` with real `ChatPanel` component
- [ ] Add component tests

## Implementation Details

Follow `NotesPanel.tsx` layout pattern: `flex h-full min-h-0 flex-col` container, scrollable message area (`flex-1 min-h-0 overflow-auto`), fixed composer at bottom.

For the split layout within the panel (conversation list | messages), use a horizontal flex: conversation list on the left (~200px), message list + composer on the right (flex-1).

Streaming state: pass an `isStreaming` boolean prop. During streaming, `AiMessageBubble` shows a pulsing cursor at the end of text. The component receives tokens as they arrive.

Conversation list uses a controlled `activeConversationId` prop + `onConversationChange` callback.

### Relevant Files

- `apps/web/src/modules/jobs/details/components/NotesPanel.tsx` — Reference: panel layout, scroll, TipTap integration
- `apps/web/src/modules/jobs/details/hooks/useNotesComposerBehavior.ts` — Reference: auto-scroll behavior
- `apps/web/src/modules/jobs/details/components/TipTapEditor.tsx` — Reference: editor component (optional, may use simpler textarea)
- `apps/web/src/modules/jobs/details/components/ActivitySidePanel.tsx` — Reference: side panel structure

### Dependent Files

- `apps/web/src/modules/jobs/details/components/ChatPanel.tsx` — Created here
- `apps/web/src/modules/jobs/details/components/ChatPanelTabsContent.tsx` — Modified (replace placeholder)
- Sub-component files in `apps/web/src/modules/jobs/details/components/` — Created here

### Related ADRs

- [ADR-002: Dedicated AI Chat Tab in Side Panel](../adrs/adr-002.md) — Product approach

## Deliverables

- `apps/web/src/modules/jobs/details/components/ChatPanel.tsx`
- `apps/web/src/modules/jobs/details/components/ChatPanelConversationList.tsx`
- `apps/web/src/modules/jobs/details/components/ChatPanelMessageList.tsx`
- `apps/web/src/modules/jobs/details/components/ChatPanelComposer.tsx`
- `apps/web/src/modules/jobs/details/components/AiMessageBubble.tsx`
- `apps/web/src/modules/jobs/details/components/ChatPanelEmptyState.tsx`
- Modified `ChatPanelTabsContent.tsx`
- Test coverage >= 80%

## Tests

### Unit Tests

- [ ] ChatPanel renders conversation list with titles
- [ ] ChatPanel renders messages in correct alignment (user right, AI left)
- [ ] ChatPanelEmptyState renders icon + message + button
- [ ] AiMessageBubble renders finalized message with AI badge
- [ ] AiMessageBubble renders streaming state with pulsing cursor
- [ ] AiMessageBubble renders error state with retry link
- [ ] ChatPanelComposer calls onSend with content on Enter
- [ ] ConversationList calls onConversationChange on click
- [ ] MessageList auto-scrolls to bottom on new message
- [ ] ConversationList delete button shows confirmation dialog

### Integration Tests

- [ ] ChatPanel renders within ActivitySidePanel tab
- [ ] Switching between conversations updates message list

## Success Criteria

- [ ] ChatPanel renders all states: empty, conversation list, messages, streaming, error
- [ ] Auto-scroll works on new messages and during streaming
- [ ] Composer sends content on Enter
- [ ] Delete conversation shows confirmation
- [ ] All tests passing
- [ ] Test coverage >= 80%
