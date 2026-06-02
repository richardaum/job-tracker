# Task Memory: task_01.md

## Objective Snapshot
Created ai_conversations and ai_messages tables, entities, and migration.

## Important Decisions
- Used `1768180000000` as migration timestamp (fits between existing `176817xxxx` and `178027xxxx`)
- Entity tests use `new Entity()` assignment instead of `plainToInstance` because TypeORM `@Column({ default })` is DDL-only, not applied in-memory

## Learnings
- `plainToInstance` does not apply TypeORM `@Column({ default })` — defaults are DDL-only
- Integration tests require `DATABASE_INTEGRATION_URL` or `DATABASE_URL` and a populated migrations table
- Entity column decorators use `{ name: "snake_case" }` for DB column mapping, but TypeScript property names are camelCase

## Files / Surfaces
- Created: `apps/api/src/database/entities/ai-conversation.entity.ts`
- Created: `apps/api/src/database/entities/ai-message.entity.ts`
- Created: `apps/api/src/database/entities/ai-conversation.entity.spec.ts`
- Created: `apps/api/src/database/entities/ai-message.entity.spec.ts`
- Created: `apps/api/src/database/migrations/1768180000000-create-ai-conversations-and-messages.ts`
- Created: `apps/api/src/database/migrations/1768180000000-create-ai-conversations-and-messages.integration.ts`
- Modified: `apps/api/src/database/migrations/index.ts`

## Errors / Corrections
- Entity tests: initially used `plainToInstance` which doesn't apply defaults — switched to `new Entity()` + property assignment
- Integration tests: both old (176800) and new (176818) fail with `relation "migrations" does not exist` when DB schema is clean — pre-existing infrastructure issue

## Ready for Next Run
Yes — clean lint, typecheck, and entity unit tests. Integration tests require a properly initialized test DB.
