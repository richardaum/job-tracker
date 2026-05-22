# T-284: Create `FitClassificationEnum`

**Status:** pending · **Phase:** 3d · **Priority:** high · **Dependencies:** Migration (Step 2)

## Context

`FitAnalysisEntity.classification` é coluna `text` (nullable) e type alias `FitClassification = "positive" | "neutral" | "negative"`. Os valores no banco estão em **lowercase**. A migration vai criar o PG enum e converter com `USING UPPER()`.

## Pre-migration data validation

```sql
SELECT DISTINCT classification FROM fit_analysis WHERE classification IS NOT NULL;
-- Deve retornar apenas 'positive', 'neutral', 'negative'
```

Se houver valores inesperados, corrigir antes da migration.

## Steps

### Step 1 — Criar arquivo do enum

Criar `apps/api/src/domains/fit-analysis/fit-classification.enum.ts`:

```ts
import { registerEnumType } from "@nestjs/graphql";

export enum FitClassificationEnum {
  POSITIVE = "POSITIVE",
  NEUTRAL = "NEUTRAL",
  NEGATIVE = "NEGATIVE",
}

registerEnumType(FitClassificationEnum, { name: "FitClassification" });
```

### Step 2 — Gerar migration

```bash
pnpm --filter @job-tracker/api run migration:generate --name add-fit-classification-enum
```

A migration deve:

1. `CREATE TYPE fit_classification AS ENUM('POSITIVE', 'NEUTRAL', 'NEGATIVE')`
2. `ALTER TABLE fit_analysis ALTER COLUMN classification TYPE fit_classification USING UPPER(classification)::fit_classification`

### Step 3 — Atualizar entity

`apps/api/src/database/entities/fit-analysis.entity.ts`:

**Remover type alias (L32):**

```ts
// Before — deletar esta linha
export type FitClassification = "positive" | "neutral" | "negative";
```

**Atualizar coluna (L65-66):**

```ts
// Before
@Column({ type: "text", nullable: true })
classification!: FitClassification | null;

// After
@Column({ type: "enum", enum: FitClassificationEnum, enumName: "fit_classification", nullable: true })
classification!: FitClassificationEnum | null;
```

Adicionar import. Remover referências ao type alias removido.

### Step 4 — Atualizar scoring

`apps/api/src/domains/fit-analysis/scoring/scoring.ts:76-82`:

```ts
// Before
classification = "neutral" / "positive" / "negative"

// After
classification = FitClassificationEnum.NEUTRAL / .POSITIVE / .NEGATIVE
```

Atualizar tipo de retorno da função `computeFitClassification`.

### Step 5 — Atualizar spec files (API)

`apps/api/src/domains/fit-analysis/scoring/scoring.spec.ts`:

14 ocorrências de `.toBe("positive")` / `.toBe("negative")` / `.toBe("neutral")` → `.toBe(FitClassificationEnum.POSITIVE)` etc.

### Step 6 — Regenerar codegen

```bash
pnpm --filter @job-tracker/web run codegen
```

### Step 7 — Atualizar web

**`apps/web/src/modules/applications/shared/utils/fitFormat.ts:4-5`:**

```ts
// Before
if (classification === "positive") return "Positive";
if (classification === "negative") return "Negative";

// After
if (classification === FitClassification.Positive) return "Positive";
if (classification === FitClassification.Negative) return "Negative";
```

**`apps/web/src/modules/applications/shared/components/FitClassification.tsx:42-43`:**

```ts
// Before: classification === "positive" / === "negative"
// After: classification === FitClassification.Positive / .Negative
```

**`apps/web/src/modules/applications/details/components/FitAnalysisField.tsx:26,28`:**

```ts
// Before: fit.classification === "positive" / === "negative"
// After: fit.classification === FitClassification.Positive / .Negative
```

## Execution Order

```
1. Criar enum TS
2. Gerar migration (CREATE TYPE + ALTER COLUMN)
3. Rodar migration: pnpm --filter @job-tracker/api run db:migrate
4. Atualizar entity/scoring/specs/web
5. Regenerar codegen
6. typecheck + lint + test
```

## Verification

```bash
pnpm --filter @job-tracker/api run db:migrate
pm2 logs job-tracker-refa-api --lines 20 --nostream
pnpm typecheck
pnpm lint
pnpm test
```

## Rollback

1. `ALTER TABLE fit_analysis ALTER COLUMN classification TYPE text`
2. `DROP TYPE fit_classification`
3. Restaurar type alias + reverter entity
4. Regenerar codegen
