"use client";

import { cn, Heading } from "@job-tracker/ui";
import type { ReactNode } from "react";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header/DetailPageHeader";
import type { ApplicationStage } from "@/gql/hooks";
import type { EntityDetailViewStatus } from "@/lib/entity-detail-view-status";
import { JobActionsMenu } from "@/modules/jobs/details/components/JobActionsMenu";
import { UpdateStatusDialog } from "@/modules/jobs/details/components/UpdateStatusDialog";
import { JobHeaderActions } from "@/modules/jobs/details/job-details-header.slots";
import { jobDetailDisplayTitle } from "@/modules/jobs/details/utils/job-detail-title";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";
import { DeleteJobDialog } from "@/modules/jobs/list/components/DeleteJobDialog";
import { StatusBadge } from "@/modules/jobs/shared/components/StatusBadge";

export interface JobDetailsViewProps {
  id: string;
  job: JobDetailsValues | undefined;
  status: EntityDetailViewStatus;
  currentStage: ApplicationStage;
  currentStageReason: string | null;
  displayTitle: string | null;
  fillButtonState: "default" | "loading";
  triggerFillAutomatically: () => Promise<{ error: Error | null }>;
  mainContent: ReactNode;
  readOnly?: boolean;
  isDesktop: boolean;
  fullWidth: boolean;
  toggleFullWidth: () => void;
  actionsOpen: boolean;
  onActionsOpenChange: (open: boolean) => void;
  deleteDialogOpen: boolean;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onDeleted: () => void;
  children: ReactNode;
}

/**
 * Renders the shared job-details page chrome from already resolved data and content.
 */
export function JobDetailsView(props: JobDetailsViewProps) {
  const {
    job,
    currentStage,
    currentStageReason,
    displayTitle,
    fillButtonState,
    triggerFillAutomatically,
    mainContent,
    readOnly = false,
    isDesktop,
    fullWidth,
    toggleFullWidth,
    actionsOpen,
    onActionsOpenChange,
    deleteDialogOpen,
    onDeleteDialogOpenChange,
    onDeleted,
  } = props;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <DetailPageHeader
        trailing={
          job ? (
            <>
              <JobActionsMenu
                job={job}
                fillButtonState={fillButtonState}
                triggerFillAutomatically={triggerFillAutomatically}
                onUpdateStatus={() => onActionsOpenChange(true)}
                onDelete={() => onDeleteDialogOpenChange(true)}
                fullWidth={fullWidth}
                onToggleFullWidth={isDesktop ? toggleFullWidth : undefined}
                readOnly={readOnly}
              />
              <JobHeaderActions.Slot className={cn("flex shrink-0 items-center gap-2 empty:hidden")} />
            </>
          ) : undefined
        }
        trailingOffsetClassName="pr-36 sm:pr-64"
      >
        <div className={cn("flex items-center gap-3")}>
          <BackToLink href="/jobs">Back to jobs</BackToLink>
        </div>
        <div className={cn("flex items-center gap-3")}>
          <Heading
            as="h1"
            size="2xl"
            className={cn("min-w-0")}
            data-welcome-tour-step={readOnly ? "job-detail-title" : undefined}
          >
            <span>{displayTitle !== null ? displayTitle : "Job details"}</span>
          </Heading>
          {job ? (
            <StatusBadge
              stage={currentStage}
              reason={currentStageReason}
              className={cn("align-middle whitespace-nowrap")}
            />
          ) : null}
        </div>
        {job && !readOnly ? (
          <>
            <UpdateStatusDialog
              jobId={job.id}
              currentStage={currentStage}
              open={actionsOpen}
              onOpenChange={onActionsOpenChange}
            />
            <DeleteJobDialog
              trigger={<span aria-hidden style={{ display: "none" }} />}
              jobId={job.id}
              jobTitle={jobDetailDisplayTitle(job.title)}
              open={deleteDialogOpen}
              onOpenChange={onDeleteDialogOpenChange}
              onDeleted={onDeleted}
            />
          </>
        ) : null}
      </DetailPageHeader>
      <div className={cn("flex-1 min-h-0 overflow-hidden p-4 sm:p-6")}>{mainContent}</div>
    </div>
  );
}
