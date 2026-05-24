"use client";

import type { PropsWithChildren } from "react";

import { ContextSlotsProvider } from "./ContextSlotsProvider";
import { PortalSlotsProvider } from "./PortalSlotsProvider";

/** Wraps portal slots (DOM teleport) and context slots (React tree outlet). */
export function SlotsProvider({ children }: PropsWithChildren) {
  return (
    <PortalSlotsProvider>
      <ContextSlotsProvider>{children}</ContextSlotsProvider>
    </PortalSlotsProvider>
  );
}
