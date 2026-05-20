---
status: pending
title: "Rename fit-analysis/ domain → match-analysis/ in API"
type: backend
complexity: high
dependencies: [20, 21]
---

# Task 22: Rename fit-analysis/ domain → match-analysis/ in API

**Directory:** `apps/api/src/domains/fit-analysis/` → `apps/api/src/domains/match-analysis/`

## Files to rename (17)

| Original                         | New                                |
| -------------------------------- | ---------------------------------- |
| `fit-analysis.type.ts`           | `match-analysis.type.ts`           |
| `fit-item.type.ts`               | `match-item.type.ts`               |
| `fit-analysis.events.ts`         | `match-analysis.events.ts`         |
| `fit-analysis-event.bus.ts`      | `match-analysis-event.bus.ts`      |
| `fit-analysis-event.listener.ts` | `match-analysis-event.listener.ts` |
| `fit-analysis.module.ts`         | `match-analysis.module.ts`         |
| `fit-analysis.service.ts`        | `match-analysis.service.ts`        |
| `fit-analysis.service.spec.ts`   | `match-analysis.service.spec.ts`   |
| `fit-analysis.resolver.ts`       | `match-analysis.resolver.ts`       |
| `fit-analysis.repository.ts`     | `match-analysis.repository.ts`     |
| `fit-analysis.schema.ts`         | `match-analysis.schema.ts`         |
| `fit-analysis-ai.service.ts`     | `match-analysis-ai.service.ts`     |
| `fit-analysis-ai.schema.ts`      | `match-analysis-ai.schema.ts`      |
| `fit-analysis-ai.templates.ts`   | `match-analysis-ai.templates.ts`   |
| `fit-analysis-sse.controller.ts` | `match-analysis-sse.controller.ts` |
| `generate-fit.input.ts`          | `generate-match.input.ts`          |
| `generate-draft-fit.input.ts`    | `generate-draft-match.input.ts`    |

## Content changes

- Classes: `FitAnalysisService` → `MatchAnalysisService`, `FitAnalysisResolver` → `MatchAnalysisResolver`
- Module: `FitAnalysisModule` → `MatchAnalysisModule`
- Imports: update paths from `./fit-*` to `./match-*`
- Variables: `fitAnalysis` → `matchAnalysis`, `fitItem` → `matchItem`
- Tests: update describes, variables, imports

## Verification

```bash
pnpm --filter @job-tracker/api run typecheck
pnpm --filter @job-tracker/api run test
```
