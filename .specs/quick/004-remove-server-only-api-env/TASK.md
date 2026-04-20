# Quick Task 004: Remove `server-only` from NestJS env module

**Date:** 2026-04-19
**Status:** Done

## Description

Remove `import "server-only"` from `apps/api/src/env/server.ts` because the package always throws at import time in plain Node.js, crashing the NestJS process on startup.

## Files Changed

- `apps/api/src/env/server.ts` — removed `import "server-only"`

## Verification

- [x] API starts without throwing `Error: This module cannot be imported from a Client Component module`
- [x] `DATABASE_URL` and `SENTRY_DSN` still exported from validated schema

## Commit

`[see SUMMARY.md]`
