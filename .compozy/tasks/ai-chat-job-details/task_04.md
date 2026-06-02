---
status: completed
title: Side panel integration
type: web
complexity: medium
dependencies:
    - task_01
---

# Task 04: Side panel integration

## Overview

Add "AI Chat" as a new option in the job details side panel. This extends the `JobSidePanel` type, adds a tab trigger in `ActivitySidePanel`, creates the tab content wrapper component, and the mobile route page.

<critical>

- Read `_prd.md` and `_techspec.md` before starting
- Reference TechSpec "System Architecture" section for side panel integration
- Follow existing side panel patterns exactly (Notes, History)
- Tests required — verify tab renders and routing works

</critical>

<requirements>

1. MUST add `"chat"` to the `JobSidePanel` type in `job-details-routes.ts`
2. MUST add `"chat"` to `parseJobSidePanel` in `job-details-routes.ts`
3. MUST add `TabsTrigger value="chat"` and `ChatPanelTabsContent` to `ActivitySidePanel.tsx`
4. MUST create `AiChatRoutePage.tsx` for mobile full-width mode (following `JobNotesRoutePage.tsx` pattern)
5. MUST create app router page at `apps/web/src/app/(authenticated)/jobs/[id]/(detail)/chat/page.tsx`
6. MUST NOT modify `JobDetailsLayout.tsx` — the existing `?s=` mechanism handles it automatically
7. MUST update `job-details-routes.test.ts` with the new side panel value

</requirements>

## Subtasks

- [ ] Extend `JobSidePanel` type in `job-details-routes.ts`
- [ ] Update `parseJobSidePanel` in `job-details-routes.ts`
- [ ] Add `TabsTrigger value="chat"` in `ActivitySidePanel.tsx`
- [ ] Create `ChatPanelTabsContent` component (thin wrapper, actual UI in task 05)
- [ ] Create `AiChatRoutePage.tsx` for mobile full-width
- [ ] Create app router page `chat/page.tsx`
- [ ] Update tests

## Implementation Details

The side panel uses `Tabs` with `value` bound to the `?s=` query param. Adding `"chat"` to `JobSidePanel` is sufficient for the URL routing to work — `JobDetailsLayout` already reads `useJobSidePanel()` and passes the value down.

`ChatPanelTabsContent` should be a thin component that renders `ChatPanel` (created in task 05) for now it can render a placeholder "AI Chat coming soon" div — the real component will be wired in task 05 and 06.

### Relevant Files

- `apps/web/src/modules/jobs/details/utils/job-details-routes.ts` — Modify: add "chat" to type + parser
- `apps/web/src/modules/jobs/details/utils/job-details-routes.test.ts` — Modify: test new value
- `apps/web/src/modules/jobs/details/components/ActivitySidePanel.tsx` — Modify: add tab trigger
- `apps/web/src/modules/jobs/details/page/JobNotesRoutePage.tsx` — Reference: pattern for AiChatRoutePage
- `apps/web/src/app/(authenticated)/jobs/[id]/(detail)/notes/page.tsx` — Reference: app router page wiring

### Dependent Files

- `apps/web/src/modules/jobs/details/utils/job-details-routes.ts` — Modified here
- `apps/web/src/modules/jobs/details/components/ActivitySidePanel.tsx` — Modified here
- `apps/web/src/modules/jobs/details/components/ChatPanelTabsContent.tsx` — Created here (placeholder)
- `apps/web/src/modules/jobs/details/page/AiChatRoutePage.tsx` — Created here
- `apps/web/src/app/(authenticated)/jobs/[id]/(detail)/chat/page.tsx` — Created here

### Related ADRs

- [ADR-002: Dedicated AI Chat Tab in Side Panel](../adrs/adr-002.md) — Product approach

## Deliverables

- Modified `job-details-routes.ts`
- Modified `ActivitySidePanel.tsx`
- `ChatPanelTabsContent.tsx` (placeholder)
- `AiChatRoutePage.tsx`
- `chat/page.tsx` (app router)
- Test coverage >= 80%

## Tests

### Unit Tests

- [ ] `parseJobSidePanel("chat")` returns `"chat"`
- [ ] `parseJobSidePanel("invalid")` returns `null`
- [ ] `jobDetailsHref` includes `?s=chat` for chat side panel
- [ ] ActivitySidePanel renders AI Chat tab trigger

### Integration Tests

- [ ] Navigating to `/jobs/{id}?s=chat` shows AI Chat tab content
- [ ] Mobile route `/jobs/{id}/chat` renders the route page

## Success Criteria

- [ ] AI Chat tab visible in side panel alongside Notes and History
- [ ] `?s=chat` URL param works
- [ ] Mobile route works
- [ ] All tests passing
- [ ] Test coverage >= 80%
