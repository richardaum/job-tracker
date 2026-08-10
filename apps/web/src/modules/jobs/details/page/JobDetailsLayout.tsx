"use client";

import { SlotsProvider } from "@job-tracker/react-slots";
import { cn, Tabs, TabsList, Text } from "@job-tracker/ui";
import type { ReactNode } from "react";
import { use, useRef, useState } from "react";

import { EntityNotFound } from "@/components/entity-not-found";
import type { ApplicationStage } from "@/gql/hooks";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import type { EntityDetailViewStatus } from "@/lib/entity-detail-view-status";
import { ActivitySidePanelTabs } from "@/modules/jobs/details/components/ActivitySidePanelTabs";
import { AiChatSideTabTrigger } from "@/modules/jobs/details/components/AiChatSideTabTrigger";
import { AiChatTab } from "@/modules/jobs/details/components/AiChatTab";
import { AiChatTabPanel } from "@/modules/jobs/details/components/AiChatTabPanel";
import { DescriptionTab } from "@/modules/jobs/details/components/DescriptionTab";
import { HistoryTabPanel } from "@/modules/jobs/details/components/HistoryPanel";
import { HistorySideTabTrigger } from "@/modules/jobs/details/components/HistorySideTabTrigger";
import { HistoryTab } from "@/modules/jobs/details/components/HistoryTab";
import { MatchTab } from "@/modules/jobs/details/components/MatchTab";
import { NotesTabPanel } from "@/modules/jobs/details/components/NotesPanel";
import { NotesSideTabTrigger } from "@/modules/jobs/details/components/NotesSideTabTrigger";
import { NotesTab } from "@/modules/jobs/details/components/NotesTab";
import { OverviewTab } from "@/modules/jobs/details/components/OverviewTab";
import { SourceTab } from "@/modules/jobs/details/components/SourceTab";
import { JobFillStatusProvider } from "@/modules/jobs/details/hooks/JobFillStatusProvider";
import { JobDetailsProvider } from "@/modules/jobs/details/hooks/JobDetailsProvider";
import { useJobDetails } from "@/modules/jobs/details/hooks/useJobDetails";
import { JobMatchStatusProvider } from "@/modules/jobs/details/hooks/JobMatchStatusProvider";
import { useJobDetailsRouteState } from "@/modules/jobs/details/hooks/useJobDetailsRouteState";
import { useJobPageTitle } from "@/modules/jobs/details/hooks/useJobPageTitle";
import { useWelcomeTour } from "@/modules/welcome-tour/useWelcomeTour";
import { WelcomeTourStatusHistory } from "@/modules/welcome-tour/WelcomeTourStatusHistory";
import { JobDetailsSubTabs } from "@/modules/jobs/details/job-details-header.slots";
import { JobDetailsView } from "@/modules/jobs/details/page/JobDetailsView";
import type { UpdateStatusDialogHandle } from "@/modules/jobs/details/components/UpdateStatusDialog";
import type { UpdateStatusDialogRestrictedTarget } from "@/modules/jobs/details/components/update-status-dialog-inert";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";
import { useJobDataSource } from "@/modules/jobs/shared/hooks/useJobDataSource";
import { useRouter } from "next/navigation";

interface JobDetailsLayoutProps {
  params: Promise<{ id: string }>;
  children: ReactNode;
}

type JobDetailsTabBarProps = { children: ReactNode; className?: string };

function JobDetailsTabBar({ children, className }: JobDetailsTabBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {children}
      <JobDetailsSubTabs.Slot className={cn("empty:hidden")} />
    </div>
  );
}

type JobDetailsFullWidthTabLayoutProps = { activeTab: string; tabBar: ReactNode; children: ReactNode };

function JobDetailsFullWidthTabLayout({ activeTab, tabBar, children }: JobDetailsFullWidthTabLayoutProps) {
  return (
    <Tabs value={activeTab} className={cn("flex size-full min-h-0 flex-col")}>
      <JobDetailsTabBar>{tabBar}</JobDetailsTabBar>
      <div className={cn("mt-3 flex flex-1 min-h-0 flex-col")}>{children}</div>
    </Tabs>
  );
}

type JobDetailsSplitTabLayoutProps = {
  activeTab: string;
  tabBar: ReactNode;
  sidePanel: ReactNode;
  children: ReactNode;
};

