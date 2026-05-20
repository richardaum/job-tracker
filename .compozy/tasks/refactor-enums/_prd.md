# PRD: Refactor Enums — String Literals to Formal Enums

**Status**: planned · **Priority**: high · **Created**: 2026-05-19

**Technical specification:** [`_techspec.md`](./_techspec.md)
**Canonical LeanSpec:** [`specs/040-technical-enum-naming-convention/README.md`](../../specs/040-technical-enum-naming-convention/README.md)

**Compozy:** Feature slug `refactor-enums`. Execution mode **A — single git worktree** in [`memory/MEMORY.md`](./memory/MEMORY.md).

**Nota:** Spec 040 Phases 1 e 2 já estavam implementadas (`ApplicationSourceEnum`, `AsyncMetadataStatusEnum`, `DraftApplicationConversionStatusEnum`, `RequirementTypeEnum` já usam sufixo `Enum`; `WeightEnum` já registra `name: "Weight"` no GraphQL). `FitAnalysisStatus` nunca existiu — spec mencionava enum que não foi criado. O plano original foi reduzido ao que realmente falta.

---

## Motivation

4 campos no codebase usam `String`/`text` como pseudo-enums com valores discretos conhecidos, criando brecha de type-safety e inconsistência. Formalizá-los como enums GraphQL + TypeScript (+ PostgreSQL onde aplicável) elimina essa classe de bugs. Há também 1 bug ativo de case mismatch herdado da migration T-223.

---

## Phases

### Phase 0 — Fix Active Bug: `RequirementType` Case Mismatch (Web)

**Bug:** Migration T-223 normalizou `fit_analysis.items[].type` de lowercase para uppercase (`MUST_HAVE`, `NICE_TO_HAVE`, `SOFT_SKILL`). O web ainda compara contra lowercase — `TypeBadge` nunca aplica estilos corretos, `formatRequirementType` retorna string bruta, `RelevanceIcon` nunca renderiza ícones.

**Task:** [`tasks/T-280-requirement-type-case-fix.md`](./tasks/T-280-requirement-type-case-fix.md)

---

### Phase 3 — Create 4 New Enums

| #   | Enum                    | Valores                           | Camada               | DB Column                                      | Task                                                                                 |
| --- | ----------------------- | --------------------------------- | -------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| 3a  | `StageEventSourceEnum`  | `MANUAL`, `SYSTEM`                | GraphQL + TS + PG    | `application_stage_event.source` (text → enum) | [`tasks/T-281-stage-event-source-enum.md`](./tasks/T-281-stage-event-source-enum.md) |
| 3b  | `FitVerdictEnum`        | `FIT`, `GAP`, `UNCLEAR`           | GraphQL + TS (JSONB) | `fit_analysis.items[].verdict`                 | [`tasks/T-282-fit-verdict-enum.md`](./tasks/T-282-fit-verdict-enum.md)               |
| 3c  | `FitSourceEnum`         | `RESUME`, `PREFERENCE`            | GraphQL + TS (JSONB) | `fit_analysis.items[].source`                  | [`tasks/T-283-fit-source-enum.md`](./tasks/T-283-fit-source-enum.md)                 |
| 3d  | `FitClassificationEnum` | `POSITIVE`, `NEUTRAL`, `NEGATIVE` | GraphQL + TS + PG    | `fit_analysis.classification` (text → enum)    | [`tasks/T-284-fit-classification-enum.md`](./tasks/T-284-fit-classification-enum.md) |

**Convenção:**

- TS: `PascalCase` + `Enum` suffix
- GraphQL: `registerEnumType(Enum, { name: "Name" })` (sem sufixo `Enum`)
- DB: PostgreSQL enum type via migration, coluna alterada com `USING`

---

### Phase 4 — `RoleEnum`

| #   | Enum       | Valores         | DB                               | Task                                                     |
| --- | ---------- | --------------- | -------------------------------- | -------------------------------------------------------- |
| 4a  | `RoleEnum` | `USER = "user"` | Já existe `role` enum type no PG | [`tasks/T-285-role-enum.md`](./tasks/T-285-role-enum.md) |

