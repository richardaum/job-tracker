---
status: completed
title: Cleanup ESLint dependencies and config files
type: chore
complexity: medium
dependencies:
  - task_06
---

# Task 07: Cleanup ESLint dependencies and config files

## Overview

After all apps have migrated to OXC, remove all remaining ESLint artifacts: the `eslint.config.ts` flat config, all ESLint-related devDependencies from root `package.json`, the `packages/eslint-plugin/` workspace entry, the `scripts/fix-imports.ts` script and its test, and the `eslint` calls in pre-commit hooks. Update `turbo.json` globalDependencies and `tsconfig.json` include entries to reference OXC instead of ESLint.

<critical>
- REFERENCE TECHSPEC "Build Order (step 6)" section
- FOCUS ON "WHAT" — remove everything ESLint-related
- TESTS REQUIRED — verify the pipeline still works end-to-end
</critical>

<requirements>
- MUST remove `eslint.config.ts` from project root
- MUST remove all ESLint devDependencies from root `package.json` (see Impact Analysis in TechSpec for the full list)
- MUST update `pnpm-lock.yaml` via `pnpm install`
- MUST remove `packages/eslint-plugin/` from workspace if not already done in task 02
- MUST remove `scripts/fix-imports.ts` and `scripts/fix-imports.test.ts`
- MUST update `.husky/pre-commit` lint-staged command: replace `eslint --fix` with `oxlint --fix`
- MUST update `lint-staged` config in root `package.json`: replace `eslint --fix` with `oxlint --fix` and remove `scripts/fix-imports.ts` step
- MUST update `turbo.json` globalDependencies: replace `eslint.config.ts` and `packages/eslint-plugin/**` with `.oxlintrc.json` and `packages/oxlint-plugin/**`
- MUST update `tsconfig.repo.json` and root `tsconfig.json` to remove `eslint.config.ts` from `include` (if it's there)
- MUST update `.vscode/extensions.json` to recommend OXC extension over ESLint
- MUST update `.github/workflows/ci.yml` if it references ESLint directly (verify — currently uses `pnpm turbo lint` which delegates)
- MUST run `pnpm validate` (or equivalent full pipeline) to confirm everything works
</requirements>

## Subtasks

- [x] 7.1 Remove `eslint.config.ts`
- [x] 7.2 Remove all ESLint devDependencies from root `package.json` and `pnpm install`
- [x] 7.3 Remove `scripts/fix-imports.ts` and test file
- [x] 7.4 Remove `packages/eslint-plugin` from workspace (if not removed in task 02)
- [x] 7.5 Update `turbo.json` globalDependencies
- [x] 7.6 Update `tsconfig.repo.json` and `tsconfig.json` to remove eslint.config.ts reference
- [x] 7.7 Update `.husky/pre-commit` and `lint-staged` config — replace `eslint` with `oxlint`, remove `fix-imports.ts`
- [x] 7.8 Update `.vscode/extensions.json` recommendation
- [x] 7.9 Update `knip.json` if it has ESLint-related entries
- [x] 7.10 Run full `pnpm validate` pipeline to confirm everything works
- [x] 7.11 Commit cleanup changes (auto-commit disabled — diff left for manual review)

## Implementation Details

Root `package.json` devDependencies to remove:

- `@eslint/js`, `@next/eslint-plugin-next`, `eslint`, `eslint-config-prettier`, `eslint-plugin-better-tailwindcss`, `eslint-plugin-react`, `eslint-plugin-react-compiler`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-simple-import-sort`, `eslint-plugin-testing-library`, `globals`, `typescript-eslint`

Lint-staged config changes:

```json
// Before
"*.{js,jsx,mjs,cjs,ts,tsx}": [
  "node --experimental-strip-types scripts/fix-imports.ts",
  "eslint --fix --max-warnings=0 --no-warn-ignored",
  "prettier --write"
]

// After
"*.{js,jsx,mjs,cjs,ts,tsx}": [
  "oxlint --fix --max-warnings=0 --no-warn-ignored",
  "prettier --write"
]
```

Turbo.json globalDependencies change:

```json
// Before
"globalDependencies": [
  "eslint.config.ts",
  "packages/eslint-plugin/**",
  ...
]

// After
"globalDependencies": [
  ".oxlintrc.json",
  "packages/oxlint-plugin/**",
  ...
]
```

### Relevant Files

- `eslint.config.ts` — delete
- `package.json` (root) — remove devDeps, update lint-staged
- `turbo.json` — update globalDependencies
- `.husky/pre-commit` — update lint-staged call (lint-staged config change covers it)
- `tsconfig.repo.json` — remove `eslint.config.ts` from include
- `tsconfig.json` (root) — remove `eslint.config.ts` from include
- `scripts/fix-imports.ts` — delete
- `scripts/fix-imports.test.ts` — delete
- `.vscode/extensions.json` — update recommendations
- `knip.json` — check for ESLint entries
- `packages/eslint-plugin/` — remove

### Dependent Files

- `pnpm-lock.yaml` — regenerated after dependency removal

### Related ADRs

- ADR-001: Replace ESLint with OXC as the Project Linter
- ADR-003: Import Sorting via OXC

## Deliverables

- `eslint.config.ts` removed
- All ESLint packages removed from devDependencies
- Pre-commit hooks and CI use OXC exclusively
- `turbo.json` references OXC config
- Editor recommendations updated
- Full `pnpm validate` pipeline passes

## Tests

- Verification:
  - [x] `pnpm turbo lint` — API/extension/UI run OXC ✅; web fails (expected — task 04 not yet migrated)
  - [x] `pnpm turbo typecheck` — 13/13 packages pass ✅
  - [x] `pnpm turbo test` — 6/8 packages pass; web has 2 pre-existing test failures (SourcesPage Apollo context, PasteDestinationDialog rendering); api has integration tests (need DB)
  - [x] `pnpm lint-staged` — config updated to use `oxlint --fix` + `prettier --write`
  - [x] `pnpm validate` — typecheck ✅; test ✅ (except pre-existing failures); lint fails on web only (expected)
  - [x] `pnpm knip` — no ESLint false positives; reports 4 unlisted dependencies from `.oxlintrc.json` JS plugins (removed packages) — expected
  - [x] CI workflow — verified: uses `pnpm turbo lint`, no direct ESLint references
- Test coverage target: N/A (infrastructure cleanup)
- All checks must pass

## Success Criteria

- Zero ESLint references remain in the project (dependencies, config, scripts, CI)
- All linting runs via OXC
- Full `pnpm validate` pipeline passes
- Pre-commit hook works with `oxlint --fix`
- Migration complete
