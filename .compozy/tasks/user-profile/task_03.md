---
status: completed
title: "PM2 restart + GraphQL codegen"
type: backend
complexity: low
dependencies: [task_01, task_02]
---

# Task 03: PM2 restart + GraphQL codegen

## Overview

Restart the API to regenerate `schema.gql` with the new `settings` query and `updateSettings` mutation, then run frontend codegen to generate typed hooks (`useSettingsQuery`, `useUpdateSettingsMutation`) for the Settings tab.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST restart API: `pm2 restart api` (or `docker restart job-tracker-api` if using Docker)
- MUST verify `schema.gql` contains `type UserSetting`, `type Query { settings }`, `type Mutation { updateSettings }`
- MUST run codegen: `pnpm --filter @job-tracker/web run codegen`
- MUST verify generated hooks exist in `apps/web/src/gql/hooks.ts` for `useSettingsQuery` and `useUpdateSettingsMutation`
- MUST NOT introduce typecheck or lint errors from generated code
</requirements>

## Subtasks

- [ ] 3.1 Restart API (`pm2 restart api`)
- [ ] 3.2 Check PM2 logs for startup errors: `pm2 logs api --lines 30 --nostream`
- [ ] 3.3 Verify `apps/api/src/schema.gql` contains the new settings types
- [ ] 3.4 Run `pnpm --filter @job-tracker/web run codegen`
- [ ] 3.5 Verify generated hooks in `apps/web/src/gql/hooks.ts` include settings operations
- [ ] 3.6 Verify: `pnpm --filter web typecheck` passes

## Implementation Details

No code changes — purely operational steps. See TechSpec § GraphQL Schema Changes Summary for expected schema output.

After codegen, `apps/web/src/gql/hooks.ts` should export `useSettingsQuery` and `useUpdateSettingsMutation` (or similar names matching the operations in `settings.graphql` created in task_06).

### Relevant Files

- `apps/api/src/schema.gql` — regenerated on API restart
- `apps/web/codegen.ts` — codegen config (reads `schema.gql`, writes `src/gql/`)
- `apps/web/src/gql/hooks.ts` — generated Apollo hooks

### Dependent Files

- `apps/web/src/modules/profile/settings/page/SettingsTabPage.tsx` — will import generated hooks (task_06)

### Related ADRs

- [ADR-003: User Settings as Typed Entity](../adrs/adr-003.md) — Settings GraphQL operations

## Deliverables

- Regenerated `apps/api/src/schema.gql` with `UserSetting` type, `settings` query, `updateSettings` mutation
- Regenerated `apps/web/src/gql/hooks.ts` with settings hooks
- Regenerated `apps/web/src/gql/sdk.ts` with settings operations

## Tests

No dedicated tests for codegen — correctness verified by:

- [ ] `schema.gql` diff contains expected UserSetting type
- [ ] Generated hooks export `useSettingsQuery` and `useUpdateSettingsMutation`
- [ ] `pnpm --filter web typecheck` passes with generated code

## Success Criteria

- API restarts without errors (check `pm2 logs api --lines 30 --nostream`)
- `schema.gql` contains `type UserSetting { userId, autoFillEnabled, autoSummaryEnabled, duplicateWindowDays }`
- `schema.gql` contains `settings: UserSetting!` in Query type
- `schema.gql` contains `updateSettings(input: UpdateSettingsInput!): UserSetting!` in Mutation type
- `pnpm --filter @job-tracker/web run codegen` exits 0
- `pnpm --filter web typecheck` passes
