# Task Memory: task_05.md

## Objective Snapshot

Build ChatPanel UI components (conversation list sidebar, message list with auto-scroll, chat composer, AiMessageBubble, empty state) for the AI Chat tab. Replace placeholder in ChatPanelTabsContent.

## Important Decisions

- Used plain textarea (not TipTap) for chat composer — simpler for chat input; TipTap is over-engineering for single-line/enter-to-send
- Delete confirmation uses `ConfirmDialog` with controlled `open`/`onOpenChange` (not trigger pattern) to avoid linting complexity with IconButton's required `tooltip` prop
- Conversation list delete button is a plain `<button>` (not `<IconButton>`) to keep compact inline design and avoid required `tooltip` prop
- Replaced `Stack gap="none"` with plain `<div className="flex flex-col">` since Stack only accepts "xs"|"sm"|"md"|"lg"
- Used `data-testid` for streaming cursor and user message alignment detection (linter forbids `container.querySelector`)
- User message text uses `<span className="text-text-inverted">` instead of `<Text color="on-brand">` since `on-brand` is not a valid TextColor

## Learnings

- `scrollIntoView` not implemented in jsdom — needs mock in vitest setup
- `TabsContent` requires `<Tabs>` ancestor — ChatPanelTabsContent tests must wrap in Tabs
- `ConfirmDialog` renders Dialog with Radix — full text in `description` prop renders as single text node
- `IconButton` has required `tooltip` prop (wraps in `<Tooltip>`)
- All 309/310 web tests pass; 1 pre-existing failure in JobsPage.test.tsx (unrelated "Technical" text search)

## Files / Surfaces

- Created: `ChatPanel.tsx`, `ChatPanelConversationList.tsx`, `ChatPanelMessageList.tsx`, `ChatPanelComposer.tsx`, `AiMessageBubble.tsx`, `ChatPanelEmptyState.tsx`
- Modified: `ChatPanelTabsContent.tsx` (placeholder → real component), `vitest.setup.ts` (added scrollIntoView mock)
- Tests created: 6 test files (AiMessageBubble, ChatPanel, ChatPanelComposer, ChatPanelConversationList, ChatPanelMessageList, ChatPanelEmptyState, ChatPanelTabsContent)

## Errors / Corrections

- Initial: `gap="none"` not valid for Stack; `IconButton` requires `tooltip`; `React.useImperativeHandle` needs explicit import; `color="on-brand"` not a valid TextColor
- Fixed: replaced Stack with div, replaced IconButton with plain button for delete, imported useImperativeHandle separately, used `text-text-inverted` className

## Ready for Next Run

- Task 06 (ViewModel + GraphQL operations) can proceed: ChatPanel component API is finalized and tested
