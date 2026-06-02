"use client";

import { SlotsProvider } from "@job-tracker/react-slots";
import { cn, Heading, Tabs, TabsList, Text } from "@job-tracker/ui";
import { use, useState } from "react";
import type { ReactNode } from "react";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header/DetailPageHeader";
import { EntityNotFound } from "@/components/entity-not-found";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { ActivitySidePanelTabs } from "@/modules/jobs/details/components/ActivitySidePanelTabs";
import { ChatTabPanel } from "@/modules/jobs/details/components/ChatTabPanel";
import { AiChatSideTabTrigger } from "@/modules/jobs/details/components/AiChatSideTabTrigger";
import { HistoryTabPanel } from "@/modules/jobs/details/components/HistoryPanel";
import { HistorySideTabTrigger } from "@/modules/jobs/details/components/HistorySideTabTrigger";
import { JobActionsMenu } from "@/modules/jobs/details/components/JobActionsMenu";
import { NotesTabPanel } from "@/modules/jobs/details/components/NotesPanel";
import { NotesSideTabTrigger } from "@/modules/jobs/details/components/NotesSideTabTrigger";
import { AiChatTab } from "@/modules/jobs/details/components/AiChatTab";
import { DescriptionTab } from "@/modules/jobs/details/components/DescriptionTab";
import { HistoryTab } from "@/modules/jobs/details/components/HistoryTab";
import { MatchTab } from "@/modules/jobs/details/components/MatchTab";
import { NotesTab } from "@/modules/jobs/details/components/NotesTab";
import { OverviewTab } from "@/modules/jobs/details/components/OverviewTab";
import { SourceTab } from "@/modules/jobs/details/components/SourceTab";
import { UpdateStatusDialog } from "@/modules/jobs/details/components/UpdateStatusDialog";
import { JobFillStatusProvider } from "@/modules/jobs/details/hooks/JobFillStatusProvider";
import { JobMatchStatusProvider } from "@/modules/jobs/details/hooks/JobMatchStatusProvider";
import { useJobDetailsRouteState } from "@/modules/jobs/details/hooks/useJobDetailsRouteState";

import { useJobDetailsViewModel } from "@/modules/jobs/details/hooks/useJobDetailsViewModel";
import { useJobPageTitle } from "@/modules/jobs/details/hooks/useJobPageTitle";
import { JobDetailsSubTabs, JobHeaderActions } from "@/modules/jobs/details/job-details-header.slots";
import { jobDetailDisplayTitle } from "@/modules/jobs/details/utils/job-detail-title";

import { DeleteJobDialog } from "@/modules/jobs/list/components/DeleteJobDialog";
import { StatusBadge } from "@/modules/jobs/shared/components/StatusBadge";

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

export default function JobDetailsLayout({ params, children }: JobDetailsLayoutProps) {
  const { id } = use(params);
  const isDesktop = useBreakpoint("(min-width: 1024px)");

  const { activeTab, sidePanelFromQuery, fullWidth, toggleFullWidth, setSidePanel, needsRedirect } =
    useJobDetailsRouteState(id, isDesktop);

  const [actionsOpen, setActionsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { job, currentStage, currentStageReason, status, displayTitle, fillButtonState, triggerFillAutomatically } =
    useJobDetailsViewModel(id);

  useJobPageTitle(job, activeTab);

  const showSourceContent = Boolean(job?.htmlContent);

  if (needsRedirect) return null;


  return (
    <SlotsProvider>
      <JobFillStatusProvider jobId={id}>
        <JobMatchStatusProvider jobId={id}>
          <div className={cn("flex h-full min-h-0 flex-col")}>
            <DetailPageHeader
              trailing={
                job ? (
                  <>
                    <JobActionsMenu
                      job={job}
                      fillButtonState={fillButtonState}
                      triggerFillAutomatically={triggerFillAutomatically}
                      onUpdateStatus={() => setActionsOpen(true)}
                      onDelete={() => setDeleteDialogOpen(true)}
                      fullWidth={fullWidth}
                      onToggleFullWidth={isDesktop ? toggleFullWidth : undefined}
                    />
                    <JobHeaderActions.Slot className={cn("flex shrink-0 items-center gap-2 empty:hidden")} />
                  </>
                ) : undefined
              }
              reserveClassName="pr-36 sm:pr-64"
            >
              <div className={cn("flex items-center gap-3")}>
                <BackToLink href="/jobs">Back to jobs</BackToLink>
              </div>
              <div className={cn("flex items-center gap-3")}>
                <Heading as="h1" size="2xl" className={cn("min-w-0")}>
                  <span>{displayTitle !== null ? displayTitle : "Job details"}</span>{" "}
                </Heading>
                {job ? (
                  <StatusBadge
                    stage={currentStage}
                    reason={currentStageReason}
                    className={cn("align-middle whitespace-nowrap")}
                  />
                ) : null}
              </div>
              {job ? (
                <>
                  <UpdateStatusDialog
                    jobId={job.id}
                    currentStage={currentStage}
                    open={actionsOpen}
                    onOpenChange={setActionsOpen}
                  />
                  <DeleteJobDialog
                    trigger={<span aria-hidden style={{ display: "none" }} />}
                    jobId={job.id}
                    jobTitle={jobDetailDisplayTitle(job.title)}
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  />
                </>
              ) : null}
            </DetailPageHeader>

            <div className={cn("flex-1 min-h-0 overflow-hidden p-4 sm:p-6")}>
              {status === "loading" ? (
                <Text size="sm" color="secondary">
                  Loading job...
                </Text>
              ) : status === "notFound" ? (
                <EntityNotFound resource="job" backHref="/jobs" backLabel="Back to jobs" />
              ) : status === "error" ? (
                <Text size="sm" color="error">
                  Failed to load job details.
                </Text>
              ) : !job ? null : !isDesktop || fullWidth ? (
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
              ) : (
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
                      onSidePanelChange={setSidePanel}
                      tabs={{
                        notes: {
                          trigger: <NotesSideTabTrigger jobId={job.id} />,
                          content: <NotesTabPanel jobId={job.id} className={cn("pt-3")} />,
                        },
                        history: {
                          trigger: <HistorySideTabTrigger />,
                          content: <HistoryTabPanel jobId={job.id} className={cn("pt-3")} />,
                        },
                        chat: {
                          trigger: <AiChatSideTabTrigger />,
                          content: <ChatTabPanel jobId={job.id} className={cn("pt-3")} />,
                        },
                      }}
                    />
                  }
                >
                  {children}
                </JobDetailsSplitTabLayout>
              )}
            </div>
          </div>
        </JobMatchStatusProvider>
      </JobFillStatusProvider>
    </SlotsProvider>
  );
}
