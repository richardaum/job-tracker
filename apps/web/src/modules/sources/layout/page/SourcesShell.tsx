"use client";

import {
  cn,
  Heading,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
} from "@job-tracker/ui";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import { DetailPageHeader } from "@/components/detail-page-header";

function deriveTab(pathname: string): string {
  if (pathname.startsWith("/sources/plans")) return "plans";
  return "profiles";
}

const TAB_ROUTES: Record<string, Route> = {
  plans: "/sources/plans",
  profiles: "/sources/profiles",
};

export function SourcesShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentTab = deriveTab(pathname);

  function navigateToTab(value: string) {
    const route = TAB_ROUTES[value] ?? "/sources/profiles";
    router.push(route);
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <DetailPageHeader>
        <Heading as="h1" size="2xl" className={cn("min-w-0")}>
          Sources
        </Heading>
        <Text size="sm" color="secondary">
          Import jobs automatically from external sources through structured
          plans.
        </Text>
      </DetailPageHeader>
      <div className={cn("flex min-h-0 flex-1 flex-col")}>
        <div
          className={cn(
            "flex w-full shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-border-subtle p-4 sm:p-6",
          )}
        >
          <Tabs
            value={currentTab}
            onValueChange={navigateToTab}
            className={cn("w-fit")}
          >
            <TabsList className={cn("w-full justify-start sm:w-fit")}>
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="profiles">Profiles</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col items-stretch overflow-auto",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
