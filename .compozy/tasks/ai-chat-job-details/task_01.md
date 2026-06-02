---
status: completed
title: Database migration + entities
type: api
complexity: low
dependencies: []
---

# Task 01: Database migration + entities

## Overview

Create the database schema for AI chat conversations and messages. This includes two new tables (`ai_conversations`, `ai_messages`), their TypeORM entity classes, and a database migration.

<critical>

- Read `_prd.md` and `_techspec.md` before starting
- Reference TechSpec "Data Models" section for entity field definitions
- Focus on WHAT: schema + entities only — no resolvers, services, or UI
- Tests required — verify migration runs and rolls back correctly
- Follow existing project conventions (see Relevant Files)

</critical>

<requirements>

1. MUST create `AiConversationEntity` with fields: id (text PK), jobId (text, not-null), userId (text, not-null), title (text, default "New conversation"), createdAt (timestamptz), updatedAt (timestamptz)
2. MUST create `AiMessageEntity` with fields: id (text PK), conversationId (text, not-null), role (text, "user" or "assistant"), content (text, not-null), createdAt (timestamptz)
3. MUST NOT include a status field on AiMessageEntity — messages are only persisted when complete (see ADR-004)
4. MUST create a TypeORM migration with `CREATE TABLE` for both entities
5. MUST register the migration in `apps/api/src/database/migrations/index.ts`
6. MUST NOT use `synchronize: true` — always use explicit migrations
7. Entity files MUST follow the same pattern as `job-note.entity.ts`

</requirements>

## Subtasks

- [ ] Create `apps/api/src/database/entities/ai-conversation.entity.ts`
- [ ] Create `apps/api/src/database/entities/ai-message.entity.ts`
- [ ] Generate migration file in `apps/api/src/database/migrations/`
- [ ] Register migration in `apps/api/src/database/migrations/index.ts`
- [ ] Run `pnpm --filter @job-tracker/api run db:migrate` and verify tables exist
- [ ] Verify rollback works

## Implementation Details

Entity files go in `apps/api/src/database/entities/`. Follow the existing pattern: `@Entity({ name: "ai_conversations" })`, `@PrimaryColumn({ type: "text" })` for IDs, `@CreateDateColumn`/`@UpdateDateColumn` for timestamps.

Migration file goes in `apps/api/src/database/migrations/` following the naming convention `{timestamp}-description.ts`. Register it in both the import list and the `migrations` array in `apps/api/src/database/migrations/index.ts`.

### Relevant Files

- `apps/api/src/database/entities/job-note.entity.ts` — Reference entity: simple entity with text PK, jobId, userId, content, timestamps
- `apps/api/src/database/migrations/index.ts` — Migration registry: add import + push to array

### Dependent Files

- `apps/api/src/database/entities/ai-conversation.entity.ts` — Created here, consumed by AiChatRepository in task 02
- `apps/api/src/database/entities/ai-message.entity.ts` — Created here, consumed by AiChatRepository in task 02
- Migration file — Created here, applied at runtime

### Related ADRs

- [ADR-003: Normalized Data Model for AI Conversations](../adrs/adr-003.md) — Decision to use separate tables

## Deliverables

- `apps/api/src/database/entities/ai-conversation.entity.ts`
- `apps/api/src/database/entities/ai-message.entity.ts`
- Migration file in `apps/api/src/database/migrations/`
- Updated `apps/api/src/database/migrations/index.ts`
- Test coverage >= 80%

## Tests

### Unit Tests

- [ ] Entity decorators match expected column names (verify column name casing)
- [ ] AiConversationEntity defaults (title default, timestamps)
- [ ] AiMessageEntity field types

### Integration Tests

- [ ] Migration applies without errors
- [ ] Migration rollback works cleanly
- [ ] After migration, `ai_conversations` table exists with expected columns
- [ ] After migration, `ai_messages` table exists with expected columns
- [ ] INSERT + SELECT roundtrip on both tables

## Success Criteria

- [ ] Migration applies and rolls back cleanly
- [ ] Both tables exist with correct columns and types
- [ ] All tests passing
- [ ] Test coverage >= 80%
