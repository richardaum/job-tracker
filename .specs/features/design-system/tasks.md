# Design System - Tasks

**Spec:** `.specs/features/design-system/spec.md`  
**Design:** `.specs/features/design-system/design.md`  
**Status:** DONE — all tasks complete

---

## Execution Plan

### Phase 1: Foundations (Sequential)

```
T01 -> T02 -> T03
```

### Phase 2: Core Primitives (Parallel after T03)

```
T03 -> T04 [P]
T03 -> T05 [P]
T03 -> T06 [P]
```

### Phase 3: Advanced Components (Parallel after Phase 2)

```
T04,T05,T06 -> T07 [P]
T04,T05,T06 -> T08 [P]
T04,T05,T06 -> T09 [P]
```

### Phase 4: Adoption + Validation (Sequential)

```
T07,T08,T09 -> T10 -> T11
```

---

## Task Breakdown

### T01: Create token source of truth

**What:** Implement primitive, semantic, and representative component tokens in CSS  
**Where:** `packages/ui/src/tokens.css`, `packages/ui/src/globals.css`  
**Depends on:** design-system spec  
**Requirement:** DS-01

**Done when:**

- [x] `tokens.css` defines primitive + semantic + component token namespaces
- [x] `globals.css` imports token source and exposes Tailwind-consumable theme values
- [x] No design-system value used in components without a named token

**Tests:** none  
**Gate:** build - `pnpm --filter @job-tracker/ui build` ✅

---

### T02: Tailwind semantic theme wiring

**What:** Map semantic and component tokens to Tailwind utilities  
**Where:** `packages/ui/src/globals.css`, `packages/ui/tailwind.config.ts`  
**Depends on:** T01  
**Requirement:** DS-01, DS-02

**Done when:**

- [x] Semantic token names are available through stable utility classes
- [x] Typography, spacing, border radius, and shadow scales are token-backed
- [x] Existing `Button`/`GoogleLoginButton` compile without hardcoded visual values

**Tests:** unit  
**Gate:** build - `pnpm --filter @job-tracker/ui build` ✅ (`pnpm --filter @job-tracker/ui test` also passing)

---

### T03: Storybook token documentation

**What:** Add a tokens story documenting foundations (colors, spacing, typography, borders)  
**Where:** `packages/ui/src/stories/Tokens.stories.tsx` (or equivalent story location)  
**Depends on:** T02  
**Requirement:** DS-06

**Done when:**

- [x] Storybook includes a Tokens story with primitive and semantic sections
- [x] Story reflects current token names from `tokens.css`
- [x] Storybook test runner passes with the new story

**Tests:** visual  
**Gate:** storybook - `pnpm --filter @job-tracker/ui test-storybook` ✅

---

### T04: Build layout primitives [P]

**What:** Implement `Card`, `Stack`, `Container`, and `Separator` components  
**Where:** `packages/ui/src/components/{Card,Stack,Container,Separator}/`, `packages/ui/src/index.ts`  
**Depends on:** T03  
**Requirement:** DS-01, DS-03, DS-05, DS-07, DS-08

**Done when:**

- [x] All layout primitives use token-backed Tailwind classes only
- [x] `Separator` uses Radix Separator for behavior where applicable
- [x] Each component has test + story + export entry

**Tests:** unit + visual  
**Gate:** quick + storybook - `pnpm --filter @job-tracker/ui test && pnpm --filter @job-tracker/ui test-storybook` ✅

---

### T05: Build form primitives [P]

**What:** Implement `Label`, `Input`, `Textarea`, `Select`, `Checkbox`, `FormField`  
**Where:** `packages/ui/src/components/{Label,Input,Textarea,Select,Checkbox,FormField}/`, `packages/ui/src/index.ts`  
**Depends on:** T03  
**Requirement:** DS-02, DS-03, DS-04, DS-05, DS-07, DS-08

**Done when:**

- [x] `state` and `size` variants are explicit component props
- [x] `Select` and `Checkbox` use Radix primitives
- [x] Focus ring and error states are visible and token-backed
- [x] Each component has test + story + export entry

**Tests:** unit + visual  
**Gate:** quick + storybook - `pnpm --filter @job-tracker/ui test` ✅; `pnpm --filter @job-tracker/ui test-storybook` ✅ (validated in consecutive runs)

---

### T06: Build actions and feedback primitives [P]

