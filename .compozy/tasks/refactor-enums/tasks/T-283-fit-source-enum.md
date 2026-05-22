# T-283: Create `FitSourceEnum`

**Status:** pending · **Phase:** 3c · **Priority:** high · **Dependencies:** Datafix script (Step 0) deve rodar antes do deploy do código

## Context

`FitItem.source` é campo `String!` no GraphQL e union type `"resume" | "preference"` na interface TS. Armazenado em JSONB (`fit_analysis.items[].source`). A migration T-223 normalizou `items[].type` mas **não tocou em `items[].source`** — os dados no banco ainda estão em **lowercase**. O novo enum usa **UPPERCASE** (`RESUME`, `PREFERENCE`). Precisamos de um datafix script para normalizar antes de alterar os tipos TS.

## Steps

### Step 0 — Datafix script (PRÉ-REQUISITO)

Criar `apps/api/scripts/fix-fit-source-casing.ts` (padrão NestJS DI, `--dry-run`):

```ts
// Normaliza fit_analysis.items[].source de lowercase → UPPERCASE
// Dry-run: pnpm tsx apps/api/scripts/fix-fit-source-casing.ts --dry-run
// Apply:   pnpm tsx apps/api/scripts/fix-fit-source-casing.ts
```

Este script deve:

1. Buscar todas as rows de `fit_analysis` com `items IS NOT NULL`
2. Para cada item com `source` lowercase, converter para uppercase
3. Salvar via repository

Rodar **antes** de alterar o código TS.

### Step 1 — Criar arquivo do enum

Criar `apps/api/src/domains/fit-analysis/fit-source.enum.ts`:

```ts
import { registerEnumType } from "@nestjs/graphql";

export enum FitSourceEnum {
  RESUME = "RESUME",
  PREFERENCE = "PREFERENCE",
}

registerEnumType(FitSourceEnum, { name: "FitSource" });
```

### Step 2 — Atualizar entity interface

`apps/api/src/database/entities/fit-analysis.entity.ts:23`:

```ts
// Before
source: "resume" | "preference";

// After
source: FitSourceEnum;
```

Adicionar import.

### Step 3 — Atualizar service

`apps/api/src/domains/fit-analysis/fit-analysis.service.ts`:

- L279: `source: FitSourceEnum.RESUME`
- L291: `source: FitSourceEnum.PREFERENCE`

### Step 4 — Atualizar scoring

`apps/api/src/domains/fit-analysis/scoring/scoring.ts`:

- L18: `item.source === FitSourceEnum.RESUME`
- L39: `i.source === FitSourceEnum.RESUME`
- L66: `item.source === FitSourceEnum.RESUME`

### Step 5 — Atualizar GraphQL type

`apps/api/src/domains/fit-analysis/fit-item.type.ts`:

Verificar se campo `source` já existe no type. Se existir como `@Field(() => String)`, trocar para `@Field(() => FitSourceEnum)`.

### Step 6 — Atualizar spec files (API)

`apps/api/src/domains/fit-analysis/scoring/scoring.spec.ts`:

- L12: `source: FitSourceEnum.RESUME`
- L50: `source: FitSourceEnum.PREFERENCE`

### Step 7 — Regenerar codegen

```bash
pnpm --filter @job-tracker/web run codegen
```

### Step 8 — Atualizar web

**`apps/web/src/modules/fit-analyses/details/components/SourceBadge.tsx:17`:**

```ts
// Before: source === "resume"
// After: source === FitSource.Resume
```

**`apps/web/src/modules/applications/details/components/FitDialog.tsx`:**

- L47: filtro state type de `"all" | "resume" | "preference"` para `"all" | FitSource`
- L167,169,176,178: atualizar comparações

## Execution Order

```
1. Rodar datafix script (normaliza JSONB para uppercase)
2. Criar enum + alterar entity/type/scoring/service/web
3. Regenerar codegen
4. typecheck + lint + test
```

## Verification

```bash
pnpm tsx apps/api/scripts/fix-fit-source-casing.ts --dry-run
pnpm tsx apps/api/scripts/fix-fit-source-casing.ts
pnpm typecheck
pnpm lint
pnpm test
```

## Rollback

1. Rodar script reverso (uppercase → lowercase no JSONB)
2. Reverter arquivos TS
3. Regenerar codegen
