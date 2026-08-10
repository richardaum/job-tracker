"use client";

import { useContext } from "react";

import { WelcomeTourContext } from "./welcomeTour.context";

export function useWelcomeTour() {
  const context = useContext(WelcomeTourContext);

  if (!context) throw new Error("useWelcomeTour must be used within WelcomeTourProvider.");

  return context;
}
