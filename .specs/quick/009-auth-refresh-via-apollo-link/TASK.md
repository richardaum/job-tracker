# Quick Task 009: Auth refresh via Apollo Link

**Date:** 2026-04-22
**Status:** Done

## Description

Fix early logout behavior by implementing refresh-token handling in the GraphQL client middleware layer, instead of inside `useCurrentUser`, so auth retry logic is centralized and reused by all authenticated operations.

## Files Changed

- `apps/api/src/domains/auth/auth.controller.ts`
- `apps/api/src/domains/auth/auth.controller.spec.ts`
- `apps/api/src/domains/auth/auth.service.ts`
- `apps/api/src/domains/auth/auth.service.spec.ts`
- `apps/web/src/lib/auth-refresh-link.ts`
- `apps/web/src/lib/apollo-client.ts`
- `apps/web/src/lib/apollo-client.test.ts`
- `apps/web/src/hooks/useCurrentUser.ts`
- `apps/web/src/hooks/useCurrentUser.test.ts`

## Verification

- [x] `pnpm --filter @job-tracker/web test -- src/lib/apollo-client.test.ts src/hooks/useCurrentUser.test.ts`
- [x] `pnpm exec vitest run src/domains/auth/auth.service.spec.ts src/domains/auth/auth.controller.spec.ts` (from `apps/api`)

## Notes

- `authRefreshLink` now handles `UNAUTHENTICATED` and `401` responses, performs `POST /auth/refresh`, and retries once (`didRefreshRetry`) to prevent infinite loops.
- Concurrent failures share one refresh request via `refreshPromise`.
- `useCurrentUser` now only reads `me` data and no longer owns token refresh behavior.
