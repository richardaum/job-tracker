# AGENTS.md — `packages/ui`

## Stack

Radix + Tailwind. Storybook on port 6006 (PM2 **storybook**).

## Tests

Vitest, jsdom.

## Composition

- `asChild` for interactive UI wrapping `NextLink` / other interactives
- Same display type across equivalent slots

## Buttons

Use `state` (`"default" | "loading"`), not boolean `loading`.

## Dialogs

- `Dialog`: `childrenClassName="flex flex-col"`, `flex-1 min-h-0` on scroll children
- `ConfirmDialog` for destructive actions — no `window.confirm`

## Editors (TipTap)

`autofocus` for composers; `autofocus="end"` when editing existing content.
