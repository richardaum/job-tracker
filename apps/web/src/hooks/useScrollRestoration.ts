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

export function useScrollRestoration({
  key,
  containerRef,
  enabled = true,
  ready = true,
}: UseScrollRestorationOptions) {
  const didRestoreRef = useRef(false);

  useEffect(() => {
    didRestoreRef.current = false;
  }, [key]);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    let frameId: number | null = null;

    function persistScrollPosition() {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        const currentContainer = containerRef.current;
        if (!currentContainer) return;
        writeSnapshot(key, { top: currentContainer.scrollTop });
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

      writeSnapshot(key, { top: container.scrollTop });
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

    if (container.scrollHeight <= container.clientHeight) return;

    container.scrollTop = snapshot.top;
    didRestoreRef.current = true;
  }, [containerRef, enabled, key, ready]);
}
