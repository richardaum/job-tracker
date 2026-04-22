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

Match CI locally (lint, typecheck, tests with coverage, production build):

```bash
pnpm ci:local
```

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
