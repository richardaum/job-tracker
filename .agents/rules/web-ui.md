# Web UI

## Composition and hydration

- `asChild` (`@radix-ui/react-slot`) for interactive UI (button, `a`) when wrapping other interactives or `NextLink` — avoids invalid nesting and hydration errors.
- Do not mix block and inline in sibling slots; use the same display type across equivalent slots.

## Buttons

Use `state` (`"default" | "loading"`), not a boolean `loading` prop. Loading disables the control and sets a11y attributes.

## Dialogs

- Implement in dedicated files, not inline in page/panel components.
- `Dialog`: flex layout — use `childrenClassName="flex flex-col"` and `flex-1 min-h-0` on children that should fill height and scroll internally.
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

- **Header**: Title at the top (`Heading`) + compact Actions control (Button + DropdownMenu). May add a back link row above the title.
- **Main and side column**: Primary content in main column (left in LTR). Optional supplementary UI (activity, chat, timeline) in a secondary column on wide layouts. CSS Grid: `lg:grid-cols-[minmax(0,1fr)_360px]`, `min-h-0` on both tracks.
- **Responsive**: Below `lg`, collapse to one column — side column content becomes extra tabs on the same `TabsList`.
- **Tabs**: When main area has multiple subviews, use `Tabs` for the main column first. Add more triggers only when side column is merged for small breakpoints.

## Mobile debug

When debugging from a phone (ngrok), do not point client at `127.0.0.1` — mobile cannot reach host loopback; HTTPS may block mixed content.

Use same-origin dev route in `apps/web` (e.g. `"/__debug_ingest"`) proxied/rewritten by Next.js. Derive target from allowlisted env vars. Disable when destination cannot be resolved.
