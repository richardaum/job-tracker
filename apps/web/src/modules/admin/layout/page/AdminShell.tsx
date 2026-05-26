"use client";

import { SlotsProvider } from "@job-tracker/react-slots";
import { cn, Heading, Tabs, TabsList, TabsTrigger } from "@job-tracker/ui";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header";
import { AdminHeaderActions } from "@/modules/admin/layout/admin-header.slots";

function deriveTab(pathname: string): string {
  if (pathname.startsWith("/admin/overview")) return "overview";
  return "extension";
}

function deriveExtensionSubTab(pathname: string): string {
  if (pathname.startsWith("/admin/extension/events")) return "events";
  return "status";
}

const TAB_ROUTES: Record<string, Route> = {
  extension: "/admin/extension/status",
  overview: "/admin/overview",
};

const EXTENSION_SUB_TAB_ROUTES: Record<string, Route> = {
  status: "/admin/extension/status",
  events: "/admin/extension/events",
};

const extensionSubTabTriggerClass = cn(
  "data-[state=active]:bg-bg-info-subtle data-[state=active]:text-text-brand",
);

function AdminTabBar({
  currentTab,
  currentExtensionSubTab,
  onPrimaryTabChange,
  onExtensionSubTabChange,
}: {
  currentTab: string;
  currentExtensionSubTab: string;
  onPrimaryTabChange: (value: string) => void;
  onExtensionSubTabChange: (value: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex w-full shrink-0 flex-wrap items-center gap-x-4 gap-y-2",
      )}
    >
      <Tabs
        value={currentTab}
        onValueChange={onPrimaryTabChange}
        className={cn("w-fit")}
      >
        <TabsList className={cn("w-full justify-start sm:w-fit")}>
          <TabsTrigger value="extension">Extension</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
      </Tabs>

      {currentTab === "extension" ? (
        <Tabs
          value={currentExtensionSubTab}
          onValueChange={onExtensionSubTabChange}
          className={cn("w-fit")}
        >
          <TabsList className={cn("border-border-brand/40")}>
            <TabsTrigger value="status" className={extensionSubTabTriggerClass}>
              Status
            </TabsTrigger>
            <TabsTrigger value="events" className={extensionSubTabTriggerClass}>
              Events
            </TabsTrigger>
          </TabsList>
        </Tabs>
      ) : null}
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentTab = deriveTab(pathname);
  const currentExtensionSubTab = deriveExtensionSubTab(pathname);

  function navigateToTab(value: string) {
    const route = TAB_ROUTES[value] ?? "/admin/extension/status";
    router.push(route);
  }

  function navigateToExtensionSubTab(value: string) {
    const route = EXTENSION_SUB_TAB_ROUTES[value] ?? "/admin/extension/status";
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
          <AdminTabBar
            currentTab={currentTab}
            currentExtensionSubTab={currentExtensionSubTab}
            onPrimaryTabChange={navigateToTab}
            onExtensionSubTabChange={navigateToExtensionSubTab}
          />
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
