# Task Memory: task_03.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Migrate `apps/api` from ESLint to OXC. Completed:

- Pinned `.oxlintrc.json` plugins to `["typescript", "import"]` (dropped `unicorn`)
- Replaced `simple-import-sort` JS Plugin with same approach (OXC v1.67.0 bug prevents `import/order` from JSON config)
- Added spec file exclusion for custom `@job-tracker/*` rules (matching ESLint behavior)
- Removed `baseUrl` from `apps/api/tsconfig.json` (deprecated in TS 5.8+, resolves tsgolint error)
- Updated `apps/api/package.json` lint script: `eslint` → `oxlint`
- OXC lint + tsc passes with zero errors/warnings on API codebase

## Important Decisions

- Kept `simple-import-sort` JS Plugin (not `import/order`) because OXC v1.67.0 JSON config parser fails on `import/order` — the CLI accepts it (`-D import/order`) but JSON config cannot configure it
- Removed `baseUrl` from tsconfig to fix tsgolint error — TS 5.9.3 supports `paths` without `baseUrl`; `@api/*` imports still resolve correctly
- Added `"import"` to top-level plugins for future use when the config-parsing bug is fixed

## Learnings

- OXC v1.67.0 JSON config parser can't handle rules with `/` in their name from certain plugins (`import/order`, `typescript/tsconfig-error`), but CLI `-D` flags and `--print-config -D all` recognize them
- `import/order` in OXC takes format `["warn", [{ "alphabetize": { "order": "asc" } }]]` (options wrapped in array of groups), but config parser rejects it
- OXC spec file exclusion: use a second override with `"off"` on the same rules for `**/*.{test,spec}.{ts,tsx}`

## Files / Surfaces

- `.oxlintrc.json` — plugins, import sorting, spec exclusions, custom rules
- `apps/api/package.json` — lint/lint:fix scripts
- `apps/api/tsconfig.json` — removed `baseUrl` (deprecated in TS 5.8+)

## Errors / Corrections

- `import/order` and `typescript/tsconfig-error` can't be configured from JSON in OXC v1.67.0 due to parser limitation
- Test failures pre-existing (28 suites fail due to missing `DATABASE_URL` env), unrelated to this task

## Ready for Next Run

Task 03 is complete. Ready for Task 04 (Migrate `apps/web` to OXC).
