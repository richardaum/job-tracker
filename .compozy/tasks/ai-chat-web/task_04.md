---
status: pending
title: "chat/page.tsx metadata + wiring + AiChatTabPanel fix"
type: web
complexity: low
dependencies:
  - task_03
---

# Task 04: `chat/page.tsx` metadata + wiring + `AiChatTabPanel` fix

## Overview

Update `chat/page.tsx` to follow the same pattern as `notes/page.tsx` — add metadata generation and reexport the route page. Also fix `AiChatTabPanel.tsx` to pass `jobId` to `AiChatContent` instead of ignoring it with `_jobId`.

### URL Context

This task wires the two remaining URL entry points:

**1. Full width (`chat/page.tsx`):**

- URL: `/jobs/{id}/chat`
- App router page at `apps/web/src/app/(authenticated)/jobs/[id]/(detail)/chat/page.tsx`
- Server component with `generateMetadata` → delegates to `JobAiChatRoutePage`
- On desktop without `?w=full`, `useJobDetailsRouteState` redirects to `?s=chat` (flash before redirect)

**2. Side panel (`AiChatTabPanel`):**

- URL: `/jobs/{id}?s=chat`
- Rendered via `ActivitySidePanelTabs` inside `JobDetailsLayout`
- Uses `AiChatTabPanel` as the tab content wrapper (TabsContent)
- Already wired in `JobDetailsLayout.tsx` — just needs `jobId` passed through to `AiChatContent`

<critical>
- Follow exact pattern from `notes/page.tsx` for the app router page
- The side panel already uses `AiChatTabPanel` — just needs to pass `jobId` through
- Both modes consume the same `AiChatContent` component (stack navigation via activeConversationId)
- Test metadata generation
</critical>

<requirements>
1. MUST replace `chat/page.tsx` content to match `notes/page.tsx` pattern:
   - Add `generateMetadata` function using `generateJobDetailMetadata(id, "AI Chat")`
   - Reexport `JobAiChatRoutePage` as default
2. MUST update `AiChatTabPanel.tsx`:
   - Change `_jobId` parameter to `jobId` and pass it to `<AiChatContent jobId={jobId} />`
3. MUST NOT modify any other files — the layout and redirect logic already handle both modes
</requirements>

## Patterns

```tsx
// chat/page.tsx — handles the /jobs/{id}/chat route (full width)
import type { Metadata } from "next";

import { generateJobDetailMetadata } from "@/modules/jobs/details/server/job-detail-metadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return generateJobDetailMetadata(id, "AI Chat");
}

export { default } from "@/modules/jobs/details/page/JobAiChatRoutePage";
```

```tsx
// AiChatTabPanel.tsx — handles the side panel (?s=chat)
import { cn, TabsContent } from "@job-tracker/ui";
import { AiChatContent } from "./AiChatContent";

type AiChatTabPanelProps = { jobId: string; className?: string };

export function AiChatTabPanel({ jobId, className }: AiChatTabPanelProps) {
  return (
    <TabsContent value="chat" className={cn("flex-1 min-h-0 overflow-hidden", className)}>
      <AiChatContent jobId={jobId} />
    </TabsContent>
  );
}
```

## Subtasks

- [ ] 4.1 Update `chat/page.tsx` with metadata + reexport
- [ ] 4.2 Fix `AiChatTabPanel.tsx` to pass `jobId` to `AiChatContent`
- [ ] 4.3 Verify both side panel (`?s=chat`) and full-width (`/jobs/{id}/chat`) render correctly

## Implementation Details

### Relevant Files

| File                                                                 | Reason                             |
| -------------------------------------------------------------------- | ---------------------------------- |
| `apps/web/src/modules/jobs/details/server/job-detail-metadata.ts`    | Metadata helper                    |
| `apps/web/src/app/(authenticated)/jobs/[id]/(detail)/notes/page.tsx` | Exact pattern to follow            |
| `apps/web/src/modules/jobs/details/components/AiChatTabPanel.tsx`    | Modified here                      |
| `apps/web/src/modules/jobs/details/hooks/useJobDetailsRouteState.ts` | Redirect logic (no changes needed) |

### Dependent Files

| File                                                                | Reason        |
| ------------------------------------------------------------------- | ------------- |
| `apps/web/src/app/(authenticated)/jobs/[id]/(detail)/chat/page.tsx` | Modified here |
| `apps/web/src/modules/jobs/details/components/AiChatTabPanel.tsx`   | Modified here |

## Deliverables

- Updated `chat/page.tsx`
- Updated `AiChatTabPanel.tsx`
- `pnpm typecheck` + `pnpm lint` pass

## Success Criteria

- `chat/page.tsx` generates correct metadata for "AI Chat" tab
- Route page delegates to `JobAiChatRoutePage`
- Side panel passes `jobId` correctly through `AiChatTabPanel` → `AiChatContent`
- Both URL entry points work: `?s=chat` (side panel) and `/jobs/{id}/chat` (full width)
- Typecheck and lint pass
