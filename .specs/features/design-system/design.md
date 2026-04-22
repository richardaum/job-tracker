# Design System - Design

**Spec:** `.specs/features/design-system/spec.md`  
**Context:** `.specs/features/design-system/context.md`  
**Status:** In Progress

---

## Scope Strategy

This feature is **Large** (multi-component, cross-workspace, shared package).  
Execution will happen in three layers:

1. Foundation (tokens + theme wiring)
2. Base components (core inventory in `packages/ui`)
3. Product adoption (`apps/web` consumes only design-system primitives)

Dark mode stays architecturally ready but functionally deferred, aligned with DS-CTX-05.

---

## Architecture

### 1) Token Source of Truth

Single source of truth lives in `packages/ui/src/tokens.css`.

Layers:

- `--primitive-*`: raw values (palette, spacing, typography, border, shadow)
- `--semantic-*`: usage-intent aliases (`text-primary`, `bg-surface`, etc.)

Rules:

- Components never consume primitive tokens directly.
- Tailwind utilities map to semantic tokens and approved scale utilities.
- Component-specific visual defaults are defined near each component implementation.
- Dark mode uses semantic remapping under `[data-theme='dark']` (prep only in this milestone).

### 2) Theme and Styling Consumption

`packages/ui/src/globals.css` imports `tokens.css` and defines Tailwind v4 `@theme` mappings:

- colors -> semantic tokens
- spacing -> semantic spacing tokens
- radii, shadows, font family, typography roles

All component classes use these mapped utilities (`bg-bg-surface`, `text-text-primary`, etc.).

### 3) Shared UI Package Contract

`packages/ui/src/index.ts` exports all public UI components and token-related utilities.

Each exported component follows this structure:

`Component.tsx` + `Component.test.tsx` + `Component.stories.tsx` (+ `types.ts` when needed).

Variants are API-level contracts (`intent`, `size`, `state`) and do not rely on ad-hoc class concatenation with magic values.

### 4) Web App Integration

`apps/web` consumes only `@job-tracker/ui` components and semantic utility classes.

Integration points:

- `apps/web/src/app/layout.tsx` loads Outfit with `next/font/google`
- app-level styling uses design-system tokens/classes
- no hardcoded visual values allowed in page/component code

---

## Component Strategy

Implementation order prioritizes highest reuse:

1. Layout primitives: `Container`, `Stack`, `Card`, `Separator`
2. Form primitives: `Label`, `Input`, `Textarea`, `Select`, `Checkbox`, `FormField`
3. Actions and feedback: `Button`, `IconButton`, `Link`, `Badge`, `Alert`, `Spinner`, `Skeleton`
4. Overlays: `Dialog`, `DropdownMenu`, `Tooltip`, `Toast`

`Application CRUD` UI work should consume these primitives rather than introducing feature-specific visuals first.

---

## Accessibility Baseline

All interactive components must provide:

- keyboard navigation and focus visibility
- ARIA naming where native semantics are insufficient
- contrast aligned with semantic color pairs
- Radix primitives for overlay/select/checkbox/separator/toast behavior

Coverage is enforced by unit + Storybook test gates.

---

## Technical Decisions

- **Tailwind v4 CSS-first theme:** keep token mapping in CSS for centralized control
- **Radix for behavior only:** no styled component frameworks
- **Phosphor icons only:** avoid mixed icon libraries
- **Outfit via `next/font`:** eliminate layout shift and keep typography consistent

---

## Traceability Matrix

| Requirement | Design response                                                                          |
| ----------- | ---------------------------------------------------------------------------------------- |
| DS-01       | Primitive + semantic tokens + component-local defaults; no primitive usage in components |
| DS-02       | Variant props standardized per component API                                             |
| DS-03       | Radix mandatory for select/checkbox/separator/dialog/dropdown/tooltip/toast              |
| DS-04       | Accessibility baseline + gate coverage in tests/stories                                  |
| DS-05       | Component file set contract enforced per task                                            |
| DS-06       | Storybook required per exported component and token docs                                 |
| DS-07       | Barrel exports in `packages/ui/src/index.ts`                                             |
| DS-08       | Component order aligned to CRUD list/forms/status flows                                  |
| DS-09       | Outfit wired at `apps/web` root layout                                                   |
| DS-10       | Phosphor-only icon policy in component APIs/stories                                      |
