# Plano de Rename: Application → Job / Fit → Match

**Status:** planned · **Type:** refactor · **Created:** 2026-05-19 · **Slug:** `app-fit-rename`

---

## Sumário Executivo

Renomeação global em duas fases sequenciais:

| Fase | Rename                | Arquivos afetados          | Diretórios afetados |
| ---- | --------------------- | -------------------------- | ------------------- |
| 1    | `Application` → `Job` | ~85 (+ codegen regenerado) | 13                  |
| 2    | `Fit` → `Match`       | ~32 (+ codegen regenerado) | 8                   |

**Por que sequencial:** 55 arquivos contêm AMBOS os termos. Paralelizar causaria conflitos de merge nesses arquivos. A Fase 2 herda os renames da Fase 1 (ex: `FitAnalysisField.tsx` dentro de `modules/jobs/`).

---

## Regras de Casing

Cada termo aparece em múltiplas formas. A tabela define o mapeamento:

### Application → Job

| Original        | Substituição | Exemplo                                               |
| --------------- | ------------ | ----------------------------------------------------- |
| `Application`   | `Job`        | `ApplicationEntity` → `JobEntity`                     |
| `application`   | `job`        | `applicationId` → `jobId`                             |
| `Applications`  | `Jobs`       | `ApplicationsPage` → `JobsPage`                       |
| `applications`  | `jobs`       | `useApplicationsQuery` → `useJobsQuery`               |
| `APPLICATION`   | `JOB`        | `ApplicationStage` enum context                       |
| `application-`  | `job-`       | `application.entity.ts` → `job.entity.ts`             |
| `-application-` | `-job-`      | `draft-application.entity.ts` → `draft-job.entity.ts` |
| `-application`  | `-job`       | `import-application/` → `import-job/`                 |

### Fit → Match

| Original           | Substituição     | Exemplo                              |
| ------------------ | ---------------- | ------------------------------------ |
| `FitAnalysis`      | `MatchAnalysis`  | entidade, service, resolver          |
| `FitItem`          | `MatchItem`      | sub-tipo JSONB                       |
| `Fit` (standalone) | `Match`          | nomes de classe, tipos               |
| `fit` (standalone) | `match`          | variáveis, props, paths              |
| `FIT`              | `MATCH`          | enum `CulturalFit` → `CulturalMatch` |
| `fit-analysis`     | `match-analysis` | nomes de arquivo/pasta               |
| `fits`             | `matches`        | rotas (`/fits` → `/matches`)         |

### Falsos positivos — NÃO renomear

Palavras que contêm "fit" mas são termos independentes:

- `benefit`, `benefits` (benefício)
- `profile`, `profiles` (perfil)
- `outfit` (vestimenta)
- `fit` como verbo inglês em comentários ("does not fit")

---

## Fase 1: Application → Job

### Pré-condições

- [ ] `git status` limpo (ou mudanças stagadas/commitadas)
- [ ] `pnpm typecheck` passando no estado atual
- [ ] `pnpm test` passando no estado atual

### Task 1.1 — Schema GraphQL (API)

**Arquivo:** `apps/api/src/schema.gql`

**Mudanças:**

- Types: `Application` → `Job`, `DraftApplication` → `DraftJob`
- Inputs: `CreateApplicationInput` → `CreateJobInput`, `UpdateApplicationInput` → `UpdateJobInput`, `CreateDraftApplicationInput` → `CreateDraftJobInput`, etc.
- Queries: `application(id)` → `job(id)`, `applications(...)` → `jobs(...)`, `draftApplications` → `draftJobs`
- Mutations: `createApplication` → `createJob`, `updateApplication` → `updateJob`, `deleteApplication` → `deleteJob`
- Payloads: `DeleteApplicationPayload` → `DeleteJobPayload`
- Campos: `applicationId` → `jobId`, `application` → `job`, `applications` → `jobs`
- Enums: referências a `ApplicationStage`, `ApplicationSource` etc.

**Verificação:** `pnpm --filter @job-tracker/api run typecheck`

### Task 1.2 — Entidades TypeORM (API)

**Arquivos:**

- `apps/api/src/database/entities/application.entity.ts` → `job.entity.ts`
- `apps/api/src/database/entities/application-note.entity.ts` → `job-note.entity.ts`
- `apps/api/src/database/entities/application-stage-event.entity.ts` → `job-stage-event.entity.ts`
- `apps/api/src/database/entities/draft-application.entity.ts` → `draft-job.entity.ts`

**Mudanças em cada arquivo:**

