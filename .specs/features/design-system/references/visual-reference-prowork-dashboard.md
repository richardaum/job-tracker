# Visual Reference — ProWork Dashboard (Leaves Screen)

**Type:** UI reference image analysis
**Purpose:** Extract the design system of this UI following the 3-tier token architecture (Primitive → Semantic → Component)
**Structure:** based on [resume.md](../resume.md) synthesis techniques

---

## Tier 1 — Primitive Tokens

The raw palette. These are the only place where hex values live. Nothing else references hex directly.

### Color Primitives

#### Brand (Violet-Purple)

| Token             | Value                   |
| ----------------- | ----------------------- |
| `color-brand-50`  | `#F0EDFF`               |
| `color-brand-100` | `#E4DEFF`               |
| `color-brand-200` | `#C9BCFF`               |
| `color-brand-300` | `#A990FF`               |
| `color-brand-400` | `#8B6EFF`               |
| `color-brand-500` | `#6C4EF5` ← **primary** |
| `color-brand-600` | `#5A3DD4`               |
| `color-brand-700` | `#4730B0`               |
| `color-brand-800` | `#33238A`               |
| `color-brand-900` | `#1F1560`               |

#### Neutral (Gray)

| Token               | Value                                |
| ------------------- | ------------------------------------ |
| `color-neutral-0`   | `#FFFFFF`                            |
| `color-neutral-50`  | `#F9FAFB`                            |
| `color-neutral-100` | `#F2F2F5` ← page background          |
| `color-neutral-200` | `#E8E8EE` ← borders                  |
| `color-neutral-300` | `#D1D5DB`                            |
| `color-neutral-400` | `#9CA3AF` ← placeholder / muted text |
| `color-neutral-500` | `#6B7280` ← secondary text           |
| `color-neutral-600` | `#4B5563`                            |
| `color-neutral-700` | `#374151`                            |
| `color-neutral-800` | `#1F2937`                            |
| `color-neutral-900` | `#1A1A2E` ← primary text             |

#### Green (Success)

| Token             | Value                             |
| ----------------- | --------------------------------- |
| `color-green-50`  | `#F0FDF4`                         |
| `color-green-100` | `#DCFCE7` ← approved badge bg     |
| `color-green-200` | `#BBF7D0`                         |
| `color-green-400` | `#4ADE80`                         |
| `color-green-500` | `#22C55E` ← approved chart + text |
| `color-green-600` | `#16A34A` ← approved badge text   |
| `color-green-700` | `#15803D`                         |

#### Red (Error / Destructive)

| Token           | Value                             |
| --------------- | --------------------------------- |
| `color-red-50`  | `#FFF1F2`                         |
| `color-red-100` | `#FEE2E2` ← rejected badge bg     |
| `color-red-200` | `#FECACA`                         |
| `color-red-400` | `#F87171`                         |
| `color-red-500` | `#EF4444` ← rejected chart + text |
| `color-red-600` | `#DC2626` ← rejected badge text   |
| `color-red-700` | `#B91C1C`                         |

#### Orange (Warning / Sick Leave)

| Token              | Value                            |
| ------------------ | -------------------------------- |
| `color-orange-50`  | `#FFF7ED`                        |
| `color-orange-100` | `#FFEDD5`                        |
| `color-orange-400` | `#FB923C`                        |
| `color-orange-500` | `#F97316` ← sick leave + pending |
| `color-orange-600` | `#EA6C0A`                        |

#### Yellow (Pending)

| Token              | Value                       |
| ------------------ | --------------------------- |
| `color-yellow-400` | `#FBBF24`                   |
| `color-yellow-500` | `#F59E0B` ← pending/warning |
| `color-yellow-600` | `#D97706`                   |

#### Purple (Maternity Leave data color — distinct from brand)

| Token              | Value                             |
| ------------------ | --------------------------------- |
| `color-purple-400` | `#C084FC`                         |
| `color-purple-500` | `#A855F7` ← maternity leave chart |
| `color-purple-600` | `#9333EA`                         |

#### Blue (Requested)

