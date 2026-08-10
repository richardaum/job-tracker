"use client";

import { ACTIONS, EVENTS } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";

import { JoyrideSegmentedTour } from "@/modules/tour/JoyrideSegmentedTour";
import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";
import type { UpdateStatusDialogRestrictedTarget } from "@/modules/jobs/details/components/update-status-dialog-inert";
import {
  WELCOME_TOUR_LABEL,
  WELCOME_TOUR_FEATURE_FLAG,
  pickWelcomeTourSteps,
  type WelcomeTourStepId,
} from "@/modules/welcome-tour/welcomeTourSteps";
import { useTour } from "@/modules/tour/useTour";

const UPDATE_STATUS_FIELD_TARGET = '[data-welcome-tour-step="update-status-applied"]';
const UPDATE_STATUS_CUSTOM_DATE_TARGET = '[data-welcome-tour-step="update-status-custom-date"]';

type WelcomeTourJobDetailsProps = {
  portalElement?: HTMLElement | null;
  onFieldActionsVisibilityChange: (visible: boolean) => void;
  onDescriptionOpen: () => void;
  onUpdateStatus: () => void;
  onUpdateStatusClose: () => void;
  onUpdateStatusSave: () => void;
  onStatusDialogRestrictInteractionToChange: (field: UpdateStatusDialogRestrictedTarget | undefined) => void;
  onFocusField: (field: UpdateStatusDialogRestrictedTarget) => void;
  onStatusDialogFreezeSuccessToastChange: (freeze: boolean) => void;
  onCloseStatusToast: () => void;
  isStatusApplied?: boolean;
  isScreeningSelected?: boolean;
  isCustomDateEnabled?: boolean;
};

export function WelcomeTourJobDetails({
  portalElement,
  onFieldActionsVisibilityChange,
  onDescriptionOpen,
  onUpdateStatus,
  onUpdateStatusClose,
  onUpdateStatusSave,
  onStatusDialogRestrictInteractionToChange,
  onFocusField,
  onStatusDialogFreezeSuccessToastChange,
  onCloseStatusToast,
  isStatusApplied = false,
  isScreeningSelected = false,
  isCustomDateEnabled = false,
}: WelcomeTourJobDetailsProps) {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);
  const { activeTour } = useTour();

  if (
    welcomeTourEnabled !== true ||
    activeTour?.id !== "welcome-tour" ||
    (activeTour.phase !== "job-details" && activeTour.phase !== "update-status")
  )
    return null;

  const stepIds: WelcomeTourStepId[] =
    activeTour.phase === "update-status"
      ? [
          "update-status-button",
          "update-status-applied",
          "update-status-save",
          "update-status-toast",
          "update-status-reopen",
          "update-status-screening",
          "update-status-custom-date",
          "update-status-interview",
        ]
      : ["job-detail-title", "job-status", "job-company", "job-field-actions", "job-description-tab"];
  const steps = pickWelcomeTourSteps(stepIds, WELCOME_TOUR_LABEL, {
    "job-field-actions": {
      before: async () => onFieldActionsVisibilityChange(true),
      after: () => onFieldActionsVisibilityChange(false),
    },
    "update-status-button": {
      after: ({ action }) => {
        if (action === ACTIONS.NEXT) onUpdateStatus();
      },
    },
    "update-status-applied": {
      disablePrimary: !isStatusApplied,
      before: async () => onStatusDialogRestrictInteractionToChange("status"),
      after: ({ action }) => {
        onStatusDialogRestrictInteractionToChange(undefined);
        if (action === ACTIONS.PREV) onUpdateStatusClose();
      },
    },
    "update-status-save": {
      before: async () => {
        onStatusDialogRestrictInteractionToChange("save");
        onStatusDialogFreezeSuccessToastChange(true);
      },
      after: ({ action }) => {
        onStatusDialogRestrictInteractionToChange(undefined);
        if (action === ACTIONS.NEXT) onUpdateStatusSave();
      },
    },
    "update-status-toast": {
      after: () => {
        onStatusDialogFreezeSuccessToastChange(false);
        onCloseStatusToast();
      },
    },
    "update-status-reopen": {
      after: ({ action }) => {
        if (action === ACTIONS.NEXT) onUpdateStatus();
      },
    },
    "update-status-screening": {
      disablePrimary: !isScreeningSelected,
      before: async () => onStatusDialogRestrictInteractionToChange("status"),
      after: () => onStatusDialogRestrictInteractionToChange(undefined),
    },
    "update-status-custom-date": {
      disablePrimary: !isCustomDateEnabled,
      before: async () => onStatusDialogRestrictInteractionToChange("custom-date"),
      after: () => onStatusDialogRestrictInteractionToChange(undefined),
    },
    "update-status-interview": {
      before: async () => onStatusDialogRestrictInteractionToChange("custom-date"),
      after: () => onStatusDialogRestrictInteractionToChange(undefined),
    },
  });

  return (
    <JoyrideSegmentedTour
      run
      continuous
      steps={steps}
      portalElement={portalElement ?? undefined}
      onSegmentComplete={activeTour.phase === "job-details" ? onDescriptionOpen : undefined}
      onEvent={(event) => {
        if (event.type !== EVENTS.TOOLTIP) return;
        if (event.step.target === UPDATE_STATUS_FIELD_TARGET) {
          onFocusField("status");
        }
        if (event.step.target === UPDATE_STATUS_CUSTOM_DATE_TARGET) {
          onFocusField("custom-date");
        }
      }}
      locale={{ last: "Got it" }}
      options={{
        buttons: ["primary"],
        skipBeacon: true,
        overlayColor: "var(--semantic-color-overlay-backdrop)",
        overlayClickAction: false,
        dismissKeyAction: false,
        spotlightPadding: 8,
        spotlightRadius: 10,
      }}
      floatingOptions={{ hideArrow: true }}
      styles={{
        floater: { pointerEvents: "auto", zIndex: 1000 },
        overlay: { position: portalElement ? "fixed" : "absolute" },
      }}
      tooltipComponent={WelcomeTourTooltip}
    />
  );
}
