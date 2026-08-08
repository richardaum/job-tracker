"use client";

import { cn, TabsTrigger } from "@job-tracker/ui";
import type { Route } from "next";
import { SafeLink } from "@/components/safe-link";
import { JOB_DETAILS_LINK_QUERY_PARAMS } from "@/modules/jobs/details/utils/job-details-url";
import type { ComponentProps, ReactNode } from "react";

type DetailsTabTriggerProps = Omit<ComponentProps<typeof SafeLink>, "href" | "children" | "preserveQueryParams"> & {
  tab: string;
  href: Route;
  children: ReactNode;
  leadingIcon?: ReactNode;
};

export function DetailsTabTrigger({ tab, href, children, leadingIcon, ...linkProps }: DetailsTabTriggerProps) {
  return (
    <TabsTrigger value={tab} asChild>
      <SafeLink href={href} preserveQueryParams={JOB_DETAILS_LINK_QUERY_PARAMS} {...linkProps}>
        {leadingIcon && <span className={cn("mr-1.5 shrink-0")}>{leadingIcon}</span>}
        {children}
      </SafeLink>
    </TabsTrigger>
  );
}
