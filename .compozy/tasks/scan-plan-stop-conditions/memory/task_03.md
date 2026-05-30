# Task Memory: task_03.md

## Objective Snapshot

Add server-side validation for SourceTemplate stop config and surface the config fields through the SourceRun GraphQL type.

## Important Decisions

- Zod v4 compatibility: `z.ZodIssueCode.custom` → `"custom"` (string literal) works cross-version
- Config passed as GraphQLJSON scalar in create/update inputs rather than individual fields — matches JSONB storage and keeps inputs flexible
- `planHasPublishedAt` helper checks `document.steps[].action.input.surfaceFields[].key === "publishedAt"` across all steps
- Stop config populated from `row.template.config` at query time (not stored on the run)

## Learnings

- `oxlint` binary not available in this environment — can't run `pnpm lint` for the API app
- Integration tests that require a real DB will fail with `relation "migrations" does not exist` — pre-existing limitation
- TypeORM `update()` with `Record<string, unknown> | null` for JSONB column needs explicit cast or dynamic object construction to avoid type mismatch with `DeepPartial`

## Files / Surfaces

- Created: `apps/api/src/domains/sources/stop-when.enum.ts`
- Created: `apps/api/src/domains/sources/source-template-config.schema.ts`
- Modified: `apps/api/src/domains/sources/create-source-template.input.ts` — added `config` field
- Modified: `apps/api/src/domains/sources/update-source-template.input.ts` — added `config` field
- Modified: `apps/api/src/domains/sources/source-run.type.ts` — added stop config fields
- Modified: `apps/api/src/domains/sources/sources.resolver.ts` — pass config through
- Modified: `apps/api/src/domains/sources/sources.repository.ts` — support config in create/update
- Modified: `apps/api/src/domains/sources/sources.service.ts` — validate config, cross-validate OlderThan, populate run fields
- Modified: `apps/api/src/domains/sources/sources.service.spec.ts` — added 19 new test cases

## Errors / Corrections

- TypeORM DeepPartial doesn't accept `null` for `Record<string, unknown>` columns — fixed by building update payload dynamically with `Record<string, unknown>` cast

## Ready for Next Run

- All required changes implemented. Tests pass (448 of 450; 2 failures are pre-existing integration test DB dependency).
- Typecheck passes cleanly.
