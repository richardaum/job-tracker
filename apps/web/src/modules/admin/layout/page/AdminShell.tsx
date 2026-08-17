"use client";

import { SlotsProvider } from "@job-tracker/react-slots";
import { cn, Heading, Tabs, TabsList, TabsTrigger, Text } from "@job-tracker/ui";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header/DetailPageHeader";
import { Role } from "@/gql/graphql";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { AdminHeaderActions, AdminSubtabsSlot } from "@/modules/admin/layout/admin-header.slots";

const NON_ADMIN_REDIRECT_ROUTE: Route = "/jobs";

function deriveTab(pathname: string): string {
  if (pathname.startsWith("/admin/overview")) return "overview";
  if (pathname.startsWith("/admin/users")) return "users";
  if (pathname.startsWith("/admin/registrations")) return "registrations";
  return "extension";
}

const TAB_ROUTES: Record<string, Route> = {
  extension: "/admin/extension/status",
  overview: "/admin/overview",
  users: "/admin/users",
  registrations: "/admin/registrations",
};

type AdminTabBarProps = { currentTab: string; onPrimaryTabChange: (value: string) => void };

function AdminTabBar({ currentTab, onPrimaryTabChange }: AdminTabBarProps) {
  return (
    <div className={cn("flex w-full shrink-0 flex-wrap items-center gap-x-4 gap-y-2")}>
      <Tabs value={currentTab} onValueChange={onPrimaryTabChange} className={cn("w-fit")}>
        <TabsList className={cn("w-full justify-start sm:w-fit")}>
          <TabsTrigger value="extension">Extension</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tab-owned sub-navigation (e.g. Extension's Status/Events, Registrations' status filter) fills this. */}
      <AdminSubtabsSlot.Slot className={cn("flex w-fit items-center empty:hidden")} />
    </div>
  );
}

type AdminShellProps = { children: React.ReactNode };

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const isAdmin = user?.role === Role.Admin;
  const currentTab = deriveTab(pathname);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace(NON_ADMIN_REDIRECT_ROUTE);
    }
  }, [loading, isAdmin, router]);

  function navigateToTab(value: string) {
    const route = TAB_ROUTES[value] ?? "/admin/extension/status";
    router.push(route);
  }

  if (loading || !isAdmin) {
    return (
      <div className={cn("flex h-full min-h-0 flex-1 items-center justify-center")}>
        <Text as="span" size="sm" color="secondary">
          Loading…
        </Text>
      </div>
    );
  }

  return (
    <SlotsProvider>
      <div className={cn("flex h-full min-h-0 flex-col")}>
        <DetailPageHeader
          trailing={<AdminHeaderActions.Slot className={cn("flex shrink-0 items-center gap-2 empty:hidden")} />}
        >
          <BackToLink href="/jobs">Back to jobs</BackToLink>
          <Heading as="h1" size="2xl" className={cn("min-w-0")}>
            Admin
          </Heading>
        </DetailPageHeader>
        <div className={cn("flex flex-1 min-h-0 flex-col gap-4 p-4 sm:p-6")}>
          <AdminTabBar currentTab={currentTab} onPrimaryTabChange={navigateToTab} />
          <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col items-stretch overflow-auto pe-2 pb-1 text-start")}>
            {children}
          </div>
        </div>
      </div>
    </SlotsProvider>
  );
}
