# Quick Task 005: Summary

## What Was Done

Added `import "dotenv/config"` as the first line of `apps/api/src/env/server.ts`. Because the Zod schema calls `.parse(process.env)` at module load time (top-level, not inside a function), the `.env` file must be read before that line executes. Without dotenv, `DATABASE_URL` is undefined at parse time and Zod throws.

Also added `dotenv` as an explicit `dependency` in `apps/api/package.json` (was only a transitive dep) and removed the now-unused `server-only` entry.

## Commit

`8f6bb51` — fix(api): load dotenv before Zod env validation
