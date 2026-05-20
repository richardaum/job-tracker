# Tasks: Application→Job / Fit→Match Rename

**Slug:** `app-fit-rename` · **Type:** refactor · **Status:** planned

## Phase 1: Application → Job

| #   | Title                                                        | Scope                                                                                                                                      | Dependencies |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| 01  | Schema + Entities (API)                                      | `schema.gql`, 4 entity files                                                                                                               | —            |
| 02  | Domains `jobs/` + `draft-jobs/` + cross-domain imports (API) | 23 files `applications/` → `jobs/`, 10 files `draft-applications/` → `draft-jobs/`, `app.module.ts`, `data-source-options.ts`              | 01           |
| 03  | Migrations + Scripts (API)                                   | 18 migration files, `scripts/`                                                                                                             | 01           |
| 04  | Codegen + GraphQL documents (Web)                            | Regenerate `gql/`, rename `.graphql` files                                                                                                 | 01, 02, 03   |
| 05  | Modules `jobs/` + `draft-jobs/` + AI actions (Web)           | 21 files in `modules/applications/` → `modules/jobs/`, 8 files in `modules/draft-applications/` → `modules/draft-jobs/`, 2 AI action files | 04           |
| 06  | Routes + Sidebar (Web)                                       | 2 route directories, `Sidebar.tsx`                                                                                                         | 05           |
| 07  | Extension                                                    | `import-application/` domain, `.graphql` files                                                                                             | 04           |
| 08  | E2E                                                          | `applications.spec.ts` → `jobs.spec.ts`                                                                                                    | 05, 06       |
| 09  | Specs + Docs + UI package                                    | 7 spec dirs, 1 doc file, `packages/ui/`                                                                                                    | 01           |
| 10  | Verify Phase 1                                               | Bash script + `lint` + `typecheck` + `test`                                                                                                | 01–09        |

## Phase 2: Fit → Match

| #   | Title                                                    | Scope                                                                                              | Dependencies |
| --- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------ |
| 11  | Schema + Entity (API)                                    | `schema.gql`, `fit-analysis.entity.ts`                                                             | 10           |
| 12  | Domain `match-analysis/` + cross-domain + enum (API)     | 17 files `fit-analysis/` → `match-analysis/`, `app.module.ts`, `CulturalFit` → `CulturalMatch`     | 11           |
| 13  | Migrations + Scripts (API)                               | 6 migration files, `scripts/`                                                                      | 11           |
| 14  | Codegen + GraphQL document (Web)                         | Regenerate `gql/`, rename `fit.graphql`                                                            | 11, 12, 13   |
| 15  | Modules web (match-analyses/ + jobs/ + routes + sidebar) | 8 files `fit-analyses/` → `match-analyses/`, 4 Fit files in `jobs/`, `/fits` → `/matches`, sidebar | 14           |
| 16  | Specs + Docs                                             | `specs/032-product-job-fit/` + 7 cross-ref specs, `docs/`                                          | 11           |
| 17  | Enum `CulturalMatch` + DB migration                      | Update enum value, create migration for DB rows                                                    | 11           |
| 18  | Verify Phase 2 + Final                                   | Bash scripts + full pipeline (`fix:imports`, `lint`, `typecheck`, `test`, `knip`, `e2e`)           | 11–17        |