---

## Dependencies

```
Phase 0 (bug fix) — sem dependências
Phase 3a (StageEventSource) — independente
Phase 3b (FitVerdict) — independente
Phase 3c (FitSource) — independente
Phase 3d (FitClassification) — independente
Phase 4 (Role) — independente
```

Todas as fases são independentes entre si e podem ser executadas em paralelo.

---

## Migrations & Datafix Scripts

| Task  | Tipo               | Ação                                                                           | Justificativa                                                              |
| ----- | ------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| T-281 | Migration          | `CREATE TYPE stage_event_source` + `ALTER COLUMN source USING UPPER()`         | Coluna `text` → PG enum. T-223 não tocou (não era enum).                   |
| T-282 | **Datafix script** | `fix-fit-verdict-casing.ts` normaliza `items[].verdict` lowercase → UPPERCASE  | JSONB não aceita `ALTER COLUMN USING`. T-223 só normalizou `items[].type`. |
| T-283 | **Datafix script** | `fix-fit-source-casing.ts` normaliza `items[].source` lowercase → UPPERCASE    | Mesmo caso do T-282.                                                       |
| T-284 | Migration          | `CREATE TYPE fit_classification` + `ALTER COLUMN classification USING UPPER()` | Coluna `text` → PG enum. T-223 não tocou.                                  |
| T-285 | Nenhum             | —                                                                              | PG enum `role` já existe.                                                  |

**Ordem de execução para JSONB (T-282, T-283):** datafix script **antes** de alterar tipos TS, senão o código lê lowercase do banco mas espera uppercase do enum.

## Risks

- **[R-291]** Migrations T-281 e T-284 alteram tipo de coluna — validar dados existentes antes (`SELECT DISTINCT`).
- **[R-292]** `FitVerdict` e `FitSource` estão em JSONB — datafix script é obrigatório e deve rodar antes do deploy do código.
- **[R-293]** `StageEventSource`: verificar que todas as rows têm `source` ∈ `{"manual", "system"}`.
- **[R-294]** `FitClassification`: verificar que todas as rows com `classification IS NOT NULL` têm valor ∈ `{"positive", "neutral", "negative"}`.
- **[R-295]** Datafix scripts manipulam JSONB item a item via repository — testar com `--dry-run` antes.

---

## Validation

- [ ] `pnpm lint` + `pnpm typecheck` passam em `apps/api`, `apps/web`, `apps/extension`
- [ ] `pnpm test` passa em todos os workspaces
- [ ] `schema.gql` regenerado e revisado
- [ ] `pnpm leanspec:validate` passa
- [ ] Zero `QueryFailedError` nos logs PM2 após migration
- [ ] Web: `TypeBadge` renderiza cores corretas por tipo (Phase 0)
- [ ] Web: fit dialog renderiza verdicts/sources/classification com novos enums (Phase 3)

---

## Reintegration (merge → `main`)

**Branch:** `task/refactor-enums`

```bash
git merge task/refactor-enums
```

**Após merge, executar na ordem:**

1. Datafix scripts (JSONB — antes do deploy do código):
   - `pnpm tsx apps/api/scripts/fix-fit-verdict-casing.ts --dry-run`
   - `pnpm tsx apps/api/scripts/fix-fit-verdict-casing.ts`
   - `pnpm tsx apps/api/scripts/fix-fit-source-casing.ts --dry-run`
   - `pnpm tsx apps/api/scripts/fix-fit-source-casing.ts`
2. `pnpm --filter @job-tracker/api run db:migrate`
3. `pnpm --filter @job-tracker/web run codegen`
4. `pnpm typecheck`
5. `pnpm lint`
6. `pnpm test`
7. `pm2 logs api --lines 30 --nostream`

**Followup:** Validar visualmente no web: TypeBadge (cores corretas) e fit dialog (verdicts/sources/classification com novos enums).
