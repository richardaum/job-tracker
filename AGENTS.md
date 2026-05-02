# AGENTS.md — Job Tracker

## Monorepo and toolchain

Turbo + pnpm: `apps/web` (Next.js 16), `apps/api` (NestJS 11 + GraphQL), `packages/ui`, `packages/logger`. Node 22+, pnpm 10.8+; CI uses `pnpm install --frozen-lockfile`.

## Specs (LeanSpec)

Folders `specs/<NNN-slug>/` with `README.md` (optional companions e.g. `HISTORY.md`). Config: `.lean-spec/config.json`. CLI: `pnpm exec lean-spec` (`create`, `list`, `board`, `validate`, `rel`, …); validate: `pnpm leanspec:validate`. **LeanSpec and code conventions:** `docs/CONVENTIONS.mdx` (**LeanSpec (`specs/`)**). Quick pointer: `specs/007-docs-definition/README.md`.

## Commands

Canonical list in root `package.json` (`dev`, `build`, `test`, `lint`, `typecheck`, `ci:local`, `e2e`, `leanspec:validate`). LeanSpec help: `pnpm exec lean-spec --help`.

## Packages

| Package    | Notes                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **api**    | Apollo GraphQL; schema `apps/api/src/schema.gql`; TypeORM + PostgreSQL. Dev: `pnpm --filter @job-tracker/api run dev` (migrations + watch). |
| **web**    | Apollo Client; codegen: `pnpm --filter @job-tracker/web run codegen` → `src/gql/` (ESLint ignore).                                          |
| **ui**     | Radix + Tailwind; Storybook on port 6006.                                                                                                   |
| **logger** | Typed logger; no tests.                                                                                                                     |

## Tests

- **API**: Vitest, `src/**/*.spec.ts`, Node, `fileParallelism: false`; needs `DATABASE_URL` (see `.env.example`).
- **Web**: Vitest, `src/**/*.test.{ts,tsx}`, jsdom; 80% coverage on `src/app/page.tsx`, `src/hooks/**`, `src/env/client.ts`, `src/lib/apollo-client.ts`.
- **UI**: Vitest, jsdom.
- **E2E**: Playwright in `apps/web/e2e/`, Chromium; web server on `E2E_PORT` (default 3100).

## Rules and operations

- **GraphQL codegen** (`apps/web/codegen.ts`): reads `apps/api/src/schema.gql`, writes `apps/web/src/gql/`; post-process `scripts/postprocess-codegen-hooks.mjs`.
- **ESLint**: `className` via `cn()` only; no raw `process.env` in `apps/web/src/` — use `src/env/`; in config/codegen only: `CI`, `E2E_PORT`, `API_GRAPHQL_URL`, `NODE_ENV`. `eslint --max-warnings=0`; pre-commit lint-staged (eslint --fix + prettier).
- **Turbo**: `test` and `typecheck` depend on `^build`; `dev` and `db:migrate:watch` persistent (no cache).
- **Docker (API)**: build from repo root: `docker build -f apps/api/Dockerfile -t job-tracker-api:local .`
- **Migrations**: `apps/api/src/database/`; watch `node scripts/watch-migrations.mjs`; squash `pnpm db:migrate:squash`.
- **PM2**: logs under `~/.pm2/logs/` (`*-out.log`, `*-error.log`).

## CI and conventions

GitHub Actions: `ci` (Postgres 16-alpine, Node 22, pnpm 10.8.1), `e2e`, `docker-api`. Coding conventions: `docs/CONVENTIONS.mdx` (Storybook → Documentation → Conventions).
