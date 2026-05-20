---
status: pending
title: "Rename CulturalFit enum → CulturalMatch"
type: backend
complexity: medium
dependencies: [20]
---

# Task 35: Rename CulturalFit enum → CulturalMatch

## File

`apps/api/src/domains/jobs/job-stage.enum.ts` (ex-`application-stage.enum.ts`)

## Change

```
CulturalFit = "CULTURAL_FIT" → CulturalMatch = "CULTURAL_MATCH"
```

## Impact

- All code referencing `JobStage.CulturalFit` → `JobStage.CulturalMatch`
- SSE events that reference this enum value
- Migration: existing database rows with value `CULTURAL_FIT` need `UPDATE` — requires a **new migration**

## Action

1. Rename enum member in TypeScript
2. Update all references in codebase
3. Create new migration to update database values:

```sql
UPDATE job_stage_event SET stage = 'CULTURAL_MATCH' WHERE stage = 'CULTURAL_FIT';
```

4. Run migration in dev worktree to verify

## Verification

```bash
pnpm --filter @job-tracker/api run typecheck
pnpm --filter @job-tracker/api run test
pnpm --filter api migration:run
```
