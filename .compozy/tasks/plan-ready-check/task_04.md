---
status: completed
title: Tests — Add readyCheck scenarios to jobs-list.service.test.ts
type: test
complexity: low
dependencies:
  - task_02
---

# Task 04: Tests — Add readyCheck scenarios to jobs-list.service.test.ts

## Overview

Add test cases to `apps/extension/src/domains/jobs-list/jobs-list.service.test.ts` covering the `waitForReadyCheck` behavior: no-op when no config, silent proceed when selector not found, wait for trigger text resolution, and verify only one check per execution.

<critical>
- Reference TechSpec §Testing Approach for the test scenarios
- Follow existing test patterns: happy-dom, real elements, real TimerService
- Tests must be deterministic — control timeouts via small DOM delays
</critical>

<requirements>
- MUST add a test that verifies `waitForReadyCheck` is a no-op when `readyCheck` config is undefined (existing buildMessage works)
- MUST add a test that verifies `waitForReadyCheck` proceeds silently when the selector does not exist in the DOM
- MUST add a test that verifies when the trigger text is present, execution waits until it disappears
- MUST add a test that verifies `waitForReadyCheck` runs only once per execute() call (not after each scroll)
- MUST follow existing test patterns: `// @vitest-environment happy-dom`, real DOM elements, `DefaultTimerService`, `buildMessage()` helper
- SHOULD use `vi.useFakeTimers()` or DOM mutation with real timers — prefer DOM mutation (add/remove text) over fake timers to keep tests simple
- MUST ensure the after-scroll call is NOT re-added — verify collection works without per-scroll waiting
</requirements>

## Subtasks

- [ ] Write test: no-op when no readyCheck config
- [ ] Write test: selector not found = silent proceed
- [ ] Write test: trigger text present, wait for resolve
- [ ] Write test: runs only once (no per-scroll checks)
- [ ] Verify all existing tests still pass

## Implementation Details

**File to modify:** `apps/extension/src/domains/jobs-list/jobs-list.service.test.ts`

Key testing patterns:

1. **No-op test:** Call `execute()` with a `buildMessage()` that has no `readyCheck` — verify collection proceeds immediately.

2. **Selector not found test:** Pass `readyCheck: { selector: ".nonexistent" }` — verify collection proceeds (no throw).

3. **Trigger text present test:**

   ```ts
   // Create the ready check element with "Updating..." text
   const statusEl = document.createElement("div");
   statusEl.className = "input-search-placeholder";
   statusEl.textContent = "Updating...";
   document.body.appendChild(statusEl);

   // Start collection in background, then change text after a short delay
   setTimeout(() => {
     statusEl.textContent = "Ready";
   }, 50);

   // Execute should wait for the text change
   const result = await service.execute(msg);
   expect(result.jobs).toHaveLength(/* expected */);
   ```

4. **Single-check test:** Use a mock/counter on the ready check element to verify it's only queried once per execute, not per scroll iteration.

### Relevant Files

- `apps/extension/src/domains/jobs-list/jobs-list.service.test.ts` — Add new test cases
- `apps/extension/src/domains/jobs-list/jobs-list.service.ts` — SUT (modified in task_02)

## Deliverables

- Updated `apps/extension/src/domains/jobs-list/jobs-list.service.test.ts` with 4 new readyCheck test cases
- All tests pass

## Tests

### Unit Tests

- `readyCheck no-op when config is undefined` — collection proceeds without any DOM polling
- `readyCheck silent when selector not found` — no error thrown, collection proceeds
- `readyCheck waits for trigger text to resolve` — delays until "Updating..." disappears
- `readyCheck runs only once per execute` — not called after each scroll iteration

## Success Criteria

- All 4 new test cases pass
- All existing tests still pass
- `pnpm --filter @job-tracker/extension run test` passes