| Token            | Value                        |
| ---------------- | ---------------------------- |
| `color-blue-100` | `#DBEAFE`                    |
| `color-blue-400` | `#60A5FA`                    |
| `color-blue-500` | `#4B6CF7` ← requested status |
| `color-blue-600` | `#3B5FE0`                    |

---

### Typography Primitives

#### Font Family

| Token              | Value                                              |
| ------------------ | -------------------------------------------------- |
| `font-family-sans` | `"Inter", "SF Pro Display", system-ui, sans-serif` |

#### Font Size

| Token            | Value       | px   |
| ---------------- | ----------- | ---- |
| `font-size-xs`   | `0.6875rem` | 11px |
| `font-size-sm`   | `0.75rem`   | 12px |
| `font-size-base` | `0.8125rem` | 13px |
| `font-size-md`   | `0.875rem`  | 14px |
| `font-size-lg`   | `1rem`      | 16px |
| `font-size-xl`   | `1.125rem`  | 18px |
| `font-size-2xl`  | `1.375rem`  | 22px |
| `font-size-3xl`  | `1.75rem`   | 28px |
| `font-size-4xl`  | `2rem`      | 32px |

#### Font Weight

| Token                  | Value |
| ---------------------- | ----- |
| `font-weight-regular`  | `400` |
| `font-weight-medium`   | `500` |
| `font-weight-semibold` | `600` |
| `font-weight-bold`     | `700` |

#### Line Height

| Token                 | Value   |
| --------------------- | ------- |
| `line-height-tight`   | `1.2`   |
| `line-height-snug`    | `1.375` |
| `line-height-normal`  | `1.5`   |
| `line-height-relaxed` | `1.625` |

---

### Spacing Primitives

Base unit: **4px**. All values are multiples.

| Token      | Value  |
| ---------- | ------ |
| `space-0`  | `0px`  |
| `space-1`  | `4px`  |
| `space-2`  | `8px`  |
| `space-3`  | `12px` |
| `space-4`  | `16px` |
| `space-5`  | `20px` |
| `space-6`  | `24px` |
| `space-7`  | `28px` |
| `space-8`  | `32px` |
| `space-10` | `40px` |
| `space-12` | `48px` |
| `space-14` | `56px` |

---

### Border Primitives

#### Border Width

| Token            | Value | Usage                                       |
| ---------------- | ----- | ------------------------------------------- |
| `border-width-0` | `0px` | No border                                   |
| `border-width-1` | `1px` | Default — table rows, card outlines, inputs |
| `border-width-2` | `2px` | Focus ring, active accent bar               |
| `border-width-4` | `4px` | Left accent bar on card titles              |

#### Border Radius

| Token         | Value    | Usage                            |
| ------------- | -------- | -------------------------------- |
| `radius-none` | `0px`    | Table rows (no card wrap)        |
| `radius-sm`   | `4px`    | Badges (inner feel, small chips) |
| `radius-md`   | `8px`    | Buttons, inputs, search bars     |
| `radius-lg`   | `12px`   | Cards                            |
| `radius-xl`   | `16px`   | App shell container              |
| `radius-full` | `9999px` | Badge pills, avatar circles      |

#### Border Color (raw)

| Token                  | Value                           |
| ---------------------- | ------------------------------- |
| `border-color-subtle`  | `color-neutral-200` (`#E8E8EE`) |
| `border-color-default` | `color-neutral-300` (`#D1D5DB`) |
| `border-color-strong`  | `color-neutral-400` (`#9CA3AF`) |

---

### Shadow Primitives

| Token         | Value                         |
| ------------- | ----------------------------- |
| `shadow-none` | `none`                        |
| `shadow-sm`   | `0 1px 2px rgba(0,0,0,0.05)`  |
| `shadow-md`   | `0 4px 12px rgba(0,0,0,0.08)` |
| `shadow-lg`   | `0 8px 24px rgba(0,0,0,0.12)` |

> Note: the image uses very subtle shadows — cards are primarily differentiated by background color (`#FFF` on `#F2F2F5`), not heavy elevation.

---

## Tier 2 — Semantic Tokens

