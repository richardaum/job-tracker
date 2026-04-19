# Quick Task 001: ESLint, Prettier, Husky, lint-staged

**Date:** 2026-04-19
**Status:** Done

## Description

Add a shared lint and format toolchain for the monorepo (ESLint 9 flat config at repo root, Prettier, Husky pre-commit, lint-staged), wire `pnpm lint` / format scripts, and align CI-style checks with local hooks.

_Note:_ Implementation touched more than the quick-mode “≤3 files” rule because the change spans three workspace packages plus root config; this folder records the work for traceability.

## Scope (what shipped)

- Root `eslint.config.ts` — TypeScript + React (web/ui) + Next core-web-vitals (web only); Prettier compatibility last; root devDependency `jiti` so ESLint can load the TS config from every workspace.
- Root Prettier (`prettier.config.mts`, `.prettierignore`); `tsconfig.repo.json` for editor/`tsc --noEmit` on repo-level configs.
- Root `lint-staged` + Husky `.husky/pre-commit` → `pnpm lint-staged`.
- `apps/web`, `apps/api`, `packages/ui`: `lint` = `eslint . --max-warnings=0` (web replaces `next lint`).
- Root scripts: `format`, `format:check`, `lint-staged`, `prepare` (husky); `.gitignore` includes `.turbo/`.

## Verification

- [x] `pnpm lint` (Turbo) passes for api, web, ui.
- [x] `pnpm format:check` passes.
- [x] `pnpm lint-staged` runs (no-op with empty index); staged file smoke-test passes.

## Commit

_Record the conventional commit SHA and message here after the change is committed._
