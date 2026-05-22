---
status: pending
title: "Rename fit.graphql document in web"
type: web
complexity: low
dependencies: [26]
---

# Task 27: Rename fit.graphql document in web

**File:** `apps/web/src/graphql/fit.graphql` → `match.graphql`

## Content changes

- Query names: `fitAnalyses` → `matchAnalyses`, `fitAnalysis` → `matchAnalysis`
- Mutation names: `generateFitAnalysis` → `generateMatchAnalysis`, `generateDraftFitAnalysis` → `generateDraftMatchAnalysis`
- Fragment names: `FitAnalysisFields` → `MatchAnalysisFields`
- Type references: `FitAnalysis` → `MatchAnalysis`, `FitItem` → `MatchItem`

## Verification

```bash
pnpm --filter @job-tracker/web run codegen
pnpm --filter @job-tracker/web run typecheck
```
