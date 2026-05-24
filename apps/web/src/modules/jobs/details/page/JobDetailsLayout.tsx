"use client";

import { SlotsProvider } from "@job-tracker/react-slots";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Heading,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
} from "@job-tracker/ui";
import { CaretDownIcon, SparkleIcon } from "@phosphor-icons/react";
import NextLink from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

import { BackToLink } from "@/components/back-to-link";
import { EntityNotFound } from "@/components/entity-not-found";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { ActivitySidePanel } from "@/modules/jobs/details/components/ActivitySidePanel";
import { MatchTabTrigger } from "@/modules/jobs/details/components/MatchTabTrigger";
import { UpdateStatusAction } from "@/modules/jobs/details/components/UpdateStatusAction";
import { JobMatchStatusProvider } from "@/modules/jobs/details/hooks/JobMatchStatusProvider";
import { useJobAutoFillFromQuery } from "@/modules/jobs/details/hooks/useJobAutoFillFromQuery";
import {
  useJobDetailsMainTab,
  useJobDetailsTab,
  useJobSidePanel,
} from "@/modules/jobs/details/hooks/useJobDetailsRoute";
import { useJobDetailsViewModel } from "@/modules/jobs/details/hooks/useJobDetailsViewModel";
import {
  JobActionsMenuItems,
  JobDetailsSubTabs,
  JobHeaderActions,
} from "@/modules/jobs/details/job-details-header.slots";
import { jobDetailDisplayTitle } from "@/modules/jobs/details/utils/job-detail-title";
import {
  isJobDetailsSidePanelTab,
  jobDetailsHref,
  type JobDetailsMainTab,
  jobDetailsPath,
  type JobDetailsTab,
  type JobSidePanel,
} from "@/modules/jobs/details/utils/job-details-routes";
import { DeleteJobDialog } from "@/modules/jobs/list/components/DeleteJobDialog";
import { StatusBadge } from "@/modules/jobs/shared/components/StatusBadge";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

interface JobDetailsLayoutProps {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

function DesktopMainTabTrigger({
  jobId,
  tab,
  label,
  sidePanel,
}: {
  jobId: string;
  tab: JobDetailsMainTab;
  label: string;
  sidePanel: JobSidePanel | null;
}) {
  return (
    <TabsTrigger value={tab} asChild>
      <NextLink href={jobDetailsHref(jobId, tab, sidePanel ?? undefined)}>
        {label}
      </NextLink>
    </TabsTrigger>
  );
}

function MobileTabTrigger({
  jobId,
  tab,
  label,
}: {
  jobId: string;
  tab: JobDetailsTab;
  label: string;
}) {
  return (
    <TabsTrigger value={tab} asChild>
      <NextLink href={jobDetailsPath(jobId, tab)}>{label}</NextLink>
    </TabsTrigger>
  );
}

function JobDetailsTabList({
  jobId,
  showSourceContent,
  className,
}: {
  jobId: string;
  showSourceContent: boolean;
  className?: string;
}) {
  return (
    <TabsList className={cn("w-fit max-w-full shrink-0 self-start", className)}>
      <MobileTabTrigger jobId={jobId} tab="overview" label="Overview" />
      <MobileTabTrigger jobId={jobId} tab="description" label="Description" />
      {showSourceContent ? (
        <MobileTabTrigger jobId={jobId} tab="source" label="Source content" />
      ) : null}
      <MatchTabTrigger tab="match" href={jobDetailsPath(jobId, "match")} />
      <MobileTabTrigger jobId={jobId} tab="notes" label="Notes" />
      <MobileTabTrigger jobId={jobId} tab="history" label="History" />
    </TabsList>
  );
}

function JobDetailsTabBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}
    >
      {children}
      <JobDetailsSubTabs.Slot className={cn("empty:hidden")} />
    </div>
  );
}

function JobDetailsFullWidthTabLayout({
  jobId,
  showSourceContent,
  activeTab,
  children,
}: {
  jobId: string;
  showSourceContent: boolean;
  activeTab: JobDetailsTab;
  children: React.ReactNode;
}) {
  return (
    <Tabs value={activeTab} className={cn("flex size-full min-h-0 flex-col")}>
      <JobDetailsTabBar>
        <JobDetailsTabList
          jobId={jobId}
          showSourceContent={showSourceContent}
          className={cn("flex-wrap")}
        />
      </JobDetailsTabBar>

      <div className={cn("mt-3 flex flex-1 min-h-0 flex-col")}>{children}</div>
    </Tabs>
  );
}