- Nome da classe: `Application` → `Job`, `ApplicationNote` → `JobNote`, etc.
- Decorators: `@Entity("application")` → `@Entity("job")`, `@Entity("application_note")` → `@Entity("job_note")`, etc.
- Colunas: `application_id` → `job_id`, `applicationId` → `jobId`
- Relações: `@ManyToOne(() => Application)` → `@ManyToOne(() => Job)`
- Índices: renomear nos decorators `@Index()`

### Task 1.3 — Domínio `applications/` (API)

**Diretório:** `apps/api/src/domains/applications/` → `apps/api/src/domains/jobs/`

**Arquivos (23):**

| Original                                  | Novo                              |
| ----------------------------------------- | --------------------------------- |
| `application.type.ts`                     | `job.type.ts`                     |
| `application.events.ts`                   | `job.events.ts`                   |
| `application-event.bus.ts`                | `job-event.bus.ts`                |
| `application-source.enum.ts`              | `job-source.enum.ts`              |
| `application-source.util.ts`              | `job-source.util.ts`              |
| `application-stage.enum.ts`               | `job-stage.enum.ts`               |
| `application-stage-event.type.ts`         | `job-stage-event.type.ts`         |
| `application-stage-events.schema.ts`      | `job-stage-events.schema.ts`      |
| `application-quick-filter.enum.ts`        | `job-quick-filter.enum.ts`        |
| `application-duplicate.constants.ts`      | `job-duplicate.constants.ts`      |
| `applications.module.ts`                  | `jobs.module.ts`                  |
| `applications.service.ts`                 | `jobs.service.ts`                 |
| `applications.service.spec.ts`            | `jobs.service.spec.ts`            |
| `applications.resolver.ts`                | `jobs.resolver.ts`                |
| `applications.resolver.spec.ts`           | `jobs.resolver.spec.ts`           |
| `applications.repository.ts`              | `jobs.repository.ts`              |
| `applications.repository.spec.ts`         | `jobs.repository.spec.ts`         |
| `applications.schema.ts`                  | `jobs.schema.ts`                  |
| `applications-sse.controller.ts`          | `jobs-sse.controller.ts`          |
| `create-application.input.ts`             | `create-job.input.ts`             |
| `update-application.input.ts`             | `update-job.input.ts`             |
| `create-application-stage-event.input.ts` | `create-job-stage-event.input.ts` |
| `update-application-stage-event.input.ts` | `update-job-stage-event.input.ts` |

**Mudanças de conteúdo (por arquivo):**

- Classes: `ApplicationFieldResolver` → `JobFieldResolver`
- Services: `ApplicationsService` → `JobsService`
- Resolvers: `ApplicationsResolver` → `JobsResolver`
- Imports: atualizar paths de `./application.*` para `./job.*`
- Module: `ApplicationsModule` → `JobsModule`, providers atualizados
- Enum values: manter valores internos, renomear apenas nomes TypeScript
- Testes: atualizar describes, variáveis, imports

### Task 1.4 — Domínio `draft-applications/` (API)

**Diretório:** `apps/api/src/domains/draft-applications/` → `apps/api/src/domains/draft-jobs/`

**Arquivos (10):**

| Original                               | Novo                           |
| -------------------------------------- | ------------------------------ |
| `draft-application.type.ts`            | `draft-job.type.ts`            |
| `draft-application.events.ts`          | `draft-job.events.ts`          |
| `draft-application-event.bus.ts`       | `draft-job-event.bus.ts`       |
| `draft-applications.module.ts`         | `draft-jobs.module.ts`         |
| `draft-applications.service.ts`        | `draft-jobs.service.ts`        |
| `draft-applications.service.spec.ts`   | `draft-jobs.service.spec.ts`   |
| `draft-applications.resolver.ts`       | `draft-jobs.resolver.ts`       |
| `draft-applications.repository.ts`     | `draft-jobs.repository.ts`     |
| `draft-applications-sse.controller.ts` | `draft-jobs-sse.controller.ts` |
| `create-draft-application.input.ts`    | `create-draft-job.input.ts`    |
| `update-draft-application.input.ts`    | `update-draft-job.input.ts`    |

### Task 1.5 — Referências cross-domain e app.module (API)

**Arquivos que importam de `applications/` ou `draft-applications/`:**

- `apps/api/src/app.module.ts` — imports de módulos
- `apps/api/src/database/data-source-options.ts` — entities list
- `apps/api/src/database/migrations/index.ts` — migration imports
- `apps/api/src/domains/fit-analysis/` — referências a `Application`, `applicationId`, `applications.service`
- `apps/api/src/domains/companies/` — possível referência a `Application`
- `apps/api/src/domains/ai/` — possível referência a `Application`
- `apps/api/src/domains/imports/` — possível referência a `Application`

