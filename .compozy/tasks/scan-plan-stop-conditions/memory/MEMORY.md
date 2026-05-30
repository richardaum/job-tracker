# Workflow Memory

## Current State

- Task 01 (migration) complete — `config` JSONB column added to `source_templates`
- Task 03 complete — stop config validation + SourceRun stop config fields

## Shared Decisions

- Migration timestamp pattern: `1768090000000` follows the existing sequence
- Stop config is populated on `SourceRunType` from `row.template.config` at query time (not stored on the run entity)
- `planHasPublishedAt` checks `document.steps[].action.input.surfaceFields[].key === "publishedAt"`
- Config is passed as `GraphQLJSON` scalar in create/update inputs (flexible for JSONB storage)
- `PlanExecuteOptions.boardType` is mandatory — the execution context always needs board type
- `onJobCollected` return type: `Promise<{ duplicate: boolean } | void>` per ADR-002. Caller must handle the `{ duplicate }` response for CatchUp tracking.

## Shared Learnings

- `CompanyRepository.findOneByNameInsensitiveTrimmed` provides read-only company lookup without side effects — prefer over `CompanyService.findOrCreateByName` for pure checks

## Open Risks

- `source-api` PM2 has pre-existing migration failure (`CreatePlansTable1768010000000` → `relation "plans" already exists`). API cannot start, so `schema.gql` is stale. Any extension task needing codegen for new server-side types will need to patch schema.gql manually or fix the migration issue first.

## Handoffs

- Task 07 complete — Web Admin Plan UI: boardType dropdown added to create (ImportPlanDialog) and edit (PlanDocumentTabContent) forms, wired to document JSONB, with 7 component tests
- Task 08 complete — Web User Template UI: Stop condition config added to SourceTemplate create (NewSourceTemplateDialog) and edit (SourceStopConfigDialog), wired to config JSONB. `SourceTemplateType` GraphQL type patched with `config` field. 12 new component tests passing (7 + 5).
