"use client";

import { cn } from "@job-tracker/ui";
import React from "react";

export default function PlanDetailLayout({ children }: { children: React.ReactNode }) {
  return <div className={cn("flex h-full min-h-0 flex-col")}>{children}</div>;
}
