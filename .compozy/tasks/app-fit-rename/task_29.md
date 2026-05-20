---
status: pending
title: "Rename Fit components inside jobs/ module in web"
type: web
complexity: medium
dependencies: [28]
---

# Task 29: Rename Fit components inside jobs/ module in web

These files live in `apps/web/src/modules/jobs/` (ex-`applications/`):

## Files to rename

| Original                                  | New                                         |
| ----------------------------------------- | ------------------------------------------- |
| `details/components/FitAnalysisField.tsx` | `details/components/MatchAnalysisField.tsx` |
| `details/components/FitDialog.tsx`        | `details/components/MatchDialog.tsx`        |
| `shared/components/FitClassification.tsx` | `shared/components/MatchClassification.tsx` |
| `shared/utils/fitFormat.ts`               | `shared/utils/matchFormat.ts`               |

## Content changes

- Components: `FitAnalysisField` → `MatchAnalysisField`, `FitDialog` → `MatchDialog`, `FitClassification` → `MatchClassification`
- Props: `fitAnalysis` → `matchAnalysis`, `fitItem` → `matchItem`, `fitScore` → `matchScore`
- Functions: `formatFitScore` → `formatMatchScore`
- UI text: "Fit Analysis" → "Match Analysis", "Fit Score" → "Match Score", "Fit Classification" → "Match Classification"

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
```
