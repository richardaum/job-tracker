---
status: pending
title: "Rename applications/ module → jobs/ in web"
type: web
complexity: high
dependencies: [08, 09]
---

# Task 10: Rename applications/ module → jobs/ in web

**Directory:** `apps/web/src/modules/applications/` → `apps/web/src/modules/jobs/`

## Files to rename

| Original Path                                           | New Path                                        |
| ------------------------------------------------------- | ----------------------------------------------- |
| `details/hooks/useApplicationDetailsViewModel.ts`       | `details/hooks/useJobDetailsViewModel.ts`       |
| `details/page/ApplicationDetailsPage.tsx`               | `details/page/JobDetailsPage.tsx`               |
| `details/page/ApplicationNotesPage.tsx`                 | `details/page/JobNotesPage.tsx`                 |
| `details/utils/application-details.shared.ts`           | `details/utils/job-details.shared.ts`           |
| `list/components/ApplicationCard.tsx`                   | `list/components/JobCard.tsx`                   |
| `list/components/ApplicationQuickEditDialog.tsx`        | `list/components/JobQuickEditDialog.tsx`        |
| `list/components/ApplicationTrackingPanel.tsx`          | `list/components/JobTrackingPanel.tsx`          |
| `list/components/ApplicationsCompanyFilterBanner.tsx`   | `list/components/JobsCompanyFilterBanner.tsx`   |
| `list/components/ApplicationsImportRunFilterBanner.tsx` | `list/components/JobsImportRunFilterBanner.tsx` |
| `list/components/DeleteApplicationDialog.tsx`           | `list/components/DeleteJobDialog.tsx`           |
| `list/hooks/useApplicationCardViewModel.ts`             | `list/hooks/useJobCardViewModel.ts`             |
| `list/hooks/useApplicationsListViewModel.ts`            | `list/hooks/useJobsListViewModel.ts`            |
| `list/page/ApplicationsPage.tsx`                        | `list/page/JobsPage.tsx`                        |
| `list/page/ApplicationsPage.test.tsx`                   | `list/page/JobsPage.test.tsx`                   |
| `shared/components/ApplicationTags.tsx`                 | `shared/components/JobTags.tsx`                 |
| `shared/utils/applicationSourceLabel.ts`                | `shared/utils/jobSourceLabel.ts`                |

## Content changes

- Components: `ApplicationCard` → `JobCard`, etc.
- Hooks: `useApplicationsListViewModel` → `useJobsListViewModel`
- Imports: update all paths
- UI text: "Application" → "Job", "applications" → "jobs"
- GraphQL hooks: `useApplicationsQuery` → `useJobsQuery`, etc.

## Fit components left in jobs/ (renamed in Phase 2)

These files stay in `jobs/` but contain "Fit" — they get renamed in Task 29:

- `details/components/FitAnalysisField.tsx`
- `details/components/FitDialog.tsx`
- `shared/components/FitClassification.tsx`
- `shared/utils/fitFormat.ts`

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
pnpm --filter @job-tracker/web run test
```