**Ação:** grep global por `from.*applications` e `from.*draft-applications` no `apps/api/src/`, atualizar todos os imports.

### Task 1.6 — Migrations (API)

**Arquivos em `apps/api/src/database/migrations/archive/` (18 arquivos):**

- Renomear arquivos (ex: `*-application-*.ts` → `*-job-*.ts`)
- Conteúdo: nomes de classe, tabelas, colunas nos SQLs de migration

**IMPORTANTE:** Migrations são históricas — os SQLs dentro delas referem-se a nomes de tabela/coluna que JÁ existem no banco. Avaliar se devemos:

- (A) Renomear só nomes de classe/arquivo, mantendo SQL intacto (migrations já rodadas)
- (B) Criar NOVA migration para renomear tabelas/colunas no banco

**Decisão:** Migrations arquivadas = somente renomear classe/arquivo. Criar nova migration para `RENAME TABLE` se necessário. Verificar com o time.

### Task 1.7 — Scripts (API)

**Arquivos em `apps/api/scripts/`:**

- `AGENTS.md` — referências textuais
- `fix-normalize-enum-casing.ts` — referências a `application`
- Outros scripts que mencionem `application`

### Task 1.8 — Codegen (Web)

**Após Tasks 1.1-1.7 concluídas e typecheck passando na API:**

```bash
pnpm --filter @job-tracker/web run codegen
```

Isso regenera `apps/web/src/gql/` com os novos nomes do schema.

### Task 1.9 — GraphQL documents (Web)

**Arquivos:**

- `apps/web/src/graphql/applications.graphql` → `jobs.graphql`
- `apps/web/src/graphql/draft-applications.graphql` → `draft-jobs.graphql`

**Conteúdo:** queries/mutations renomeadas conforme schema.

### Task 1.10 — Módulo `applications/` (Web)

**Diretório:** `apps/web/src/modules/applications/` → `apps/web/src/modules/jobs/`

**Sub-diretórios e arquivos:**

| Path Original                                           | Path Novo                                       |
| ------------------------------------------------------- | ----------------------------------------------- |
| `details/components/ApplicationTags.tsx` (já em shared) | —                                               |
| `details/components/FitAnalysisField.tsx`               | `details/components/MatchAnalysisField.tsx`     |
| `details/components/FitDialog.tsx`                      | `details/components/MatchDialog.tsx`            |
| `details/hooks/useApplicationDetailsViewModel.ts`       | `details/hooks/useJobDetailsViewModel.ts`       |
| `details/page/ApplicationDetailsPage.tsx`               | `details/page/JobDetailsPage.tsx`               |
| `details/page/ApplicationNotesPage.tsx`                 | `details/page/JobNotesPage.tsx`                 |
| `details/utils/application-details.shared.ts`           | `details/utils/job-details.shared.ts`           |
| `list/components/ApplicationCard.tsx`                   | `list/components/JobCard.tsx`                   |
| `list/components/ApplicationQuickEditDialog.tsx`        | `list/components/JobQuickEditDialog.tsx`        |
| `list/components/ApplicationTrackingPanel.tsx`          | `list/components/JobTrackingPanel.tsx`          |
| `list/components/ApplicationsCompanyFilterBanner.tsx`   | `list/components/JobsCompanyFilterBanner.tsx`   |
| `list/components/ApplicationsImportRunFilterBanner.tsx` | `list/components/JobsImportRunFilterBanner.tsx` |
| `list/components/DeleteApplicationDialog.tsx`           | `list/components/DeleteJobDialog.tsx`           |
| `list/hooks/useApplicationCardViewModel.ts`             | `list/hooks/useJobCardViewModel.ts`             |
| `list/hooks/useApplicationsListViewModel.ts`            | `list/hooks/useJobsListViewModel.ts`            |
| `list/page/ApplicationsPage.tsx`                        | `list/page/JobsPage.tsx`                        |
| `list/page/ApplicationsPage.test.tsx`                   | `list/page/JobsPage.test.tsx`                   |
| `shared/components/ApplicationTags.tsx`                 | `shared/components/JobTags.tsx`                 |
| `shared/components/FitClassification.tsx`               | `shared/components/MatchClassification.tsx`     |
| `shared/utils/applicationSourceLabel.ts`                | `shared/utils/jobSourceLabel.ts`                |
| `shared/utils/fitFormat.ts`                             | `shared/utils/matchFormat.ts`                   |

