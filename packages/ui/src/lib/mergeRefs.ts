import type { Ref, RefCallback } from "react";

export function mergeRefs<T>(...refs: (Ref<T> | undefined | null)[]): RefCallback<T> {
  return (element: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(element);
      } else {
        (ref as { current: T | null }).current = element;
      }
    }
  };
}
