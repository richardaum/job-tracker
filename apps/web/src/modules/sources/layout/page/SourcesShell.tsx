"use client";

import { SlotsProvider } from "@job-tracker/react-slots";
import { cn, Heading, Text } from "@job-tracker/ui";

import { DetailPageHeader } from "@/components/detail-page-header/DetailPageHeader";
import { SourcesHeaderActions } from "@/modules/sources/layout/sources-header.slots";

type SourcesShellProps = { children: React.ReactNode };
export function SourcesShell({ children }: SourcesShellProps) {
  return (
    <SlotsProvider>
      <div className={cn("flex h-full min-h-0 flex-col")}>
        <DetailPageHeader
          trailing={
            <SourcesHeaderActions.Slot
              className={cn("flex shrink-0 items-center gap-2 empty:hidden")}
            />
          }
        >
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
              "flex min-h-0 min-w-0 flex-1 flex-col items-stretch overflow-auto",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </SlotsProvider>
  );
}