**Mudanças de conteúdo:**

- Nomes de componentes: `ApplicationCard` → `JobCard`, etc.
- Hooks: `useApplicationsListViewModel` → `useJobsListViewModel`
- Imports: atualizar todos os paths
- Textos de UI: "Application" → "Job", "applications" → "jobs"
- GraphQL hooks: `useApplicationsQuery` → `useJobsQuery`

### Task 1.11 — Módulo `draft-applications/` (Web)

**Diretório:** `apps/web/src/modules/draft-applications/` → `apps/web/src/modules/draft-jobs/`

**Arquivos:**

| Original                                               | Novo                                           |
| ------------------------------------------------------ | ---------------------------------------------- |
| `details/components/DraftApplicationSidePanel.tsx`     | `details/components/DraftJobSidePanel.tsx`     |
| `details/components/DraftCurrentApplicationField.tsx`  | `details/components/DraftCurrentJobField.tsx`  |
| `details/hooks/useDraftApplicationDetailsViewModel.ts` | `details/hooks/useDraftJobDetailsViewModel.ts` |
| `details/page/DraftApplicationDetailsPage.tsx`         | `details/page/DraftJobDetailsPage.tsx`         |
| `list/components/DeleteDraftApplicationDialog.tsx`     | `list/components/DeleteDraftJobDialog.tsx`     |
| `list/components/DraftApplicationCard.tsx`             | `list/components/DraftJobCard.tsx`             |
| `list/hooks/useDraftApplicationsListViewModel.ts`      | `list/hooks/useDraftJobsListViewModel.ts`      |
| `list/page/DraftApplicationsPage.tsx`                  | `list/page/DraftJobsPage.tsx`                  |

### Task 1.12 — Rotas (Web)

**Diretórios:**

- `apps/web/src/app/(authenticated)/applications/` → `apps/web/src/app/(authenticated)/jobs/`
- `apps/web/src/app/(authenticated)/draft-applications/` → `apps/web/src/app/(authenticated)/draft-jobs/`

**Arquivos de rota:**

- `applications/page.tsx` → `jobs/page.tsx`
- `applications/[id]/page.tsx` → `jobs/[id]/page.tsx`
- `applications/layout.tsx` → `jobs/layout.tsx` (se existir)
- `draft-applications/page.tsx` → `draft-jobs/page.tsx`
- `draft-applications/[id]/page.tsx` → `draft-jobs/[id]/page.tsx`

### Task 1.13 — AI actions (Web)

**Arquivos:**

- `apps/web/src/modules/ai/actions/useApplicationNoteAiGenerator.ts` → `useJobNoteAiGenerator.ts`
- `apps/web/src/modules/ai/actions/useImproveApplicationNoteAiAction.ts` → `useImproveJobNoteAiAction.ts`

### Task 1.14 — Extension

**Diretório:** `apps/extension/src/domains/import-application/` → `apps/extension/src/domains/import-job/`

**Arquivos:**

| Original                                                | Novo                                            |
| ------------------------------------------------------- | ----------------------------------------------- |
| `import-application-labels.ts`                          | `import-job-labels.ts`                          |
| `import-application.service.ts`                         | `import-job.service.ts`                         |
| `parse-salary-inner-text-for-application.ts`            | `parse-salary-inner-text-for-job.ts`            |
| `parse-salary-inner-text-for-application.test.ts`       | `parse-salary-inner-text-for-job.test.ts`       |
| `map-collected-job-to-create-application-input.ts`      | `map-collected-job-to-create-job-input.ts`      |
| `map-collected-job-to-create-application-input.test.ts` | `map-collected-job-to-create-job-input.test.ts` |

**GraphQL documents:**

- `apps/extension/src/graphql/create-application.graphql` → `create-job.graphql`
- `apps/extension/src/graphql/create-draft-application.graphql` → `create-draft-job.graphql`

### Task 1.15 — Sidebar e navegação (Web)

**Arquivo:** `apps/web/src/modules/navigation/components/Sidebar.tsx`

**Mudanças:**

- Labels: "Applications" → "Jobs", "Draft Applications" → "Draft Jobs"
- Rotas: `/applications` → `/jobs`, `/draft-applications` → `/draft-jobs`
- Ícones: manter os mesmos

### Task 1.16 — E2E tests

**Arquivo:** `apps/web/e2e/applications.spec.ts` → `jobs.spec.ts`

**Mudanças:**

