# AGENTS.md — `apps/api/scripts`

## Overview

Standalone scripts that run **outside migrations**. May be one-shot (fix) or recurring utilities.

## Conventions

| Prefix  | Pattern                                              | `--dry-run` | Data access                                                               |
| ------- | ---------------------------------------------------- | :---------: | ------------------------------------------------------------------------- |
| `fix-*` | NestJS DI via `NestFactory.createApplicationContext` |     ✅      | Repositories, entity operations, or `createQueryBuilder` — **no raw SQL** |
| others  | Plain Node                                           |     ❌      | N/A                                                                       |

## Scripts

| Script                         | Pattern                       | Dry-run | What it does                                                                                                   |
| ------------------------------ | ----------------------------- | :-----: | -------------------------------------------------------------------------------------------------------------- |
| `fix-generate-summaries.ts`    | NestJS DI (Module + services) |   ✅    | Batch-generates AI summaries for applications missing them                                                     |
| `fix-generated-at.ts`          | NestJS DI (minimal Module)    |   ✅    | Fills missing `generatedAt` in `summary_metadata` JSONB                                                        |
| `fix-normalize-enum-casing.ts` | NestJS DI (minimal Module)    |   ✅    | Normalizes lowercase enums → UPPERCASE in JSONB fields; scans PG enum columns                                  |
| `fix-scoring-logic.ts`         | NestJS DI (minimal Module)    |   ✅    | Backfills `scoreRatio`, `classification`, `matchCount`, `gapCount`, `unclearCount` from `match_analysis.items` |
| `fix-match-analysis.ts`        | NestJS DI (Module + services) |   ✅    | Triggers match analysis for a user's applications; polls until completion                                      |
| `generate-schema.ts` (`src/`)  | NestJS DI (`AppModule`)       |   ❌    | Regenerates `src/schema.gql` via GraphQL `autoSchemaFile` (`pnpm schema:generate` in `apps/api`)               |
| `squash-migrations.mjs`        | Plain Node                    |   ❌    | Squashes migration files                                                                                       |

## How to run

```sh
tsx scripts/<script>.ts [args]            # fix-*, other scripts
node scripts/<script>.mjs                 # *.mjs
```

## Notes

- `fix-*` scripts follow the **dry-run → execute → archive** workflow.
- **No script may use raw SQL** (`em.query()`). Always use repositories, entity operations, or `createQueryBuilder`.
- `fix-generate-summaries.ts` uses a full Module with `SummaryService`, `SummaryAiService`, `ApplicationEventBus`.
- `fix-match-analysis.ts` uses a full Module with `MatchAnalysisService`, `MatchAnalysisAiService`, `MatchAnalysisEventBus`, and the event listener for background AI processing.
- See `docs/STANDALONE_SCRIPTS.md` for the NestJS bootstrap pattern.
