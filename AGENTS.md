# AGENTS.md — Job Tracker

## Stack

pnpm monorepo (turbo): `apps/web` (Next.js 16), `apps/api` (NestJS 11 + GraphQL), `packages/ui` (shared React components), `packages/logger`.

Node 22+, pnpm 10.8+. Lockfile enforced in CI (`pnpm install --frozen-lockfile`).

## Commands

```bash
pnpm dev              # turbo dev + db:migrate:watch
pnpm build            # turbo build
pnpm test             # turbo test (vitest)
pnpm lint             # turbo lint (eslint --max-warnings=0)
pnpm typecheck        # turbo typecheck
pnpm ci:local         # full CI: specs:validate → lint → typecheck → test (80% cov) → build
pnpm e2e              # build web, then Playwright (port 3100, set E2E_PORT to override)
pnpm specs:validate   # validate .specs/ structure
```

## Architecture notes

- **API** (`apps/api`): NestJS with Apollo Server GraphQL. Schema output: `apps/api/src/schema.gql`. TypeORM + PostgreSQL. Start with `pnpm --filter @job-tracker/api run dev` (runs migrations then `nest start --watch`).
- **Web** (`apps/web`): Next.js with Apollo Client. GraphQL codegen runs against API schema: `pnpm --filter @job-tracker/web run codegen`. Generates `src/gql/` (ignore in eslint, see `eslint.config.ts` ignores).
- **UI package** (`packages/ui`): React components with Radix UI + Tailwind. Storybook on port 6006.
- **Logger** (`packages/logger`): minimal typed logger, no tests.

## Test patterns

- **API**: vitest, files `src/**/*.spec.ts`, Node environment, `fileParallelism: false`. Needs `DATABASE_URL` (see `.env.example`).
- **Web**: vitest, files `src/**/*.test.{ts,tsx}`, jsdom environment. Coverage thresholds: 80% lines on `src/app/page.tsx`, `src/hooks/**`, `src/env/client.ts`, `src/lib/apollo-client.ts`.
- **UI**: vitest, jsdom environment.
- **E2E**: Playwright, `apps/web/e2e/`, Chromium only. Web server starts automatically on `E2E_PORT` (default 3100).

## Quirks

- **GraphQL codegen** (`apps/web/codegen.ts`): reads from `apps/api/src/schema.gql`, outputs `apps/web/src/gql/`. Post-process hook: `scripts/postprocess-codegen-hooks.mjs`.
- **ESLint restrictions**:
  - `className` must use `cn()` helper, not string literals/templates/arrays (React files).
  - No direct `process.env` in `apps/web/src/` — use typed modules in `apps/web/src/env/`.
  - Config/codegen files allow only: `CI`, `E2E_PORT`, `API_GRAPHQL_URL`, `NODE_ENV`.
- **Lint strictness**: `eslint --max-warnings=0` in all packages. Pre-commit: lint-staged runs eslint --fix + prettier.
- **Turbo pipeline**: `test` and `typecheck` depend on `^build`. `dev` and `db:migrate:watch` are persistent (no cache).
- **Docker API build**: must use repository-root context: `docker build -f apps/api/Dockerfile -t job-tracker-api:local .`
- **Migrations**: TypeORM in `apps/api/src/database/`. Watch mode: `node scripts/watch-migrations.mjs`. Squash: `pnpm db:migrate:squash`.

## CI

GitHub Actions: `ci` (Postgres 16-alpine service, Node 22, pnpm 10.8.1), `e2e` (Playwright Chromium), `docker-api`.

## Conventions

Project coding conventions live in `docs/CONVENTIONS.md`.
