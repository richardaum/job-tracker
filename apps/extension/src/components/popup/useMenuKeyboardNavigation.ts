import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type UseMenuKeyboardNavigationParams = {
  itemCount: number;
  onEscape: () => void;
};

type UseMenuKeyboardNavigationResult = {
  menuRef: RefObject<HTMLElement | null>;
  isKeyboardMode: boolean;
  getItemRef: <T extends HTMLElement = HTMLButtonElement>(
    index: number,
  ) => (node: T | null) => void;
  handleMouseNavigationStart: () => void;
  handleMenuKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
};

export function useMenuKeyboardNavigation({
  itemCount,
  onEscape,
}: UseMenuKeyboardNavigationParams): UseMenuKeyboardNavigationResult {
  const menuRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  useEffect(() => {
    menuRef.current?.focus();
  }, []);

  const focusItem = useCallback(
    (index: number) => {
      if (itemCount === 0) return;
      const safeIndex = ((index % itemCount) + itemCount) % itemCount;
      itemRefs.current[safeIndex]?.focus();
    },
    [itemCount],
  );

  const handleMouseNavigationStart = () => {
    setIsKeyboardMode(false);
  };

  const handleNavigationKey = useCallback(
    (key: string, preventDefault: () => void): boolean => {
      const currentIndex = itemRefs.current.findIndex(
        (button) => button === document.activeElement,
      );

      if (key === "ArrowDown") {
        setIsKeyboardMode(true);
        preventDefault();
        focusItem(currentIndex < 0 ? 0 : currentIndex + 1);
        return true;
      }

      if (key === "ArrowUp") {
        setIsKeyboardMode(true);
        preventDefault();
        focusItem(currentIndex < 0 ? itemCount - 1 : currentIndex - 1);
        return true;
      }

      if (key === "Escape") {
        preventDefault();
        onEscape();
        return true;
      }

      return false;
    },
    [focusItem, itemCount, onEscape],
  );

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    handleNavigationKey(event.key, () => event.preventDefault());
  };

  useEffect(() => {
    const handleWindowKeyDown = (event: globalThis.KeyboardEvent) => {
      if (
        event.target instanceof Node &&
        menuRef.current?.contains(event.target)
      ) {
        return;
      }

      handleNavigationKey(event.key, () => event.preventDefault());
    };

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [handleNavigationKey]);

  const getItemRef =
    <T extends HTMLElement = HTMLButtonElement>(index: number) =>
    (node: T | null) => {
      itemRefs.current[index] = node;
    };

  return {
    menuRef,
    isKeyboardMode,
    getItemRef,
    handleMouseNavigationStart,
    handleMenuKeyDown,
  };
}
