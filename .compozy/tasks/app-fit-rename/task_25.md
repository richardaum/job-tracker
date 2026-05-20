---
status: pending
title: "Rename Fit references in API scripts"
type: backend
complexity: low
dependencies: [22]
---

# Task 25: Rename Fit references in API scripts

## Files in `apps/api/scripts/`

| Original               | New                        |
| ---------------------- | -------------------------- |
| `fix-fit-analysis.ts`  | `fix-match-analysis.ts`    |
| `fix-scoring-logic.ts` | update references to `fit` |

## Action

1. Search for `fit` (case-insensitive, standalone word) in `apps/api/scripts/`
2. Update code references, variable names, comments
3. Rename files containing `fit` in the filename
4. Check `AGENTS.md` for textual references

```bash
grep -rn -i "\bfit\b" apps/api/scripts/ --include='*.ts' --include='*.md'
```

## Verification

```bash
pnpm --filter @job-tracker/api run typecheck
```
