# Separate distDir avoids dev/build collisions, but churns next-env.d.ts

## Context

- In `apps/web/next.config.ts`, `distDir` is intentionally split:
  - dev: `.next-dev`
  - build: `.next`
- Reason: running `build` while `dev` is active can break the dev process when both share the same dist directory.

## Symptom

- `apps/web/next-env.d.ts` rewrites the routes reference path depending on the active `distDir`.
- Result: file keeps toggling between `.next-dev` and `.next`, causing noisy git diffs.

## Do instead

- Keep split `distDir` to preserve process isolation.
- Treat `apps/web/next-env.d.ts` as generated output:
  - add it to `.gitignore`
  - remove it from git tracking (`git rm --cached apps/web/next-env.d.ts`)

## Notes

- This is a trade-off for local stability when dev/build may run concurrently.
- The file is regenerated automatically by Next.js.
- Disabling `typedRoutes` does not remove this churn when `distDir` changes between environments.
