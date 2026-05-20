---
status: pending
title: "Migrations + Scripts — Application→Job (API)"
type: backend
complexity: high
dependencies: [01]
---

# Task 03: Migrations + Scripts — Application→Job (API)

## 3a. Migration files (~18 in `archive/`)

Rename files: `*-application-*.ts` → `*-job-*.ts`

Update in each:

- Class name: `AddApplicationXxx` → `AddJobXxx`
- Register imports in `apps/api/src/database/migrations/index.ts` (both the import statement and the `migrations` array)

**Important:** Archived migrations are already executed. Keep SQL DDL strings intact — they reference historical table names. If DB table renaming is needed, create a **new** migration separately.

## 3b. Scripts

```bash
grep -rn -i "application" apps/api/scripts/ --include='*.ts' --include='*.md'
```

Update references in:

- `AGENTS.md`
- `fix-normalize-enum-casing.ts`
- Any other script mentioning `application`

## Verification

```bash
pnpm --filter @job-tracker/api run typecheck
```
