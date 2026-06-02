"use client";

import { TabsTrigger } from "@job-tracker/ui";
import type { Route } from "next";
import NextLink from "next/link";
import type { ReactNode } from "react";

type DetailsTabTriggerProps = { tab: string; href: Route; children: ReactNode; leadingIcon?: ReactNode };

export function DetailsTabTrigger({ tab, href, children, leadingIcon }: DetailsTabTriggerProps) {
  return (
    <TabsTrigger value={tab} asChild>
      <NextLink href={href}>
        {leadingIcon && <span className="mr-1.5 shrink-0">{leadingIcon}</span>}
        {children}
      </NextLink>
    </TabsTrigger>
  );
}