- Describes e testes: renomear referências
- Seletores: atualizar data-testids se contiverem "application"
- URLs: `/applications` → `/jobs`

### Task 1.17 — Specs e Docs

**Diretórios de specs:**

- `specs/001-product-auth-and-application-core/` → `specs/001-product-auth-and-job-core/`
- `specs/013-product-application-salary/` → `specs/013-product-job-salary/`
- `specs/014-product-application-stages-and-notes/` → `specs/014-product-job-stages-and-notes/`
- `specs/019-technical-application-salary/` → `specs/019-technical-job-salary/`
- `specs/027-technical-ai-application-create-v2/` → `specs/027-technical-ai-job-create-v2/`
- `specs/036-product-application-location/` → `specs/036-product-job-location/`
- `specs/037-product-application-summary/` → `specs/037-product-job-summary/`

**Arquivos de docs:**

- `docs/ADDING_APPLICATION_STAGE.md` → `docs/ADDING_JOB_STAGE.md`

**Conteúdo dos specs/docs:** substituir "Application" → "Job", "application" → "job" no corpo do texto.

### Task 1.18 — UI Package

**Arquivos em `packages/ui/src/`** que referenciem `Application`:

- Verificar com grep e atualizar

### Task 1.19 — Verificação Fase 1

Criar script temporário `scripts/verify-rename-job.sh`:

```bash
#!/bin/bash
set -e
EXCLUDE="node_modules|.git|dist|.next|.turbo|gql/|scripts/verify-rename"

# Deve retornar ZERO matches
echo "=== Verificando 'Application' residual ==="
MATCHES=$(grep -r --include='*.ts' --include='*.tsx' --include='*.gql' --include='*.graphql' \
  '\bApplication\b' apps/ packages/ specs/ docs/ 2>/dev/null | grep -vE "$EXCLUDE" | wc -l)
if [ "$MATCHES" -gt 0 ]; then
  echo "FAIL: $MATCHES ocorrências de 'Application' ainda existem"
  exit 1
fi

echo "=== Verificando 'application' residual ==="
MATCHES=$(grep -r --include='*.ts' --include='*.tsx' --include='*.gql' --include='*.graphql' \
  '\bapplication\b' apps/ packages/ specs/ docs/ 2>/dev/null | grep -vE "$EXCLUDE" | wc -l)
if [ "$MATCHES" -gt 0 ]; then
  echo "FAIL: $MATCHES ocorrências de 'application' ainda existem"
  exit 1
fi

echo "PASS: Nenhum resquício de Application encontrado"
```

**Pós-verificação:**

```bash
pnpm lint
pnpm typecheck
pnpm test
```

---

## Fase 2: Fit → Match

### Pré-condições

- [ ] Fase 1 concluída e verificada
- [ ] `pnpm typecheck` passando
- [ ] `pnpm test` passando
- [ ] Codegen web regenerado com nomes Job

### Task 2.1 — Schema GraphQL (API)

**Arquivo:** `apps/api/src/schema.gql`

**Mudanças:**

- Types: `FitAnalysis` → `MatchAnalysis`, `FitItem` → `MatchItem`
- Inputs: `GenerateFitInput` → `GenerateMatchInput`, `GenerateDraftFitInput` → `GenerateDraftMatchInput`
- Queries: `fitAnalysis(id)` → `matchAnalysis(id)`, `fitAnalyses(...)` → `matchAnalyses(...)`
- Mutations: `generateFitAnalysis` → `generateMatchAnalysis`, `generateDraftFitAnalysis` → `generateDraftMatchAnalysis`
- Campos: `fitAnalysis` → `matchAnalysis`, `fitAnalyses` → `matchAnalyses`, `fitAnalysisId` → `matchAnalysisId`
- Enums: `FitVerdict` → `MatchVerdict` (fit/gap/unclear → manter valores), `CulturalFit` → `CulturalMatch`

### Task 2.2 — Entidade TypeORM (API)

**Arquivo:** `apps/api/src/database/entities/fit-analysis.entity.ts` → `match-analysis.entity.ts`

**Mudanças:**

- Classe: `FitAnalysis` → `MatchAnalysis`
- Decorator: `@Entity("fit_analysis")` → `@Entity("match_analysis")`
- Colunas: `application_id` → `job_id` (já renomeado na Fase 1)
- Relações: `@ManyToOne(() => Job)` (já renomeado na Fase 1)

### Task 2.3 — Domínio `fit-analysis/` (API)

**Diretório:** `apps/api/src/domains/fit-analysis/` → `apps/api/src/domains/match-analysis/`

