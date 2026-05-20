---
status: pending
title: "Rename /fits route → /matches in web"
type: web
complexity: low
dependencies: [28]
---

# Task 30: Rename /fits route → /matches in web

## Directory to rename

| Original                                 | New                                         |
| ---------------------------------------- | ------------------------------------------- |
| `apps/web/src/app/(authenticated)/fits/` | `apps/web/src/app/(authenticated)/matches/` |

## Route files

| Original             | New                     |
| -------------------- | ----------------------- |
| `fits/page.tsx`      | `matches/page.tsx`      |
| `fits/[id]/page.tsx` | `matches/[id]/page.tsx` |

## Content changes

- Imports: update to new module paths (`@/modules/match-analyses/...`)
- Component references: `FitAnalysesPage` → `MatchAnalysesPage`, `FitAnalysisPage` → `MatchAnalysisPage`

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
```
