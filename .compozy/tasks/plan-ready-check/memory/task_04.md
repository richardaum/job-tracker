# Task Memory: task_04.md

## Objective Snapshot

Add 4 readyCheck test cases to jobs-list.service.test.ts covering: no-op, missing selector, trigger text wait, single-check per execute.

## Important Decisions

- Used full readyCheck objects with `as const` in buildMessage calls to satisfy TypeScript (zod output has all fields required)
- Used `vi.spyOn(DefaultTimerService.prototype, "waitFor")` to verify single call in scroll test
- Used `Object.defineProperty` for scrollHeight/clientHeight to simulate scrolling in happy-dom

## Files / Surfaces

- `apps/extension/src/domains/jobs-list/jobs-list.service.test.ts` — added 4 test cases

## Ready for Next Run

Completed. All 54 tests pass.
