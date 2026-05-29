# Task Memory: task_07.md

## Objective Snapshot

Remove all remaining ESLint artifacts from root: config, deps, plugin, scripts, hooks, editor recommendations.

## Files / Surfaces

- Removed: `eslint.config.ts`
- Removed: `scripts/fix-imports.ts`, `scripts/fix-imports.test.ts`
- Removed: `packages/eslint-plugin/` (entire directory)
- Created: `.vscode/extensions.json` (recommends oxc-vscode)
- Updated: `package.json` — removed 15 ESLint deps, updated lint-staged, removed fix:imports script, updated test:scripts
- Updated: `turbo.json` — globalDependencies references .oxlintrc.json and packages/oxlint-plugin
- Updated: `tsconfig.repo.json`, `tsconfig.json` — removed eslint.config.ts from include
- Updated: `.oxlintrc.json` — removed @job-tracker/eslint-plugin overrides (prefer-try-run, no-as-unknown-as)
- Lockfile: regenerated via `pnpm install`

## Important Decisions

- Kept 4 JS plugin overrides in `.oxlintrc.json` (simple-import-sort, react-compiler, better-tailwindcss, testing-library) — OXC handles missing plugins gracefully (silently disables rules). Removing them would silently change lint behavior; proper cleanup should happen when those plugins are replaced with OXC-native alternatives.
- `globals` and `jiti` were removed — both were ESLint-config-only packages.
- `apps/web` lint still uses `eslint` binary — fails as expected since task_04 is pending.

## Learnings

- OXC silently skips JS plugin rules when the plugin package is not installed — no error, no warning output.

## Errors / Corrections

- None.

## Ready for Next Run

- Task 07 is complete. Full typecheck passes. Tests pass (pre-existing failures unrelated). Lint fails on `apps/web` only — expected.
- Knip reports 4 unlisted dependencies from `.oxlintrc.json` JS plugin references — these will be resolved when task_04 replaces them with OXC-native alternatives.
