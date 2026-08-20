"use client";

import { cn, Tabs, TabsList, TabsTrigger } from "@job-tracker/ui";
import type { Route } from "next";
import { useRouter } from "next/navigation";

import { ProfileSubTabs } from "@/modules/profile/layout/profile-header.slots";

type AiProfileTab = "usage" | "settings";

const AI_TAB_ROUTES: Record<AiProfileTab, Route> = { usage: "/profile/ai-usage", settings: "/profile/ai/settings" };

type AiProfileSubTabsProps = { activeTab: AiProfileTab };

export function AiProfileSubTabs({ activeTab }: AiProfileSubTabsProps) {
  const router = useRouter();

  function navigateToTab(tab: string) {
    if (isAiProfileTab(tab)) router.push(AI_TAB_ROUTES[tab]);
  }

  return (
    <ProfileSubTabs>
      <Tabs value={activeTab} onValueChange={navigateToTab}>
        <TabsList className={cn("w-fit")}>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
    </ProfileSubTabs>
  );
}

function isAiProfileTab(value: string): value is AiProfileTab {
  return value === "usage" || value === "settings";
}