**What:** Implement/normalize `Button`, `IconButton`, `Link`, `Badge`, `Alert`, `Spinner`, `Skeleton`  
**Where:** `packages/ui/src/components/{Button,IconButton,Link,Badge,Alert,Spinner,Skeleton}/`, `packages/ui/src/index.ts`  
**Depends on:** T03  
**Requirement:** DS-01, DS-02, DS-04, DS-05, DS-07, DS-08, DS-10

**Done when:**

- [x] Variants (`intent`, `size`, `state`) are consistent and typed
- [x] Icons (when present) use Phosphor only
- [x] Existing `Button` is migrated to token-backed classes
- [x] Each component has test + story + export entry

**Tests:** unit + visual  
**Gate:** quick + storybook - `pnpm --filter @job-tracker/ui test && pnpm --filter @job-tracker/ui test-storybook` ✅

---

### T07: Build overlay primitives [P]

**What:** Implement `Dialog`, `DropdownMenu`, `Tooltip`, and `Toast` wrappers  
**Where:** `packages/ui/src/components/{Dialog,DropdownMenu,Tooltip,Toast}/`, `packages/ui/src/index.ts`  
**Depends on:** T04, T05, T06  
**Requirement:** DS-03, DS-04, DS-05, DS-07

**Done when:**

- [x] All overlay components are Radix-backed
- [x] Open/close and keyboard interactions are covered in tests
- [x] Storybook examples include representative composition usage

**Tests:** unit + visual  
**Gate:** quick + storybook - `pnpm --filter @job-tracker/ui test && pnpm --filter @job-tracker/ui test-storybook` ✅

---

### T08: Outfit + app-level design-system integration [P]

**What:** Load Outfit with `next/font` and wire web app base styles to design-system conventions  
**Where:** `apps/web/src/app/layout.tsx` (and app global style entry if needed)  
**Depends on:** T04, T05, T06  
**Requirement:** DS-09

**Done when:**

- [x] `layout.tsx` loads Outfit through `next/font/google`
- [x] Base body typography is token-aligned and no layout shift is introduced
- [x] Web build/typecheck passes

**Tests:** build  
**Gate:** build - `pnpm --filter @job-tracker/web build` ✅

---

### T09: Application CRUD UI migration to primitives [P]

**What:** Ensure application CRUD pages/components consume design-system primitives only  
**Where:** `apps/web/src/app/(authenticated)/applications/**` and related UI composition points  
**Depends on:** T04, T05, T06  
**Requirement:** DS-01, DS-08

**Done when:**

- [x] No hardcoded color/spacing/font values remain in CRUD UI surfaces
- [x] CRUD flows use `@job-tracker/ui` components for cards/forms/feedback
- [x] Existing CRUD tests continue to pass

**Tests:** unit + e2e (if present)  
**Gate:** full - `pnpm --filter @job-tracker/web test && pnpm --filter @job-tracker/web build` ✅ (7 tests pass; build clean)

---

### T10: Dark mode token remap scaffold

**What:** Add semantic token remap scaffold for dark mode without enabling full dark UI polish  
**Where:** `packages/ui/src/tokens.css`  
**Depends on:** T07, T08, T09  
**Requirement:** DS-01

**Done when:**

- [x] `[data-theme='dark']` semantic overrides exist for core text/background/border tokens
- [x] Components require no code changes to pick remapped semantics
- [x] Light mode remains the default

**Tests:** visual  
**Gate:** storybook - `pnpm --filter @job-tracker/ui test-storybook` ✅ (49 tests pass)

---

### T11: Final system verification and adoption check

**What:** Run design-system acceptance gates and verify requirement traceability  
**Where:** workspace-wide checks + `packages/ui` + `apps/web`  
**Depends on:** T10  
**Requirement:** DS-01..DS-10

**Done when:**

- [x] `@job-tracker/ui` build, tests, and storybook tests pass
- [x] `apps/web` build passes with Outfit and UI package consumption
- [x] Requirement-to-artifact evidence is captured before marking feature done

**Tests:** unit + visual + build  
**Gate:** build + storybook - `pnpm --filter @job-tracker/ui build && pnpm --filter @job-tracker/ui test && pnpm --filter @job-tracker/ui test-storybook && pnpm --filter @job-tracker/web build` ✅ (47 unit + 49 storybook tests pass, web build clean)

---

## Feature Complete
