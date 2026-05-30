---
status: pending
title: Rewrite custom ESLint plugin as OXC Rust plugin
type: refactor
complexity: medium
dependencies:
  - task_01
---

# Task 02: Rewrite custom ESLint plugin as OXC Rust plugin

## Overview

The project has a custom ESLint plugin at `packages/eslint-plugin/` with two rules — `prefer-try-run-over-try-catch` and `no-as-unknown-as`. Since OXC does not support running JavaScript-based ESLint plugins natively (JS Plugins are alpha), both rules must be rewritten as OXC Rust native plugins in a new `packages/oxlint-plugin/` crate. After verification, remove the old `packages/eslint-plugin/` package.

<critical>
- READ ADR-002 before starting — the Rust rewrite approach is already decided
- READ the full source of both existing rules (`packages/eslint-plugin/src/rules/*.js`) to match behavior exactly
- REFERENCE TECHSPEC "Core Interfaces" section for the plugin API sketch
- FOCUS ON "WHAT" — rewrite two rules with identical behavior; register with OXC
- TESTS REQUIRED — positive and negative test cases for both rules
</critical>

<requirements>
- MUST create `packages/oxlint-plugin/` as a Rust crate with OXC plugin API dependency
- MUST implement `prefer-try-run-over-try-catch` rule: warn when `try/catch` is used without `finally` block, prefer `tryRun()` from `@job-tracker/try-run`
- MUST implement `no-as-unknown-as` rule: error on `as unknown as X` double type assertions
- MUST match exact severity (warn/error) and message text of the current ESLint implementations
- MUST register the plugin in `.oxlintrc.json` via the `plugins` field
- MUST remove `packages/eslint-plugin/` and its references from `package.json` workspaces after verification
- MUST update `turbo.json` globalDependencies to reference `packages/oxlint-plugin/**` instead of `packages/eslint-plugin/**`
</requirements>

## Subtasks

- [ ] 2.1 Read both existing rule implementations in full to understand AST patterns and edge cases
- [ ] 2.2 Create `packages/oxlint-plugin/` crate with Cargo.toml and OXC plugin wiring
- [ ] 2.3 Implement `prefer-try-run-over-try-catch` rule
- [ ] 2.4 Implement `no-as-unknown-as` rule
- [ ] 2.5 Register the plugin in `.oxlintrc.json`
- [ ] 2.6 Build and verify both rules fire correctly on known test cases
- [ ] 2.7 Remove `packages/eslint-plugin/` and update workspace config
- [ ] 2.8 Update `turbo.json` globalDependencies

## Implementation Details

The existing rules at `packages/eslint-plugin/src/rules/` are JavaScript files using `@typescript-eslint/typescript-estree` for AST. The OXC Rust plugin API uses `oxc_linter::Rule` trait with `run()` and `diagnostic()` methods.

Key behaviors to preserve:

- `prefer-try-run-over-try-catch`: detects `TryStatement` nodes without `finalizer` (no `finally` block). Warns, not errors. Has auto-fix suggestion.
- `no-as-unknown-as`: detects `TSAsExpression` where both the expression and the type annotation are `TSUnknownKeyword`. Errors, no auto-fix.

The OXC plugin SDK documentation at https://oxc.rs/docs/contribute/linter/adding-rules covers the Rust rule development workflow.

### Relevant Files

- `packages/eslint-plugin/src/rules/prefer-try-run-over-try-catch.js` — source rule to port
- `packages/eslint-plugin/src/rules/no-as-unknown-as.js` — source rule to port
- `packages/eslint-plugin/src/index.js` — plugin entry point (exports both rules)
- `packages/eslint-plugin/package.json` — to remove
- `eslint.config.ts` — lines 286-307, where the custom plugin is registered

### Dependent Files

- `.oxlintrc.json` — add custom plugin reference
- `turbo.json` — update globalDependencies
- `package.json` (root) — remove `packages/eslint-plugin` from workspaces

### Related ADRs

- ADR-002: Rewrite Custom ESLint Plugin Rules as OXC Rust Plugins

## Deliverables

- `packages/oxlint-plugin/` with both rules implemented in Rust
- Both rules firing correctly in OXC lint runs
- `packages/eslint-plugin/` removed
- `turbo.json` updated

## Tests

- Unit tests for `prefer-try-run-over-try-catch`:
  - [ ] Positive: `try { ... } catch { ... }` without `finally` triggers warning
  - [ ] Negative: `try { ... } catch { ... } finally { ... }` does NOT trigger warning
  - [ ] Negative: `try { ... } finally { ... }` (no catch) does NOT trigger warning
  - [ ] Edge: nested try statements
  - [ ] Edge: `try/catch` inside `tryRun()` call — not flagged
- Unit tests for `no-as-unknown-as`:
  - [ ] Positive: `x as unknown as SomeType` triggers error
  - [ ] Positive: `(x as unknown) as SomeType` triggers error
  - [ ] Negative: `x as unknown` (single cast) does NOT trigger
  - [ ] Negative: `x as SomeType` (non-unknown intermediate) does NOT trigger
  - [ ] Edge: `x as unknown as unknown` — double unknown
- Integration:
  - [ ] Running `oxlint` on the project shows warnings/errors from both new rules
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- Both custom rules fire identically to the old ESLint implementations
- `packages/eslint-plugin/` removed from workspace
- `pnpm turbo lint` (or equivalent) passes with the new plugin