function JobDetailsSplitTabLayout({ activeTab, tabBar, sidePanel, children }: JobDetailsSplitTabLayoutProps) {
  return (
    <div className={cn("grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]")}>
      <Tabs value={activeTab} className={cn("flex size-full min-h-0 flex-col")}>
        <JobDetailsTabBar>{tabBar}</JobDetailsTabBar>
        <div className={cn("mt-3 flex flex-1 min-h-0 flex-col")}>{children}</div>
      </Tabs>
      <div className={cn("min-h-0 overflow-hidden border-l border-border-subtle pl-4")}>{sidePanel}</div>
    </div>
  );
}

type JobDetailsMainContentProps = {
  job: JobDetailsValues | undefined;
  status: EntityDetailViewStatus;
  activeTab: string;
  sidePanelFromQuery: string | null;
  fullWidth: boolean;
  isDesktop: boolean;
  onSidePanelChange: (sidePanel: string) => void;
  children: ReactNode;
};

function JobDetailsMainContent({
  job,
  status,
  activeTab,
  sidePanelFromQuery,
  fullWidth,
  isDesktop,
  onSidePanelChange,
  children,
}: JobDetailsMainContentProps) {
  if (status === "loading")
    return (
      <Text size="sm" color="secondary">
        Loading job...
      </Text>
    );

  if (status === "notFound") return <EntityNotFound resource="job" backHref="/jobs" backLabel="Back to jobs" />;

  if (status === "error")
    return (
      <Text size="sm" color="error">
        Failed to load job details.
      </Text>
    );

  if (!job) return null;

  const showSourceContent = Boolean(job.htmlContent);

  if (!isDesktop || fullWidth) {
    return (
      <JobDetailsFullWidthTabLayout
        activeTab={activeTab}
        tabBar={
          <TabsList className={cn("w-fit max-w-full shrink-0 self-start flex-wrap")}>
            <OverviewTab jobId={job.id} />
            <DescriptionTab jobId={job.id} />
            {showSourceContent ? <SourceTab jobId={job.id} /> : null}
            <MatchTab jobId={job.id} />
            <NotesTab jobId={job.id} fullWidth={fullWidth} />
            <HistoryTab jobId={job.id} fullWidth={fullWidth} />
            <AiChatTab jobId={job.id} fullWidth={fullWidth} />
          </TabsList>
        }
      >
        {children}
      </JobDetailsFullWidthTabLayout>
    );
  }

  return (
    <JobDetailsSplitTabLayout
      activeTab={activeTab}
      tabBar={
        <TabsList className={cn("w-fit self-start")}>
          <OverviewTab jobId={job.id} sidePanel={sidePanelFromQuery} />
          <DescriptionTab jobId={job.id} sidePanel={sidePanelFromQuery} />
          {showSourceContent ? <SourceTab jobId={job.id} sidePanel={sidePanelFromQuery} /> : null}
          <MatchTab jobId={job.id} sidePanel={sidePanelFromQuery} />
        </TabsList>
      }
      sidePanel={
        <ActivitySidePanelTabs
          sidePanel={sidePanelFromQuery ?? "notes"}
          onSidePanelChange={onSidePanelChange}
          tabs={{
            notes: {
              trigger: <NotesSideTabTrigger jobId={job.id} />,
              content: <NotesTabPanel jobId={job.id} className={cn("mt-3")} />,
            },
            history: {
              trigger: <HistorySideTabTrigger />,
              content: <HistoryTabPanel jobId={job.id} className={cn("mt-3")} />,
            },
            chat: {
              trigger: <AiChatSideTabTrigger />,
              content: <AiChatTabPanel jobId={job.id} className={cn("mt-3")} />,
            },
          }}
        />
      }
    >
      {children}
    </JobDetailsSplitTabLayout>
  );
}

