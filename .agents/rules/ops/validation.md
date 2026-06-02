# Validation

## Workflow

```
pnpm validate        # lint + typecheck + test (daily)
pnpm test:all        # turbo test + root/worktree-cli scripts
pnpm validate:ci     # pre-PR: specs, lint, typecheck, coverage, repo typecheck, format, knip, build
pnpm e2e             # Playwright, Chromium, apps/web/e2e/, E2E_PORT (default 3100)
```

Individual steps:

```
pnpm fix:imports     # import sorting (fast, no type-checking)
pnpm lint            # turbo lint (ESLint)
pnpm format          # oxfmt --write
pnpm typecheck       # turbo typecheck (tsc --noEmit)
pnpm test            # turbo test (Vitest/Jest)
pnpm test:coverage   # alias for validate:coverage
```

## Parallelism

`lint`, `test`, `typecheck` can run in parallel. `test` and `typecheck` depend on `^build` (turbo).

**Agent rule:** always run `lint` and `typecheck` as parallel tool calls, never sequentially. Launch both `pnpm lint` and `pnpm typecheck` in a single message. Waiting for one to finish before starting the other is wasteful — they are independent. Turbo handles the `^build` dependency internally.

## Focused testing (dev workflow)

During development, run only tests related to changed files — not the full suite. Full suite (`pnpm test` / `pnpm test:all`) runs only before commit.

| Scenario | Command |
|---|---|
| Tests affected by unstaged changes | `pnpm --filter <workspace> vitest run --changed` |
| Tests affected since last commit | `pnpm --filter <workspace> vitest run --changed HEAD~1` |
| Tests covering specific source files | `pnpm --filter <workspace> vitest related <file>... --run` |
| Single test file | `pnpm --filter <workspace> vitest run <path/to/test>` |
| Single test by name (regex) | `pnpm --filter <workspace> vitest run -- -t "test name"` |

Examples:

```bash
# api: tests related to changed files
pnpm --filter @job-tracker/api vitest run --changed

# web: tests covering a specific source file
pnpm --filter @job-tracker/web vitest related src/modules/jobs/JobList.tsx --run

# ui: single test file
pnpm --filter @job-tracker/ui vitest run src/components/Button.test.tsx
```

**Agent rule:** when running tests during implementation, prefer `vitest run --changed` or `vitest related <edited-file> --run` over `turbo test` or `pnpm test`. Reserve `pnpm test` / `pnpm test:all` / `turbo test` for pre-commit validation only.

## CI

GitHub Actions: `ci` (Postgres 16-alpine, Node 22, pnpm 10.8.1), `e2e`, `docker-api`. Installs with `pnpm install --frozen-lockfile`. CI fails if lint leaves a dirty tree.

## Pre-commit (lint-staged)

```
node --experimental-strip-types scripts/fix-imports.ts
eslint --fix --max-warnings=0 --no-warn-ignored
oxfmt --write
```

## AI pair review

Use [pair-review](https://github.com/in-the-loop-labs/pair-review) (`@in-the-loop-labs/pair-review`) for AI-assisted code review of uncommitted changes:

```bash
npx @in-the-loop-labs/pair-review --local
```

Opens a local web UI for diff review with AI analysis, inline comments, and structured feedback export. Supports multiple AI providers — configure via `~/.pair-review/config.json`.

## Dead code

Run `pnpm knip` before finishing a task. If dead code found, list and ask user before removing.

## Local CI

`pnpm validate:ci` (alias `pnpm ci:local`) runs: validate:specs → lint → typecheck → validate:coverage → typecheck:repo → format:check → knip → build.
