# TechSpec: Plan ReadyCheck

## Executive Summary

Replace the hardcoded `waitForTelegramUpdateOrDelay` in the extension's content script with a `readyCheck` configuration block in the `collect.jobs` plan step schema. The config uses a `mode` enum (starting with `"text"`) for extensible readiness detection — "wait for a specific element's text to change from a loading state to an idle state".

The primary trade-off: plan schema complexity increases slightly, but platform-specific logic moves from hardcoded extension code into plan configuration, making the extension truly generic. Existing plans are unaffected (optional, defaults to no-op).

## System Architecture

### Component Overview

| Component                                                   | Responsibility                                    | Change                                                                                                     |
| ----------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `packages/plan-schemas`                                     | Define `readyCheck` zod schema + inferred types   | Add `ReadyCheckConfigSchema` in `PlanStepCollectJobsInputSchema`                                           |
| `apps/extension/.../jobs-list.service.ts`                   | Execute DOM stabilization check before collection | Rename `waitForTelegramUpdateOrDelay` → `waitForReadyCheck`, accept config param, remove after-scroll call |
| `apps/extension/.../jobs-list-messaging.service.ts`         | Forward action to content script                  | No change (action is passed through as-is)                                                                 |
| `apps/extension/.../collect-jobs.service.ts`                | Orchestrate collection                            | No change                                                                                                  |
| `apps/web/.../plan-editor/`                                 | UI for editing plans                              | New `ReadyCheckDialog` + badge in `StepCard`                                                               |
| `apps/extension/.../fixtures/telegram-jsgurujobs.plan.json` | Telegram plan definition                          | Add `readyCheck` block                                                                                     |

### Data Flow

```
Plan (JSON) → PlanSchema (validation) → PlanService.execute()
  → CollectJobsService.execute()
    → JobsListMessagingService.listJobs(action)
      → [Content Script] JobsListService.execute()
        → waitForReadyCheck(action.input.readyCheck)  ← new
        → collection loop (scroll, extract)
```

The `readyCheck` config flows through the existing `action` object — no messaging layer changes needed.

## Implementation Design

### Core Interfaces

```typescript
// packages/plan-schemas/src/schema.ts
const ReadyCheckModeSchema = z.enum(["text"]);

const ReadyCheckConfigSchema = z
  .object({
    selector: z.string().min(1).max(LIMITS.selector),
    mode: ReadyCheckModeSchema.default("text"),
    value: z.string().min(1).max(LIMITS.regexPattern).optional().default("updating"),
    resolveTimeoutMs: z.number().int().positive().optional().default(10_000),
    watchTimeoutMs: z.number().int().positive().optional().default(3_000),
    pollIntervalMs: z.number().int().positive().optional().default(200),
  })
  .strict();

// Added to PlanStepCollectJobsInputSchema:
readyCheck: ReadyCheckConfigSchema.optional();
```

```typescript
// apps/extension/.../jobs-list.service.ts
async waitForReadyCheck(config?: ReadyCheckConfig): Promise<void> {
  if (!config) return;

  const el = document.querySelector(config.selector);
  if (!el) return;

  const getText = () => el.textContent ?? "";
  const text = getText();

  if (!text) return;

  const waitForResolve = async () => {
    await tryRun(
      this.timerService.waitFor(
        () => !getText().toLowerCase().includes(config.value!.toLowerCase()),
        { intervalMs: config.pollIntervalMs!, maxWaitMs: config.resolveTimeoutMs! },
      ),
    );
  };

  if (text.toLowerCase().includes(config.value!.toLowerCase())) {
    await waitForResolve();
    return;
  }

  await tryRun(
    this.timerService.waitFor(
      () => {
        const t = getText().toLowerCase();
        if (t.includes(config.value!.toLowerCase())) return "ACTIVE";
        return null;
      },
      { intervalMs: config.pollIntervalMs!, maxWaitMs: config.watchTimeoutMs! },
    ),
  );

  if (getText().toLowerCase().includes(config.value!.toLowerCase())) {
    await waitForResolve();
  }
}
```

### Data Models

```typescript
// Inferred types from zod (automatic via z.infer)
type ReadyCheckMode = "text";
type ReadyCheckConfig = {
  selector: string;
  mode?: ReadyCheckMode; // default "text"
  value?: string; // default "updating"
  resolveTimeoutMs?: number; // default 10_000
  watchTimeoutMs?: number; // default 3_000
  pollIntervalMs?: number; // default 200
};
```

### API Endpoints

No API changes. `readyCheck` is stored as part of the plan JSONB document and validated by the existing zod schema on plan save.

