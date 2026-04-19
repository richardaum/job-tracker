# Quick Task 002: Typed server environment (Zod + server-only)

**Date:** 2026-04-19
**Status:** Done

## Description

Validate required server environment variables at startup with **Zod**, export typed values, and use **`import "server-only"`** on Next.js so secrets cannot be pulled into the client bundle. Aligns with the “fail fast, fail clear” pattern: invalid or missing config prevents the process from serving traffic.

## Scope (what shipped)

- **`apps/api/src/env/server.ts`** — `DATABASE_URL` as `z.url().startsWith("postgresql://")`; `parse(process.env)` at load; exported `DATABASE_URL`.
- **API wiring** — `main.ts` imports `./env/server` before Nest boot; `DatabaseService` and `drizzle.config.ts` consume the typed export (no raw `process.env` for that variable).
- **`apps/web/src/env/server.ts`** — extendable `z.object({})` scaffold with `server-only`; **`layout.tsx`** imports it so validation runs for the App Router root.
- **Vitest** — `database.service.spec.ts` uses `import type` plus dynamic `import()` inside `beforeAll` when `DATABASE_URL` is present, so optional integration tests do not load the env module when the DB is absent.

## Verification

- [x] `pnpm --filter @job-tracker/api test` — passes; DB integration test skips when `DATABASE_URL` unset.
- [x] `pnpm --filter @job-tracker/web build` — passes with root layout importing server env.

## Commit

`5be7589` — feat(api): add NestJS API with Drizzle and Zod env  
`e1a73e4` — feat(web): add server-only Zod env module
