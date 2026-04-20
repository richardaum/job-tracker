---
name: Quick Task 006 — Fix Sentry Next.js SDK warnings
description: Resolve all Sentry startup warnings in the Next.js web app
type: project
---

# Quick Task 006: Fix Sentry Next.js SDK warnings

**Date:** 2026-04-19
**Status:** Done

## Description

Fix all `@sentry/nextjs` deprecation and configuration warnings that appeared on `turbo dev` startup, bringing the SDK setup up to current best practices.

## Files Changed

- `apps/web/src/instrumentation.ts` — added `import * as Sentry` and exported `onRequestError = Sentry.captureRequestError`
- `apps/web/src/app/global-error.tsx` — created with `Sentry.captureException` to capture React render errors
- `apps/web/instrumentation-client.ts` — created (replaces deprecated `sentry.client.config.ts`); added `onRouterTransitionStart` export
- `apps/web/sentry.client.config.ts` — deleted (deprecated; replaced by `instrumentation-client.ts`)

## Verification

- [x] No `@sentry/nextjs` warnings on dev server startup
- [x] `onRequestError` hook present in `instrumentation.ts`
- [x] `global-error.tsx` exists in `src/app/`
- [x] `instrumentation-client.ts` exists at web app root
- [x] `sentry.client.config.ts` deleted
- [x] `onRouterTransitionStart` exported from `instrumentation-client.ts`

## Commit

`TBD`
