## Outcome

- Centralized refresh-token retry logic in Apollo middleware using `authRefreshLink`.
- Added backend refresh validation path support to issue a new access token from `refresh_token`.
- Simplified `useCurrentUser` by removing embedded refresh-side effects.

## Verification run

- `pnpm --filter @job-tracker/web test -- src/lib/apollo-client.test.ts src/hooks/useCurrentUser.test.ts`
- `pnpm exec vitest run src/domains/auth/auth.service.spec.ts src/domains/auth/auth.controller.spec.ts` (from `apps/api`)

## Follow-up

- Add an integration-level client test that simulates `UNAUTHENTICATED -> /auth/refresh -> retry success` with a mocked Apollo link chain.
