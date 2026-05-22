---
status: pending
title: "Rename Application AI action files in web"
type: web
complexity: low
dependencies: [10]
---

# Task 13: Rename Application AI action files in web

## Files to rename

| Original                                                               | New                            |
| ---------------------------------------------------------------------- | ------------------------------ |
| `apps/web/src/modules/ai/actions/useApplicationNoteAiGenerator.ts`     | `useJobNoteAiGenerator.ts`     |
| `apps/web/src/modules/ai/actions/useImproveApplicationNoteAiAction.ts` | `useImproveJobNoteAiAction.ts` |

## Content changes

- Hook names: `useApplicationNoteAiGenerator` → `useJobNoteAiGenerator`, `useImproveApplicationNoteAiAction` → `useImproveJobNoteAiAction`
- Internal variables and types referencing `application`
- Imports: update to new module paths where needed

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
```