These encode **intent and context** — they map primitive values to roles. Components reference these, never primitives.

### Color — Text

| Token                  | Primitive           | Usage                                     |
| ---------------------- | ------------------- | ----------------------------------------- |
| `color-text-primary`   | `color-neutral-900` | Headings, table data, names               |
| `color-text-secondary` | `color-neutral-500` | Subtitles, column headers, designations   |
| `color-text-muted`     | `color-neutral-400` | Placeholders, keyboard hints, helper text |
| `color-text-inverted`  | `color-neutral-0`   | Text on dark/brand backgrounds            |
| `color-text-brand`     | `color-brand-500`   | Active nav items, links, accents          |
| `color-text-success`   | `color-green-600`   | Approved badge text                       |
| `color-text-error`     | `color-red-600`     | Rejected badge text, Log Out nav item     |
| `color-text-warning`   | `color-yellow-600`  | Pending state text                        |

### Color — Background

| Token                     | Primitive           | Usage                             |
| ------------------------- | ------------------- | --------------------------------- |
| `color-bg-canvas`         | `color-neutral-100` | Page/app shell background         |
| `color-bg-surface`        | `color-neutral-0`   | Cards, sidebar, modal backgrounds |
| `color-bg-surface-hover`  | `color-neutral-50`  | Table row hover state             |
| `color-bg-brand`          | `color-brand-500`   | Primary button, active nav bg     |
| `color-bg-brand-subtle`   | `color-brand-50`    | Active nav item tint background   |
| `color-bg-brand-hover`    | `color-brand-600`   | Primary button hover              |
| `color-bg-success-subtle` | `color-green-100`   | Approved badge background         |
| `color-bg-error-subtle`   | `color-red-100`     | Rejected badge background         |
| `color-bg-warning-subtle` | `color-yellow-100`  | Pending badge background          |

### Color — Border

| Token                  | Primitive           | Usage                               |
| ---------------------- | ------------------- | ----------------------------------- |
| `color-border-subtle`  | `color-neutral-200` | Table row dividers, card outlines   |
| `color-border-default` | `color-neutral-300` | Input default border                |
| `color-border-strong`  | `color-neutral-400` | Input focus (unfocused contrast)    |
| `color-border-brand`   | `color-brand-500`   | Input focus ring, active accent bar |
| `color-border-success` | `color-green-500`   | Success state border                |
| `color-border-error`   | `color-red-500`     | Error state border                  |

### Color — Status (data visualization)

| Token                    | Primitive          | Usage                            |
| ------------------------ | ------------------ | -------------------------------- |
| `color-status-requested` | `color-blue-500`   | Requested donut segment + legend |
| `color-status-approved`  | `color-green-500`  | Approved donut segment + legend  |
| `color-status-pending`   | `color-yellow-500` | Pending donut segment + legend   |
| `color-status-rejected`  | `color-red-500`    | Rejected donut segment + legend  |

### Color — Leave Type (data visualization)

| Token                   | Primitive          | Usage                               |
| ----------------------- | ------------------ | ----------------------------------- |
| `color-leave-sick`      | `color-orange-500` | Sick leave chart + label color      |
| `color-leave-maternity` | `color-purple-500` | Maternity leave chart + label color |
| `color-leave-other`     | `color-green-500`  | Other leave chart + label color     |

### Typography — Semantic Roles

| Token                | Primitives                                                      | Usage                           |
| -------------------- | --------------------------------------------------------------- | ------------------------------- |
| `text-page-title`    | `font-size-2xl` / `font-weight-bold` / `line-height-tight`      | Page heading ("Leaves")         |
| `text-page-subtitle` | `font-size-sm` / `font-weight-regular` / `line-height-normal`   | Page description                |
| `text-section-title` | `font-size-md` / `font-weight-semibold` / `line-height-snug`    | Card section titles             |
| `text-metric-large`  | `font-size-4xl` / `font-weight-bold` / `line-height-tight`      | Chart center numbers (516, 126) |
| `text-metric-label`  | `font-size-xs` / `font-weight-regular` / `line-height-normal`   | Chart center labels             |
| `text-table-header`  | `font-size-sm` / `font-weight-medium` / `line-height-normal`    | Column headers                  |
| `text-table-body`    | `font-size-base` / `font-weight-regular` / `line-height-normal` | Table row content               |
| `text-nav-item`      | `font-size-base` / `font-weight-medium` / `line-height-normal`  | Sidebar nav labels              |
| `text-label-sm`      | `font-size-sm` / `font-weight-medium` / `line-height-normal`    | Badge text, status chips        |
| `text-button`        | `font-size-md` / `font-weight-medium` / `line-height-tight`     | Button labels                   |

