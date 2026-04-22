# Component Token Removal - Spec

**Milestone:** M2  
**Status:** Done  
**Depends on:** `.specs/features/design-system/spec.md`  
**Design:** `./design.md`  
**Tasks:** `./tasks.md`

---

## Objective

Remove the `--component-*` token layer from the design system and keep component-specific visual decisions close to each component implementation.

This improves debuggability and developer experience by reducing indirection between class usage and rendered value.

---

## Problem Statement

Current component styling uses a three-tier token model (primitive -> semantic -> component), plus custom utility names such as `gap-form-gap`.

Pain points:

- Debugging requires jumping across multiple files (`component -> utility -> token alias -> value`)
- Utility names like `gap-form-gap` are not self-evident in IDE autocomplete
- Component-specific values are hard to discover when reading component code

---

## Scope

In scope:

- Remove `--component-*` definitions from `packages/ui/src/tokens.css`
- Replace component-token usage (`var(--component-*)`) in UI components
- Move component-local visual choices to component files (or nearby local constants)
- Keep primitives and semantic tokens as the global source of shared meaning
- Update design-system documentation and stories to reflect the new architecture

Out of scope:

- Rebuilding the whole token foundation
- Visual redesign of product screens
- New component inventory

---

## Requirements

| ID     | Description                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------- |
| CTR-01 | No component consumes `--component-*` tokens                                                                        |
| CTR-02 | `packages/ui/src/tokens.css` contains only primitive and semantic token namespaces                                  |
| CTR-03 | Component-specific values are defined near component implementation (local constants/maps/CVA variants)             |
| CTR-04 | Shared brand semantics (color intent, spacing roles, typography roles) remain centralized in semantic tokens        |
| CTR-05 | Critical readability pain points (e.g. `gap-form-gap`) are replaced by utilities with clearer value discoverability |
| CTR-06 | Existing UI behavior and visual output remain functionally equivalent unless explicitly documented                  |
| CTR-07 | Design-system docs and token story no longer present "component tokens" as an active tier                           |

---

## Non-Functional Requirements

- Maintain type safety and existing component APIs where possible
- Preserve accessibility states (focus, error, disabled, contrast)
- Keep migration incremental and reviewable (small commits/tasks)

---

## Acceptance Criteria

1. `rg "var\\(--component-" packages/ui/src/components` returns no matches
2. `rg -- "--component-" packages/ui/src/tokens.css` returns no matches
3. `Stack` no longer depends on `gap-*-gap` aliases for its default semantic variants
4. `pnpm --filter @job-tracker/ui build` passes
5. `pnpm --filter @job-tracker/ui test` passes
6. `pnpm --filter @job-tracker/ui test-storybook` passes
7. Documentation under `.specs/features/design-system` and this feature reflects a two-tier token model + component-local definitions
