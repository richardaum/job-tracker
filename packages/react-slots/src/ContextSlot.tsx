"use client";

import { type PropsWithChildren, useContext, useLayoutEffect, useSyncExternalStore } from "react";

import { ContextSlotsContext } from "./ContextSlotsProvider";

function useContextSlotsRegistry() {
  const registry = useContext(ContextSlotsContext);
  if (!registry) {
    throw new Error("ContextSlot must be used within a SlotsProvider (or ContextSlotsProvider)");
  }
  return registry;
}

/**
 * Registers tab-owned UI that must render under a layout ancestor (e.g. Radix Menu).
 *
 * Returns a Fill/Slot pair. Memoize `children` passed to Fill when the element tree
 * is recreated each render to avoid unnecessary registry updates.
 */
export function ContextSlot(name: string) {
  const id = Symbol(name);

  const Slot = function Slot() {
    const registry = useContextSlotsRegistry();
    const content = useSyncExternalStore(
      registry.subscribe,
      () => registry.get(id) ?? null,
      () => null,
    );

    return content;
  };

  /** Registers slot content in the nearest context-slots registry. */
  const Fill = function Fill({ children }: PropsWithChildren) {
    const registry = useContextSlotsRegistry();

    useLayoutEffect(() => {
      registry.set(id, children);
      return () => {
        if (registry.get(id) === children) {
          registry.delete(id);
        }
      };
    }, [registry, children]);

    return null;
  };

  return Object.assign(Fill, { Slot });
}
