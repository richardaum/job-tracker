# Task Memory: task_06.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Migrate `apps/extension` from ESLint to OXC. Lint script updated, `.oxlintrc.json` overrides verified, tsconfig.json `baseUrl` removed, all checks pass.

## Important Decisions

- Added `mock` to the test/spec override pattern (`{test,spec,mock}`) to match ESLint config's custom-rule exclusion for mock files. The ESLint config already excluded `*.mock.{ts,tsx}` but the OXC override only had `{test,spec}`.
- Added config file override (`**/*.config.{ts,tsx}`) to disable custom rules, matching ESLint's config-file exclusion for `@job-tracker/eslint-plugin` rules.

## Learnings

- better-tailwindcss JS Plugin emits "Tailwind CSS is not installed" warning for extension because OXC JS Plugins don't support the per-app `cwd`/`entryPoint` settings that ESLint's config had. The plugin self-disables gracefully; rule effectively off for extension.
- Removing `baseUrl` from tsconfig.json requires paths values to use `./` prefix (`./src/*` instead of `src/*`) to satisfy tsgolint.

## Files / Surfaces

- `apps/extension/package.json` — lint/lint:fix scripts updated to `oxlint`
- `.oxlintrc.json` — added `mock` to test override pattern, added config-file override
- `apps/extension/tsconfig.json` — removed `baseUrl`

## Errors / Corrections

- Initial attempt added duplicate `{test,spec,mock}` override — corrected by deduplication.

## Ready for Next Run
