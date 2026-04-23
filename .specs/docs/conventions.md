# Conventions

## Naming

- Keep Beta1 records under `.specs/beta1/*` and use `.specs/*` root exclusively for active Beta2 planning and execution.
- Use lowercase kebab-case for scope filenames under `.specs/product` and `.specs/technical`.
- Keep one atomic outcome per scope file and avoid mixing business outcomes with implementation details.
- Keep terminology consistent across product, technical, and roadmap docs to preserve traceability.
- Write all `.specs` documentation in English.

## Architecture

- Keep `apps/web` as UI-only and `apps/api` as backend API service; avoid introducing API routes or server actions in web.
- Consume OpenAI capabilities through an internal API service facade instead of direct frontend usage.
- Keep cross-directory imports on workspace aliases where configured (`@api/*`, `@ui/*`, `@/*`).
- Route environment access through typed env modules, not direct `process.env` in application code.

## Web UI

- Use `ConfirmDialog` from `@job-tracker/ui` for user confirmations, especially destructive or irreversible actions; do not use `window.confirm`, `window.alert`, or `window.prompt` in application code.
- Prefer small feature components that compose `ConfirmDialog` (for example a delete flow wrapper) over hand-rolled `Dialog` footers that duplicate the same cancel + confirm pattern.
- Storybook reference: **Components → ConfirmDialog** (`pnpm --filter @job-tracker/ui storybook`).

## Process

- Use deterministic SDD update order: structure, templates, IDs, scoped writes, state update, then prepend history.
- Prioritize Beta2 sequence by business value and implementation dependency before marking any scope as active.
- Mark tasks done only after artifact existence, behavior checks, and gate command verification all pass.
- Record meaningful technical lessons in specs documentation when they affect future implementation choices.
- Treat memory gotchas as reusable constraints for tests, ports, and UI interaction reliability.

## Quality Gates

- Run lint, format, and typecheck gates before merge-ready changes.
- Run unit/integration, e2e, and Storybook gates according to impacted layers.
- Keep coverage thresholds enforced in CI and maintain story coverage for exported UI components.
- Validate environment schemas and runtime boot paths after config-related changes.
