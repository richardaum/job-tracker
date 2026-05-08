# AGENTS.md — Job Tracker

## Reply modes (`[v]` / `[s]`)

**`[v]`** or **`[s]`** anywhere in the prompt sets mode: **`[v]`** = verbose (extra reasoning, edges, trade-offs, on-topic context); **`[s]`** = short (minimal prose; skip optional background unless needed for correctness). If both appear, **last** wins.

## Monorepo

Turbo + pnpm workspace: `apps/web` (Next.js 16), `apps/api` (NestJS 11 + GraphQL), `apps/extension` (Chrome MV3 / WXT), `packages/ui`, `packages/logger`.

## Toolchain

Node 22+, pnpm 10.8+.

## Root `package.json` scripts

`dev`, `build`, `test`, `lint`, `typecheck`, `ci:local`, `e2e`, `leanspec:validate`, `leanspec:sync-spec-indices` (canonical list in root `package.json`).

## LeanSpec

- **Source of truth:** the owning **`specs/<NNN-slug>/README.md`** is the written source of truth for that scope. Keep it **aligned with the code at high level** (intent, outcomes, major flows and boundaries)—when shipped behavior or scope shifts, update the spec in the same change set. Code and tests are authoritative for exact behavior; the spec must not silently contradict intent that matters for product or engineering decisions.
- **`specs/`:** folders `specs/<NNN-slug>/` with `README.md` (workspace chronicle at `specs/HISTORY.md`; optional per-spec companions). Generated index summary: **`specs/INDEX.md`** (**`specCount`**, **`requirementIdCount`**, **`historyCount`**). Config: `.lean-spec/config.json`. Quick pointer: `specs/007-docs-definition/README.md`.
- **CLI:** `pnpm exec lean-spec` (`create`, `list`, `board`, `validate`, `rel`, …). Help: `pnpm exec lean-spec --help`.
- **Validate:** `pnpm leanspec:validate`.
- **Spec indices:** after creating or retitling a spec, changing **`status:`**, or adding or moving **`[P-NNN]`** / **`[T-NNN]`** (etc.) references, run **`pnpm leanspec:sync-spec-indices`**. See **`docs/CONVENTIONS.mdx`** → **Spec indices**.
- **Requirements (sync back):** when new scope or acceptance criteria emerge for work tied to an existing numbered spec, **record them in that spec's `README.md`** (with bracketed IDs **`[P-NNN]`** / **`[T-NNN]`** as elsewhere), then run **`pnpm leanspec:sync-spec-indices`** if IDs or spec metadata changed. Do not rely on chat or code alone as the lasting record while the governing spec stays stale.

## Packages

| Package       | Notes                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **api**       | Apollo GraphQL; schema `apps/api/src/schema.gql`; TypeORM + PostgreSQL. Local dev server: PM2 **`api`** (`ecosystem.config.cjs`).          |
| **web**       | Apollo Client; codegen: `pnpm --filter @job-tracker/web run codegen` → `src/gql/` (ESLint ignore). Local dev: PM2 **`web`**.               |
| **ui**        | Radix + Tailwind; Storybook on port 6006 — local dev via PM2 **`storybook`**.                                                              |
| **logger**    | Typed logger; no tests.                                                                                                                    |
| **extension** | WXT + Vite + React; scaffold `specs/023-*` ([T-137]); local dev: PM2 **`extension`**; smoke: load `build/chrome-mv3` unpacked in Chromium. |

## Tests

- **API**: Vitest, `src/**/*.spec.ts`, Node, `fileParallelism: false`; needs `DATABASE_URL` (see `.env.example`).
- **Web**: Vitest, `src/**/*.test.{ts,tsx}`, jsdom; 80% coverage on `src/app/page.tsx`, `src/hooks/**`, `src/env/client.ts`, `src/lib/apollo-client.ts`.
- **UI**: Vitest, jsdom.
- **Extension**: Vitest, node; Chrome load-unpacked smoke for popup / background (see **`specs/023-*`**).
- **E2E**: Playwright in `apps/web/e2e/`, Chromium; web server on `E2E_PORT` (default 3100).

## GraphQL codegen

`apps/web/codegen.ts` reads `apps/api/src/schema.gql`, writes `apps/web/src/gql/`; post-process `scripts/postprocess-codegen-hooks.mjs`.

## ESLint

`className` via `cn()` only; no raw `process.env` in `apps/web/src/` — use `src/env/`; in config/codegen only: `CI`, `E2E_PORT`, `API_GRAPHQL_URL`, `NODE_ENV`. Package `lint` scripts and pre-commit lint-staged use **`eslint --fix --max-warnings=0 --no-warn-ignored`** (then `tsc --noEmit` where applicable); fix anything **not** autofixable before push. Prefer **`pnpm lint`** / **`eslint --fix`** / **`prettier --write`** on affected paths before hand-editing many lines (see **Quality gates** in **`docs/CONVENTIONS.mdx`**).

## Turbo

`test` and `typecheck` depend on `^build`; `dev` and `db:migrate:watch` persistent (no cache).

## Docker (API)

Build from repo root: `docker build -f apps/api/Dockerfile -t job-tracker-api:local .`

## Database migrations

`apps/api/src/database/`; watch `node scripts/watch-migrations.mjs`.

## PM2

Long-running apps (**`api`**, **`web`**, **`storybook`**, **`extension`**) — start/stop/restart/teardown via PM2 only (**`pnpm pm2:start`** / **`pm2:stop`** / **`pm2:restart`**, **`pm2 delete`**, **`pm2 kill`** as needed); see **`docs/CONVENTIONS.mdx`** (**Local development: PM2**). Logs: **`~/.pm2/logs/`** (`*-out.log`, `*-error.log`).

## CI

GitHub Actions: `ci` (Postgres 16-alpine, Node 22, pnpm 10.8.1), `e2e`, `docker-api`. CI installs with `pnpm install --frozen-lockfile`. CI fails if lint leaves a dirty tree.

## Conventions

Code, LeanSpec (`specs/`), and Storybook: consulting and following **`docs/CONVENTIONS.mdx`** is **mandatory** (Storybook -> Documentation -> Conventions). For every task, you must also proactively search for relevant keywords related to the work being performed to ensure full adherence to the project guides.
