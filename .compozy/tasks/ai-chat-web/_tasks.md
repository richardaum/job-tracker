# AI Chat — Frontend Web Implementation

## Tasks

| #   | Title                                                             | Status    | Complexity | Dependencies |
| --- | ----------------------------------------------------------------- | --------- | ---------- | ------------ |
| 01  | View-model hook: `useChatPanelViewModel`                          | completed | high       | —            |
| 02  | `AiChatContent` component (shared side panel + full width)        | completed | high       | 01           |
| 03  | Full-width route page: `JobAiChatTabPage` + `JobAiChatRoutePage`  | completed | low        | 02           |
| 04  | `chat/page.tsx` metadata + wiring + `AiChatTabPanel` fix          | completed | low        | 03           |
| 05a | View-model: `sendMessage`, `startNewConversation`, stream cleanup | completed | medium     | 02           |
| 05b | Full-width split layout + `isNewConversation` visual              | completed | low        | 05a          |
