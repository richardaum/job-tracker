---
status: draft
created: 2026-05-15
tags: [bug, web, tiptap, paste]
priority: high
---

# Bug: TipTap paste triggers global paste dialog

> **Status**: draft · **Priority**: high · **Created**: 2026-05-15

## Overview

Pasting content while focused on a TipTap editor shows the "Paste detected" dialog instead of inserting the content into the editor. The global `PasteListenerProvider` is supposed to skip paste events within `contenteditable="true"` elements, but the check is failing for TipTap/ProseMirror editors.

## Steps to Reproduce

1. Open any page with a TipTap editor (notes composer, description tab, resume editor, company details page)
2. Click inside the editor to focus it
3. Press Ctrl+V / Cmd+V to paste content
4. **Expected**: Content is pasted into the TipTap editor
5. **Actual**: "Paste detected" dialog appears with the pasted content

## Technical Context

### Global paste listener

`apps/web/src/modules/core/providers/PasteListenerProvider.tsx:28-47`

```ts
const handlePasteCapture = useCallback((event: ClipboardEvent) => {
  const target = event.target;
  if (target instanceof Element && target.closest("input, textarea, [contenteditable='true']")) {
    return;
  }
  // ...
  event.preventDefault();
  setPastedContent(normalized);
  setDialogOpen(true);
}, []);
```

The handler is registered on `window` via `addEventListener("paste", handlePasteCapture)` (bubble phase). It is meant to skip all paste events originating inside `<input>`, `<textarea>`, or `[contenteditable="true"]` elements.

### TipTap editor

`apps/web/src/modules/applications/details/components/TipTapEditor.tsx` — ProseMirror-based rich text editor. The `.ProseMirror` editable div has `contenteditable="true"`, so `target.closest("[contenteditable='true']")` should match it.

### Usage sites

TipTapEditor is used in:

- `NotesPanel` (note composer)
- `DescriptionEditor`
- `NoteComposerExpandedDialog`
- `NoteEditDialog`
- `CompanyEditDialog`
- `CompanyDetailsPage`
- `ResumeDetailsPage`

## Hypothesis

The PasteListenerProvider skips pastes in `[contenteditable='true']`, and ProseMirror does set `contenteditable="true"` on `.ProseMirror`, so the selector should work for normal editor usage.

The following should be investigated:

- **Toolbar interaction**: TipTapEditor's toolbar contains `<button>` elements outside the `.ProseMirror` contenteditable area. If a toolbar element retains focus, pasting does not originate from a contenteditable region.

- **ProseMirror DOM manipulation**: ProseMirror may temporarily detach or replace the editor DOM during updates, causing the paste event to target a wrapper outside the contenteditable area.

- **Popover/dropdown context**: Dropdown menus (heading selector, AI actions) render in portals. If paste fires while a portal has focus, the target falls outside the editor's DOM subtree.

- **Dialog composition**: Editors inside dialogs (`NoteComposerExpandedDialog`, `NoteEditDialog`, `CompanyEditDialog`) may have focus-restoration logic that shifts focus to a non-editable element between blur and paste.

## Plan

- [ ] Reproduce the bug and identify the exact scenario (editor type, focus state, browser)
- [ ] Add debug logging to `PasteListenerProvider` to log `event.target` and `closest()` result on paste
- [ ] Determine root cause
- [ ] Implement fix (likely refining the exclusion check in `PasteListenerProvider`)

## Fix

**Root cause**: The `event.target` of a paste event inside a TipTap editor is not always the `.ProseMirror` contenteditable div. ProseMirror's internal DOM management, portal-based dropdowns, and focus restoration in dialogs can cause the paste event to target a wrapper element outside the contenteditable subtree.

**Solution implemented** (Option A + C hybrid):

In addition to the existing `target.closest()` check, also verify `document.activeElement`. If the currently focused element is inside `.ProseMirror` or any `[contenteditable='true']`, skip the global paste handler. This covers:

- Paste while focused on `.ProseMirror` (normal editor usage)
- Paste after interacting with toolbar buttons that return focus to the editor
- Paste inside dialogs where focus restoration targets a non-contenteditable element
- Paste while a TipTap dropdown/portal is open but the editor retains logical focus

```ts
// Skip paste when focus is inside a TipTap/ProseMirror editor
const active = document.activeElement;
if (
  active instanceof Element &&
  (active.closest(".ProseMirror, [contenteditable='true']") || active.classList.contains("ProseMirror"))
) {
  return;
}
```

- [x] Reproduce the bug and identify the exact scenario (editor type, focus state, browser)
- [x] Add debug logging to `PasteListenerProvider` to log `event.target` and `closest()` result on paste
- [x] Determine root cause
- [x] Implement fix (refining the exclusion check in `PasteListenerProvider`)

## Test

- [ ] Paste inside TipTap editor → content is inserted, no dialog
- [ ] Paste outside editors (page background) → dialog appears
- [ ] Paste inside `<input>` / `<textarea>` → no dialog
- [ ] Paste inside TipTap toolbar → no dialog (or dialog if intentional)
- [ ] Paste inside TipTap inside a dialog → content is inserted, no dialog
- [ ] Paste after clicking toolbar button then immediately Cmd+V → content is inserted, no dialog

## Notes

- `[contenteditable='true']` is a CSS attribute selector — it matches elements where the HTML attribute `contenteditable` is literally `"true"`. ProseMirror sets this via `setAttribute("contenteditable", "true")`.
- The exclusion check uses `event.target.closest()` which traverses the ancestor chain, so contenteditable wrappers should be found regardless of nesting depth.

## Related

- [T-264] Investigate and fix TipTap paste dialog false positive