function JobDetailsSplitTabLayout({
  jobId,
  showSourceContent,
  activeTab,
  sidePanel,
  effectiveSidePanel,
  onSidePanelChange,
  onSuccess,
  onError,
  children,
}: {
  jobId: string;
  showSourceContent: boolean;
  activeTab: JobDetailsMainTab;
  sidePanel: JobSidePanel | null;
  effectiveSidePanel: JobSidePanel;
  onSidePanelChange: (sidePanel: JobSidePanel) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]",
      )}
    >
      <Tabs value={activeTab} className={cn("flex size-full min-h-0 flex-col")}>
        <JobDetailsTabBar>
          <TabsList className={cn("w-fit self-start")}>
            <DesktopMainTabTrigger
              jobId={jobId}
              tab="overview"
              label="Overview"
              sidePanel={sidePanel}
            />
            <DesktopMainTabTrigger
              jobId={jobId}
              tab="description"
              label="Description"
              sidePanel={sidePanel}
            />
            {showSourceContent ? (
              <DesktopMainTabTrigger
                jobId={jobId}
                tab="source"
                label="Source content"
                sidePanel={sidePanel}
              />
            ) : null}
            <MatchTabTrigger
              tab="match"
              href={jobDetailsHref(jobId, "match", sidePanel ?? undefined)}
            />
          </TabsList>
        </JobDetailsTabBar>

        <div className={cn("mt-3 flex flex-1 min-h-0 flex-col")}>
          {children}
        </div>
      </Tabs>

      <div
        className={cn(
          "min-h-0 overflow-hidden border-l border-border-subtle pl-4",
        )}
      >
        <ActivitySidePanel
          jobId={jobId}
          sidePanel={effectiveSidePanel}
          onSidePanelChange={onSidePanelChange}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>
    </div>
  );
}