### Spacing — Semantic Roles

| Token                 | Primitive                          | Usage                             |
| --------------------- | ---------------------------------- | --------------------------------- |
| `space-component-gap` | `space-5` (20px)                   | Gap between stat cards            |
| `space-card-padding`  | `space-6` (24px)                   | Internal card padding             |
| `space-section-gap`   | `space-6` (24px)                   | Gap between page sections         |
| `space-table-cell-x`  | `space-4` (16px)                   | Table cell horizontal padding     |
| `space-table-row-y`   | `space-3` (12px)                   | Table row vertical padding        |
| `space-button-x`      | `space-5` (20px)                   | Button horizontal padding         |
| `space-button-y`      | `space-2` (8px) — `space-3` (12px) | Button vertical padding (sm / md) |
| `space-nav-item-x`    | `space-4` (16px)                   | Nav item horizontal padding       |
| `space-nav-item-y`    | `space-2` (8px) — `space-3` (12px) | Nav item vertical padding         |

### Border — Semantic Roles

| Token                | Primitive                                 | Usage                                            |
| -------------------- | ----------------------------------------- | ------------------------------------------------ |
| `border-default`     | `border-width-1` + `color-border-subtle`  | Table row dividers                               |
| `border-input`       | `border-width-1` + `color-border-default` | Input / select borders                           |
| `border-input-focus` | `border-width-2` + `color-border-brand`   | Focused input                                    |
| `border-card`        | `border-width-1` + `color-border-subtle`  | Card outline (optional, bg contrast may suffice) |
| `border-accent-left` | `border-width-4` + `color-border-brand`   | Card section title left accent bar               |
| `border-nav-active`  | `border-width-2` + `color-border-brand`   | Active sub-nav vertical line                     |

---

## Tier 3 — Component Tokens

Per-component slot mappings. Components reference these — never tier 1 or tier 2 directly.

### Button

| Slot                        | Token                    |
| --------------------------- | ------------------------ |
| `button-bg-primary`         | `color-bg-brand`         |
| `button-bg-primary-hover`   | `color-bg-brand-hover`   |
| `button-bg-secondary`       | `color-bg-surface`       |
| `button-bg-secondary-hover` | `color-bg-surface-hover` |
| `button-text-primary`       | `color-text-inverted`    |
| `button-text-secondary`     | `color-text-brand`       |
| `button-border-secondary`   | `color-border-brand`     |
| `button-border-radius`      | `radius-md`              |
| `button-padding-x`          | `space-button-x`         |
| `button-padding-y-md`       | `space-3`                |
| `button-font`               | `text-button`            |

### Badge / Status Chip

| Slot                  | Token                     |
| --------------------- | ------------------------- |
| `badge-bg-success`    | `color-bg-success-subtle` |
| `badge-text-success`  | `color-text-success`      |
| `badge-bg-error`      | `color-bg-error-subtle`   |
| `badge-text-error`    | `color-text-error`        |
| `badge-border-radius` | `radius-full`             |
| `badge-padding-x`     | `space-3`                 |
| `badge-padding-y`     | `space-1`                 |
| `badge-font`          | `text-label-sm`           |

### Card

| Slot                 | Token                |
| -------------------- | -------------------- |
| `card-bg`            | `color-bg-surface`   |
| `card-border`        | `border-card`        |
| `card-border-radius` | `radius-lg`          |
| `card-padding`       | `space-card-padding` |
| `card-shadow`        | `shadow-sm`          |
| `card-accent-border` | `border-accent-left` |

