"use client";

import { RefObject, useEffect, useLayoutEffect, useRef } from "react";

interface UseScrollRestorationOptions {
  key: string;
  containerRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  ready?: boolean;
}

interface ScrollSnapshot {
  top: number;
}

const STORAGE_PREFIX = "scroll-restoration:";

function getStorageKey(key: string) {
  return `${STORAGE_PREFIX}${key}`;
}

function readSnapshot(key: string): ScrollSnapshot | null {
  if (typeof window === "undefined") return null;

  const rawValue = window.sessionStorage.getItem(getStorageKey(key));
  if (!rawValue) return null;

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<ScrollSnapshot>;
    if (typeof parsedValue.top !== "number") return null;
    return { top: Math.max(0, parsedValue.top) };
  } catch {
    return null;
  }
}

function writeSnapshot(key: string, snapshot: ScrollSnapshot) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(getStorageKey(key), JSON.stringify(snapshot));
  } catch {
    // Ignore storage errors (private mode, quota, etc).
  }
}

function clearSnapshot(key: string) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(getStorageKey(key));
  } catch {
    // Ignore storage errors (private mode, quota, etc).
  }
}

export function useScrollRestoration({
  key,
  containerRef,
  enabled = true,
  ready = true,
}: UseScrollRestorationOptions) {
  const didRestoreRef = useRef(false);
  const lastSavedTopRef = useRef(0);
  const suppressNextScrollPersistRef = useRef(false);

  useEffect(() => {
    didRestoreRef.current = false;
  }, [key]);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    let frameId: number | null = null;

    function persistScrollPosition() {
      if (suppressNextScrollPersistRef.current) {
        suppressNextScrollPersistRef.current = false;
        return;
      }

      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        const currentContainer = containerRef.current;
        if (!currentContainer) return;
        lastSavedTopRef.current = currentContainer.scrollTop;
        writeSnapshot(key, { top: lastSavedTopRef.current });
      });
    }

    container.addEventListener("scroll", persistScrollPosition, {
      passive: true,
    });

    return () => {
      container.removeEventListener("scroll", persistScrollPosition);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      const cleanupTop =
        lastSavedTopRef.current > 0
          ? lastSavedTopRef.current
          : container.scrollTop;
      const existingSnapshot = readSnapshot(key);
      const shouldPreserveExistingSnapshot =
        cleanupTop === 0 &&
        typeof existingSnapshot?.top === "number" &&
        existingSnapshot.top > 0;
      const finalTop = shouldPreserveExistingSnapshot
        ? existingSnapshot.top
        : cleanupTop;

      writeSnapshot(key, { top: finalTop });
    };
  }, [containerRef, enabled, key]);

  useLayoutEffect(() => {
    if (!enabled || !ready || didRestoreRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const snapshot = readSnapshot(key);
    if (!snapshot) {
      didRestoreRef.current = true;
      return;
    }

    // If this list becomes virtualized in the future, revisit this restoration flow:
    // pixel-only restore may be inaccurate. A more robust strategy is hybrid:
    // restore by px when possible and also locate/anchor the previously visited item.
    if (container.scrollHeight <= container.clientHeight) return;

    suppressNextScrollPersistRef.current = true;
    container.scrollTo({ top: snapshot.top });
    clearSnapshot(key);
    didRestoreRef.current = true;
  }, [containerRef, enabled, key, ready]);
}
