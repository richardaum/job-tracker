# T-282: Create `FitVerdictEnum`

**Status:** pending · **Phase:** 3b · **Priority:** high · **Dependencies:** Datafix script (Step 1) deve rodar antes do deploy do código

## Context

`FitItem.verdict` é campo `String!` no GraphQL e union type `"fit" | "gap" | "unclear"` na interface TS. Armazenado em JSONB (`fit_analysis.items[].verdict`). A migration T-223 normalizou `items[].type` mas **não tocou em `items[].verdict`** — os dados no banco ainda estão em **lowercase**. O novo enum usa **UPPERCASE** (`FIT`, `GAP`, `UNCLEAR`). Precisamos de um datafix script para normalizar antes de alterar os tipos TS.

## Steps

### Step 0 — Datafix script (PRÉ-REQUISITO)

Criar `apps/api/scripts/fix-fit-verdict-casing.ts` (padrão NestJS DI, `--dry-run`):

```ts
// Normaliza fit_analysis.items[].verdict de lowercase → UPPERCASE
// Segue o mesmo padrão de fix-normalize-enum-casing.ts
// Dry-run: pnpm tsx apps/api/scripts/fix-fit-verdict-casing.ts --dry-run
// Apply:   pnpm tsx apps/api/scripts/fix-fit-verdict-casing.ts
```

Este script deve:

1. Buscar todas as rows de `fit_analysis` com `items IS NOT NULL`
2. Para cada item com `verdict` lowercase, converter para uppercase
3. Salvar via repository (não raw SQL)

Rodar **antes** de alterar o código TS para `FitVerdictEnum`.

### Step 1 — Criar arquivo do enum

Criar `apps/api/src/domains/fit-analysis/fit-verdict.enum.ts`:

```ts
import { registerEnumType } from "@nestjs/graphql";

export enum FitVerdictEnum {
  FIT = "FIT",
  GAP = "GAP",
  UNCLEAR = "UNCLEAR",
}

registerEnumType(FitVerdictEnum, { name: "FitVerdict" });
```

### Step 2 — Atualizar entity interface

`apps/api/src/database/entities/fit-analysis.entity.ts:26`:

```ts
// Before
verdict: "fit" | "gap" | "unclear";

// After
verdict: FitVerdictEnum;
```

Adicionar import.

### Step 3 — Atualizar GraphQL type

`apps/api/src/domains/fit-analysis/fit-item.type.ts:26`:

```ts
// Before
@Field(() => String)
verdict!: "fit" | "gap" | "unclear";

// After
@Field(() => FitVerdictEnum)
verdict!: FitVerdictEnum;
```

### Step 4 — Atualizar scoring

`apps/api/src/domains/fit-analysis/scoring/scoring.ts`:

- L16: `item.verdict !== FitVerdictEnum.FIT`
- L60-62: `=== FitVerdictEnum.FIT`, `.GAP`, `.UNCLEAR`
- L68: `=== FitVerdictEnum.UNCLEAR`

### Step 5 — Atualizar AI schema

`apps/api/src/domains/fit-analysis/fit-analysis-ai.schema.ts:7,22`:

```ts
verdict: z.nativeEnum(FitVerdictEnum),
```

Substituir `z.enum(["fit", "gap", "unclear"])`.

### Step 6 — Atualizar AI templates

`apps/api/src/domains/fit-analysis/fit-analysis-ai.templates.ts`:

As strings `"fit"`, `"gap"`, `"unclear"` em templates de prompt são texto descritivo para o LLM, não valores de enum. Manter como texto.

### Step 7 — Atualizar spec files (API)

`apps/api/src/domains/fit-analysis/scoring/scoring.spec.ts`:

- L14,28,35,43: `verdict: FitVerdictEnum.FIT` etc.

### Step 8 — Regenerar codegen

```bash
pnpm --filter @job-tracker/web run codegen
```

### Step 9 — Atualizar web

**`apps/web/src/modules/fit-analyses/details/components/VerdictBadge.tsx`:**

```ts
// Before: verdict === "fit", verdict === "gap"
// After: verdict === FitVerdict.Fit, verdict === FitVerdict.Gap
```

**`apps/web/src/modules/fit-analyses/details/components/FitItemCard.tsx`:**

```ts
// Before: item.verdict === "fit", "gap", "unclear"
// After: item.verdict === FitVerdict.Fit, .Gap, .Unclear
```

**`apps/web/src/modules/fit-analyses/details/page/FitAnalysisPage.tsx`:**

- Filtros/state: `"all" | FitVerdict` em vez de `"all" | "fit" | "gap" | "unclear"`
- TabsTrigger values: atualizar para valores do enum

## Execution Order

```
1. Rodar datafix script (normaliza JSONB para uppercase)
2. Criar enum + alterar entity/type/scoring/service/AI/web
3. Regenerar codegen
4. typecheck + lint + test
```

## Verification

```bash
pnpm tsx apps/api/scripts/fix-fit-verdict-casing.ts --dry-run  # validar antes
pnpm tsx apps/api/scripts/fix-fit-verdict-casing.ts             # executar
pnpm typecheck
pnpm lint
pnpm test
```

## Rollback

1. Rodar script reverso (uppercase → lowercase no JSONB)
2. Reverter arquivos TS
3. Regenerar codegen
