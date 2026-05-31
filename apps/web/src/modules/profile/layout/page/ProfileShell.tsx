"use client";

import { cn, Heading, Tabs, TabsList, TabsTrigger } from "@job-tracker/ui";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { PortalSlotsProvider } from "react-portalslots";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header/DetailPageHeader";
import {
  ProfileHeaderActions,
  ProfileSubTabs,
} from "@/modules/profile/layout/profile-header.slots";

function deriveTab(pathname: string): string {
  if (pathname.startsWith("/profile/blocked-keywords"))
    return "blocked-keywords";
  if (pathname.startsWith("/profile/settings")) return "settings";
  if (pathname.startsWith("/profile/resumes")) return "resumes";
  if (pathname.startsWith("/profile/preferences")) return "preferences";
  return "identity";
}

const TAB_ROUTES: Record<string, Route> = {
  identity: "/profile",
  settings: "/profile/settings",
  resumes: "/profile/resumes",
  preferences: "/profile/preferences",
  "blocked-keywords": "/profile/blocked-keywords",
};

type ProfileShellProps = { children: React.ReactNode };
export function ProfileShell({ children }: ProfileShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentTab = deriveTab(pathname);

  function navigateToTab(value: string) {
    const route = TAB_ROUTES[value] ?? "/profile";
    router.push(route);
  }

  return (
    <PortalSlotsProvider>
      <div className={cn("flex h-full min-h-0 flex-col")}>
        <DetailPageHeader
          trailing={
            <ProfileHeaderActions.Slot
              className={cn("flex shrink-0 items-center gap-2 empty:hidden")}
            />
          }
        >
          <BackToLink href="/jobs">Back to jobs</BackToLink>
          <Heading as="h1" size="2xl" className={cn("min-w-0")}>
            Profile
          </Heading>
        </DetailPageHeader>
        <div className={cn("flex flex-1 min-h-0 flex-col gap-4 p-4 sm:p-6")}>
          <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2")}>
            <Tabs
              value={currentTab}
              onValueChange={navigateToTab}
              className={cn("w-full sm:w-fit")}
            >
              <TabsList className={cn("w-full justify-start sm:w-fit")}>
                <TabsTrigger value="identity">Identity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="resumes">Resumes</TabsTrigger>
                <TabsTrigger value="preferences">Work Preferences</TabsTrigger>
                <TabsTrigger value="blocked-keywords">
                  Blocked Keywords
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <ProfileSubTabs.Slot className={cn("empty:hidden")} />
          </div>
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col items-stretch overflow-auto pe-4 sm:pe-6 text-start",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </PortalSlotsProvider>
  );
}
