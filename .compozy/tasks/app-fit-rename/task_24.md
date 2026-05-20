---
status: pending
title: "Rename Fit migration files"
type: backend
complexity: high
dependencies: [21]
---

# Task 24: Rename Fit migration files

## Files to rename (5 archive + 1 active)

| Original                                                      | New                                                       |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| `archive/1763300001000-add-application-stage-cultural-fit.ts` | `archive/1763300001000-add-job-stage-cultural-match.ts`   |
| `archive/1764400000000-create-fit-analysis.ts`                | `archive/1764400000000-create-match-analysis.ts`          |
| `archive/1764500000000-add-fit-analysis-status.ts`            | `archive/1764500000000-add-match-analysis-status.ts`      |
| `archive/1764900000000-add-fit-draft-support.ts`              | `archive/1764900000000-add-match-draft-support.ts`        |
| `archive/1765000000000-add-fit-analysis-user-id.ts`           | `archive/1765000000000-add-match-analysis-user-id.ts`     |
| `1767400000000-add-fit-analysis-generation-metadata.ts`       | `1767400000000-add-match-analysis-generation-metadata.ts` |

## Content changes

- Classes: `AddApplicationStageCulturalFit` → `AddJobStageCulturalMatch`, etc.
- Enum values in SQL: `CulturalFit` → `CulturalMatch`
- Table names in SQL: `fit_analysis` → `match_analysis` (in new migrations only, keep archived SQL intact)

## Important

- Archived migrations: rename class/file only, keep SQL DDL intact (already executed)
- If database table renaming needed, create a **new** migration with `ALTER TABLE ... RENAME TO`

## Update index

Register renamed imports in `apps/api/src/database/migrations/index.ts`.

## Verification

```bash
pnpm --filter @job-tracker/api run typecheck
```
