# Visual Identity — Tasks

**Spec:** `.specs/features/visual-identity/spec.md`
**Status:** DONE — all tasks complete

---

## Execution Plan

### Phase 1: Tokens (Sequential)

```
T01 ──→ T02
```

### Phase 2: Theme + Dark Mode (Parallel)

```
T02 ──┬── T03 [P]
      └── T04 [P]
```

### Phase 3: Components (Parallel)

```
T03, T04 ──┬── T05 [P]
           └── T06 [P]
```

---

## Task Breakdown

### T01: Design tokens definition

**What:** Define the color palette, typography scale, and spacing scale as CSS variables
**Where:** `packages/ui/src/tokens.css`
**Depends on:** project-setup T04 (Tailwind configured)
**Requirement:** VI-01

**Done when:**

- [x] CSS custom properties defined for: primary, secondary, neutral, success, warning, error color scales
- [x] Typography variables: font families, size scale (xs → 4xl), line heights, font weights
- [x] Spacing scale aligned with Tailwind defaults (4px base unit)
- [x] `tokens.css` imported in `globals.css`
- [x] `pnpm --filter @job-tracker/ui build` passes

**Tests:** none
**Gate:** build — `pnpm --filter @job-tracker/ui build` ✅ (covered by design-system T01)

---

### T02: Tailwind theme configuration

**What:** Map all design tokens from `tokens.css` into the Tailwind theme — no hardcoded values in component code
**Where:** `packages/ui/tailwind.config.ts`
**Depends on:** T01
**Requirement:** VI-02, VI-03

**Done when:**

- [x] `theme.extend.colors` references CSS variables from `tokens.css`
- [x] `theme.extend.fontFamily`, `fontSize`, `spacing` aligned with token definitions
- [x] Mobile-first breakpoints defined: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
- [x] `pnpm --filter @job-tracker/ui build` passes

**Tests:** none
**Gate:** build — `pnpm --filter @job-tracker/ui build` ✅ (covered by design-system T02)

---

### T03: Dark mode support [P]

**What:** Configure light/dark mode via CSS variables toggled by a `data-theme` attribute
**Where:** `packages/ui/src/tokens.css`, `packages/ui/tailwind.config.ts`
**Depends on:** T02
**Requirement:** VI-04

**Done when:**

- [x] `tailwind.config.ts` sets `darkMode: ['attribute', 'data-theme']`
- [x] `tokens.css` defines dark mode overrides under `[data-theme='dark']`
- [x] Switching `data-theme` on `<html>` flips all color tokens
- [x] `pnpm --filter @job-tracker/ui build` passes

**Tests:** none
**Gate:** build — `pnpm --filter @job-tracker/ui build` ✅ (covered by design-system T10)

---

### T04: ThemeProvider component [P]

**What:** Create `ThemeProvider` component that reads/writes the `data-theme` attribute and exposes a `useTheme` hook
**Where:** `packages/ui/src/components/ThemeProvider/`
**Depends on:** T02
**Requirement:** VI-04

**Done when:**

- [x] `ThemeProvider` wraps children and sets `data-theme` on mount (persists in `localStorage`)
- [x] `useTheme()` returns `{ theme, toggleTheme }` — `theme` is `'light' | 'dark'`
- [x] `ThemeProvider.test.tsx` — asserts `toggleTheme` switches the `data-theme` attribute
- [x] `ThemeProvider.stories.tsx` — `LightMode` and `DarkMode` stories pass
- [x] Gate (unit): `pnpm --filter @job-tracker/ui vitest run` — tests pass
- [x] Gate (visual): `pnpm --filter @job-tracker/ui test-storybook` — stories pass

**Tests:** unit + visual
**Gate:** quick + storybook — `pnpm --filter @job-tracker/ui test && pnpm --filter @job-tracker/ui test-storybook` ✅ (64 unit + 55 storybook tests pass)

---

### T05: Typography components [P]

**What:** Create `Heading` and `Text` components that enforce the typography scale
**Where:** `packages/ui/src/components/Typography/`
**Depends on:** T03, T04
**Requirement:** VI-01, VI-02

**Done when:**

- [x] `Heading` accepts `as` prop (`h1`–`h6`) and `size` prop mapped to token scale
- [x] `Text` accepts `size` and `weight` props mapped to token scale
- [x] Both components use only Tailwind classes — no inline styles
- [x] `Heading.test.tsx` and `Text.test.tsx` assert correct tag and class rendering
- [x] `Typography.stories.tsx` — stories for all heading levels and text sizes pass
- [x] Gate (unit): `pnpm --filter @job-tracker/ui vitest run` — tests pass
- [x] Gate (visual): `pnpm --filter @job-tracker/ui test-storybook` — stories pass

**Tests:** unit + visual
**Gate:** quick + storybook — `pnpm --filter @job-tracker/ui test && pnpm --filter @job-tracker/ui test-storybook` ✅ (64 unit + 55 storybook tests pass)

---

### T06: Token documentation story [P]

**What:** Create a Storybook story that documents and visually validates all design tokens
**Where:** `packages/ui/src/stories/Tokens.stories.tsx`
**Depends on:** T03, T04
**Requirement:** VI-01

**Done when:**

- [x] Story renders color palette swatches for all token groups
- [x] Story renders typography scale (all sizes and weights)
- [x] Story renders spacing scale
- [x] Gate: `pnpm --filter @job-tracker/ui test-storybook` — story passes

**Tests:** visual
**Gate:** storybook — `pnpm --filter @job-tracker/ui test-storybook` ✅ (covered by design-system T03)

---

## Parallel Execution Map

```
Phase 1:  T01 ──→ T02

Phase 2:  T02 ──┬── T03 [P]
                └── T04 [P]

Phase 3:  T03, T04 ──┬── T05 [P]
                     └── T06 [P]
```

---

## Granularity Check

| Task                           | Scope                                            | Status |
| ------------------------------ | ------------------------------------------------ | ------ |
| T01: Design tokens CSS         | 1 CSS file                                       | ✅     |
| T02: Tailwind theme config     | 1 config file                                    | ✅     |
| T03: Dark mode setup           | 2 file edits (tokens + tailwind config)          | ✅     |
| T04: ThemeProvider + useTheme  | 3 files (component + test + story)               | ✅     |
| T05: Heading + Text components | 4 files, cohesive (2 components + tests + story) | ✅     |
| T06: Token documentation story | 1 story file                                     | ✅     |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T01  | project-setup T04 | start         | ✅     |
| T02  | T01               | T01 → T02     | ✅     |
| T03  | T02               | T02 → T03     | ✅     |
| T04  | T02               | T02 → T04     | ✅     |
| T05  | T03, T04          | T03,T04 → T05 | ✅     |
| T06  | T03, T04          | T03,T04 → T06 | ✅     |

---

## Test Co-location Validation

| Task | Layer Created                | Matrix Requires | Task Says     | Status |
| ---- | ---------------------------- | --------------- | ------------- | ------ |
| T01  | CSS tokens (config)          | none            | none          | ✅     |
| T02  | Tailwind config              | none            | none          | ✅     |
| T03  | config edits                 | none            | none          | ✅     |
| T04  | React component (ui) + story | unit + visual   | unit + visual | ✅     |
| T05  | React component (ui) + story | unit + visual   | unit + visual | ✅     |
| T06  | Storybook story              | visual          | visual        | ✅     |
