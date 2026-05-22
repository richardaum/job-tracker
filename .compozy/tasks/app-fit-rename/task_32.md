---
status: pending
title: "Update Fit references inside jobs/ module in web"
type: web
complexity: medium
dependencies: [29]
---

# Task 32: Update Fit references inside jobs/ module in web

## Files in `jobs/` that reference `Fit`

- `details/components/OverviewTabContent.tsx`
- `details/components/HistoryPanel.tsx`
- `details/components/UpdateStatusAction.tsx`
- `details/page/JobDetailsPage.tsx` (ex-ApplicationDetailsPage)
- `details/utils/job-details.shared.ts` (ex-application-details.shared)
- `shared/components/StatusBadge.tsx`
- `shared/components/StageTimeline.tsx`
- `list/components/JobCard.tsx` (ex-ApplicationCard)
- `list/components/JobTrackingPanel.tsx` (ex-ApplicationTrackingPanel)

## Changes

- Update import paths from `fit-analysis` → `match-analysis` modules
- Update component references: `FitAnalysisField` → `MatchAnalysisField`, `FitDialog` → `MatchDialog`
- Update prop names: `fitAnalysis` → `matchAnalysis`, `fitScore` → `matchScore`

## Action

```bash
grep -rn -i "fit" apps/web/src/modules/jobs/ --include='*.ts' --include='*.tsx'
```

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
pnpm --filter @job-tracker/web run test
```