### Input

| Slot                  | Token                |
| --------------------- | -------------------- |
| `input-bg`            | `color-bg-surface`   |
| `input-border`        | `border-input`       |
| `input-border-focus`  | `border-input-focus` |
| `input-border-radius` | `radius-md`          |
| `input-text`          | `color-text-primary` |
| `input-placeholder`   | `color-text-muted`   |
| `input-padding-x`     | `space-4`            |
| `input-padding-y`     | `space-2`            |
| `input-font`          | `text-table-body`    |

### Table

| Slot                   | Token                    |
| ---------------------- | ------------------------ |
| `table-bg`             | `color-bg-surface`       |
| `table-row-border`     | `border-default`         |
| `table-row-bg-hover`   | `color-bg-surface-hover` |
| `table-header-text`    | `color-text-secondary`   |
| `table-header-font`    | `text-table-header`      |
| `table-body-text`      | `color-text-primary`     |
| `table-body-font`      | `text-table-body`        |
| `table-cell-padding-x` | `space-table-cell-x`     |
| `table-cell-padding-y` | `space-table-row-y`      |

### Navigation Item

| Slot                     | Token                   |
| ------------------------ | ----------------------- |
| `nav-item-text-default`  | `color-text-secondary`  |
| `nav-item-text-active`   | `color-text-brand`      |
| `nav-item-bg-default`    | `transparent`           |
| `nav-item-bg-active`     | `color-bg-brand-subtle` |
| `nav-item-border-active` | `border-nav-active`     |
| `nav-item-padding-x`     | `space-nav-item-x`      |
| `nav-item-padding-y`     | `space-nav-item-y`      |
| `nav-item-font`          | `text-nav-item`         |
| `nav-item-border-radius` | `radius-md`             |

---

## Layout Structure

```
App Shell (radius-xl, shadow-md, bg: color-bg-surface)
├── Sidebar (width: 200px, border-right: border-default)
│   ├── Logo zone (padding: space-5)
│   ├── Search bar (margin: space-4 horizontal)
│   ├── Nav section label (font-size-xs, font-weight-semibold, color-text-muted, uppercase)
│   ├── Nav items (gap: space-1)
│   │   └── Sub-items (margin-left: space-7, gap: space-1)
│   └── Bottom items (margin-top: auto, gap: space-1)
│
└── Content Area (padding: space-6 all sides)
    ├── Header row (flex, justify: space-between, align: center)
    │   ├── Left: page title + subtitle (gap: space-1)
    │   └── Right: icon actions + user block (gap: space-4)
    │
    ├── Action bar (flex, justify: space-between, margin-top: space-5)
    │   ├── Left: search + filter (gap: space-3)
    │   └── Right: this-month + export + primary-cta (gap: space-3)
    │
    ├── Stat cards row (grid, 3 cols, gap: space-component-gap, margin-top: space-6)
    │   ├── Card 1: Approval Status (donut chart)
    │   ├── Card 2: Leave Type (donut chart)
    │   └── Card 3: Upcoming Holidays (list)
    │
    └── Table section (margin-top: space-6)
        ├── Toolbar (flex, justify: space-between, margin-bottom: space-4)
        └── Table (full-width, row-border: border-default)
```

---

## Design Principles Observed

| Principle                           | Evidence in UI                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Brand color used sparingly**      | Purple appears only on active states, primary CTA, and accent bars — never as background fill on large areas |
| **60/30/10 color rule**             | ~60% white/neutral surfaces, ~30% text/secondary, ~10% brand accents                                         |
| **8-point spacing**                 | All spacings are multiples of 4px (card padding 24px, row gap 20px, cell pad 16px)                           |
| **Status through color**            | Green/red/orange used exclusively for semantic meaning — never decorative                                    |
| **Typography hierarchy via weight** | Same font, different weights communicate level — no size-only hierarchy jumps                                |
| **Primitives never in components**  | Every color decision has a semantic name that encodes intent                                                 |
| **Dark mode ready**                 | All status colors have subtle bg variants — remapping semantic tokens is all that's needed                   |
