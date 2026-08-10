"use client";

import type { ReactNode } from "react";

import { JobDetailsContext, type JobDetailsContextValue } from "@/modules/jobs/details/hooks/useJobDetailsContext";

type JobDetailsProviderProps = JobDetailsContextValue & { children: ReactNode };

/** Shares layout-resolved job data with detail tab routes. */
export function JobDetailsProvider({
  job,
  sourcePrimaryText,
  openStatusDialog,
  closeStatusDialog,
  selectedStatusStage,
  onSelectedStatusStageChange,
  requestStatusDialogSave,
  statusDialogRestrictInteractionTo,
  onStatusDialogRestrictInteractionToChange,
  requestStatusDialogFocusField,
  statusDialogElement,
  statusDialogFreezeSuccessToast,
  onStatusDialogFreezeSuccessToastChange,
  requestStatusDialogCloseToast,
  statusDialogScheduledEnabled,
  statusDialogQuickScheduleOption,
  statusDialogSaveCount,
  children,
}: JobDetailsProviderProps) {
  return (
    <JobDetailsContext.Provider
      value={{
        job,
        sourcePrimaryText,
        openStatusDialog,
        closeStatusDialog,
        selectedStatusStage,
        onSelectedStatusStageChange,
        requestStatusDialogSave,
        statusDialogRestrictInteractionTo,
        onStatusDialogRestrictInteractionToChange,
        requestStatusDialogFocusField,
        statusDialogElement,
        statusDialogFreezeSuccessToast,
        onStatusDialogFreezeSuccessToastChange,
        requestStatusDialogCloseToast,
        statusDialogScheduledEnabled,
        statusDialogQuickScheduleOption,
        statusDialogSaveCount,
      }}
    >
      {children}
    </JobDetailsContext.Provider>
  );
}
