"use client";

import {
  type HTMLAttributes,
  type PropsWithChildren,
  useContext,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import { PortalSlotsContext } from "./PortalSlotsProvider";

function usePortalSlotsRegistry() {
  const registry = useContext(PortalSlotsContext);
  if (!registry) {
    throw new Error("PortalSlot must be used within a SlotsProvider (or PortalSlotsProvider)");
  }
  return registry;
}

/**
 * Teleports tab-owned UI into a layout DOM target (e.g. job detail header).
 *
 * Returns a Fill/Slot pair. Fill renders via createPortal; Slot registers the
 * mount point in the nearest portal-slots registry.
 */
export function PortalSlot(name = "portal") {
  const id = Symbol(name);

  const Slot = function Slot({
    children,
    className = "",
    ...props
  }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
    const slotRef = useRef<HTMLDivElement>(null);
    const registry = usePortalSlotsRegistry();

    useLayoutEffect(() => {
      const slot = slotRef.current;
      if (!slot) return;

      registry.set(id, slot);
      return () => {
        if (registry.get(id) === slot) {
          registry.delete(id);
        }
      };
    }, [registry]);

    return (
      <div ref={slotRef} className={`react-slots-portal ${name} ${className}`.trim()} {...props}>
        {children}
      </div>
    );
  };

  /** Portals children into the nearest matching Slot mount point. */
  const Fill = function Fill({ children }: PropsWithChildren) {
    const registry = usePortalSlotsRegistry();
    // Slot mounts are held in an external registry, so this subscription rerenders the fill when its portal target appears or changes.
    const slot = useSyncExternalStore(
      registry.subscribe,
      () => registry.get(id),
      () => undefined,
    );

    if (!slot) return null;
    return createPortal(children, slot);
  };

  return Object.assign(Fill, { Slot });
}
