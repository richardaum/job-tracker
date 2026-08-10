"use client";

import { createContext, useContext } from "react";

import type { ApplicationStage } from "@/gql/hooks";
import type { UpdateStatusDialogRestrictedTarget } from "@/modules/jobs/details/components/update-status-dialog-inert";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";

export interface JobDetailsContextValue {
  job: JobDetailsValues | undefined;
  sourcePrimaryText: string | null;
  openStatusDialog: () => void;
  closeStatusDialog: () => void;
  selectedStatusStage: ApplicationStage | undefined;
  onSelectedStatusStageChange: (stage: ApplicationStage | undefined) => void;
  requestStatusDialogSave: () => void;
  statusDialogRestrictInteractionTo: UpdateStatusDialogRestrictedTarget | undefined;
  onStatusDialogRestrictInteractionToChange: (target: UpdateStatusDialogRestrictedTarget | undefined) => void;
  requestStatusDialogFocusField: (field: UpdateStatusDialogRestrictedTarget) => void;
  statusDialogElement: HTMLDivElement | null;
  statusDialogFreezeSuccessToast: boolean;
  onStatusDialogFreezeSuccessToastChange: (freeze: boolean) => void;
  requestStatusDialogCloseToast: () => void;
  statusDialogScheduledEnabled: boolean;
  statusDialogQuickScheduleOption: string | undefined;
  statusDialogSaveCount: number;
  openStatusHistory: () => void;
}

export const JobDetailsContext = createContext<JobDetailsContextValue | null>(null);

export function useJobDetailsContext(): JobDetailsContextValue {
  const value = useContext(JobDetailsContext);
  if (!value) throw new Error("useJobDetailsContext must be used within JobDetailsProvider");
  return value;
}
