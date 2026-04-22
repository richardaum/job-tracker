# Next RSC and UI Barrel Imports

## Context

In Next.js App Router server components, importing from `@job-tracker/ui` can force evaluation of client-heavy modules through the package barrel (`packages/ui/src/index.ts`).

## Symptom

Runtime crash during RSC render:

- `TypeError: createContext is not a function`
- stack includes `packages/ui/src/components/Alert/Alert.tsx` and `packages/ui/src/index.ts`

## Cause

`apps/web/src/app/layout.tsx` imported `cn` from `@job-tracker/ui`, which is a server component entry point. The barrel re-export graph pulled in components that rely on client React behavior.

## Do Instead

- In server components, avoid importing helpers from the UI barrel.
- Use local string composition for simple classes, or import server-safe utilities from a dedicated server-safe entrypoint.
