import type { KeyboardEvent } from "react";

/** If ArrowUp fires on the first selectable item, focus the combobox input (Radix roving skips this). */
export function returnComboboxFocusToInputOnFirstItemArrowUp(
  event: KeyboardEvent<Element>,
  menuContentRoot: HTMLElement | null,
  inputEl: HTMLInputElement | null | undefined,
): void {
  if (event.key !== "ArrowUp" || !menuContentRoot || !inputEl) return;
  const items = menuContentRoot.querySelectorAll<HTMLElement>(
    '[role="menuitem"]:not([data-disabled]):not([aria-disabled="true"])',
  );
  if (items.length === 0 || items[0] !== event.currentTarget) return;
  event.preventDefault();
  inputEl.focus({ preventScroll: true });
}

/** Focus first or last selectable item inside Radix `Menu.Content` (`role="menu"`). */
export function focusRadixMenuItemEdge(
  contentRoot: HTMLElement | null,
  edge: "first" | "last",
): void {
  if (!contentRoot) return;
  const items = contentRoot.querySelectorAll<HTMLElement>(
    '[role="menuitem"]:not([data-disabled]):not([aria-disabled="true"])',
  );
  if (items.length === 0) return;
  const el = edge === "first" ? items[0]! : items.item(items.length - 1)!;
  el.focus({ preventScroll: true });
}
