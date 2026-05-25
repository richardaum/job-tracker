"use client";

import { SlotsProvider } from "@job-tracker/react-slots";
import { cn, Heading, Tabs, TabsList, TabsTrigger } from "@job-tracker/ui";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header";
import {
  AdminHeaderActions,
  AdminSubTabs,
} from "@/modules/admin/layout/admin-header.slots";

function deriveTab(pathname: string): string {
  if (pathname.startsWith("/admin/overview")) return "overview";
  return "extension";
}

const TAB_ROUTES: Record<string, Route> = {
  extension: "/admin",
  overview: "/admin/overview",
};

function AdminTabBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex w-full shrink-0 flex-wrap items-center gap-x-4 gap-y-2",
      )}
    >
      {children}
      <AdminSubTabs.Slot className={cn("empty:hidden")} />
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentTab = deriveTab(pathname);

  function navigateToTab(value: string) {
    const route = TAB_ROUTES[value] ?? "/admin";
    router.push(route);
  }

  return (
    <SlotsProvider>
      <div className={cn("flex h-full min-h-0 flex-col")}>
        <DetailPageHeader
          trailing={
            <AdminHeaderActions.Slot
              className={cn("flex shrink-0 items-center gap-2 empty:hidden")}
            />
          }
        >
          <BackToLink href="/jobs">Back to jobs</BackToLink>
          <Heading as="h1" size="2xl" className={cn("min-w-0")}>
            Admin
          </Heading>
        </DetailPageHeader>
        <div className={cn("flex flex-1 min-h-0 flex-col gap-4 p-4 sm:p-6")}>
          <AdminTabBar>
            <Tabs
              value={currentTab}
              onValueChange={navigateToTab}
              className={cn("w-fit")}
            >
              <TabsList className={cn("w-full justify-start sm:w-fit")}>
                <TabsTrigger value="extension">Extension</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>
            </Tabs>
          </AdminTabBar>
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col items-stretch overflow-auto pe-2 pb-1 text-start",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </SlotsProvider>
  );
}
