# Validation

## Workflow

```
pnpm fix:imports     # import sorting (fast, no type-checking)
pnpm lint            # turbo lint (ESLint)
pnpm format          # prettier --write
pnpm typecheck       # turbo typecheck (tsc --noEmit)
pnpm test            # turbo test (Vitest/Jest)
pnpm e2e             # Playwright, Chromium, apps/web/e2e/, E2E_PORT (default 3100)
```

## Parallelism

`lint`, `test`, `typecheck` can run in parallel. `test` and `typecheck` depend on `^build` (turbo).

## CI

GitHub Actions: `ci` (Postgres 16-alpine, Node 22, pnpm 10.8.1), `e2e`, `docker-api`. Installs with `pnpm install --frozen-lockfile`. CI fails if lint leaves a dirty tree.

## Pre-commit (lint-staged)

```
node --experimental-strip-types scripts/fix-imports.ts
eslint --fix --max-warnings=0 --no-warn-ignored
prettier --write
```

## Dead code

Run `pnpm knip` before finishing a task. If dead code found, list and ask user before removing.

## Local CI

`pnpm ci:local` runs: leanspec:validate → leanspec:sync-spec-indices --check → lint → typecheck → test (coverage 80%) → build.
