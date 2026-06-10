# PRD: AI Chat Tab in Job Details Side Panel

## Overview

Users managing job applications need quick answers about a job — company background, fit analysis, note summaries, interview prep. Currently there's no integrated way to ask AI questions contextually.

This feature adds an "AI Chat" tab to the job details side panel (alongside Notes and History). Users can create conversations, ask questions about the job, and get streaming AI responses.

## Goals

- Allow users to ask AI questions about a job from within the job details page
- Deliver a persistent, conversational AI experience with streaming responses
- Keep AI exploration separate from permanent notes — no noise in the notes feed
- **Primary metric:** Adoption — number of AI conversations created per user per week
- **Target:** Ship MVP within one iteration

## User Stories

- As a user viewing a job, I want to open an AI Chat tab and ask "What does this company do?" so I get an instant answer grounded in the job data
- As a user, I want the AI response to appear in real-time (streaming) so I don't wait for the full response
- As a user, I want to create multiple conversations per job ("Fit analysis", "Company research", "Interview prep") so I can organize topics
- As a user, I want conversation history to persist so I can resume where I left off
- As a user, I want to delete conversations I no longer need

## Core Features

### F1: AI Chat as a side panel tab

- New "AI Chat" tab in the right side panel (alongside Notes, History)
- Available on desktop (side panel area) and mobile (tab in TabsList)
- Accessible via `?s=chat` URL parameter (matching existing side panel pattern)
- When no conversations exist, shows an empty state with a "Start new conversation" button

### F2: Multiple conversations per job

- Users can create multiple named conversations per job
- Each conversation starts with a text prompt: "Ask anything about this job…"
- First message generates an auto-title for the conversation (e.g., "Company culture questions")
- Conversations listed in a left sidebar within the panel (compact list)
- Users can switch between conversations, delete them, or start new ones
- Active conversation state persists across page navigations within the session

### F3: Streaming AI responses with job context

- Each message to the AI includes the full job context: title, description, company info, match analysis, existing notes, stage history
- AI responses stream via GraphQL Subscription (following existing EventBus pattern)
- Messages display in a standard chat layout: user messages right-aligned, AI messages left-aligned with "AI" avatar/badge
- Message list auto-scrolls to the latest message during streaming
- Loading states: "AI is thinking…" → streaming text with pulsing cursor → finalized message

### F4: Conversation management

- Delete conversation with confirmation dialog (following existing ConfirmDialog pattern)
- Conversation title is auto-generated from the first AI response
- Empty conversations (user asked nothing) are cleaned up on tab switch

## User Experience

### Flow

1. User opens a job details page
2. Right side panel shows tabs: Notes | History | **AI Chat** (new)
3. User clicks "AI Chat" → shows conversation list (or empty state)
4. User clicks "Start new conversation" or selects an existing one
5. Chat view opens with a message input at the bottom
6. User types a question and presses Enter
7. AI response streams into the chat with incremental text
8. User can switch conversations via a compact sidebar list, or click "New conversation" to start fresh

### States

| State                | What the user sees                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------- |
| No conversations     | Empty state: icon + "No conversations yet" + "Start new conversation" button             |
| AI is processing     | User message in chat + "AI is thinking…" with subtle pulse animation                     |
| AI is streaming      | AI message with incremental text appearing character-by-character, pulsing cursor at end |
| AI response complete | Full AI message with AI avatar                                                           |
| Error                | AI message shows "Failed to generate response" + "Retry" link                            |
| Conversation list    | Compact vertical list of conversation titles, newest first, scrollable                   |

### Mobile behavior

- Below `lg`, side panel tabs become part of the main TabsList (same as Notes/History behavior)
- Chat view takes full width
- Conversation list becomes a slide-over panel or modal

## High-Level Technical Constraints

- New data entities: `ai_conversations` and `ai_messages` — requires DB migration
- Streaming must use GraphQL Subscription (EventBus pattern) — no raw SSE
- AI context must respect userId — AI only accesses data the user owns
- Side panel navigation follows existing `?s=` URL parameter pattern
- Conversation list and active state should not reset on tab switches within the same session

## Non-Goals (Out of Scope)

- **Editing or deleting individual messages** — only full conversation deletion
- **Custom AI personality / system prompt configuration**
- **Function calling / tool use** — AI cannot query external data beyond job context in MVP
- **Sharing conversations** between users
- **Exporting conversations** (JSON, text)
- **Multi-modal input** (file uploads, images)
- **Evaluating/rating AI responses** (thumbs up/down)

## Phased Rollout Plan

### MVP (Phase 1)

- AI Chat tab in the side panel
- Multiple persistent conversations per job
- Streaming AI responses with full job context
- Conversation creation and deletion
- Auto-title from first message
- **Exit criteria:** 50% of test users start at least one AI conversation per job viewed

### Phase 2

- Function calling tools (search other jobs, fetch company data, fetch match analysis from other jobs)
- Conversation search and filtering
- Empty state "Ask AI" button also available in Notes panel header
- Rate limiting and cost controls
- **Exit criteria:** tools adoption > 30% of conversations

### Phase 3

- Follow-up suggestions from AI
- Pre-defined conversation templates ("Analyze job fit", "Prepare for interview")
- Export conversation as text/markdown
- **Exit criteria:** sustained weekly usage growth across user base

## Success Metrics

| Metric                     | Target                              | How to measure                         |
| -------------------------- | ----------------------------------- | -------------------------------------- |
| Conversation creation rate | > 3 conversations per user per week | Count conversations created            |
| Messages per conversation  | > 4 (i.e., more than 1 Q&A)         | Average message count per conversation |
| Error rate                 | < 5% of AI calls fail               | Subscription error events              |
| Streaming latency          | First token < 2s                    | Client-side TTFB measurement           |

## Risks and Mitigations

| Risk                                | Impact | Mitigation                                                                                 |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| AI costs increase with adoption     | High   | Monitor cost per conversation; add rate limiting in Phase 2 if needed                      |
| AI hallucinates job data            | Medium | System prompt grounds answers in provided context; consider citations in Phase 2           |
| Users don't discover the feature    | High   | Prominent "AI Chat" tab in side panel; potentially add "Ask AI" button in Notes header too |
| Users create too many conversations | Low    | Conversation list stays manageable; delete is one click                                    |
| Streaming adds backend complexity   | Medium | Reuse existing EventBus + Subscription pattern from jobs-events                            |

## Architecture Decision Records

- [ADR-002: Dedicated AI Chat Tab in Side Panel](adrs/adr-002.md) — Selected approach

## Open Questions

- Should there be a prompt template/placeholder in the input to guide users on what to ask? (e.g., "Ask about the company, fit, interview tips…")
- What function calling tools should the AI have in Phase 2? (Deferred)
- Should conversations auto-title from the first message (like ChatGPT) or require user input?
