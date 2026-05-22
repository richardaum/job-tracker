---
status: pending
title: "Rename fit-analyses/ module → match-analyses/ in web"
type: web
complexity: high
dependencies: [26, 27]
---

# Task 28: Rename fit-analyses/ module → match-analyses/ in web

**Directory:** `apps/web/src/modules/fit-analyses/` → `apps/web/src/modules/match-analyses/`

## Files to rename

| Original                                     | New                                            |
| -------------------------------------------- | ---------------------------------------------- |
| `details/components/FitItemCard.tsx`         | `details/components/MatchItemCard.tsx`         |
| `details/components/FitStatusBadge.tsx`      | `details/components/MatchStatusBadge.tsx`      |
| `details/components/FitStatusBadge.test.tsx` | `details/components/MatchStatusBadge.test.tsx` |
| `details/components/FitWizardDialog.tsx`     | `details/components/MatchWizardDialog.tsx`     |
| `details/page/FitAnalysisPage.tsx`           | `details/page/MatchAnalysisPage.tsx`           |
| `list/components/FitAnalysisListCard.tsx`    | `list/components/MatchAnalysisListCard.tsx`    |
| `list/components/FitScoreBadge.tsx`          | `list/components/MatchScoreBadge.tsx`          |
| `list/page/FitAnalysesPage.tsx`              | `list/page/MatchAnalysesPage.tsx`              |

## Content changes

- Components: `FitItemCard` → `MatchItemCard`, `FitStatusBadge` → `MatchStatusBadge`, etc.
- Hooks and view-models: update internal names
- Imports: update all paths
- UI text: "Fit Analysis" → "Match Analysis", "Fit Score" → "Match Score", "Fit Item" → "Match Item"
- GraphQL hooks: use newly generated `useMatchAnalysesQuery` etc.

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
pnpm --filter @job-tracker/web run test
```
