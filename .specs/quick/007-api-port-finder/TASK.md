---
name: Quick Task 007 — Configurable PORT in 31xx range for web and API
description: Add Zod-validated PORT env var to both apps — web defaults to 3100, API to 3101
type: project
---

# Quick Task 007: Configurable PORT in 31xx range for web and API

**Date:** 2026-04-19
**Status:** Done

## Description

Add a `PORT` env var (Zod-validated) to both apps and move them into the 31xx port range. Removes the hardcoded `3001` from the API.

## Files Changed

- `apps/api/src/env/server.ts` — added `PORT` (coerced number, default `3101`)
- `apps/api/src/main.ts` — pass `PORT` to `app.listen` instead of hardcoded `3001`
- `apps/api/.env` — added `PORT=3101`
- `apps/web/src/env/server.ts` — added `PORT` (coerced number, default `3100`) to schema
- `apps/web/.env.local` — `PORT=3100` (already present)

## Verification

- [x] Web runs on port `3100` (Next.js reads `PORT` natively from `.env.local`)
- [x] API runs on port `3101` (NestJS reads `PORT` via Zod-validated env schema)
- [x] No `detect-port` dependency
- [x] No hardcoded ports

## Commit

`TBD`
