import { useEffect, useRef, useState } from "react";

import { isDuplicatePaste } from "./pasteTextDedupe";

export type PasteItem = {
  id: string;
  pastedAt: number;
  text: string;
  html: string | null;
};

export interface PasteCaptureDeps {
  now: () => number;
  uuid: () => string;
}

export interface UsePasteCaptureOptions {
  enabled?: boolean;
  maxItems?: number;
  deps?: Partial<PasteCaptureDeps>;
  onDuplicatePaste?: () => void;
}

export interface UsePasteCaptureResult {
  isPageFocused: boolean;
  pastes: PasteItem[];
}

const DEFAULT_DEPS: PasteCaptureDeps = {
  now: () => Date.now(),
  uuid: () => crypto.randomUUID(),
};

function toPreviewTextFromHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body.textContent ?? "";
}

export function usePasteCapture(
  options?: UsePasteCaptureOptions,
): UsePasteCaptureResult {
  const [pastes, setPastes] = useState<PasteItem[]>([]);
  const [isPageFocused, setIsPageFocused] = useState(false);
  const pastesRef = useRef<PasteItem[]>([]);
  const onDuplicatePasteRef = useRef<(() => void) | undefined>(
    options?.onDuplicatePaste,
  );

  const maxItems = options?.maxItems;
  const enabled = options?.enabled ?? true;
  const now = options?.deps?.now ?? DEFAULT_DEPS.now;
  const uuid = options?.deps?.uuid ?? DEFAULT_DEPS.uuid;

  useEffect(() => {
    pastesRef.current = pastes;
  }, [pastes]);

  useEffect(() => {
    onDuplicatePasteRef.current = options?.onDuplicatePaste;
  }, [options?.onDuplicatePaste]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const syncFocus = () => {
      const visible = document.visibilityState === "visible";
      const focused = document.hasFocus();
      setIsPageFocused(visible && focused);
    };

    const handlePaste = (event: ClipboardEvent) => {
      if (!document.hasFocus() || document.visibilityState !== "visible") {
        return;
      }

      const html = event.clipboardData?.getData("text/html") ?? "";
      const plainText = event.clipboardData?.getData("text/plain") ?? "";
      const text = plainText || (html ? toPreviewTextFromHtml(html) : "");
      const current = pastesRef.current;

      if (isDuplicatePaste(text, current)) {
        onDuplicatePasteRef.current?.();
        return;
      }

      const next = [
        { id: uuid(), pastedAt: now(), text, html: html || null },
        ...current,
      ];
      const hasItemLimit = typeof maxItems === "number" && maxItems > 0;
      const boundedNext = hasItemLimit ? next.slice(0, maxItems) : next;
      pastesRef.current = boundedNext;
      setPastes(boundedNext);
    };

    syncFocus();
    window.addEventListener("focus", syncFocus);
    window.addEventListener("blur", syncFocus);
    document.addEventListener("visibilitychange", syncFocus);
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("focus", syncFocus);
      window.removeEventListener("blur", syncFocus);
      document.removeEventListener("visibilitychange", syncFocus);
      window.removeEventListener("paste", handlePaste);
    };
  }, [enabled, maxItems, now, uuid]);

  return { isPageFocused: enabled && isPageFocused, pastes };
}
