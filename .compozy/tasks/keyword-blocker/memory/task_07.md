# Task Memory: task_07.md

## Objective Snapshot

Create fix-seed-blocked-keywords.ts datafix script: read legacy forbidden_keywords from SQLite, map to BlockedKeyword structure, upsert into user settings.

## Important Decisions

- Used `node:sqlite` (DatabaseSync) for legacy SQLite — built-in Node 22, no install needed
- Extracted mapping logic to `src/domains/settings/keyword-mapper.ts` for testability
- Script requires `--user-id <uuid>` flag (required, no default)
- Upsert uses merge approach: preserves existing keywords, only adds non-duplicates
- Script follows existing fix-* pattern (NestJS DI, --dry-run, process.exit on error)

## Learnings

- Existing npm scripts reference `src/scripts/` but scripts live at `scripts/` — this is pre-existing inconsistency
- `node:sqlite` option is `allowExtension` not `allowLoadExtension`
- Legacy DB has 64 keywords (title: 39, partial: 8, company: 16, job: 1)
- SQLite result rows need `as unknown as LegacyKeyword[]` cast for TS safety

## Files / Surfaces

- Created: `apps/api/src/domains/settings/keyword-mapper.ts`
- Created: `apps/api/src/domains/settings/keyword-mapper.spec.ts`
- Created: `apps/api/scripts/fix-seed-blocked-keywords.ts`
- Modified: `apps/api/package.json` (added npm scripts)

## Errors / Corrections

- Type error: `allowLoadExtension` → `allowExtension` (node:sqlite API)
- Type error: direct `as LegacyKeyword[]` → `as unknown as LegacyKeyword[]`
- Both fixed, typecheck passes clean

## Ready for Next Run

Task complete. All 11 tests pass. Script runs successfully with --dry-run (64 keywords read: 16 company, 1 job, 8 partial, 39 title). Re-verified on 2026-05-29.
