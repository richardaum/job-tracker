# Web app must import UI package globals for token classes

## Context

- Scope: `apps/web` T08 Outfit + app-level design-system integration.
- `apps/web/src/app` initially had no global CSS entry.

## Symptom

- UI token-backed classes (e.g. `bg-bg-surface`, `text-text-primary`, `font-sans`) depend on Tailwind theme variables from `packages/ui/src/globals.css`.
- Without importing that stylesheet in the app router, token utility classes can miss theme mappings.

## Do instead

- Create `apps/web/src/app/globals.css`.
- Import `@job-tracker/ui/src/globals.css` there.
- Import `./globals.css` in `apps/web/src/app/layout.tsx`.

## Relevant pointers

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/globals.css`
- `packages/ui/src/globals.css`
