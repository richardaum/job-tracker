"use client";

import { cn } from "@job-tracker/ui";
import type { ReactNode } from "react";

type PlanDetailLayoutProps = { children: ReactNode };
export default function PlanDetailLayout({ children }: PlanDetailLayoutProps) {
  return <div className={cn("flex h-full min-h-0 flex-col")}>{children}</div>;
}
