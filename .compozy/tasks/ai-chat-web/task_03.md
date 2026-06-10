---
status: pending
title: "Full-width route page: JobAiChatTabPage + JobAiChatRoutePage"
type: web
complexity: low
dependencies:
  - task_02
---

# Task 03: Full-width route page

## Overview

Create the client tab page and server route page for the AI Chat full-width view, following the exact pattern of `JobNotesTabPage` / `JobNotesRoutePage`. These are used when the job details layout is in full-width mode or on mobile.

### URL Behavior (two modes)

The chat uses **two different URLs** depending on the viewport and layout state:

| Mode                       | URL                 | When                                                  |
| -------------------------- | ------------------- | ----------------------------------------------------- |
| **Full width** (this task) | `/jobs/{id}/chat`   | Mobile, or desktop with `?w=full` (toggle full width) |
| **Side panel**             | `/jobs/{id}?s=chat` | Desktop split layout (default)                        |

The `useJobDetailsRouteState` hook handles **automatic redirects** between the two:

- **Desktop** → if user lands on `/jobs/{id}/chat` without `?w=full`, redirects to `/jobs/{id}?s=chat` (split layout, chat in side panel)
- **Mobile** → if user lands on `/jobs/{id}?s=chat`, redirects to `/jobs/{id}/chat` (full-width layout)

The `AiChatTab` tab trigger renders `<DetailsTabTrigger href="/jobs/{id}/chat">`, but on desktop split mode the redirect sends the user back to the side panel view. This is the same behavior as Notes and History tabs.

The `chat/page.tsx` handler (task 04) must reexport `JobAiChatRoutePage` correctly so the redirect can fire. The route page renders briefly on desktop before the redirect — `AiChatContent` handles this gracefully (see task 02 flash note).

<critical>
- Follow exactly the same pattern as `JobNotesTabPage.tsx` and `JobNotesRoutePage.tsx`
- These are thin delegation layers — no logic, just render AiChatContent
- The URL redirect is handled automatically by `useJobDetailsRouteState` — no changes needed there
- Tests required — verify rendering and route param extraction
</critical>

<requirements>
1. MUST create `JobAiChatTabPage.tsx` at `apps/web/src/modules/jobs/details/page/JobAiChatTabPage.tsx`
2. `JobAiChatTabPage` — `"use client"`, accept `jobId: string`, render `<AiChatContent jobId={jobId} />` inside a `className="mt-3 flex flex-1 min-h-0 flex-col overflow-hidden"` div
3. MUST create `JobAiChatRoutePage.tsx` at `apps/web/src/modules/jobs/details/page/JobAiChatRoutePage.tsx`
4. `JobAiChatRoutePage` — default export, `"use client"`, use `use(params)` to extract `id`, render `<JobAiChatTabPage jobId={id} />`
5. Works with the existing redirect in `useJobDetailsRouteState` — on desktop the route page may flash briefly before redirect to `?s=chat`
</requirements>

## Pattern

```tsx
// JobAiChatTabPage.tsx
"use client";

import { cn } from "@job-tracker/ui";

import { AiChatContent } from "@/modules/jobs/details/components/AiChatContent";

type JobAiChatTabPageProps = { jobId: string };
export function JobAiChatTabPage({ jobId }: JobAiChatTabPageProps) {
  return (
    <div className={cn("mt-3 flex flex-1 min-h-0 flex-col overflow-hidden")}>
      <AiChatContent jobId={jobId} />
    </div>
  );
}
```

```tsx
// JobAiChatRoutePage.tsx
"use client";

import { use } from "react";

import { JobAiChatTabPage } from "@/modules/jobs/details/page/JobAiChatTabPage";

type JobAiChatRoutePageProps = { params: Promise<{ id: string }> };

export default function JobAiChatRoutePage({ params }: JobAiChatRoutePageProps) {
  const { id } = use(params);
  return <JobAiChatTabPage jobId={id} />;
}
```

## Subtasks

- [ ] 3.1 Create `JobAiChatTabPage.tsx`
- [ ] 3.2 Create `JobAiChatRoutePage.tsx`

### Redirect Logic (Read Only — Do Not Modify)

The transfer between side panel and full width is handled by `useJobDetailsRouteState` at `apps/web/src/modules/jobs/details/hooks/useJobDetailsRouteState.ts`. The `useEffect` at lines 23-37 detects the current device and redirects:

```typescript
// Pseudocode of existing logic (do not change):
if (isDesktop && isSidePanelTab && !fullWidth) {
  // User is on /jobs/{id}/chat → redirect to /jobs/{id}?s=chat
  router.replace(`/jobs/${id}?s=chat`);
} else if (!isDesktop && sidePanelFromQuery) {
  // User is on /jobs/{id}?s=chat → redirect to /jobs/{id}/chat
  router.replace(`/jobs/${id}/${sidePanelFromQuery}`);
}
```

- `chat` is already registered in the `sidePanelTabs` array (line 7)
- **Do not modify** `useJobDetailsRouteState.ts` — this task is passive to the redirect
- On desktop, the route page renders briefly before the redirect — the flash is handled by `AiChatContent` (see task 02 flash note)

## Implementation Details

### Relevant Files

| File                                                                 | Reason                             |
| -------------------------------------------------------------------- | ---------------------------------- |
| `apps/web/src/modules/jobs/details/page/JobNotesTabPage.tsx`         | Exact pattern to follow            |
| `apps/web/src/modules/jobs/details/page/JobNotesRoutePage.tsx`       | Exact pattern to follow            |
| `apps/web/src/modules/jobs/details/hooks/useJobDetailsRouteState.ts` | Redirect logic (no changes needed) |
| `apps/web/src/app/(authenticated)/jobs/[id]/(detail)/notes/page.tsx` | App router pattern                 |

### Dependent Files

| File                                                                | Reason                           |
| ------------------------------------------------------------------- | -------------------------------- |
| `apps/web/src/modules/jobs/details/page/JobAiChatTabPage.tsx`       | Created here                     |
| `apps/web/src/modules/jobs/details/page/JobAiChatRoutePage.tsx`     | Created here                     |
| `apps/web/src/app/(authenticated)/jobs/[id]/(detail)/chat/page.tsx` | Will import route page (task 04) |

## Deliverables

- `apps/web/src/modules/jobs/details/page/JobAiChatTabPage.tsx`
- `apps/web/src/modules/jobs/details/page/JobAiChatRoutePage.tsx`
- `pnpm typecheck` + `pnpm lint` pass

## Success Criteria

- Tab page renders AiChatContent with correct jobId
- Route page extracts params.id and delegates
- Both files compile without errors
- Works with existing redirect in `useJobDetailsRouteState`
- Typecheck and lint pass
