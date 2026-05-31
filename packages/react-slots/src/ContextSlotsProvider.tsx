"use client";

import { createContext, type PropsWithChildren, useMemo } from "react";

import { ContextSlotsRegistry } from "./ContextSlotsRegistry";

export const ContextSlotsContext = createContext<ContextSlotsRegistry | null>(
  null,
);

export function ContextSlotsProvider({ children }: PropsWithChildren) {
  const registry = useMemo(() => new ContextSlotsRegistry(), []);

  return (
    <ContextSlotsContext.Provider value={registry}>
      {children}
    </ContextSlotsContext.Provider>
  );
}
