# Design System — Spec

**Milestone:** M1
**Status:** In Progress
**Depends on:** Visual Identity (tokens, Tailwind theme, dark mode foundation — must be complete)
**Research:** [resume.md](./resume.md)
**Discuss decisions:** [context.md](./context.md)
**Design:** [design.md](./design.md)
**Tasks:** [tasks.md](./tasks.md)
**Visual reference:** [references/visual-reference-prowork-dashboard.md](./references/visual-reference-prowork-dashboard.md)

---

## Design Principles

Derived from DS-CTX-01:

1. **Condensed but breathable** — tight spacing driven by typography, not padding. Efficient, not cluttered.
2. **Light and friendly** — rounded corners, subtle surfaces, color used for meaning only. No heavy borders or deep shadows.
3. **Information-first** — maximum useful content per viewport. Critical on mobile.
4. **Consistent semantic intent** — every color, size, and weight has a named reason. No magic values anywhere.

---

## Token Architecture

Three-tier model (see [resume.md](./resume.md)):

```
Primitive   →  color-brand-600: #4F46E5
Semantic    →  color-action-primary: {color-brand-600}
Component   →  button-bg-default: {color-action-primary}
```

**Rule:** components reference only semantic or component tokens — never primitives.

---

## Tier 1 — Primitive Tokens

### Colors

#### Brand — Indigo (DS-CTX-02)

| Token             | Value               |
| ----------------- | ------------------- |
| `color-brand-50`  | `#EEF2FF`           |
| `color-brand-100` | `#E0E7FF`           |
| `color-brand-200` | `#C7D2FE`           |
| `color-brand-300` | `#A5B4FC`           |
| `color-brand-400` | `#818CF8`           |
| `color-brand-500` | `#6366F1`           |
| `color-brand-600` | `#4F46E5` ← primary |
| `color-brand-700` | `#4338CA`           |
| `color-brand-800` | `#3730A3`           |
| `color-brand-900` | `#312E81`           |

#### Neutral

| Token               | Value     |
| ------------------- | --------- |
| `color-neutral-0`   | `#FFFFFF` |
| `color-neutral-50`  | `#F9FAFB` |
| `color-neutral-100` | `#F3F4F6` |
| `color-neutral-200` | `#E5E7EB` |
| `color-neutral-300` | `#D1D5DB` |
| `color-neutral-400` | `#9CA3AF` |
| `color-neutral-500` | `#6B7280` |
| `color-neutral-600` | `#4B5563` |
| `color-neutral-700` | `#374151` |
| `color-neutral-800` | `#1F2937` |
| `color-neutral-900` | `#111827` |

#### Green (Success)

| Token             | Value     |
| ----------------- | --------- |
| `color-green-50`  | `#F0FDF4` |
| `color-green-100` | `#DCFCE7` |
| `color-green-500` | `#22C55E` |
| `color-green-600` | `#16A34A` |
| `color-green-700` | `#15803D` |

#### Red (Error)

| Token           | Value     |
| --------------- | --------- |
| `color-red-50`  | `#FFF1F2` |
| `color-red-100` | `#FEE2E2` |
| `color-red-500` | `#EF4444` |
| `color-red-600` | `#DC2626` |
| `color-red-700` | `#B91C1C` |

#### Yellow (Warning)

| Token              | Value     |
| ------------------ | --------- |
| `color-yellow-50`  | `#FEFCE8` |
| `color-yellow-100` | `#FEF9C3` |
| `color-yellow-500` | `#EAB308` |
| `color-yellow-600` | `#CA8A04` |

#### Orange (Pending)

| Token              | Value     |
| ------------------ | --------- |
| `color-orange-50`  | `#FFF7ED` |
| `color-orange-100` | `#FFEDD5` |
| `color-orange-500` | `#F97316` |
| `color-orange-600` | `#EA580C` |

---

### Typography (DS-CTX-03 — Outfit)

#### Font Family

| Token              | Value                             |
| ------------------ | --------------------------------- |
| `font-family-base` | `"Outfit", system-ui, sans-serif` |

#### Font Size