export default function JobDetailsLayout({
  params,
  children,
}: JobDetailsLayoutProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = useJobDetailsTab();
  const mainTab = useJobDetailsMainTab();
  const sidePanelFromQuery = useJobSidePanel();
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { enqueueToast } = useToastQueue();

  const {
    job,
    currentStage,
    currentStageReason,
    status,
    displayTitle,
    fillButtonState,
    triggerFillAutomatically,
  } = useJobDetailsViewModel(id);
  const isDesktop = useBreakpoint("(min-width: 1024px)");

  useEffect(() => {
    if (isDesktop || !sidePanelFromQuery) {
      return;
    }
    router.replace(jobDetailsPath(id, sidePanelFromQuery));
  }, [id, isDesktop, router, sidePanelFromQuery]);

  const showToast = useCallback(
    (message: string, intent: "success" | "error") => {
      enqueueToast({ title: message, intent });
    },
    [enqueueToast],
  );

  const handleEntitySuccess = useCallback(
    (message: string) => showToast(message, "success"),
    [showToast],
  );
  const handleEntityError = useCallback(
    (message: string) => showToast(message, "error"),
    [showToast],
  );

  const handleFillAutomatically = React.useCallback(async () => {
    const { error } = await triggerFillAutomatically();
    if (error) {
      enqueueToast({
        title:
          error instanceof Error
            ? error.message.replace("Bad Request Exception: ", "")
            : "Failed to start automatic fill.",
        intent: "error",
      });
      return;
    }
    enqueueToast({ title: "Automatic fill queued.", intent: "success" });
  }, [enqueueToast, triggerFillAutomatically]);

  useJobAutoFillFromQuery({
    jobReady: Boolean(job) && status === "success",
    onFill: handleFillAutomatically,
  });

  const setSidePanel = useCallback(
    (sidePanel: JobSidePanel) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("s", sidePanel);
      router.replace(`${pathname}?${next.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const effectiveSidePanel = sidePanelFromQuery ?? "notes";

  const showSourceContent = Boolean(job?.htmlContent);
  const isSidePanelRoute = isJobDetailsSidePanelTab(activeTab);

  const actionsMenu = job ? (
    <DropdownMenu
      open={actionsMenuOpen}
      onOpenChange={setActionsMenuOpen}
      trigger={
        <Button
          intent="secondary"
          size="md"
          rightIcon={
            <CaretDownIcon
              size={12}
              weight="bold"
              className={cn(
                "transition-transform duration-200",
                actionsMenuOpen ? "rotate-180" : "rotate-0",
              )}
            />
          }
        >
          Actions
        </Button>
      }
      align="end"
    >
      <JobActionsMenuItems.Slot />
      <DropdownMenuItem
        disabled={fillButtonState === "loading"}
        onSelect={() => void handleFillAutomatically()}
        icon={<SparkleIcon size={14} weight="regular" />}
      >
        Fill automatically
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => setActionsOpen(true)}>
        Update status
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem destructive onSelect={() => setDeleteDialogOpen(true)}>
        Remove
      </DropdownMenuItem>
    </DropdownMenu>
  ) : null;

  return (
    <SlotsProvider>
      <JobMatchStatusProvider jobId={id}>
        <div className={cn("flex h-full min-h-0 flex-col")}>
          <div
            className={cn(
              "relative flex flex-col gap-2 border-b border-border-subtle p-4 sm:px-6 sm:py-5",
            )}
          >
            {job ? (
              <div
                className={cn(
                  "absolute top-4 right-4 z-10 flex shrink-0 flex-wrap items-center justify-end gap-2 sm:top-5 sm:right-6",
                )}
              >
                {actionsMenu}
                <JobHeaderActions.Slot
                  className={cn(
                    "flex shrink-0 items-center gap-2 empty:hidden",
                  )}
                />
              </div>
            ) : null}
            <div className={cn("flex items-center gap-3")}>
              <BackToLink href="/jobs">Back to jobs</BackToLink>
            </div>
            <div
              className={cn(
                "flex items-center gap-3",
                job ? "pr-36 sm:pr-64" : undefined,
              )}
            >
              <Heading as="h1" size="2xl" className={cn("min-w-0")}>
                <span>
                  {displayTitle !== null ? displayTitle : "Job details"}
                </span>{" "}
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
                <UpdateStatusAction
                  jobId={job.id}
                  currentStage={currentStage}
                  open={actionsOpen}
                  onOpenChange={setActionsOpen}
                  onSuccess={handleEntitySuccess}
                  onError={handleEntityError}
                />
                <DeleteJobDialog
                  trigger={<span aria-hidden style={{ display: "none" }} />}
                  jobId={job.id}
                  jobTitle={jobDetailDisplayTitle(job.title)}
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                  onSuccess={() => router.push("/jobs")}
                  onError={(msg) => handleEntityError(msg)}
                />
              </>
            ) : null}
          </div>

          <div className={cn("flex-1 min-h-0 overflow-hidden p-4 sm:p-6")}>
            {status === "loading" ? (
              <Text size="sm" color="secondary">
                Loading job...
              </Text>
            ) : status === "notFound" ? (
              <EntityNotFound
                resource="job"
                backHref="/jobs"
                backLabel="Back to jobs"
              />
            ) : status === "error" ? (
              <Text size="sm" color="error">
                Failed to load job details.
              </Text>
            ) : !job ? null : !isDesktop || isSidePanelRoute ? (
              <JobDetailsFullWidthTabLayout
                jobId={job.id}
                showSourceContent={showSourceContent}
                activeTab={activeTab}
              >
                {children}
              </JobDetailsFullWidthTabLayout>
            ) : (
              <JobDetailsSplitTabLayout
                jobId={job.id}
                showSourceContent={showSourceContent}
                activeTab={mainTab}
                sidePanel={sidePanelFromQuery}
                effectiveSidePanel={effectiveSidePanel}
                onSidePanelChange={setSidePanel}
                onSuccess={handleEntitySuccess}
                onError={handleEntityError}
              >
                {children}
              </JobDetailsSplitTabLayout>
            )}
          </div>
        </div>
      </JobMatchStatusProvider>
    </SlotsProvider>
  );
}
