# Job tracker

pnpm monorepo: `apps/web` (Next.js), `apps/api` (NestJS GraphQL), `packages/ui`, `packages/logger`.

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) 10.8+ (see root `packageManager`)

## Common commands

Install dependencies:

```bash
pnpm install
```

Run the stack in development (Turborepo):

```bash
pnpm dev
```

Parallel feature work in **git worktrees** (isolated ports, DB, PM2 names; main checkout unchanged):

```bash
export WORKTREE_SOURCE_DB=job_tracker
pnpm worktree:setup    # inside the worktree only; boolean flags use =true|false (see packages/worktree-cli/README.md)
pnpm pm2:start
pnpm worktree:teardown   # -- --dry-run=true|false --apply=true|false --drop-db=true|false --dbeaver=true|false
```

See `apps/api/.env.example`, `apps/web/.env.example`, `apps/extension/.env.example`, and `.agents/rules/ops-docker-pm2.md`.

Match CI locally (LeanSpec validation, lint, typecheck, tests with coverage, production build):

```bash
pnpm ci:local
```

## End-to-end tests

Playwright drives the web dev server on port **3102** by default (`E2E_PORT`), so it won't conflict with the local dev server on **3100**. Use another free port in the **31xx** range if 3102 is taken:

```bash
E2E_PORT=3103 pnpm e2e
```

This runs `turbo build --filter=@job-tracker/web` then the suite under `apps/web/e2e` (including the mocked GraphQL CRUD flow for [P-14]).

## API container image

The API Dockerfile expects a **repository-root** build context so pnpm can resolve workspace manifests and `packages/*` ([T-46], [T-53]).

```bash
docker build -f apps/api/Dockerfile -t job-tracker-api:local .
```

Equivalent:

```bash
pnpm docker:build:api
```

The container starts with `node dist/main` from `apps/api`; provide a valid `DATABASE_URL` and the rest of the API’s required environment (see `apps/api/src/env/server.ts`) at runtime.

## Deployment profiles ([T-44])

**Low traffic:** run the API image with a single PostgreSQL instance; run the web app with `next start` or a compatible host. Keep secrets in the environment, not in the image.

**Scaling up:** run multiple stateless API replicas behind a load balancer, use a managed database with connection limits sized for replica count, and deploy the web tier separately so UI and API can scale independently ([F-20]).
