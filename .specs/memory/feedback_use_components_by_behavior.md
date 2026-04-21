---
name: Use design-system components by behavior, not convenience
description: If a layout behaves like a Stack, use Stack — even if extra spacing is needed. Wrap in a plain div for spacing rather than abandoning the component.
type: feedback
originSessionId: 42e97246-87bb-48c5-be3a-923e858b68cc
---

If the layout IS a stack (row/column of items with gap + alignment), use the `Stack` component. If extra CSS like `mt-4` is needed that `Stack` doesn't support, put it on a wrapper `<div>` — not an excuse to replace `Stack` with a raw `<div>`.

**Why:** Keeps design-system components as the single source of layout truth. Abandoning a component because of one unrelated CSS property creates inconsistency.

**How to apply:** Before reaching for a raw `<div>` for layout, ask: does this behave like a Stack? If yes, use Stack + wrapper div for any extra spacing/margin.
