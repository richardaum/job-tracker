# Component-local defaults with semantic tokens

## Context

During component token removal, the project moved from a global `--component-*` layer to:

- global primitive + semantic tokens in `packages/ui/src/tokens.css`
- local component defaults in each component file (or nearby maps/constants)

## Pattern

1. Keep cross-component meaning in semantic tokens (colors, spacing roles, typography).
2. Keep component-specific numbers close to the component (`max-w-lg`, `min-w-44`, `min-w-72`, or local style maps).
3. For dark mode behavior, prefer semantic remaps (for example `--semantic-color-overlay-backdrop`) over component-scoped globals.

## Why this helps

- Debugging is faster because code and effective value are closer.
- IDE autocomplete is clearer for scale-native utilities.
- You keep system-wide consistency without a hard-to-trace third token tier.