export default function JobDetailsLayout({ params, children }: JobDetailsLayoutProps) {
  const { id } = use(params);
  const isLocalJob = useJobDataSource() === "local";
  const router = useRouter();
  const isDesktop = useBreakpoint("(min-width: 1024px)");
  const viewModel = useJobDetails(id);

  const { activeTab, sidePanelFromQuery, fullWidth, toggleFullWidth, setSidePanel, needsRedirect } =
    useJobDetailsRouteState(id, isDesktop);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStatusStage, setSelectedStatusStage] = useState<ApplicationStage | undefined>(undefined);
  const [statusDialogRestrictInteractionTo, setStatusDialogRestrictInteractionTo] = useState<
    UpdateStatusDialogRestrictedTarget | undefined
  >(undefined);
  const [statusDialogFreezeSuccessToast, setStatusDialogFreezeSuccessToast] = useState(false);
  const [statusDialogScheduledEnabled, setStatusDialogScheduledEnabled] = useState(false);
  const [statusDialogQuickScheduleOption, setStatusDialogQuickScheduleOption] = useState<string>();
  const [statusDialogSaveCount, setStatusDialogSaveCount] = useState(0);
  const statusDialogRef = useRef<UpdateStatusDialogHandle>(null);
  const [statusDialogElement, setStatusDialogElement] = useState<HTMLDivElement | null>(null);
  const { activePhase } = useWelcomeTour();
  const updateStatusDialogDismissible = activePhase === null;

  useJobPageTitle(viewModel.job, activeTab);

  if (needsRedirect) return null;

  return (
    <SlotsProvider>
      <JobFillStatusProvider jobId={id} enabled={!isLocalJob}>
        <JobMatchStatusProvider jobId={id} enabled={!isLocalJob}>
          <JobDetailsProvider
            job={viewModel.job}
            sourcePrimaryText={viewModel.sourcePrimaryText}
            openStatusDialog={() => setStatusDialogOpen(true)}
            closeStatusDialog={() => setStatusDialogOpen(false)}
            selectedStatusStage={selectedStatusStage}
            onSelectedStatusStageChange={setSelectedStatusStage}
            requestStatusDialogSave={() => statusDialogRef.current?.save()}
            statusDialogRestrictInteractionTo={statusDialogRestrictInteractionTo}
            onStatusDialogRestrictInteractionToChange={setStatusDialogRestrictInteractionTo}
            requestStatusDialogFocusField={(field) => statusDialogRef.current?.focusField(field)}
            statusDialogElement={statusDialogElement}
            statusDialogFreezeSuccessToast={statusDialogFreezeSuccessToast}
            onStatusDialogFreezeSuccessToastChange={setStatusDialogFreezeSuccessToast}
            requestStatusDialogCloseToast={() => statusDialogRef.current?.closeToast()}
            statusDialogScheduledEnabled={statusDialogScheduledEnabled}
            statusDialogQuickScheduleOption={statusDialogQuickScheduleOption}
            statusDialogSaveCount={statusDialogSaveCount}
          >
            <JobDetailsView
              id={id}
              job={viewModel.job}
              status={viewModel.status}
              currentStage={viewModel.currentStage}
              currentStageReason={viewModel.currentStageReason}
              displayTitle={viewModel.displayTitle}
              mainContent={
                <JobDetailsMainContent
                  job={viewModel.job}
                  status={viewModel.status}
                  activeTab={activeTab}
                  sidePanelFromQuery={sidePanelFromQuery}
                  fullWidth={fullWidth}
                  isDesktop={isDesktop}
                  onSidePanelChange={setSidePanel}
                >
                  {children}
                </JobDetailsMainContent>
              }
              readOnly={isLocalJob}
              fillAutomatically={{ state: viewModel.fillButtonState, trigger: viewModel.triggerFillAutomatically }}
              layout={{ isDesktop, fullWidth, onToggleFullWidth: toggleFullWidth }}
              statusDialog={{
                open: statusDialogOpen,
                onOpenChange: setStatusDialogOpen,
                selectedStage: selectedStatusStage,
                onSelectedStageChange: setSelectedStatusStage,
                dismissible: updateStatusDialogDismissible,
                restrictInteractionTo: statusDialogRestrictInteractionTo,
                freezeSuccessToast: statusDialogFreezeSuccessToast,
                scheduledEnabled: statusDialogScheduledEnabled,
                onScheduledEnabledChange: setStatusDialogScheduledEnabled,
                onQuickScheduleOptionSelect: setStatusDialogQuickScheduleOption,
                onSaved: () => setStatusDialogSaveCount((count) => count + 1),
                ref: statusDialogRef,
                onContentElementChange: setStatusDialogElement,
              }}
              deleteDialog={{
                open: deleteDialogOpen,
                onOpenChange: setDeleteDialogOpen,
                onDeleted: () => router.push("/jobs"),
              }}
            >
              {children}
            </JobDetailsView>
            <WelcomeTourStatusHistory
              onOpenStatusHistory={() => setSidePanel("history")}
              onReturnToJobs={() => router.push("/jobs")}
            />
          </JobDetailsProvider>
        </JobMatchStatusProvider>
      </JobFillStatusProvider>
    </SlotsProvider>
  );
}
