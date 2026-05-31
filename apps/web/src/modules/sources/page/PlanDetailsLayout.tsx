"use client";

import { SlotsProvider } from "@job-tracker/react-slots";
import { cn, Tabs, TabsList, TabsTrigger, Text } from "@job-tracker/ui";
import type { Route } from "next";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";
import type { ReactNode } from "react";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header/DetailPageHeader";
import { EntityNotFound } from "@/components/entity-not-found";
import { usePlanQuery } from "@/gql/hooks";
import {
  PlanHeaderActions,
  PlanTabDescription,
} from "@/modules/sources/page/plan-details-header.slots";

function parsePlanTab(pathname: string): string {
  if (pathname.endsWith("/document")) return "document";
  return "templates";
}

type PlanDetailsLayoutProps = {
  children: ReactNode;
  params: Promise<{ planId: string }>;
};

export default function PlanDetailsLayout({
  children,
  params,
}: PlanDetailsLayoutProps) {
  const { planId } = use(params);
  const pathname = usePathname();
  const activeTab = parsePlanTab(pathname);
  const { data, loading } = usePlanQuery({ variables: { id: planId } });
  const plan = data?.plan ?? null;

  return (
    <SlotsProvider>
      <div className={cn("flex h-full min-h-0 flex-col")}>
        <DetailPageHeader
          trailing={
            <PlanHeaderActions.Slot
              className={cn("flex shrink-0 items-center gap-2 empty:hidden")}
            />
          }
        >
          <BackToLink
            href={"/sources/plans" as Route}
            className={cn("self-start")}
          >
            Back to plans
          </BackToLink>
          <DetailPageHeader.Title>
            {plan?.displayName ?? "Plan"}
          </DetailPageHeader.Title>
          <DetailPageHeader.Description>
            <PlanTabDescription.Slot className={cn("empty:hidden")} />
          </DetailPageHeader.Description>
        </DetailPageHeader>
        <div className={cn("flex flex-1 min-h-0 flex-col gap-4 p-4 sm:p-6")}>
          {plan && (
            <Tabs value={activeTab}>
              <TabsList>
                <TabsTrigger value="templates" asChild>
                  <NextLink href={`/sources/plans/${planId}`}>
                    Templates
                  </NextLink>
                </TabsTrigger>
                <TabsTrigger value="document" asChild>
                  <NextLink href={`/sources/plans/${planId}/document` as Route}>
                    Document
                  </NextLink>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col overflow-auto pe-2 pb-1 text-start",
            )}
          >
            {loading ? (
              <div className={cn("flex h-full items-center justify-center")}>
                <Text color="secondary">Loading...</Text>
              </div>
            ) : !plan ? (
              <EntityNotFound
                resource="plan"
                backHref="/sources/plans"
                backLabel="Back to plans"
              />
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </SlotsProvider>
  );
}
