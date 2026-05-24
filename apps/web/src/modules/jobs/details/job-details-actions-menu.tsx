"use client";

import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

const JobActionsMenuItemsSetContext = createContext<
  ((items: React.ReactNode) => void) | null
>(null);

const JobActionsMenuItemsContentContext = createContext<React.ReactNode>(null);

/** Supplies tab-owned Actions dropdown fragments to the job details layout. */
export function JobActionsMenuItemsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<React.ReactNode>(null);

  return (
    <JobActionsMenuItemsSetContext.Provider value={setItems}>
      <JobActionsMenuItemsContentContext.Provider value={items}>
        {children}
      </JobActionsMenuItemsContentContext.Provider>
    </JobActionsMenuItemsSetContext.Provider>
  );
}

/** Renders inside the layout Actions dropdown so Radix Menu context is preserved. */
export function JobActionsMenuItemsOutlet() {
  return useContext(JobActionsMenuItemsContentContext);
}

/**
 * Tab content registers dropdown items here. Not a portal slot — Radix
 * `DropdownMenuItem` must mount under `DropdownMenu` in the React tree.
 */
export function RegisterJobActionsMenuItems({
  children,
}: {
  children: React.ReactNode;
}) {
  const setItems = useContext(JobActionsMenuItemsSetContext);
  if (!setItems) {
    throw new Error(
      "RegisterJobActionsMenuItems must be used within JobActionsMenuItemsProvider",
    );
  }

  useLayoutEffect(() => {
    setItems(children);
    return () => setItems(null);
  }, [children, setItems]);

  return null;
}
