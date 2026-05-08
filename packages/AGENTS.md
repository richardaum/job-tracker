# AGENTS.md — `packages/`

## Add a New Package

1. Create `packages/<name>/` with:
   - `src/index.ts`
   - `package.json`
   - `tsconfig.json`
2. In `package.json`, use:
   - `"name": "@job-tracker/<name>"`
   - `"private": true`
   - `"version": "0.0.1"`
   - `"main": "./src/index.ts"`
   - `"types": "./src/index.ts"`
   - `"scripts": { "typecheck": "tsc --noEmit" }`
3. In `tsconfig.json`, extend `../../tsconfig.base.json` and include `src/**/*.ts` (and `tsx` if needed).
4. Keep public exports in `src/index.ts`.
5. To consume it, add `"@job-tracker/<name>": "workspace:*"` in the consumer package and run `pnpm install` at repo root.
6. Validate from repo root:
   - `pnpm --filter @job-tracker/<name> run typecheck`
   - `pnpm lint` / `pnpm test` when applicable.

`pnpm-workspace.yaml` already includes `packages/*`, so no workspace update is needed for packages created under `packages/`.

If behavior changes, update the related LeanSpec in `specs/<NNN-slug>/README.md`.
