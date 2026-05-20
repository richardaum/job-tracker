---
status: pending
title: "Rename Fit→Match in GraphQL Schema"
type: backend
complexity: high
dependencies: [19]
---

# Task 20: Rename Fit→Match in GraphQL Schema

**File:** `apps/api/src/schema.gql`

## Changes

- Types: `FitAnalysis` → `MatchAnalysis`, `FitItem` → `MatchItem`
- Inputs: `GenerateFitInput` → `GenerateMatchInput`, `GenerateDraftFitInput` → `GenerateDraftMatchInput`
- Queries: `fitAnalysis(id)` → `matchAnalysis(id)`, `fitAnalyses(...)` → `matchAnalyses(...)`
- Mutations: `generateFitAnalysis` → `generateMatchAnalysis`, `generateDraftFitAnalysis` → `generateDraftMatchAnalysis`
- Fields: `fitAnalysis` → `matchAnalysis`, `fitAnalyses` → `matchAnalyses`, `fitAnalysisId` → `matchAnalysisId`
- Enums: `FitVerdict` → `MatchVerdict` (keep enum values: `fit`/`gap`/`unclear`), `CulturalFit` → `CulturalMatch`

## Casing map

| Original                     | Replacement     |
| ---------------------------- | --------------- |
| `FitAnalysis`                | `MatchAnalysis` |
| `FitItem`                    | `MatchItem`     |
| `Fit` (standalone type name) | `Match`         |
| `fitAnalysis`                | `matchAnalysis` |
| `fitAnalyses`                | `matchAnalyses` |
| `fitItem`                    | `matchItem`     |
| `FIT`                        | `MATCH`         |
| `CulturalFit`                | `CulturalMatch` |

## Verification

```bash
pnpm --filter @job-tracker/api run typecheck
```
