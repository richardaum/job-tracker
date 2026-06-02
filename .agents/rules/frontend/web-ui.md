# Web UI

## Composition and hydration

- `asChild` (`@radix-ui/react-slot`) for interactive UI (button, `a`) when wrapping other interactives or `NextLink` — avoids invalid nesting and hydration errors.
- Do not mix block and inline in sibling slots; use the same display type across equivalent slots.

## Buttons

Use `state` (`"default" | "loading"`), not a boolean `loading` prop. Loading disables the control and sets a11y attributes.

## Dialogs

- Implement in dedicated files, not inline in page/panel components.
- `Dialog`: flex layout — use `childrenClassName="flex flex-col"` and `flex-1 min-h-0` on children that should fill height and scroll internally.
- Scrollable containers in dialogs must have `pe-3` (padding-right) so content isn't hidden behind the scrollbar grip.
- `ConfirmDialog` (`@job-tracker/ui`) for confirmations, especially destructive actions — not `window.confirm` / `alert` / `prompt`.
- Prefer small feature components wrapping `ConfirmDialog` over duplicating cancel + confirm footers.
- Storybook: Components → ConfirmDialog.

## FieldWithLabelAction Tooltips

When a tooltip is required within the `content` of a `FieldWithLabelAction`, use `FieldWithLabelAction.Tooltip` (defaults to `side="bottom"`).

## Editors (TipTap)

- Use `autofocus` in composers and edit dialogs; `autofocus="end"` when editing existing content (cursor at end).

## Controllable state

`apps/web/src/modules/applications/shared/hooks/useControllableState.ts` when a component supports controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) modes.

## TipTapEditor / aiActions

Prefer an inline literal array in props (e.g. `aiActions={[actionA, actionB]}`) over a `const` used only for that prop.

## Extraction M.O.

When introducing or refactoring a feature:

1. Choose extraction granularity intentionally: contextual (coarse), functional (medium), atomic (fine)
2. Group by context, not technical bucket: co-locate in feature/domain area instead of generic globals
3. Prefer low coupling; use dependency injection and generics when appropriate
4. Apply SRP pragmatically — each unit has one clear responsibility
5. Keep orchestration and primitives separate: high-level modules express business flow; low-level modules stay infrastructure-oriented

Before finalizing, document: name + contract, rationale, level classification (domain vs utility).

## List and Detail Page Layout

Canonical reference: `/applications` and `/applications/[id]`.

### List (index)

- **Primary action**: Place creation in the top tool row, not inside the scrollable card stack. From `sm` up, use `justify-between`: controls on the start, primary button on the end.
- **List body**: Vertical stack of cards (`Stack`, `gap="sm"`), in a `flex-1 overflow-auto` region.
- **Card component**: One card component per entity type in its own file (e.g. `ApplicationCard.tsx`).
- **Title and actions**: On the first row of a card, group title and inline actions in a single flex row with `items-center` and `gap-2`. Do not separate with a vertical spacer or second toolbar strip.

### Detail (item)

- **Header**: Title at the top (`Heading`) + header action cluster — primary button(s) and/or **Actions** dropdown. See **Page header actions**. May add a back link row above the title.
- **Main and side column**: Primary content in main column (left in LTR). Optional supplementary UI (activity, chat, timeline) in a secondary column on wide layouts. CSS Grid: `lg:grid-cols-[minmax(0,1fr)_360px]`, `min-h-0` on both tracks.
- **Responsive**: Below `lg`, collapse to one column — side column content becomes extra tabs on the same `TabsList`.
- **Tabs**: When main area has multiple subviews, use `Tabs` for the main column first. Add more triggers only when side column is merged for small breakpoints.

### Tabbed area layouts (shell + primary tabs)

**When:** A section shares one page chrome (back link, title, optional header actions) and switches content by tab — e.g. Profile, Admin, Job details.

**How:**

