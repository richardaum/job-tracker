# Workflow Memory

Keep only durable, cross-task context here. Do not duplicate facts that are obvious from the repository, PRD documents, or git history.

## Current State

Task 01 (Data Model + Migration) — complete. JSONB columns + migration in place. GraphQL types/enums/input registered. Migration integration tests pass against dev DB.

Task 07 (Seed Datafix Script) — complete. `fix-seed-blocked-keywords.ts` reads legacy SQLite, maps 64 keywords, supports `--dry-run` and `--user-id` flags. 11 unit tests pass. Re-verified 2026-05-29.

Task 08 (Codegen) — complete. `schema.gql` regenerated with `BlockedKeyword`, `KeywordScope`, `MatchMode`, `ApplicationQuickFilter.REJECTED`, `UserSetting.blockedKeywords`, `UserSetting.blockedCompanies`. Frontend codegen produces `useSettingsQuery` with new fields. Full `pnpm typecheck` passes (14/14).

## Shared Decisions

- `KeywordScope` and `MatchMode` enums + GraphQL types live in `apps/api/src/domains/settings/` (settings domain), not `jobs/` — co-located with `UserSettingType`.

## Shared Learnings

## Open Risks

- All 7 resolver integration tests fail with missing `@as-integrations/express5` — pre-existing. Not related to these changes.

## Handoffs