**Arquivos (16):**

| Original                                           | Novo                               |
| -------------------------------------------------- | ---------------------------------- |
| `fit-analysis.entity.ts` (na verdade em entities/) | `match-analysis.entity.ts`         |
| `fit-analysis.type.ts`                             | `match-analysis.type.ts`           |
| `fit-item.type.ts`                                 | `match-item.type.ts`               |
| `fit-analysis.events.ts`                           | `match-analysis.events.ts`         |
| `fit-analysis-event.bus.ts`                        | `match-analysis-event.bus.ts`      |
| `fit-analysis-event.listener.ts`                   | `match-analysis-event.listener.ts` |
| `fit-analysis.module.ts`                           | `match-analysis.module.ts`         |
| `fit-analysis.service.ts`                          | `match-analysis.service.ts`        |
| `fit-analysis.service.spec.ts`                     | `match-analysis.service.spec.ts`   |
| `fit-analysis.resolver.ts`                         | `match-analysis.resolver.ts`       |
| `fit-analysis.repository.ts`                       | `match-analysis.repository.ts`     |
| `fit-analysis.schema.ts`                           | `match-analysis.schema.ts`         |
| `fit-analysis-ai.service.ts`                       | `match-analysis-ai.service.ts`     |
| `fit-analysis-ai.schema.ts`                        | `match-analysis-ai.schema.ts`      |
| `fit-analysis-ai.templates.ts`                     | `match-analysis-ai.templates.ts`   |
| `fit-analysis-sse.controller.ts`                   | `match-analysis-sse.controller.ts` |
| `generate-fit.input.ts`                            | `generate-match.input.ts`          |
| `generate-draft-fit.input.ts`                      | `generate-draft-match.input.ts`    |

**Mudanças de conteúdo:**

- Classes: `FitAnalysisService` → `MatchAnalysisService`, `FitAnalysisResolver` → `MatchAnalysisResolver`
- Module: `FitAnalysisModule` → `MatchAnalysisModule`
- Imports: atualizar paths
- Variáveis: `fitAnalysis` → `matchAnalysis`, `fitItem` → `matchItem`

### Task 2.4 — Referências cross-domain (API)

Atualizar em:

- `apps/api/src/app.module.ts` — import de `FitAnalysisModule` → `MatchAnalysisModule`
- `apps/api/src/database/data-source-options.ts` — entidade `FitAnalysis` → `MatchAnalysis`
- `apps/api/src/database/migrations/index.ts` — imports de migration
- `apps/api/src/domains/jobs/` (ex-`applications/`) — referências a `FitAnalysis`, `fitAnalysis`

### Task 2.5 — Migrations (API)

**Arquivos (5 em archive + 1 ativa):**

| Original                                                      | Novo                                                      |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| `archive/1763300001000-add-application-stage-cultural-fit.ts` | `archive/1763300001000-add-job-stage-cultural-match.ts`   |
| `archive/1764400000000-create-fit-analysis.ts`                | `archive/1764400000000-create-match-analysis.ts`          |
| `archive/1764500000000-add-fit-analysis-status.ts`            | `archive/1764500000000-add-match-analysis-status.ts`      |
| `archive/1764900000000-add-fit-draft-support.ts`              | `archive/1764900000000-add-match-draft-support.ts`        |
| `archive/1765000000000-add-fit-analysis-user-id.ts`           | `archive/1765000000000-add-match-analysis-user-id.ts`     |
| `1767400000000-add-fit-analysis-generation-metadata.ts`       | `1767400000000-add-match-analysis-generation-metadata.ts` |

**Conteúdo:**

- Classes de migration: `AddApplicationStageCulturalFit` → `AddJobStageCulturalMatch`
- Enum values em SQL: `CulturalFit` → `CulturalMatch`
- Tabelas em SQL: `fit_analysis` → `match_analysis`

**IMPORTANTE:** Como na Fase 1, migrations históricas com SQL — requer nova migration para `ALTER TABLE ... RENAME TO`.

### Task 2.6 — Scripts (API)

**Arquivos:**

- `apps/api/scripts/fix-fit-analysis.ts` → `fix-match-analysis.ts`
- `apps/api/scripts/fix-scoring-logic.ts` — referências a `fit`
- `apps/api/scripts/fix-normalize-enum-casing.ts` — possível referência a `CulturalFit`
- `apps/api/scripts/AGENTS.md` — referências textuais

### Task 2.7 — Codegen (Web)

Após Tasks 2.1-2.6:

