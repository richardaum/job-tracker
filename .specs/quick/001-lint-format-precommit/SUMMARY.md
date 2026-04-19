# Summary: Quick Task 001 — Lint, format, pre-commit

**Completed:** 2026-04-19

## Outcome

- **ESLint:** Single flat config at repository root (`eslint.config.ts`, with root `jiti` for TS loading under pnpm); package-level `lint` tasks run `eslint` scoped to each workspace.
- **Prettier:** Shared formatting via `prettier.config.mts`; `.prettierignore` excludes build artifacts, Turbo cache, lockfile, and local skill trees under `.claude/skills`, `.cursor/skills`, `.windsurf/skills`, and `.agents` so `format:check` stays stable.
- **Repo TS:** `tsconfig.repo.json` + `pnpm typecheck:repo` type-check root tooling configs only.
- **Husky + lint-staged:** Pre-commit runs ESLint with `--fix` and Prettier on staged `*.{js,jsx,mjs,cjs,ts,tsx}` and Prettier on staged `*.{json,md,yml,yaml}`.

## Verification run

`pnpm lint`, `pnpm format:check`, and `pnpm lint-staged` were executed successfully after setup.

## Follow-up

- After `git commit`, add the commit hash and message to `TASK.md` under **Commit** and append the SHA to the Quick Tasks table in `.specs/project/STATE.md`.
