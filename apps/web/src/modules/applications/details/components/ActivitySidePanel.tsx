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

import { HistoryPanelTabsContent } from "./HistoryPanel";
import { NotesPanelTabsContent } from "./NotesPanel";

export function ActivitySidePanel({
  applicationId,
  onSuccess,
  onError,
}: {
  applicationId: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) {
  return (
    <Tabs
      defaultValue="notes"
      className={cn("flex h-full min-h-0 w-full flex-col")}
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
                <NextLink href={`/applications/${applicationId}/notes`}>
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

      <NotesPanelTabsContent applicationId={applicationId} className="pt-3" />
      <HistoryPanelTabsContent
        applicationId={applicationId}
        className="pt-3"
        onSuccess={onSuccess}
        onError={onError}
      />
    </Tabs>
  );
}
