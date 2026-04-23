# Technical Scope: tooling-and-developer-experience

## Architecture Impact

- [T-31] Unify lint, format, test, and typecheck workflows at monorepo level to keep local and CI behavior consistent.
- [T-32] Standardize path aliases across workspaces to reduce fragile relative parent imports and improve maintainability.
- [T-33] Keep code generation and test automation as first-class workflow primitives for frontend and API development.

## Design Decisions

- [T-34] Use root ESLint flat config, Prettier, Husky, and lint-staged as baseline developer guardrails before commit.
- [T-35] Enforce coverage and gate commands by workspace with explicit quick, full, storybook, e2e, and build paths.
- [T-36] Use workspace aliases (`@api/*`, `@ui/*`, `@/*`) and runtime/test resolution support where required.
- [T-37] Keep Playwright and Storybook validation in regular development loops for user-flow and component confidence.

## Risks and Mitigations

- [T-38] Mixed import conventions causing refactor breakage -> require alias-based cross-directory imports in relevant workspaces.
- [T-39] False task completion based only on aggregate green checks -> require artifact, behavior, and gate evidence before closing work.

## Validation

- [T-40] Verify lint, format, typecheck, and test gates pass with shared root scripts and workspace-level commands.
- [T-41] Verify alias resolution in API build/runtime/test contexts and maintain regression checks for web and UI workspaces.
- [T-54] Keep `apps/web` coverage includes aligned with unit-tested client modules so CI line thresholds stay meaningful as app routes expand.
