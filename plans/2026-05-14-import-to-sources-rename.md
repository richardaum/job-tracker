# Rename: Imports → Sources

**Date:** 2026-05-14
**Status:** planned
**Miguel's call:** SourceProfile / Source / SourceRun

## Mapping

| Current | New | Notes |
|---------|-----|-------|
| Importer (plan) | SourceProfile | RemoteYeah, LinkedIn etc. — extraction profile |
| ImportTemplate | Source | User's config (URL + cron) |
| ImportRun | SourceRun | One execution |
| Application.importRunId | Application.sourceRunId | FK column |

## Migration SQL

```sql
-- 1. Rename enums
ALTER TYPE import_run_status RENAME TO source_run_status;

-- 2. Rename tables
ALTER TABLE import_runs RENAME TO source_runs;
ALTER TABLE import_templates RENAME TO source_templates;
ALTER TABLE source_runs RENAME CONSTRAINT FK_import_runs_template TO FK_source_runs_template;
ALTER TABLE source_runs RENAME CONSTRAINT PK_import_runs TO PK_source_runs;
ALTER TABLE source_templates RENAME CONSTRAINT PK_import_templates TO PK_source_templates;
ALTER TABLE source_templates RENAME CONSTRAINT UQ_import_templates_user_importer TO UQ_source_templates_user_source_profile;

-- 3. Rename indexes
ALTER INDEX IDX_import_runs_user_started RENAME TO IDX_source_runs_user_started;
ALTER INDEX IDX_import_runs_template_started RENAME TO IDX_source_runs_template_started;
ALTER INDEX IDX_import_templates_user RENAME TO IDX_source_templates_user;

-- 4. Rename column on applications
ALTER TABLE applications RENAME COLUMN import_run_id TO source_run_id;
ALTER TABLE applications RENAME CONSTRAINT FK_applications_import_run TO FK_applications_source_run;
ALTER INDEX IDX_applications_import_run RENAME TO IDX_applications_source_run;
```

## Migration — generate via TypeORM

Use TypeORM `RENAME` in a new migration to avoid hand-writing SQL across envs. Create `1765500000000-rename-import-to-source.ts`.

## Phases

### Phase 1 — Database entities
- `import-run.entity.ts` → `source-run.entity.ts`
- `import-template.entity.ts` → `source-template.entity.ts`
- `user-preferences.entity.ts` (cross-ref)
- Update `application.entity.ts` (importRunId → sourceRunId)

### Phase 2 — API domain
- Rename folder `domains/imports/` → `domains/sources/`
- Rename all classes, methods, files inside
- Update `app.module.ts` and `data-source-options.ts`

### Phase 3 — GraphQL schema
- Update all types, queries, mutations, inputs, enums in `schema.gql`

### Phase 4 — Applications domain cross-refs
- `importRunId` → `sourceRunId` across service, resolver, repository, input, type

### Phase 5 — Web app
- Rename folder `modules/imports/` → `modules/sources/`
- Rename route `app/(authenticated)/imports/` → `app/(authenticated)/sources/`
- Update sidebar, all imports, GraphQL operations
- Update all user-facing text

### Phase 6 — Extension
- Rename folder `domains/imports/` → `domains/sources/`
- Update all GraphQL operations, services, tests

### Phase 7 — DB migration
- Create migration file with all ALTER TABLE/INDEX/COLUMN renames

### Phase 8 — Docs + Specs
- `specs/035-product-import/` → `specs/035-product-sources/`
- `docs/FEATURE_MAP.md`
- Other specs referencing `/imports` or feature name

### Phase 9 — Codegen
- `pnpm codegen` for web
- Regenerate extension gql types

### Phase 10 — Validation
- typecheck
- lint
- tests (api, web, extension)