| Token            | rem         | px   |
| ---------------- | ----------- | ---- |
| `font-size-xs`   | `0.6875rem` | 11px |
| `font-size-sm`   | `0.75rem`   | 12px |
| `font-size-base` | `0.8125rem` | 13px |
| `font-size-md`   | `0.875rem`  | 14px |
| `font-size-lg`   | `1rem`      | 16px |
| `font-size-xl`   | `1.125rem`  | 18px |
| `font-size-2xl`  | `1.375rem`  | 22px |
| `font-size-3xl`  | `1.75rem`   | 28px |

#### Font Weight

| Token                  | Value |
| ---------------------- | ----- |
| `font-weight-regular`  | `400` |
| `font-weight-medium`   | `500` |
| `font-weight-semibold` | `600` |
| `font-weight-bold`     | `700` |

#### Line Height

| Token                | Value   |
| -------------------- | ------- |
| `line-height-tight`  | `1.2`   |
| `line-height-snug`   | `1.375` |
| `line-height-normal` | `1.5`   |

---

### Spacing (4px base)

| Token      | Value  |
| ---------- | ------ |
| `space-0`  | `0px`  |
| `space-1`  | `4px`  |
| `space-2`  | `8px`  |
| `space-3`  | `12px` |
| `space-4`  | `16px` |
| `space-5`  | `20px` |
| `space-6`  | `24px` |
| `space-8`  | `32px` |
| `space-10` | `40px` |
| `space-12` | `48px` |

---

### Border

#### Width

| Token            | Value | Usage                             |
| ---------------- | ----- | --------------------------------- |
| `border-width-1` | `1px` | Default — inputs, cards, dividers |
| `border-width-2` | `2px` | Focus rings                       |
| `border-width-4` | `4px` | Section accent bars               |

#### Radius

| Token         | Value    | Usage                        |
| ------------- | -------- | ---------------------------- |
| `radius-sm`   | `6px`    | Small chips, inner elements  |
| `radius-md`   | `10px`   | Buttons, inputs, search bars |
| `radius-lg`   | `14px`   | Cards                        |
| `radius-xl`   | `20px`   | Bottom sheets, modals        |
| `radius-full` | `9999px` | Badge pills, avatars         |

#### Shadow

