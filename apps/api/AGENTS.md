# AGENTS.md — `apps/api`

## Stack

NestJS 11 + Apollo GraphQL + TypeORM + PostgreSQL. Schema: `src/schema.gql`.

## Dev

- PM2: **api** process
- Docker: `docker build -f apps/api/Dockerfile -t job-tracker-api:local .` (repo root)
- Migrations: `apps/api/src/database/`

## Tests

Vitest, `src/**/*.spec.ts`, Node, `fileParallelism: false`. Integration tests (`*.integration.ts`) need `DATABASE_INTEGRATION_URL` in `apps/api/.env` or process env (see `.env.example`); `vitest.setup.ts` loads `.env` then `.env.test` for test credentials.

## NestJS

Resolvers with `@UseGuards(SessionAuthGuard, RolesGuard)` must `import AuthModule`.

## Mutations

Delete mutations: return payload with `success: Boolean!` and `deletedId: ID!`.

## Standalone Scripts

See **`docs/STANDALONE_SCRIPTS.md`**.
