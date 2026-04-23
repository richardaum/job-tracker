# App Router Modules Organization

## Context

The web app currently mixes route files and route-specific UI/domain components in the same `app` tree. This makes the App Router structure noisy and increases the cost of finding route boundaries vs feature implementation code.

## Goal

Keep `app` focused on routing concerns only (`page.tsx`, `layout.tsx`, and route segment structure), and move non-routing implementation details into `modules`.

## Scope

- Create a feature module structure for applications pages under `apps/web/src/modules`.
- Migrate components/hooks/utils currently co-located under `apps/web/src/app/(authenticated)/applications` into modules.
- Keep route files in `apps/web/src/app/(authenticated)/applications` as thin wrappers that render module entry points.
- Update imports and tests affected by the move.

## Target Structure

```
apps/web/src/
  app/(authenticated)/applications/
    page.tsx
    [id]/page.tsx
  modules/applications/
    list/
      page/
      components/
      utils/
    details/
      page/
      components/
      hooks/
      utils/
```

## Requirements

- R1: `app` route files must remain minimal and only compose module page entries.
- R2: Route-specific components, hooks, and helpers must live under `modules/applications/*`.
- R3: Existing route behavior and tests must continue to pass after migration.
- R4: Import paths must avoid circular dependencies between route wrappers and modules.

## Execution Plan

1. Create `modules/applications/list` and `modules/applications/details` folders.
2. Move non-route files from route folders into module subfolders.
3. Create module page entry files and update App Router pages to import them.
4. Update tests and internal imports to the new module paths.
5. Run lint/tests for touched web files and fix any issues.

## Risks

- Broken relative imports after move.
- Tests referencing old paths.
- Future confusion if new route files start importing each other directly instead of module entries.

## Guardrails

- Keep one-way dependency: `app/* -> modules/*`.
- Do not import from `app/*` inside modules.
