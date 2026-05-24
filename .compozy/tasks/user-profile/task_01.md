---
status: completed
title: "Backend settings infrastructure"
type: backend
complexity: medium
dependencies: []
---

# Task 01: Backend settings infrastructure

## Overview

Create the `UserSetting` entity, TypeORM migration, and full NestJS module (service, resolver, GraphQL type, input type) for persisting user preferences. This is the backend foundation for the Settings tab — a typed single-row-per-user table with `autoFillEnabled`, `autoSummaryEnabled`, and `duplicateWindowDays`.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create `UserSetting` entity at `apps/api/src/database/entities/user-setting.entity.ts` with columns: `userId` (text PK), `autoFillEnabled` (boolean, default false), `autoSummaryEnabled` (boolean, default false), `duplicateWindowDays` (int, default 30), `user` (OneToOne → User, onDelete CASCADE)
- MUST generate one TypeORM migration via `pnpm --filter api migration:generate` and register it in `apps/api/src/database/migrations/index.ts`
- MUST create `SettingsModule` at `apps/api/src/domains/settings/settings.module.ts` importing `TypeOrmModule.forFeature([UserSetting])` + `AuthModule`
- MUST create `SettingsService` with `getSettings(userId)` (findOne + lazy auto-create row with defaults) and `updateSettings(userId, input)` (partial update via save)
- MUST create `SettingsResolver` with `@Query settings` and `@Mutation updateSettings`, both guarded with `@UseGuards(JwtAuthGuard, RolesGuard)` + `@CurrentUser()`
- MUST create `UserSettingType` (`@ObjectType`) and `UpdateSettingsInput` (`@InputType`) with same fields
- MUST register `SettingsModule` in `apps/api/src/app.module.ts` imports
- MUST follow existing patterns: `WorkPreferencesModule` for module structure, `WorkPreferencesResolver` for guard/decorator patterns
</requirements>

## Subtasks

- [ ] 1.1 Read existing entities (`user.entity.ts`, `work-preferences.entity.ts`) and module patterns (`work-preferences.module.ts`, `work-preferences.resolver.ts`) for conventions
- [ ] 1.2 Create `UserSetting` entity with `@Entity("user_settings")`, `@PrimaryColumn`, `@Column` decorators, `@OneToOne` → User
- [ ] 1.3 Generate migration: `pnpm --filter api migration:generate user-settings` → register in migrations index
- [ ] 1.4 Create `SettingsModule` + `SettingsService` + `SettingsResolver` + `UserSettingType` + `UpdateSettingsInput`
- [ ] 1.5 Register `SettingsModule` in `app.module.ts`
- [ ] 1.6 Verify: `pnpm --filter api typecheck` passes

## Implementation Details

See TechSpec § Backend — User Settings for entity shape, GraphQL schema, and module structure.

Entity file: `apps/api/src/database/entities/user-setting.entity.ts`. Follow `WorkPreferencesEntity` pattern (decorators, `@Index`, `@JoinColumn`).

Service: `getSettings` must auto-create a row with defaults on first call (lazy init). Use `findOne` → if null, `insert` defaults → `findOne` again. `updateSettings` uses `save()` with partial update.

Resolver: follow `WorkPreferencesResolver` guard pattern exactly. `@CurrentUser()` decorator from `@/domains/auth/current-user.decorator`.

### Relevant Files

- `apps/api/src/database/entities/user.entity.ts` — User entity (FK target)
- `apps/api/src/database/entities/work-preferences.entity.ts` — entity pattern (decorators, defaults, OneToOne)
- `apps/api/src/domains/work-preferences/work-preferences.module.ts` — module pattern (imports, providers)
- `apps/api/src/domains/work-preferences/work-preferences.resolver.ts` — resolver pattern (guards, @CurrentUser)
- `apps/api/src/domains/work-preferences/work-preferences.service.ts` — service pattern
- `apps/api/src/domains/work-preferences/preference.type.ts` — `@ObjectType` pattern
- `apps/api/src/domains/work-preferences/preference.input.ts` — `@InputType` pattern
- `apps/api/src/app.module.ts` — register new module
- `apps/api/src/database/migrations/index.ts` — register migration (import + array entry)
- `apps/api/src/domains/auth/current-user.decorator.ts` — @CurrentUser() decorator

### Dependent Files

- `apps/api/src/domains/jobs/jobs.service.ts` — will inject `SettingsService` (task_02)
- `apps/web/src/graphql/settings.graphql` — will define frontend operations (task_06)
- `apps/api/src/schema.gql` — regenerated on restart (task_03)

### Related ADRs

- [ADR-003: User Settings as Typed Entity](../adrs/adr-003.md) — Decision for typed columns over JSONB key-value

## Deliverables

- `apps/api/src/database/entities/user-setting.entity.ts`
- `apps/api/src/database/migrations/<timestamp>-user-settings.ts`
- Updated `apps/api/src/database/migrations/index.ts`
- `apps/api/src/domains/settings/settings.module.ts`
- `apps/api/src/domains/settings/settings.service.ts`
- `apps/api/src/domains/settings/settings.resolver.ts`
- `apps/api/src/domains/settings/user-setting.type.ts`
- `apps/api/src/domains/settings/update-settings.input.ts`
- Updated `apps/api/src/app.module.ts`

## Tests

Tests written in task_11. Requirements:

- Unit tests (`settings.service.spec.ts`):
  - [ ] `getSettings` on first call creates row with defaults (autoFillEnabled=false, autoSummaryEnabled=false, duplicateWindowDays=30)
  - [ ] `getSettings` on second call returns existing row without creating new one
  - [ ] `updateSettings` partial update — only changes provided fields, leaves others unchanged
  - [ ] `updateSettings` with no fields — no-op
- Integration tests (`settings.resolver.spec.ts`):
  - [ ] `settings` query returns UserSetting for authenticated user
  - [ ] `settings` query returns 401 for unauthenticated request
  - [ ] `updateSettings` mutation persists changes
  - [ ] `updateSettings` partial update — only changes provided fields
- Test coverage target: >=80%

## Success Criteria

- `pnpm --filter api typecheck` passes with zero new errors
- Migration can be applied and reverted cleanly
- `settings` query returns defaults for new user
- `updateSettings` persists and returns updated values
