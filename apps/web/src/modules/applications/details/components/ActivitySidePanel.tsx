import React from "react";
import { Tabs, TabsList, TabsTrigger, cn } from "@job-tracker/ui";
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
        <TabsTrigger value="notes" className={cn("flex-1")}>
          Notes
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
