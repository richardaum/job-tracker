---
status: completed
title: Migrate `apps/extension` to OXC
type: refactor
complexity: medium
dependencies:
  - task_01
  - task_02
  - task_05
---

# Task 06: Migrate `apps/extension` to OXC

## Overview

Migrate `apps/extension` from ESLint to OXC. The extension app uses React components (JSX, hooks, refresh) and Tailwind CSS, without Next.js or Testing Library. It has its own eslint-plugin-better-tailwindcss config block in the current ESLint config. This is the last app migration — after this, the entire project runs on OXC and ESLint remnants can be cleaned up.

<critical>
- REFERENCE TECHSPEC "Build Order (step 5)" section
- FOCUS ON "WHAT" — update config and scripts for extension only
- TESTS REQUIRED — verify lint output matches baseline
</critical>

<requirements>
- MUST enable `react` and `import` native plugins in `.oxlintrc.json` for extension scope
- MUST configure better-tailwindcss JS Plugin for extension (may have different severity than web/ui)
- MUST update `apps/extension/package.json` lint script to use `oxlint`
- MUST run `pnpm --filter @job-tracker/extension run lint` with zero warnings
- MUST run `pnpm --filter @job-tracker/extension run typecheck` and tests
- MUST ensure generated gql/ files are ignored by OXC
</requirements>

## Subtasks

- [ ] 6.1 Verify extension-specific overrides in `.oxlintrc.json` (better-tailwindcss config for extension)
- [ ] 6.2 Update `apps/extension/package.json` lint script: replace `eslint` with `oxlint`
- [ ] 6.3 Run `oxlint` on extension codebase; fix violations or adjust config
- [ ] 6.4 Run `tsc --noEmit` and tests to confirm no breakage
- [ ] 6.5 Commit the changes

## Implementation Details

The extension was the last app chosen (per ADR-005) because it uses Tailwind and Testing Library — the two plugins without native OXC support. By this point, the JS Plugins for better-tailwindcss are already configured from task 04.

The `apps/extension/package.json` lint script changes from:

```
"lint": "eslint . --max-warnings=0 --no-warn-ignored && tsc --noEmit"
```

to:

```
"lint": "oxlint . --max-warnings=0 --no-warn-ignored && tsc --noEmit"
```

The ESLint config for extension (lines 194-203 of `eslint.config.ts`) has better-tailwindcss for extension-specific canonical class patterns. These should be replicated in the OXC config's JS Plugin settings if different from web.

### Relevant Files

- `apps/extension/package.json` — lint script to update
- `.oxlintrc.json` — verify extension scope overrides
- `eslint.config.ts` — lines 194-203 (extension tailwind config reference)

### Dependent Files

- `apps/extension/src/**/*.{ts,tsx}` — lint violations may need fixing
- `apps/extension/src/gql/` — must be ignored (generated)

### Related ADRs

- ADR-004: Plugin Mapping Strategy
- ADR-005: Progressive Migration by App

## Deliverables

- `apps/extension` lint script uses `oxlint`
- Zero lint violations on extension codebase
- All apps now use OXC — ESLint is only used in root-level config and pre-commit

## Tests

- Verification:
  - [ ] `pnpm --filter @job-tracker/extension run lint` exits zero with zero warnings
  - [ ] `pnpm --filter @job-tracker/extension run typecheck` passes
  - [ ] `pnpm --filter @job-tracker/extension run test` passes
- Test coverage target: N/A (infrastructure migration)
- All checks must pass

## Success Criteria

- Extension lint runs entirely via OXC
- All four apps (api, web, ui, extension) lint with OXC
- ESLint still present in root config — next task cleans it up
