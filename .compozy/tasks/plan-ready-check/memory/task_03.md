# Task Memory: task_03.md

## Objective Snapshot

Add `readyCheck` to Telegram plan fixture (minimal config) and plan.example.json (full config).

## Important Decisions

- Telegram fixture uses minimal config `{ "selector": ".input-search-placeholder" }` per task spec
- Example fixture uses full config showing all 6 fields per TechSpec §Core Interfaces
- `readyCheck` added after `parallelDetailsTabs` / before `surfaceFields` in both files

## Files / Surfaces

- `apps/extension/src/domains/plan/fixtures/telegram-jsgurujobs.plan.json` — added `readyCheck` at line 17
- `apps/extension/src/domains/plan/fixtures/plan.example.json` — added `readyCheck` at lines 18-25

## Verification

- JSON syntax: valid (both files)
- typecheck: passed (exit 0)
- lint: passed (exit 0, 0 warnings)
