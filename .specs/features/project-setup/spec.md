# Project Setup — Spec

**Milestone:** M1
**Status:** In Progress

## Requirements

| ID    | Description                                                                     |
| ----- | ------------------------------------------------------------------------------- |
| PS-01 | pnpm workspaces monorepo scaffold (apps/web, apps/api, packages/ui)             |
| PS-02 | Next.js 15 initialized in apps/web (App Router, TypeScript, no API routes)      |
| PS-03 | NestJS initialized in apps/api (Fastify adapter, TypeScript)                    |
| PS-04 | packages/ui configured with Tailwind CSS v4, Radix UI, Storybook, and Vitest    |
| PS-05 | Drizzle ORM connected to local PostgreSQL in apps/api                           |
| PS-06 | Docker for apps/api (Dockerfile + docker-compose for local PostgreSQL)          |
| PS-07 | GitHub Actions CI pipeline (lint → typecheck → test → build)                    |
| PS-08 | Sentry configured in apps/web and apps/api                                      |
| PS-09 | Turborepo orchestrating dev, build, test, lint, typecheck across all workspaces |
