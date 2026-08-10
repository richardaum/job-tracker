"use client";

import { Button, cn, Heading } from "@job-tracker/ui";
import type { ReactNode } from "react";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header/DetailPageHeader";
import type { ApplicationStage } from "@/gql/hooks";
import type { EntityDetailViewStatus } from "@/lib/entity-detail-view-status";
import { JobActionsMenu } from "@/modules/jobs/details/components/JobActionsMenu";
import {
  UpdateStatusDialog,
  type UpdateStatusDialogHandle,
} from "@/modules/jobs/details/components/UpdateStatusDialog";
import type { UpdateStatusDialogRestrictedTarget } from "@/modules/jobs/details/components/update-status-dialog-inert";
import type { RefObject } from "react";
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
  mainContent: ReactNode;
  readOnly?: boolean;
  children: ReactNode;
  fillAutomatically: { state: "default" | "loading"; trigger: () => Promise<{ error: Error | null }> };
  layout: { isDesktop: boolean; fullWidth: boolean; onToggleFullWidth: () => void };
  statusDialog: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedStage: ApplicationStage | undefined;
    onSelectedStageChange: (stage: ApplicationStage | undefined) => void;
    dismissible: boolean;
    restrictInteractionTo: UpdateStatusDialogRestrictedTarget | undefined;
    freezeSuccessToast: boolean;
    scheduledEnabled: boolean;
    onScheduledEnabledChange: (enabled: boolean) => void;
    onQuickScheduleOptionSelect: (label: string) => void;
    onSaved: () => void;
    ref: RefObject<UpdateStatusDialogHandle | null>;
    onContentElementChange: (element: HTMLDivElement | null) => void;
  };
  deleteDialog: { open: boolean; onOpenChange: (open: boolean) => void; onDeleted: () => void };
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
    mainContent,
    readOnly = false,
    fillAutomatically,
    layout,
    statusDialog,
    deleteDialog,
  } = props;
  const { state: fillButtonState, trigger: triggerFillAutomatically } = fillAutomatically;
  const { isDesktop, fullWidth, onToggleFullWidth: toggleFullWidth } = layout;
  const {
    open: statusDialogOpen,
    onOpenChange: onStatusDialogOpenChange,
    selectedStage: selectedStatusStage,
    onSelectedStageChange: onSelectedStatusStageChange,
    dismissible: updateStatusDialogDismissible,
    restrictInteractionTo: statusDialogRestrictInteractionTo,
    freezeSuccessToast: statusDialogFreezeSuccessToast,
    scheduledEnabled: statusDialogScheduledEnabled,
    onScheduledEnabledChange: onStatusDialogScheduledEnabledChange,
    onQuickScheduleOptionSelect: onStatusDialogQuickScheduleOptionSelect,
    onSaved: onStatusDialogSaved,
    ref: statusDialogRef,
    onContentElementChange: onStatusDialogContentElementChange,
  } = statusDialog;
  const { open: deleteDialogOpen, onOpenChange: onDeleteDialogOpenChange, onDeleted } = deleteDialog;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <DetailPageHeader
        trailing={
          job ? (
            <>
              <Button
                intent="primary"
                size="md"
                onClick={() => onStatusDialogOpenChange(true)}
                data-welcome-tour-step="update-status-button"
              >
                Update Status
              </Button>
              <JobActionsMenu
                job={job}
                fillButtonState={fillButtonState}
                triggerFillAutomatically={triggerFillAutomatically}
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
          <Heading as="h1" size="2xl" className={cn("min-w-0")} data-welcome-tour-step="job-detail-title">
            <span>{displayTitle !== null ? displayTitle : "Job details"}</span>
          </Heading>
          {job ? (
            <span data-welcome-tour-step="job-status">
              <StatusBadge
                stage={currentStage}
                reason={currentStageReason}
                className={cn("align-middle whitespace-nowrap")}
              />
            </span>
          ) : null}
        </div>
        {job ? (
          <UpdateStatusDialog
            jobId={job.id}
            currentStage={currentStage}
            open={statusDialogOpen}
            onOpenChange={onStatusDialogOpenChange}
            dismissible={updateStatusDialogDismissible}
            selectedStage={selectedStatusStage}
            onSelectedStageChange={onSelectedStatusStageChange}
            restrictInteractionTo={statusDialogRestrictInteractionTo}
            freezeSuccessToast={statusDialogFreezeSuccessToast}
            scheduledEnabled={statusDialogScheduledEnabled}
            onScheduledEnabledChange={onStatusDialogScheduledEnabledChange}
            onQuickScheduleOptionSelect={onStatusDialogQuickScheduleOptionSelect}
            onSaved={onStatusDialogSaved}
            ref={statusDialogRef}
            onContentElementChange={onStatusDialogContentElementChange}
          />
        ) : null}
        {job && !readOnly ? (
          <>
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
