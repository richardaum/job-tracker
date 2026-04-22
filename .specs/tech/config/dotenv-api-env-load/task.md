# Quick Task 005: Load dotenv before Zod env validation in NestJS API

**Date:** 2026-04-19
**Status:** Done

## Description

Add `import "dotenv/config"` as the first import in `apps/api/src/env/server.ts` so the `.env` file is populated into `process.env` before Zod parses it.

## Files Changed

- `apps/api/src/env/server.ts` — added `import "dotenv/config"` as first import
- `apps/api/package.json` — added `dotenv` as explicit dependency; removed unused `server-only`

## Verification

- [x] `@job-tracker/api:dev` starts without ZodError on `DATABASE_URL`
- [x] `DATABASE_URL` resolves from `apps/api/.env`

## Commit

`8f6bb51` — fix(api): load dotenv before Zod env validation
