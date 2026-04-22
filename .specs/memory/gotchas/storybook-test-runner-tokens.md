# Storybook test runner issue on tokens story (intermittent)

## Context

- Command: `pnpm --filter @job-tracker/ui test-storybook`
- A prior run failed on `packages/ui/src/stories/Tokens.stories.tsx`, but subsequent focused and full-suite reruns passed.

## Symptom

- Previously seen error: `ReferenceError: Cannot access 'StorybookTestRunnerError' before initialization`
- Current status: not reproducible now (passed on focused run + two full runs).

## Impact

- Treat as flaky/intermittent signal if it reappears; rerun once before opening a fix task.

## Relevant pointers

- `packages/ui/src/stories/Tokens.stories.tsx`
- `packages/ui/package.json` (`test-storybook` script)
