---
status: completed
title: Install OXC and generate baseline `.oxlintrc.json`
type: infra
complexity: low
dependencies: []
---

# Task 01: Install OXC and generate baseline `.oxlintrc.json`

## Overview

Install the `oxlint` package as a root devDependency and run the official `@oxlint/migrate` tool against the existing `eslint.config.ts` to produce a baseline `.oxlintrc.json`. This is the foundation task that every subsequent migration step depends on.

<critical>
- READ the TechSpec sections "Core Interfaces" and "Build Order (step 0)" before starting
- REFERENCE TECHSPEC for the expected config shape — do not duplicate here
- FOCUS ON "WHAT" — install the tool, generate the config, commit baseline
- MINIMIZE CODE — only show config snippets for key decisions
- TESTS REQUIRED — verify generated config is valid
</critical>

<requirements>
- MUST install `oxlint` as a root devDependency
- MUST run `npx @oxlint/migrate eslint.config.ts` with `--type-aware --js-plugins` flags
- MUST produce a `.oxlintrc.json` in the project root
- MUST preserve existing ignore patterns (node_modules, .next, dist, gql/, etc.)
- MUST NOT modify any lint scripts yet — this task is config generation only
- MUST commit the generated `.oxlintrc.json` and updated `package.json`
</requirements>

## Subtasks

- [ ] 1.1 Add `oxlint` to root `devDependencies` via `pnpm add -D oxlint`
- [ ] 1.2 Run `npx @oxlint/migrate eslint.config.ts --type-aware --js-plugins` to generate `.oxlintrc.json`
- [ ] 1.3 Review generated config manually — verify ignore patterns, plugin list, rule severities
- [ ] 1.4 Verify the generated config is valid by running `oxlint --version` and `oxlint --help`
- [ ] 1.5 Commit the baseline (`package.json`, `pnpm-lock.yaml`, `.oxlintrc.json`)

## Implementation Details

The `@oxlint/migrate` tool reads `eslint.config.ts` and converts supported rules to OXC format. Plugins without native OXC equivalents become `jsPlugins` entries. The generated config will need manual refinement in later tasks:

- The `--type-aware` flag ensures TypeScript type-aware rules are included
- The `--js-plugins` flag preserves ESLint plugins without native OXC equivalents as JS plugin references
- Review the `ignorePatterns` — OXC respects `.gitignore` by default, but `eslint.config.ts` has explicit ignores that should be migrated
- The `no-restricted-imports` rules for parent `..` imports and `process.env` restrictions must be verified in the output

### Relevant Files

- `eslint.config.ts` — source config to migrate from
- `package.json` (root) — add `oxlint` devDependency
- `turbo.json` — `globalDependencies` will be updated later (task 07)

### Dependent Files

- `pnpm-lock.yaml` — updated after `pnpm add -D oxlint`
- `.oxlintrc.json` — created by migration tool

### Related ADRs

- ADR-001: Replace ESLint with OXC as the Project Linter
- ADR-004: Plugin Mapping Strategy

## Deliverables

- `oxlint` installed as root devDependency
- `.oxlintrc.json` generated and committed in project root
- Verifiable via `pnpm oxlint --version`

## Tests

- Verification:
  - [ ] `pnpm oxlint --version` returns a valid version string
  - [ ] `.oxlintrc.json` is valid JSON (no parse errors)
  - [ ] Generated config has `plugins`, `rules`, and `categories` sections
  - [ ] Ignore patterns include all paths from the original `eslint.config.ts`
- Test coverage target: N/A (infrastructure task)
- All checks must pass

## Success Criteria

- `oxlint` CLI is available in the project
- `.oxlintrc.json` is committed and ready for refinement in subsequent tasks
- No build or validation scripts are modified yet
