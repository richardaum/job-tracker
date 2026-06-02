# Task Memory: task_04.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Add "AI Chat" as a new option in the job details side panel.

## Important Decisions

- `jobId` params in placeholder components (`ChatPanelTabsContent`, `AiChatTabPage`) prefixed with `_` to avoid lint unused-variable errors — will be used when real ChatPanel is wired in task 05.
- `src/modules/jobs/details/hooks/useJobPageTitle.ts` required a `chat: "AI Chat"` entry in the `TAB_LABEL` record to satisfy the `Record<JobDetailsTab, ...>` type.

## Files / Surfaces

- Modified: `apps/web/src/modules/jobs/details/utils/job-details-routes.ts`
- Modified: `apps/web/src/modules/jobs/details/utils/job-details-routes.test.ts`
- Modified: `apps/web/src/modules/jobs/details/components/ActivitySidePanel.tsx`
- Modified: `apps/web/src/modules/jobs/details/hooks/useJobPageTitle.ts`
- Created: `apps/web/src/modules/jobs/details/components/ChatPanelTabsContent.tsx`
- Created: `apps/web/src/modules/jobs/details/page/AiChatRoutePage.tsx`
- Created: `apps/web/src/modules/jobs/details/page/AiChatTabPage.tsx`
- Created: `apps/web/src/app/(authenticated)/jobs/[id]/(detail)/chat/page.tsx`

## Verification

- `pnpm exec tsc --noEmit` — clean (0 errors)
- `pnpm exec oxlint --max-warnings=0` — clean (0 errors)
- `pnpm exec vitest run src/modules/jobs/details` — 68/68 passed (13 test files)
- Pre-existing failures outside scope: `JobsPage.test.tsx` "Technical" casing (1 test)

## Ready for Next Run
