"use client";

import { useContext } from "react";

import { WelcomeTourSessionContext } from "@/modules/welcome-tour/welcomeTourSession.context";

export function useWelcomeTourSession() {
  const context = useContext(WelcomeTourSessionContext);

  if (!context) throw new Error("useWelcomeTourSession must be used within WelcomeTourSessionProvider.");

  return context;
}
