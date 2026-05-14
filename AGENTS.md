# AGENTS.md — Job Tracker

## Reply modes (`[v]` / `[s]`)

**`[v]`** or **`[s]`** anywhere in the prompt sets mode: **`[v]`** = verbose (extra reasoning, edges, trade-offs, on-topic context); **`[s]`** = short (minimal prose; skip optional background unless needed for correctness). If both appear, **last** wins.

## Monorepo

Turbo + pnpm workspace: `apps/web` (Next.js 16), `apps/api` (NestJS 11 + GraphQL), `apps/extension` (Chrome MV3 / WXT), `packages/ui`, `packages/logger`.

## Toolchain

Node 22+, pnpm 10.8+.

## Root `package.json` scripts

`dev`, `build`, `test`, `lint`, `typecheck`, `ci:local`, `e2e`, `fix:imports`, `test:scripts`, `leanspec:validate`, `leanspec:sync-spec-indices` (canonical list in root `package.json`).

## Subagents & Parallelism

When supported by the agent, high-volume tasks like `lint`, `test`, and `typecheck` (tsc) can be executed separately and in parallel using subagents to optimize context usage and speed up validation.

## LeanSpec

Canonical reference: **`docs/CONVENTIONS.mdx`** → LeanSpec. Validate: `pnpm leanspec:validate`.

## Packages

| Path               | Domain                                                  |
| ------------------ | ------------------------------------------------------- |
| `apps/api`         | NestJS 11, GraphQL, TypeORM, PostgreSQL, Docker         |
| `apps/web`         | Next.js 16, Apollo Client, view-models, generated hooks |
| `apps/extension`   | WXT + Vite + React, Chrome MV3                          |
| `packages/ui`      | Radix + Tailwind, Storybook                             |
| `packages/logger`  | Typed logger                                            |
| `packages/try-run` | `tryRun` utility                                        |

## Tests

Per-package configs in respective `apps/*/AGENTS.md` and `packages/*/AGENTS.md`.

- **E2E**: Playwright in `apps/web/e2e/`, Chromium; web server on `E2E_PORT` (default 3100).

## GraphQL codegen

`apps/web/codegen.ts` reads `apps/api/src/schema.gql`, writes `apps/web/src/gql/`; post-process `scripts/postprocess-codegen-hooks.mjs`.

## Import sorting (`fix:imports`)

`scripts/fix-imports.mjs` — lightweight ESLint wrapper that loads **only** `simple-import-sort` (no type-checking, no React/Next/Tailwind plugins). Roughly 10× faster than full `lint:fix`.

Usage: `pnpm fix:imports "apps/web/src/**/*.{ts,tsx}"`

Runs **before** `eslint --fix` in pre-commit lint-staged, so `eslint --fix` doesn't also have to sort imports. Test: `pnpm test:scripts`.

## ESLint

`className` via `cn()` only; no raw `process.env` in `apps/web/src/` — use `src/env/`; in config/codegen only: `CI`, `E2E_PORT`, `API_GRAPHQL_URL`, `NODE_ENV`. Package `lint` scripts and pre-commit lint-staged use **`node scripts/fix-imports.mjs`** then **`eslint --fix --max-warnings=0 --no-warn-ignored`** (then `tsc --noEmit` where applicable); fix anything **not** autofixable before push. Prefer **`pnpm fix:imports`** → **`pnpm lint`** / **`eslint --fix`** / **`prettier --write`** on affected paths before hand-editing many lines (see **Quality gates** in **`docs/CONVENTIONS.mdx`**).

## Turbo

`test` and `typecheck` depend on `^build`; `dev` and `db:migrate:watch` persistent (no cache).

## Docker (API)

Build from repo root: `docker build -f apps/api/Dockerfile -t job-tracker-api:local .`

## Database migrations

`apps/api/src/database/`; watch `node scripts/watch-migrations.mjs`.

## PM2

Long-running apps (**`api`**, **`web`**, **`storybook`**, **`extension`**) — start/stop/restart/teardown via PM2 only (**`pnpm pm2:start`** / **`pnpm pm2:stop`** / **`pnpm pm2:restart`**, **`pm2 delete`**, **`pm2 kill`** as needed). Logs: **`~/.pm2/logs/`** (`*-out.log`, `*-error.log`).

## CI

GitHub Actions: `ci` (Postgres 16-alpine, Node 22, pnpm 10.8.1), `e2e`, `docker-api`. CI installs with `pnpm install --frozen-lockfile`. CI fails if lint leaves a dirty tree.

## Conventions

Code, LeanSpec (`specs/`), and Storybook: consulting and following **`docs/CONVENTIONS.mdx`** is **mandatory** (Storybook -> Documentation -> Conventions). For every task, you must also proactively search for relevant keywords related to the work being performed to ensure full adherence to the project guides.
