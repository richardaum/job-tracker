"use client";

import { cn, TabsTrigger } from "@job-tracker/ui";
import type { Route } from "next";
import { SafeLink } from "@/components/safe-link";
import type { ReactNode } from "react";

type DetailsTabTriggerProps = { tab: string; href: Route; children: ReactNode; leadingIcon?: ReactNode };

export function DetailsTabTrigger({ tab, href, children, leadingIcon }: DetailsTabTriggerProps) {
  return (
    <TabsTrigger value={tab} asChild>
      <SafeLink href={href}>
        {leadingIcon && <span className={cn("mr-1.5 shrink-0")}>{leadingIcon}</span>}
        {children}
      </SafeLink>
    </TabsTrigger>
  );
}
