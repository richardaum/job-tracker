---
status: completed
title: Migrate `apps/api` to OXC
type: refactor
complexity: medium
dependencies:
  - task_01
  - task_02
---

# Task 03: Migrate `apps/api` to OXC

## Overview

Migrate `apps/api` from ESLint to OXC. The API app has the simplest plugin requirements — no React, no Tailwind, no Testing Library. It uses TypeScript, core ESLint rules, import sorting, and the custom plugin rules. This is the first app migration, serving as a low-risk validation of the OXC config.

<critical>
- READ ADR-005 for the progressive migration strategy
- REFERENCE TECHSPEC "Build Order (step 2)" and "Integration Points" sections
- FOCUS ON "WHAT" — update config and scripts for api only
- TESTS REQUIRED — verify lint output matches baseline
</critical>

<requirements>
- MUST enable `typescript`, `import`, and `eslint` plugins in `.oxlintrc.json`
- MUST configure type-aware linting: `options.typeAware: true`
- MUST preserve `no-restricted-imports` for parent `..` paths — this currently applies to `apps/api`
- MUST update `apps/api/package.json` lint script to use `oxlint` instead of `eslint`
- MUST run `pnpm --filter @job-tracker/api run lint` with zero warnings and zero errors
- MUST run `pnpm --filter @job-tracker/api run typecheck` and tests to confirm no breakage
- MUST NOT modify configs for web, ui, or extension — api only
</requirements>

## Subtasks

- [x] 3.1 Review `.oxlintrc.json` generated in task 01 and verify API-relevant plugins are enabled
- [x] 3.2 Manually add/configure rules specific to api: `no-restricted-imports` for `..` parent paths, `eslint/no-unused-vars` with `_` prefix, Node.js globals
- [x] 3.3 Update `apps/api/package.json` lint script: replace `eslint` with `oxlint`
- [x] 3.4 Run `oxlint` on the API codebase; fix any new violations or adjust config
- [x] 3.5 Run `tsc --noEmit` and `pnpm --filter @job-tracker/api run test` to confirm no breakage
- [ ] 3.6 Commit the changes (api package.json + .oxlintrc.json refinements)

## Implementation Details

The API app uses:

- `@typescript-eslint/no-unused-vars` → `eslint/no-unused-vars` in OXC with `argsIgnorePattern: "^_"`
- `no-restricted-imports` for `../` parent traversal → OXC `no-restricted-imports` with same paths
- `simple-import-sort` → OXC `import/order` rule (from `import` plugin)
- `@job-tracker/eslint-plugin` → `packages/oxlint-plugin` (from task 02)
- `@typescript-eslint/no-deprecated` with `projectService: true` → OXC type-aware mode

The `apps/api/package.json` lint script changes from:

```
"lint": "eslint . --fix --max-warnings=0 --no-warn-ignored && tsc --noEmit"
```

to:

```
"lint": "oxlint . --fix --max-warnings=0 --no-warn-ignored && tsc --noEmit"
```

### Relevant Files

- `apps/api/package.json` — lint script to update
- `.oxlintrc.json` — refine api-specific rules and overrides
- `eslint.config.ts` — reference for `no-restricted-imports` paths for api (lines 76-97)

### Dependent Files

- `apps/api/src/**/*.ts` — lint output may change; violations may need fixing

### Related ADRs

- ADR-004: Plugin Mapping Strategy
- ADR-005: Progressive Migration by App

## Deliverables

- `apps/api` lint script uses `oxlint`
- Zero lint warnings/errors on api codebase
- TypeScript typecheck and tests pass
- Config refinements committed

## Tests

- Verification:
  - [ ] `pnpm --filter @job-tracker/api run lint` exits zero with zero warnings
  - [ ] `pnpm --filter @job-tracker/api run typecheck` passes
  - [ ] `pnpm --filter @job-tracker/api run test` passes
  - [ ] Manual diff: OXC output for a known violation matches old ESLint behavior
- Test coverage target: N/A (infrastructure migration)
- All checks must pass

## Success Criteria

- API lint runs entirely via OXC with the same or stricter rule coverage as ESLint
- No regressions in typecheck or test suites
- Ready for web migration (task 04) to build on this config baseline