| Token         | Value                                                    |
| ------------- | -------------------------------------------------------- |
| `shadow-none` | `none`                                                   |
| `shadow-sm`   | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` |
| `shadow-md`   | `0 4px 12px rgba(0,0,0,0.08)`                            |

---

## Tier 2 — Semantic Tokens

### Color — Text

| Token                  | Primitive           | Usage                                 |
| ---------------------- | ------------------- | ------------------------------------- |
| `color-text-primary`   | `color-neutral-900` | Headings, body, labels                |
| `color-text-secondary` | `color-neutral-500` | Subtitles, supporting info            |
| `color-text-muted`     | `color-neutral-400` | Placeholders, disabled                |
| `color-text-inverted`  | `color-neutral-0`   | Text on brand/dark backgrounds        |
| `color-text-brand`     | `color-brand-600`   | Links, active nav states              |
| `color-text-success`   | `color-green-600`   | Success badge text                    |
| `color-text-error`     | `color-red-600`     | Error badge text, destructive actions |
| `color-text-warning`   | `color-yellow-600`  | Warning badge text                    |

### Color — Background

| Token                     | Primitive           | Usage                           |
| ------------------------- | ------------------- | ------------------------------- |
| `color-bg-canvas`         | `color-neutral-100` | App background                  |
| `color-bg-surface`        | `color-neutral-0`   | Cards, sidebar, modals          |
| `color-bg-surface-hover`  | `color-neutral-50`  | Row / item hover                |
| `color-bg-brand`          | `color-brand-600`   | Primary button, active nav fill |
| `color-bg-brand-subtle`   | `color-brand-50`    | Active nav tint background      |
| `color-bg-brand-hover`    | `color-brand-700`   | Primary button hover            |
| `color-bg-success-subtle` | `color-green-50`    | Success badge background        |
| `color-bg-error-subtle`   | `color-red-50`      | Error badge background          |
| `color-bg-warning-subtle` | `color-yellow-50`   | Warning badge background        |

### Color — Border

| Token                  | Primitive           | Usage                       |
| ---------------------- | ------------------- | --------------------------- |
| `color-border-subtle`  | `color-neutral-200` | Card outlines, row dividers |
| `color-border-default` | `color-neutral-300` | Input default state         |
| `color-border-brand`   | `color-brand-600`   | Focus ring, accent bars     |
| `color-border-error`   | `color-red-500`     | Input error state           |

### Typography — Semantic Roles

| Token                | Size / Weight / Line-height | Usage                           |
| -------------------- | --------------------------- | ------------------------------- |
| `text-page-title`    | `2xl / bold / tight`        | Page headings                   |
| `text-section-title` | `md / semibold / snug`      | Card and section titles         |
| `text-body`          | `base / regular / normal`   | Default body, table rows        |
| `text-body-medium`   | `base / medium / normal`    | Emphasized body (names, labels) |
| `text-caption`       | `sm / regular / normal`     | Supporting text, hints          |
| `text-label`         | `sm / medium / normal`      | Badges, chips, nav items        |
| `text-button`        | `md / medium / tight`       | Button labels                   |
| `text-metric`        | `3xl / bold / tight`        | Dashboard stat numbers          |

### Spacing — Semantic Roles

| Token                | Primitive        | Usage                      |
| -------------------- | ---------------- | -------------------------- |
| `space-card-padding` | `space-4` (16px) | Card internal padding      |
| `space-card-gap`     | `space-4` (16px) | Gap between cards in list  |
| `space-section-gap`  | `space-6` (24px) | Gap between page sections  |
| `space-inline-gap`   | `space-2` (8px)  | Icon + label inline gap    |
| `space-form-gap`     | `space-3` (12px) | Gap between form fields    |
| `space-button-x`     | `space-4` (16px) | Button horizontal padding  |
| `space-button-y-sm`  | `space-2` (8px)  | Button vertical padding sm |
| `space-button-y-md`  | `space-3` (12px) | Button vertical padding md |

---

## Tier 3 — Component Tokens (representative set)

### Button

| Slot                   | Token                  |
| ---------------------- | ---------------------- |
| `button-bg`            | `color-bg-brand`       |
| `button-bg-hover`      | `color-bg-brand-hover` |
| `button-text`          | `color-text-inverted`  |
| `button-border-radius` | `radius-md`            |
| `button-font`          | `text-button`          |
| `button-padding-x`     | `space-button-x`       |
| `button-padding-y`     | `space-button-y-md`    |

### Badge

| Slot                  | Token                     |
| --------------------- | ------------------------- |
| `badge-bg-success`    | `color-bg-success-subtle` |
| `badge-text-success`  | `color-text-success`      |
| `badge-bg-error`      | `color-bg-error-subtle`   |
| `badge-text-error`    | `color-text-error`        |
| `badge-border-radius` | `radius-full`             |
| `badge-font`          | `text-label`              |
| `badge-padding-x`     | `space-3`                 |
| `badge-padding-y`     | `space-1`                 |

### Card

| Slot                 | Token                                    |
| -------------------- | ---------------------------------------- |
| `card-bg`            | `color-bg-surface`                       |
| `card-border`        | `border-width-1` + `color-border-subtle` |
| `card-border-radius` | `radius-lg`                              |
| `card-padding`       | `space-card-padding`                     |
| `card-shadow`        | `shadow-sm`                              |

### Input

| Slot                  | Token                                     |
| --------------------- | ----------------------------------------- |
| `input-bg`            | `color-bg-surface`                        |
| `input-border`        | `border-width-1` + `color-border-default` |
| `input-border-focus`  | `border-width-2` + `color-border-brand`   |
| `input-border-error`  | `border-width-1` + `color-border-error`   |
| `input-border-radius` | `radius-md`                               |
| `input-text`          | `color-text-primary`                      |
| `input-placeholder`   | `color-text-muted`                        |
| `input-font`          | `text-body`                               |

---

## Icons (DS-CTX-06 — Phosphor Icons)

- Package: `@phosphor-icons/react`
- Default weight: `regular` for UI icons
- Emphasis weight: `bold` for primary action icons
- Size scale: `16px` inline / `20px` default UI / `24px` section icons

---

## Requirements

| ID    | Description                                                                                                                   |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- |
| DS-01 | All components use exclusively Tailwind utilities referencing tokens — zero hardcoded color, spacing, or font values          |
| DS-02 | Variants (`intent`, `size`, `state`) are explicit props — never conditional inline styles or manually concatenated classNames |
| DS-03 | All interactive components use Radix UI as the behavior primitive                                                             |
| DS-04 | All components meet WCAG 2.1 Level A: color contrast, aria-labels, visible focus ring                                         |
| DS-05 | Each component ships: component file + type file + unit tests + Storybook story                                               |
| DS-06 | Storybook documents all variants, all states, and composition examples                                                        |
| DS-07 | `packages/ui` exports all components via `index.ts` — tree-shakeable                                                          |
| DS-08 | The system covers core Job Tracker use cases: application card list, create/edit forms, status feedback                       |
| DS-09 | Outfit font loaded via `next/font` in `apps/web` — no layout shift                                                            |
| DS-10 | All icons use Phosphor Icons at consistent weights — no mixed icon libraries                                                  |

---

## Component Inventory

### Actions

| Component    | Variants                                                                                       | Radix? |
| ------------ | ---------------------------------------------------------------------------------------------- | ------ |
| `Button`     | `intent`: primary, secondary, ghost, destructive / `size`: sm, md / `state`: loading, disabled | No     |
| `IconButton` | `intent`: same as Button / `size`: sm, md                                                      | No     |
| `Link`       | `variant`: default, muted                                                                      | No     |

### Forms

| Component   | Variants                                                  | Radix?         |
| ----------- | --------------------------------------------------------- | -------------- |
| `Input`     | `state`: default, focus, error, disabled / `size`: sm, md | No             |
| `Textarea`  | `state`: default, focus, error, disabled                  | No             |
| `Select`    | `state`: default, focus, error, disabled                  | Radix Select   |
| `Label`     | `required` flag                                           | No             |
| `FormField` | Wrapper: Label + control + ErrorMessage                   | No             |
| `Checkbox`  | `state`: unchecked, checked, indeterminate, disabled      | Radix Checkbox |

### Feedback

| Component  | Variants                                         | Radix?      |
| ---------- | ------------------------------------------------ | ----------- |
| `Badge`    | `intent`: default, success, warning, error, info | No          |
| `Alert`    | `intent`: info, success, warning, error          | No          |
| `Spinner`  | `size`: sm, md, lg                               | No          |
| `Toast`    | `intent`: success, error, info                   | Radix Toast |
| `Skeleton` | `variant`: text, rect, circle                    | No          |

### Layout

| Component   | Notes                                            | Radix?          |
| ----------- | ------------------------------------------------ | --------------- |
| `Card`      | `padding`: sm, md / `variant`: default, outlined | No              |
| `Stack`     | Flexbox: `direction`, `gap`, `align`, `justify`  | No              |
| `Container` | Max-width wrapper, responsive padding            | No              |
| `Separator` | `orientation`: horizontal, vertical              | Radix Separator |

### Overlay

| Component      | Variants                  | Radix?             |
| -------------- | ------------------------- | ------------------ |
| `Dialog`       | Controlled + uncontrolled | Radix Dialog       |
| `DropdownMenu` | —                         | Radix DropdownMenu |
| `Tooltip`      | —                         | Radix Tooltip      |

---

## Out of Scope

- Kanban layout — revisit during Dashboard Overview (M2)
- Dark mode tokens — light mode stable first (DS-CTX-05)
- DataTable, Charts — M2+
- Date picker — M2+

---

## Acceptance Criteria

1. `pnpm --filter @job-tracker/ui build` passes without errors
2. `pnpm --filter @job-tracker/ui vitest run` — all tests pass with ≥ 70% coverage
3. `pnpm --filter @job-tracker/ui test-storybook` — all stories pass
4. No component in `apps/web` uses hardcoded color, spacing, or font values
5. Outfit font renders without FOUT/layout shift in `apps/web`
6. All icons are Phosphor — no mixed icon libraries
7. Storybook has a Tokens story documenting all primitives (colors, spacing, typography, borders)
