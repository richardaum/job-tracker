"use client";

import { useEffect, useState } from "react";

type OverflowSubscription = (onSync: () => void) => () => void;

interface UseHasVerticalOverflowOptions {
  epsilon?: number;
  subscribe?: OverflowSubscription;
}

export function useHasVerticalOverflow(
  element: HTMLElement | null,
  { epsilon = 1, subscribe }: UseHasVerticalOverflowOptions = {},
) {
  const [hasVerticalOverflow, setHasVerticalOverflow] = useState(false);

  useEffect(() => {
    if (!element) {
      return;
    }

    const syncOverflowState = () => {
      setHasVerticalOverflow(
        element.scrollHeight > element.clientHeight + epsilon,
      );
    };

    syncOverflowState();

    const unsubscribe = subscribe?.(syncOverflowState);
    const resizeObserver = new ResizeObserver(syncOverflowState);
    resizeObserver.observe(element);
    window.addEventListener("resize", syncOverflowState);

    return () => {
      unsubscribe?.();
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncOverflowState);
    };
  }, [element, epsilon, subscribe]);

  return element ? hasVerticalOverflow : false;
}
