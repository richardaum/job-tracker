# Task Memory: task_01.md

## Objective Snapshot

Create TypeORM migration adding `config` JSONB column to `source_templates` table + update entity.

## Important Decisions

- Timestamp `1768090000000` chosen (next after `1768080000000` — last migration in index)
- Column is `config Record<string, unknown>` (matching techspec `SourceTemplateConfigSchema` shape)
- Migration file follows existing pattern: simple `ALTER TABLE ... ADD COLUMN ... jsonb`

## Learnings

- `oxlint` binary not available in this environment (linting is a pre-existing gap in this checkout)
- Migration integration tests (`*.integration.ts`) require `DATABASE_INTEGRATION_URL` and real PostgreSQL — they fail with `relation "migrations" does not exist` when no DB is available (pre-existing)

## Files / Surfaces

- `apps/api/src/database/migrations/1768090000000-add-source-template-config-jsonb.ts` — new migration
- `apps/api/src/database/migrations/index.ts` — import + array entry
- `apps/api/src/database/entities/source-template.entity.ts` — new `config` column decorator

## Errors / Corrections

None.

## Ready for Next Run

Yes. Task 01 complete.