- **Shell component** (`*Shell.tsx` or detail `*Layout.tsx`): owns shared chrome and the **primary** tab bar.
- **One route per primary tab** — derive active tab from `usePathname()`, navigate with `router.push` + a `TAB_ROUTES` map (canonical: `ProfileShell`, `AdminShell`).
- **Structure:** `DetailPageHeader` (fixed) → primary `Tabs` / `TabsList` (`shrink-0`) → tab body in `{children}` inside a `flex-1 min-h-0 overflow-auto` (or `pe-*`) scroll region.
- **Tab body pages** live under `modules/<area>/<tab>/page/`; App Router re-exports them from `app/(authenticated)/<area>/.../page.tsx`.
- **Do not** nest a second full shell inside tab routes — the layout `layout.tsx` wraps all tab pages once.

**Slots (optional):** When tab routes need to contribute header buttons or menu items, wrap the shell in `SlotsProvider` (`@job-tracker/react-slots`) and mount `.Slot` targets in the header. Co-locate declarations in `*.slots.ts` next to the feature. Profile uses legacy `react-portalslots` (`PortalSlotsProvider`) for header-only portals — prefer `@job-tracker/react-slots` for new work (supports `ContextSlot` for dropdown items).

**Canonical references:** `ProfileShell` (shell + routes, header slot), `AdminShell` (shell + routes), `JobDetailsLayout` (shell + routes + side column + slots).

### Sub-tabs via slots

**When:** A **primary tab route** needs a **secondary** tab bar (filters, subviews) that should render **inline with the primary tab bar** (same row / wrap group), while keeping hooks and state in the child route subtree.

**How:**

- Declare a dedicated `PortalSlot` in the area's `*.slots.ts` (canonical name: `<Area>SubTabs`, e.g. `JobDetailsSubTabs`).
- **Shell / layout:** render `<AreaSubTabs.Slot className="empty:hidden" />` inside the primary tab bar row (flex wrap with `gap-x-4 gap-y-2`), after the primary `TabsList`.
- **Child tab content:** when sub-tabs apply, wrap the secondary `Tabs` / `TabsList` in `<AreaSubTabs>...</AreaSubTabs>` so it portals into the shell. Omit the wrapper when sub-tabs are not shown — the slot stays hidden.
- Sub-tab state stays in the child (controlled `Tabs` + view-model hook); the shell only provides the mount point.
- **One owner per slot:** only the active primary tab should mount into a given slot; last mount wins until unmount.

**When not:**

- **Primary tabs** — route-driven tabs belong in the shell, not portaled from children.
- **Sub-tabs that live inside tab body only** — use a normal `Tabs` in the page content without a slot (no need to align with the primary bar).
- **Dropdown menu items** — use `ContextSlot` (`<AreaActionsMenuItems>`), not `PortalSlot` — see **Page header actions**.

**Canonical reference:** `JobDetailsLayout` (`JobDetailsTabBar` + `JobDetailsSubTabs.Slot`) + `MatchTabContent` (`<JobDetailsSubTabs>` with All / Fits / Gaps / Unclear).

### Page header actions

Detail and tabbed-area pages expose actions in the **header action cluster** (top-end). Use two surfaces with distinct roles — do not merge primary and secondary actions into one control.

#### Primary header buttons

**When:** One high-frequency action for the current view — Create, Generate, Regenerate, Save (when not inline on the field).

**How:**

- **`intent="primary"`**, `size="md"`. Use `state="loading"` while the mutation runs (not a boolean `loading` prop).
- **Static page** (no tab contributions): pass the button via `DetailPageHeader` `trailing` (canonical: `CompanyDetailsPage` — Actions menu only; no slot).
- **Tabbed shell / nested routes:** declare `<Area>HeaderActions = PortalSlot("…-header-actions")` in `*.slots.ts`; shell mounts `<AreaHeaderActions.Slot className="flex shrink-0 items-center gap-2 empty:hidden" />` in the header cluster; active tab wraps its button(s) in `<AreaHeaderActions>…</AreaHeaderActions>` (canonical: `ResumesTabPage` → `ProfileHeaderActions`, `MatchTabContent` → `JobHeaderActions`).
- Mount the slot **only when the entity is loaded** (same guard as the rest of the header).
- **One primary button** per active tab in the slot; avoid a second primary toolbar inside tab body for the same action (empty states may repeat the CTA as `EmptyState` `onAction` — header button remains canonical).

