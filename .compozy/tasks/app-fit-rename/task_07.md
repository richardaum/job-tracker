---
status: pending
title: "Rename Application references in API scripts"
type: backend
complexity: low
dependencies: [03]
---

# Task 07: Rename Application references in API scripts

## Files in `apps/api/scripts/`

- `AGENTS.md` — textual references
- `fix-normalize-enum-casing.ts` — references to `application`
- Any other script mentioning `application`

## Action

1. Search for `application` (case-insensitive) in `apps/api/scripts/`
2. Update all code references and comments
3. Keep file names as-is unless they explicitly encode "application" in their name

```bash
grep -rn -i "application" apps/api/scripts/ --include='*.ts' --include='*.md'
```

## Verification

```bash
pnpm --filter @job-tracker/api run typecheck
```
