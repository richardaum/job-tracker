"use client";

import { cn, Tabs, TabsList, TabsTrigger } from "@job-tracker/ui";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import { AdminSubtabsSlot } from "@/modules/admin/layout/admin-header.slots";

const SUB_TAB_ROUTES: Record<string, Route> = { status: "/admin/extension/status", events: "/admin/extension/events" };

function deriveSubTab(pathname: string): string {
  return pathname.startsWith("/admin/extension/events") ? "events" : "status";
}

const subTabTriggerClass = cn("data-[state=active]:bg-bg-info-subtle data-[state=active]:text-text-brand");

export function ExtensionSubTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const currentSubTab = deriveSubTab(pathname);

  function handleChange(value: string) {
    router.push(SUB_TAB_ROUTES[value] ?? SUB_TAB_ROUTES.status);
  }

  return (
    <AdminSubtabsSlot>
      <Tabs value={currentSubTab} onValueChange={handleChange} className={cn("w-fit")}>
        <TabsList className={cn("border-border-brand/40")}>
          <TabsTrigger value="status" className={subTabTriggerClass}>
            Status
          </TabsTrigger>
          <TabsTrigger value="events" className={subTabTriggerClass}>
            Events
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </AdminSubtabsSlot>
  );
}
