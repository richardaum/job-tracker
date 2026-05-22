# T-281: Create `StageEventSourceEnum`

**Status:** pending · **Phase:** 3a · **Priority:** high · **Dependencies:** Migration (Step 2)

## Context

`ApplicationStageEventEntity.source` é coluna `text` com default `"manual"`. Dois valores usados: `"manual"` (usuário) e `"system"` (sistema). A migration T-223 não tocou nesta coluna (ela é `text`, não PG enum). Os valores no banco estão em **lowercase**. A migration vai criar o PG enum e converter com `USING UPPER()`.

## Pre-migration data validation

```sql
SELECT DISTINCT source FROM application_stage_event;
-- Deve retornar apenas 'manual' e 'system' (ou vazio se sem rows)
```

## Steps

### Step 1 — Criar arquivo do enum

Criar `apps/api/src/domains/applications/stage-event-source.enum.ts`:

```ts
import { registerEnumType } from "@nestjs/graphql";

export enum StageEventSourceEnum {
  MANUAL = "MANUAL",
  SYSTEM = "SYSTEM",
}

registerEnumType(StageEventSourceEnum, { name: "StageEventSource" });
```

### Step 2 — Gerar migration

```bash
pnpm --filter @job-tracker/api run migration:generate --name add-stage-event-source-enum
```

A migration deve:

1. `CREATE TYPE stage_event_source AS ENUM('MANUAL', 'SYSTEM')`
2. `ALTER TABLE application_stage_event ALTER COLUMN source SET DATA TYPE stage_event_source USING UPPER(source)::stage_event_source`
3. `ALTER TABLE application_stage_event ALTER COLUMN source SET DEFAULT 'MANUAL'::stage_event_source`

### Step 3 — Atualizar entity

`apps/api/src/database/entities/application-stage-event.entity.ts` (L34-35):

```ts
// Before
@Column({ type: "text", default: "manual" })
source!: string;

// After
@Column({ type: "enum", enum: StageEventSourceEnum, enumName: "stage_event_source", default: StageEventSourceEnum.MANUAL })
source!: StageEventSourceEnum;
```

Adicionar import.

### Step 4 — Atualizar service/repository (API)

**`apps/api/src/domains/applications/applications.service.ts`:**

- L247: `source: StageEventSourceEnum.SYSTEM`
- L366: `source: StageEventSourceEnum.SYSTEM`
- L564: `source: dto.source ?? StageEventSourceEnum.MANUAL`

**`apps/api/src/domains/applications/applications.repository.ts`:**

- L389: `source: dto.source ?? StageEventSourceEnum.MANUAL`

Adicionar import em ambos.

### Step 5 — Atualizar spec files (API)

- `apps/api/src/domains/applications/applications.service.spec.ts` — 13 ocorrências de `source: "manual"` / `"system"`
- `apps/api/src/domains/applications/applications.repository.spec.ts` — 9 ocorrências

Substituir por `StageEventSourceEnum.MANUAL` / `StageEventSourceEnum.SYSTEM`.

### Step 6 — Atualizar GraphQL type

Verificar se o campo `source` está exposto no type GraphQL do stage event. Se sim, trocar `@Field(() => String)` por `@Field(() => StageEventSourceEnum)`.

### Step 7 — Regenerar codegen

```bash
pnpm --filter @job-tracker/web run codegen
```

### Step 8 — Atualizar web

**`apps/web/src/modules/applications/list/components/ApplicationTrackingPanel.tsx:107`:**

```ts
source: StageEventSource.Manual; // após codegen
```

**`apps/web/src/modules/applications/details/components/UpdateStatusAction.tsx:108`:**

```ts
source: StageEventSource.Manual; // após codegen
```

## Execution Order

```
1. Criar enum TS
2. Gerar migration (CREATE TYPE + ALTER COLUMN)
3. Rodar migration: pnpm --filter @job-tracker/api run db:migrate
4. Atualizar entity/service/repository/specs/web
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

1. `ALTER TABLE application_stage_event ALTER COLUMN source TYPE text`
2. `DROP TYPE stage_event_source`
3. Reverter entity + serviços + specs
4. Regenerar codegen
