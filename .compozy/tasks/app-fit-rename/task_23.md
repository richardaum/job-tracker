---
status: pending
title: "Update cross-domain Fit imports in API"
type: backend
complexity: medium
dependencies: [22]
---

# Task 23: Update cross-domain Fit imports in API

## Files to update

- `apps/api/src/app.module.ts` — import of `FitAnalysisModule` → `MatchAnalysisModule`
- `apps/api/src/database/data-source-options.ts` — entity `FitAnalysis` → `MatchAnalysis`
- `apps/api/src/database/migrations/index.ts` — migration imports
- `apps/api/src/domains/jobs/` (ex-`applications/`) — references to `FitAnalysis`, `fitAnalysis`
- Any other file importing from `fit-analysis/`

## Action

```bash
grep -rn "from.*fit-analysis" apps/api/src/ --include='*.ts'
grep -rn "FitAnalysis" apps/api/src/ --include='*.ts'
```

Update all imports and type references.

## Verification

```bash
pnpm --filter @job-tracker/api run typecheck
```
