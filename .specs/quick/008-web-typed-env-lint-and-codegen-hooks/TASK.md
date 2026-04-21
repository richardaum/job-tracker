# Quick Task 008: Web typed env lint + generated hooks

**Date:** 2026-04-20
**Status:** Done

## Description

Enforce typed env access for `apps/web` source code, migrate direct `process.env` consumers to `src/env/client.ts`, and enable GraphQL Codegen-generated React hooks for the `me` query (`useMeQuery`) used by `useCurrentUser`.

## Files Changed

- `eslint.config.ts`
- `apps/web/src/env/client.ts`
- `apps/web/src/lib/apollo-client.ts`
- `apps/web/src/app/login/page.tsx`
- `apps/web/codegen.ts`
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `apps/web/src/graphql/me.graphql`
- `apps/web/src/gql/*` (generated)
- `apps/web/src/hooks/useCurrentUser.ts`
- `apps/web/src/hooks/useCurrentUser.test.ts`
- `apps/web/scripts/postprocess-codegen-hooks.mjs`

## Verification

- [x] `pnpm --filter @job-tracker/web codegen` succeeds
- [x] `pnpm --filter @job-tracker/web test` succeeds
- [x] `pnpm --filter @job-tracker/web build` succeeds
- [x] `rg "process\\.env\\." apps/web/src` only reports env module and intentional runtime check

## Notes

- `apps/web/src/instrumentation.ts` keeps `process.env.NEXT_RUNTIME` intentionally for Next runtime detection.
- Added config-file allowlist rule: in `apps/web/*.config.ts`, only `process.env.CI` and `process.env.E2E_PORT` are allowed.
- Generated hooks file includes a plugin-generated suspense section incompatible with current Next typecheck; a deterministic postprocess script removes that section after every codegen run.
