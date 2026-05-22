# T-286: Migrate new enum keys to PascalCase

**Status:** done · **Phase:** 5 · **Priority:** high · **Dependencies:** None (independent of all phases)

## Context

Codegen generates PascalCase enum keys from GraphQL schema values (e.g. `enum Foo { Positive }` → `Foo.Positive = "Positive"`). When API defines enums with UPPERCASE keys (`POSITIVE = "POSITIVE"`), the naming diverges between API and web. Migrating to PascalCase keys + values eliminates this inconsistency.

## Scope

5 new enums from phases 3-4:

| Enum                    | Before (key=value)          | After (key=value)           |
| ----------------------- | --------------------------- | --------------------------- |
| `StageEventSourceEnum`  | `MANUAL = "MANUAL"`         | `Manual = "Manual"`         |
| `StageEventSourceEnum`  | `SYSTEM = "SYSTEM"`         | `System = "System"`         |
| `FitVerdictEnum`        | `FIT = "FIT"`               | `Fit = "Fit"`               |
| `FitVerdictEnum`        | `GAP = "GAP"`               | `Gap = "Gap"`               |
| `FitVerdictEnum`        | `UNCLEAR = "UNCLEAR"`       | `Unclear = "Unclear"`       |
| `FitSourceEnum`         | `RESUME = "RESUME"`         | `Resume = "Resume"`         |
| `FitSourceEnum`         | `PREFERENCE = "PREFERENCE"` | `Preference = "Preference"` |
| `FitClassificationEnum` | `POSITIVE = "POSITIVE"`     | `Positive = "Positive"`     |
| `FitClassificationEnum` | `NEUTRAL = "NEUTRAL"`       | `Neutral = "Neutral"`       |
| `FitClassificationEnum` | `NEGATIVE = "NEGATIVE"`     | `Negative = "Negative"`     |
| `RoleEnum`              | `USER = "user"`             | `User = "user"`             |

## Steps

### Step 1 — Update enum definitions (5 files)

- `apps/api/src/domains/applications/stage-event-source.enum.ts`
- `apps/api/src/domains/fit-analysis/fit-verdict.enum.ts`
- `apps/api/src/domains/fit-analysis/fit-source.enum.ts`
- `apps/api/src/domains/fit-analysis/fit-classification.enum.ts`
- `apps/api/src/domains/users/role.enum.ts`

### Step 2 — Update API references (~30 files)

Replace all `Enum.MEMBER` with `Enum.Member` across `apps/api/src/`:

| Pattern (replace)                | With                             |
| -------------------------------- | -------------------------------- |
| `StageEventSourceEnum.MANUAL`    | `StageEventSourceEnum.Manual`    |
| `StageEventSourceEnum.SYSTEM`    | `StageEventSourceEnum.System`    |
| `FitVerdictEnum.FIT`             | `FitVerdictEnum.Fit`             |
| `FitVerdictEnum.GAP`             | `FitVerdictEnum.Gap`             |
| `FitVerdictEnum.UNCLEAR`         | `FitVerdictEnum.Unclear`         |
| `FitSourceEnum.RESUME`           | `FitSourceEnum.Resume`           |
| `FitSourceEnum.PREFERENCE`       | `FitSourceEnum.Preference`       |
| `FitClassificationEnum.POSITIVE` | `FitClassificationEnum.Positive` |
| `FitClassificationEnum.NEUTRAL`  | `FitClassificationEnum.Neutral`  |
| `FitClassificationEnum.NEGATIVE` | `FitClassificationEnum.Negative` |
| `RoleEnum.USER`                  | `RoleEnum.User`                  |

### Step 3 — Rewrite migrations

**`1767700000000-add-stage-event-source-enum.ts`:**

- `CREATE TYPE stage_event_source AS ENUM ('Manual', 'System')`
- `ALTER COLUMN ... USING CASE WHEN 'manual' THEN 'Manual' ... WHEN 'linkedin-tracker' THEN 'System' ...`
- DOWN: revert to lowercase

**`1767800000000-add-fit-classification-enum.ts`:**

- `CREATE TYPE fit_classification AS ENUM ('Positive', 'Neutral', 'Negative')`
- `ALTER COLUMN ... USING CASE WHEN 'POSITIVE' THEN 'Positive' ...`
- DOWN: revert to UPPERCASE

### Step 4 — Update schema.gql + codegen

```bash
pm2 restart job-tracker-refa-api
sleep 8
pnpm --filter @job-tracker/web run codegen
```

### Step 5 — Verify

```bash
pnpm typecheck
pnpm lint
pnpm test
pm2 logs job-tracker-refa-api --lines 10 --nostream
```

## Impact by layer

| Layer      | Change                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| DB         | Migration rewritten — enum values change from UPPERCASE to PascalCase                                   |
| schema.gql | Enum values: `POSITIVE` → `Positive`, `MANUAL` → `Manual`, etc.                                         |
| Codegen    | Web enums regenerate with PascalCase values — **web code already uses PascalCase, zero changes needed** |
| API        | ~30 files: member access `.MANUAL` → `.Manual`                                                          |
| Web        | Zero changes                                                                                            |

## Risks

- **[R-296]** DB data after T-223 is UPPERCASE. Migration must map UPPERCASE → PascalCase explicitly with CASE, not just `INITCAP()`.
- **[R-297]** `RoleEnum` value is `"user"` (lowercase) — PascalCase key `User = "user"` creates key≠value but is intentional (GraphQL doesn't expose role).
- **[R-298]** Existing enums (`ApplicationStageEnum`, etc.) stay UPPERCASE — creates temporary inconsistency in codebase. Deferred to future work.

## Rollback

1. Revert enum files + API references to UPPERCASE
2. Revert migrations, re-run against DB
3. Restart API → regenerate schema.gql → codegen
