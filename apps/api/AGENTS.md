# AGENTS.md — `apps/api`

## Stack

NestJS 11 + Apollo GraphQL + TypeORM + PostgreSQL. Schema: `src/schema.gql`.

## Dev

- PM2: **api** process
- Docker: `docker build -f apps/api/Dockerfile -t job-tracker-api:local .` (repo root)
- Migrations: `apps/api/src/database/`; watch `node scripts/watch-migrations.mjs`

## Tests

Vitest, `src/**/*.spec.ts`, Node, `fileParallelism: false`. Needs `DATABASE_URL`.

## NestJS

Resolvers with `@UseGuards(JwtAuthGuard, RolesGuard)` must `import AuthModule`.

## Mutations

Delete mutations: return payload with `success: Boolean!` and `deletedId: ID!`.

## Standalone Scripts

See **`docs/STANDALONE_SCRIPTS.md`**.
