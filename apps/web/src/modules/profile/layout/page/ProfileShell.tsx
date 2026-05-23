"use client";

import { cn, Heading, Tabs, TabsList, TabsTrigger } from "@job-tracker/ui";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header";
import { ProfileHeaderActionsContext } from "@/modules/profile/layout/hooks/useProfileHeaderActions";

function deriveTab(pathname: string): string {
  if (pathname.startsWith("/profile/settings")) return "settings";
  if (pathname.startsWith("/profile/resumes")) return "resumes";
  if (pathname.startsWith("/profile/preferences")) return "preferences";
  return "identity";
}

const TAB_ROUTES: Record<string, string> = {
  identity: "/profile",
  settings: "/profile/settings",
  resumes: "/profile/resumes",
  preferences: "/profile/preferences",
};

export function ProfileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentTab = deriveTab(pathname);
  const [headerActions, setHeaderActions] = useState<ReactNode | null>(null);

  function navigateToTab(value: string) {
    const route = TAB_ROUTES[value] ?? "/profile";
    router.push(route);
  }

  return (
    <ProfileHeaderActionsContext.Provider value={setHeaderActions}>
      <div className={cn("flex h-full min-h-0 flex-col")}>
        <DetailPageHeader trailing={headerActions ?? undefined}>
          <BackToLink href="/jobs">Back to jobs</BackToLink>
          <Heading as="h1" size="2xl" className={cn("min-w-0")}>
            Profile
          </Heading>
        </DetailPageHeader>
        <div className={cn("flex flex-1 min-h-0 flex-col gap-4 p-4 sm:p-6")}>
          <Tabs
            value={currentTab}
            onValueChange={navigateToTab}
            className={cn("w-full")}
          >
            <TabsList className={cn("w-full justify-start sm:w-fit")}>
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="resumes">Resumes</TabsTrigger>
              <TabsTrigger value="preferences">Work Preferences</TabsTrigger>
            </TabsList>
          </Tabs>
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col items-stretch px-1 text-start",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </ProfileHeaderActionsContext.Provider>
  );
}
