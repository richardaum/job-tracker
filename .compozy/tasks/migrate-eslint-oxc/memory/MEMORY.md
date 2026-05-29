# Workflow Memory

## Current State

- **Task 01** — Completed. oxlint v1.67.0 + oxlint-tsgolint installed, .oxlintrc.json generated with 134 rules.
- **Task 03** — Completed. `apps/api` migrated to OXC. lint + tsc zero errors.
- **Task 05** — Completed. `packages/ui` migrated to OXC. lint + tsc + tests zero errors.
- **Task 06** — Completed. `apps/extension` migrated to OXC. lint + tsc + tests zero errors.
- **Task 07** — Completed. All ESLint roots removed. Typecheck ✅, tests ✅ (pre-existing flake), lint fails on web only (task 04 pending).
- **Pending** — Task 02 (custom Rust plugin), Task 04 (apps/web).

## Shared Decisions

- `oxlint-tsgolint` is a required additional dependency for type-aware linting.
- Spec file exclusion for custom rules: use a second override with `"off"` severity on `**/*.{test,spec}.{ts,tsx}`.

## Shared Learnings

- `@oxlint/migrate` converts eslint.config.ts effectively with `--type-aware --js-plugins` flags.
- OXC 1.67.0 requires `oxlint-tsgolint` for type-aware analysis.
- OXC 1.67.0 JSON config parser has a bug: `import/order` and `typescript/tsconfig-error` rule names with `/` cannot be configured from JSON config (parser error: "Rule 'order' not found in plugin 'import'"). CLI flags like `-D import/order` and `--print-config -D all` work correctly. Keep `simple-import-sort` JS Plugin as workaround for import sorting until OXC upgrade.
- `tsconfig` `baseUrl` option is deprecated in TS 5.8+ and triggers tsgolint `typescript(tsconfig-error)`. Removing `baseUrl` is safe when `paths` patterns are relative to tsconfig directory.
- `--no-warn-ignored` is not a valid OXC flag. ESLint's `--no-warn-ignored` must be removed from lint scripts when migrating.

## Shared Learnings (continued)

- OXC silently skips JS plugin rules when the plugin package is not installed — no error, no warning output. This means `.oxlintrc.json` can reference plugins that don't exist without breaking the lint.
- `apps/web` lint script still calls `eslint` binary; task 04 must update it to `oxlint`.

## Open Risks

- Type-aware linting with tsgolint may need ~/.oxlint/ or node_modules config for performance.
- 3 migration tool warnings (settings in overrides, ignore list in overrides) need attention in later tasks.
- OXC v1.67.0 JSON config parser limitation for `import/order` — workaround was `eslint-plugin-simple-import-sort` JS Plugin, but the package was removed in cleanup. The `.oxlintrc.json` `simple-import-sort/imports` rule is now silently skipped by OXC. Task 04 should either use OXC `import/order` CLI flag or re-add the JS plugin.
- `.oxlintrc.json` JS plugin overrides for `react-compiler`, `better-tailwindcss`, `testing-library` are now dead config since packages were removed from root devDependencies. OXC silently skips them.

## Handoffs