```bash
pnpm --filter @job-tracker/web run codegen
```

### Task 2.8 — GraphQL document (Web)

**Arquivo:** `apps/web/src/graphql/fit.graphql` → `match.graphql`

### Task 2.9 — Módulo `fit-analyses/` (Web)

**Diretório:** `apps/web/src/modules/fit-analyses/` → `apps/web/src/modules/match-analyses/`

**Arquivos:**

| Original                                     | Novo                                           |
| -------------------------------------------- | ---------------------------------------------- |
| `details/components/FitItemCard.tsx`         | `details/components/MatchItemCard.tsx`         |
| `details/components/FitStatusBadge.tsx`      | `details/components/MatchStatusBadge.tsx`      |
| `details/components/FitStatusBadge.test.tsx` | `details/components/MatchStatusBadge.test.tsx` |
| `details/components/FitWizardDialog.tsx`     | `details/components/MatchWizardDialog.tsx`     |
| `details/page/FitAnalysisPage.tsx`           | `details/page/MatchAnalysisPage.tsx`           |
| `list/components/FitAnalysisListCard.tsx`    | `list/components/MatchAnalysisListCard.tsx`    |
| `list/components/FitScoreBadge.tsx`          | `list/components/MatchScoreBadge.tsx`          |
| `list/page/FitAnalysesPage.tsx`              | `list/page/MatchAnalysesPage.tsx`              |

### Task 2.10 — Componentes Fit dentro de `jobs/` (Web)

Estes arquivos estão dentro de `apps/web/src/modules/jobs/` (ex-`applications/`):

| Original                                  | Novo                                        |
| ----------------------------------------- | ------------------------------------------- |
| `details/components/FitAnalysisField.tsx` | `details/components/MatchAnalysisField.tsx` |
| `details/components/FitDialog.tsx`        | `details/components/MatchDialog.tsx`        |
| `shared/components/FitClassification.tsx` | `shared/components/MatchClassification.tsx` |
| `shared/utils/fitFormat.ts`               | `shared/utils/matchFormat.ts`               |

**Mudanças de conteúdo:**

- Componentes: `FitAnalysisField` → `MatchAnalysisField`, etc.
- Props: `fitAnalysis` → `matchAnalysis`, `fitItem` → `matchItem`
- Textos de UI: "Fit Analysis" → "Match Analysis", "Fit Score" → "Match Score"

### Task 2.11 — Rotas (Web)

**Diretório:** `apps/web/src/app/(authenticated)/fits/` → `apps/web/src/app/(authenticated)/matches/`

**Arquivos de rota:**

- `fits/page.tsx` → `matches/page.tsx`
- `fits/[id]/page.tsx` → `matches/[id]/page.tsx`

### Task 2.12 — Sidebar e navegação (Web)

**Arquivo:** `apps/web/src/modules/navigation/components/Sidebar.tsx`

**Mudanças:**

- Label: "Fit Analyses" → "Match Analyses"
- Rota: `/fits` → `/matches`

### Task 2.13 — Referências a Fit em jobs/ (Web)

Arquivos em `jobs/` que referenciam `Fit`:

- `details/components/OverviewTabContent.tsx`
- `details/components/HistoryPanel.tsx`
- `details/components/UpdateStatusAction.tsx`
- `details/page/JobDetailsPage.tsx` (ex-ApplicationDetailsPage)
- `details/utils/job-details.shared.ts` (ex-application-details.shared)
- `shared/components/StatusBadge.tsx`
- `shared/components/StageTimeline.tsx`
- `list/components/JobCard.tsx` (ex-ApplicationCard)
- `list/components/JobTrackingPanel.tsx` (ex-ApplicationTrackingPanel)

**Mudanças:** atualizar import paths e referências de `Fit` → `Match`.

### Task 2.14 — Specs

**Diretório:** `specs/032-product-job-fit/` → `specs/032-product-job-match/`

**Mudanças de conteúdo nos specs:**

- `README.md`: "Job Fit" → "Job Match", "fit analysis" → "match analysis"
- `design.md`: todas as referências
- `checklist.md`: todas as referências
- `tasks.md`: todas as referências

**Outros specs que referenciam "fit":**

- `specs/033-compliance-lgpd/README.md`
- `specs/034-technical-async-task-pattern/README.md`
- `specs/034-technical-async-task-pattern/PATTERN.md`
- `specs/038-ai-infrastructure/README.md`
- `specs/040-technical-enum-naming-convention/README.md`
- `specs/041-technical-async-metadata-sub-patterns/README.md`
- `specs/HISTORY.md`

