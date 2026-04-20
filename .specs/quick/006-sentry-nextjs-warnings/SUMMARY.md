# Quick Task 005: Summary

## What Was Done

Fixed all `@sentry/nextjs` startup warnings in `apps/web`:

1. **`onRequestError` hook** — added to `instrumentation.ts` so nested RSC request errors are captured
2. **`global-error.tsx`** — created in `src/app/` to capture React render errors via `Sentry.captureException`
3. **`instrumentation-client.ts`** — created at app root with `Sentry.init` (client config) and `onRouterTransitionStart` export for navigation instrumentation; replaces deprecated `sentry.client.config.ts`
4. **`sentry.client.config.ts`** — deleted (Turbopack will not pick it up; `instrumentation-client.ts` is the correct convention)

## Commit

`TBD`