## Impact Analysis

| Component                                                   | Impact Type | Description                                                               | Required Action          |
| ----------------------------------------------------------- | ----------- | ------------------------------------------------------------------------- | ------------------------ |
| `packages/plan-schemas/src/schema.ts`                       | Modified    | Add `ReadyCheckConfigSchema` + wire into `PlanStepCollectJobsInputSchema` | Add new zod schema       |
| `packages/plan-schemas/src/types.ts`                        | None        | Types inferred automatically                                              | No action                |
| `apps/extension/.../jobs-list.service.ts`                   | Modified    | Generalize wait method, remove after-scroll call                          | Refactor + update caller |
| `apps/extension/.../message/schema.ts`                      | None        | Already uses `CollectJobsPlanStepActionSchema`                            | No action                |
| `apps/web/.../plan-editor/`                                 | Modified    | New `ReadyCheckDialog` + StepCard badge                                   | New component            |
| `apps/extension/.../fixtures/telegram-jsgurujobs.plan.json` | Modified    | Add `readyCheck` block                                                    | Edit JSON                |
| `apps/extension/.../fixtures/plan.example.json`             | Modified    | Add `readyCheck` example                                                  | Edit JSON                |
| `apps/extension/.../jobs-list.service.test.ts`              | Modified    | Add test cases for readyCheck scenarios                                   | Update test              |

## Testing Approach

### Unit Tests

**`apps/extension/.../jobs-list.service.test.ts`** — update existing tests:

- Test that without `readyCheck`, no DOM polling occurs (no-op)
- Test that with `readyCheck.selector` not found, collection proceeds silently
- Test that with matching text present, execution delays until text changes
- Test that `readyCheck` runs once (not after each scroll iteration)
- Verify after-scroll call (line 171) is removed — existing scroll tests should pass

No schema-level tests (plan-schemas has no test setup; covered by typecheck).

### Integration / E2E

Covered by existing plan execution flow. Telegram fixture with `readyCheck` added validates end-to-end behavior.

## Development Sequencing

### Build Order

1. **Schema** (`packages/plan-schemas/src/schema.ts`) — Add `ReadyCheckModeSchema`, `ReadyCheckConfigSchema`, wire into `PlanStepCollectJobsInputSchema`
   - Depends on: nothing
2. **Content script** (`apps/extension/.../jobs-list.service.ts`) — Rename method, accept config, remove after-scroll call
   - Depends on: step 1 (types must exist)
3. **Fixture** (`telegram-jsgurujobs.plan.json`) — Add `readyCheck` block
   - Depends on: step 1 (schema must accept the new field)
4. **Tests** (`jobs-list.service.test.ts`) — Add readyCheck test cases
   - Depends on: step 2 (method must exist)
5. **UI** (`apps/web/.../plan-editor/`) — New `ReadyCheckDialog.tsx` + `StepCard` badge
   - Depends on: step 1 (types must exist)
6. **Example fixture** (`plan.example.json`) — Add `readyCheck` example
   - Depends on: step 1

### Technical Dependencies

None. All changes are within the existing codebase with no external service requirements.

## Technical Considerations

### Key Decisions

- **Decision**: `readyCheck` lives inside `collect.jobs.input` (not as a separate step)
  - **Rationale**: Stabilization is a property of the collection step, not a standalone operation. Every `collect.jobs` may need it but no other step type does.
  - **Trade-off**: Slightly more nested config; avoids plan complexity of extra steps.
- **Decision**: Mode enum (`"text"` for now, extensible later)
  - **Rationale**: Different platforms signal readiness differently (text change, spinner removal, attribute mutation). An enum allows adding modes without breaking existing plans.
  - **Trade-off**: Slightly more complex schema than a flat config.
- **Decision**: Error handling is silent (proceed on timeout/selector not found)
  - **Rationale**: DOM variations across platform versions should not cause hard failures. The collection can proceed even without stabilization.
  - **Trade-off**: Silent failures may hide platform issues. Mitigated by logging in `waitForReadyCheck`.

### Known Risks

- **Risk**: `readyCheck` value appearing in non-loading contexts (false positive)
  - **Likelihood**: Low — the value "updating" is specific to Telegram's loading indicator
  - **Mitigation**: Plan author chooses the right value for the target platform

## Architecture Decision Records

- [ADR-001: readyCheck — Generic Pre-Collection Stabilization for Plan Steps](adrs/adr-001.md) — Add optional `readyCheck` config to `collect.jobs` with extensible `mode` enum instead of hardcoded Telegram-specific logic
