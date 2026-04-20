# Quick Task 004: Summary

## What Was Done

Removed `import "server-only"` from `apps/api/src/env/server.ts`.

`server-only` throws unconditionally at import time. Next.js suppresses the throw by replacing the module with an empty shim during RSC compilation — plain Node.js (NestJS) has no such shim, so the process crashed on startup.

Corrected LL-006 in STATE.md, which previously (incorrectly) stated it was harmless in NestJS.

## Commit

`7c9ae2c` — fix(api): remove server-only from NestJS env module
