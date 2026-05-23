"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";

type Setter = (actions: ReactNode | null) => void;

export const ProfileHeaderActionsContext = createContext<Setter>(() => {});

export function useSetProfileHeaderActions(actions: ReactNode | null) {
  const setActions = useContext(ProfileHeaderActionsContext);

  useEffect(() => {
    setActions(actions);
    return () => {
      setActions(null);
    };
  }, [actions, setActions]);
}
