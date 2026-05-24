import {
  cn,
  Link,
  Tabs,
  TabsList,
  TabsTrigger,
  Tooltip,
} from "@job-tracker/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import NextLink from "next/link";
import React from "react";

import {
  jobDetailsNotesFocusPath,
  type JobSidePanel,
} from "@/modules/jobs/details/utils/job-details-routes";

import { HistoryPanelTabsContent } from "./HistoryPanel";
import { NotesPanelTabsContent } from "./NotesPanel";

export function ActivitySidePanel({
  jobId,
  sidePanel = "notes",
  onSidePanelChange,
  onSuccess,
  onError,
}: {
  jobId: string;
  sidePanel?: JobSidePanel;
  onSidePanelChange?: (sidePanel: JobSidePanel) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) {
  return (
    <Tabs
      value={sidePanel}
      onValueChange={(value) => onSidePanelChange?.(value as JobSidePanel)}
      className={cn("flex size-full min-h-0  flex-col")}
    >
      <TabsList className={cn("w-full")}>
        <TabsTrigger
          value="notes"
          asChild
          className={cn(
            "group flex-1 flex items-center justify-center gap-1.5",
          )}
        >
          <div>
            <span>Notes</span>
            <Tooltip content="Open full page">
              <Link
                variant="muted"
                asChild
                className={cn(
                  "opacity-0 transition-opacity group-hover:opacity-100 data-[state=active]:opacity-100 no-underline hover:no-underline",
                )}
              >
                <NextLink href={jobDetailsNotesFocusPath(jobId)}>
                  <ArrowSquareOutIcon size={14} weight="regular" />
                </NextLink>
              </Link>
            </Tooltip>
          </div>
        </TabsTrigger>
        <TabsTrigger value="history" className={cn("flex-1")}>
          History
        </TabsTrigger>
      </TabsList>

      <NotesPanelTabsContent jobId={jobId} className={cn("pt-3")} />
      <HistoryPanelTabsContent
        jobId={jobId}
        className={cn("pt-3")}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Tabs>
  );
}
