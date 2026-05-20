---
status: pending
title: "Rename FitAnalysis entity → MatchAnalysis"
type: backend
complexity: medium
dependencies: [19, 20]
---

# Task 21: Rename FitAnalysis entity → MatchAnalysis

**File:** `apps/api/src/database/entities/fit-analysis.entity.ts` → `match-analysis.entity.ts`

## Changes

- Class: `FitAnalysis` → `MatchAnalysis`
- Decorator: `@Entity("fit_analysis")` → `@Entity("match_analysis")`
- Columns: `application_id` → `job_id` (already renamed in Phase 1)
- Relations: `@ManyToOne(() => Job)` (already renamed in Phase 1)
- JSONB columns: type annotations referencing `FitItem` → `MatchItem`

## Verification

```bash
pnpm --filter @job-tracker/api run typecheck
```
