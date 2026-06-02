import { cn, Tabs, TabsList } from "@job-tracker/ui";
import { Fragment, type ReactElement, type ReactNode } from "react";

import type { JobSidePanel } from "@/modules/jobs/details/utils/job-details-routes";

type TabEntry = { trigger: ReactElement; content: ReactNode };

type ActivitySidePanelTabsProps = {
  sidePanel: JobSidePanel;
  onSidePanelChange: (sidePanel: JobSidePanel) => void;
  tabs: Record<JobSidePanel, TabEntry>;
};

function ActivitySidePanelTabs({ sidePanel, onSidePanelChange, tabs }: ActivitySidePanelTabsProps) {
  const entries = Object.entries(tabs) as [JobSidePanel, TabEntry][];

  return (
    <Tabs
      value={sidePanel}
      onValueChange={(value) => onSidePanelChange(value as JobSidePanel)}
      className={cn("flex size-full min-h-0 flex-col")}
    >
      <TabsList className={cn("w-full")}>
        {entries.map(([value, tab]) => (
          <Fragment key={value}>{tab.trigger}</Fragment>
        ))}
      </TabsList>
      {entries.map(([value, tab]) => (
        <Fragment key={value}>{tab.content}</Fragment>
      ))}
    </Tabs>
  );
}

export { ActivitySidePanelTabs };