### Task 2.15 — Docs

**Arquivos:**

- `docs/FEATURE_MAP.md` — referências a "fit"

### Task 2.16 — Enum ApplicationStage.CulturalFit

**Arquivo:** `apps/api/src/domains/jobs/job-stage.enum.ts` (ex-`application-stage.enum.ts`)

**Mudança:** `CulturalFit = "CULTURAL_FIT"` → `CulturalMatch = "CULTURAL_MATCH"`

**Impacto:** migration nova para atualizar valores no banco.

### Task 2.17 — Verificação Fase 2

Script temporário `scripts/verify-rename-match.sh`:

```bash
#!/bin/bash
set -e
EXCLUDE="node_modules|.git|dist|.next|.turbo|gql/|scripts/verify|benefit|profile|outfit|profit|retrofit"

echo "=== Verificando 'Fit' standalone residual ==="
MATCHES=$(grep -r --include='*.ts' --include='*.tsx' --include='*.gql' --include='*.graphql' \
  '\bFit\b' apps/ packages/ 2>/dev/null | grep -vE "$EXCLUDE" | wc -l)
if [ "$MATCHES" -gt 0 ]; then
  echo "FAIL: $MATCHES ocorrências de 'Fit' ainda existem"
  grep -rn '\bFit\b' apps/ packages/ --include='*.ts' --include='*.tsx' | grep -vE "$EXCLUDE"
  exit 1
fi

echo "=== Verificando 'fit' standalone residual ==="
MATCHES=$(grep -r --include='*.ts' --include='*.tsx' --include='*.gql' --include='*.graphql' \
  '\bfit\b' apps/ packages/ 2>/dev/null | grep -vE "$EXCLUDE" | wc -l)
if [ "$MATCHES" -gt 0 ]; then
  echo "FAIL: $MATCHES ocorrências de 'fit' ainda existem"
  exit 1
fi

echo "PASS: Nenhum resquício de Fit encontrado"
```

---

## Verificação Final

### Ordem de execução

```bash
# 1. Codegen web (garantir que schema está sincronizado)
pnpm --filter @job-tracker/web run codegen

# 2. Import sorting
pnpm fix:imports

# 3. Lint + Format + Typecheck (paralelizável)
pnpm lint
pnpm format
pnpm typecheck

# 4. Testes
pnpm test

# 5. Scripts de verificação de rename
bash scripts/verify-rename-job.sh
bash scripts/verify-rename-match.sh

# 6. Dead code check
pnpm knip

# 7. E2E (se disponível)
pnpm e2e
```

### Critérios de sucesso

- [ ] `pnpm typecheck` passa sem erros em `apps/api` e `apps/web`
- [ ] `pnpm test` passa sem falhas
- [ ] `pnpm lint` sem warnings novos
- [ ] Scripts de verificação retornam zero matches para `Application` e `Fit`
- [ ] Codegen web gera hooks com novos nomes (Jobs, Matches)
- [ ] `pnpm knip` não reporta dead code novo
- [ ] PM2 logs sem erros novos (`pm2 logs api --lines 30 --nostream`)

---

## Riscos e Mitigações

| Risco                                     | Impacto                        | Mitigação                                                      |
| ----------------------------------------- | ------------------------------ | -------------------------------------------------------------- |
| Tabelas de banco não renomeadas           | Query failures em produção     | Criar migration `RENAME TABLE`; testar em dev                  |
| Enum values no banco (CulturalFit)        | Dados inválidos                | Criar migration para atualizar valores; verificar constraints  |
| Codegen gera tipos com nomes antigos      | Type errors em cascata         | Rodar codegen após cada fase; verificar `schema.gql` primeiro  |
| Nomes de rota quebram bookmarks           | 404 para usuários              | Adicionar redirects no Next.js das rotas antigas para as novas |
| Falsos positivos no script de verificação | Falso alarme                   | Script com exclusões explícitas (`benefit`, `profile`, etc.)   |
| Migrations históricas conflitam           | Erro ao rodar migrations novas | Não alterar SQL de migrations já rodadas; criar novas          |

---

## Notas

- **Worktree slug:** `job-fit-renaming` — este é o nome do worktree git, não deve ser alterado
- **Database name:** `job_tracker_job_fit_remodeling` — nome do banco do worktree, não alterar
- **Package names:** `@job-tracker/*` — escopo do monorepo, não alterar
- O termo "job" no código NÃO se refere a "background job" ou "queue job" — é exclusivamente a entidade de negócio (job application)
