---
status: pending
title: "Rename draft-applications/ module → draft-jobs/ in web"
type: web
complexity: medium
dependencies: [08, 09]
---

# Task 11: Rename draft-applications/ module → draft-jobs/ in web

**Directory:** `apps/web/src/modules/draft-applications/` → `apps/web/src/modules/draft-jobs/`

## Files to rename

| Original                                               | New                                            |
| ------------------------------------------------------ | ---------------------------------------------- |
| `details/components/DraftApplicationSidePanel.tsx`     | `details/components/DraftJobSidePanel.tsx`     |
| `details/components/DraftCurrentApplicationField.tsx`  | `details/components/DraftCurrentJobField.tsx`  |
| `details/hooks/useDraftApplicationDetailsViewModel.ts` | `details/hooks/useDraftJobDetailsViewModel.ts` |
| `details/page/DraftApplicationDetailsPage.tsx`         | `details/page/DraftJobDetailsPage.tsx`         |
| `list/components/DeleteDraftApplicationDialog.tsx`     | `list/components/DeleteDraftJobDialog.tsx`     |
| `list/components/DraftApplicationCard.tsx`             | `list/components/DraftJobCard.tsx`             |
| `list/hooks/useDraftApplicationsListViewModel.ts`      | `list/hooks/useDraftJobsListViewModel.ts`      |
| `list/page/DraftApplicationsPage.tsx`                  | `list/page/DraftJobsPage.tsx`                  |

## Content changes

- Components: `DraftApplicationCard` → `DraftJobCard`, etc.
- Hooks: `useDraftApplicationsListViewModel` → `useDraftJobsListViewModel`
- Imports: update all paths
- UI text: "Draft Application" → "Draft Job"
- GraphQL hooks: `useDraftApplicationsQuery` → `useDraftJobsQuery`

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
```
