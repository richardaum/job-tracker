---
status: pending
title: "Modules jobs/ + draft-jobs/ + AI actions (Web)"
type: web
complexity: high
dependencies: [04]
---

# Task 05: Modules jobs/ + draft-jobs/ + AI actions (Web)

## 5a. `applications/` → `jobs/` (21 files)

**Directory:** `apps/web/src/modules/applications/` → `apps/web/src/modules/jobs/`

Rename files and update content:

| Original                                                | New                             |
| ------------------------------------------------------- | ------------------------------- |
| `details/hooks/useApplicationDetailsViewModel.ts`       | `useJobDetailsViewModel.ts`     |
| `details/page/ApplicationDetailsPage.tsx`               | `JobDetailsPage.tsx`            |
| `details/page/ApplicationNotesPage.tsx`                 | `JobNotesPage.tsx`              |
| `details/utils/application-details.shared.ts`           | `job-details.shared.ts`         |
| `list/components/ApplicationCard.tsx`                   | `JobCard.tsx`                   |
| `list/components/ApplicationQuickEditDialog.tsx`        | `JobQuickEditDialog.tsx`        |
| `list/components/ApplicationTrackingPanel.tsx`          | `JobTrackingPanel.tsx`          |
| `list/components/ApplicationsCompanyFilterBanner.tsx`   | `JobsCompanyFilterBanner.tsx`   |
| `list/components/ApplicationsImportRunFilterBanner.tsx` | `JobsImportRunFilterBanner.tsx` |
| `list/components/DeleteApplicationDialog.tsx`           | `DeleteJobDialog.tsx`           |
| `list/hooks/useApplicationCardViewModel.ts`             | `useJobCardViewModel.ts`        |
| `list/hooks/useApplicationsListViewModel.ts`            | `useJobsListViewModel.ts`       |
| `list/page/ApplicationsPage.tsx`                        | `JobsPage.tsx`                  |
| `list/page/ApplicationsPage.test.tsx`                   | `JobsPage.test.tsx`             |
| `shared/components/ApplicationTags.tsx`                 | `JobTags.tsx`                   |
| `shared/utils/applicationSourceLabel.ts`                | `jobSourceLabel.ts`             |

In each: component names, hook names, imports, UI text, GraphQL hook references.

**Fit components** (`FitAnalysisField.tsx`, `FitDialog.tsx`, `FitClassification.tsx`, `fitFormat.ts`) stay in `jobs/` — renamed in Phase 2.

## 5b. `draft-applications/` → `draft-jobs/` (8 files)

**Directory:** `apps/web/src/modules/draft-applications/` → `apps/web/src/modules/draft-jobs/`

Same pattern — `DraftApplicationCard` → `DraftJobCard`, `DraftApplicationsPage` → `DraftJobsPage`, etc.

## 5c. AI actions (2 files)

| Original                                                  | New                            |
| --------------------------------------------------------- | ------------------------------ |
| `modules/ai/actions/useApplicationNoteAiGenerator.ts`     | `useJobNoteAiGenerator.ts`     |
| `modules/ai/actions/useImproveApplicationNoteAiAction.ts` | `useImproveJobNoteAiAction.ts` |

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
pnpm --filter @job-tracker/web run test
```
