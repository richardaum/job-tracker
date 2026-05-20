---
status: pending
title: "Regenerate web codegen after Fit→Match rename"
type: web
complexity: medium
dependencies: [20, 21, 22, 23, 24, 25]
---

# Task 26: Regenerate web codegen after Fit→Match rename

**Prerequisite:** All Phase 2 API changes (Tasks 20–25) must be complete and `pnpm typecheck` passing in `apps/api`.

## Action

```bash
pnpm --filter @job-tracker/web run codegen
```

This regenerates `apps/web/src/gql/` with new schema names:

- Hooks: `useMatchAnalysesQuery`, `useGenerateMatchAnalysisMutation`, etc.
- Types: `MatchAnalysis`, `MatchItem`, `GenerateMatchInput`, etc.

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
```
