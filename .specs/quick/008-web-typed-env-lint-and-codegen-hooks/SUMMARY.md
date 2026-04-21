## Outcome

- Added lint guidance in `apps/web` against direct `process.env` access, with env-module and runtime-detection exceptions.
- Migrated web runtime env consumers to typed exports from `src/env/client.ts`.
- Enabled GraphQL Codegen-generated React hooks and switched `useCurrentUser` to `useMeQuery`.

## Verification run

- `pnpm --filter @job-tracker/web codegen`
- `pnpm --filter @job-tracker/web test`
- `pnpm --filter @job-tracker/web build`

## Follow-up

- Revisit codegen hook generation when upstream plugin/apollo typing issue is resolved, so local postprocess cleanup can be removed.
