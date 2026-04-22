# Quick Task 007: Summary

## What Was Done

Added Zod-validated `PORT` env vars to both apps and moved them into the 31xx range:

- **Web** (`apps/web`): `PORT` added to server Zod schema with default `3100`; `.env.local` already had `PORT=3100`; Next.js CLI reads it natively
- **API** (`apps/api`): `PORT` added to server Zod schema with default `3101`; `PORT=3101` in `.env`; passed directly to `app.listen`

## Commit

`f948d93`
