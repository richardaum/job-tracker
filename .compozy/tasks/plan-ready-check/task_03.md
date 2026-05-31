---
status: completed
title: Fixtures — Add readyCheck to Telegram plan + example JSON
type: chore
complexity: low
dependencies:
  - task_01
---

# Task 03: Fixtures — Add readyCheck to Telegram plan + example JSON

## Overview

Add `readyCheck` configuration to the Telegram JSGuruJobs plan fixture and to the example plan JSON. The Telegram fixture gets the minimal config (`selector: ".input-search-placeholder"`) — all other fields use defaults. The example gets a commented/documented block showing the feature.

<critical>
- Reference TechSpec §Core Interfaces for the exact JSON shape
- The field is optional — existing plans are not affected
- Fixtures must remain valid JSON (no trailing commas, no comments in production JSON)
</critical>

<requirements>
- MUST add `readyCheck: { "selector": ".input-search-placeholder" }` to Telegram fixture's `collect.jobs` action input
- MUST add a `readyCheck` example block to `plan.example.json` showing a complete readyCheck config with all fields
- MUST keep all existing fields unchanged in both fixtures
- MUST validate the JSON is well-formed after editing
</requirements>

## Subtasks

- [x] Edit `telegram-jsgurujobs.plan.json` — add readyCheck block
- [x] Edit `plan.example.json` — add readyCheck example with all fields shown
- [x] Validate JSON syntax of both files

## Implementation Details

**Files to modify:**

- `apps/extension/src/domains/plan/fixtures/telegram-jsgurujobs.plan.json`
  - Add `"readyCheck": { "selector": ".input-search-placeholder" }` inside the `collect.jobs` action's `input` object

- `apps/extension/src/domains/plan/fixtures/plan.example.json`
  - Add a `readyCheck` block in the `collect.jobs` input showing all fields:
    ```json
    "readyCheck": {
      "selector": ".loading-indicator",
      "mode": "text",
      "value": "updating",
      "resolveTimeoutMs": 10000,
      "watchTimeoutMs": 3000,
      "pollIntervalMs": 200
    }
    ```

### Relevant Files

- `apps/extension/src/domains/plan/fixtures/telegram-jsgurujobs.plan.json`
- `apps/extension/src/domains/plan/fixtures/plan.example.json`

## Deliverables

- Updated `telegram-jsgurujobs.plan.json` with readyCheck for Telegram
- Updated `plan.example.json` with readyCheck example

## Tests

No test changes — fixtures are used in integration/execution tests that are not part of this scope.

## Success Criteria

- [x] Both JSON files are valid (no parse errors)
- [x] `typecheck` passes (fixtures are not type-checked, but consuming code must compile)