#### Actions dropdown (secondary menu)

**When:** Infrequent, contextual, or destructive operations — delete, update status, navigation shortcuts, tab-specific utilities.

**How:**

- Single **`DropdownMenu`** per page header, trigger label **"Actions"**, `Button intent="secondary" size="md"`, `align="end"`.
- **Caret:** `CaretDownIcon` on `rightIcon`, rotate 180° when open (`actionsMenuOpen` state + `transition-transform`).
- **Order inside the menu:**
  1. Tab/route contributions — `<AreaActionsMenuItems.Slot />` first (`ContextSlot`, not `PortalSlot`).
  2. Layout-owned items — page-level actions defined in the shell/layout.
  3. `DropdownMenuSeparator` before destructive group.
  4. Destructive items last — `destructive` prop (e.g. Remove, Delete).
- **Groups:** tab-specific sections may use `DropdownMenuGroup` + `DropdownMenuLabel` before their items (canonical: Match tab menu in `MatchTabContent`).
- **Delete/remove:** pair menu item with a hidden-trigger dialog in the layout (`open` / `onOpenChange` state); do not call `window.confirm`.
- Layout-owned menu content stays in the layout file; only tab-specific items portaled from child routes.

#### Header cluster layout

**When:** Both dropdown and primary button(s) are present.

**How:**

- Top-end cluster: **`[Actions dropdown] [HeaderActions.Slot]`** — dropdown before portaled primary buttons (`JobDetailsLayout`).
- **`DetailPageHeader`:** use `trailing` for the cluster; default `reserveClassName` keeps title clear of pinned actions. Increase `reserveClassName` when both dropdown and a wide primary button show (e.g. `pr-36 sm:pr-64` on title row in job details).
- Alternative for shells without `DetailPageHeader`: absolute top-end wrapper with `flex shrink-0 flex-wrap items-center justify-end gap-2` (same ordering).

#### Slots from nested tab routes

**When:** A shared layout wraps multiple tabs and the **active tab** owns the primary button and/or extra menu items.

**How:**

- `@job-tracker/react-slots`: `SlotsProvider` on the layout root; `*.slots.ts` co-located with the feature.
- **`PortalSlot`** → `<Area>HeaderActions` (primary buttons; keeps tab hooks/state).
- **`ContextSlot`** → `<AreaActionsMenuItems` (menu items; must render under layout `DropdownMenu` — portaled `MenuItem` breaks Radix context).
- Tab content: `<AreaHeaderActions>{button}</AreaHeaderActions>` and/or `<AreaActionsMenuItems>{items}</AreaActionsMenuItems>`.
- **One owner per slot** — only the active tab mounts; last mount wins until unmount.

**Canonical references:** `job-details-header.slots.ts`, `JobDetailsLayout`, `MatchTabContent`, `ProfileHeaderActions` + `ResumesTabPage`.

#### When not

- **List index primary action** — top tool row, not header (`List (index)` above).
- **Inline field actions** — `trailing` on the field row, not header slots.
- **Dialogs / popovers / tooltips** — Radix overlays, not header slots.
- **Duplicating the same primary action** in header slot and a sticky in-tab toolbar.

## Mobile debug

When debugging from a phone (ngrok), do not point client at `127.0.0.1` — mobile cannot reach host loopback; HTTPS may block mixed content.

Use same-origin dev route in `apps/web` (e.g. `"/__debug_ingest"`) proxied/rewritten by Next.js. Derive target from allowlisted env vars. Disable when destination cannot be resolved.
