import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger, cn } from "@job-tracker/ui";
import { HistoryPanel } from "./HistoryPanel";
import { NotesPanel } from "./NotesPanel";

export function ActivitySidePanel({
  applicationId,
  fillHeight = false,
  onSuccess,
  onError,
}: {
  applicationId: string;
  fillHeight?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) {
  return (
    <Tabs
      defaultValue="notes"
      className={cn("w-full", fillHeight && "flex h-full min-h-0 flex-col")}
    >
      <TabsList className={cn("w-full")}>
        <TabsTrigger value="notes" className={cn("flex-1")}>
          Notes
        </TabsTrigger>
        <TabsTrigger value="history" className={cn("flex-1")}>
          History
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="notes"
        className={cn(
          fillHeight && "mt-0! flex-1 min-h-0 overflow-hidden pt-3",
        )}
      >
        <NotesPanel applicationId={applicationId} fillHeight={fillHeight} />
      </TabsContent>

      <TabsContent
        value="history"
        className={cn(
          fillHeight && "mt-0! flex-1 min-h-0 overflow-hidden pt-3",
        )}
      >
        <HistoryPanel
          applicationId={applicationId}
          fillHeight={fillHeight}
          onSuccess={onSuccess}
          onError={onError}
        />
      </TabsContent>
    </Tabs>
  );
}
