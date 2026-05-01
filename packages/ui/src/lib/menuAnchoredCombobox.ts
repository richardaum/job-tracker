import { focusRadixMenuItemEdge } from "@ui/lib/focusRadixMenuItem";
import type { Dispatch, KeyboardEvent, RefObject, SetStateAction } from "react";
import { useCallback, useMemo, useRef } from "react";

type OutsideEvent = {
  readonly detail: {
    readonly originalEvent: {
      readonly target: EventTarget | null;
      readonly relatedTarget?: EventTarget | null;
    };
  };
  preventDefault(): void;
};

type AnchoredDismissInputRef = RefObject<HTMLInputElement | null>;

function anchoredMenuInteractOutsidePreserveInput(
  ev: OutsideEvent,
  inputRef: AnchoredDismissInputRef,
): void {
  const target = ev.detail.originalEvent.target;
  if (target instanceof Node && inputRef.current?.contains(target)) {
    ev.preventDefault();
  }
}

/** Delay focus until Radix portals `Menu.Content` when opening from closed. Reads ref at RAF time (not stale on first open). */
export function scheduleFocusAnchoredComboMenuItem(
  menuContentRef: RefObject<HTMLElement | null>,
  edge: "first" | "last",
  wasAlreadyOpen: boolean,
): void {
  const run = () => focusRadixMenuItemEdge(menuContentRef.current, edge);
  if (wasAlreadyOpen) requestAnimationFrame(run);
  else requestAnimationFrame(() => requestAnimationFrame(run));
}

export type AnchoredComboInputKeyDownOpts = {
  disabled?: boolean;
  hasItems: boolean;
  open: boolean;
  menuOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

/**
 * Refs + shared `Menu.Content` dismiss/focus + input → list keyboard nav for anchored comboboxes.
 * Handlers close over refs (no ref passed into factories during render → satisfies react-hooks/refs).
 */
export function useMenuAnchoredCombobox() {
  const inputRef = useRef<HTMLInputElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);
  const skipCloseRefocusToInputRef = useRef(false);

  const anchoredMenuDismissLayerProps = useMemo(() => {
    const inputRoot = inputRef;
    const skipClose = skipCloseRefocusToInputRef;
    return {
      onOpenAutoFocus: (event: unknown) => {
        void (event as { preventDefault: () => void }).preventDefault();
      },
      onCloseAutoFocus: (event: unknown) => {
        const ev = event as { preventDefault: () => void };
        ev.preventDefault();
        if (skipClose.current) {
          skipClose.current = false;
          return;
        }
        inputRoot.current?.focus({ preventScroll: true });
      },
      onPointerDownOutside: (ev: OutsideEvent) => {
        const target = ev.detail.originalEvent.target;
        if (target instanceof Node && inputRoot.current?.contains(target))
          return;
        skipClose.current = true;
      },
      onFocusOutside: (ev: OutsideEvent) => {
        const rt = ev.detail.originalEvent.relatedTarget ?? null;
        if (rt instanceof Node && inputRoot.current?.contains(rt)) return;
        skipClose.current = true;
      },
      onInteractOutside: (ev: OutsideEvent) =>
        anchoredMenuInteractOutsidePreserveInput(ev, inputRoot),
    };
  }, []);

  const createInputKeyDownHandler = useCallback(
    ({
      disabled,
      hasItems,
      open,
      menuOpen,
      setOpen,
    }: AnchoredComboInputKeyDownOpts): ((
      e: KeyboardEvent<HTMLInputElement>,
    ) => void) => {
      return (e) => {
        if (disabled || !hasItems) return;
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const wasOpen = menuOpen;
          if (!open) setOpen(true);
          scheduleFocusAnchoredComboMenuItem(menuContentRef, "first", wasOpen);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          const wasOpen = menuOpen;
          if (!open) setOpen(true);
          scheduleFocusAnchoredComboMenuItem(menuContentRef, "last", wasOpen);
          return;
        }
        if (e.key === "Escape" && open) {
          e.preventDefault();
          setOpen(false);
        }
      };
    },
    [],
  );

  return {
    inputRef,
    menuContentRef,
    anchoredMenuDismissLayerProps,
    createInputKeyDownHandler,
  };
}
